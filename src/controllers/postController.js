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
      
      // Skip image moderation for now to avoid deployment issues
      // In production, you would use a proper image moderation service
      console.log('Image uploaded successfully, skipping moderation for now');
    }

    // Always moderate text content if caption exists
    if (caption) {
      console.log('Moderating caption:', caption);
      
      // Get AI service URL from environment or use fallback
      const aiServiceUrl = process.env.AI_MODERATION_URL || 'http://localhost:8000';
      
      try {
        const moderationResponse = await axios.post(`${aiServiceUrl}/api/moderate`, { 
          text: caption,
          threshold: 0.6  // Lower threshold for stricter moderation
        }, {
          timeout: 5000 // 5 second timeout
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
        console.log('AI moderation service unavailable, using fallback moderation:', moderationError.message);
        
        // Fallback to simple pattern-based moderation
        const patterns = {
          hate_speech: [
            'unalive', 'kys', 'kill yourself', 'sewerslide', 'neck rope', 'commit sleep',
            'stop breathing', 'off yourself', 'end it all', 'why are you still alive',
            'you should not exist', 'k!ll', 'h8', 'd!e', 'r*pe', 'racist', 'nazi', 'bigot'
          ],
          offensive: [
            'fuck', 'f**k', 'f*ck', 'shit', 'sh*t', 'bitch', 'b**ch', 'ass', 'a**',
            'damn', 'hell', 'piss', 'cock', 'dick', 'pussy', 'cunt', 'whore', 'slut'
          ]
        };
        
        const textLower = caption.toLowerCase();
        let isToxic = false;
        
        // Check for patterns
        if (patterns.hate_speech.some(pattern => textLower.includes(pattern))) {
          isToxic = true;
        } else if (patterns.offensive.some(pattern => textLower.includes(pattern))) {
          isToxic = true;
        }
        
        if (isToxic) {
          // If image was uploaded, delete it before rejecting
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return res.status(400).json({ 
            message: 'Content contains inappropriate language and should be reviewed',
            details: 'Content violates community guidelines'
          });
        }
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