import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Button,
} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import Icon from 'react-native-vector-icons/Entypo';
import Icon1 from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import Geolocation from '@react-native-community/geolocation';
import mockWindData from './mockWindData.json'; // Import mock data

const markerTypes = [
  {label: 'Start Mark 1', value: 'start1', color: 'blue'},
  {label: 'Start Mark 2', value: 'start2', color: 'cyan'},
  {label: 'Windward Mark', value: 'windward', color: 'red'},
  {label: 'Leeward Mark', value: 'leeward', color: 'green'},
  {label: 'Reach Mark', value: 'reach', color: 'yellow'},
];

const samplePolars = [
  {angle: 30, speed: 6},
  {angle: 60, speed: 6},
  {angle: 90, speed: 8},
  {angle: 120, speed: 7},
  {angle: 150, speed: 7},
  {angle: 180, speed: 5},
];

const getSpeedFromPolars = angle => {
  for (let i = 0; i < samplePolars.length - 1; i++) {
    if (angle >= samplePolars[i].angle && angle <= samplePolars[i + 1].angle) {
      return samplePolars[i].speed;
    }
  }
  return 5; // Default speed for angles not covered in the sample polars
};

const RaceOverviewScreen = () => {
  const [markers, setMarkers] = useState([]);
  const [selectedMarkerType, setSelectedMarkerType] = useState(null);
  const [windArrows, setWindArrows] = useState([]);
  const [windInfo, setWindInfo] = useState({speed: null, direction: null});
  const [tideInfo, setTideInfo] = useState({speed: null, direction: null});
  const [centerCoordinate, setCenterCoordinate] = useState({
    latitude: null,
    longitude: null,
  });
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [visibleRegion, setVisibleRegion] = useState(null);
  const [isInfoTableMinimized, setIsInfoTableMinimized] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(1);
  const [timer, setTimer] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [startLine, setStartLine] = useState({marker1: null, marker2: null});
  const [sequenceOfMarks, setSequenceOfMarks] = useState([]);
  const [boatPosition, setBoatPosition] = useState(null);
  const [boatHeading, setBoatHeading] = useState(0);
  const [boatTrail, setBoatTrail] = useState([]);
  const [boatSpeed, setBoatSpeed] = useState(5); // Assume constant speed for simplicity
  const [simulationRunning, setSimulationRunning] = useState(false);
  const mapRef = useRef(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [selectingStartLine, setSelectingStartLine] = useState(false);
  const [selectingSequence, setSelectingSequence] = useState(false);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setInitialRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setVisibleRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setBoatPosition({latitude, longitude}); // Initialize boat position
      },
      error => {
        console.error('Error getting current location:', error);
        setInitialRegion({
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setVisibleRegion({
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setBoatPosition({
          latitude: 37.78825,
          longitude: -122.4324,
        }); // Fallback boat position
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
      },
    );
  }, []);

  const fetchWindData = async () => {
    if (!visibleRegion) {
      return;
    }

    const data = mockWindData.days[0].hours;
    const gridSize = 8; // Increased grid size for more arrows
    const {latitude, longitude, latitudeDelta, longitudeDelta} = visibleRegion;

    const latStep = latitudeDelta / gridSize;
    const longStep = longitudeDelta / gridSize;
    const gridPoints = [];
    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        const lat = latitude - latitudeDelta / 2 + latStep * i;
        const long = longitude - longitudeDelta / 2 + longStep * j;
        gridPoints.push({latitude: lat, longitude: long});
      }
    }

    const arrows = gridPoints.map(point => ({
      latitude: point.latitude,
      longitude: point.longitude,
      windDirection: null,
    }));

    gridPoints.forEach((point, index) => {
      const currentHour = new Date(time).getHours();
      let currentHourData = data.find(
        hour => new Date(hour.datetime).getHours() === currentHour,
      );

      if (!currentHourData) {
        currentHourData = data.reduce((prev, curr) => {
          return Math.abs(new Date(curr.datetime).getHours() - currentHour) <
            Math.abs(new Date(prev.datetime).getHours() - currentHour)
            ? curr
            : prev;
        }, data[0]);
      }

      if (currentHourData) {
        arrows[index].windDirection = currentHourData.winddir;
      }
    });

    setWindArrows(arrows);

    const centerLatitude = latitude;
    const centerLongitude = longitude;
    let centerData = data.find(
      hour => new Date(hour.datetime).getHours() === new Date(time).getHours(),
    );

    if (!centerData) {
      centerData = data.reduce((prev, curr) => {
        return Math.abs(
          new Date(curr.datetime).getHours() - new Date(time).getHours(),
        ) <
          Math.abs(
            new Date(prev.datetime).getHours() - new Date(time).getHours(),
          )
          ? curr
          : prev;
      }, data[0]);
    }

    if (centerData) {
      setWindInfo({
        speed: centerData.windspeed,
        direction: centerData.winddir,
      });
      setTideInfo({
        speed: centerData.tideSpeed,
        direction: centerData.tideDir,
      });
    }
    setCenterCoordinate({latitude: centerLatitude, longitude: centerLongitude});
  };

  useEffect(() => {
    fetchWindData();
  }, [visibleRegion, date, time]);

  const formatDate = formattedDate => {
    const year = formattedDate.getFullYear();
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = formattedDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleMapPress = event => {
    if (selectedMarkerType) {
      const newMarker = {
        coordinate: event.nativeEvent.coordinate,
        key: `${markers.length}`,
        type: selectedMarkerType,
        color: selectedMarkerType.color,
      };
      setMarkers([...markers, newMarker]);
      console.log(
        `Marker set: ${selectedMarkerType.label}, Latitude: ${newMarker.coordinate.latitude}, Longitude: ${newMarker.coordinate.longitude}`,
      );
      setSelectedMarkerType(null);
    } else if (selectingStartLine) {
      if (!startLine.marker1) {
        setStartLine({...startLine, marker1: event.nativeEvent.coordinate});
        console.log(
          `Start line marker 1 set: Latitude: ${event.nativeEvent.coordinate.latitude}, Longitude: ${event.nativeEvent.coordinate.longitude}`,
        );
      } else {
        setStartLine({...startLine, marker2: event.nativeEvent.coordinate});
        setSelectingStartLine(false);
        console.log(
          `Start line marker 2 set: Latitude: ${event.nativeEvent.coordinate.latitude}, Longitude: ${event.nativeEvent.coordinate.longitude}`,
        );
      }
    } else if (selectingSequence) {
      const newSequenceMark = event.nativeEvent.coordinate;
      setSequenceOfMarks([...sequenceOfMarks, newSequenceMark]);
      console.log(
        `Sequence marker set: Latitude: ${newSequenceMark.latitude}, Longitude: ${newSequenceMark.longitude}`,
      );
    }
  };

  const handleMarkerDragEnd = (event, index) => {
    const updatedMarkers = [...markers];
    updatedMarkers[index].coordinate = event.nativeEvent.coordinate;
    setMarkers(updatedMarkers);
  };

  const zoomIn = () => {
    mapRef.current.animateToRegion(
      {
        ...visibleRegion,
        latitudeDelta: visibleRegion.latitudeDelta / 2,
        longitudeDelta: visibleRegion.longitudeDelta / 2,
      },
      1000,
    );
  };

  const zoomOut = () => {
    mapRef.current.animateToRegion(
      {
        ...visibleRegion,
        latitudeDelta: visibleRegion.latitudeDelta * 2,
        longitudeDelta: visibleRegion.longitudeDelta * 2,
      },
      1000,
    );
  };

  const onRegionChangeComplete = region => {
    setVisibleRegion(region);
  };

  const renderModalItem = ({item}) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setSelectedMarkerType(item);
      }}>
      <Text>{item.label}</Text>
    </TouchableOpacity>
  );

  const placeMarkerAtCross = () => {
    if (
      selectedMarkerType &&
      centerCoordinate.latitude &&
      centerCoordinate.longitude
    ) {
      const newMarker = {
        coordinate: {
          latitude: centerCoordinate.latitude,
          longitude: centerCoordinate.longitude,
        },
        key: `${markers.length}`,
        type: selectedMarkerType,
        color: selectedMarkerType.color,
      };
      setMarkers([...markers, newMarker]);
      console.log(
        `Marker set at cross: ${selectedMarkerType.label}, Latitude: ${newMarker.coordinate.latitude}, Longitude: ${newMarker.coordinate.longitude}`,
      );
      setSelectedMarkerType(null);
    }
  };

  const startTimer = () => {
    setTimerRunning(true);
    const endTime = Date.now() + timerMinutes * 60000;
    const interval = setInterval(() => {
      const remainingTime = endTime - Date.now();
      if (remainingTime <= 0) {
        clearInterval(interval);
        setTimer(null);
        setTimerRunning(false);
      } else {
        setTimer(Math.ceil(remainingTime / 1000));
      }
    }, 1000);
  };

  const resetTimer = () => {
    setTimer(null);
    setTimerRunning(false);
  };

  const calculateRoute = () => {
    if (sequenceOfMarks.length < 2) {
      console.error('At least two marks are needed to calculate the route');
      return;
    }

    let route = [];
    for (let i = 0; i < sequenceOfMarks.length - 1; i++) {
      const start = sequenceOfMarks[i];
      const end = sequenceOfMarks[i + 1];
      route.push(start, end);
    }
    return route;
  };

  const startSimulation = () => {
    const route = calculateRoute();
    if (!route) {
      return;
    }

    setSimulationRunning(true);
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep >= route.length - 1) {
        clearInterval(interval);
        setSimulationRunning(false);
        return;
      }

      const start = route[currentStep];
      const end = route[currentStep + 1];

      const deltaX = (end.latitude - start.latitude) / 10;
      const deltaY = (end.longitude - start.longitude) / 10;

      const newLatitude = boatPosition.latitude + deltaX;
      const newLongitude = boatPosition.longitude + deltaY;

      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      const speed = getSpeedFromPolars(Math.abs(angle - windInfo.direction));

      setBoatSpeed(speed);
      setBoatPosition({
        latitude: newLatitude,
        longitude: newLongitude,
      });

      setBoatHeading(angle);

      setBoatTrail([
        ...boatTrail,
        {latitude: newLatitude, longitude: newLongitude},
      ]);

      if (
        Math.abs(newLatitude - end.latitude) < Math.abs(deltaX) &&
        Math.abs(newLongitude - end.longitude) < Math.abs(deltaY)
      ) {
        currentStep += 1;
      }
    }, 1000);
  };

  const resetSimulation = () => {
    setBoatPosition(null);
    setBoatHeading(0);
    setBoatTrail([]);
    setSimulationRunning(false);
  };

  return (
    <View style={styles.container}>
      {initialRegion && (
        <MapView
          ref={mapRef}
          style={styles.map}
          onPress={handleMapPress}
          onRegionChangeComplete={onRegionChangeComplete}
          initialRegion={initialRegion}
          showsUserLocation={true}
          zoomEnabled={true}>
          {markers.map((marker, index) => (
            <Marker
              key={marker.key}
              coordinate={marker.coordinate}
              pinColor={marker.color}
              draggable
              onDragEnd={event => handleMarkerDragEnd(event, index)}
              title={`Marker ${marker.key}`}
              description={marker.type.label}
            />
          ))}

          {windArrows.map((arrow, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: arrow.latitude,
                longitude: arrow.longitude,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  transform: [
                    {
                      rotate: `${
                        arrow.windDirection !== null
                          ? arrow.windDirection + 'deg'
                          : '0deg'
                      }`,
                    },
                  ],
                }}>
                <Icon name="arrow-up" size={10} color="white" />
              </View>
            </Marker>
          ))}

          {boatPosition && (
            <Marker
              coordinate={boatPosition}
              title="Boat"
              description="Simulated Boat">
              <View
                style={{
                  alignItems: 'center',
                  transform: [{rotate: `${boatHeading}deg`}],
                }}>
                <Icon name="triangle-up" size={20} color="green" />
              </View>
            </Marker>
          )}

          <Polyline
            coordinates={boatTrail}
            strokeColor="green"
            strokeWidth={2}
          />

          {startLine.marker1 && startLine.marker2 && (
            <Polyline
              coordinates={[startLine.marker1, startLine.marker2]}
              strokeColor="red"
              strokeWidth={2}
            />
          )}

          {sequenceOfMarks.length > 1 && (
            <Polyline
              coordinates={sequenceOfMarks}
              strokeColor="blue"
              strokeWidth={2}
            />
          )}
        </MapView>
      )}

      <View style={styles.targetContainer}>
        <Icon name="cross" size={24} color="red" />
      </View>

      {!isInfoTableMinimized && (
        <View style={styles.infoContainer}>
          <TouchableOpacity
            style={styles.minimizeButton}
            onPress={() => setIsInfoTableMinimized(true)}>
            <Text style={styles.minimizeButtonText}>-</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.infoItem}
              onPress={() => setShowDatePicker(true)}>
              <Icon name="calendar" size={20} color="black" />
              <Text style={styles.infoText}>Date: {formatDate(date)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.infoItem}
              onPress={() => setShowTimePicker(true)}>
              <Icon name="clock" size={20} color="black" />
              <Text style={styles.infoText}>
                Time: {time.toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={styles.infoItem}>
              <Icon1 name="wind" size={20} color="black" />
              <Text style={styles.infoText}>
                Wind:{' '}
                {windInfo.speed !== null
                  ? `${windInfo.speed} kts ${windInfo.direction}°`
                  : 'N/A'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Icon name="water" size={20} color="black" />
              <Text style={styles.infoText}>
                Tide:{' '}
                {tideInfo.speed !== null
                  ? `${tideInfo.speed} kts ${tideInfo.direction}°`
                  : 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.infoItem}>
              <Icon name="location-pin" size={20} color="black" />
              <Text style={styles.infoText}>
                Lat:{' '}
                {centerCoordinate.latitude !== null
                  ? centerCoordinate.latitude.toFixed(4)
                  : 'N/A'}
                , Lon:{' '}
                {centerCoordinate.longitude !== null
                  ? centerCoordinate.longitude.toFixed(4)
                  : 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.infoItem}>
              <Icon name="timer" size={20} color="black" />
              <Text style={styles.infoText}>
                Timer:{' '}
                {timer !== null
                  ? `${Math.floor(timer / 60)}:${timer % 60}`
                  : `${timerMinutes} mins`}
              </Text>
            </View>
            <View style={styles.timerControls}>
              <Button
                title="Set Timer"
                onPress={() =>
                  setTimerMinutes(timerMinutes < 10 ? timerMinutes + 1 : 1)
                }
              />
              <Button
                title={timerRunning ? 'Stop Timer' : 'Start Timer'}
                onPress={timerRunning ? resetTimer : startTimer}
              />
              <Button title="Reset Timer" onPress={resetTimer} />
            </View>
          </View>

          <View style={styles.markerPicker}>
            <FlatList
              horizontal
              data={markerTypes}
              renderItem={renderModalItem}
              keyExtractor={item => item.value}
            />
            {selectedMarkerType && (
              <Button title="Place Marker Here" onPress={placeMarkerAtCross} />
            )}
            <Button title="Clear Markers" onPress={() => setMarkers([])} />
          </View>

          <View style={styles.row}>
            <Button
              title="Define Start Line"
              onPress={() => setSelectingStartLine(true)}
            />
            <Button
              title="Set Sequence of Marks"
              onPress={() => setSelectingSequence(true)}
            />
            {selectingSequence && (
              <Button
                title="Finish Sequence"
                onPress={() => setSelectingSequence(false)}
              />
            )}
          </View>

          <View style={styles.row}>
            <Button
              title={simulationRunning ? 'Stop Simulation' : 'Start Simulation'}
              onPress={simulationRunning ? resetSimulation : startSimulation}
            />
          </View>
        </View>
      )}

      {isInfoTableMinimized && (
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setIsInfoTableMinimized(false)}>
          <Text style={styles.expandButtonText}>+</Text>
        </TouchableOpacity>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || date;
            setShowDatePicker(false);
            setDate(currentDate);
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            const currentTime = selectedTime || time;
            setShowTimePicker(false);
            setTime(currentTime);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  targetContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12, // half the size of the target icon to center it
    marginTop: -12, // half the size of the target icon to center it
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10, // Added to stretch the container across the width
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    elevation: 5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    marginLeft: 5,
    fontSize: 12,
  },
  clearButtonContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
  },
  zoomButtons: {
    position: 'absolute',
    bottom: 140,
    right: 20,
    flexDirection: 'column',
  },
  zoomButton: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 5,
    elevation: 2,
  },
  zoomText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  picker: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    backgroundColor: 'white',
    borderRadius: 5,
    marginVertical: 5,
  },
  minimizeButton: {
    alignSelf: 'flex-end',
    padding: 5,
    backgroundColor: 'lightgray',
    borderRadius: 5,
  },
  minimizeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  expandButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    padding: 10,
    backgroundColor: 'lightgray',
    borderRadius: 10,
  },
  expandButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 10,
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  markerPicker: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default RaceOverviewScreen;
