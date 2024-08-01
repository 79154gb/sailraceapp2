import React from 'react';
import {View, TouchableOpacity, Text, FlatList, StyleSheet} from 'react-native';
import CustomButton from './CustomButton';

const markerTypes = [
  {label: 'Start Mark 1', value: 'start1', color: 'blue'},
  {label: 'Start Mark 2', value: 'start2', color: 'cyan'},
  {label: 'Windward Mark', value: 'windward', color: 'red'},
  {label: 'Leeward Mark', value: 'leeward', color: 'green'},
  {label: 'Reach Mark', value: 'reach', color: 'yellow'},
];

const MarkerPicker = ({
  selectedMarkerType,
  setSelectedMarkerType,
  placeMarkerAtCross,
  setMarkers,
}) => (
  <View style={styles.markerPicker}>
    <FlatList
      horizontal
      data={markerTypes}
      renderItem={({item}) => (
        <TouchableOpacity
          style={styles.modalItem}
          onPress={() => setSelectedMarkerType(item.value)}>
          <Text>{item.label}</Text>
        </TouchableOpacity>
      )}
      keyExtractor={item => item.value}
    />
    {selectedMarkerType && (
      <CustomButton title="Place Marker Here" onPress={placeMarkerAtCross} />
    )}
    <CustomButton title="Clear Markers" onPress={() => setMarkers([])} />
  </View>
);

const styles = StyleSheet.create({
  markerPicker: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    backgroundColor: 'white',
    borderRadius: 5,
    marginVertical: 5,
  },
});

export default MarkerPicker;
