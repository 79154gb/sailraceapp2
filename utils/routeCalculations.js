const EARTH_RADIUS = 6371e3; // Earth radius in meters

/**
 * Main entry point.
 * Expects courseDetails of the form:
 *   { boat_starting_position: { latitude, longitude },
 *     course: { waypoints: [{ latitude, longitude }, ...] } }
 * windData is expected to be:
 *   { wind: { speed: <number>, direction: <number>, gusts: <number> } }
 * boatPolars is an array of rows (in your current format).
 *
 * Returns an array of leg objects:
 *   { start, end, mode, chosenTWA, selectedHeading, distance (m),
 *     estimatedTime (sec), tackPenalty (sec), speedUsed (kn) }
 */
function calculateRoute(courseDetails, windData, boatPolars) {
  const startPos = courseDetails.boat_starting_position;
  const waypoints = courseDetails.course.waypoints;
  const legs = [];

  // Retrieve the beat and gybe angles from the polar table (for the current wind speed)
  const {beatAngle, gybeAngle} = extractPolarAngles(
    boatPolars,
    windData.wind.speed,
  );

  let currentPosition = startPos;
  // For each waypoint, calculate a leg route.
  // NOTE: A more advanced algorithm would check whether the boat needs to tack
  // multiple times before reaching the mark (by computing layline intersections)
  // and would split one long upwind leg into several legs.
  for (const mark of waypoints) {
    const leg = calculateLegRoute(
      currentPosition,
      mark,
      windData,
      boatPolars,
      beatAngle,
      gybeAngle,
    );
    legs.push(leg);
    // For this simple implementation, we assume the boat reaches exactly the mark.
    currentPosition = mark;
  }
  return legs;
}

/**
 * Calculates a single leg route from start to end.
 * It computes:
 *   - Direct distance and bearing.
 *   - Relative angle between the boat-to-mark course and the wind.
 *   - Selects a sailing mode based on that relative angle.
 *   - If the boat is forced to beat (i.e. direct course is “into the wind”), it uses the beat angle
 *     from the polars and adds a fixed tack penalty.
 *
 * For simplicity, if the leg is upwind we add a fixed 10‑second tack penalty.
 */
function calculateLegRoute(
  start,
  end,
  windData,
  boatPolars,
  beatAngle,
  gybeAngle,
) {
  // Calculate direct bearing and distance.
  const directBearing = calculateBearing(
    start.latitude,
    start.longitude,
    end.latitude,
    end.longitude,
  );
  const distance = getDistance(start, end);
  const windDir = windData.wind.direction;
  const windSpeed = windData.wind.speed;

  // Determine the relative angle between the direct course and the wind.
  const relativeAngle = Math.abs(angleDiff(directBearing, windDir));

  // Initialize variables for this leg.
  let mode,
    chosenTWA,
    speed,
    tackPenalty = 0,
    estimatedTime,
    selectedHeading;

  // --- Mode selection logic ---
  // Upwind: if the direct course is too close to the wind.
  if (relativeAngle < beatAngle + 5) {
    mode = 'upwind';
    chosenTWA = beatAngle; // use the beat angle from the polars
    speed = getSpeedFromPolarTable(chosenTWA, windSpeed, boatPolars, 'upwind');
    // When beating, the boat must zigzag. The effective distance is increased.
    const effectiveDistance = distance / Math.cos(toRadians(chosenTWA));
    // Add a fixed tack penalty (e.g. 10 seconds per leg).
    tackPenalty = 10;
    estimatedTime = effectiveDistance / (speed * 0.514444) + tackPenalty;
    // Determine possible headings on each tack (port and starboard) and choose the one closer to the direct bearing.
    const portHeading = (windDir + chosenTWA) % 360;
    const starHeading = (windDir - chosenTWA + 360) % 360;
    const diffPort = Math.abs(angleDiff(directBearing, portHeading));
    const diffStarboard = Math.abs(angleDiff(directBearing, starHeading));
    selectedHeading = diffPort < diffStarboard ? portHeading : starHeading;
  }
  // Close reach: when the relative angle is between (beatAngle + 5) and 90°.
  else if (relativeAngle >= beatAngle + 5 && relativeAngle <= 90) {
    mode = 'closeReach';
    chosenTWA = 60; // example value for close reach; you can tune this.
    speed = getSpeedFromPolarTable(
      chosenTWA,
      windSpeed,
      boatPolars,
      'closeReach',
    );
    estimatedTime = distance / (speed * 0.514444);
    selectedHeading = directBearing;
  }
  // Broad reach: when the relative angle is between 90° and (180 - (beatAngle + 5)).
  else if (relativeAngle > 90 && relativeAngle < 180 - (beatAngle + 5)) {
    mode = 'broadReach';
    chosenTWA = 120; // example value for broad reach.
    speed = getSpeedFromPolarTable(
      chosenTWA,
      windSpeed,
      boatPolars,
      'broadReach',
    );
    estimatedTime = distance / (speed * 0.514444);
    selectedHeading = directBearing;
  }
  // Downwind: if the relative angle is too large.
  else {
    mode = 'downwind';
    chosenTWA = 150; // example value for downwind.
    speed = getSpeedFromPolarTable(
      chosenTWA,
      windSpeed,
      boatPolars,
      'downwind',
    );
    // When running downwind, the effective distance is increased.
    const effectiveDistance = distance / Math.cos(toRadians(180 - chosenTWA));
    tackPenalty = 10;
    estimatedTime = effectiveDistance / (speed * 0.514444) + tackPenalty;
    selectedHeading = directBearing;
  }

  return {
    start,
    end,
    mode,
    chosenTWA,
    selectedHeading,
    distance, // in meters
    estimatedTime, // in seconds
    tackPenalty, // seconds added if applicable
    speedUsed: speed, // in knots
  };
}

