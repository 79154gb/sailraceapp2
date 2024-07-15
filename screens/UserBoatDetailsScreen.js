import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Button,
  Alert,
} from 'react-native';
import {getUserBoatDetails, updateUserBoatDetails} from './api'; // Ensure the path is correct

const UserBoatDetailsScreen = ({route, navigation}) => {
  const {userId, manufacturer, model} = route.params; // Retrieve userId, manufacturer, and model from navigation params
  const [boatDetails, setBoatDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoatDetails = async () => {
      try {
        const details = await getUserBoatDetails(userId, manufacturer, model);
        console.log('Fetched boat details:', details); // Log fetched details

        if (details) {
          // Convert all values to strings
          const stringDetails = Object.fromEntries(
            Object.entries(details).map(([key, value]) => [
              key,
              value !== null && value !== undefined ? String(value) : '',
            ]),
          );
          setBoatDetails(stringDetails);
        } else {
          // If the selected boat details are not found, show a default message or handle it as needed
          setBoatDetails({});
        }

        setLoading(false);
      } catch (error) {
        console.log('Error fetching boat details:', error);
        setLoading(false);
      }
    };

    fetchBoatDetails();
  }, [userId, manufacturer, model]);

  const handleChange = (key, value) => {
    setBoatDetails({...boatDetails, [key]: value});
  };

  const handleUpdate = async () => {
    try {
      await updateUserBoatDetails(userId, boatDetails);
      Alert.alert('Success', 'Boat details updated successfully');
    } catch (error) {
      console.error('Failed to update boat details:', error);
      Alert.alert('Error', 'Failed to update boat details');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Manufacturer:</Text>
      <Text style={styles.value}>{boatDetails.manufacturer}</Text>

      <Text style={styles.label}>Model:</Text>
      <Text style={styles.value}>{boatDetails.model_name}</Text>

      <Text style={styles.label}>Type:</Text>
      <TextInput
        style={styles.input}
        value={boatDetails.type}
        onChangeText={text => handleChange('type', text)}
      />

      <Text style={styles.label}>Length:</Text>
      <TextInput
        style={styles.input}
        value={boatDetails.length}
        onChangeText={text => handleChange('length', text)}
      />

      <Text style={styles.label}>Beam:</Text>
      <TextInput
        style={styles.input}
        value={boatDetails.beam}
        onChangeText={text => handleChange('beam', text)}
      />

      <Text style={styles.label}>Sail Area Upwind:</Text>
      <TextInput
        style={styles.input}
        value={boatDetails.sail_area_upwind}
        onChangeText={text => handleChange('sail_area_upwind', text)}
      />

      <Text style={styles.label}>Gennaker Sail Area:</Text>
      <TextInput
        style={styles.input}
        value={boatDetails.gennaker_sail_area}
        onChangeText={text => handleChange('gennaker_sail_area', text)}
      />

      <Text style={styles.label}>Spinnaker Sail Area:</Text>
      <TextInput
        style={styles.input}
        value={boatDetails.spinnaker_sail_area}
        onChangeText={text => handleChange('spinnaker_sail_area', text)}
      />

      <Text style={styles.label}>Weight:</Text>
      <TextInput
        style={styles.input}
        value={boatDetails.weight}
        onChangeText={text => handleChange('weight', text)}
      />

      <Text style={styles.label}>Type Crew:</Text>
      <TextInput
        style={styles.input}
        value={boatDetails.type_crew}
        onChangeText={text => handleChange('type_crew', text)}
      />

      <Text style={styles.label}>Crew Weight:</Text>
      <TextInput
        style={styles.input}
        value={boatDetails.crew_weight}
        onChangeText={text => handleChange('crew_weight', text)}
      />

      <Text style={styles.label}>Type Purpose:</Text>
      <TextInput
        style={styles.input}
        value={boatDetails.type_purpose}
        onChangeText={text => handleChange('type_purpose', text)}
      />

      <Text style={styles.label}>Design By:</Text>
      <TextInput
        style={styles.input}
        value={boatDetails.design_by}
        onChangeText={text => handleChange('design_by', text)}
      />

      <Text style={styles.label}>Design Year:</Text>
      <TextInput
        style={styles.input}
        value={boatDetails.design_year}
        onChangeText={text => handleChange('design_year', text)}
      />

      <Button title="Save Boat Details" onPress={handleUpdate} />
      <Button
        title="Proceed to Boat Polars"
        onPress={() =>
          navigation.navigate('BoatPolars', {userId, manufacturer, model})
        }
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default UserBoatDetailsScreen;
