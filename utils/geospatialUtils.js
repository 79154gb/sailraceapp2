// utils/geospatialUtils.js

/**
 * Converts degrees to radians.
 *
 * @param {number} degrees
 * @returns {number} radians
 */
const toRad = degrees => (degrees * Math.PI) / 180;

/**
 * Converts radians to degrees.
 *
 * @param {number} radians
 * @returns {number} degrees
 */
const toDeg = radians => (radians * 180) / Math.PI;

/**
 * Calculates the distance between two geographic coordinates using the Haversine formula.
 *
 * @param {object} from - { latitude: number, longitude: number }
 * @param {object} to - { latitude: number, longitude: number }
 *
 * @returns {number} Distance in nautical miles
 */
export const calculateDistance = (from, to) => {
  const R = 3440.065; // Earth's radius in nautical miles

  const lat1 = toRad(from.latitude);
  const lon1 = toRad(from.longitude);
  const lat2 = toRad(to.latitude);
  const lon2 = toRad(to.longitude);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Calculates the bearing from one geographic coordinate to another.
 *
 * @param {object} from - { latitude: number, longitude: number }
 * @param {object} to - { latitude: number, longitude: number }
 *
 * @returns {number} Bearing in degrees
 */
export const calculateBearing = (from, to) => {
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);
  const dLon = toRad(to.longitude - from.longitude);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360; // Normalize to 0-360

  return bearing;
};

/**
 * Calculates the destination point given a start point, bearing, and distance.
 *
 * @param {number} latitude - Starting latitude in degrees
 * @param {number} longitude - Starting longitude in degrees
 * @param {number} bearing - Bearing in degrees
 * @param {number} distance - Distance in nautical miles
 *
 * @returns {object} - { latitude, longitude }
 */
export const calculateDestinationPoint = (
  latitude,
  longitude,
  bearing,
  distance,
) => {
  const lat1 = toRad(latitude);
  const lon1 = toRad(longitude);
  const brng = toRad(bearing);
  const dr = distance / 3440.065; // Angular distance in radians

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(dr) +
      Math.cos(lat1) * Math.sin(dr) * Math.cos(brng),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(dr) * Math.cos(lat1),
      Math.cos(dr) - Math.sin(lat1) * Math.sin(lat2),
    );

  return {
    latitude: toDeg(lat2),
    longitude: toDeg(lon2),
  };
};
