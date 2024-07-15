import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {getUserBoats} from './api'; // Import the API function to get user boats

const YourBoatShedScreen = ({route, navigation}) => {
  const {userId} = route.params; // Retrieve userId from navigation params
  const [boats, setBoats] = useState([]);

  useEffect(() => {
    const fetchBoats = async () => {
      try {
        const userBoats = await getUserBoats(userId);
        setBoats(userBoats);
      } catch (error) {
        console.error('Failed to fetch user boats:', error);
      }
    };

    fetchBoats();
  }, [userId]);

  const handleSelectBoat = (manufacturer, model) => {
    navigation.navigate('UserBoatDetails', {
      userId,
      manufacturer,
      model,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Select your boat for the race</Text>
      {boats.map((boat, index) => (
        <View key={index} style={styles.boatContainer}>
          <View style={styles.boatDetails}>
            <Text style={styles.boatText}>{boat.manufacturer}</Text>
            <Text style={styles.boatText}>{boat.model_name}</Text>
          </View>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() =>
              handleSelectBoat(boat.manufacturer, boat.model_name)
            }>
            <Text style={styles.buttonText}>Select</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#222831',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9af4fd',
    marginBottom: 20,
    textAlign: 'center',
  },
  boatContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#37414f',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  boatDetails: {
    flex: 1,
  },
  boatText: {
    color: '#9af4fd',
    fontSize: 16,
  },
  selectButton: {
    backgroundColor: '#FFAC94',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#222831',
    fontWeight: 'bold',
  },
});

export default YourBoatShedScreen;
