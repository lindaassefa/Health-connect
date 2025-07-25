import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Alert,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput
} from '@mui/material';
import {
  Close as CloseIcon,
  Image as ImageIcon,
  Send as SendIcon,
  Add as AddIcon,
  Visibility as AnonymousIcon,
  Healing as ConditionIcon
} from '@mui/icons-material';
import axios from 'axios';

const chronicConditions = [
  'Eczema', 'PCOS', 'Acne', 'IBS', 'Anxiety', 'Depression', 
  'Diabetes', 'Hypertension', 'Asthma', 'Migraines', 'Fibromyalgia',
  'Endometriosis', 'ADHD', 'Autism', 'Lupus', 'Rheumatoid Arthritis'
];

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
  'Autism': '🧩',
  'Lupus': '🦋',
  'Rheumatoid Arthritis': '🦴'
};

function CreatePost({ open, onClose, onPostCreated }) {
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userConditions, setUserConditions] = useState([]);

  useEffect(() => {
    if (open) {
      fetchUserProfile();
    }
  }, [open]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUserConditions(response.data.chronicConditions || []);
      setSelectedConditions(response.data.chronicConditions || []);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Use default conditions if profile fetch fails
      setUserConditions(['Eczema', 'PCOS', 'Anxiety']);
      setSelectedConditions(['Eczema', 'PCOS', 'Anxiety']);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleConditionToggle = (condition) => {
    setSelectedConditions(prev => 
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const handleSubmit = async () => {
    if (!caption.trim()) {
      setError('Please write something to post');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('isAnonymous', isAnonymous);
      formData.append('conditionTags', JSON.stringify(selectedConditions));
      
      if (imageFile) {
        formData.append('file', imageFile);
      }

      await axios.post('/api/posts/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Reset form
      setCaption('');
      setImageFile(null);
      setImagePreview('');
      setSelectedConditions(userConditions);
      setIsAnonymous(false);
      onClose();
      
      // Refresh posts
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCaption('');
    setImageFile(null);
    setImagePreview('');
    setSelectedConditions(userConditions);
    setIsAnonymous(false);
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }
      }}
    >
      <DialogTitle sx={{ 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Create Post
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
            }}
          >
            <AddIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white', mb: 0.5 }}>
              Share your thoughts
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Connect with your health community
            </Typography>
          </Box>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="What's on your mind? Share your health journey..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
          variant="outlined"
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#4ECDC4',
              },
            },
            '& .MuiInputBase-input': {
              color: 'white',
              '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)',
                opacity: 1,
              },
            },
          }}
        />

        {/* Condition Tags */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: 'white', mb: 2, fontWeight: 500 }}>
            Select relevant conditions:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {userConditions.map((condition) => (
              <Chip
                key={condition}
                label={`${conditionEmojis[condition] || '🏥'} ${condition}`}
                onClick={() => handleConditionToggle(condition)}
                color={selectedConditions.includes(condition) ? 'primary' : 'default'}
                variant={selectedConditions.includes(condition) ? 'filled' : 'outlined'}
                sx={{
                  color: selectedConditions.includes(condition) ? 'white' : 'white',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Anonymous Toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#4ECDC4',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#4ECDC4',
                },
              }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AnonymousIcon sx={{ color: 'white' }} />
              <Typography sx={{ color: 'white' }}>
                Post anonymously
              </Typography>
            </Box>
          }
          sx={{ mb: 3 }}
        />

        {/* Image Upload */}
        <Box sx={{ mb: 3 }}>
      <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
        type="file"
        onChange={handleImageChange}
          />
          <label htmlFor="image-upload">
            <Button
              component="span"
              variant="outlined"
              startIcon={<ImageIcon />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Add Image
            </Button>
          </label>
        </Box>

        {imagePreview && (
          <Box sx={{ mb: 3, position: 'relative' }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'cover',
                borderRadius: 12,
              }}
            />
            <IconButton
              onClick={() => {
                setImageFile(null);
                setImagePreview('');
              }}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        {/* Auto-generated tags */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {caption.toLowerCase().includes('mental health') && (
            <Chip
              label="Mental Health"
              size="small"
              sx={{
                background: 'linear-gradient(45deg, #FF6B6B, #FF8E8E)',
                color: 'white',
                fontWeight: 500,
              }}
            />
          )}
          {caption.toLowerCase().includes('fitness') && (
            <Chip
              label="Fitness"
              size="small"
              sx={{
                background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
                color: 'white',
                fontWeight: 500,
              }}
            />
          )}
          {caption.toLowerCase().includes('nutrition') && (
            <Chip
              label="Nutrition"
              size="small"
              sx={{
                background: 'linear-gradient(45deg, #A8E6CF, #88D8C0)',
                color: 'white',
                fontWeight: 500,
              }}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !caption.trim()}
          startIcon={<SendIcon />}
          sx={{
            background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #44A08D, #4ECDC4)',
            },
            '&:disabled': {
              background: 'rgba(255, 255, 255, 0.3)',
            }
          }}
        >
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreatePost;