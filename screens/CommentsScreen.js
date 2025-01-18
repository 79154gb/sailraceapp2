import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {getComments} from '../api/api';

const CommentsScreen = ({route}) => {
  const {activityId, userId} = route.params;
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const responseComments = await getComments(userId, activityId);
        console.log('Fetched comments:', responseComments);
        setComments(responseComments || []); // Set comments directly
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      }
    };

    fetchComments();
  }, [activityId, userId]);

  const renderComment = ({item}) => {
    console.log('Rendering item:', item); // Log each item for verification
    return (
      <View style={styles.commentItem}>
        <Text style={styles.username}>{item.username || 'Anonymous'}</Text>
        <Text style={styles.commentText}>{item.comment}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item, index) => `${item.username}-${index}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
});

export default CommentsScreen;
