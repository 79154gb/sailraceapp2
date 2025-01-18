import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const SailboatCategoriesScreen = ({navigation, route}) => {
  const {userId} = route.params; // Retrieve userId from navigation params
  console.log('User ID in SailboatCategoriesScreen:', userId); // Log user ID

  const handleCategoryPress = category => {
    if (category === 'Dinghys') {
      navigation.navigate('DinghyManufacturer', {userId}); // Navigate to DinghyManufacturer screen
    } // Handle navigation to subcategories or other screens based on selected category
    if (category === 'Keelboats') {
      navigation.navigate('KeelboatManufacturer', {userId}); // Navigate to DinghyManufacturer screen
    } // Handle navigation to subcategories or other screens based on selected category
  };
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#000000']}
        style={styles.background}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleCategoryPress('Dinghys')}>
        <Text style={styles.buttonText}>Dinghy's</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleCategoryPress('Keelboats')}>
        <Text style={styles.buttonText}>Keel Boats/Yachts</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleCategoryPress('MultiHulls')}>
        <Text style={styles.buttonText}>MultiHulls</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Align content to the top
    paddingTop: 200, // Adjust this value to move buttons down slightly if needed
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  button: {
    backgroundColor: '#37414f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#EAECEC',
    fontSize: 18,
    fontWeight: 'normal',
  },
});

export default SailboatCategoriesScreen;
