import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import Slider from '@react-native-community/slider';

const RaceSetupScreen = ({navigation}) => {
  const [raceStartTime, setRaceStartTime] = useState('');
  const [windSpeed, setWindSpeed] = useState(0);
  const [windDirection, setWindDirection] = useState(0);
  const [tideSpeed, setTideSpeed] = useState(0);
  const [tideDirection, setTideDirection] = useState(0);
  const [nextTime, setNextTime] = useState('');
  const [hourInterval, setHourInterval] = useState(1);

  const handleAddData = () => {
    // Ensure raceStartTime is properly set
    if (!raceStartTime || !/^\d{2}:\d{2}$/.test(raceStartTime)) {
      alert('Please enter the race start time in the format HH:MM');
      return;
    }

    // Increment race start time by 1 hour
    const [hours, minutes] = raceStartTime.split(':').map(Number);
    const nextHour = hours + hourInterval;
    const nextTimes = `${nextHour < 10 ? '0' : ''}${nextHour}:${
      minutes < 10 ? '0' : ''
    }${minutes}`;
    setNextTime(nextTimes);
    setHourInterval(hourInterval + 1); // Increment hour interval for next time

    // Reset slider values
    setWindSpeed(0);
    setWindDirection(0);
    setTideSpeed(0);
    setTideDirection(0);
  };

  const handleStartRace = () => {
    console.log('Race start time:', raceStartTime); // Log the race start time
    console.log(
      'Wind Speed, Wind Direction, Tide Speed, Tide Direction:',
      raceStartTime,
      windSpeed,
      windDirection,
      tideSpeed,
      tideDirection,
    );
    navigation.navigate('RaceCourse', {
      raceStartTime,
      windSpeed,
      windDirection,
      tideSpeed,
      tideDirection,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Race Setup</Text>
      <TextInput
        style={styles.input}
        placeholder="Race Start Time (HH:MM)"
        value={raceStartTime}
        onChangeText={setRaceStartTime}
      />
      <Text style={styles.label}>Wind Speed: {windSpeed.toFixed(2)} knots</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={50}
        value={windSpeed}
        onValueChange={setWindSpeed}
      />
      <Text style={styles.label}>
        Wind Direction: {windDirection.toFixed(2)}°
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={360}
        value={windDirection}
        onValueChange={setWindDirection}
      />
      <Text style={styles.label}>Tide Speed: {tideSpeed.toFixed(2)} knots</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={10}
        value={tideSpeed}
        onValueChange={setTideSpeed}
      />
      <Text style={styles.label}>
        Tide Direction: {tideDirection.toFixed(2)}°
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={360}
        value={tideDirection}
        onValueChange={setTideDirection}
      />
      <TouchableOpacity style={styles.button} onPress={handleAddData}>
        <Text style={styles.buttonText}>Add Data</Text>
      </TouchableOpacity>
      <Text style={styles.nextTimeLabel}>Next Time: {nextTime}</Text>
      <TouchableOpacity style={styles.button} onPress={handleStartRace}>
        <Text style={styles.buttonText}>Select Course</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222831',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9af4fd',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFAC94',
    width: '80%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 18,
  },
  label: {
    fontSize: 18,
    color: '#9af4fd',
    marginBottom: 10,
  },
  slider: {
    width: '80%',
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextTimeLabel: {
    color: '#9af4fd',
    fontSize: 18,
  },
});

export default RaceSetupScreen;
