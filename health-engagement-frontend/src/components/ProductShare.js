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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
  OutlinedInput,
  Grid
} from '@mui/material';
import {
  Close as CloseIcon,
  Image as ImageIcon,
  Send as SendIcon,
  Add as AddIcon,
  Healing as ConditionIcon
} from '@mui/icons-material';
import axios from 'axios';

const categories = [
  'Skincare',
  'Supplements',
  'Lifestyle',
  'Medication',
  'Fitness',
  'Nutrition',
  'Mental Health',
  'Pain Relief'
];

const conditionOptions = [
  'Eczema', 'PCOS', 'Anxiety', 'Depression', 'Diabetes', 'Asthma', 'IBS', 'Migraines', 
  'Fibromyalgia', 'Endometriosis', 'ADHD', 'Lupus', 'Rheumatoid Arthritis'
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
  'Lupus': '🦋',
  'Rheumatoid Arthritis': '🦴'
};

function ProductShare({ open, onClose, onProductShared }) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    category: '',
    conditionTags: [],
    recommendation: '',
    affiliateLink: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userConditions, setUserConditions] = useState([]);

  useEffect(() => {
    if (open) {
      fetchUserConditions();
    }
  }, [open]);

  const fetchUserConditions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUserConditions(response.data.chronicConditions || []);
    } catch (err) {
      console.error('Error fetching user conditions:', err);
      setUserConditions(['Eczema', 'PCOS', 'Anxiety']);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConditionToggle = (condition) => {
    setFormData(prev => ({
      ...prev,
      conditionTags: prev.conditionTags.includes(condition)
        ? prev.conditionTags.filter(c => c !== condition)
        : [...prev.conditionTags, condition]
    }));
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

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.brand.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.conditionTags.length === 0) {
      setError('Please select at least one condition this product helps with');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      
      submitData.append('name', formData.name);
      submitData.append('brand', formData.brand);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('conditionTags', JSON.stringify(formData.conditionTags));
      submitData.append('recommendation', formData.recommendation);
      submitData.append('affiliateLink', formData.affiliateLink);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      await axios.post('/api/products', submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form
      setFormData({
        name: '',
        brand: '',
        description: '',
        category: '',
        conditionTags: [],
        recommendation: '',
        affiliateLink: ''
      });
      setImageFile(null);
      setImagePreview('');
      onClose();
      
      if (onProductShared) {
        onProductShared();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to share product');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      brand: '',
      description: '',
      category: '',
      conditionTags: [],
      recommendation: '',
      affiliateLink: ''
    });
    setImageFile(null);
    setImagePreview('');
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
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
          Share a Product
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
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
              Help others discover great products
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Share products that have helped you on your health journey
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Product Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Product Name *"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              sx={{
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
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.8)',
                },
              }}
            />
          </Grid>

          {/* Brand */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Brand *"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              sx={{
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
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.8)',
                },
              }}
            />
          </Grid>

          {/* Category */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4ECDC4',
                  },
                  '& .MuiSelect-icon': {
                    color: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
                inputProps={{
                  sx: { color: 'white' }
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Affiliate Link */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Affiliate Link (Optional)"
              value={formData.affiliateLink}
              onChange={(e) => handleInputChange('affiliateLink', e.target.value)}
              placeholder="https://..."
              sx={{
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
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.8)',
                },
              }}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Product Description *"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="What is this product and what does it do?"
              sx={{
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
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.8)',
                },
              }}
            />
          </Grid>

          {/* Condition Tags */}
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: 'white', mb: 2, fontWeight: 500 }}>
              What condition(s) does this product help with? *
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {conditionOptions.map((condition) => (
                <Chip
                  key={condition}
                  label={`${conditionEmojis[condition] || '🏥'} ${condition}`}
                  onClick={() => handleConditionToggle(condition)}
                  color={formData.conditionTags.includes(condition) ? 'primary' : 'default'}
                  variant={formData.conditionTags.includes(condition) ? 'filled' : 'outlined'}
                  sx={{
                    color: formData.conditionTags.includes(condition) ? 'white' : 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    }
                  }}
                />
              ))}
            </Box>
          </Grid>

          {/* Recommendation */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Why do you recommend this product? *"
              value={formData.recommendation}
              onChange={(e) => handleInputChange('recommendation', e.target.value)}
              placeholder="Share your experience, how it helped you, any tips for others..."
              sx={{
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
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.8)',
                },
              }}
            />
          </Grid>

          {/* Image Upload */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="product-image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="product-image-upload">
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
                  Add Product Image
                </Button>
              </label>
            </Box>

            {imagePreview && (
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: 200,
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 8,
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
          </Grid>
        </Grid>
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
          disabled={loading}
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
          {loading ? 'Sharing...' : 'Share Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProductShare; 