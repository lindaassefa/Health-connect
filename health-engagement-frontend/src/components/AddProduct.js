import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  AutoAwesome as AIIcon
} from '@mui/icons-material';

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

const popularTags = [
  'eczema', 'pms', 'anxiety', 'acne', 'gut health', 'sleep', 
  'energy', 'stress', 'inflammation', 'hormones', 'digestion',
  'mood', 'focus', 'immunity', 'detox', 'anti-aging'
];

function AddProduct({ open, onClose, onProductAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    imageUrl: '',
    category: '',
    tags: [],
    price: ''
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleQuickAddTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description) {
      setError('Please fill in the required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          brand: formData.brand,
          description: formData.description,
          imageUrl: formData.imageUrl,
          category: formData.category,
          tags: formData.tags,
          price: formData.price ? parseFloat(formData.price) : null
        })
      });

      if (response.ok) {
        const newProduct = await response.json();
        onProductAdded(newProduct);
        handleClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add product');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      brand: '',
      description: '',
      imageUrl: '',
      category: '',
      tags: [],
      price: ''
    });
    setNewTag('');
    setError('');
    setLoading(false);
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
          background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)',
          backdropFilter: 'blur(10px)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '12px 12px 0 0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AIIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Share a Wellness Product
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Product Name */}
          <TextField
            label="Product Name *"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            fullWidth
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* Brand */}
          <TextField
            label="Brand"
            value={formData.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* Description */}
          <TextField
            label="Description *"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            fullWidth
            multiline
            rows={4}
            required
            helperText="Describe how this product helps with wellness and any conditions it addresses"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* Image URL */}
          <TextField
            label="Image URL (optional)"
            value={formData.imageUrl}
            onChange={(e) => handleInputChange('imageUrl', e.target.value)}
            fullWidth
            placeholder="https://example.com/product-image.jpg"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* Category and Price */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Price (optional)"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              type="number"
              placeholder="29.99"
              sx={{ 
                width: '40%',
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
            />
          </Box>

          {/* Tags Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Tags
            </Typography>
            
            {/* Add Tag Input */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                size="small"
                sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Button
                variant="contained"
                onClick={handleAddTag}
                startIcon={<AddIcon />}
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                Add
              </Button>
            </Box>

            {/* Selected Tags */}
            {formData.tags.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Selected tags:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      color="primary"
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Popular Tags */}
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Popular tags (click to add):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {popularTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => handleQuickAddTag(tag)}
                    variant={formData.tags.includes(tag) ? 'filled' : 'outlined'}
                    color={formData.tags.includes(tag) ? 'primary' : 'default'}
                    size="small"
                    sx={{ 
                      cursor: 'pointer',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: formData.tags.includes(tag) ? 'primary.main' : 'rgba(0,0,0,0.04)'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.name || !formData.description}
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
            }
          }}
        >
          {loading ? 'Adding...' : 'Share Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddProduct; 