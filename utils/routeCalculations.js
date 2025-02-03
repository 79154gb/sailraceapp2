const EARTH_RADIUS = 6371e3; // Earth radius in meters

/**
 * Calculates the sailing route based on course details, wind data, and polar table.
 *
 * @param {Object} courseDetails - Contains starting position and waypoints.
 * @param {Object} windData - Contains wind direction and speed.
 * @param {Array} polarTable - The boat's polar performance table.
 * @returns {Array} - Full route with detailed steps.
 */
function calculateRoute(courseDetails, windData, polarTable) {
  const startPosition = courseDetails.boat_starting_position;
  const waypoints = courseDetails.course.waypoints;

  const fullRoute = [];
  let currentPosition = {...startPosition};

  const legSummaries = [];
  const timeIntervalMinutes = 1; // Reduced from 10 to 1 minute for smaller steps
  const logFrequency = 50;

  const {beatAngle, gybeAngle} = extractPolarAngles(
    polarTable,
    windData.wind.speed,
  );

  console.log(`Beat Angle: ${beatAngle}°, Gybe Angle: ${gybeAngle}°`);

  // Define candidate TWAs with standard angles
  const candidateTWAs = [
    // Upwind
    {mode: 'upwind', side: 'starboard', twa: 40},
    {mode: 'upwind', side: 'port', twa: 40},

    // Close Reach
    {mode: 'closeReach', side: 'starboard', twa: 60},
    {mode: 'closeReach', side: 'port', twa: 60},

    // Beam Reach
    {mode: 'beamReach', side: 'starboard', twa: 90},
    {mode: 'beamReach', side: 'port', twa: 90},

    // Broad Reach
    {mode: 'broadReach', side: 'starboard', twa: 120},
    {mode: 'broadReach', side: 'port', twa: 120},

    // Downwind
    {mode: 'downwind', side: 'starboard', twa: 150},
    {mode: 'downwind', side: 'port', twa: 150},
  ];

  const maxTacksPerLeg = 10;
  const maxGybesPerLeg = 10;

  for (let i = 0; i < waypoints.length; i++) {
    const mark = waypoints[i];
    console.log(`Navigating to Waypoint ${i + 1}: ${JSON.stringify(mark)}`);

    let legSteps = [];
    let totalTacks = 0;
    let totalGybes = 0;
    let attempts = 0;
    const maxAttempts = 1000;

    let distanceToMark = getDistance(currentPosition, mark);

    while (distanceToMark > 5 && attempts < maxAttempts) {
      attempts++;

      // Pre-move distance check
      if (distanceToMark <= 5) {
        console.log(
          `Mark ${
            i + 1
          } reached at position (${currentPosition.latitude.toFixed(
            5,
          )}, ${currentPosition.longitude.toFixed(5)})`,
        );
        break; // Mark reached, exit the loop
      }

      const bearing = calculateBearing(
        currentPosition.latitude,
        currentPosition.longitude,
        mark.latitude,
        mark.longitude,
      );

      // Handle cases where bearing might not be meaningful
      if (isNaN(bearing)) {
        console.error('Bearing is undefined or NaN, breaking out of loop.');
        break;
      }

      const windDir = windData.wind.direction;
      const tws = windData.wind.speed;

      // Calculate relative bearing as bearing - windDir
      const relativeBearing = angleDiff(bearing, windDir);

      // Select the candidate TWA with the maximum distance reduction
      let bestOption = candidateTWAs.reduce((prev, curr) => {
        const prevSpeed = getSpeedFromPolarTable(
          prev.twa,
          tws,
          polarTable,
          prev.mode,
        );
        const currSpeed = getSpeedFromPolarTable(
          curr.twa,
          tws,
          polarTable,
          curr.mode,
        );

        const prevReduction = calculateDistanceReduction(
          prev.twa,
          windDir,
          bearing,
          prevSpeed,
        );
        const currReduction = calculateDistanceReduction(
          curr.twa,
          windDir,
          bearing,
          currSpeed,
        );

        return currReduction > prevReduction ? curr : prev;
      }, candidateTWAs[0]);

      // Ensure TWA is within 0° to 180°
      if (bestOption.twa < 0 || bestOption.twa > 180) {
        console.warn(
          `Selected TWA ${bestOption.twa}° is out of bounds. Skipping this option.`,
        );
        continue;
      }

      const heading =
        bestOption.side === 'starboard'
          ? (windDir - bestOption.twa + 360) % 360
          : (windDir + bestOption.twa) % 360;

      const speed = getSpeedFromPolarTable(
        bestOption.twa,
        tws,
        polarTable,
        bestOption.mode, // Pass mode for speed adjustments
      );

      // If speed is zero or negative, skip this option
      if (speed <= 0) {
        console.warn(
          `Speed ${speed}kn is invalid for mode ${bestOption.mode}. Skipping this option.`,
        );
        continue;
      }

      // Calculate step size
      let distanceStep = speed * 0.514444 * 60 * timeIntervalMinutes; // knots to meters

      // Calculate the actual distance remaining
      const actualDistanceToMark = getDistance(currentPosition, mark);

      // Prevent overshooting the mark
      if (distanceStep > actualDistanceToMark) {
        distanceStep = actualDistanceToMark;
      }

      // Hypothetical next position
      const testPosition = moveAlongBearing(
        currentPosition,
        heading,
        distanceStep,
      );

      const testDistance = getDistance(testPosition, mark);

      // Calculate distance reduction component
      const distanceReductionComponent = calculateDistanceReduction(
        bestOption.twa,
        windDir,
        bearing,
        speed,
      );

      // Select the best option that maximizes distance reduction
      if (distanceReductionComponent > 0) {
        bestOption = {
          ...bestOption,
          heading,
          speed,
          nextPosition: testPosition,
          distanceReductionComponent,
        };
      } else {
        // If no improvement, consider alternative options or break
        console.warn(
          'No improvement in distance. Breaking out to prevent infinite loop.',
        );
        break;
      }

      // Determine if we tacked or gybed based on mode and side changes
      let action = 'Sail';
      let tack = undefined;
      let gybe = undefined;

      if (legSteps.length > 0) {
        const lastStep = legSteps[legSteps.length - 1];
        const lastMode = lastStep.tack
          ? 'upwind'
          : lastStep.gybe
          ? 'downwind'
          : undefined;
        const lastSide = lastStep.tack || lastStep.gybe;

        const currentMode = bestOption.mode;
        const currentSide = bestOption.side;

        if (
          lastMode === 'upwind' &&
          currentMode === 'upwind' &&
          lastSide !== currentSide
        ) {
          totalTacks++;
          action = 'Tack';
          if (totalTacks > maxTacksPerLeg) {
            console.warn(
              `Exceeded maximum tacks (${maxTacksPerLeg}) for Leg ${
                i + 1
              }, breaking out.`,
            );
            break;
          }
        } else if (
          lastMode === 'downwind' &&
          currentMode === 'downwind' &&
          lastSide !== currentSide
        ) {
          totalGybes++;
          action = 'Gybe';
          if (totalGybes > maxGybesPerLeg) {
            console.warn(
              `Exceeded maximum gybes (${maxGybesPerLeg}) for Leg ${
                i + 1
              }, breaking out.`,
            );
            break;
          }
        }
      }

      // Update position
      currentPosition = bestOption.nextPosition;
      distanceToMark = testDistance;

      // Post-move distance check
      if (distanceToMark <= 5) {
        console.log(
          `Mark ${
            i + 1
          } reached at position (${currentPosition.latitude.toFixed(
            5,
          )}, ${currentPosition.longitude.toFixed(5)})`,
        );
        break; // Mark reached
      }

      // Determine point of sail using the updated function
      const pointOfSail = classifyPointOfSail(
        bestOption.twa,
        beatAngle,
        gybeAngle,
      );

      if (bestOption.mode === 'upwind') {
        tack = bestOption.side;
      } else if (bestOption.mode.includes('reach')) {
        // Assign action based on reach mode
        action = 'Sail';
      } else {
        gybe = bestOption.side;
      }

      // Comprehensive Logging
      console.log(
        `Relative Bearing: ${relativeBearing.toFixed(2)}°, Selected TWA: ${
          bestOption.twa
        }°, Mode: ${bestOption.mode}, Heading: ${heading.toFixed(
          2,
        )}°, Speed: ${speed}kn, Distance Reduction Component: ${distanceReductionComponent.toFixed(
          4,
        )}, Point of Sail: ${pointOfSail}`,
      );

      if (attempts % logFrequency === 0) {
        console.log(
          `Step ${attempts}: Mode=${
            bestOption.mode
          }, Action=${action}, TWA=${bestOption.twa.toFixed(
            1,
          )}°, Speed=${bestOption.speed.toFixed(
            2,
          )}kn, DistToMark=${distanceToMark.toFixed(2)}m`,
        );
      }

      legSteps.push({
        position: {...currentPosition},
        speed: bestOption.speed,
        action,
        twa: bestOption.twa,
        heading: bestOption.heading,
        tack,
        gybe,
        pointOfSail,
      });
    }

    const legSummary = {
      startPosition:
        fullRoute.length > 0
          ? fullRoute[fullRoute.length - 1].position
          : courseDetails.boat_starting_position,
      endPosition: currentPosition,
      markReached: distanceToMark <= 5,
      totalTacks,
      totalGybes,
      steps: legSteps,
    };

    legSummaries.push(legSummary);
    fullRoute.push(...legSteps);
  }

  console.log('\n--- Course Summary ---');
  legSummaries.forEach((leg, index) => {
    console.log(`Leg ${index + 1}:`);
    console.log(
      `  Start: (${leg.startPosition.latitude.toFixed(
        5,
      )}, ${leg.startPosition.longitude.toFixed(5)})`,
    );
    console.log(
      `  End:   (${leg.endPosition.latitude.toFixed(
        5,
      )}, ${leg.endPosition.longitude.toFixed(5)})`,
    );
    console.log(`  Tacks: ${leg.totalTacks}, Gybes: ${leg.totalGybes}`);
    console.log(`  Steps: ${leg.steps.length}`);
    if (leg.steps.length > 0) {
      console.log('  Sample Steps Info: ');
      leg.steps.slice(0, 3).forEach((step, i) => {
        console.log(
          `    Step ${i + 1}: Heading ${step.heading.toFixed(
            1,
          )}°, TWA ${step.twa.toFixed(1)}°, Speed ${step.speed.toFixed(
            2,
          )}kn, POS: ${step.pointOfSail}, Action: ${step.action}`,
        );
      });
    }
  });
  console.log('----------------------\n');

  return fullRoute;
}

