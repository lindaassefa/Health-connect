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
      
      // Use FastAPI moderation endpoint for images
      try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));
        
        const moderationResponse = await axios.post(
          'http://127.0.0.1:8000/api/moderate-image',
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
          }
        );
        console.log('Image moderation response:', moderationResponse.data);

        if (moderationResponse.data.is_toxic) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ 
            message: moderationResponse.data.recommendation,
            details: 'Image content violates community guidelines'
          });
        }
      } catch (moderationError) {
        console.error('Image moderation failed:', moderationError.message);
        // For safety, reject posts if moderation service is down
        fs.unlinkSync(req.file.path);
        return res.status(500).json({ 
          message: 'Image moderation service unavailable. Please try again later.',
          error: 'Moderation service error'
        });
      }
    }

    // Always moderate text content if caption exists
    if (caption) {
      console.log('Moderating caption:', caption);
      try {
        const moderationResponse = await axios.post('http://127.0.0.1:8000/api/moderate', { 
          text: caption,
          threshold: 0.6  // Lower threshold for stricter moderation
        });
        console.log('Caption moderation response:', moderationResponse.data);

        if (moderationResponse.data.is_toxic) {
          // If image was uploaded, delete it before rejecting
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return res.status(400).json({ 
            message: moderationResponse.data.recommendation,
            details: 'Content violates community guidelines'
          });
        }
      } catch (moderationError) {
        console.error('Caption moderation failed:', moderationError.message);
        // For safety, reject posts if moderation service is down
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ 
          message: 'Content moderation service unavailable. Please try again later.',
          error: 'Moderation service error'
        });
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

exports.getAllPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const posts = await Post.findAll({
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'username', 'profilePicture'] 
        },
        { 
          model: Likes 
        }
      ],
      order: [['createdAt', 'DESC']],
    });

    const postsWithLikes = posts.map(post => ({
      ...post.toJSON(),
      likeCount: post.Likes.length,
      isLiked: post.Likes.some(like => like.userId === userId)
    }));

    res.status(200).json(postsWithLikes);
  } catch (error) {
    console.error('Error fetching all posts:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const posts = await Post.findAll({
      where: { userId },
      include: [
        { model: User, as: 'user', attributes: ['username', 'profilePicture'] },
        { model: Likes }
      ],
      order: [['createdAt', 'DESC']],
    });

    const postsWithLikes = posts.map(post => ({
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

    const post = await Post.findOne({
      where: {
        id: postId,
        userId: userId
      }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

    if (post.imageUrl) {
      const imagePath = `./uploads/${post.imageUrl.split('/').pop()}`;
      try {
        fs.unlinkSync(imagePath);
      } catch (error) {
        console.error('Error deleting image file:', error);
      }
    }

    await post.destroy();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
};