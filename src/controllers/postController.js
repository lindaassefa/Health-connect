const Post = require('../models/post');
const User = require('../models/user');
const axios = require('axios'); // Import axios to handle API requests to the FastAPI service

// Create a new post (text-only thoughts or image posts)
exports.createPost = async (req, res) => {
  try {
    const { caption, isThought } = req.body; // `isThought` field to distinguish posts
    const userId = req.user.id;

    // Run moderation on caption if it's a thought or contains text
    if (caption && isThought) {
      try {
        // Call the moderation API
        const moderationResponse = await axios.post('http://localhost:8000/api/moderate', {
          text: caption,
        });

        const moderationResult = moderationResponse.data;

        // Check if the content is flagged as inappropriate
        if (moderationResult.is_toxic) {
          return res.status(400).json({ message: moderationResult.recommendation });
        }
      } catch (error) {
        console.error('Error in content moderation:', error);
        return res.status(500).json({ error: 'Error processing content. Please try again later.' });
      }
    }

    // Handle image upload for image posts, skip for thoughts
    const imageUrl = isThought ? null : (req.file ? `/uploads/${req.file.filename}` : null);

    // Create the post
    const post = await Post.create({
      caption,
      imageUrl,
      userId
    });

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Error creating post' });
  }
};

// Get posts for the logged-in user only
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const posts = await Post.findAll({
      where: { userId },
      include: {
        model: User,
        as: 'user',
        attributes: ['username', 'profilePicture']
      },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Error fetching posts' });
  }
};
