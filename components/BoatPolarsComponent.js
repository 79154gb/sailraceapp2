import React from 'react';
import {View, Text, StyleSheet, TextInput} from 'react-native';

const BoatPolarsComponent = ({polars, onPolarsChange}) => {
  if (!polars || polars.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No polars data available</Text>
      </View>
    );
  }

  const handleChange = (rowIndex, colIndex, value) => {
    const updatedPolars = [...polars];
    updatedPolars[rowIndex].values[colIndex] = value;
    onPolarsChange(updatedPolars);
  };

  return (
    <View style={styles.table}>
      {polars.map((polar, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          <Text style={styles.label}>{polar.label}</Text>
          {polar.values.map((value, colIndex) => (
            <TextInput
              key={colIndex}
              style={styles.input}
              value={value === null ? '' : value.toString()}
              onChangeText={text => handleChange(rowIndex, colIndex, text)}
              keyboardType="numeric"
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  table: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#FFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  label: {
    flex: 1,
    padding: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    backgroundColor: '#FFF',
  },
  noDataContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#FFAC94',
    textAlign: 'center',
  },
});

export default BoatPolarsComponent;
