import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const RaceCourseScreen = ({navigation, route}) => {
  const [open, setOpen] = useState(false);
  const [raceCourse, setRaceCourse] = useState(null);
  const [items, setItems] = useState([
    {label: 'Triangle', value: 'Triangle'},
    {label: 'Windward/Leeward', value: 'Windward/Leeward'},
    {label: 'Olympic', value: 'Olympic'},
    {label: 'Trapezoid', value: 'Trapezoid'},
    {label: 'Inner Loop Trapezoid', value: 'Inner Loop Trapezoid'},
    {label: 'Outer Loop Trapezoid', value: 'Outer Loop Trapezoid'},
  ]);

  const handleRaceCourseSelect = itemValue => {
    console.log('Selected race course:', itemValue);
    setRaceCourse(itemValue);
    navigation.navigate('RaceOverview', {
      raceStartTime: route.params.raceStartTime,
      windSpeed: route.params.windSpeed,
      windDirection: route.params.windDirection,
      tideSpeed: route.params.tideSpeed,
      tideDirection: route.params.tideDirection,
      raceCourse: itemValue,
    }); // Navigate to the RaceOverviewScreen
  };

  return (
    <View style={styles.container}>
      <DropDownPicker
        open={open}
        value={raceCourse}
        items={items}
        setValue={setRaceCourse}
        setItems={setItems}
        setOpen={setOpen}
        defaultValue={raceCourse}
        placeholder="Select race course"
        onChangeValue={item => handleRaceCourseSelect(item)}
        // eslint-disable-next-line react-native/no-inline-styles
        containerStyle={{...styles.dropDownContainer, height: 200}} // Adjust the height here
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

export default RaceCourseScreen;