/**
 * Extracts the Beat Angle and Gybe Angle from the polar table based on wind speed.
 *
 * @param {Array} polarTable - The boat's polar performance table.
 * @param {number} tws - True Wind Speed in knots.
 * @returns {Object} - Contains beatAngle and gybeAngle.
 */
function extractPolarAngles(polarTable, tws) {
  const windSpeedRow = polarTable.find(row => row.label === 'Wind Speed');
  const beatAngleRow = polarTable.find(row => row.label === 'Beat Angle');
  const gybeAngleRow = polarTable.find(row => row.label === 'Gybe Angle');

  if (!windSpeedRow || !beatAngleRow || !gybeAngleRow) {
    // Default angles if not found in polar table
    return {beatAngle: 45, gybeAngle: 135};
  }

  const windIndex = getClosestIndex(tws, windSpeedRow.values);
  let beatAngle = parseFloat(beatAngleRow.values[windIndex]);
  let gybeAngle = parseFloat(gybeAngleRow.values[windIndex]);

  // Ensure beatAngle and gybeAngle align with standard definitions
  beatAngle = Math.max(beatAngle, 45); // Minimum 45°
  gybeAngle = Math.max(gybeAngle, 135); // Minimum 135°

  return {beatAngle, gybeAngle};
}

/**
 * Classifies the Point of Sail based on the True Wind Angle (TWA),
 * Beat Angle, and Gybe Angle.
 *
 * @param {number} twa - True Wind Angle in degrees.
 * @param {number} beatAngle - Beat Angle from the polar table.
 * @param {number} gybeAngle - Gybe Angle from the polar table.
 * @returns {string} - Classified Point of Sail.
 */
