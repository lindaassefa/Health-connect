import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  InputAdornment,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Article as PostIcon,
  ShoppingBag as ProductIcon,
  TrendingUp as TrendingIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SearchModal({ open, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const tabs = [
    { label: 'All', value: 'all' },
    { label: 'Posts', value: 'posts' },
    { label: 'People', value: 'users' },
    { label: 'Products', value: 'products' }
  ];

  // Fetch search suggestions
  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/search/suggestions?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Perform search
  const performSearch = async (query, type = 'all') => {
    if (!query.trim()) {
      setSearchResults({});
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}&type=${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data.results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({});
    } finally {
      setLoading(false);
    }
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSuggestions(true);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(query);
      if (query.trim()) {
        performSearch(query, tabs[activeTab].value);
      }
    }, 300);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    performSearch(suggestion.text, tabs[activeTab].value);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (searchQuery.trim()) {
      performSearch(searchQuery, tabs[newValue].value);
    }
  };

  // Handle result click
  const handleResultClick = (result) => {
    switch (result.type) {
      case 'user':
        navigate(`/user/${result.id}`);
        break;
      case 'post':
        // Navigate to post or show post details
        navigate('/home');
        break;
      case 'product':
        // Navigate to product details
        navigate('/products');
        break;
      default:
        break;
    }
    onClose();
  };

  // Handle enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowSuggestions(false);
      performSearch(searchQuery, tabs[activeTab].value);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setSearchResults({});
    setShowSuggestions(false);
  };

  // Close modal
  const handleClose = () => {
    handleClearSearch();
    onClose();
  };

  // Render suggestion item
  const renderSuggestion = (suggestion) => (
    <ListItem
      key={`${suggestion.type}-${suggestion.text}`}
      button
      onClick={() => handleSuggestionClick(suggestion)}
      sx={{ py: 1 }}
    >
      <ListItemAvatar>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          {suggestion.type === 'user' && <PersonIcon />}
          {suggestion.type === 'condition' && <TrendingIcon />}
          {suggestion.type === 'product' && <ProductIcon />}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={suggestion.display}
        secondary={suggestion.type}
        primaryTypographyProps={{ fontSize: '0.9rem' }}
        secondaryTypographyProps={{ fontSize: '0.75rem' }}
      />
    </ListItem>
  );

  // Render search result
  const renderSearchResult = (result) => {
    switch (result.type) {
      case 'user':
        return (
          <ListItem
            key={`user-${result.id}`}
            button
            onClick={() => handleResultClick(result)}
            sx={{ py: 2 }}
          >
            <ListItemAvatar>
              <Avatar src={result.profilePicture}>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={result.fullName || result.username}
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    @{result.username}
                  </Typography>
                  {result.location && (
                    <>
                      <LocationIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2" color="text.secondary">
                        {result.location}
                      </Typography>
                    </>
                  )}
                </Box>
              }
            />
            {result.chronicConditions && result.chronicConditions.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {result.chronicConditions.slice(0, 2).map((condition) => (
                  <Chip
                    key={condition}
                    label={condition}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
              </Box>
            )}
          </ListItem>
        );

      case 'post':
        return (
          <ListItem
            key={`post-${result.id}`}
            button
            onClick={() => handleResultClick(result)}
            sx={{ py: 2 }}
          >
            <ListItemAvatar>
              <Avatar src={result.user?.profilePicture}>
                <PostIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {result.user?.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • {new Date(result.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              }
              secondary={
                <Typography
                  variant="body2"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mt: 0.5
                  }}
                >
                  {result.caption}
                </Typography>
              }
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                ❤️ {result.likeCount}
              </Typography>
            </Box>
          </ListItem>
        );

      case 'product':
        return (
          <ListItem
            key={`product-${result.id}`}
            button
            onClick={() => handleResultClick(result)}
            sx={{ py: 2 }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <ProductIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={result.name}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {result.brand} • {result.category}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mt: 0.5
                    }}
                  >
                    {result.description}
                  </Typography>
                </Box>
              }
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
              <Typography variant="body2" color="primary">
                ⭐ {result.rating}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {result.useCount} users
              </Typography>
            </Box>
          </ListItem>
        );

      default:
        return null;
    }
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
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SearchIcon color="primary" />
          <Typography variant="h6">Search Med Mingle</Typography>
          <IconButton
            onClick={handleClose}
            sx={{ ml: 'auto' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {/* Search Input */}
        <TextField
          fullWidth
          placeholder="Search posts, people, products, or conditions..."
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>

        {/* Content */}
        <Box sx={{ minHeight: 200 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : showSuggestions && suggestions.length > 0 ? (
            // Show suggestions
            <List>
              {suggestions.map(renderSuggestion)}
            </List>
          ) : searchQuery.trim() && Object.keys(searchResults).length === 0 ? (
            // No results
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No results found for "{searchQuery}". Try different keywords or check your spelling.
            </Alert>
          ) : searchQuery.trim() && Object.keys(searchResults).length > 0 ? (
            // Show search results
            <Box>
              {Object.entries(searchResults).map(([type, results]) => (
                results.length > 0 && (
                  <Box key={type} sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1, textTransform: 'capitalize' }}>
                      {type} ({results.length})
                    </Typography>
                    <List>
                      {results.map(renderSearchResult)}
                    </List>
                    {type !== Object.keys(searchResults)[Object.keys(searchResults).length - 1] && (
                      <Divider sx={{ my: 2 }} />
                    )}
                  </Box>
                )
              ))}
            </Box>
          ) : (
            // Initial state
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Search for anything
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Find posts, people, products, or health conditions
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default SearchModal; 