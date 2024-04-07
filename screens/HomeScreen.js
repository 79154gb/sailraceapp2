import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const HomeScreen = ({navigation}) => {
  const navigateToSailboatCategories = () => {
    navigation.navigate('SailboatCategories');
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
        <Text style={styles.buttonText}>Select Your Boat</Text>
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
  logo: {
    width: 500,
    height: 500,
    position: 'absolute',
    top: 170,
    resizeMode: 'cover',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9af4fd',
    position: 'absolute',
    top: 30,
  },
  subText: {
    fontSize: 18,
    color: '#9af4fd',
    position: 'absolute',
    top: 70,
  },
  button: {
    backgroundColor: '#FFAC94',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    position: 'absolute',
    top: 150,
  },
  buttonText: {
    color: '#9af4fd',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
