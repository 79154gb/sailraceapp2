import React, {useState, useEffect, useRef} from 'react';
import {View, Text, Button, StyleSheet, Dimensions, Alert} from 'react-native';
import MapView, {Polyline} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import haversine from 'haversine';
import {saveRecordedActivity} from '../api/api';

const RecordActivityScreen = ({route, navigation}) => {
  const {userId} = route.params;
  const mapRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [coordinates, setCoordinates] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [timer, setTimer] = useState(0);
  const [paused, setPaused] = useState(false);
  const watchId = useRef(null);

  useEffect(() => {
    let interval;

    if (recording && !paused) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else if ((!recording || paused) && timer !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [recording, paused, timer]);

  const startRecording = () => {
    setRecording(true);
    setCoordinates([]);
    setStartTime(new Date());
    setDistance(0);
    setSpeed(0);
    setTimer(0);
    setPaused(false);

    watchId.current = Geolocation.watchPosition(
      position => {
        const {latitude, longitude, speed} = position.coords;
        const newCoordinate = {latitude, longitude};

        setCoordinates(prevCoordinates => {
          if (prevCoordinates.length > 0) {
            const lastCoordinate = prevCoordinates[prevCoordinates.length - 1];
            setDistance(
              prevDistance =>
                prevDistance + haversine(lastCoordinate, newCoordinate) / 1000,
            ); // convert to kilometers
          }
          return [...prevCoordinates, newCoordinate];
        });

        setSpeed(speed * 1.94384); // convert m/s to knots
      },
      error => console.log(error),
      {
        enableHighAccuracy: true,
        distanceFilter: 1,
        interval: 1000,
        fastestInterval: 1000,
      },
    );
  };

  const stopRecording = () => {
    setPaused(true);
    Geolocation.clearWatch(watchId.current);
  };

  const resumeRecording = () => {
    setPaused(false);
    watchId.current = Geolocation.watchPosition(
      position => {
        const {latitude, longitude, speed} = position.coords;
        const newCoordinate = {latitude, longitude};

        setCoordinates(prevCoordinates => {
          if (prevCoordinates.length > 0) {
            const lastCoordinate = prevCoordinates[prevCoordinates.length - 1];
            setDistance(
              prevDistance =>
                prevDistance + haversine(lastCoordinate, newCoordinate) / 1000,
            ); // convert to kilometers
          }
          return [...prevCoordinates, newCoordinate];
        });

        setSpeed(speed * 1.94384); // convert m/s to knots
      },
      error => console.log(error),
      {
        enableHighAccuracy: true,
        distanceFilter: 1,
        interval: 1000,
        fastestInterval: 1000,
      },
    );
  };

  const saveActivity = async () => {
    try {
      await saveRecordedActivity(userId, {
        name: 'Recorded Activity',
        trackPoints: coordinates,
        date: startTime,
        totalDistanceNm: distance * 0.539957, // Convert km to nautical miles
        totalDuration: timer,
        averageSpeed: (distance * 0.539957) / (timer / 3600), // speed in knots (nautical miles per hour)
      });

      Alert.alert('Success', 'Activity saved successfully!');
      navigation.navigate('ActivitiesScreen', {userId});
    } catch (error) {
      console.error('Failed to save activity:', error);
      Alert.alert('Error', 'Failed to save activity');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: coordinates.length ? coordinates[0].latitude : 37.78825,
          longitude: coordinates.length ? coordinates[0].longitude : -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}>
        <Polyline
          coordinates={coordinates}
          strokeWidth={2}
          strokeColor="blue"
        />
      </MapView>
      <View style={styles.statsContainer}>
        <Text style={styles.stat}>Speed: {speed.toFixed(2)} knots</Text>
        <Text style={styles.stat}>
          Distance: {(distance * 0.539957).toFixed(2)} NM
        </Text>
        <Text style={styles.stat}>
          Time: {new Date(timer * 1000).toISOString().substr(11, 8)}
        </Text>
      </View>
      {recording && !paused ? (
        <Button title="Stop" onPress={stopRecording} color="#FFAC94" />
      ) : (
        recording && (
          <View style={styles.actionButtons}>
            <Button title="Resume" onPress={resumeRecording} color="#FFAC94" />
            <Button title="Save" onPress={saveActivity} color="#FFAC94" />
          </View>
        )
      )}
      {!recording && !paused && (
        <Button title="Start" onPress={startRecording} color="#FFAC94" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 200,
  },
  statsContainer: {
    padding: 20,
    backgroundColor: '#37414f',
  },
  stat: {
    color: '#9af4fd',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
});

export default RecordActivityScreen;
