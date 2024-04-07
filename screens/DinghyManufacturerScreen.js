// DinghyManufacturerScreen.js
import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const DinghyManufacturerScreen = ({navigation}) => {
  const [open, setOpen] = useState(false);
  const [manufacturer, setManufacturer] = useState(null);
  const [items, setItems] = useState([
    {label: 'Topper', value: 'Topper'}, // Example manufacturer option
    // Add more manufacturer options as needed
  ]);

  const handleManufacturerSelect = itemValue => {
    console.log('Selected manufacturer:', itemValue);
    setManufacturer(itemValue);
    navigation.navigate('DinghyModels'); // Navigate to DinghyModelsScreen
  };

  return (
    <View style={styles.container}>
      <DropDownPicker
        open={open}
        value={manufacturer}
        items={items}
        setOpen={setOpen}
        setValue={setManufacturer}
        setItems={setItems}
        containerStyle={styles.dropDownContainer}
        style={styles.dropDown}
        itemStyle={styles.dropDownItem}
        dropDownStyle={styles.dropDownDropdown}
        labelStyle={styles.dropDownLabel}
        placeholder="Select manufacturer"
        onChangeValue={item => handleManufacturerSelect(item)}
      />
    </View>
  );
};

// Styles definition
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222831', // Background color
  },
  dropDownContainer: {
    height: 40,
    marginBottom: 20,
  },
  dropDown: {
    backgroundColor: '#FFAC94', // Dropdown button background color
  },
  dropDownItem: {
    justifyContent: 'flex-start',
    backgroundColor: '#FFAC94', // Dropdown item background color
  },
  dropDownDropdown: {
    backgroundColor: '#FFAC94', // Dropdown menu background color
  },
  dropDownLabel: {
    color: '#9af4fd', // Dropdown button text color
  },
});

export default DinghyManufacturerScreen;
