import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {getUserBoatDetails, updateUserBoatDetails} from './api'; // Ensure the path is correct

const UserBoatDetailsScreen = ({route, navigation}) => {
  const {userId, manufacturer, model, modelId} = route.params; // Retrieve userId, manufacturer, model, and modelId from navigation params
  console.log('Received modelId in UserBoatDetailsScreen:', modelId); // Log received modelId
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
      <LinearGradient
        colors={['#222831', '#37414f']}
        style={styles.background}
      />
      <Text style={styles.header}>Boat Details</Text>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Manufacturer:</Text>
        <Text style={styles.value}>{boatDetails.manufacturer}</Text>
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Model:</Text>
        <Text style={styles.value}>{boatDetails.model_name}</Text>
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Type:</Text>
        <TextInput
          style={styles.input}
          value={boatDetails.type}
          onChangeText={text => handleChange('type', text)}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Length:</Text>
        <TextInput
          style={styles.input}
          value={boatDetails.length}
          onChangeText={text => handleChange('length', text)}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Beam:</Text>
        <TextInput
          style={styles.input}
          value={boatDetails.beam}
          onChangeText={text => handleChange('beam', text)}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Sail Area Upwind:</Text>
        <TextInput
          style={styles.input}
          value={boatDetails.sail_area_upwind}
          onChangeText={text => handleChange('sail_area_upwind', text)}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Gennaker Sail Area:</Text>
        <TextInput
          style={styles.input}
          value={boatDetails.gennaker_sail_area}
          onChangeText={text => handleChange('gennaker_sail_area', text)}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Spinnaker Sail Area:</Text>
        <TextInput
          style={styles.input}
          value={boatDetails.spinnaker_sail_area}
          onChangeText={text => handleChange('spinnaker_sail_area', text)}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Weight:</Text>
        <TextInput
          style={styles.input}
          value={boatDetails.weight}
          onChangeText={text => handleChange('weight', text)}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Type Crew:</Text>
        <TextInput
          style={styles.input}
          value={boatDetails.type_crew}
          onChangeText={text => handleChange('type_crew', text)}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Crew Weight:</Text>
        <TextInput
          style={styles.input}
          value={boatDetails.crew_weight}
          onChangeText={text => handleChange('crew_weight', text)}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Type Purpose:</Text>
        <TextInput
          style={styles.input}
          value={boatDetails.type_purpose}
          onChangeText={text => handleChange('type_purpose', text)}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Design By:</Text>
        <TextInput
          style={styles.input}
          value={boatDetails.design_by}
          onChangeText={text => handleChange('design_by', text)}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Design Year:</Text>
        <TextInput
          style={styles.input}
          value={boatDetails.design_year}
          onChangeText={text => handleChange('design_year', text)}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Save Boat Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.log('Passing modelId to BoatPolarsScreen:', modelId); // Log passing modelId
            navigation.navigate('BoatPolars', {
              userId,
              manufacturer,
              model,
              modelId,
            });
          }}>
          <Text style={styles.buttonText}>Proceed to Boat Polars</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#222831',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9af4fd',
    textAlign: 'center',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9af4fd',
  },
  value: {
    fontSize: 16,
    color: '#FFAC94',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: '#FFF',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#FFAC94',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#9af4fd',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default UserBoatDetailsScreen;
