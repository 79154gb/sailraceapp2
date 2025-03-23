import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import MapView, {Marker, Polyline, AnimatedRegion} from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomButton from '../components/CustomButton';
import MarkerPicker from '../components/MarkerPicker';
import InfoRow from '../components/InfoRow';
import {
  calculateRoute,
  calculateBearing,
  toRadians,
  toDegrees,
} from '../utils/routeCalculations';
import markerTypes from '../utils/markerTypes';
import WindArrow from '../components/windarrow';
import {useRoute} from '@react-navigation/native';

// Scale factor to speed up simulation time
const SIMULATION_TIME_SCALE = 0.01;
// Lateral offset amplitude (in degrees). Approximately 0.0005 deg ≈ 55 m.
const OFFSET_AMPLITUDE = 0.0005;

const RaceOverviewScreen = () => {
  // [State declarations remain largely the same...]
  const [boatPosition, setBoatPosition] = useState(null);
  const [startLine, setStartLine] = useState({marker1: null, marker2: null});
  const [markers, setMarkers] = useState([]);
  const [selectedMarkerType, setSelectedMarkerType] = useState(null);
  const [sequenceOfMarks, setSequenceOfMarks] = useState([]);
  const [selectingStartLine, setSelectingStartLine] = useState(false);
  const [selectingSequence, setSelectingSequence] = useState(false);
  const [racePlan, setRacePlan] = useState([]);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [currentManeuver, setCurrentManeuver] = useState(null);
  const [selectingBoatPosition, setSelectingBoatPosition] = useState(false);
  const [currentLegInfo, setCurrentLegInfo] = useState(null);
  const [totalTacks, setTotalTacks] = useState(0);
  const [totalGybes, setTotalGybes] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const mapRef = useRef(null);
  const route = useRoute();
  const {boatPolars} = route.params || {};

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [windInfo, setWindInfo] = useState({speed: null, direction: null});
  const [tideInfo, setTideInfo] = useState({speed: null, direction: null});

  const boatPositionAnim = useRef(
    new AnimatedRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0,
      longitudeDelta: 0,
    }),
  ).current;
  const boatHeadingAnim = useRef(new Animated.Value(0)).current;

  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const panelHeight = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(panelHeight, {
      toValue: isPanelVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isPanelVisible, panelHeight]);

  const fetchWindAndTideData = useCallback(() => {
    console.log(`Fetching wind and tide data for date: ${date}, time: ${time}`);
    const mockWindSpeed = parseFloat((Math.random() * 20 + 5).toFixed(2));
    const mockWindDirection = parseFloat((Math.random() * 360).toFixed(2));
    const mockTideSpeed = parseFloat((Math.random() * 3 + 0.5).toFixed(2));
    const mockTideDirection = parseFloat((Math.random() * 360).toFixed(2));
    setWindInfo({speed: mockWindSpeed, direction: mockWindDirection});
    setTideInfo({speed: mockTideSpeed, direction: mockTideDirection});
    console.log('Wind Info:', {
      speed: mockWindSpeed,
      direction: mockWindDirection,
    });
    console.log('Tide Info:', {
      speed: mockTideSpeed,
      direction: mockTideDirection,
    });
  }, [date, time]);

  useEffect(() => {
    fetchWindAndTideData();
  }, [fetchWindAndTideData]);

  const handleMapPress = event => {
    const {coordinate} = event.nativeEvent;
    if (selectingBoatPosition) {
      setBoatPosition(coordinate);
      boatPositionAnim.setValue({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 0,
        longitudeDelta: 0,
      });
      console.log('Boat starting position set:', coordinate);
      setSelectingBoatPosition(false);
    } else if (selectingStartLine) {
      if (!startLine.marker1) {
        setStartLine({marker1: coordinate, marker2: null});
        console.log('Start line marker 1 set:', coordinate);
      } else {
        setStartLine(prev => ({...prev, marker2: coordinate}));
        setSelectingStartLine(false);
        console.log('Start line marker 2 set:', coordinate);
      }
    } else if (selectingSequence) {
      setSequenceOfMarks(prev => [...prev, coordinate]);
      console.log('New sequence mark added:', coordinate);
    } else if (selectedMarkerType) {
      if (selectedMarkerType === 'Windward' || selectedMarkerType === 'Reach') {
        setSequenceOfMarks(prev => [...prev, coordinate]);
        console.log('New sequence mark added (Windward/Reach):', coordinate);
        setSelectedMarkerType(null);
      } else {
        const newMarker = {
          coordinate,
          key: markers.length + '_' + Date.now(),
          type: selectedMarkerType,
          color:
            markerTypes.find(type => type.value === selectedMarkerType)
              ?.color || 'black',
        };
        setMarkers(prevMarkers => [...prevMarkers, newMarker]);
        console.log('Marker placed:', newMarker);
        setSelectedMarkerType(null);
      }
    }
  };

  // Reuse old animation functions.
  const animateBoatPosition = (newPosition, duration) => {
    if (!newPosition || !newPosition.latitude || !newPosition.longitude) {
      console.error('Invalid newPosition:', newPosition);
      return;
    }
    boatPositionAnim
      .timing({
        latitude: newPosition.latitude,
        longitude: newPosition.longitude,
        duration: duration - 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      })
      .start(() => {
        setBoatPosition(newPosition);
        boatPositionAnim.setValue({
          latitude: newPosition.latitude,
          longitude: newPosition.longitude,
          latitudeDelta: 0,
          longitudeDelta: 0,
        });
      });
  };

  const animateBoatHeading = (newHeading, duration) => {
    Animated.timing(boatHeadingAnim, {
      toValue: newHeading,
      duration: duration - 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  // Updated simulateLeg to add a lateral (perpendicular) offset and alternate heading every step
  const simulateLeg = (leg, stepIndex, numSteps, onComplete) => {
    console.log(`simulateLeg: step ${stepIndex} of ${numSteps}`);
    if (stepIndex > numSteps) {
      console.log('Leg complete.');
      onComplete();
      return;
    }
    // Linear interpolation for base position.
    const fraction = stepIndex / numSteps;
    const baseLat =
      leg.start.latitude + (leg.end.latitude - leg.start.latitude) * fraction;
    const baseLon =
      leg.start.longitude +
      (leg.end.longitude - leg.start.longitude) * fraction;
    let adjustedPosition = {latitude: baseLat, longitude: baseLon};
    let heading = leg.selectedHeading; // default heading

    // If upwind or downwind, alternate heading and add a lateral offset to simulate a zigzag.
    if (leg.mode === 'upwind' || leg.mode === 'downwind') {
      // Compute two possible tack/gybe headings.
      const tackOption1 = (windInfo.direction + leg.chosenTWA) % 360;
      const tackOption2 = (windInfo.direction - leg.chosenTWA + 360) % 360;
      // Alternate heading every step.
      heading = stepIndex % 2 === 0 ? tackOption1 : tackOption2;
      // Also, compute the bearing of the leg.
      const legBearing = calculateBearing(
        leg.start.latitude,
        leg.start.longitude,
        leg.end.latitude,
        leg.end.longitude,
      );
      // Compute a perpendicular direction (legBearing + 90°).
      const offsetBearing = (legBearing + 90) % 360;
      // Use a sine function to create an oscillating offset.
      const offsetFactor = Math.sin((2 * Math.PI * stepIndex) / numSteps);
      // Compute offset deltas (approximation; 1 degree latitude ~ 111km)
      const offsetLat =
        OFFSET_AMPLITUDE * offsetFactor * Math.cos(toRadians(offsetBearing));
      const offsetLon =
        (OFFSET_AMPLITUDE * offsetFactor * Math.sin(toRadians(offsetBearing))) /
        Math.cos(toRadians(baseLat));
      adjustedPosition = {
        latitude: baseLat + offsetLat,
        longitude: baseLon + offsetLon,
      };
    }

    const stepDuration =
      (leg.estimatedTime * 1000 * SIMULATION_TIME_SCALE) / numSteps;
    animateBoatPosition(adjustedPosition, stepDuration);
    animateBoatHeading(heading, stepDuration);
    setTimeout(
      () => simulateLeg(leg, stepIndex + 1, numSteps, onComplete),
      stepDuration,
    );
  };

  // Simulation ref for tracking current leg index and running state.
  const simulationRef = useRef({currentLegIndex: 0, isRunning: false});

  // Simulation loop: iterate over legs.
  const runLegSimulation = (legs, legIndex) => {
    console.log(`runLegSimulation: leg ${legIndex} of ${legs.length}`);
    if (legIndex >= legs.length || !simulationRef.current.isRunning) {
      setSimulationRunning(false);
      Alert.alert('Simulation Complete', 'The race simulation has ended.');
      return;
    }
    const currentLeg = legs[legIndex];
    console.log('Current leg:', currentLeg);
    setCurrentLegInfo(currentLeg);
    const stepsPerLeg = 10;
    // (Optional: If you want to simulate an initial maneuver pause for tack/gybe,
    // you can add that logic here. For now, we directly simulate the leg.)
    simulateLeg(currentLeg, 0, stepsPerLeg, () => {
      simulationRef.current.currentLegIndex = legIndex + 1;
      runLegSimulation(legs, legIndex + 1);
    });
  };

  // Simulation starter.
  const startSimulation = () => {
    if (
      !boatPosition ||
      !startLine.marker1 ||
      !startLine.marker2 ||
      sequenceOfMarks.length < 5 ||
      !boatPolars ||
      windInfo.speed === null ||
      windInfo.direction === null
    ) {
      Alert.alert(
        'Error',
        'Please ensure all inputs (boat position, start line, course marks, polars, wind) are set.',
      );
      console.error('Invalid or missing inputs for route calculation.');
      return;
    }
    const courseDetails = {
      boat_starting_position: {
        latitude: boatPosition.latitude,
        longitude: boatPosition.longitude,
      },
      course: {
        waypoints: sequenceOfMarks.map(mark => ({
          latitude: mark.latitude,
          longitude: mark.longitude,
        })),
      },
    };
    const windData = {
      wind: {
        speed: windInfo.speed,
        direction: windInfo.direction,
        gusts: 20,
        change: {speed: 'increase', direction: 'stable'},
      },
    };
    console.log('courseDetails:', courseDetails);
    console.log('windData:', windData);
    console.log('boatPolars:', boatPolars);

    const legs = calculateRoute(courseDetails, windData, boatPolars);
    if (!legs || legs.length === 0) {
      Alert.alert('Error', 'Failed to calculate route. Check your inputs.');
      console.error('Route calculation returned empty route.');
      return;
    }
    setTotalTacks(0);
    setTotalGybes(0);
    setRacePlan(legs);
    simulationRef.current = {currentLegIndex: 0, isRunning: true};
    setSimulationRunning(true);
    console.log('Simulation started with calculated route.');
    runLegSimulation(legs, 0);
  };

  const resetRace = () => {
    setBoatPosition(null);
    setStartLine({marker1: null, marker2: null});
    setMarkers([]);
    setSequenceOfMarks([]);
    setRacePlan([]);
    setSimulationRunning(false);
    setCurrentLegInfo(null);
    setTotalTacks(0);
    setTotalGybes(0);
    simulationRef.current = {currentLegIndex: 0, isRunning: false};
    setSpeedMultiplier(1);
    setCurrentManeuver(null);
    setSelectingBoatPosition(false);
    console.log('Race reset.');
  };

  const clearMarkers = () => {
    setMarkers([]);
    setStartLine({marker1: null, marker2: null});
    setSequenceOfMarks([]);
    console.log('Markers cleared.');
  };

  const restartRace = () => {
    resetRace();
    console.log('Race restarted.');
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        onPress={handleMapPress}
        showsUserLocation={true}
        followsUserLocation={true}>
        {startLine.marker1 && startLine.marker2 && (
          <Polyline
            coordinates={[startLine.marker1, startLine.marker2]}
            strokeColor="red"
            strokeWidth={2}
          />
        )}
        {sequenceOfMarks.length > 1 &&
          sequenceOfMarks.map((mark, index) => {
            if (index === 0) return null; // Skip first mark
            return (
              <Polyline
                key={`line-${index}`}
                coordinates={[
                  sequenceOfMarks[index - 1],
                  sequenceOfMarks[index],
                ]}
                strokeColor="blue"
                strokeWidth={2}
              />
            );
          })}
        {sequenceOfMarks.map((mark, index) => (
          <Marker
            key={`mark${index}`}
            coordinate={mark}
            title={`mark ${index + 1}`}
            pinColor="green"
          />
        ))}
        {markers.map(marker => (
          <Marker
            key={marker.key}
            coordinate={marker.coordinate}
            title={marker.type}
            pinColor={marker.color}
          />
        ))}
        {boatPosition && (
          <Marker.Animated
            coordinate={boatPositionAnim}
            title="Boat Starting Position"
            pinColor="blue"
            rotation={boatHeadingAnim.interpolate({
              inputRange: [0, 360],
              outputRange: ['0deg', '360deg'],
            })}
            anchor={{x: 0.5, y: 0.5}}
          />
        )}
        {racePlan.length > 0 && (
          <Polyline
            coordinates={[
              boatPosition
                ? {
                    latitude: boatPosition.latitude,
                    longitude: boatPosition.longitude,
                  }
                : null,
              ...racePlan.map(leg => leg.end).filter(coord => coord !== null),
            ].filter(coord => coord !== null)}
            strokeColor="purple"
            strokeWidth={2}
          />
        )}
      </MapView>

      {currentManeuver && (
        <View style={styles.maneuverIndicator}>
          <Text style={styles.maneuverText}>{currentManeuver}</Text>
        </View>
      )}

      <View style={styles.controlsContainer}>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text style={styles.text}>Date: {date.toDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowTimePicker(true)}>
            <Text style={styles.text}>Time: {time.toLocaleTimeString()}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <Text style={styles.text}>Simulation Speed:</Text>
          <TouchableOpacity
            onPress={() =>
              setSpeedMultiplier(prev => Math.max(0.1, prev - 0.1))
            }
            style={styles.speedButton}>
            <Text style={styles.text}>-</Text>
          </TouchableOpacity>
          <Text style={styles.text}>{speedMultiplier.toFixed(1)}x</Text>
          <TouchableOpacity
            onPress={() => setSpeedMultiplier(prev => prev + 0.1)}
            style={styles.speedButton}>
            <Text style={styles.text}>+</Text>
          </TouchableOpacity>
        </View>
        <MarkerPicker
          selectedMarkerType={selectedMarkerType}
          setSelectedMarkerType={setSelectedMarkerType}
        />
        <View style={styles.row}>
          <CustomButton
            title="Define Start Line"
            onPress={() => setSelectingStartLine(true)}
            disabled={selectingStartLine}
            style={selectingStartLine ? styles.activeButton : null}
          />
          <CustomButton
            title="Set Sequence of Marks"
            onPress={() => setSelectingSequence(true)}
            disabled={selectingSequence}
            style={selectingSequence ? styles.activeButton : null}
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
            title="Set Boat Starting Position"
            onPress={() => setSelectingBoatPosition(true)}
            disabled={selectingBoatPosition || boatPosition !== null}
            style={selectingBoatPosition ? styles.activeButton : null}
          />
          {boatPosition && (
            <CustomButton
              title="Reset Boat Position"
              onPress={() => {
                setBoatPosition(null);
                setSelectingBoatPosition(false);
              }}
            />
          )}
        </View>
        <View style={styles.row}>
          <CustomButton
            title={simulationRunning ? 'Stop Simulation' : 'Start Simulation'}
            onPress={simulationRunning ? resetRace : startSimulation}
          />
          <CustomButton
            title="Reset Race"
            onPress={resetRace}
            style={{backgroundColor: 'orange'}}
          />
          <CustomButton
            title="Restart Race"
            onPress={restartRace}
            style={{backgroundColor: 'purple'}}
          />
          <CustomButton
            title="Clear Markers"
            onPress={clearMarkers}
            style={{backgroundColor: 'red'}}
          />
        </View>
      </View>
      <View style={styles.windArrowContainer}>
        <WindArrow windDirection={windInfo.direction} />
        <Text style={styles.windText}>Wind Direction</Text>
      </View>
      <View style={styles.topContainer}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsPanelVisible(!isPanelVisible)}>
          <Text style={styles.toggleButtonText}>
            {isPanelVisible ? 'Hide Info' : 'Show Info'}
          </Text>
        </TouchableOpacity>
        {isPanelVisible && (
          <Animated.View
            style={[
              styles.shadowContainer,
              {
                transform: [
                  {
                    scaleY: panelHeight.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
                opacity: panelHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ]}>
            <View style={styles.infoContainer}>
              <InfoRow
                label="Boat Position"
                value={
                  boatPosition
                    ? `${boatPosition.latitude.toFixed(
                        5,
                      )}, ${boatPosition.longitude.toFixed(5)}`
                    : 'Not Set'
                }
              />
              <InfoRow
                label="Start Line"
                value={
                  startLine.marker1 && startLine.marker2
                    ? 'Defined'
                    : 'Not Defined'
                }
              />
              <InfoRow
                label="Wind"
                value={`${windInfo.speed?.toFixed(
                  1,
                )} kts @ ${windInfo.direction?.toFixed(0)}°`}
              />
              <InfoRow
                label="Tide"
                value={`${tideInfo.speed?.toFixed(
                  1,
                )} kts @ ${tideInfo.direction?.toFixed(0)}°`}
              />
              {simulationRunning && currentLegInfo && (
                <>
                  <InfoRow label="Leg Mode" value={currentLegInfo.mode} />
                  <InfoRow label="TWA" value={`${currentLegInfo.chosenTWA}°`} />
                  <InfoRow
                    label="Heading"
                    value={`${currentLegInfo.selectedHeading}°`}
                  />
                  <InfoRow
                    label="Est. Time"
                    value={`${currentLegInfo.estimatedTime.toFixed(1)} sec`}
                  />
                </>
              )}
              {simulationRunning && (
                <InfoRow
                  label="Current Leg"
                  value={`Leg ${simulationRef.current.currentLegIndex + 1} of ${
                    racePlan.length
                  }`}
                />
              )}
              <InfoRow label="Total Tacks" value={`${totalTacks}`} />
              <InfoRow label="Total Gybes" value={`${totalGybes}`} />
            </View>
          </Animated.View>
        )}
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              setTime(selectedTime);
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1},
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  text: {fontSize: 16, color: '#333'},
  speedButton: {
    marginHorizontal: 10,
    padding: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  topContainer: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
  },
  toggleButton: {
    backgroundColor: '#ddd',
    padding: 10,
    alignItems: 'center',
  },
  toggleButtonText: {fontSize: 16, color: '#333'},
  shadowContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 10,
    overflow: 'hidden',
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  maneuverIndicator: {
    position: 'absolute',
    top: 100,
    left: '50%',
    transform: [{translateX: -75}],
    width: 150,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  maneuverText: {color: 'white', fontSize: 16, fontWeight: 'bold'},
  activeButton: {backgroundColor: '#008000'},
  windArrowContainer: {
    position: 'absolute',
    top: 130,
    right: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  windText: {marginTop: 5, fontSize: 14, color: '#333'},
});

export default RaceOverviewScreen;
