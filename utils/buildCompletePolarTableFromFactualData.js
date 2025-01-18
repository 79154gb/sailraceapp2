export const buildCompletePolarTableFromFactualData = boatPolars => {
  // Step 1: Extract factual data
  const windSpeeds = boatPolars
    .find(item => item.label === 'Wind Speed')
    ?.values.map(Number);
  const twaLabels = boatPolars
    .filter(
      item =>
        ![
          'Wind Speed',
          'Beat Angle',
          'Gybe Angle',
          'Beat VMG',
          'Run VMG',
        ].includes(item.label),
    )
    .map(item => Number(item.label));

  if (!windSpeeds || windSpeeds.length === 0) {
    throw new Error('No wind speeds found in boatPolars');
  }

  // Desired ranges
  const fullWindSpeeds = Array.from({length: 20}, (_, i) => i + 1); // 1–20 knots
  const fullTWAs = Array.from({length: 37}, (_, i) => i * 5); // 0–180 in 5° increments

  // Step 2: Structure factual data
  const structuredData = {};
  boatPolars.forEach(item => {
    const label = item.label;
    if (label === 'Wind Speed') return; // Skip wind speed
    structuredData[label] = item.values.map(Number);
  });

  // Helper to interpolate between two points
  const interpolate = (x, x1, y1, x2, y2) => {
    if (x2 === x1) return y1; // Prevent division by zero
    return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
  };

  // Step 3: Build complete table
  const completePolarTable = {};

  fullWindSpeeds.forEach(windSpeed => {
    completePolarTable[windSpeed] = {};

    fullTWAs.forEach(twa => {
      // Check if the value is already factual
      const factualWindIndex = windSpeeds.indexOf(windSpeed);
      const factualTWAIndex = twaLabels.indexOf(twa);

      if (factualWindIndex !== -1 && factualTWAIndex !== -1) {
        // Directly use the factual data
        completePolarTable[windSpeed][twa] =
          structuredData[String(twa)][factualWindIndex];
      } else {
        // Interpolate across wind speeds
        const lowerWindSpeed = windSpeeds.filter(ws => ws <= windSpeed).pop();
        const higherWindSpeed = windSpeeds.find(ws => ws > windSpeed);

        const lowerTWA = twaLabels.filter(t => t <= twa).pop();
        const higherTWA = twaLabels.find(t => t > twa);

        const lowerSpeed =
          lowerWindSpeed !== undefined &&
          lowerTWA !== undefined &&
          structuredData[String(lowerTWA)]?.[
            windSpeeds.indexOf(lowerWindSpeed)
          ];

        const higherSpeed =
          higherWindSpeed !== undefined &&
          higherTWA !== undefined &&
          structuredData[String(higherTWA)]?.[
            windSpeeds.indexOf(higherWindSpeed)
          ];

        if (lowerSpeed !== undefined && higherSpeed !== undefined) {
          // Interpolate for missing data
          const interpolatedSpeed = interpolate(
            windSpeed,
            lowerWindSpeed,
            lowerSpeed,
            higherWindSpeed,
            higherSpeed,
          );
          completePolarTable[windSpeed][twa] = interpolatedSpeed;
        }
      }
    });
  });

  return completePolarTable;
};
