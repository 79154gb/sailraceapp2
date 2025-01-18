// components/MarkerPicker.js

import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import markerTypes from '../utils/markerTypes';

const MarkerPicker = ({selectedMarkerType, setSelectedMarkerType}) => {
  return (
    <View style={styles.container}>
      {markerTypes.map(type => (
        <TouchableOpacity
          key={type.value}
          style={[
            styles.button,
            selectedMarkerType === type.value && styles.selectedButton,
          ]}
          onPress={() => setSelectedMarkerType(type.value)}>
          <Text style={styles.text}>{type.value}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#6c757d',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    margin: 2,
  },
  selectedButton: {
    backgroundColor: '#28a745',
  },
  text: {
    color: '#fff',
    fontSize: 12,
  },
});

export default MarkerPicker;
