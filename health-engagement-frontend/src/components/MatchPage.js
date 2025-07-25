import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Grid,
  IconButton,
  Paper,
  Alert,
  Skeleton,
  Divider
} from '@mui/material';
import {
  Chat as ChatIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Close as CloseIcon,
  Favorite as HeartIcon,
  FavoriteBorder as HeartBorderIcon
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
  'Autism': '🧩',
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

// Mock match data
const mockMatches = [
  {
    id: 1,
    user: {
      id: 1,
      name: 'Sarah',
      age: 28,
      location: 'San Francisco, CA',
      profilePicture: null,
      isAnonymous: false
    },
    sharedConditions: ['Eczema', 'Anxiety'],
    vibeTags: ['Deep', 'Creative'],
    matchingReason: '3 shared conditions',
    compatibility: 85
  },
  {
    id: 2,
    user: {
      id: 2,
      name: 'Anonymous',
      age: 32,
      location: 'New York, NY',
      profilePicture: null,
      isAnonymous: true
    },
    sharedConditions: ['PCOS'],
    vibeTags: ['Funny', 'Cozy'],
    matchingReason: 'Similar PCOS journey',
    compatibility: 78
  },
  {
    id: 3,
    user: {
      id: 3,
      name: 'Mike',
      age: 25,
      location: 'Austin, TX',
      profilePicture: null,
      isAnonymous: false
    },
    sharedConditions: ['Anxiety', 'Depression'],
    vibeTags: ['Nerdy', 'Academic'],
    matchingReason: 'Mental health support',
    compatibility: 92
  }
];

function MatchPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [skipped, setSkipped] = useState(new Set());

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/match', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMatches(response.data);
    } catch (err) {
      console.error('Error fetching matches:', err);
      // Use mock data for now
      setMatches(mockMatches);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (matchId) => {
    // TODO: Implement chat functionality
    console.log('Start chat with match:', matchId);
  };

  const handleAddToFavorites = (matchId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(matchId)) {
        newFavorites.delete(matchId);
      } else {
        newFavorites.add(matchId);
      }
      return newFavorites;
    });
  };

  const handleSkip = (matchId) => {
    setSkipped(prev => new Set(prev).add(matchId));
    setMatches(prev => prev.filter(match => match.id !== matchId));
  };

  const renderMatchCard = (match) => (
    <Card 
      key={match.id} 
      sx={{ 
        height: '100%',
        borderRadius: 3,
        boxShadow: 3,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              mr: 2,
              bgcolor: match.user.isAnonymous ? 'grey.400' : 'primary.main',
              fontSize: '1.5rem'
            }}
          >
            {match.user.isAnonymous ? '?' : match.user.name[0]}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {match.user.isAnonymous ? 'Anonymous' : match.user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {match.user.age} • {match.user.location}
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {match.compatibility}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Match
            </Typography>
          </Box>
        </Box>

        {/* Shared Conditions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            Shared Conditions:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {match.sharedConditions.map((condition) => (
              <Chip
                key={condition}
                label={`${conditionEmojis[condition] || '🏥'} ${condition}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        </Box>

        {/* Vibe Tags */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            Vibe:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {match.vibeTags.map((vibe) => (
              <Chip
                key={vibe}
                label={`${vibeEmojis[vibe] || '✨'} ${vibe}`}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.75rem',
                  borderColor: 'primary.light',
                  color: 'primary.main'
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Matching Reason */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: 'primary.contrastText' }}>
            💫 {match.matchingReason}
          </Typography>
        </Paper>

        <Divider sx={{ mb: 2 }} />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<ChatIcon />}
            onClick={() => handleStartChat(match.id)}
            sx={{
              flex: 1,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            Start Chat
          </Button>
          
          <IconButton
            onClick={() => handleAddToFavorites(match.id)}
            sx={{
              color: favorites.has(match.id) ? 'warning.main' : 'text.secondary',
              border: '1px solid',
              borderColor: favorites.has(match.id) ? 'warning.main' : 'divider'
            }}
          >
            {favorites.has(match.id) ? <StarIcon /> : <StarBorderIcon />}
          </IconButton>
          
          <IconButton
            onClick={() => handleSkip(match.id)}
            sx={{
              color: 'text.secondary',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => (
    <Grid container spacing={3}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Skeleton variant="circular" width={60} height={60} sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" height={16} />
                </Box>
                <Skeleton variant="text" width={40} height={24} />
              </Box>
              <Skeleton variant="text" width="100%" height={16} sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
              </Box>
              <Skeleton variant="text" width="100%" height={16} sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
              </Box>
              <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1, mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Skeleton variant="rectangular" width="70%" height={36} sx={{ borderRadius: 1 }} />
                <Skeleton variant="circular" width={36} height={36} />
                <Skeleton variant="circular" width={36} height={36} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', color: 'primary.main' }}>
        Find Your Health Buddies 💫
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
        Connect with people who understand your health journey
      </Typography>

      {loading ? (
        renderSkeleton()
      ) : matches.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            You're still someone's 2 a.m. eczema rant buddy 💬
          </Typography>
          <Typography variant="body2">
            Check back later for new matches, or try updating your profile to find more connections!
          </Typography>
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {matches.map(renderMatchCard)}
        </Grid>
      )}

      {/* Stats */}
      {matches.length > 0 && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {matches.length} potential matches • {favorites.size} favorites • {skipped.size} skipped
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default MatchPage; 