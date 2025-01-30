const { User, Follows } = require('../models');
const { Op } = require('sequelize');

const followController = {
  // Your existing methods stay the same
  followUser: async (req, res) => {
    try {
      const followerId = req.user.id;
      const followingId = parseInt(req.params.userId);

      const existingFollow = await Follows.findOne({
        where: {
          followerId,
          followingId
        }
      });

      if (existingFollow) {
        return res.status(400).json({ message: 'Already following this user' });
      }

      await Follows.create({
        followerId,
        followingId
      });

      res.json({ message: 'Successfully followed user' });
    } catch (error) {
      console.error('Follow error:', error);
      res.status(500).json({ message: 'Error following user' });
    }
  },

  unfollowUser: async (req, res) => {
    try {
      const followerId = req.user.id;
      const followingId = parseInt(req.params.userId);

      const deleted = await Follows.destroy({
        where: {
          followerId,
          followingId
        }
      });

      if (!deleted) {
        return res.status(404).json({ message: 'Follow relationship not found' });
      }

      res.json({ message: 'Successfully unfollowed user' });
    } catch (error) {
      console.error('Unfollow error:', error);
      res.status(500).json({ message: 'Error unfollowing user' });
    }
  },

  getRecommendedPeers: async (req, res) => {
    // Your existing getRecommendedPeers implementation
  },

  getFollowStatus: async (req, res) => {
    try {
      const followerId = req.user.id;
      const followingId = parseInt(req.params.userId);

      const follow = await Follows.findOne({
        where: {
          followerId,
          followingId
        }
      });

      res.json({ isFollowing: !!follow });
    } catch (error) {
      res.status(500).json({ message: 'Error getting follow status' });
    }
  },

  // New methods for getting followers and following

  // Get followers for a specific user
  getFollowers: async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const followers = await Follows.findAll({
        where: { followingId: userId },
        include: [{
          model: User,
          as: 'follower',
          attributes: ['id', 'username', 'profilePicture']
        }]
      });

      const formattedFollowers = followers.map(follow => ({
        id: follow.follower.id,
        username: follow.follower.username,
        profilePicture: follow.follower.profilePicture
      }));

      res.json(formattedFollowers);
    } catch (error) {
      console.error('Error getting followers:', error);
      res.status(500).json({ message: 'Error getting followers' });
    }
  },

  // Get following for a specific user
  getFollowing: async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const following = await Follows.findAll({
        where: { followerId: userId },
        include: [{
          model: User,
          as: 'following',
          attributes: ['id', 'username', 'profilePicture']
        }]
      });

      const formattedFollowing = following.map(follow => ({
        id: follow.following.id,
        username: follow.following.username,
        profilePicture: follow.following.profilePicture
      }));

      res.json(formattedFollowing);
    } catch (error) {
      console.error('Error getting following:', error);
      res.status(500).json({ message: 'Error getting following' });
    }
  },

  // Get current user's followers
  getCurrentUserFollowers: async (req, res) => {
    try {
      const userId = req.user.id;
      const followers = await Follows.findAll({
        where: { followingId: userId },
        include: [{
          model: User,
          as: 'follower',
          attributes: ['id', 'username', 'profilePicture']
        }]
      });

      const formattedFollowers = followers.map(follow => ({
        id: follow.follower.id,
        username: follow.follower.username,
        profilePicture: follow.follower.profilePicture
      }));

      res.json(formattedFollowers);
    } catch (error) {
      console.error('Error getting current user followers:', error);
      res.status(500).json({ message: 'Error getting followers' });
    }
  },

  // Get current user's following
  getCurrentUserFollowing: async (req, res) => {
    try {
      const userId = req.user.id;
      const following = await Follows.findAll({
        where: { followerId: userId },
        include: [{
          model: User,
          as: 'following',
          attributes: ['id', 'username', 'profilePicture']
        }]
      });

      const formattedFollowing = following.map(follow => ({
        id: follow.following.id,
        username: follow.following.username,
        profilePicture: follow.following.profilePicture
      }));

      res.json(formattedFollowing);
    } catch (error) {
      console.error('Error getting current user following:', error);
      res.status(500).json({ message: 'Error getting following' });
    }
  }
};

module.exports = followController;