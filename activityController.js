const { Activity, Comment, Like, User, Sequelize } = require('../models'); // Import necessary models
const { processGPXFile } = require('./gpxProcessor');

// Function to handle uploading activity
const uploadActivity = async (req, res) => {
  const userId = req.body.userId;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const activity = await processGPXFile(file.path, userId);
    res.status(201).json({ message: 'Activity uploaded successfully', activity });
  } catch (error) {
    console.error('Failed to upload activity:', error);
    res.status(500).json({ error: 'Failed to upload activity' });
  }
};

// Function to get user activities
const getUserActivities = async (req, res) => {
  const userId = req.params.userId;

  try {
    const activities = await Activity.findAll({
      where: { userId },
      attributes: [
        'id',
        'userId',
        'name',
        'trackPoints',
        'date',
        'totalDistanceNm',
        'averageSpeed',
        'totalDuration',
        'heartRate',
        'elevation',
        'createdAt',
        'updatedAt',
        [
          Sequelize.literal(`(
            SELECT COUNT(*)
            FROM comments AS comment
            WHERE comment.activity_id = "Activity"."id"
          )`),
          'commentCount'
        ],
      ],
    });

    res.status(200).json({ activities });
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

// Function to delete an activity
const deleteActivity = async (req, res) => {
  const { userId, activityId } = req.params;

  try {
    await Activity.destroy({ where: { id: activityId, userId } });
    res.status(200).json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Failed to delete activity:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
};

// Function to get comments for a specific activity
const getComments = async (req, res) => {
  const { activityId } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { activityId },
      include: [
        {
          model: User,
          attributes: ['username'], // Fetch only the username from the User model
        },
      ],
      attributes: ['comment', 'createdAt'], // Fetch only necessary fields from Comment
      order: [['createdAt', 'DESC']],
    });

    // Format the comments with username and createdAt
    const formattedComments = comments.map(comment => ({
      username: comment.User.username, // Access the included User's username
      comment: comment.comment,
      createdAt: comment.createdAt,
    }));

    res.status(200).json({ comments: formattedComments });
  } catch (error) {
    console.error('Failed to fetch comments:', error.message);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};


const addComment = async (req, res) => {
  const { activityId } = req.params;
  const { userId, comment } = req.body;

  console.log("Received data for addComment:", { userId, activityId, comment });

  if (!userId) {
    return res.status(400).json({ error: "userId is required in the request body" });
  }

  try {
    // Create the new comment
    await Comment.create({
      userId,
      activityId,
      comment,
    });

    // Fetch the updated comment count
    const updatedCommentCount = await Comment.count({ where: { activityId } });

    res.status(201).json({ message: 'Comment added successfully', commentCount: updatedCommentCount });
  } catch (error) {
    console.error('Failed to add comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Function to like an activity
const likeActivity = async (req, res) => {
  const { activityId } = req.params;
  const { userId } = req.body;

  try {
    const existingLike = await Like.findOne({ where: { userId, activityId } });

    if (existingLike) {
      return res.status(400).json({ error: 'Activity already liked' });
    }

    const newLike = await Like.create({
      userId,
      activityId
    });
    res.status(201).json({ message: 'Activity liked successfully', newLike });
  } catch (error) {
    console.error('Failed to like activity:', error);
    res.status(500).json({ error: 'Failed to like activity' });
  }
};

// Function to unlike an activity
const unlikeActivity = async (req, res) => {
  const { activityId } = req.params;
  const { userId } = req.body;

  try {
    const existingLike = await Like.findOne({ where: { userId, activityId } });

    if (!existingLike) {
      return res.status(404).json({ error: 'Like not found' });
    }

    await Like.destroy({ where: { userId, activityId } });
    res.status(200).json({ message: 'Activity unliked successfully' });
  } catch (error) {
    console.error('Failed to unlike activity:', error);
    res.status(500).json({ error: 'Failed to unlike activity' });
  }
};

// Export all functions using module.exports
module.exports = {
  getUserActivities,
  uploadActivity,
  deleteActivity,
  getComments,
  addComment,
  likeActivity,
  unlikeActivity,
};
