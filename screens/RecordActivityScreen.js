import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Dimensions, Alert} from 'react-native';
import MapView, {Polyline, Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import haversine from 'haversine';
import {saveRecordedActivity} from '../api/api';
import {Button, FAB} from 'react-native-paper'; // Import from React Native Paper

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
  const [currentLocation, setCurrentLocation] = useState(null); // State to track current location
  const watchId = useRef(null);

  useEffect(() => {
    let interval;
    let startTimestamp;

    if (recording && !paused) {
      startTimestamp = Date.now() - timer * 1000;
      const updateTimer = () => {
        setTimer(Math.floor((Date.now() - startTimestamp) / 1000));
        interval = requestAnimationFrame(updateTimer);
      };
      interval = requestAnimationFrame(updateTimer);
    } else if ((!recording || paused) && timer !== 0) {
      cancelAnimationFrame(interval);
    }

    return () => cancelAnimationFrame(interval);
  }, [recording, paused, timer]);

  // Fetch the user's current location on component mount
  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setCurrentLocation({latitude, longitude});
        // Set initial region of the map to the user's current location
        mapRef.current.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000,
        );
      },
      error => console.log(error),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }, []);

  const startLocationTracking = () => {
    watchId.current = Geolocation.watchPosition(
      position => {
        const {latitude, longitude, speed} = position.coords;
        const newCoordinate = {latitude, longitude};

        setCoordinates(prevCoordinates => {
          if (prevCoordinates.length > 0) {
            const lastCoordinate = prevCoordinates[prevCoordinates.length - 1];
            setDistance(
              prevDistance =>
                prevDistance + haversine(lastCoordinate, newCoordinate) / 1000, // convert to kilometers
            );
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

  const startRecording = () => {
    setRecording(true);
    setCoordinates([]);
    setStartTime(new Date());
    setDistance(0);
    setSpeed(0);
    setTimer(0);
    setPaused(false);

    startLocationTracking(); // Start tracking location
  };

  const stopRecording = () => {
    setPaused(true);
    Geolocation.clearWatch(watchId.current);
  };

  const resumeRecording = () => {
    setPaused(false);
    startLocationTracking(); // Resume tracking location
  };

  const saveActivity = async () => {
    try {
      const activityData = {
        name: 'Recorded Activity',
        trackPoints: coordinates,
        date: startTime,
        totalDistanceNm: distance * 0.539957, // Convert km to nautical miles
        totalDuration: timer,
        averageSpeed: (distance * 0.539957) / (timer / 3600), // speed in knots (nautical miles per hour)
      };
      // eslint-disable-next-line no-trailing-spaces

      await saveRecordedActivity(userId, activityData);

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
          latitude: currentLocation ? currentLocation.latitude : 37.78825,
          longitude: currentLocation ? currentLocation.longitude : -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}>
        <Polyline
          coordinates={coordinates}
          strokeWidth={2}
          strokeColor="#FFAC94" // Updated color to match theme
        />
        {/* Optional: Add marker for current location */}
        {currentLocation && (
          <Marker coordinate={currentLocation} title="Your Location" />
        )}
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
        <Button mode="contained" onPress={stopRecording} style={styles.button}>
          Stop
        </Button>
      ) : (
        recording && (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={resumeRecording}
              style={styles.button}>
              Resume
            </Button>
            <Button
              mode="contained"
              onPress={saveActivity}
              style={styles.button}>
              Save
            </Button>
          </View>
        )
      )}
      {!recording && !paused && (
        <Button mode="contained" onPress={startRecording} style={styles.button}>
          Start
        </Button>
      )}

      {/* Recording Indicator */}
      {recording && (
        <FAB style={styles.fab} small icon="record" color="red" animated />
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
    backgroundColor: '#37414f', // Ensure this matches your app's theme
  },
  stat: {
    color: '#9af4fd', // Ensure this matches your app's theme
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  button: {
    marginVertical: 10, // Adjust margin for better spacing
    backgroundColor: '#FFAC94', // Updated color to match theme
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFAC94', // Updated color to match theme
  },
});

export default RecordActivityScreen;
