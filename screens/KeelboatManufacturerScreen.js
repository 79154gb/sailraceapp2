import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ActivityIndicator, Text} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {getKeelboatManufacturers} from '../api/api';

const KeelboatManufacturerScreen = ({navigation, route}) => {
  const {userId} = route.params;
  const [open, setOpen] = useState(false);
  const [manufacturer, setManufacturer] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const manufacturers = await getKeelboatManufacturers();
        console.log('Manufacturers data:', manufacturers);

        // Filter out any manufacturers with null or undefined label or value
        const validManufacturers = manufacturers.filter(
          manufacturer =>
            manufacturer.label &&
            manufacturer.value &&
            typeof manufacturer.label === 'string' &&
            typeof manufacturer.value === 'string',
        );

        console.log('Valid Manufacturers:', validManufacturers);

        setItems(validManufacturers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching manufacturers:', error);
        setLoading(false);
      }
    };

    fetchManufacturers();
  }, []);

  const handleManufacturerSelect = item => {
    if (!item) {
      console.error('Selected item is null or undefined');
      return;
    }

    setManufacturer(item.value);

    navigation.navigate('KeelboatModels', {
      selectedManufacturer: item.value, // Use item.value if it contains the manufacturer name
      userId,
    });
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
      <DropDownPicker
        open={open}
        value={manufacturer}
        items={items}
        setOpen={setOpen}
        setValue={setManufacturer}
        setItems={setItems}
        containerStyle={styles.dropDownContainer}
        style={styles.dropDown}
        dropDownContainerStyle={styles.dropDownDropdown}
        textStyle={styles.textStyle}
        labelStyle={styles.dropDownLabel}
        placeholder="Select manufacturer"
        placeholderStyle={{
          color: '#EAECEC',
          fontSize: 16,
          fontWeight: 'normal',
        }}
        onSelectItem={handleManufacturerSelect}
        searchable={true}
        searchPlaceholder="Type to search manufacturers..."
        searchablePlaceholderTextColor="gray"
        searchableStyle={{
          borderColor: '#ccc',
          borderWidth: 1,
          padding: 10,
          color: '#EAECEC',
        }}
        searchableError={() => (
          <Text style={{color: 'red', textAlign: 'center', marginTop: 10}}>
            No results found
          </Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center', // Center horizontally
    backgroundColor: '#000000',
    paddingTop: 50, // Position dropdown at the top
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropDownContainer: {
    width: '80%',
  },
  dropDown: {
    backgroundColor: '#37414f',
    borderRadius: 10,
    borderWidth: 0, // Remove border if needed
  },
  dropDownDropdown: {
    backgroundColor: '#37414f',
    borderRadius: 10,
    borderWidth: 0, // Remove border if needed
    color: '#EAECEC',
    maxHeight: 365,
  },
  dropDownLabel: {
    color: '#EAECEC',
    fontSize: 16,
    fontWeight: 'normal',
  },
  textStyle: {
    color: '#EAECEC',
    fontSize: 16,
    fontWeight: 'normal',
  },
});

export default KeelboatManufacturerScreen;
