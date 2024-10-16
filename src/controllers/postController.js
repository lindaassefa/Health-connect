const Post = require('../models/post');
const User = require('../models/user');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const userId = req.user.id;

    // Handle image upload (if there's an image)
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

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
      where: { userId }, // Filter posts by the user's ID
      include: {
        model: User,
        as: 'user',
        attributes: ['username', 'profilePicture']
      },
      order: [['createdAt', 'DESC']]  // Order posts by most recent
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Error fetching posts' });
  }
};
