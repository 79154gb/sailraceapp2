import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const DinghyModelsScreen = ({navigation}) => {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState(null);
  const [items, setItems] = useState([
    {label: '5.3', value: '5.3'},
    {label: '4.3', value: '4.3'}, // Example manufacturer option
    // Add more manufacturer options as needed
  ]);

  const handleModelSelect = itemValue => {
    console.log('Selected model:', itemValue);
    setModel(itemValue);
    navigation.navigate('RaceOverview', {selectedModel: itemValue});
  };

  return (
    <View style={styles.container}>
      <DropDownPicker
        open={open}
        value={model}
        items={items}
        setValue={setModel}
        setItems={setItems}
        setOpen={setOpen}
        defaultValue={model}
        placeholder="Select model"
        onChangeValue={item => handleModelSelect(item)}
        containerStyle={styles.dropDownContainer}
        style={styles.dropDown}
        itemStyle={styles.dropDownItem}
        dropDownStyle={styles.dropDownDropdown}
        labelStyle={styles.dropDownLabel}
      />
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
  dropDownContainer: {
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
