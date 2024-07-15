import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Text,
  Alert,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {getModelsByManufacturer, addBoatToUserAccount} from './api'; // Import the API functions

const DinghyModelsScreen = ({route, navigation}) => {
  const {selectedManufacturer, userId} = route.params; // Retrieve the selected manufacturer and userId from navigation params
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const models = await getModelsByManufacturer(selectedManufacturer);
        setItems(models);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchModels();
  }, [selectedManufacturer]);

  const handleModelSelect = async itemValue => {
    console.log('Selected model:', itemValue);
    setModel(itemValue);

    try {
      const response = await addBoatToUserAccount(
        userId,
        selectedManufacturer,
        itemValue,
      );
      console.log('Response from addBoatToUserAccount:', response);

      if (
        response.message === 'Boat already exists in user account' ||
        response.message === 'Boat added to user account successfully'
      ) {
        navigation.navigate('UserBoatDetails', {
          userId,
          manufacturer: selectedManufacturer,
          model: itemValue,
        });
      } else {
        throw new Error('Unexpected response');
      }
    } catch (error) {
      console.log('Error adding boat to user account:', error);
      Alert.alert('Error', 'Failed to add boat to user account');
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
          value={model}
          items={items}
          setOpen={setOpen}
          setValue={setModel}
          setItems={setItems}
          containerStyle={styles.dropDownContainer}
          style={styles.dropDown}
          itemStyle={styles.dropDownItem}
          dropDownStyle={styles.dropDownDropdown}
          labelStyle={styles.dropDownLabel}
          placeholder="Select model"
          onChangeValue={item => handleModelSelect(item)}
          listMode="SCROLLVIEW"
          modalProps={{
            animationType: 'slide',
            hardwareAccelerated: true,
            presentationStyle: 'fullScreen',
          }}
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

export default DinghyModelsScreen;
