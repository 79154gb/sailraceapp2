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
          dropDownStyle={styles.dropDownDropdown}
          labelStyle={styles.dropDownLabel}
          placeholder="Select manufacturer"
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222831',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropDownContainer: {
    width: '80%',
    height: 40,
    marginBottom: 20,
  },
  dropDown: {
    backgroundColor: '#FFAC94',
  },
  dropDownItem: {
    justifyContent: 'flex-start',
    backgroundColor: '#FFAC94',
  },
  dropDownDropdown: {
    backgroundColor: '#FFAC94',
  },
  dropDownLabel: {
    color: '#9af4fd',
  },
});

export default DinghyManufacturerScreen;
