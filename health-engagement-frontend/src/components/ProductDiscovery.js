import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Grid,
  Chip,
  Typography,
  Fab,
  Paper,
  Tabs,
  Tab,
  Button,
  Alert,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import ProductCard from './ProductCard';
import AddProduct from './AddProduct';

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

const sortOptions = [
  { value: 'trending', label: 'Trending', icon: <TrendingIcon /> },
  { value: 'highest-rated', label: 'Highest Rated', icon: <StarIcon /> },
  { value: 'most-used', label: 'Most Used', icon: <PeopleIcon /> },
  { value: 'newest', label: 'Newest', icon: <ScheduleIcon /> }
];

// Popular tags for quick filtering
const popularTags = [
  'eczema', 'pms', 'anxiety', 'acne', 'gut health', 'sleep', 
  'energy', 'stress', 'inflammation', 'hormones', 'digestion',
  'mood', 'focus', 'immunity', 'detox', 'anti-aging', 'vitamin d',
  'omega 3', 'probiotics', 'collagen', 'biotin', 'zinc', 'iron'
];

// Price ranges for filtering
const priceRanges = [
  { label: 'Under $10', value: '0-10' },
  { label: '$10 - $25', value: '10-25' },
  { label: '$25 - $50', value: '25-50' },
  { label: '$50 - $100', value: '50-100' },
  { label: 'Over $100', value: '100+' }
];

// Rating filters
const ratingFilters = [
  { label: '4+ Stars', value: 4 },
  { label: '4.5+ Stars', value: 4.5 },
  { label: '5 Stars', value: 5 }
];

// Retailer filters
const retailers = ['Walmart', 'Sephora', 'Ulta', 'Amazon', 'Target'];

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: 'CeraVe Moisturizing Cream',
    brand: 'CeraVe',
    description: 'A rich, non-greasy moisturizer that helps restore the protective skin barrier.',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&crop=center',
    conditionTags: ['Eczema', 'Dry Skin'],
    tags: ['moisturizer', 'barrier repair', 'fragrance-free'],
    category: 'Skincare',
    upvotes: 156,
    comments: 23,
    isUpvoted: false,
    isUsed: false,
    isBookmarked: false,
    rating: 4.8,
    price: '$19.99',
    retailer: 'Amazon'
  },
  {
    id: 2,
    name: 'Nature Made Vitamin D3',
    brand: 'Nature Made',
    description: 'Supports bone health and immune system function.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center',
    conditionTags: ['Vitamin D Deficiency'],
    tags: ['vitamin d', 'bone health', 'immune support'],
    category: 'Supplements',
    upvotes: 89,
    comments: 12,
    isUpvoted: true,
    isUsed: true,
    isBookmarked: false,
    rating: 4.6,
    price: '$12.99',
    retailer: 'Walmart'
  },
  {
    id: 3,
    name: 'Calm Magnesium Supplement',
    brand: 'Calm',
    description: 'Natural magnesium supplement for stress relief and better sleep.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center',
    conditionTags: ['Anxiety', 'Insomnia'],
    tags: ['magnesium', 'stress relief', 'sleep', 'anxiety'],
    category: 'Supplements',
    upvotes: 234,
    comments: 45,
    isUpvoted: false,
    isUsed: false,
    isBookmarked: true,
    rating: 4.9,
    price: '$24.99',
    retailer: 'Amazon'
  }
];