function classifyPointOfSail(twa, beatAngle, gybeAngle) {
  twa = (twa + 360) % 360; // Normalize TWA to 0°-360°

  if (twa > 0 && twa < beatAngle) {
    return 'Beating (Upwind)';
  } else if (twa >= beatAngle && twa < 90) {
    return 'Close Reach';
  } else if (twa === 90) {
    return 'Beam Reach';
  } else if (twa > 90 && twa < gybeAngle) {
    return 'Broad Reach';
  } else if (twa >= gybeAngle && twa <= 180) {
    return 'Running (Downwind)';
  } else {
    return 'Unknown';
  }
}

/**
 * Calculates the distance reduction component based on TWA, wind direction,
 * bearing to the mark, and speed.
 *
 * @param {number} twa - True Wind Angle in degrees.
 * @param {number} windDir - Wind direction in degrees.
 * @param {number} bearing - Bearing to the mark in degrees.
 * @param {number} speed - Boat speed in knots.
 * @returns {number} - Distance reduction component.
 */
function calculateDistanceReduction(twa, windDir, bearing, speed) {
  const heading =
    twa < 180 ? (windDir - twa + 360) % 360 : (windDir + twa) % 360;
  const angleDifference = Math.abs(angleDiff(bearing, heading));
  return Math.cos(toRadians(angleDifference)) * speed;
}

