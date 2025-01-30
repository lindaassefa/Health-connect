import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import './Post.css';

function Profile() {
  const [profile, setProfile] = useState({
    username: '',
    location: '',
    age: '',
    chronicConditions: '',
    profilePicture: '',
  });
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [caption, setCaption] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchProfile();
      fetchPosts();
      fetchFollowCounts();
      const pollInterval = setInterval(fetchPosts, 5000);
      return () => clearInterval(pollInterval);
    }
  }, [navigate]);

  const fetchFollowCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const followersResponse = await axios.get('/api/follows/followers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const followingResponse = await axios.get('/api/follows/following', {
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

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
    } catch (error) {
      setError('Error fetching profile');
      console.error('Profile fetch error:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/posts/user-posts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(response.data);
    } catch (error) {
      setError('Error fetching posts');
      console.error('Posts fetch error:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        '/api/profile',
        {
          age: profile.age,
          location: profile.location,
          chronicConditions: profile.chronicConditions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      setError('Error updating profile');
      console.error('Profile update error:', error);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccessMessage('');

      const token = localStorage.getItem('token');

      if (caption) {
        const moderationResponse = await axios.post(
          'http://localhost:8000/api/moderate',
          { text: caption },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const moderationResult = moderationResponse.data;

        if (moderationResult.is_toxic) {
          setError(moderationResult.recommendation);
          return;
        }
      }

      const formData = new FormData();
      formData.append('caption', caption);
      if (postImage) {
        formData.append('file', postImage);
      }

      await axios.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setCaption('');
      setPostImage(null);
      fetchPosts();
      setSuccessMessage('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Error creating post');
      }
    }
  };

  const handlePictureUpload = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('profilePicture', selectedFile);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/profile/upload-picture',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile({ ...profile, profilePicture: response.data.profilePicture });
      setSuccessMessage('Profile picture updated successfully!');
      fetchProfile();
    } catch (error) {
      setError('Error uploading profile picture');
      console.error('Profile picture upload error:', error);
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
      console.log('Like response:', response.data);
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

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.filter(post => post.id !== postId));
      setSuccessMessage('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Error deleting post');
    }
  };

  return (
    <Container>
      <Box display="flex" alignItems="center" flexDirection="column" marginBottom={4}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={
              profile.profilePicture
                ? `http://localhost:5003${profile.profilePicture}`
                : '/images/default.png'
            }
            alt="Profile"
            style={{ width: '120px', height: '120px', borderRadius: '50%' }}
          />
          <IconButton
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: '#fff',
              borderRadius: '50%',
            }}
            component="label"
          >
            <AddIcon />
            <input type="file" hidden onChange={(e) => setSelectedFile(e.target.files[0])} />
          </IconButton>
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePictureUpload}
          style={{ marginTop: '10px' }}
        >
          Upload Picture
        </Button>
        <Typography variant="h5" component="h1" marginTop={2}>
          {profile.username}
        </Typography>
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

        {/* Followers Dialog */}
        <Dialog open={showFollowers} onClose={() => setShowFollowers(false)}>
          <DialogTitle>Followers</DialogTitle>
          <DialogContent>
            <List>
              {followers.map((follower) => (
                <ListItem 
                  key={follower.id}
                  button
                  onClick={() => handleUserClick(follower.id)}
                >
                  <ListItemAvatar>
                    <Avatar 
                      src={follower.profilePicture ? `http://localhost:5003${follower.profilePicture}` : '/images/default.png'}
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
                <ListItem 
                  key={followedUser.id}
                  button
                  onClick={() => handleUserClick(followedUser.id)}
                >
                  <ListItemAvatar>
                    <Avatar 
                      src={followedUser.profilePicture ? `http://localhost:5003${followedUser.profilePicture}` : '/images/default.png'}
                    />
                  </ListItemAvatar>
                  <ListItemText primary={followedUser.username} />
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>

        <Button
          variant="outlined"
          color="primary"
          style={{ marginTop: '10px' }}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </Box>

      {isEditing && (
        <Box component="form" onSubmit={handleProfileUpdate} mt={3}>
          <TextField
            fullWidth
            margin="normal"
            label="Age"
            name="age"
            value={profile.age}
            onChange={(e) => setProfile({ ...profile, [e.target.name]: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Location"
            name="location"
            value={profile.location}
            onChange={(e) => setProfile({ ...profile, [e.target.name]: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Chronic Conditions"
            name="chronicConditions"
            value={profile.chronicConditions}
            onChange={(e) => setProfile({ ...profile, [e.target.name]: e.target.value })}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: '10px' }}
          >
            Save Changes
          </Button>
        </Box>
      )}

      <Box component="form" onSubmit={handlePostSubmit} mb={4} mt={4}>
        <TextField
          fullWidth
          margin="normal"
          label="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={(e) => setPostImage(e.target.files[0])} />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          style={{ marginTop: '10px' }}
        >
          Create Post
        </Button>
      </Box>

      {successMessage && (
        <Typography color="primary" style={{ marginTop: '10px' }}>
          {successMessage}
        </Typography>
      )}
      {error && (
        <Typography color="error" style={{ marginTop: '10px' }}>
          {error}
        </Typography>
      )}

      <Typography variant="h6" marginBottom={3}>
        Your Posts
      </Typography>
      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <Box className="post-card">
              {post.imageUrl && (
                <img
                  src={`http://localhost:5003${post.imageUrl}`}
                  alt="Post"
                  className="post-image"
                />
              )}
              <Typography className="post-caption">{post.caption}</Typography>
              <Box className="post-actions" display="flex" justifyContent="space-between" alignItems="center">
                <span
                  className={`heart-icon ${post.isLiked ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id, post.isLiked)}
                >
                  ❤️ {post.likeCount || 0}
                </span>
                <IconButton 
                  onClick={() => handleDeletePost(post.id)}
                  size="small"
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Profile;