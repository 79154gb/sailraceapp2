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
  getUserBoatDetails,
  getDinghyDetails,
  addUserBoatDetails,
  updateUserBoatDetails,
} from '../api/api';

const UserBoatDetailsScreen = ({route, navigation}) => {
  const {userId, manufacturer, model, model_id} = route.params;
  const [boatDetails, setBoatDetails] = useState({
    manufacturer: '',
    model_name: '',
    boat_name: '',
    sail_number: '',
    type: '',
    length: '',
    beam: '',
    sail_area_upwind: '',
    gennaker_sail_area: '',
    spinnaker_sail_area: '',
    weight: '',
    type_crew: '',
    crew_weight: '',
    type_purpose: '',
    design_by: '',
    design_year: '',
  });

  useEffect(() => {
    const fetchBoatDetails = async () => {
      try {
        const userBoatDetails = await getUserBoatDetails(
          userId,
          manufacturer,
          model,
        );
        console.log('Fetched userBoatDetails:', userBoatDetails);
        if (userBoatDetails) {
          const stringDetails = Object.fromEntries(
            Object.entries(userBoatDetails).map(([key, value]) => [
              key,
              value !== null && value !== undefined ? String(value) : '',
            ]),
          );
          console.log('Converted stringDetails:', stringDetails);
          setBoatDetails({
            ...stringDetails,
            boat_name: stringDetails.boat_name || '',
            sail_number: stringDetails.sail_number || '',
          });
        } else {
          const dinghyDetails = await getDinghyDetails(manufacturer, model);
          console.log('Fetched dinghyDetails:', dinghyDetails);
          if (dinghyDetails) {
            const stringDetails = Object.fromEntries(
              Object.entries(dinghyDetails).map(([key, value]) => [
                key,
                value !== null && value !== undefined ? String(value) : '',
              ]),
            );
            console.log('Converted stringDetails:', stringDetails);
            setBoatDetails({
              ...stringDetails,
              boat_name: '',
              sail_number: '',
            });
          } else {
            setBoatDetails({
              manufacturer: '',
              model_name: '',
              boat_name: '',
              sail_number: '',
              type: '',
              length: '',
              beam: '',
              sail_area_upwind: '',
              gennaker_sail_area: '',
              spinnaker_sail_area: '',
              weight: '',
              type_crew: '',
              crew_weight: '',
              type_purpose: '',
              design_by: '',
              design_year: '',
            });
          }
        }
      } catch (error) {
        console.log('Error fetching boat details:', error);
      }
    };

    fetchBoatDetails();
  }, [userId, manufacturer, model]);

  const handleChange = (key, value) => {
    console.log(`Changing ${key} to ${value}`);
    setBoatDetails({...boatDetails, [key]: value});
  };

  const handleUpdate = async () => {
    try {
      const userBoatDetails = await getUserBoatDetails(
        userId,
        boatDetails.manufacturer,
        boatDetails.model_name,
      );
      console.log('Fetched userBoatDetails for update:', userBoatDetails);

      if (userBoatDetails) {
        await updateUserBoatDetails(userId, boatDetails);
      } else {
        await addUserBoatDetails(userId, boatDetails);
      }

      Alert.alert('Success', 'Boat details updated successfully');
    } catch (error) {
      console.error('Failed to update boat details:', error);
      Alert.alert('Error', 'Failed to update boat details');
    }
  };

  console.log('Rendering UserBoatDetailsScreen');

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
        <Text style={styles.label}>Your Boat Name:</Text>
        <TextInput
          style={styles.input}
          value={boatDetails.boat_name}
          onChangeText={text => handleChange('boat_name', text)}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Sail Number:</Text>
        <TextInput
          style={styles.input}
          value={boatDetails.sail_number}
          onChangeText={text => handleChange('sail_number', text)}
        />
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
            handleUpdate();
            navigation.navigate('BoatPolarsScreen', {
              userId,
              manufacturer,
              model,
              model_id,
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
