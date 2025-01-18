import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ActivityIndicator, ScrollView} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {getManufacturers} from '../api/api'; // Import the API function

const DinghyManufacturerScreen = ({navigation, route}) => {
  const {userId} = route.params; // Retrieve userId from navigation params
  console.log('User ID in DinghyManufacturerScreen:', userId); // Log user ID
  const [open, setOpen] = useState(false);
  const [manufacturer, setManufacturer] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const manufacturers = await getManufacturers();
        setItems(manufacturers);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchManufacturers();
  }, []);

  const handleManufacturerSelect = itemValue => {
    console.log('Selected manufacturer:', itemValue);
    setManufacturer(itemValue);
    if (itemValue) {
      navigation.navigate('DinghyModels', {
        selectedManufacturer: itemValue,
        userId,
      }); // Pass selected manufacturer and userId
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={{flex: 1, width: '100%', alignSelf: 'stretch'}}
        contentContainerStyle={{flexGrow: 1, alignItems: 'center'}}>
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
          dropDownContainerStyle={styles.dropDownDropdown} // Style for dropdown container
          textStyle={styles.textStyle} // Bold and color for dropdown items
          labelStyle={styles.dropDownLabel} // Bold and color for selected label
          placeholder="Select manufacturer"
          placeholderStyle={{
            color: '#EAECEC',
            fontSize: 16,
            fontWeight: 'normal',
          }} // Bold placeholder
          onChangeValue={item => handleManufacturerSelect(item)}
          listMode="SCROLLVIEW"
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Align content to the top
    paddingTop: 50, // Adjust this value to move buttons down slightly if needed
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropDownContainer: {
    width: '80%',
    height: 200,
  },
  dropDown: {
    backgroundColor: '#37414f', // Match the boatContainer background color
    borderRadius: 10, // Consistent with boatContainer
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  dropDownItem: {
    justifyContent: 'flex-start',
    backgroundColor: '#37414f', // Match the boatContainer background color
  },
  dropDownDropdown: {
    backgroundColor: '#37414f', // Match the boatContainer background color
    maxHeight: 355,
  },
  dropDownLabel: {
    color: '#EAECEC', // Match the boatText color
    fontSize: 16,
    fontWeight: 'normal',
  },
  textStyle: {
    color: '#EAECEC', // Match the boatText color
    fontSize: 16,
    fontWeight: 'normal',
  },
});

export default DinghyManufacturerScreen;
