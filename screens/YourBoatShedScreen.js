import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {getUserBoats, getUserKeelBoats, deleteUserBoat} from '../api/api';

const YourBoatShedScreen = ({route, navigation}) => {
  const {userId} = route.params;
  const [boats, setBoats] = useState([]);

  useEffect(() => {
    const fetchBoats = async () => {
      try {
        const userBoats = await getUserBoats(userId);
        const userKeelBoats = await getUserKeelBoats(userId);

        // Normalize data structure and add a flag for keelboats
        const keelboatsWithFlag = userKeelBoats.map(boat => ({
          ...boat,
          model_name: boat.model_name || boat.model, // Use model if model_name is missing
          isKeelboat: true,
        }));

        setBoats([...userBoats, ...keelboatsWithFlag]);
      } catch (error) {
        console.error('Failed to fetch user boats:', error);
      }
    };

    fetchBoats();
  }, [userId]);

  const handleSelectBoat = (manufacturer, model_name, model_id, isKeelboat) => {
    const screen = isKeelboat
      ? 'KeelboatDetailsScreen'
      : 'UserBoatDetailsScreen';
    navigation.navigate(screen, {
      userId,
      manufacturer,
      model: model_name,
      model_id,
    });
  };

  const handleDeleteBoat = async (manufacturer, model_name, isKeelboat) => {
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
              await deleteUserBoat(
                userId,
                manufacturer,
                model_name,
                isKeelboat,
              );
              setBoats(
                boats.filter(
                  boat =>
                    boat.manufacturer !== manufacturer ||
                    (boat.model_name || boat.model) !== model_name,
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
              onPress={() =>
                handleSelectBoat(
                  boat.manufacturer,
                  boat.model_name,
                  boat.model_id,
                  boat.isKeelboat || false,
                )
              }>
              <Text style={styles.buttonText}>Select</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() =>
                handleDeleteBoat(
                  boat.manufacturer,
                  boat.model_name,
                  boat.isKeelboat || false,
                )
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
    color: '#EAECEC',
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
    color: '#EAECEC',
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
