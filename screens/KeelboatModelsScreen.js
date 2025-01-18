import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Text,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {getKeelboatModelsByManufacturer} from '../api/api'; // Import the API function for keelboats

const KeelboatModelsScreen = ({route, navigation}) => {
  const {selectedManufacturer, userId} = route.params;
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const models = await getKeelboatModelsByManufacturer(
          selectedManufacturer,
        );
        setItems(models);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching models:', error);
        setLoading(false);
      }
    };

    fetchModels();
  }, [selectedManufacturer]);

  const handleModelSelect = item => {
    if (!item) {
      console.error('Selected item is null or undefined');
      return;
    }

    setModel(item.value); // Set the model value for the selected item

    const modelId = item.id;
    const modelName = item.label; // Use item.label if it holds the model's name
    console.log('Retrieved modelId for keelboat:', modelId);
    console.log('Manufacturer:', selectedManufacturer);
    console.log('Model Name:', modelName);

    // Navigate with all the required parameters
    navigation.navigate('KeelboatDetailsScreen', {
      userId,
      manufacturer: selectedManufacturer,
      modelName: modelName, // Pass the correct model name
      model_id: modelId,
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
          placeholder="Select keelboat model"
          placeholderStyle={{
            color: '#EAECEC',
            fontSize: 16,
            fontWeight: 'normal',
          }}
          onChangeValue={item =>
            handleModelSelect(items.find(i => i.value === item))
          }
          listMode="SCROLLVIEW"
          modalProps={{
            animationType: 'slide',
            hardwareAccelerated: true,
            presentationStyle: 'fullScreen',
          }}
          // **Added Props for Search Functionality**
          searchable={true}
          searchPlaceholder="Type to search models..."
          searchablePlaceholderTextColor="gray"
          searchableStyle={{
            borderColor: '#ccc',
            borderWidth: 1,
            padding: 10,
          }}
          searchableError={() => (
            <Text style={{color: 'red'}}>No results found</Text>
          )}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... your existing styles ...
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingTop: 50,
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
    backgroundColor: '#37414f',
  },
  dropDownItem: {
    justifyContent: 'flex-start',
    backgroundColor: '#37414f',
  },
  dropDownDropdown: {
    backgroundColor: '#37414f',
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

export default KeelboatModelsScreen;
