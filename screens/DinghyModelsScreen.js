import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ActivityIndicator, ScrollView} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {getModelsByManufacturer} from '../api/api'; // Import the API function

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
        console.log('Fetched models:', models); // Log fetched models
        setItems(models);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching models:', error); // Log any errors
        setLoading(false);
      }
    };

    fetchModels();
  }, [selectedManufacturer]);

  const handleModelSelect = itemValue => {
    console.log('Selected model:', itemValue);
    setModel(itemValue);

    const selectedModel = items.find(item => item.value === itemValue);
    const model_id = selectedModel ? selectedModel.id : null; // Ensure you have the modelId
    console.log('Retrieved modelId:', model_id);

    navigation.navigate('UserBoatDetailsScreen', {
      userId,
      manufacturer: selectedManufacturer,
      model: itemValue,
      model_id, // Pass the modelId to the next screen
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
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
          dropDownContainerStyle={styles.dropDownDropdown}
          labelStyle={styles.dropDownLabel}
          textStyle={styles.textStyle}
          placeholder="Select model"
          placeholderStyle={{
            color: '#EAECEC',
            fontSize: 16,
            fontWeight: 'normal',
          }}
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
    height: 40,
    marginBottom: 20,
  },
  dropDown: {
    backgroundColor: '#37414f', // Matching the "Select model" background color
  },
  dropDownItem: {
    justifyContent: 'flex-start',
    backgroundColor: '#37414f', // Matching the "Select model" background color
  },
  dropDownDropdown: {
    backgroundColor: '#37414f', // Matching the "Select model" background color
  },
  dropDownLabel: {
    color: '#EAECEC',
    fontSize: 16,
    fontWeight: 'normal',
  },
  textStyle: {
    color: '#EAECEC', // Matching the text color of "Select model"
    fontSize: 16,
    fontWeight: 'normal',
  },
});

export default DinghyModelsScreen;
