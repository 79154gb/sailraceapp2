// utils/sailingUtils.js

/**
 * Determines the point of sail based on the relative wind angle.
 *
 * @param {number} relativeWindAngle - Relative wind angle in degrees
 *
 * @returns {string} Point of sail (e.g., 'Close Hauled', 'Beam Reach', 'Broad Reach', 'Running')
 */
export const determinePointOfSail = relativeWindAngle => {
  if (relativeWindAngle === 0 || relativeWindAngle === 180) {
    return 'Running';
  } else if (relativeWindAngle > 0 && relativeWindAngle < 45) {
    return 'Close Reach';
  } else if (relativeWindAngle === 45) {
    return 'Close Hauled';
  } else if (relativeWindAngle > 45 && relativeWindAngle < 135) {
    return 'Beam Reach';
  } else if (relativeWindAngle >= 135 && relativeWindAngle < 180) {
    return 'Broad Reach';
  } else {
    return 'Unknown';
  }
};
