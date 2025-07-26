import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  TextField,
  Grid,
  IconButton,
  Paper,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Skeleton
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Logout as LogoutIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoIcon,
  Person as PersonIcon,
  Cake as CakeIcon,
  LocationOn as LocationIcon,
  Wc as GenderIcon,
  Healing as ConditionIcon,
  EmojiEmotions as VibeIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';

const conditionEmojis = {
  'Eczema': '💧',
  'PCOS': '🌸',
  'Acne': '🔴',
  'IBS': '🤢',
  'Anxiety': '😰',
  'Depression': '💙',
  'Diabetes': '🩸',
  'Hypertension': '❤️',
  'Asthma': '🫁',
  'Migraines': '🤕',
  'Fibromyalgia': '🦴',
  'Endometriosis': '🩸',
  'ADHD': '⚡',
  'Lupus': '🦋',
  'Rheumatoid Arthritis': '🦴'
};

const vibeEmojis = {
  'Deep': '💬',
  'Funny': '🤡',
  'Cozy': '🧸',
  'Nerdy': '🔬',
  'Spiritual': '✨',
  'Athletic': '🏃‍♀️',
  'Creative': '🎨',
  'Academic': '📚'
};

const chronicConditions = [
  'Eczema', 'PCOS', 'Acne', 'IBS', 'Anxiety', 'Depression', 
  'Diabetes', 'Hypertension', 'Asthma', 'Migraines', 'Fibromyalgia',
  'Endometriosis', 'ADHD', 'Lupus', 'Rheumatoid Arthritis'
];

const vibeTags = [
  'Deep', 'Funny', 'Cozy', 'Nerdy', 'Spiritual', 'Athletic', 'Creative', 'Academic'
];

function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProfile(response.data);
      setEditData(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Use mock data for now
      setProfile({
        id: 1,
        username: 'Sarah',
        email: 'sarah@example.com',
        fullName: 'Sarah Johnson',
        age: 28,
        gender: 'female',
        location: 'San Francisco, CA',
        chronicConditions: ['Eczema', 'Anxiety'],
        vibeTags: ['Deep', 'Creative'],
        comfortLevel: 'semi-anonymous',
        profilePicture: null,
        posts: [],
        sharedProducts: []
      });
      setEditData({
        id: 1,
        username: 'Sarah',
        email: 'sarah@example.com',
        fullName: 'Sarah Johnson',
        age: 28,
        gender: 'female',
        location: 'San Francisco, CA',
        chronicConditions: ['Eczema', 'Anxiety'],
        vibeTags: ['Deep', 'Creative'],
        comfortLevel: 'semi-anonymous',
        profilePicture: null,
        posts: [],
        sharedProducts: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditData({ ...profile });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put('/api/profile', editData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setProfile(editData);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({ ...profile });
    setError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (err) {
      setError('Failed to delete account');
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConditionToggle = (condition) => {
    setEditData(prev => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition)
        ? prev.chronicConditions.filter(c => c !== condition)
        : [...prev.chronicConditions, condition]
    }));
  };

  const handleVibeToggle = (vibe) => {
    setEditData(prev => ({
      ...prev,
      vibeTags: prev.vibeTags.includes(vibe)
        ? prev.vibeTags.filter(v => v !== vibe)
        : [...prev.vibeTags, vibe]
    }));
  };

  if (loading && !profile) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Alert severity="error" sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
        Failed to load profile
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Profile Header */}
      <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 3,
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mr: 3,
                fontSize: '2rem',
                bgcolor: 'rgba(255, 255, 255, 0.2)'
              }}
            >
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profile.fullName?.[0] || profile.username?.[0] || '?'
              )}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {profile.fullName || profile.username}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                @{profile.username}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {!editing ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.3)'
                      }
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {editing ? (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={editData.fullName || ''}
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
                  value={editData.age || ''}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  InputProps={{
                    startAdornment: <CakeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={editData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  InputProps={{
                    startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={editData.gender || ''}
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
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Age</Typography>
                <Typography variant="body1">{profile.age || 'Not specified'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Location</Typography>
                <Typography variant="body1">{profile.location || 'Not specified'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Gender</Typography>
                <Typography variant="body1">{profile.gender || 'Not specified'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Comfort Level</Typography>
                <Typography variant="body1">{profile.comfortLevel || 'Not specified'}</Typography>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Conditions and Vibe */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ConditionIcon color="primary" />
                Conditions
              </Typography>
              
              {editing ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {chronicConditions.map((condition) => (
                    <Chip
                      key={condition}
                      label={`${conditionEmojis[condition] || '🏥'} ${condition}`}
                      onClick={() => handleConditionToggle(condition)}
                      color={editData.chronicConditions?.includes(condition) ? 'primary' : 'default'}
                      variant={editData.chronicConditions?.includes(condition) ? 'filled' : 'outlined'}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profile.chronicConditions?.map((condition) => (
                    <Chip
                      key={condition}
                      label={`${conditionEmojis[condition] || '🏥'} ${condition}`}
                      color="primary"
                      variant="outlined"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <VibeIcon color="primary" />
                Vibe Tags
              </Typography>
              
              {editing ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {vibeTags.map((vibe) => (
                    <Chip
                      key={vibe}
                      label={`${vibeEmojis[vibe] || '✨'} ${vibe}`}
                      onClick={() => handleVibeToggle(vibe)}
                      color={editData.vibeTags?.includes(vibe) ? 'primary' : 'default'}
                      variant={editData.vibeTags?.includes(vibe) ? 'filled' : 'outlined'}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profile.vibeTags?.map((vibe) => (
                    <Chip
                      key={vibe}
                      label={`${vibeEmojis[vibe] || '✨'} ${vibe}`}
                      color="primary"
                      variant="outlined"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for Posts and Products */}
      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="My Posts" />
            <Tab label="Shared Products" />
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 0 && (
            <Box>
              {profile.posts?.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No posts yet. Start sharing your health journey!
                </Typography>
              ) : (
                <List>
                  {profile.posts?.map((post, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={post.caption}
                        secondary={new Date(post.createdAt).toLocaleDateString()}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              {profile.sharedProducts?.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No shared products yet. Share products that have helped you!
                </Typography>
              ) : (
                <List>
                  {profile.sharedProducts?.map((product, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={product.name}
                        secondary={`${product.brand} • ${new Date(product.createdAt).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card sx={{ mt: 3, borderRadius: 3, border: '1px solid', borderColor: 'error.main' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon />
            Danger Zone
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ borderColor: 'warning.main', color: 'warning.main' }}
            >
              Log Out
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ borderColor: 'error.main', color: 'error.main' }}
            >
              Delete Account
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyProfile; 