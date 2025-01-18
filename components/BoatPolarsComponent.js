import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  useWindowDimensions,
} from 'react-native';

const BoatPolarsComponent = ({polars, onPolarsChange}) => {
  const {width} = useWindowDimensions();

  const handleChange = (rowIndex, colIndex, value) => {
    const updatedPolars = [...polars];
    updatedPolars[rowIndex].values[colIndex] = value;
    onPolarsChange(updatedPolars);
  };

  if (!polars || polars.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No polars data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.table}>
      {polars.map((polar, rowIndex) => {
        // Calculate the width of each input based on the number of values in the row
        const inputWidth = width / (polar.values.length + 1) - 10;

        return (
          <View key={rowIndex} style={styles.row}>
            <Text style={styles.labelAbove}>{polar.label}</Text>
            <View style={styles.inputsContainer}>
              {polar.values.map((value, colIndex) => (
                <TextInput
                  key={colIndex}
                  style={[styles.input, {width: inputWidth}]}
                  value={value === null ? '' : value.toString()}
                  onChangeText={text => handleChange(rowIndex, colIndex, text)}
                  keyboardType="numeric"
                />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  table: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#FFF',
    backgroundColor: '#37414f',
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'column',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 5,
  },
  labelAbove: {
    fontWeight: 'bold',
    color: '#EAECEC',
    fontSize: 12,
    marginBottom: 5,
    textAlign: 'center',
  },
  inputsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 5,
    marginHorizontal: 2,
    borderRadius: 5,
    backgroundColor: '#37414f',
    color: '#EAECEC',
    fontSize: 12,
    textAlign: 'center',
  },
  noDataContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#EAECEC',
    textAlign: 'center',
  },
});

export default BoatPolarsComponent;
