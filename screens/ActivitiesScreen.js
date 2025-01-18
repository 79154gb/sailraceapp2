import React, {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  getUserActivities,
  deleteActivity,
  likeActivity,
  addComment,
  getComments,
} from '../api/api';
import MapItem from '../components/MapItem';

const ActivitiesScreen = ({route, navigation}) => {
  const {userId} = route.params;
  const [activities, setActivities] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const activities = await getUserActivities(userId);
        setActivities(activities); // Each activity now contains its `commentCount`
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      }
    };

    fetchActivities();
  }, [userId]);

  const handleDelete = async activityId => {
    try {
      await deleteActivity(userId, activityId);
      setActivities(activities.filter(activity => activity.id !== activityId));
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  };

  const handleLike = async activityId => {
    try {
      await likeActivity(userId, activityId);
    } catch (error) {
      console.error('Failed to like activity:', error);
    }
  };

  const handleOpenCommentModal = async activityId => {
    setSelectedActivityId(activityId);
    try {
      const fetchedComments = await getComments(userId, activityId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
    setCommentModalVisible(true);
  };

  const handleAddComment = async () => {
    if (newComment.trim() === '') {
      return;
    }

    try {
      const {commentCount} = await addComment(
        userId,
        selectedActivityId,
        newComment,
      );

      // Update comment count locally for the specific activity
      setActivities(
        activities.map(activity =>
          activity.id === selectedActivityId
            ? {...activity, commentCount}
            : activity,
        ),
      );

      // Optionally clear the input field and close the modal
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const renderItem = ({item}) => (
    <MapItem
      item={item}
      commentCount={item.commentCount} // Display updated comment count
      onDelete={() => handleDelete(item.id)}
      onLike={() => handleLike(item.id)}
      onComment={() => handleOpenCommentModal(item.id)}
    />
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

      {/* Comment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentModalVisible}
        onRequestClose={() => setCommentModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <FlatList
              data={comments}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <Text style={styles.commentText}>{item.comment}</Text>
              )}
            />
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
            />
            <Button title="Submit" onPress={handleAddComment} />
            <Button
              title="Close"
              onPress={() => setCommentModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#37414f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#EAECEC',
    fontSize: 18,
    fontWeight: 'normal',
    textAlign: 'center',
  },
  recordButton: {
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  commentText: {
    marginBottom: 10,
    fontSize: 10,
    color: '#333',
  },
  commentInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
});

export default ActivitiesScreen;