/**
 * Retrieves the beat and gybe angles from the polar table for the given wind speed.
 * If not found, default values are returned.
 */
function extractPolarAngles(polarTable, tws) {
  const windSpeedRow = polarTable.find(row => row.label === 'Wind Speed');
  const beatAngleRow = polarTable.find(row => row.label === 'Beat Angle');
  const gybeAngleRow = polarTable.find(row => row.label === 'Gybe Angle');
  if (!windSpeedRow || !beatAngleRow || !gybeAngleRow) {
    return {beatAngle: 45, gybeAngle: 135};
  }
  const windIndex = getClosestIndex(tws, windSpeedRow.values);
  let beatAngle = parseFloat(beatAngleRow.values[windIndex]);
  let gybeAngle = parseFloat(gybeAngleRow.values[windIndex]);
  // Ensure minimum values.
  beatAngle = Math.max(beatAngle, 45);
  gybeAngle = Math.max(gybeAngle, 135);
  return {beatAngle, gybeAngle};
}

/**
 * Retrieves the boat's speed from the polar table given a TWA, wind speed, and mode.
 * Modes include: "upwind", "closeReach", "broadReach", "downwind".
 */
function getSpeedFromPolarTable(twa, tws, polarTable, mode) {
  const windSpeedRow = polarTable.find(row => row.label === 'Wind Speed');
  const beatAngleRow = polarTable.find(row => row.label === 'Beat Angle');
  const beatVMGRow = polarTable.find(row => row.label === 'Beat VMG');
  const runVMGRow = polarTable.find(row => row.label === 'Run VMG');
  if (!windSpeedRow || !beatAngleRow || !beatVMGRow || !runVMGRow) {
    return 0;
  }
  const windIndex = getClosestIndex(tws, windSpeedRow.values);
  const currentBeatVMG = parseFloat(beatVMGRow.values[windIndex]);
  const currentRunVMG = parseFloat(runVMGRow.values[windIndex]);
  switch (mode) {
    case 'upwind':
      return currentBeatVMG;
    case 'closeReach':
      return currentRunVMG * 0.9;
    case 'broadReach':
      return currentRunVMG * 1.1;
    case 'downwind':
      return currentRunVMG * 1.2;
    default:
      return currentRunVMG;
  }
}

/**
 * Calculates the initial bearing from (lat1, lon1) to (lat2, lon2).
 */
function calculateBearing(lat1, lon1, lat2, lon2) {
  const φ1 = toRadians(lat1),
    φ2 = toRadians(lat2);
  const Δλ = toRadians(lon2 - lon1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  let θ = Math.atan2(y, x);
  θ = toDegrees(θ);
  return (θ + 360) % 360;
}

/**
 * Returns the great-circle distance (in meters) between pos1 and pos2.
 * Each position should be an object with latitude and longitude.
 */
function getDistance(pos1, pos2) {
  const φ1 = toRadians(pos1.latitude),
    φ2 = toRadians(pos2.latitude);
  const Δφ = toRadians(pos2.latitude - pos1.latitude);
  const Δλ = toRadians(pos2.longitude - pos1.longitude);
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}

/**
 * Returns the smallest difference (in degrees) between two angles.
 */
function angleDiff(a, b) {
  let diff = ((a - b + 180) % 360) - 180;
  return diff < -180 ? diff + 360 : diff;
}

/**
 * Converts degrees to radians.
 */
function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Converts radians to degrees.
 */
function toDegrees(rad) {
  return (rad * 180) / Math.PI;
}

/**
 * Finds the index of the value in array that is closest to the given value.
 */
function getClosestIndex(value, array) {
  let closestIndex = 0;
  let minDiff = Infinity;
  for (let i = 0; i < array.length; i++) {
    const diff = Math.abs(value - parseFloat(array[i]));
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = i;
    }
  }
  return closestIndex;
}

module.exports = {
  calculateRoute,
  calculateBearing,
  toRadians,
  toDegrees,
};
