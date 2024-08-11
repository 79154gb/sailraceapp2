import React, {useEffect, useState} from 'react';
import {View, Button, FlatList, StyleSheet} from 'react-native';
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
        colors={['#222831', '#37414f']}
        style={styles.background}
      />
      <FlatList
        data={activities}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
      <Button
        title="Upload Activity"
        onPress={() => navigation.navigate('UploadActivityScreen', {userId})}
        color="#FFAC94"
      />
      <Button
        title="Record Activity"
        onPress={() => navigation.navigate('RecordActivityScreen', {userId})}
        color="#FFAC94"
        style={styles.recordButton}
      />
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
  recordButton: {
    marginTop: 10,
  },
});

export default ActivitiesScreen;
