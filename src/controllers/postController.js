const Post = require('../models/post');
const User = require('../models/user');
const Likes = require('../models/likes');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

exports.createPost = async (req, res) => {
  try {
    const { caption, isThought } = req.body;
    const userId = req.user.id;
    let imageUrl = null;

    if (req.file) {
      console.log('Uploaded file path:', req.file.path);
      imageUrl = `/uploads/${req.file.filename}`;
      const formData = new FormData();
      formData.append('file', fs.createReadStream(req.file.path));

      const moderationResponse = await axios.post(
        'http://127.0.0.1:8000/api/moderate-image',  // Changed to IPv4
        formData,
        { headers: { ...formData.getHeaders() } }
      );
      console.log('Image moderation response:', moderationResponse.data);

      if (moderationResponse.data.is_toxic) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: moderationResponse.data.recommendation });
      }
    }

    if (caption && isThought) {
      console.log('Moderating caption:', caption);
      const moderationResponse = await axios.post('http://127.0.0.1:8000/api/moderate', { text: caption }); // Changed to IPv4
      console.log('Caption moderation response:', moderationResponse.data);

      if (moderationResponse.data.is_toxic) {
        return res.status(400).json({ message: moderationResponse.data.recommendation });
      }
    }

    const post = await Post.create({ caption, imageUrl, userId });
    const postWithUser = await Post.findOne({
      where: { id: post.id },
      include: [
        { model: User, as: 'user', attributes: ['username', 'profilePicture'] },
        { model: Likes }
      ],
    });

    const postWithLikes = {
      ...postWithUser.toJSON(),
      likeCount: 0,
      isLiked: false
    };
    console.log('Post created successfully:', postWithLikes);

    res.status(201).json({ message: 'Post created successfully', post: postWithLikes });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const post = await Post.findAll({
      where: { userId },
      include: [
        { model: User, as: 'user', attributes: ['username', 'profilePicture'] },
        { model: Likes }
      ],
      order: [['createdAt', 'DESC']],
    });

    const postsWithLikes = post.map(post => ({
      ...post.toJSON(),
      likeCount: post.Likes.length,
      isLiked: post.Likes.some(like => like.userId === userId)
    }));

    res.status(200).json(postsWithLikes);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    // Find the post and check ownership
    const post = await Post.findOne({
      where: {
        id: postId,
        userId: userId // Ensure the post belongs to the user
      }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

    // If post has an image, delete it from uploads
    if (post.imageUrl) {
      const imagePath = `./uploads/${post.imageUrl.split('/').pop()}`;
      try {
        fs.unlinkSync(imagePath);
      } catch (error) {
        console.error('Error deleting image file:', error);
      }
    }

    // Delete the post
    await post.destroy();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
};