/**
 * Retrieves the boat's speed from the polar table based on TWA, wind speed, and mode.
 *
 * @param {number} twa - True Wind Angle in degrees.
 * @param {number} tws - True Wind Speed in knots.
 * @param {Array} polarTable - The boat's polar performance table.
 * @param {string} mode - The current point of sail.
 * @returns {number} - Calculated speed in knots.
 */
function getSpeedFromPolarTable(twa, tws, polarTable, mode) {
  const windSpeedRow = polarTable.find(row => row.label === 'Wind Speed');
  const beatAngleRow = polarTable.find(row => row.label === 'Beat Angle');
  const beatVMGRow = polarTable.find(row => row.label === 'Beat VMG');
  const runVMGRow = polarTable.find(row => row.label === 'Run VMG');
  const gybeAngleRow = polarTable.find(row => row.label === 'Gybe Angle');

  if (
    !windSpeedRow ||
    !beatAngleRow ||
    !beatVMGRow ||
    !runVMGRow ||
    !gybeAngleRow
  ) {
    return 0;
  }

  const windIndex = getClosestIndex(tws, windSpeedRow.values);
  const currentBeatAngle = parseFloat(beatAngleRow.values[windIndex]);
  const currentBeatVMG = parseFloat(beatVMGRow.values[windIndex]);
  const currentGybeAngle = parseFloat(gybeAngleRow.values[windIndex]);
  const currentRunVMG = parseFloat(runVMGRow.values[windIndex]);

  const beatTolerance = 10;
  const gybeTolerance = 10;

  // Assign speeds based on mode with tolerance checks
  switch (mode) {
    case 'upwind':
      // Use beatVMG if within tolerance
      if (Math.abs(twa - currentBeatAngle) <= beatTolerance) {
        return currentBeatVMG;
      }
      return currentBeatVMG; // Default fallback

    case 'closeReach':
      return currentRunVMG * 0.9; // Slightly lower than running

    case 'beamReach':
      return currentRunVMG; // Standard running speed

    case 'broadReach':
      return currentRunVMG * 1.1; // Higher speed on broad reach

    case 'downwind':
      // Use runVMG if within tolerance
      if (Math.abs(twa - currentGybeAngle) <= gybeTolerance) {
        return currentRunVMG;
      }
      return currentRunVMG * 1.2; // Higher speed when running

    default:
      return currentRunVMG;
  }
}

/**
 * Moves the current position along a bearing by a specified distance.
 *
 * @param {Object} position - Current position with latitude and longitude.
 * @param {number} bearing - Bearing in degrees.
 * @param {number} distance - Distance to move in meters.
 * @returns {Object} - New position with updated latitude and longitude.
 */
function moveAlongBearing(position, bearing, distance) {
  const latRad = toRadians(position.latitude);
  const lonRad = toRadians(position.longitude);
  const bearingRad = toRadians(bearing);

  const lat2 = Math.asin(
    Math.sin(latRad) * Math.cos(distance / EARTH_RADIUS) +
      Math.cos(latRad) *
        Math.sin(distance / EARTH_RADIUS) *
        Math.cos(bearingRad),
  );
  const lon2 =
    lonRad +
    Math.atan2(
      Math.sin(bearingRad) *
        Math.sin(distance / EARTH_RADIUS) *
        Math.cos(latRad),
      Math.cos(distance / EARTH_RADIUS) - Math.sin(latRad) * Math.sin(lat2),
    );

  return {
    latitude: toDegrees(lat2),
    longitude: toDegrees(lon2),
  };
}

/**
 * Calculates the great-circle distance between two points using the Haversine formula.
 *
 * @param {Object} pos1 - First position with latitude and longitude.
 * @param {Object} pos2 - Second position with latitude and longitude.
 * @returns {number} - Distance in meters.
 */