function ProductDiscovery() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedRetailers, setSelectedRetailers] = useState([]);
  const [sortBy, setSortBy] = useState('trending');
  const [activeTab, setActiveTab] = useState(0);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [userConditions, setUserConditions] = useState([]);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const fetchProducts = async (query = 'wellness') => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching products from API with query:', query);
      
      // Try to fetch real products first
      const response = await fetch(`/api/products/real-products?q=${encodeURIComponent(query)}&limit=50`);
      console.log('API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API response data length:', data?.length);
        
        if (data && data.length > 0) {
          console.log('Setting real products:', data.length);
          setProducts(data);
          return;
        } else {
          console.log('No real products found, using mock data');
        }
      } else {
        console.log('API request failed with status:', response.status);
      }
      
      // Fallback to mock data
      console.log('Using mock products as fallback');
      setProducts(mockProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products from server, showing mock data instead');
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserConditions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.chronicConditions) {
          setUserConditions(userData.chronicConditions);
        }
      }
    } catch (error) {
      console.error('Error fetching user conditions:', error);
    }
  };

  const handleConditionToggle = (condition) => {
    setSelectedConditions(prev => 
      prev.includes(condition) 
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const handleConditionClick = (condition) => {
    setSearchQuery(condition);
    fetchProducts(condition);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    fetchProducts(tag);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      fetchProducts(searchQuery.trim());
    }
  };

  const handleUpvote = async (productId) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { 
            ...product, 
            upvotes: product.isUpvoted ? product.upvotes - 1 : product.upvotes + 1,
            isUpvoted: !product.isUpvoted 
          }
        : product
    ));
  };

  const handleUseProduct = async (productId) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, isUsed: !product.isUsed }
        : product
    ));
  };

  const handleBookmark = async (productId) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, isBookmarked: !product.isBookmarked }
        : product
    ));
  };

  const getFilteredProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query)) ||
        product.conditionTags.some(condition => condition.toLowerCase().includes(query))
      );
    }

    // Condition filter
    if (selectedConditions.length > 0) {
      filtered = filtered.filter(product =>
        product.conditionTags.some(condition =>
          selectedConditions.includes(condition)
        )
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(product =>
        product.tags.some(tag => selectedTags.includes(tag))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        selectedCategories.includes(product.category)
      );
    }

    // Price filter
    if (selectedPriceRange) {
      const [min, max] = selectedPriceRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price.replace('$', ''));
        if (max) {
          return price >= min && price <= max;
        } else {
          return price >= min;
        }
      });
    }

    // Rating filter
    if (selectedRating) {
      filtered = filtered.filter(product => product.rating >= selectedRating);
    }

    // Retailer filter
    if (selectedRetailers.length > 0) {
      filtered = filtered.filter(product =>
        selectedRetailers.includes(product.retailer)
      );
    }

    // Sort
    switch (sortBy) {
      case 'trending':
        filtered.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'highest-rated':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'most-used':
        filtered.sort((a, b) => (b.isUsed ? 1 : 0) - (a.isUsed ? 1 : 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    return filtered;
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedConditions([]);
    setSelectedTags([]);
    setSelectedCategories([]);
    setSelectedPriceRange('');
    setSelectedRating(null);
    setSelectedRetailers([]);
    setSortBy('trending');
  };

  const renderSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item}>
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
    </Grid>
  );

  const handleProductAdded = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
    setAddProductModalOpen(false);
  };

  useEffect(() => {
    fetchProducts();
    fetchUserConditions();
  }, []);

  const filteredProducts = getFilteredProducts();

  return (
    <Box sx={{ 
      maxWidth: 1400, 
      mx: 'auto', 
      p: { xs: 2, sm: 3, md: 4 },
      minHeight: '100vh'
    }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          sx={{ 
            mb: 2, 
            fontWeight: 800,
            background: 'linear-gradient(45deg, #A8D5BA, #F8BBD9)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' }
          }}
        >
          Discover Wellness Products 🔍
        </Typography>
        <Typography 
          variant={isMobile ? "body1" : "h6"} 
          color="text.secondary" 
          sx={{ 
            mb: 3,
            fontSize: { xs: '0.9rem', md: '1.25rem' }
          }}
        >
          Find products recommended by our community and AI for your health journey
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box component="form" onSubmit={handleSearch} sx={{ mb: { xs: 3, md: 4 } }}>
        <TextField
          fullWidth
          placeholder="Search products, brands, conditions, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#A8D5BA' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {searchQuery && (
                  <IconButton 
                    onClick={() => setSearchQuery('')} 
                    size="small"
                    sx={{ color: '#A8D5BA' }}
                  >
                    <ClearIcon />
                  </IconButton>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    ml: 1,
                    background: 'linear-gradient(45deg, #A8D5BA, #F8BBD9)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #81C784, #F48FB1)',
                    },
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: 'auto',
                    px: 2
                  }}
                >
                  Search
                </Button>
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'background.paper',
              fontSize: { xs: '0.9rem', md: '1.1rem' },
              '&:hover': {
                backgroundColor: 'background.paper',
              },
              '& fieldset': {
                borderColor: '#E1BEE7',
              },
              '&:hover fieldset': {
                borderColor: '#A8D5BA',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#A8D5BA',
              },
            }
          }}
        />
      </Box>

      {/* Quick Filter Tabs */}
      <Paper sx={{ 
        p: { xs: 2, md: 3 }, 
        mb: { xs: 3, md: 4 }, 
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(168, 213, 186, 0.15)'
      }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          sx={{ 
            mb: 2, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: '#2C3E50',
            fontWeight: 600
          }}
        >
          <FilterIcon sx={{ color: '#A8D5BA' }} />
          Quick Filters
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ 
            mb: 3,
            '& .MuiTab-root': {
              fontSize: { xs: '0.8rem', md: '0.875rem' },
              minHeight: { xs: 48, md: 56 },
              color: '#7F8C8D',
              '&.Mui-selected': {
                color: '#A8D5BA',
                fontWeight: 600
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#A8D5BA'
            }
          }}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
        >
          <Tab label="Your Conditions" />
          <Tab label="Popular Tags" />
          <Tab label="Categories" />
          <Tab label="Price & Rating" />
          <Tab label="Retailers" />
          <Tab label="Sort Options" />
        </Tabs>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: '#2C3E50' }}>
              Filter by your conditions:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {userConditions.map((condition) => (
                <Chip
                  key={condition}
                  label={condition}
                  onClick={() => handleConditionClick(condition)}
                  color={selectedConditions.includes(condition) ? 'primary' : 'default'}
                  variant={selectedConditions.includes(condition) ? 'filled' : 'outlined'}
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    fontWeight: 600,
                    backgroundColor: selectedConditions.includes(condition) ? '#A8D5BA' : 'transparent',
                    color: selectedConditions.includes(condition) ? '#2C3E50' : '#A8D5BA',
                    borderColor: '#A8D5BA',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: selectedConditions.includes(condition) ? '#81C784' : 'rgba(168, 213, 186, 0.1)',
                      transform: 'scale(1.05)'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: '#2C3E50' }}>
              Filter by popular tags:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {popularTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => handleTagClick(tag)}
                  color={selectedTags.includes(tag) ? 'secondary' : 'default'}
                  variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    fontWeight: 600,
                    backgroundColor: selectedTags.includes(tag) ? '#F8BBD9' : 'transparent',
                    color: selectedTags.includes(tag) ? '#2C3E50' : '#F8BBD9',
                    borderColor: '#F8BBD9',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: selectedTags.includes(tag) ? '#F48FB1' : 'rgba(248, 187, 217, 0.1)',
                      transform: 'scale(1.05)'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: '#2C3E50' }}>
              Filter by categories:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => {
                    setSelectedCategories(prev => 
                      prev.includes(category) 
                        ? prev.filter(c => c !== category)
                        : [...prev, category]
                    );
                  }}
                  color={selectedCategories.includes(category) ? 'primary' : 'default'}
                  variant={selectedCategories.includes(category) ? 'filled' : 'outlined'}
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    fontWeight: 600,
                    backgroundColor: selectedCategories.includes(category) ? '#E1BEE7' : 'transparent',
                    color: selectedCategories.includes(category) ? '#2C3E50' : '#E1BEE7',
                    borderColor: '#E1BEE7',
                    '&:hover': {
                      backgroundColor: selectedCategories.includes(category) ? '#CE93D8' : 'rgba(225, 190, 231, 0.1)'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: '#2C3E50' }}>
              Filter by price range:
            </Typography>
            <ToggleButtonGroup
              value={selectedPriceRange}
              exclusive
              onChange={(e, value) => setSelectedPriceRange(value)}
              sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}
            >
              {priceRanges.map((range) => (
                <ToggleButton
                  key={range.value}
                  value={range.value}
                  sx={{
                    borderColor: '#A8D5BA',
                    color: selectedPriceRange === range.value ? '#2C3E50' : '#A8D5BA',
                    backgroundColor: selectedPriceRange === range.value ? '#A8D5BA' : 'transparent',
                    '&:hover': {
                      backgroundColor: selectedPriceRange === range.value ? '#81C784' : 'rgba(168, 213, 186, 0.1)'
                    },
                    fontSize: { xs: '0.75rem', md: '0.875rem' }
                  }}
                >
                  {range.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: '#2C3E50' }}>
              Filter by rating:
            </Typography>
            <ToggleButtonGroup
              value={selectedRating}
              exclusive
              onChange={(e, value) => setSelectedRating(value)}
              sx={{ flexWrap: 'wrap', gap: 1 }}
            >
              {ratingFilters.map((filter) => (
                <ToggleButton
                  key={filter.value}
                  value={filter.value}
                  sx={{
                    borderColor: '#F8BBD9',
                    color: selectedRating === filter.value ? '#2C3E50' : '#F8BBD9',
                    backgroundColor: selectedRating === filter.value ? '#F8BBD9' : 'transparent',
                    '&:hover': {
                      backgroundColor: selectedRating === filter.value ? '#F48FB1' : 'rgba(248, 187, 217, 0.1)'
                    },
                    fontSize: { xs: '0.75rem', md: '0.875rem' }
                  }}
                >
                  {filter.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        )}

        {activeTab === 4 && (
          <Box>
            <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: '#2C3E50' }}>
              Filter by retailers:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {retailers.map((retailer) => (
                <Chip
                  key={retailer}
                  label={retailer}
                  onClick={() => {
                    setSelectedRetailers(prev => 
                      prev.includes(retailer) 
                        ? prev.filter(r => r !== retailer)
                        : [...prev, retailer]
                    );
                  }}
                  color={selectedRetailers.includes(retailer) ? 'primary' : 'default'}
                  variant={selectedRetailers.includes(retailer) ? 'filled' : 'outlined'}
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    fontWeight: 600,
                    backgroundColor: selectedRetailers.includes(retailer) ? '#FFCCBC' : 'transparent',
                    color: selectedRetailers.includes(retailer) ? '#2C3E50' : '#FFCCBC',
                    borderColor: '#FFCCBC',
                    '&:hover': {
                      backgroundColor: selectedRetailers.includes(retailer) ? '#FFAB91' : 'rgba(255, 204, 188, 0.1)'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {activeTab === 5 && (
          <Box>
            <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: '#2C3E50' }}>
              Sort products by:
            </Typography>
            <ToggleButtonGroup
              value={sortBy}
              exclusive
              onChange={(e, value) => setSortBy(value)}
              sx={{ flexWrap: 'wrap', gap: 1 }}
            >
              {sortOptions.map((option) => (
                <ToggleButton
                  key={option.value}
                  value={option.value}
                  sx={{
                    borderColor: '#B3E5FC',
                    color: sortBy === option.value ? '#2C3E50' : '#B3E5FC',
                    backgroundColor: sortBy === option.value ? '#B3E5FC' : 'transparent',
                    '&:hover': {
                      backgroundColor: sortBy === option.value ? '#81D4FA' : 'rgba(179, 229, 252, 0.1)'
                    },
                    fontSize: { xs: '0.75rem', md: '0.875rem' }
                  }}
                >
                  {option.icon}
                  <Box sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                    {option.label}
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        )}

        {/* Clear Filters Button */}
        {(selectedConditions.length > 0 || selectedTags.length > 0 || selectedCategories.length > 0 || 
          selectedPriceRange || selectedRating || selectedRetailers.length > 0) && (
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(168, 213, 186, 0.2)' }}>
            <Button
              onClick={clearAllFilters}
              startIcon={<ClearIcon />}
              sx={{
                color: '#A8D5BA',
                borderColor: '#A8D5BA',
                '&:hover': {
                  borderColor: '#81C784',
                  backgroundColor: 'rgba(168, 213, 186, 0.1)'
                }
              }}
              variant="outlined"
              size={isMobile ? "small" : "medium"}
            >
              Clear All
            </Button>
          </Box>
        )}
      </Paper>

      {/* Results Summary */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: 3,
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          sx={{ 
            fontWeight: 600,
            color: '#2C3E50'
          }}
        >
          {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Found
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddProductModalOpen(true)}
          sx={{
            background: 'linear-gradient(45deg, #A8D5BA, #F8BBD9)',
            '&:hover': {
              background: 'linear-gradient(45deg, #81C784, #F48FB1)',
              transform: 'translateY(-2px)'
            },
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 15px rgba(168, 213, 186, 0.4)',
            transition: 'all 0.3s ease-in-out',
            fontSize: { xs: '0.875rem', md: '1rem' }
          }}
        >
          Share a Product
        </Button>
      </Box>

      {/* Products Grid */}
      <Box>
        {loading ? (
          renderSkeleton()
        ) : error ? (
          <Alert severity="warning" sx={{ borderRadius: 2, p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Could not load real product data. Showing mock results instead.
            </Typography>
          </Alert>
        ) : filteredProducts.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2, p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              No products found matching your criteria 🌟
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Try adjusting your filters or be the first to share a product that could help others!
            </Typography>
            <Button
              variant="contained"
              onClick={() => setAddProductModalOpen(true)}
              sx={{
                background: 'linear-gradient(45deg, #A8D5BA, #F8BBD9)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #81C784, #F48FB1)',
                  transform: 'translateY(-2px)'
                },
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(168, 213, 186, 0.4)',
                transition: 'all 0.3s ease-in-out'
              }}
            >
              Share Your First Product
            </Button>
          </Alert>
        ) : (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} lg={4} key={product.id}>
                <ProductCard
                  product={product}
                  onUpvote={() => handleUpvote(product.id)}
                  onUse={() => handleUseProduct(product.id)}
                  onBookmark={() => handleBookmark(product.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="share product"
        onClick={() => setAddProductModalOpen(true)}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, md: 24 },
          right: { xs: 16, md: 24 },
          background: 'linear-gradient(45deg, #A8D5BA, #F8BBD9)',
          '&:hover': {
            background: 'linear-gradient(45deg, #81C784, #F48FB1)',
            transform: 'scale(1.1)'
          },
          boxShadow: '0 8px 25px rgba(168, 213, 186, 0.4)',
          transition: 'all 0.3s ease-in-out',
          width: { xs: 56, md: 64 },
          height: { xs: 56, md: 64 }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Add Product Modal */}
      <AddProduct
        open={addProductModalOpen}
        onClose={() => setAddProductModalOpen(false)}
        onProductAdded={handleProductAdded}
      />
    </Box>
  );
}

export default ProductDiscovery; 