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
import {
  getUserKeelboatDetails,
  getKeelboatDetails,
  addUserKeelboat,
  updateUserKeelboat,
} from '../api/api';

const KeelboatDetailsScreen = ({route, navigation}) => {
  const {userId, manufacturer, modelName, model_id} = route.params;
  const [keelboatDetails, setKeelboatDetails] = useState({
    manufacturer: '',
    model: '',
    boat_name: '',
    sail_number: '',
    build_year: '',
    length_overall: '',
    maximum_beam: '',
    draft: '',
    displacement: '',
    dlr: '',
    class: '',
    propeller_installation: '',
    propeller_type: '',
    propeller_diameter: '',
    maximum_crew_weight: '',
    minimum_crew_weight: '',
    mainsail_measured: '',
    mainsail_rated: '',
    headsail_luffed_measured: '',
    headsail_luffed_rated: '',
    trysail_area: '',
    storm_jib_area: '',
    heavy_weather_jib_area: '',
    headsails_limit: '',
    spinnakers_limit: '',
  });

  useEffect(() => {
    const fetchKeelboatDetails = async () => {
      try {
        // Attempt to fetch user-specific keelboat details
        const userKeelboatResponse = await getUserKeelboatDetails(
          userId,
          model_id,
        );

        // If user-specific details are found, set them in state; otherwise, fetch defaults
        if (userKeelboatResponse) {
          setKeelboatDetails(userKeelboatResponse.boatDetails);
          console.log(
            'User-specific keelboat details found:',
            userKeelboatResponse.boatDetails,
          );
        } else {
          // If no user-specific details, fetch and set default keelboat details
          const defaultKeelboatResponse = await getKeelboatDetails(
            manufacturer,
            modelName,
          );
          setKeelboatDetails({
            ...defaultKeelboatResponse.boatDetails,
            boat_name: '',
            sail_number: '',
          });
          console.log(
            'Default keelboat details:',
            defaultKeelboatResponse.boatDetails,
          );
        }
      } catch (error) {
        console.error('Error fetching keelboat details:', error);
        Alert.alert('Error', 'Failed to retrieve keelboat details');
      }
    };

    fetchKeelboatDetails();
  }, [userId, model_id, manufacturer, modelName]);

  const handleChange = (key, value) => {
    setKeelboatDetails({...keelboatDetails, [key]: value});
  };

  const handleUpdate = async () => {
    try {
      let userKeelboatDetails = null;
      try {
        // Fetch user-specific keelboat details by userId and model_id
        userKeelboatDetails = await getUserKeelboatDetails(userId, model_id);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(
            'No user-specific keelboat details found; preparing to add new details.',
          );
        } else {
          console.error(
            'Unexpected error fetching user keelboat details:',
            error,
          );
          Alert.alert(
            'Error',
            'Unexpected error fetching user keelboat details',
          );
          return;
        }
      }

      if (userKeelboatDetails) {
        // If details exist, update them
        await updateUserKeelboat(userId, {...keelboatDetails, model_id});
        Alert.alert('Success', 'Keelboat details updated successfully');
      } else {
        // If no details exist, add new entry for user-specific keelboat
        await addUserKeelboat(userId, {...keelboatDetails, model_id});
        Alert.alert('Success', 'Keelboat details added successfully');
      }
    } catch (error) {
      console.error('Failed to update or add keelboat details:', error);
      Alert.alert('Error', 'Failed to save keelboat details');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient
        colors={['#000000', '#000000']}
        style={styles.background}
      />
      <Text style={styles.header}>Keelboat Details</Text>

      {/* Manufacturer */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Manufacturer:</Text>
        <Text style={styles.value}>{keelboatDetails.manufacturer}</Text>
      </View>

      {/* Model */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Model:</Text>
        <Text style={styles.value}>{keelboatDetails.model}</Text>
      </View>

      {/* Boat Name */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Boat Name:</Text>
        <TextInput
          style={styles.input}
          value={keelboatDetails.boat_name}
          onChangeText={text => handleChange('boat_name', text)}
        />
      </View>

      {/* Sail Number */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Sail Number:</Text>
        <TextInput
          style={styles.input}
          value={keelboatDetails.sail_number}
          onChangeText={text => handleChange('sail_number', text)}
        />
      </View>

      {/* Additional Fields */}
      {[
        {label: 'Build Year', key: 'build_year'},
        {label: 'Length Overall', key: 'length_overall'},
        {label: 'Maximum Beam', key: 'maximum_beam'},
        {label: 'Draft', key: 'draft'},
        {label: 'Displacement', key: 'displacement'},
        {label: 'DLR', key: 'dlr'},
        {label: 'Class', key: 'class'},
        {label: 'Propeller Installation', key: 'propeller_installation'},
        {label: 'Propeller Type', key: 'propeller_type'},
        {label: 'Propeller Diameter', key: 'propeller_diameter'},
        {label: 'Maximum Crew Weight', key: 'maximum_crew_weight'},
        {label: 'Minimum Crew Weight', key: 'minimum_crew_weight'},
        {label: 'Mainsail Measured', key: 'mainsail_measured'},
        {label: 'Mainsail Rated', key: 'mainsail_rated'},
        {label: 'Headsail Luffed Measured', key: 'headsail_luffed_measured'},
        {label: 'Headsail Luffed Rated', key: 'headsail_luffed_rated'},
        {label: 'Trysail Area', key: 'trysail_area'},
        {label: 'Storm Jib Area', key: 'storm_jib_area'},
        {label: 'Heavy Weather Jib Area', key: 'heavy_weather_jib_area'},
        {label: 'Headsails Limit', key: 'headsails_limit'},
        {label: 'Spinnakers Limit', key: 'spinnakers_limit'},
      ].map(field => (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.label}>{field.label}:</Text>
          <TextInput
            style={styles.input}
            value={keelboatDetails[field.key]}
            onChangeText={text => handleChange(field.key, text)}
          />
        </View>
      ))}

      {/* Save and Proceed to Polars Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Save Keelboat Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            handleUpdate();
            navigation.navigate('KeelboatPolarsScreen', {
              userId,
              manufacturer: keelboatDetails.manufacturer,
              model: keelboatDetails.model,
              model_id,
            });
          }}>
          <Text style={styles.buttonText}>Proceed to Keelboat Polars</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#37414f',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EAECEC',
    textAlign: 'center',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 10,
    colour: '#37414f',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EAECEC',
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
    backgroundColor: '#37414f',
    color: '#EAECEC',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#37414f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#EAECEC',
    fontSize: 18,
    fontWeight: 'normal',
    textAlign: 'center',
  },
});

export default KeelboatDetailsScreen;