function getDistance(pos1, pos2) {
  const φ1 = toRadians(pos1.latitude);
  const φ2 = toRadians(pos2.latitude);
  const Δφ = toRadians(pos2.latitude - pos1.latitude);
  const Δλ = toRadians(pos2.longitude - pos1.longitude);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}

/**
 * Calculates the initial bearing from one point to another.
 *
 * @param {number} lat1 - Latitude of the first point in degrees.
 * @param {number} lon1 - Longitude of the first point in degrees.
 * @param {number} lat2 - Latitude of the second point in degrees.
 * @param {number} lon2 - Longitude of the second point in degrees.
 * @returns {number} - Bearing in degrees.
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
 * Converts degrees to radians.
 *
 * @param {number} deg - Degrees.
 * @returns {number} - Radians.
 */
function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Converts radians to degrees.
 *
 * @param {number} rad - Radians.
 * @returns {number} - Degrees.
 */
function toDegrees(rad) {
  return (rad * 180) / Math.PI;
}

/**
 * Finds the closest index in an array to a given value.
 *
 * @param {number} value - The value to find.
 * @param {Array} array - The array to search.
 * @returns {number} - The index of the closest value.
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

/**
 * Calculates the smallest difference between two angles.
 *
 * @param {number} a - First angle in degrees.
 * @param {number} b - Second angle in degrees.
 * @returns {number} - Smallest difference in degrees.
 */
function angleDiff(a, b) {
  let diff = ((a - b + 180) % 360) - 180;
  return diff < -180 ? diff + 360 : diff;
}

module.exports = {
  calculateRoute,
  calculateBearing,
};

// ----------------------------------------------------------------------------
// 1) ADD THIS FUNCTION NEAR THE END OF routeCalculations.js
// ----------------------------------------------------------------------------

/**
 * Calculate a heading that respects a no-go zone (e.g., ±45° from wind).
 * If direct bearing is inside that zone, we pick a close-hauled angle.
 */
export function calculateHeadingWithTacking({
  boatCoordinates,
  nextWaypoint,
  windDirection,
  currentHeading,
}) {
  // If we have no next waypoint, just keep current heading
  if (!nextWaypoint) return currentHeading;

  // Calculate the direct bearing from boat to next waypoint
  const directBearing = computeBearing(boatCoordinates, nextWaypoint);
  // Adjust to 0-360 range if your computeBearing returns negative angles
  // (If your computeBearing already does that, you can skip next lines)
  let bearingToWaypoint = directBearing % 360;
  if (bearingToWaypoint < 0) {
    bearingToWaypoint += 360;
  }

  // Calculate angle to wind (0 = same direction as wind, 180 = dead downwind)
  const angleToWind = (bearingToWaypoint - windDirection + 360) % 360;

  // Define the no-go zone. 45° is typical, but depends on your polars.
  const NO_GO_ANGLE = 45;

  // If angleToWind is within ±45° of wind, that's the no-go zone
  // i.e., angleToWind in [0..45] or [315..360]
  if (angleToWind < NO_GO_ANGLE || angleToWind > 360 - NO_GO_ANGLE) {
    // We are too close to the wind; pick port or starboard tack
    // Simple logic: if angleToWind < 180, we are on the "left" side of the wind
    // => pick starboard tack (windDir + 45). Otherwise pick port.
    if (angleToWind < 180) {
      // Starboard tack (windDirection + 45)
      return (windDirection + NO_GO_ANGLE) % 360;
    } else {
      // Port tack (windDirection - 45)
      return (windDirection - NO_GO_ANGLE + 360) % 360;
    }
  }

  // Otherwise, we can sail directly to the waypoint
  return bearingToWaypoint;
}

/**
 * Example: If you need a "computeBearing" helper:
 * (If you already have it, remove or rename this accordingly.)
 */
export function computeBearing(fromCoords, toCoords) {
  // Basic math: lat/long in radians
  const lat1 = (fromCoords.latitude * Math.PI) / 180;
  const lon1 = (fromCoords.longitude * Math.PI) / 180;
  const lat2 = (toCoords.latitude * Math.PI) / 180;
  const lon2 = (toCoords.longitude * Math.PI) / 180;

  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  // Normalize to 0-360
  bearing = (bearing + 360) % 360;
  return bearing;
}
