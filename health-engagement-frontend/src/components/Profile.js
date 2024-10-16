import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';

function Profile() {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    age: '',
    chronicConditions: '',
    medications: '',
    location: '',
    profilePicture: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (error) {
      setError('Error fetching profile');
      console.error('Profile fetch error', error);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/profile', {
        age: profile.age,
        chronicConditions: profile.chronicConditions,
        medications: profile.medications,
        location: profile.location
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      setError('Error updating profile');
      console.error('Profile update error', error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handlePictureUpload = async () => {
    if (!selectedFile) return;
    try {
      const formData = new FormData();
      formData.append('profilePicture', selectedFile);

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/profile/upload-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setProfile({ ...profile, profilePicture: response.data.profilePicture });
      setSuccessMessage('Profile picture updated successfully');
      fetchProfile();
    } catch (error) {
      setError('Error uploading profile picture');
      console.error('Profile picture upload error', error);
    }
  };

  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="sm">
      <Box mt={3} textAlign="center">
        {/* Profile Picture */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={profile.profilePicture ? `http://localhost:5003${profile.profilePicture}` : '/images/default.png'}
            alt="Profile"
            style={{ width: '100px', height: '100px', borderRadius: '50%' }}
          />
          <IconButton
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: '#fff',
              borderRadius: '50%'
            }}
            component="label"
          >
            <AddIcon />
            <input type="file" hidden onChange={handleFileChange} />
          </IconButton>
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePictureUpload} // Call the handlePictureUpload function when clicked
          style={{ marginTop: '10px' }}
        >
          Upload Picture
        </Button>
      </Box>
      <form onSubmit={handleProfileUpdate}>
        <TextField
          fullWidth
          margin="normal"
          label="Username"
          value={profile.username}
          disabled
        />
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          value={profile.email}
          disabled
        />
        <TextField
          fullWidth
          margin="normal"
          label="Age"
          name="age"
          value={profile.age}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Chronic Conditions"
          name="chronicConditions"
          value={profile.chronicConditions}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Medications"
          name="medications"
          value={profile.medications}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Location"
          name="location"
          value={profile.location}
          onChange={handleChange}
        />
        
        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary">
            Update Profile
          </Button>
        </Box>
        {successMessage && (
          <Typography color="primary" style={{ marginTop: '10px' }}>
            {successMessage}
          </Typography>
        )}
      </form>
      <Box mt={3}>
        <Button component={Link} to="/create-post" variant="contained" color="primary" style={{ marginRight: '10px' }}>
          Create a New Post
        </Button>
        <Button component={Link} to="/posts" variant="contained" color="secondary">
          View All Posts
        </Button>
      </Box>
    </Container>
  );
}

export default Profile;
