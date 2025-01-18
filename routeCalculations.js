const EARTH_RADIUS = 6371e3; // Earth radius in meters

function calculateRoute(courseDetails, windData, polarTable) {
  const startPosition = courseDetails.boat_starting_position;
  const waypoints = courseDetails.course.waypoints;

  const fullRoute = [];
  let currentPosition = {...startPosition};

  const legSummaries = [];
  const timeIntervalMinutes = 10; // Simulate every 10 minutes
  const logFrequency = 50;

  const {beatAngle, gybeAngle} = extractPolarAngles(
    polarTable,
    windData.wind.speed,
  );

  // Candidate TWAs:
  // Upwind starboard: beatAngle
  // Upwind port: 360 - beatAngle
  // Downwind starboard: gybeAngle
  // Downwind port: 360 - gybeAngle
  const candidateTWAs = [
    {mode: 'upwind', side: 'starboard', twa: beatAngle},
    {mode: 'upwind', side: 'port', twa: (360 - beatAngle) % 360},
    {mode: 'downwind', side: 'starboard', twa: gybeAngle},
    {mode: 'downwind', side: 'port', twa: (360 - gybeAngle) % 360},
  ];

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

      const bearing = calculateBearing(
        currentPosition.latitude,
        currentPosition.longitude,
        mark.latitude,
        mark.longitude,
      );
      // Check if we've reached the mark
      if (distanceToMark <= 5) {
        // Mark reached, break out immediately
        break;
      }
      const windDir = windData.wind.direction;
      const tws = windData.wind.speed;

      // Try each candidate TWA and pick the best one
      let bestOption = null;
      let bestDistance = Infinity;
      distanceToMark = getDistance(currentPosition, mark);
      if (distanceToMark <= 5) {
        break;
      }
      for (let option of candidateTWAs) {
        const heading = (windDir + option.twa) % 360;
        const speed = getSpeedFromPolarTable(
          option.twa,
          tws,
          polarTable,
          beatAngle,
          gybeAngle,
        );
        const distanceStep = speed * 0.514444 * 60 * timeIntervalMinutes;

        // Hypothetical next position
        const testPosition = moveAlongBearing(
          currentPosition,
          heading,
          distanceStep,
        );
        const testDistance = getDistance(testPosition, mark);

        if (testDistance < bestDistance) {
          bestDistance = testDistance;
          bestOption = {...option, heading, speed, nextPosition: testPosition};
        }
      }

      if (!bestOption) {
        // If we somehow fail to pick an option, break
        console.error('No candidate option found, breaking out.');
        break;
      }

      // Determine if we tacked or gybed
      let action = 'Sail';
      let tack = undefined;
      let gybe = undefined;

      // Check previous mode/tack/gybe to count tacks/gybes:
      // If needed, store previous option and compare. For simplicity, let's say:
      // If mode changed from upwind to downwind or vice versa, call it a gybe or tack as appropriate.
      // Actually, since we always pick best option, counting tacks/gybes is tricky:
      // We'll increment tacks/gybes if we switch from upwind port <-> upwind starboard or downwind port <-> downwind starboard.
      // Let's assume we store lastOption:
      if (legSteps.length > 0) {
        const lastStep = legSteps[legSteps.length - 1];
        const lastMode = lastStep.tack
          ? 'upwind'
          : lastStep.gybe
          ? 'downwind'
          : undefined;
        const lastSide = lastStep.tack || lastStep.gybe;

        const currentMode = bestOption.mode;
        const currentSide =
          bestOption.mode === 'upwind' ? bestOption.side : bestOption.side;

        if (
          lastMode === 'upwind' &&
          currentMode === 'upwind' &&
          lastSide !== currentSide
        ) {
          totalTacks++;
          action = 'Tack';
        } else if (
          lastMode === 'downwind' &&
          currentMode === 'downwind' &&
          lastSide !== currentSide
        ) {
          totalGybes++;
          action = 'Gybe';
        }
      }

      // Update position
      currentPosition = bestOption.nextPosition;
      distanceToMark = bestDistance;

      // Determine point of sail
      const pointOfSail = classifyPointOfSail(
        bestOption.twa,
        beatAngle,
        gybeAngle,
      );
      if (bestOption.mode === 'upwind') {
        tack = bestOption.side;
      } else {
        gybe = bestOption.side;
      }

      if (attempts % logFrequency === 0) {
        console.log(
          `Step ${attempts}: Mode=${
            bestOption.mode
          }, Action=${action}, TWA=${bestOption.twa.toFixed(
            1,
          )}, Speed=${bestOption.speed.toFixed(
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

function extractPolarAngles(polarTable, tws) {
  const windSpeedRow = polarTable.find(row => row.label === 'Wind Speed');
  const beatAngleRow = polarTable.find(row => row.label === 'Beat Angle');
  const gybeAngleRow = polarTable.find(row => row.label === 'Gybe Angle');

  if (!windSpeedRow || !beatAngleRow || !gybeAngleRow) {
    return {beatAngle: 40, gybeAngle: 170};
  }

  const windIndex = getClosestIndex(tws, windSpeedRow.values);
  const beatAngle = parseFloat(beatAngleRow.values[windIndex]);
  const gybeAngle = parseFloat(gybeAngleRow.values[windIndex]);
  return {beatAngle, gybeAngle};
}

function classifyPointOfSail(twa, beatAngle, gybeAngle) {
  twa = (twa + 360) % 360;
  if (beatAngle > gybeAngle) {
    const temp = beatAngle;
    beatAngle = gybeAngle;
    gybeAngle = temp;
  }
  if (twa <= beatAngle) {
    return 'Beating (Upwind)';
  } else if (twa >= gybeAngle) {
    return 'Running (Downwind)';
  } else {
    const range = gybeAngle - beatAngle;
    const segment = range / 3;
    const closeReachUpper = beatAngle + segment;
    const beamReachUpper = beatAngle + 2 * segment;
    if (twa > beatAngle && twa <= closeReachUpper) {
      return 'Close Reach';
    }
    if (twa > closeReachUpper && twa <= beamReachUpper) {
      return 'Beam Reach';
    }
    return 'Broad Reach';
  }
}

function getSpeedFromPolarTable(twa, tws, polarTable, beatAngle, gybeAngle) {
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

  let windIndex = getClosestIndex(tws, windSpeedRow.values);
  const currentBeatAngle = parseFloat(beatAngleRow.values[windIndex]);
  const currentBeatVMG = parseFloat(beatVMGRow.values[windIndex]);
  const currentGybeAngle = parseFloat(gybeAngleRow.values[windIndex]);
  const currentRunVMG = parseFloat(runVMGRow.values[windIndex]);

  const beatTolerance = 10;
  const gybeTolerance = 10;

  // Use Beat VMG if near beat angle
  if (
    Math.abs(twa - currentBeatAngle) <= beatTolerance ||
    Math.abs(twa - (360 - currentBeatAngle)) <= beatTolerance
  ) {
    return currentBeatVMG;
  }
  // Use Run VMG if near gybe angle
  if (
    Math.abs(twa - currentGybeAngle) <= gybeTolerance ||
    Math.abs(twa - (360 - currentGybeAngle)) <= gybeTolerance
  ) {
    return currentRunVMG;
  }

  // Otherwise pick closest angle row
  const angleRows = polarTable.filter(
    row =>
      !isNaN(parseFloat(row.label)) &&
      row.label !== 'Beat Angle' &&
      row.label !== 'Gybe Angle',
  );
  const angles = angleRows.map(r => parseFloat(r.label));
  const closestAngleIndex = getClosestIndex(twa, angles);

  const chosenAngleRow = angleRows[closestAngleIndex];
  const speedAtAngle = parseFloat(chosenAngleRow.values[windIndex]) || 0;
  return speedAtAngle;
}

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

function angleDiff(a, b) {
  let diff = ((a - b + 180) % 360) - 180;
  return diff < -180 ? diff + 360 : diff;
}

function calculateBearing(lat1, lon1, lat2, lon2) {
  const φ1 = toRadians(lat1),
    φ2 = toRadians(lat2);
  const λ1 = toRadians(lon1),
    λ2 = toRadians(lon2);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  let θ = Math.atan2(y, x);
  θ = toDegrees(θ);
  return (θ + 360) % 360;
}

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function toDegrees(rad) {
  return (rad * 180) / Math.PI;
}

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
};
