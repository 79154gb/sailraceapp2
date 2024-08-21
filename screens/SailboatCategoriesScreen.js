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
        onPress={() => handleCategoryPress('KeelBoats')}>
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
    justifyContent: 'center',
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
  },
  buttonText: {
    color: '#9af4fd',
    fontSize: 18,
    fontWeight: 'normal',
  },
});

export default SailboatCategoriesScreen;
