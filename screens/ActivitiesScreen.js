import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity, Text, FlatList, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {getUserActivities, deleteActivity} from '../api/api'; // Make sure deleteActivity is imported
import MapItem from '../components/MapItem';

const ActivitiesScreen = ({route, navigation}) => {
  const {userId} = route.params;
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const activities = await getUserActivities(userId);
        setActivities(activities);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      }
    };

    fetchActivities();
  }, [userId]);

  const handleDelete = async activityId => {
    try {
      await deleteActivity(userId, activityId); // Call the API to delete the activity
      setActivities(activities.filter(activity => activity.id !== activityId)); // Update the state to remove the deleted activity
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  };

  const renderItem = ({item}) => (
    <MapItem item={item} onDelete={handleDelete} />
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#000000']}
        style={styles.background}
      />
      <FlatList
        data={activities}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('UploadActivityScreen', {userId})}>
        <Text style={styles.buttonText}>Upload Activity</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.recordButton]}
        onPress={() => navigation.navigate('RecordActivityScreen', {userId})}>
        <Text style={styles.buttonText}>Record Activity</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  button: {
    backgroundColor: '#37414f', // Consistent with the other buttons
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#9af4fd', // Consistent text color
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordButton: {
    marginTop: 10,
  },
});

export default ActivitiesScreen;
