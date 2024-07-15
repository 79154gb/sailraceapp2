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
import {getBoatPolars, updateBoatPolars} from './api'; // Ensure the path is correct

const BoatPolarsScreen = ({route, navigation}) => {
  const {userId, manufacturer, model} = route.params; // Retrieve userId, manufacturer, and model from navigation params
  const [polars, setPolars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolars = async () => {
      try {
        const data = await getBoatPolars(manufacturer, model);
        setPolars(data);
        setLoading(false);
      } catch (error) {
        console.log('Error fetching boat polars:', error);
        setLoading(false);
      }
    };

    fetchPolars();
  }, [manufacturer, model]);

  const handleChange = (index, key, value) => {
    const updatedPolars = [...polars];
    updatedPolars[index][key] = value;
    setPolars(updatedPolars);
  };

  const handleUpdate = async () => {
    try {
      for (const polar of polars) {
        await updateBoatPolars(polar);
      }
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
      {polars.map((polar, index) => (
        <View key={index} style={styles.polarContainer}>
          <Text style={styles.label}>Wind Speed:</Text>
          <TextInput
            style={styles.input}
            value={polar.wind_speed}
            onChangeText={text => handleChange(index, 'wind_speed', text)}
          />

          <Text style={styles.label}>Angle:</Text>
          <TextInput
            style={styles.input}
            value={polar.angle}
            onChangeText={text => handleChange(index, 'angle', text)}
          />
          <Text style={styles.label}>Speed:</Text>
          <TextInput
            style={styles.input}
            value={polar.speed}
            onChangeText={text => handleChange(index, 'speed', text)}
          />
        </View>
      ))}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Save Boat Polars</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('RaceOverview')}>
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
  polarContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9af4fd',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#FFAC94',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#9af4fd',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BoatPolarsScreen;
