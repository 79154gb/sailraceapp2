import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';

const RaceOverviewScreen = ({route}) => {
  const {
    raceStartTime,
    windSpeed,
    windDirection,
    tideSpeed,
    tideDirection,
    passToOverview,
  } = route.params;

  const [timer, setTimer] = useState('10:00');
  const intervalRef = useRef(null);
  const [windDirectionRotation, setWindDirectionRotation] = useState(0);

  useEffect(() => {
    if (passToOverview && raceStartTime) {
      const [hours, mins] = raceStartTime.split(':').map(Number);
      const raceTime = new Date();
      raceTime.setHours(hours);
      raceTime.setMinutes(mins);
      raceTime.setSeconds(0);

      const updateTimer = () => {
        const currentTime = new Date();
        const timeDifference =
          raceTime.getTime() - currentTime.getTime() - 600000; // 10 minutes before race start
        if (timeDifference <= 0) {
          clearInterval(intervalRef.current);
          setTimer('00:00');
        } else {
          const minutes = Math.floor(timeDifference / 60000);
          const seconds = Math.floor((timeDifference % 60000) / 1000);
          setTimer(
            `${minutes.toString().padStart(2, '0')}:${seconds
              .toString()
              .padStart(2, '0')}`,
          );
        }
      };

      intervalRef.current = setInterval(updateTimer, 1000);

      return () => clearInterval(intervalRef.current);
    }
  }, [raceStartTime, passToOverview]);

  useEffect(() => {
    if (windDirection !== undefined) {
      const rotation = windDirection % 360; // Ensure rotation is within 0 to 359 degrees
      setWindDirectionRotation(rotation);
    }
  }, [windDirection]);

  const startTimer = () => {
    clearInterval(intervalRef.current);
    setTimer('10:00');
    intervalRef.current = setInterval(() => {
      setTimer(prevTimer => {
        const [prevMinutes, prevSeconds] = prevTimer.split(':').map(Number);
        if (prevMinutes === 0 && prevSeconds === 0) {
          clearInterval(intervalRef.current);
          return '00:00';
        }
        const totalSeconds = prevMinutes * 60 + prevSeconds - 1;
        const newMinutes = Math.floor(totalSeconds / 60);
        const newSeconds = totalSeconds % 60;
        return `${newMinutes.toString().padStart(2, '0')}:${newSeconds
          .toString()
          .padStart(2, '0')}`;
      });
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.compassContainer}>
        <Icon
          name="arrow-up"
          size={30}
          color="black"
          style={{transform: [{rotate: `${windDirectionRotation}deg`}]}}
        />
      </View>
      <View style={styles.legendContainer}>
        {['Windward', 'Leeward', 'Starting Line'].map((label, index) => (
          <Text key={index} style={styles.legendItem}>
            {label}
          </Text>
        ))}
      </View>
      <View style={styles.raceCourseGrid}>
        <View style={styles.water} />
        {[...Array(10)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.gridLine,
              styles.verticalGridLine,
              {left: `${(100 / 10) * (index + 1)}%`},
            ]}
          />
        ))}
        {[...Array(10)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.gridLine,
              styles.horizontalGridLine,
              {top: `${(100 / 10) * (index + 1)}%`},
            ]}
          />
        ))}
        <View
          style={[styles.marker, styles.markerStart, {top: '20%', left: '50%'}]}
        />
        <View
          style={[
            styles.marker,
            styles.markerWindward,
            {top: '10%', left: '50%'},
          ]}
        />
        <View
          style={[styles.marker, styles.markerReach, {top: '50%', left: '70%'}]}
        />
        <View
          style={[
            styles.marker,
            styles.markerLeeward,
            {top: '90%', left: '20%'},
          ]}
        />
      </View>
      <View style={styles.weatherInfo}>
        <View style={styles.weatherItem}>
          <Text style={styles.weatherText}>
            Wind: {windSpeed ? windSpeed.toFixed(2) : 'N/A'} knots{' '}
            {windDirection ? windDirection.toFixed(2) : 'N/A'}°
          </Text>
        </View>
        <View style={styles.weatherItem}>
          <Icon name="air" size={25} color="black" />
          <Text style={styles.weatherText}>
            Tide: {tideSpeed ? tideSpeed.toFixed(2) : 'N/A'} knots{' '}
            {tideDirection ? tideDirection.toFixed(2) : 'N/A'}°
          </Text>
        </View>
        <Text style={styles.timer}>Timer: {timer}</Text>
        <Button title="Start Timer" onPress={startTimer} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  compassContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 20,
  },
  legendItem: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  raceCourseGrid: {
    width: 300,
    height: 300,
    borderWidth: 1,
    borderColor: 'black',
    position: 'relative',
    marginTop: 20,
  },
  gridLine: {
    position: 'absolute',
    borderColor: 'black',
    borderWidth: 0.5,
  },
  horizontalGridLine: {
    width: '100%',
    height: 0,
  },
  verticalGridLine: {
    height: '100%',
    width: 0,
  },
  water: {
    flex: 1,
    backgroundColor: 'lightblue',
  },
  marker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
  },
  markerWindward: {
    backgroundColor: 'red',
  },
  markerReach: {
    backgroundColor: 'yellow',
  },
  markerLeeward: {
    backgroundColor: 'green',
  },
  markerStart: {
    backgroundColor: 'blue',
  },
  weatherInfo: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  weatherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  weatherText: {
    fontSize: 16,
    marginLeft: 5,
  },
  timer: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RaceOverviewScreen;
