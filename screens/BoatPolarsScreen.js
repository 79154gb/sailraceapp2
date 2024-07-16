import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Orientation from 'react-native-orientation-locker'; // Import the library
import {getBoatPolars, getUserBoatPolars, updateUserBoatPolars} from './api'; // Ensure the path is correct

const BoatPolarsScreen = ({route, navigation}) => {
  const {userId, manufacturer, model, modelId} = route.params; // Retrieve userId, manufacturer, model, and modelId from navigation params
  const [polars, setPolars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Orientation.lockToLandscape(); // Lock the screen to landscape mode

    const fetchPolars = async () => {
      try {
        let data = await getUserBoatPolars(userId, manufacturer, model);
        if (!data || data.length === 0) {
          data = await getBoatPolars(manufacturer, model);
        }
        if (!data || data.length === 0) {
          // If no data is found, initialize an empty table with empty strings
          data = [
            {label: 'Wind Speed', values: ['', '', '', '', '', '', '']},
            {label: 'Beat Angle', values: ['', '', '', '', '', '', '']},
            {label: 'Beat VMG', values: ['', '', '', '', '', '', '']},
            {label: '52', values: ['', '', '', '', '', '', '']},
            {label: '60', values: ['', '', '', '', '', '', '']},
            {label: '70', values: ['', '', '', '', '', '', '']},
            {label: '75', values: ['', '', '', '', '', '', '']},
            {label: '80', values: ['', '', '', '', '', '', '']},
            {label: '90', values: ['', '', '', '', '', '', '']},
            {label: '110', values: ['', '', '', '', '', '', '']},
            {label: '120', values: ['', '', '', '', '', '', '']},
            {label: '135', values: ['', '', '', '', '', '', '']},
            {label: '150', values: ['', '', '', '', '', '', '']},
            {label: '165', values: ['', '', '', '', '', '', '']},
            {label: '180', values: ['', '', '', '', '', '', '']},
            {label: 'Run Angle', values: ['', '', '', '', '', '', '']},
            {label: 'Run VMG', values: ['', '', '', '', '', '', '']},
          ];
        }
        setPolars(data);
        setLoading(false);
      } catch (error) {
        console.log('Error fetching boat polars:', error);
        setLoading(false);
      }
    };

    fetchPolars();

    return () => {
      Orientation.unlockAllOrientations(); // Unlock the orientation when the component unmounts
    };
  }, [manufacturer, model, userId]); // Dependencies array

  const handleChange = (rowIndex, colIndex, value) => {
    const updatedPolars = [...polars];
    updatedPolars[rowIndex].values[colIndex] = value;
    setPolars(updatedPolars);
  };

  const handleUpdate = async () => {
    try {
      const formattedPolars = polars.map(polar => ({
        label: polar.label,
        manufacturer,
        model_name: model,
        model_id: modelId,
        user_id: userId,
        values: polar.values.map(value =>
          value === '' ? null : parseFloat(value),
        ), // Convert empty strings to null and ensure numbers
      }));

      await updateUserBoatPolars(userId, formattedPolars);
      Alert.alert('Success', 'Boat polars updated successfully');
    } catch (error) {
      console.error('Failed to update boat polars:', error);
      Alert.alert('Error', 'Failed to update boat polars');
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
      <Text style={styles.header}>Boat Polars</Text>
      <View style={styles.table}>
        {polars.map((polar, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            <Text style={styles.label}>{polar.label}</Text>
            {polar.values.map((value, colIndex) => (
              <TextInput
                key={colIndex}
                style={styles.input}
                value={value === null ? '' : value.toString()}
                onChangeText={text => handleChange(rowIndex, colIndex, text)}
                keyboardType="numeric" // Ensure numeric keyboard
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Save Boat Polars</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('RaceOverview', {userId, manufacturer, model})
          }>
          <Text style={styles.buttonText}>Proceed to Race Overview</Text>
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
  table: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#FFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  label: {
    flex: 1,
    padding: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    backgroundColor: '#FFF',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#FFAC94',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#9af4fd',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default BoatPolarsScreen;
