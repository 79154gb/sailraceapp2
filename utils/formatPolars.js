// utils/formatPolars.js

export function formatPolars(rawPolars) {
  const formattedPolars = {};

  rawPolars.polars.forEach(entry => {
    const windSpeed = entry.wind_speed;
    const beatAngle = parseFloat(entry.beat_angle);

    // Initialize the wind speed entry if it doesn't exist
    if (!formattedPolars[windSpeed]) {
      formattedPolars[windSpeed] = {};
    }

    // Add the beat angle
    formattedPolars[windSpeed][beatAngle] = parseFloat(entry.twa_52); // Assuming twa_52 corresponds to beat_angle speed

    // Iterate through all twa_* keys to add additional headings
    Object.keys(entry).forEach(key => {
      if (key.startsWith('twa_')) {
        const angle = parseFloat(key.split('_')[1]);
        const speed = parseFloat(entry[key]);
        formattedPolars[windSpeed][angle] = speed;
      }
    });
  });

  return formattedPolars;
}
