import json
import numpy as np
from scipy.interpolate import interp1d

# Polar data as per the provided table
polar_data = {
    'TWS': [6, 8, 10, 12, 14, 16, 20],
    'Beat Angle': [42.6, 40.2, 38.4, 37.2, 36.9, 36.9, 37.0],
    'Beat VMG': [3.26, 3.94, 4.39, 4.60, 4.68, 4.73, 4.74],
    '52': [4.93, 5.76, 6.20, 6.39, 6.48, 6.53, 6.58],
    '60': [5.18, 5.95, 6.34, 6.54, 6.64, 6.70, 6.77],
    '75': [5.32, 6.08, 6.46, 6.69, 6.86, 6.97, 7.09],
    '90': [5.23, 6.12, 6.55, 6.78, 6.96, 7.15, 7.42],
    '110': [5.20, 6.15, 6.63, 6.97, 7.26, 7.51, 7.86],
    '120': [5.01, 6.00, 6.54, 6.91, 7.24, 7.56, 8.26],
    '135': [4.46, 5.49, 6.21, 6.64, 7.00, 7.36, 8.19],
    '150': [3.76, 4.80, 5.67, 6.28, 6.67, 7.01, 7.71],
    'Run VMG': [3.25, 4.16, 4.94, 5.61, 6.17, 6.57, 7.22],
    'Gybe Angle': [145.3, 150.5, 155.0, 163.7, 177.2, 179.0, 179.0]
}

# TWAs to interpolate between
twa_points = [0, 45, 52, 60, 75, 90, 110, 120, 135, 150, 180]

# Set up the polar table
polar_table = {}

# Generate interpolated values between wind speeds and TWAs
for tws in range(1, 21):  # TWS 1 to 20 knots
    polar_table[tws] = {}
    for twa in range(1, 181):  # TWA 1° to 180°
        # Interpolation setup for each TWA column
        if twa in twa_points:
            twa_key = str(twa) if twa in polar_data else 'Run VMG' if twa == 180 else 'Beat VMG'
            if twa_key in polar_data:
                f = interp1d(polar_data['TWS'], polar_data[twa_key], kind='linear', fill_value="extrapolate")
                speed = float(f(tws))
                polar_table[tws][twa] = round(speed, 2)
            else:
                polar_table[tws][twa] = None  # No data for this angle
        else:
            # For angles not given, interpolate from surrounding known TWAs
            lower_twa = max([pt for pt in twa_points if pt < twa], default=0)
            upper_twa = min([pt for pt in twa_points if pt > twa], default=180)
            lower_speed = polar_table[tws].get(lower_twa, 0)
            upper_speed = polar_table[tws].get(upper_twa, 0)
            if lower_speed and upper_speed:
                # Linear interpolation
                interpolated_speed = lower_speed + (upper_speed - lower_speed) * ((twa - lower_twa) / (upper_twa - lower_twa))
                polar_table[tws][twa] = round(interpolated_speed, 2)

    # Include gybe angle for reference at each wind speed
    polar_table[tws]['gybe_angle'] = polar_data['Gybe Angle'][polar_data['TWS'].index(tws)] if tws in polar_data['TWS'] else None

# Save table to a JSON file for later use
with open("polarTable.json", "w") as file:
    json.dump(polar_table, file, indent=2)
print("Polar table generated and saved to polarTable.json.")

