import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {getComments, postComment} from '../api/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const CommentsScreen = ({route, navigation}) => {
  const {activityId, userId} = route.params;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await getComments(userId, activityId);
        console.log('Comments data received:', response);
        setComments(response?.comments || []);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      }
    };

    fetchComments();
  }, [activityId, userId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      return;
    }

    try {
      await postComment(userId, activityId, newComment);
      setNewComment('');
      // Refetch comments to update list with latest data from backend
      const response = await getComments(userId, activityId);
      setComments(response?.comments || []);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  const renderComment = ({item}) => {
    const username = item.username || 'Anonymous';
    const relativeTimeString = dayjs(item.createdAt).isValid()
      ? dayjs(item.createdAt).fromNow()
      : 'Invalid Date';

    return (
      <View style={styles.commentItem}>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.commentText}>{item.comment}</Text>
        <Text style={styles.timeAgo}>{relativeTimeString}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item, index) =>
          `${item.username || 'Anonymous'}-${index}`
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Add a comment..."
        value={newComment}
        onChangeText={setNewComment}
        autoCorrect={false}
        autoCapitalize="none"
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={handleSubmit}>
          <Text style={styles.button}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.button}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ddd',
  },
  commentItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  username: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
    marginBottom: 5,
  },
  commentText: {
    color: '#666',
    fontSize: 14,
  },
  timeAgo: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    marginBottom: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    color: 'blue',
    fontSize: 16,
    padding: 8,
  },
});

export default CommentsScreen;
