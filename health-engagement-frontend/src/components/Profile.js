import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, IconButton } from '@mui/material';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';  // Import the Add icon

function Profile() {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    age: '',
    chronicConditions: '',
    medications: '',
    profilePicture: '',  // Added profilePicture field
  });
  const [profilePicture, setProfilePicture] = useState(null);  // State for profile picture
  const [error, setError] = useState('');

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

  // Handle profile picture change
  const handlePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  // Handle profile update (excluding profile picture)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile updated successfully');
    } catch (error) {
      setError('Error updating profile');
      console.error('Profile update error', error);
    }
  };

  // Handle profile picture upload separately
  const handlePictureUpload = async () => {
    const formData = new FormData();
    formData.append('profilePicture', profilePicture);  // Append the file to form data

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/profile/upload-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      // Update the profilePicture in the state to display the uploaded image
      setProfile(prevProfile => ({
        ...prevProfile,
        profilePicture: response.data.profilePicture  // Update state with the new profile picture path
      }));

      alert('Profile picture updated successfully');
    } catch (error) {
      setError('Error uploading profile picture');
      console.error('Profile picture upload error', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Your Profile
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          fullWidth
          id="username"
          label="Username"
          name="username"
          value={profile.username}
          disabled
        />
        <TextField
          margin="normal"
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          value={profile.email}
          disabled
        />
        <TextField
          margin="normal"
          fullWidth
          id="age"
          label="Age"
          name="age"
          type="number"
          value={profile.age}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          fullWidth
          id="chronicConditions"
          label="Chronic Conditions"
          name="chronicConditions"
          value={profile.chronicConditions}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          fullWidth
          id="medications"
          label="Medications"
          name="medications"
          value={profile.medications}
          onChange={handleChange}
        />

        {/* Profile Picture with Overlaying Add Icon */}
        <div style={{ position: 'relative', display: 'inline-block', marginTop: '20px' }}>
          <img
            src={profile.profilePicture ? `http://localhost:5003${profile.profilePicture}` : '/images/default.png'}  // Display profile picture or placeholder
            alt="Profile"
            style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}  // Circular styling
          />
          {/* Add Button (Overlay) */}
          <IconButton
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              backgroundColor: 'white',
              borderRadius: '50%'
            }}
            component="label"
          >
            <AddIcon />
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handlePictureChange}
            />
          </IconButton>
        </div>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Update Profile
        </Button>
      </Box>

      {/* Separate button for profile picture upload */}
      <Button
        onClick={handlePictureUpload}
        fullWidth
        variant="outlined"
        sx={{ mt: 3 }}
      >
        Save Profile Picture
      </Button>
    </Container>
  );
}

export default Profile;
