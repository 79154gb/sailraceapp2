import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const HomeScreen = ({navigation, route}) => {
  const {userId} = route.params; // Retrieve userId from navigation params
  console.log('User ID in HomeScreen:', userId); // Log user ID

  const navigateToSailboatCategories = () => {
    navigation.navigate('SailboatCategories', {userId});
  };

  const navigateToBoatShed = () => {
    navigation.navigate('YourBoatShedScreen', {userId}); // Updated to navigate to YourBoatShed screen
  };

  const navigateToActivities = () => {
    navigation.navigate('ActivitiesScreen', {userId}); // Navigate to ActivitiesScreen
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#222831', '#37414f']}
        style={styles.background}
      />
      <Image
        source={require('./assets/logo.png')}
        style={styles.logo}
        resizeMode="cover"
      />
      <Text style={styles.welcomeText}>Sail Race Strategy</Text>
      <Text style={styles.subText}>We put the wind in your Sails</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={navigateToSailboatCategories}>
        <Text style={styles.buttonText}>Select A New Boat</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.boatShedButton]}
        onPress={navigateToBoatShed}>
        <Text style={styles.buttonText}>Go To Your Boat Shed</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.activitiesButton]}
        onPress={navigateToActivities}>
        <Text style={styles.buttonText}>Go To Activities</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'cover',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9af4fd',
    marginTop: 20,
  },
  subText: {
    fontSize: 18,
    color: '#9af4fd',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FFAC94',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  boatShedButton: {
    marginTop: 20, // Adjust this value to create space between the buttons
  },
  activitiesButton: {
    marginTop: 20, // Adjust this value to create space between the buttons
  },
  buttonText: {
    color: '#9af4fd',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HomeScreen;
