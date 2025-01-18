// RaceOverviewScreen.js

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
  calculateOptimalRoute,
  generatePolarTable,
  calculateRouteThroughMarks,
} from '../utils/routeCalculations';
import markerTypes from '../utils/markerTypes';
import WindArrow from '../components/windarrow'; // Ensure the filename matches exactly (WindArrow.js)
import {useRoute} from '@react-navigation/native';

const RaceOverviewScreen = () => {
  // State variables
  const [boatPosition, setBoatPosition] = useState(null);
  const [startLine, setStartLine] = useState({marker1: null, marker2: null});
  const [markers, setMarkers] = useState([]);
  const [selectedMarkerType, setSelectedMarkerType] = useState(null);
  const [sequenceOfMarks, setSequenceOfMarks] = useState([]);
  const [racePlan, setRacePlan] = useState([]);
  const [polarTable, setPolarTable] = useState(null);
  const [selectingStartLine, setSelectingStartLine] = useState(false);
  const [selectingSequence, setSelectingSequence] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [totalTacks, setTotalTacks] = useState(0);
  const [totalGybes, setTotalGybes] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [currentManeuver, setCurrentManeuver] = useState(null);
  const [selectingBoatPosition, setSelectingBoatPosition] = useState(false);
  const mapRef = useRef(null);
  const route = useRoute();
  const {boatPolars} = route.params || {};

  // Time and date for wind and tide
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [windInfo, setWindInfo] = useState({speed: null, direction: null});
  const [tideInfo, setTideInfo] = useState({speed: null, direction: null});

  // Simulation state
  const [currentRouteStep, setCurrentRouteStep] = useState(null);
  const [currentMarkIndex, setCurrentMarkIndex] = useState(0); // Tracks the current mark
  const [remainingMarks, setRemainingMarks] = useState([]); // Marks yet to be processed

  const [boatStatus, setBoatStatus] = useState({
    heading: 0,
    twa: 0,
    speed: 0,
    tackSide: 'port',
    pointOfSail: 'Run',
  });

  // Refs for simulation control
  const simulationRef = useRef({
    currentLegIndex: 0,
    isRunning: false,
  });

  // Refs for animations
  const boatPositionAnim = useRef(
    new AnimatedRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0,
      longitudeDelta: 0,
    }),
  ).current;
  const boatHeadingAnim = useRef(new Animated.Value(0)).current;

  // Ref for current tack side to persist across route calculations
  const currentTackRef = useRef('port');

  // Ref to keep track of the previous tack side
  const previousTackSideRef = useRef(null);

  // State and ref for collapsible information panel
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const panelHeight = useRef(new Animated.Value(1)).current; // 1 means fully visible

  // Animate the panel's visibility when isPanelVisible changes
  useEffect(() => {
    Animated.timing(panelHeight, {
      toValue: isPanelVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: false, // We're animating height and opacity
    }).start();
  }, [isPanelVisible, panelHeight]);

  /**
   * Initializes the polar table on component mount.
   */
  useEffect(() => {
    console.log('Received boatPolars:', boatPolars); // Log to see what is received
    if (boatPolars) {
      try {
        const polarTable = generatePolarTable(boatPolars); // Generate the full polar table
        console.log('Generated Polar Table:', polarTable); // Log the generated table
        setPolarTable(polarTable); // Update state with the generated table
      } catch (error) {
        Alert.alert(
          'Error',
          `Failed to generate polar table: ${error.message}`,
        );
        console.error('Failed to generate polar table:', error.message);
      }
    } else {
      console.error('No boat polars passed to RaceOverviewScreen.');
    }
  }, [boatPolars]);

  /**
   * Fetches mock wind and tide data.
   * Replace this with actual API calls to fetch real-time data.
   */
  const fetchWindAndTideData = useCallback(() => {
    console.log(`Fetching wind and tide data for date: ${date}, time: ${time}`);
    // Mock data generation
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

  /**
   * Fetches wind and tide data whenever the date or time changes.
   */
  useEffect(() => {
    fetchWindAndTideData();
  }, [fetchWindAndTideData]);

  /**
   * Handles map press events to set markers, start line, sequence of marks, or boat position.
   * @param {object} event - The map press event.
   */
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

      // Deactivate selection mode
      setSelectingBoatPosition(false);
    } else if (selectingStartLine) {
      if (!startLine.marker1) {
        setStartLine({marker1: coordinate, marker2: null});
        console.log('Start line marker 1 set:', coordinate);
      } else {
        setStartLine(prev => ({
          ...prev,
          marker2: coordinate,
        }));
        setSelectingStartLine(false);
        console.log('Start line marker 2 set:', coordinate);
      }
    } else if (selectingSequence) {
      setSequenceOfMarks(prev => [...prev, coordinate]);
      console.log('New sequence mark added:', coordinate);
    } else if (selectedMarkerType) {
      const newMarker = {
        coordinate,
        key: markers.length + '_' + Date.now(),
        type: selectedMarkerType,
        color:
          markerTypes.find(type => type.value === selectedMarkerType)?.color ||
          'black',
      };
      setMarkers(prevMarkers => [...prevMarkers, newMarker]);
      console.log('Marker placed:', newMarker);

      // Deactivate marker selection
      setSelectedMarkerType(null);
    }
  };

  /**
   * Starts the sailing simulation by calculating the optimal route and initiating the simulation loop.
   */
  const startSimulation = () => {
    // Validate all required inputs
    if (
      !boatPosition ||
      !startLine.marker1 ||
      !startLine.marker2 ||
      sequenceOfMarks.length === 0 ||
      !polarTable ||
      windInfo.speed === null ||
      windInfo.direction === null ||
      tideInfo.speed === null ||
      tideInfo.direction === null
    ) {
      Alert.alert(
        'Error',
        'Please ensure all inputs are set before starting the simulation.',
      );
      console.error('One or more route inputs are missing or invalid.');
      return;
    }

    // Debugging: Log all parameters before calling calculateRouteThroughMarks
    console.log('boatPosition:', boatPosition);
    console.log('startLine:', startLine);
    console.log('sequenceOfMarks:', sequenceOfMarks);
    console.log('polarTable:', polarTable);
    console.log('windInfo:', windInfo);
    console.log('tideInfo:', tideInfo);

    // Initialize remainingMarks and currentMarkIndex
    setRemainingMarks([...sequenceOfMarks]);
    setCurrentMarkIndex(0);

    // Start simulation with the first mark
    if (sequenceOfMarks.length > 0) {
      const firstMark = sequenceOfMarks[0];
      calculateAndStartRoute(boatPosition, firstMark, 0);
    }
  };

  /**
   * Calculates the route to a specific mark and starts the simulation loop for that route.
   * @param {Object} start - Starting position { latitude, longitude }
   * @param {Object} destination - Destination mark { latitude, longitude }
   * @param {number} markIndex - Index of the current mark
   */
  const calculateAndStartRoute = (start, destination, markIndex) => {
    console.log(`\nCalculating route to Mark ${markIndex + 1}:`, destination);

    const routeData = calculateRouteThroughMarks(
      start,
      [destination], // Pass single mark as array
      windInfo, // windInfo: { direction, speed }
      polarTable, // Correctly pass polarTable directly
      100, // maxIterationsPerLeg
      5, // maxWaypointsPerLeg
    );

    const {route, totalTacks, totalGybes} = routeData;

    if (!route || route.length === 0) {
      Alert.alert(
        'Error',
        'Failed to calculate route. Please check your inputs.',
      );
      console.error('Failed to calculate route. Route is empty.');
      return;
    }

    setRacePlan(route);
    setTotalTacks(prev => prev + totalTacks);
    setTotalGybes(prev => prev + totalGybes);
    simulationRef.current.currentLegIndex = 0;
    simulationRef.current.isRunning = true;
    setSimulationRunning(true);
    console.log('Simulation started with route:', route);
    console.log(`Total Tacks: ${totalTacks}, Total Gybes: ${totalGybes}`);

    // Initialize previousTackSideRef
    previousTackSideRef.current = null;

    // Start the simulation loop for this route
    runSimulationLoop(route, 0, markIndex);
  };

  /**
   * Recursively runs the simulation loop, advancing through each leg of the race plan.
   * @param {array} route - The calculated race plan.
   * @param {number} legIndex - The current leg index.
   */
  const runSimulationLoop = (route, legIndex, markIndex) => {
    if (legIndex >= route.length || !simulationRef.current.isRunning) {
      setSimulationRunning(false);
      Alert.alert('Simulation Complete', 'The race simulation has ended.');
      return;
    }

    const currentStep = route[legIndex];
    setCurrentRouteStep(currentStep);

    // Update boat status
    setBoatStatus({
      heading: currentStep.heading || 0,
      twa: currentStep.twa !== undefined ? currentStep.twa : 0,
      speed: currentStep.boatSpeed !== undefined ? currentStep.boatSpeed : 0,
      tackSide: currentStep.tackSide || 'port',
      pointOfSail: currentStep.pointOfSail || 'Run',
    });

    // Update currentTackRef based on the step's tackSide
    currentTackRef.current = currentStep.tackSide;

    // Log current step details
    console.log(`Leg ${legIndex + 1}/${route.length}:`);
    console.log(`  Action: ${currentStep.action}`);
    console.log(`  Heading: ${currentStep.heading}°`);
    console.log(`  TWA: ${currentStep.twa}°`);
    console.log(`  Speed: ${currentStep.boatSpeed} kts`);
    console.log(`  Tack Side: ${currentStep.tackSide}`);
    console.log(`  Point of Sail: ${currentStep.pointOfSail}`);
    console.log(
      `  Next Position: (${currentStep.nextPosition.latitude}, ${currentStep.nextPosition.longitude})`,
    );

    // Animate position and heading
    const duration = Math.max(
      (currentStep.time / speedMultiplier) * 1000,
      1000,
    );
    animateBoatPosition(currentStep.nextPosition, duration);
    animateBoatHeading(currentStep.heading, duration);

    // Check for tacks/gybes and display maneuver indicator if necessary
    if (
      previousTackSideRef.current &&
      previousTackSideRef.current !== currentStep.tackSide &&
      currentStep.action !== 'finish'
    ) {
      // Safely handle pointOfSail
      const sailType = currentStep.pointOfSail || '';
      let maneuver = '';

      if (sailType.includes('Close')) {
        maneuver = `Tack to ${currentStep.tackSide}`;
      } else if (sailType.includes('Broad')) {
        maneuver = `Gybe to ${currentStep.tackSide}`;
      } else {
        maneuver = `Change tack to ${currentStep.tackSide}`;
      }

      setCurrentManeuver(maneuver);
      setTimeout(() => setCurrentManeuver(null), 5000);
    }
    previousTackSideRef.current = currentStep.tackSide;

    // **Handle 'finish' action**
    if (currentStep.action === 'finish') {
      console.log(`Reached Mark ${markIndex + 1}`);
      setCurrentMarkIndex(prev => prev + 1);

      const nextMark = remainingMarks[markIndex + 1];
      if (nextMark) {
        // Proceed to the next mark
        calculateAndStartRoute(
          currentStep.nextPosition,
          nextMark,
          markIndex + 1,
        );
      } else {
        // All marks have been reached
        setSimulationRunning(false);
        simulationRef.current.isRunning = false;
        Alert.alert('Race Complete', 'You have finished the race!');
        console.log('Race simulation completed successfully.');
      }
      return; // Exit the current loop to prevent further processing
    }

    // Schedule next leg
    setTimeout(
      () => runSimulationLoop(route, legIndex + 1, markIndex),
      duration,
    );
  };

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

  /**
   * Resets the race by clearing all markers, start lines, sequences, and the race plan.
   */
  const resetRace = () => {
    setBoatPosition(null);
    setStartLine({marker1: null, marker2: null});
    setMarkers([]);
    setSequenceOfMarks([]);
    setRacePlan([]);
    setSimulationRunning(false);
    setCurrentRouteStep(null);
    setBoatStatus({
      heading: 0,
      twa: 0,
      speed: 0,
      tackSide: 'port',
      pointOfSail: 'Run',
    });
    setTotalTacks(0);
    setTotalGybes(0);
    simulationRef.current.currentLegIndex = 0;
    simulationRef.current.isRunning = false;
    currentTackRef.current = 'port';
    previousTackSideRef.current = null;
    setSpeedMultiplier(1);
    setCurrentManeuver(null);
    setSelectingBoatPosition(false);
    console.log('Race reset.');
  };

  /**
   * Clears all markers without resetting the entire race.
   */
  const clearMarkers = () => {
    setMarkers([]);
    setStartLine({marker1: null, marker2: null});
    setSequenceOfMarks([]);
    console.log('Markers cleared.');
  };

  /**
   * Restarts the race by resetting and stopping the simulation.
   */
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
        {/* Start Line Polyline */}
        {startLine.marker1 && startLine.marker2 && (
          <Polyline
            coordinates={[startLine.marker1, startLine.marker2]}
            strokeColor="red"
            strokeWidth={2}
          />
        )}

        {/* Sequence of Marks Polyline */}
        {sequenceOfMarks.length > 1 && (
          <Polyline
            coordinates={sequenceOfMarks}
            strokeColor="blue"
            strokeWidth={2}
          />
        )}

        {/* Sequence of Marks Markers */}
        {sequenceOfMarks.map((mark, index) => (
          <Marker
            key={`mark${index}`}
            coordinate={mark}
            title={`mark ${index + 1}`}
            pinColor="green"
          />
        ))}

        {/* Custom Markers */}
        {markers.map(marker => (
          <Marker
            key={marker.key}
            coordinate={marker.coordinate}
            title={marker.type}
            pinColor={marker.color}
          />
        ))}

        {/* Boat Position Marker */}
        {boatPosition && (
          <Marker.Animated
            coordinate={boatPositionAnim}
            title="Boat Starting Position"
            pinColor="blue"
            rotation={boatHeadingAnim.__getValue()}
            anchor={{x: 0.5, y: 0.5}}
          />
        )}

        {/* Race Plan Route */}
        {racePlan.length > 0 && (
          <Polyline
            coordinates={[
              boatPosition
                ? {
                    latitude: boatPosition.latitude,
                    longitude: boatPosition.longitude,
                  }
                : null,
              ...racePlan.map(step => ({
                latitude: step.nextPosition.latitude,
                longitude: step.nextPosition.longitude,
              })),
            ].filter(coord => coord !== null)} // Remove null if boatPosition is not set
            strokeColor="purple"
            strokeWidth={2}
          />
        )}
      </MapView>

      {/* Maneuver Indicator */}
      {currentManeuver && (
        <View style={styles.maneuverIndicator}>
          <Text style={styles.maneuverText}>{currentManeuver}</Text>
        </View>
      )}

      {/* Controls Container */}
      <View style={styles.controlsContainer}>
        {/* Date and Time Selection */}
        <View style={styles.row}>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text style={styles.text}>Date: {date.toDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowTimePicker(true)}>
            <Text style={styles.text}>Time: {time.toLocaleTimeString()}</Text>
          </TouchableOpacity>
        </View>

        {/* Simulation Speed Multiplier */}
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

        {/* Marker Type Picker */}
        <MarkerPicker
          selectedMarkerType={selectedMarkerType}
          setSelectedMarkerType={setSelectedMarkerType}
        />

        {/* Define Start Line and Set Sequence of Marks */}
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

        {/* Boat Starting Position Button */}
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

        {/* Simulation Controls */}
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

      {/* Wind Direction Arrow */}
      <View style={styles.windArrowContainer}>
        <WindArrow windDirection={windInfo.direction} />
        <Text style={styles.windText}>Wind Direction</Text>
      </View>

      {/* Top Container with Toggle Button and Collapsible Information Panel */}
      <View style={styles.topContainer}>
        {/* Toggle Button */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsPanelVisible(!isPanelVisible)}>
          <Text style={styles.toggleButtonText}>
            {isPanelVisible ? 'Hide Info' : 'Show Info'}
          </Text>
        </TouchableOpacity>

        {/* Collapsible Information Panel */}
        <Animated.View
          style={[
            styles.shadowContainer,
            {
              transform: [{scaleY: panelHeight}],
              opacity: panelHeight,
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
            {simulationRunning && currentRouteStep && (
              <>
                <InfoRow
                  label="Boat Heading"
                  value={`${boatStatus.heading.toFixed(1)}°`}
                />
                <InfoRow
                  label="TWA"
                  value={`${
                    boatStatus.twa !== undefined
                      ? boatStatus.twa.toFixed(1)
                      : '0.0'
                  }°`}
                />
                <InfoRow
                  label="Speed"
                  value={`${
                    boatStatus.speed !== undefined
                      ? boatStatus.speed.toFixed(1)
                      : '0.0'
                  } kts`}
                />
                <InfoRow label="Tack Side" value={`${boatStatus.tackSide}`} />
                <InfoRow
                  label="Point of Sail"
                  value={`${boatStatus.pointOfSail}`}
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
            {/* Display Total Tacks and Gybes */}
            <InfoRow label="Total Tacks" value={`${totalTacks}`} />
            <InfoRow label="Total Gybes" value={`${totalGybes}`} />
          </View>
        </Animated.View>
      </View>

      {/* Date Picker */}
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

      {/* Time Picker */}
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
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
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
  toggleButtonText: {
    fontSize: 16,
    color: '#333',
  },
  shadowContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 10,
    overflow: 'hidden', // Important to hide content when height is 0
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
  maneuverText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeButton: {
    backgroundColor: '#008000', // Green color to indicate active state
  },
  windArrowContainer: {
    position: 'absolute',
    top: 130, // Adjusted to place below the information panel
    right: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  windText: {
    marginTop: 5,
    fontSize: 14,
    color: '#333',
  },
});

export default RaceOverviewScreen;
