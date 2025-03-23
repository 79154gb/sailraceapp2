import React, {useEffect, useState, useCallback} from 'react';
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
  deleteComment, // New: import deleteComment API function
} from '../api/api';
import MapItem from '../components/MapItem';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const ActivitiesScreen = ({route, navigation}) => {
  const {userId} = route.params;
  const [activities, setActivities] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Fetch activities on mount
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

  // Memoized fetchCommentsForModal to resolve ESLint dependencies
  const fetchCommentsForModal = useCallback(async () => {
    if (selectedActivityId) {
      try {
        const response = await getComments(userId, selectedActivityId);
        console.log(
          'Fetched comments for modal (activity ' + selectedActivityId + '):',
          response,
        );
        // Handle response shape: if it's an array use it directly; otherwise, use response.comments
        const fetchedComments = Array.isArray(response)
          ? response
          : response?.comments;
        setComments(fetchedComments || []);
      } catch (error) {
        console.error('Failed to fetch comments for modal:', error);
      }
    }
  }, [selectedActivityId, userId]);

  // When the modal is open, fetch its comments
  useEffect(() => {
    if (commentModalVisible) {
      fetchCommentsForModal();
    }
  }, [commentModalVisible, fetchCommentsForModal]);

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
      // Since likeActivity returns response.data, capture it directly
      const data = await likeActivity(userId, activityId);
      const {likeCount} = data;
      setActivities(prevActivities =>
        prevActivities.map(activity =>
          activity.id === activityId ? {...activity, likeCount} : activity,
        ),
      );
    } catch (error) {
      console.error('Failed to like activity:', error);
    }
  };

  // Open comment modal and ensure the selectedActivityId is set first
  const handleOpenCommentModal = activityId => {
    setSelectedActivityId(activityId);
    setTimeout(() => {
      setCommentModalVisible(true);
    }, 0);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      return;
    }
    try {
      const {commentCount} = await addComment(
        userId,
        selectedActivityId,
        newComment,
      );
      // Update comment count locally for the activity
      setActivities(
        activities.map(activity =>
          activity.id === selectedActivityId
            ? {...activity, commentCount}
            : activity,
        ),
      );
      // Re-fetch comments for the modal
      const response = await getComments(userId, selectedActivityId);
      const updatedComments = Array.isArray(response)
        ? response
        : response?.comments || [];
      console.log(
        'After adding, fetched comment length:',
        updatedComments.length,
      );
      setComments(updatedComments);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  // Handler for deleting a comment
  const handleDeleteComment = async commentId => {
    try {
      await deleteComment(userId, selectedActivityId, commentId);
      // Re-fetch comments after deletion
      fetchCommentsForModal();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  // Render each comment with a relative timestamp and a Delete button
  const renderCommentItem = ({item}) => {
    const username = item.username || 'Anonymous';
    const relativeTimeString = dayjs(item.createdAt).isValid()
      ? dayjs(item.createdAt).fromNow()
      : 'Invalid Date';
    return (
      <View style={styles.commentItem}>
        <Text style={styles.commentUser}>{username}</Text>
        <Text style={styles.commentText}>{item.comment}</Text>
        <Text style={styles.commentDate}>{relativeTimeString}</Text>
        <TouchableOpacity
          onPress={() => handleDeleteComment(item.id)}
          style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCommentInput = () => (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.commentInput}
        placeholder="Add a comment..."
        value={newComment}
        onChangeText={setNewComment}
        autoCorrect={false}
        autoCapitalize="none"
        blurOnSubmit={false}
      />
      <View style={styles.modalButtons}>
        <Button title="Submit" onPress={handleAddComment} />
        <Button title="Close" onPress={() => setCommentModalVisible(false)} />
      </View>
    </View>
  );

  const renderItem = ({item}) => (
    <MapItem
      item={item}
      commentCount={item.commentCount}
      likeCount={item.likeCount} // Pass the likeCount prop
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
            <Text style={styles.modalHeader}>Comments ({comments.length})</Text>
            <View style={styles.commentListContainer}>
              {comments.length > 0 ? (
                <FlatList
                  // Reverse the comments array so the most recent comment is at the bottom
                  data={[...comments].reverse()}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={renderCommentItem}
                  keyboardShouldPersistTaps="always"
                />
              ) : (
                <Text style={styles.noCommentsText}>No comments yet.</Text>
              )}
            </View>
            {renderCommentInput()}
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
    textAlign: 'center',
  },
  recordButton: {
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  commentListContainer: {
    flex: 1,
    marginBottom: 10,
  },
  commentItem: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  commentUser: {
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#333',
  },
  commentText: {
    fontSize: 14,
    marginBottom: 3,
    color: '#333',
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    marginTop: 5,
  },
  deleteButtonText: {
    color: 'red',
    fontSize: 12,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 10,
  },
  commentInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    width: '100%',
    paddingHorizontal: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noCommentsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});

export default ActivitiesScreen;
