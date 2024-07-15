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
      <Button title="Save Boat Polars" onPress={handleUpdate} />
      <Button
        title="Proceed to Race Overview"
        onPress={() => navigation.navigate('RaceOverview')}
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
  polarContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default BoatPolarsScreen;
