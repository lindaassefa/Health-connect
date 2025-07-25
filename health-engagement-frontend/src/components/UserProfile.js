import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from '@mui/material';
import axios from 'axios';
import './Post.css';

function UserProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState({
    username: '',
    location: '',
    age: '',
    chronicConditions: '',
    profilePicture: '',
  });
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
    fetchFollowStatus();
    fetchFollowCounts();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/profile/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/posts/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const fetchFollowStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching follow status for user:', userId);  // Add this log
      const response = await axios.get(`/api/follows/${userId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Follow status response:', response.data); // Add this log
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  };

  const fetchFollowCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const followersResponse = await axios.get(`/api/follows/${userId}/followers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const followingResponse = await axios.get(`/api/follows/${userId}/following`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setFollowers(followersResponse.data);
      setFollowing(followingResponse.data);
      setFollowersCount(followersResponse.data.length);
      setFollowingCount(followingResponse.data.length);
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    }
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      if (isFollowing) {
        await axios.delete(`/api/follows/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`/api/follows/${userId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setIsFollowing(!isFollowing);
      fetchFollowCounts();
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const handleLike = async (postId, isLiked) => {
    try {
      const token = localStorage.getItem('token');
      let response;
      if (isLiked) {
        response = await axios.delete(`/api/likes/${postId}/like`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await axios.post(
          `/api/likes/${postId}/like`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      const { likeCount } = response.data;
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, isLiked: !isLiked, likeCount } : post
        )
      );
    } catch (error) {
      console.error('Error updating like status:', error);
    }
  };

  return (
    <Container>
      <Box display="flex" alignItems="center" flexDirection="column" marginBottom={4}>
        <img
          src={profile.profilePicture ? profile.profilePicture : '/images/default.png'}
          alt="Profile"
          style={{ width: '120px', height: '120px', borderRadius: '50%' }}
        />

        <Typography variant="h5" component="h1" marginTop={2}>
          {profile.username}
        </Typography>

        {profile.location && (
          <Typography variant="body1" color="textSecondary">
            Location: {profile.location}
          </Typography>
        )}

        <Box display="flex" gap={3} marginTop={2}>
          <Typography>
            {posts.length} Posts
          </Typography>
          <Typography 
            onClick={() => setShowFollowers(true)} 
            style={{ cursor: 'pointer' }}
          >
            {followersCount} Followers
          </Typography>
          <Typography 
            onClick={() => setShowFollowing(true)} 
            style={{ cursor: 'pointer' }}
          >
            {followingCount} Following
          </Typography>
        </Box>

        <Button
          variant="contained"
          color={isFollowing ? 'secondary' : 'primary'}
          onClick={handleFollow}
          style={{ marginTop: '10px' }}
        >
          {isFollowing ? 'Unfollow' : 'Follow'}
        </Button>

        {profile.chronicConditions && (
          <Typography style={{ marginTop: '10px' }}>
            Chronic Conditions: {profile.chronicConditions}
          </Typography>
        )}

        {/* Followers Dialog */}
        <Dialog open={showFollowers} onClose={() => setShowFollowers(false)}>
          <DialogTitle>Followers</DialogTitle>
          <DialogContent>
            <List>
              {followers.map((follower) => (
                <ListItem key={follower.id}>
                  <ListItemAvatar>
                    <Avatar 
                      src={follower.profilePicture ? follower.profilePicture : '/images/default.png'}
                    />
                  </ListItemAvatar>
                  <ListItemText primary={follower.username} />
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>

        {/* Following Dialog */}
        <Dialog open={showFollowing} onClose={() => setShowFollowing(false)}>
          <DialogTitle>Following</DialogTitle>
          <DialogContent>
            <List>
              {following.map((followedUser) => (
                <ListItem key={followedUser.id}>
                  <ListItemAvatar>
                    <Avatar 
                      src={followedUser.profilePicture ? followedUser.profilePicture : '/images/default.png'}
                    />
                  </ListItemAvatar>
                  <ListItemText primary={followedUser.username} />
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>
      </Box>

      <Typography variant="h6" marginBottom={3}>
        Posts
      </Typography>
      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <Box className="post-card">
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="post-image"
                />
              )}
              <Typography className="post-caption">{post.caption}</Typography>
              <Box className="post-actions">
                <span
                  className={`heart-icon ${post.isLiked ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id, post.isLiked)}
                >
                  ❤️ {post.likeCount || 0}
                </span>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default UserProfile;