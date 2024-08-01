import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Alert} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import Icon from 'react-native-vector-icons/Entypo';
import DateTimePicker from '@react-native-community/datetimepicker';
import Geolocation from '@react-native-community/geolocation';
import MarkerPicker from '../components/MarkerPicker';
import TimerControls from '../components/TimerControls';
import InfoRow from '../components/InfoRow';
import CustomButton from '../components/CustomButton';
import markerTypes from '../utils/markerTypes';
import mockWindData from '../utils/mockWindData.json';
import boatPolars from '../utils/boatPolars'; // Import boat polars

const RaceOverviewScreen = () => {
  const [markers, setMarkers] = useState([]);
  const [selectedMarkerType, setSelectedMarkerType] = useState(null);
  const [centerCoordinate, setCenterCoordinate] = useState({
    latitude: null,
    longitude: null,
  });
  const [initialRegion, setInitialRegion] = useState(null);
  const [timerMinutes, setTimerMinutes] = useState(1);
  const [timer, setTimer] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isInfoTableMinimized, setIsInfoTableMinimized] = useState(false);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [windInfo, setWindInfo] = useState({speed: null, direction: null});
  const [tideInfo, setTideInfo] = useState({speed: null, direction: null});
  const [windArrows, setWindArrows] = useState([]);
  const [startLine, setStartLine] = useState({marker1: null, marker2: null});
  const [selectingStartLine, setSelectingStartLine] = useState(false);
  const [boatPosition, setBoatPosition] = useState(null);
  const [boatHeading, setBoatHeading] = useState(0);
  const [boatTrail, setBoatTrail] = useState([]);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [sequenceOfMarks, setSequenceOfMarks] = useState([]);
  const [selectingSequence, setSelectingSequence] = useState(false);
  const mapRef = useRef(null);
  const simulationIntervalRef = useRef(null);

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
        setCenterCoordinate({latitude, longitude});
      },
      error => {
        console.error('Error getting current location:', error);
        setInitialRegion({
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setCenterCoordinate({latitude: 37.78825, longitude: -122.4324});
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
      },
    );
  }, []);

  const handleMapPress = event => {
    if (selectingStartLine) {
      if (!startLine.marker1) {
        setStartLine({marker1: event.nativeEvent.coordinate, marker2: null});
        console.log('Start Line Marker 1 set:', event.nativeEvent.coordinate);
      } else if (!startLine.marker2) {
        setStartLine(prev => ({
          ...prev,
          marker2: event.nativeEvent.coordinate,
        }));
        console.log('Start Line Marker 2 set:', event.nativeEvent.coordinate);
        setSelectingStartLine(false);
      }
    } else if (selectingSequence) {
      const newMark = event.nativeEvent.coordinate;
      setSequenceOfMarks(prevMarks => [...prevMarks, newMark]);
      console.log('Sequence Marker set:', newMark);
    } else if (selectedMarkerType) {
      const newMarker = {
        coordinate: event.nativeEvent.coordinate,
        key: `${markers.length}_${Date.now()}`, // Ensure unique key by combining length and timestamp
        type: selectedMarkerType,
        color: markerTypes.find(type => type.value === selectedMarkerType)
          ?.color,
      };
      setMarkers(prevMarkers => {
        const updatedMarkers = [...prevMarkers, newMarker];
        console.log('Updated Markers:', updatedMarkers);
        return updatedMarkers;
      });
      setSelectedMarkerType(null);
    }
  };

  const handleMarkerDragEnd = (event, index) => {
    const updatedMarkers = [...markers];
    updatedMarkers[index].coordinate = event.nativeEvent.coordinate;
    setMarkers(updatedMarkers);
  };

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
        key: `${markers.length}_${Date.now()}`, // Ensure unique key by combining length and timestamp
        type: selectedMarkerType,
        color: markerTypes.find(type => type.value === selectedMarkerType)
          ?.color,
      };
      setMarkers(prevMarkers => {
        const updatedMarkers = [...prevMarkers, newMarker];
        console.log('Marker placed at cross:', newMarker);
        return updatedMarkers;
      });
      setSelectedMarkerType(null);
    }
  };

  const onRegionChangeComplete = region => {
    setCenterCoordinate({
      latitude: region.latitude,
      longitude: region.longitude,
    });
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

  const fetchWindAndTideData = () => {
    const selectedDate = formatDate(date);
    const currentHour = time.getHours();
    console.log(
      `Fetching data for date: ${selectedDate}, hour: ${currentHour}`,
    );

    const dayData = mockWindData.days.find(day => day.date === selectedDate);

    if (dayData) {
      console.log('Day data found:', dayData);
      const hourData = dayData.hours.find(
        hour => new Date(hour.datetime).getHours() === currentHour,
      );

      if (hourData) {
        console.log('Hour data found:', hourData);
        setWindInfo({
          speed: hourData.windspeed,
          direction: hourData.winddir,
        });
        setTideInfo({
          speed: hourData.tideSpeed,
          direction: hourData.tideDir,
        });

        // Set wind arrows
        const gridSize = 8; // Define the grid size for wind arrows
        const latStep = (initialRegion.latitudeDelta * 2) / gridSize;
        const lonStep = (initialRegion.longitudeDelta * 2) / gridSize;
        const arrows = [];

        for (let i = 0; i <= gridSize; i++) {
          for (let j = 0; j <= gridSize; j++) {
            const arrowLat =
              initialRegion.latitude -
              initialRegion.latitudeDelta +
              latStep * i;
            const arrowLon =
              initialRegion.longitude -
              initialRegion.longitudeDelta +
              lonStep * j;
            arrows.push({
              latitude: arrowLat,
              longitude: arrowLon,
              windDirection: hourData.winddir,
            });
          }
        }
        setWindArrows(arrows);
      } else {
        console.log('No hour data found for the current hour.');
        setWindInfo({speed: 'N/A', direction: 'N/A'});
        setTideInfo({speed: 'N/A', direction: 'N/A'});
      }
    } else {
      console.log('No day data found for the selected date.');
      setWindInfo({speed: 'N/A', direction: 'N/A'});
      setTideInfo({speed: 'N/A', direction: 'N/A'});
    }
  };

  useEffect(() => {
    fetchWindAndTideData();
  }, [date, time]);

  const formatDate = date => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getSpeedFromPolars = angle => {
    for (let i = 0; i < boatPolars.length - 1; i++) {
      if (angle >= boatPolars[i].angle && angle <= boatPolars[i + 1].angle) {
        return boatPolars[i].speed;
      }
    }
    return 5; // Default speed for angles not covered in the polars
  };

  const calculateSailingPoint = angle => {
    if (angle > 345 || angle <= 15) return 'Running';
    if (angle > 15 && angle <= 75) return 'Broad Reach';
    if (angle > 75 && angle <= 105) return 'Beam Reach';
    if (angle > 105 && angle <= 165) return 'Close Reach';
    return 'Beating'; // Default to Beating if none of the above
  };

  const calculateTack = angle => {
    return angle > 180 ? 'Port' : 'Starboard';
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const calculateIntermediateWaypoint = (position, heading, distance) => {
    const R = 6371; // Radius of the Earth in km
    const d = distance / R; // Angular distance in radians
    const bearing = (heading * Math.PI) / 180; // Convert bearing to radians

    const lat1 = (position.latitude * Math.PI) / 180; // Current latitude in radians
    const lon1 = (position.longitude * Math.PI) / 180; // Current longitude in radians

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(d) +
        Math.cos(lat1) * Math.sin(d) * Math.cos(bearing),
    );
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(bearing) * Math.sin(d) * Math.cos(lat1),
        Math.cos(d) - Math.sin(lat1) * Math.sin(lat2),
      );

    return {
      latitude: (lat2 * 180) / Math.PI, // Convert back to degrees
      longitude: (lon2 * 180) / Math.PI, // Convert back to degrees
    };
  };

  const preCalculateRacePlan = () => {
    const plan = [];
    let currentPosition = boatPosition;
    let remainingMarks = [startLine.marker2, ...sequenceOfMarks];
    let maxIterations = 1000; // to prevent infinite loops

    while (remainingMarks.length > 0 && maxIterations > 0) {
      const nextMark = remainingMarks[0];
      const distanceToNextMark = calculateDistance(
        currentPosition.latitude,
        currentPosition.longitude,
        nextMark.latitude,
        nextMark.longitude,
      );
      const headingToNextMark = Math.atan2(
        nextMark.latitude - currentPosition.latitude,
        nextMark.longitude - currentPosition.longitude,
      );
      const angleToNextMark = (headingToNextMark * 180) / Math.PI;
      const relativeWindAngle = Math.abs(angleToNextMark - windInfo.direction);
      const speed = getSpeedFromPolars(relativeWindAngle);
      const tack = calculateTack(angleToNextMark);
      const pointOfSail = calculateSailingPoint(relativeWindAngle);

      console.log(
        `Plan Step: Heading ${angleToNextMark.toFixed(
          2,
        )} degrees, Speed ${speed.toFixed(
          2,
        )} knots, from (${currentPosition.latitude.toFixed(
          4,
        )}, ${currentPosition.longitude.toFixed(
          4,
        )}) to (${nextMark.latitude.toFixed(4)}, ${nextMark.longitude.toFixed(
          4,
        )}), Tack: ${tack}, Point of Sail: ${pointOfSail}`,
      );

      // Check if tacking is required
      if (relativeWindAngle < 30 || relativeWindAngle > 150) {
        // Add intermediate waypoint to simulate tacking
        const tackAngle =
          tack === 'Starboard' ? angleToNextMark + 60 : angleToNextMark - 60;
        const intermediateWaypoint = calculateIntermediateWaypoint(
          currentPosition,
          tackAngle,
          distanceToNextMark / 2,
        );
        const distanceToIntermediateWaypoint = calculateDistance(
          currentPosition.latitude,
          currentPosition.longitude,
          intermediateWaypoint.latitude,
          intermediateWaypoint.longitude,
        );

        // Check if intermediate waypoint makes sense (is closer to the next mark)
        if (distanceToIntermediateWaypoint < distanceToNextMark) {
          plan.push({
            from: {...currentPosition},
            to: {...intermediateWaypoint},
            heading: tackAngle,
            speed: getSpeedFromPolars(Math.abs(tackAngle - windInfo.direction)),
            tack,
            pointOfSail: 'Tacking',
            distance: distanceToIntermediateWaypoint,
          });
          currentPosition = intermediateWaypoint;
        } else {
          // If not making progress, proceed to the next mark directly
          plan.push({
            from: {...currentPosition},
            to: {...nextMark},
            heading: angleToNextMark,
            speed,
            tack,
            pointOfSail,
            distance: distanceToNextMark,
          });
          currentPosition = nextMark;
          remainingMarks.shift();
        }
      } else {
        plan.push({
          from: {...currentPosition},
          to: {...nextMark},
          heading: angleToNextMark,
          speed,
          tack,
          pointOfSail,
          distance: distanceToNextMark,
        });
        currentPosition = nextMark;
        remainingMarks.shift();
      }

      maxIterations--;
    }

    if (maxIterations <= 0) {
      console.error('Infinite loop detected in preCalculateRacePlan');
    }

    return plan;
  };

  const startSimulation = () => {
    if (!boatPosition) {
      Alert.alert('Error', 'Please set the starting position of the boat.');
      return;
    }
    if (!startLine.marker1 || !startLine.marker2) {
      Alert.alert('Error', 'Please define the start line.');
      return;
    }

    const racePlan = preCalculateRacePlan();

    setSimulationRunning(true);
    setBoatTrail([boatPosition]);

    let currentStepIndex = 0;

    simulationIntervalRef.current = setInterval(() => {
      if (currentStepIndex >= racePlan.length) {
        stopSimulation();
        return;
      }

      const currentStep = racePlan[currentStepIndex];
      setBoatPosition(currentStep.to);
      setBoatHeading(currentStep.heading);
      setBoatTrail(prevTrail => [...prevTrail, currentStep.to]);

      console.log(
        `Boat Position: ${currentStep.to.latitude.toFixed(
          4,
        )}, ${currentStep.to.longitude.toFixed(4)}`,
      );
      console.log(`Boat Heading: ${currentStep.heading.toFixed(2)} degrees`);
      console.log(`Boat Speed: ${currentStep.speed.toFixed(2)} knots`);
      console.log(`Tack: ${currentStep.tack}`);
      console.log(`Point of Sail: ${currentStep.pointOfSail}`);

      currentStepIndex += 1;
    }, 1000);
  };

  const stopSimulation = () => {
    setSimulationRunning(false);
    clearInterval(simulationIntervalRef.current);
  };

  const resetRace = () => {
    stopSimulation();
    setBoatPosition(null);
    setBoatHeading(0);
    setBoatTrail([]);
    setStartLine({marker1: null, marker2: null});
    setSequenceOfMarks([]);
    console.log('Race reset.');
  };

  const selectBoatStartPosition = event => {
    setBoatPosition(event.nativeEvent.coordinate);
    setBoatHeading(0); // Reset heading
    console.log('Boat starting position set:', event.nativeEvent.coordinate);
  };

  return (
    <View style={styles.container}>
      {initialRegion && (
        <MapView
          ref={mapRef}
          style={styles.map}
          key={JSON.stringify(initialRegion)} // Force re-render of MapView when region changes
          onPress={handleMapPress}
          onLongPress={selectBoatStartPosition}
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
              description={
                markerTypes.find(type => type.value === marker.type)?.label
              }
            />
          ))}
          {startLine.marker1 && startLine.marker2 && (
            <Polyline
              coordinates={[startLine.marker1, startLine.marker2]}
              strokeColor="red"
              strokeWidth={2}
            />
          )}
          {sequenceOfMarks.length > 0 && (
            <Polyline
              coordinates={sequenceOfMarks}
              strokeColor="blue"
              strokeWidth={2}
            />
          )}
          {boatPosition && (
            <>
              <Marker
                coordinate={boatPosition}
                title="Boat"
                description="Starting Position">
                <View style={{transform: [{rotate: `${boatHeading}deg`}]}}>
                  <Icon name="triangle-up" size={24} color="blue" />
                </View>
              </Marker>
              <Polyline
                coordinates={boatTrail}
                strokeColor="blue"
                strokeWidth={3}
              />
            </>
          )}
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
                <Icon name="arrow-up" size={9} color="white" />
              </View>
            </Marker>
          ))}
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
            <InfoRow
              iconName="direction"
              label="Wind"
              value={
                windInfo.speed !== null
                  ? `${windInfo.speed} kts ${windInfo.direction}°`
                  : 'N/A'
              }
              style={styles.infoTextLarge}
            />
            <InfoRow
              iconName="water"
              label="Tide"
              value={
                tideInfo.speed !== null
                  ? `${tideInfo.speed} kts ${tideInfo.direction}°`
                  : 'N/A'
              }
              style={styles.infoTextLarge}
            />
          </View>

          <View style={styles.row}>
            <InfoRow
              iconName="location-pin"
              label="Lat"
              value={
                centerCoordinate.latitude !== null
                  ? centerCoordinate.latitude.toFixed(4)
                  : 'N/A'
              }
              style={styles.infoTextLarge}
            />
            <InfoRow
              iconName="location-pin"
              label="Lon"
              value={
                centerCoordinate.longitude !== null
                  ? centerCoordinate.longitude.toFixed(4)
                  : 'N/A'
              }
              style={styles.infoTextLarge}
            />
          </View>

          <View style={styles.row}>
            <InfoRow
              iconName="back-in-time"
              label="Timer"
              value={
                timer !== null
                  ? `${Math.floor(timer / 60)}:${timer % 60}`
                  : `${timerMinutes} mins`
              }
              style={styles.infoTextLarge}
            />
            <TimerControls
              timerMinutes={timerMinutes}
              setTimerMinutes={setTimerMinutes}
              timerRunning={timerRunning}
              startTimer={startTimer}
              resetTimer={resetTimer}
            />
          </View>

          <MarkerPicker
            selectedMarkerType={selectedMarkerType}
            setSelectedMarkerType={setSelectedMarkerType}
            placeMarkerAtCross={placeMarkerAtCross}
            setMarkers={setMarkers}
          />

          <View style={styles.row}>
            <CustomButton
              title="Define Start Line"
              onPress={() => setSelectingStartLine(true)}
            />
          </View>

          <View style={styles.row}>
            <CustomButton
              title="Set Sequence of Marks"
              onPress={() => setSelectingSequence(true)}
            />
            {selectingSequence && (
              <CustomButton
                title="Finish Sequence"
                onPress={() => setSelectingSequence(false)}
              />
            )}
          </View>

          <View style={styles.row}>
            <CustomButton
              title={simulationRunning ? 'Stop Simulation' : 'Start Simulation'}
              onPress={simulationRunning ? stopSimulation : startSimulation}
            />
            <CustomButton
              title="Restart Race"
              onPress={resetRace}
              style={{backgroundColor: 'orange'}}
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
  infoTextLarge: {
    fontSize: 11,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
});

export default RaceOverviewScreen;
