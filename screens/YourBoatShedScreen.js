import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {getUserBoats, deleteUserBoat} from '../api/api'; // Import the API function to get user boats

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

  const handleSelectBoat = (manufacturer, model, model_id) => {
    navigation.navigate('UserBoatDetailsScreen', {
      userId,
      manufacturer,
      model,
      model_id,
    });
  };

  const handleDeleteBoat = async (manufacturer, model) => {
    Alert.alert(
      'Delete Boat',
      'Are you sure you want to delete this boat?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await deleteUserBoat(userId, manufacturer, model);
              setBoats(
                boats.filter(
                  boat =>
                    boat.manufacturer !== manufacturer ||
                    boat.model_name !== model,
                ),
              );
              Alert.alert('Success', 'Boat deleted successfully');
            } catch (error) {
              console.error('Failed to delete boat:', error);
              Alert.alert('Error', 'Failed to delete boat');
            }
          },
        },
      ],
      {cancelable: true},
    );
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
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={
                () =>
                  handleSelectBoat(
                    boat.manufacturer,
                    boat.model_name,
                    boat.model_id,
                  ) // Pass modelId
              }>
              <Text style={styles.buttonText}>Select</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() =>
                handleDeleteBoat(boat.manufacturer, boat.model_name)
              }>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#000000',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectButton: {
    backgroundColor: '#FFAC94',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#FFAC94',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#222831',
    fontWeight: 'bold',
  },
});

export default YourBoatShedScreen;
