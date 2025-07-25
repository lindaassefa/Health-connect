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
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Radio,
  RadioGroup,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Cake as CakeIcon,
  LocationOn as LocationIcon,
  Wc as GenderIcon,
  Healing as ConditionIcon,
  EmojiEmotions as VibeIcon,
  Save as SaveIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import axios from 'axios';
import './Post.css';

const steps = ['Basic Info', 'Conditions & Preferences', 'Vibes & Privacy'];

const chronicConditions = [
  'Eczema', 'Acne', 'Anxiety', 'Endometriosis', 'PCOS', 'IBS'
];

const lookingFor = [
  { label: 'Friendship', icon: '👥' },
  { label: 'Advice', icon: '💡' },
  { label: 'Product Recs', icon: '⭐' },
  { label: 'Venting Buddy', icon: '😤' }
];

const vibeTags = [
  { label: 'Deep Talker', emoji: '💬' },
  { label: 'Funny', emoji: '🤡' },
  { label: 'Cozy', emoji: '🧸' },
  { label: 'Nerdy', emoji: '🔬' },
  { label: 'Shy', emoji: '😶‍🌫️' }
];

const comfortLevels = [
  { value: 'public', label: 'Public', description: 'Show my name and profile' },
  { value: 'semi-anonymous', label: 'Semi-Anonymous', description: 'Show my condition but hide my name' },
  { value: 'fully-anonymous', label: 'Fully Anonymous', description: 'Hide my identity completely' }
];

function Profile() {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    fullName: '',
    age: '',
    location: '',
    gender: '',
    chronicConditions: [],
    lookingFor: [],
    vibeTags: [],
    comfortLevel: 'semi-anonymous',
    profilePicture: '',
  });
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
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
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
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
      
      // Check if profile is complete
      const profileData = response.data;
      const isProfileComplete = profileData.fullName && 
                               profileData.age && 
                               profileData.location && 
                               profileData.chronicConditions && 
                               profileData.chronicConditions.length > 0;
      
      setProfile(profileData);
      
      // Show onboarding if profile is incomplete
      if (!isProfileComplete) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      // If profile doesn't exist, show onboarding
      setShowOnboarding(true);
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
      console.error('Posts fetch error:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelect = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSaveProfile();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setSnackbarMessage('Please login again to continue.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      await axios.post('/api/profile', profile, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSnackbarMessage('Profile saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setShowOnboarding(false);
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
        setSnackbarMessage('Session expired. Redirecting to login...');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
        localStorage.removeItem('token');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        const errorMessage = err.response?.data?.message || 'Failed to save profile';
        setError(errorMessage);
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        '/api/profile',
        profile,
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

  const renderOnboardingStep = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
              Let's get to know you better
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profile.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  InputProps={{
                    startAdornment: <CakeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={profile.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  InputProps={{
                    startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={profile.gender || ''}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    startAdornment={<GenderIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                  >
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="non-binary">Non-binary</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
              Conditions & Preferences
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Chronic Conditions (select all that apply)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {chronicConditions.map((condition) => (
                  <Chip
                    key={condition}
                    label={condition}
                    onClick={() => handleMultiSelect('chronicConditions', condition)}
                    color={profile.chronicConditions?.includes(condition) ? 'primary' : undefined}
                    variant={profile.chronicConditions?.includes(condition) ? 'filled' : 'outlined'}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                What you're looking for (select all that apply)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {lookingFor.map((option) => (
                  <Button
                    key={option.label}
                    variant={profile.lookingFor?.includes(option.label) ? 'contained' : 'outlined'}
                    color={profile.lookingFor?.includes(option.label) ? 'primary' : undefined}
                    onClick={() => handleMultiSelect('lookingFor', option.label)}
                    startIcon={<span style={{ fontSize: '1.2rem' }}>{option.icon}</span>}
                    sx={{ 
                      minWidth: '120px',
                      height: '48px',
                      borderRadius: '24px',
                      textTransform: 'none'
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
              Vibes & Privacy
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Vibe Tags (select all that apply)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {vibeTags.map((tag) => (
                  <Button
                    key={tag.label}
                    variant={profile.vibeTags?.includes(tag.label) ? 'contained' : 'outlined'}
                    color={profile.vibeTags?.includes(tag.label) ? 'primary' : undefined}
                    onClick={() => handleMultiSelect('vibeTags', tag.label)}
                    startIcon={<span style={{ fontSize: '1.5rem' }}>{tag.emoji}</span>}
                    sx={{ 
                      minWidth: '140px',
                      height: '56px',
                      borderRadius: '28px',
                      textTransform: 'none',
                      fontSize: '1rem'
                    }}
                  >
                    {tag.label}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Comfort Level
              </Typography>
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={profile.comfortLevel || 'semi-anonymous'}
                  onChange={(e) => handleInputChange('comfortLevel', e.target.value)}
                >
                  {comfortLevels.map((level) => (
                    <FormControlLabel
                      key={level.value}
                      value={level.value}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {level.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {level.description}
                          </Typography>
                        </Box>
                      }
                      sx={{ 
                        alignItems: 'flex-start',
                        '& .MuiFormControlLabel-label': { width: '100%' }
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>
          </Box>
        );

      default:
        return null;
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
          '/api/moderate',
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

      setProfile(prev => ({
        ...prev,
        profilePicture: response.data.profilePicture
      }));
      setSelectedFile(null);
      setSuccessMessage('Profile picture updated successfully!');
    } catch (error) {
      setError('Error uploading profile picture');
      console.error('Picture upload error:', error);
    }
  };

  const handleLike = async (postId, isLiked) => {
    try {
      const token = localStorage.getItem('token');
      if (isLiked) {
        await axios.delete(`/api/likes/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(
          '/api/likes',
          { postId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
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
      fetchPosts();
      setSuccessMessage('Post deleted successfully!');
    } catch (error) {
      setError('Error deleting post');
      console.error('Delete post error:', error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Show onboarding dialog if profile is incomplete
  if (showOnboarding) {
  return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
              Welcome to Med Mingle
        </Typography>
            <Typography variant="subtitle1" align="center" color="text.secondary">
              Let's personalize your experience
          </Typography>
        </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {renderOnboardingStep(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>

        <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
        >
              {activeStep === steps.length - 1 ? (loading ? 'Completing...' : 'Complete Setup') : 'Next'}
        </Button>
      </Box>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
          >
            <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              src={profile.profilePicture}
              sx={{ width: 100, height: 100 }}
          />
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              {profile.fullName || profile.username}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {profile.location && `${profile.location} • `}
              {profile.age && `${profile.age} years old`}
            </Typography>
            
            {profile.chronicConditions && profile.chronicConditions.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {profile.chronicConditions.map((condition) => (
                  <Chip
                    key={condition}
                    label={condition}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
        </Box>
      )}

            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                sx={{ mr: 2 }}
              >
                Edit Profile
              </Button>
        <Button
                variant="outlined"
                onClick={() => setShowOnboarding(true)}
        >
                Complete Onboarding
        </Button>
      </Box>
          </Grid>
          <Grid item>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">{followersCount}</Typography>
              <Typography variant="body2" color="text.secondary">Followers</Typography>
              </Box>
          </Grid>
          <Grid item>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">{followingCount}</Typography>
              <Typography variant="body2" color="text.secondary">Following</Typography>
            </Box>
          </Grid>
      </Grid>
      </Paper>

      {/* Rest of the profile content */}
      {/* ... existing profile content ... */}
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Profile;