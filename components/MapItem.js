import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import MapView, {Polyline} from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MapItem = ({item, onDelete}) => {
  const mapRef = useRef(null);
  const coordinates = item.trackPoints.map(point => ({
    latitude: parseFloat(point.lat),
    longitude: parseFloat(point.lon),
  }));

  useEffect(() => {
    if (mapRef.current && coordinates.length > 0) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        },
        animated: true,
      });
    }
  }, [coordinates]);

  return (
    <View style={styles.item}>
      <View style={styles.header}>
        <Text style={styles.title}>{item.name}</Text>
        <Icon
          name="delete"
          size={24}
          color="red"
          onPress={() => onDelete(item.id)}
        />
      </View>
      <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
      <Text style={styles.info}>
        Distance: {item.totalDistanceNm.toFixed(2)} NM
      </Text>
      <Text style={styles.info}>
        Duration: {(item.totalDuration / 3600).toFixed(2)} hours
      </Text>
      <Text style={styles.info}>
        Average Speed: {item.averageSpeed.toFixed(2)} knots
      </Text>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: coordinates[0].latitude,
            longitude: coordinates[0].longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}>
          <Polyline
            coordinates={coordinates}
            strokeWidth={2}
            strokeColor="blue"
          />
        </MapView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 20,
    marginVertical: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    backgroundColor: '#37414f',
    borderRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9af4fd',
  },
  date: {
    color: '#9af4fd',
  },
  info: {
    color: '#9af4fd',
  },
  mapContainer: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width - 80,
    height: 200,
    borderRadius: 10,
  },
});

export default MapItem;
