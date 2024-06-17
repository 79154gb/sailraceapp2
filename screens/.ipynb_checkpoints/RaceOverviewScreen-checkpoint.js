import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, {Marker} from 'react-native-maps';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Entypo';
import Icon1 from 'react-native-vector-icons/Feather';

const markerTypes = [
  {label: 'Start Mark 1', value: 'start1', color: 'blue'},
  {label: 'Start Mark 2', value: 'start2', color: 'cyan'},
  {label: 'Windward Mark', value: 'windward', color: 'red'},
  {label: 'Leeward Mark', value: 'leeward', color: 'green'},
  {label: 'Reach Mark', value: 'reach', color: 'yellow'},
];

const RaceOverviewScreen = () => {
  const [markers, setMarkers] = useState([]);
  const [selectedMarkerType, setSelectedMarkerType] = useState(markerTypes[0]);
  const [showModal, setShowModal] = useState(false);
  const [windArrows, setWindArrows] = useState([]);
  const [storedWindData, setStoredWindData] = useState(null); // State to store wind data
  const [windSpeed, setWindSpeed] = useState(null); // State to store wind speed
  const [tideInfo, setTideInfo] = useState(null); // State to store tide information
  const [date, setDate] = useState(new Date()); // State to store selected date
  const [time, setTime] = useState(new Date()); // State to store selected time
  const [showDatePicker, setShowDatePicker] = useState(false); // State to show/hide date picker
  const [showTimePicker, setShowTimePicker] = useState(false); // State to show/hide time picker
  const [visibleRegion, setVisibleRegion] = useState(null); // State to store visible map region
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchWindData = async () => {
      if (!visibleRegion) {
        return;
      } // Don't proceed if visibleRegion is null

      const gridSize = 6; // Adjust the grid size as needed
      const {latitude, longitude, latitudeDelta, longitudeDelta} =
        visibleRegion;
      console.log('Latitude:', latitude);
      console.log('Longitude:', longitude);

      // Calculate latitude and longitude grid points
      const latStep = latitudeDelta / gridSize;
      const longStep = longitudeDelta / gridSize;
      const gridPoints = [];
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const lat = latitude + latStep * i;
          const long = longitude + longStep * j;
          gridPoints.push({latitude: lat, longitude: long});
          console.log('API Request Latitude:', lat, 'Longitude:', long); // Log API request latitude and longitude
        }
      }

      // Create arrows initially with the same latitudes and longitudes as grid points
      const arrows = gridPoints.map(point => ({
        latitude: point.latitude,
        longitude: point.longitude,
        windSpeed: null,
        windGusts: null,
        windDirection: null,
      }));

      // Make API requests for wind data for each grid point
      const promises = gridPoints.map(point => {
        const location = `${point.latitude},${point.longitude}`;
        const startDate = formatDate(date); // Format selected date
        const endDate = formatDate(date);
        const apiKey = 'XJP7QFLSXN7JSLWWKHBPPLEHC';

        const apiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${startDate}/${endDate}?key=${apiKey}`;
        return axios.get(apiUrl);
      });

      try {
        const responses = await Promise.all(promises);
        responses.forEach((response, index) => {
          console.log(`Response for Point ${index}:`, response.data);
          const data = response.data.days[0].hours;
          // Ensure data is correctly mapped
          if (data && data.length > 0) {
            data.forEach(hour => {
              console.log(`Hour data for Point ${index}:`, hour);
              arrows[index].windSpeed = hour.windSpeed;
              arrows[index].windGusts = hour.windGust;
              arrows[index].windDirection = hour.winddir;
            });
          } else {
            console.warn(`No hourly data found for Point ${index}`);
          }
        });
        console.log('Arrows:', arrows); // Log the arrows array
        setWindArrows(arrows);
        setStoredWindData(arrows); // Store the wind data
        if (responses[0].data.days[0].hours.length > 0) {
          setWindSpeed(responses[0].data.days[0].hours[0].windSpeed); // Set wind speed
          setTideInfo(responses[0].data.days[0].hours[0].tideInfo); // Set tide information
        }
      } catch (error) {
        console.error('Error fetching wind data:', error);
      }
    };

    // Fetch wind data to display wind arrows on the map
    fetchWindData();
  }, [visibleRegion, date]);

  const formatDate = formattedDate => {
    const year = formattedDate.getFullYear();
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = formattedDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleMapPress = event => {
    const newMarker = {
      coordinate: event.nativeEvent.coordinate,
      key: `${markers.length}`,
      type: selectedMarkerType,
      color: selectedMarkerType.color,
    };
    setMarkers([...markers, newMarker]);
  };

  const handleMarkerDragEnd = (event, index) => {
    const updatedMarkers = [...markers];
    updatedMarkers[index].coordinate = event.nativeEvent.coordinate;
    setMarkers(updatedMarkers);
  };

  const zoomIn = () => {
    mapRef.current.animateCamera({zoom: 1}, {duration: 1000});
  };

  const zoomOut = () => {
    mapRef.current.animateCamera({zoom: -1}, {duration: 1000});
  };

  const onRegionChangeComplete = region => {
    setVisibleRegion(region); // Update visibleRegion state when the map region changes
  };

  const renderModalItem = ({item}) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setSelectedMarkerType(item);
        setShowModal(false);
      }}>
      <Text>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* MapView */}
      <MapView
        ref={mapRef}
        style={styles.map}
        onPress={handleMapPress}
        onRegionChangeComplete={onRegionChangeComplete} // Update visibleRegion on map region change
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        zoomEnabled={true}>
        {/* Display markers */}
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

        {/* Display wind arrows */}
        {windArrows.map((arrow, index) => (
          <Marker
            key={index}
            coordinate={{latitude: arrow.latitude, longitude: arrow.longitude}}
            title={`Wind: ${arrow.windSpeed} knots`}
            description={`Direction: ${arrow.windDirection}°`}>
            <View style={{transform: [{rotate: `${arrow.windDirection}deg`}]}}>
              <Icon name="arrow-up" size={10} color="white" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Information panel */}
      <View style={styles.infoContainer}>
        {/* Date Picker */}
        <TouchableOpacity
          style={styles.infoItem}
          onPress={() => setShowDatePicker(true)}>
          <Icon name="calendar" size={20} color="black" />
          <Text style={styles.infoText}>Date: {formatDate(date)}</Text>
        </TouchableOpacity>

        {/* Time Picker */}
        <TouchableOpacity
          style={styles.infoItem}
          onPress={() => setShowTimePicker(true)}>
          <Icon name="clock" size={20} color="black" />
          <Text style={styles.infoText}>Time: {time.toLocaleTimeString()}</Text>
        </TouchableOpacity>

        {/* Wind */}
        <View style={styles.infoItem}>
          <Icon1 name="wind" size={20} color="black" />
          <Text style={styles.infoText}>Wind: {windSpeed} knots</Text>
        </View>

        {/* Tide */}
        <View style={styles.infoItem}>
          <Icon name="water" size={20} color="black" />
          <Text style={styles.infoText}>Tide: {tideInfo}</Text>
        </View>

        {/* Marker type selector */}
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setShowModal(true)}>
          <Text>{selectedMarkerType.label}</Text>
        </TouchableOpacity>
      </View>

      {/* Button to clear markers */}
      <View style={styles.buttonContainer}>
        <Button title="Clear Markers" onPress={() => setMarkers([])} />
      </View>

      {/* Zoom In/Out Buttons */}
      <View style={styles.zoomButtons}>
        <TouchableOpacity onPress={zoomIn} style={styles.zoomButton}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={zoomOut} style={styles.zoomButton}>
          <Text style={styles.zoomText}>-</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
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

      {/* Time Picker Modal */}
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

      {/* Marker type modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={markerTypes}
              renderItem={renderModalItem}
              keyExtractor={item => item.value}
            />
          </View>
        </View>
      </Modal>
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
  infoContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 5,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  zoomButtons: {
    position: 'absolute',
    bottom: 100,
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
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
});

export default RaceOverviewScreen;
