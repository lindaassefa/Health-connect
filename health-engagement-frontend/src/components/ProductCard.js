import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Button,
  Box,
  IconButton,
  Avatar,
  Divider,
  Badge,
  Tooltip,
  LinearProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ThumbUp as UpvoteIcon,
  ThumbUpOutlined as UpvoteOutlinedIcon,
  CheckCircle as UseIcon,
  CheckCircleOutline as UseOutlinedIcon,
  ChatBubbleOutline as CommentIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkOutlinedIcon,
  Star as StarIcon,
  AutoAwesome as AIIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';

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

const getConditionColor = (condition) => {
  const colorMap = {
    'Eczema': '#A8D5BA',
    'PCOS': '#F8BBD9',
    'Acne': '#FFCCBC',
    'IBS': '#B3E5FC',
    'Anxiety': '#E1BEE7',
    'Depression': '#FFF8E1',
    'Diabetes': '#FFAB91',
    'Hypertension': '#C8E6C9',
    'Asthma': '#BBDEFB',
    'Migraines': '#F3E5F5',
    'Fibromyalgia': '#E0F2F1',
    'Endometriosis': '#FCE4EC',
    'ADHD': '#FFF3E0',
    'Autism': '#E8F5E8',
    'Lupus': '#F1F8E9',
    'Rheumatoid Arthritis': '#E8EAF6'
  };
  return colorMap[condition] || '#A8D5BA';
};

function ProductCard({ product, onUpvote, onUse, onBookmark, onComment }) {
  const {
    name,
    brand,
    description,
    imageUrl,
    conditionTags = [],
    upvotes = 0,
    comments = 0,
    isUpvoted = false,
    isUsed = false,
    isBookmarked = false,
    rating: rawRating = 0,
    useCount = 0,
    recommendedByAI = true,
    tags = []
  } = product;

  // Ensure rating is a number
  const rating = typeof rawRating === 'string' ? parseFloat(rawRating) : Number(rawRating) || 0;

  // Ensure useCount is a number
  const safeUseCount = typeof useCount === 'string' ? parseInt(useCount) : Number(useCount) || 0;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getGradientBackground = () => {
    if (Array.isArray(conditionTags) && conditionTags.length > 0) {
      const colors = conditionTags.map(tag => getConditionColor(tag));
      if (colors.length === 1) {
        return `linear-gradient(135deg, ${colors[0]}20 0%, ${colors[0]}10 100%)`;
      }
      return `linear-gradient(135deg, ${colors[0]}20 0%, ${colors[1] || colors[0]}10 100%)`;
    }
    return 'linear-gradient(135deg, #A8D5BA10 0%, #F8BBD910 100%)';
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(168, 213, 186, 0.15)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: getGradientBackground(),
        border: '1px solid rgba(168, 213, 186, 0.2)',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: '0 20px 40px rgba(168, 213, 186, 0.25)',
        }
      }}
    >
      {/* Product Image with AI Badge */}
      <Box sx={{ position: 'relative' }}>
      <CardMedia
        component="img"
          height={isMobile ? "180" : "220"}
          image={imageUrl || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&crop=center'}
        alt={name}
        sx={{
          objectFit: 'cover',
            backgroundColor: 'grey.100',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12
        }}
      />

        {/* AI Recommendation Badge */}
        {recommendedByAI && (
          <Tooltip title="AI Recommended" arrow>
            <Badge
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                '& .MuiBadge-badge': {
                  background: 'linear-gradient(45deg, #A8D5BA, #F8BBD9)',
                  color: '#2C3E50',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: 2
                }
              }}
              badgeContent={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AIIcon sx={{ fontSize: 12 }} />
                  AI
                </Box>
              }
            />
          </Tooltip>
        )}

        {/* Trending Badge for high upvotes */}
        {upvotes && upvotes > 100 && (
          <Tooltip title="Trending Product" arrow>
            <Chip
              icon={<TrendingIcon />}
              label="Trending"
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                background: 'linear-gradient(45deg, #A8D5BA, #F8BBD9)',
                color: '#2C3E50',
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            />
          </Tooltip>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
        {/* Product Name and Brand */}
        <Typography 
          variant={isMobile ? "h6" : "h6"} 
          sx={{ 
            fontWeight: 700, 
            mb: 1, 
            lineHeight: 1.2, 
            color: '#2C3E50',
            fontSize: { xs: '1rem', md: '1.25rem' }
          }}
        >
          {name}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2, 
            fontWeight: 500,
            fontSize: { xs: '0.8rem', md: '0.875rem' }
          }}
        >
          by {brand}
        </Typography>

        {/* Rating with Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <StarIcon sx={{ color: '#FFD700', fontSize: { xs: 18, md: 20 }, mr: 0.5 }} />
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600, 
                mr: 1,
                fontSize: { xs: '0.8rem', md: '0.875rem' }
              }}
            >
              {rating ? rating.toFixed(1) : '0.0'}
          </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
            >
              ({safeUseCount ? safeUseCount.toLocaleString() : '0'} users)
          </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={rating ? (rating / 5) * 100 : 0} 
            sx={{ 
              height: 4, 
              borderRadius: 2,
              backgroundColor: 'rgba(255, 215, 0, 0.2)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(45deg, #FFD700, #FFA500)'
              }
            }} 
          />
        </Box>

        {/* Description */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 3, 
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontSize: { xs: '0.8rem', md: '0.875rem' }
          }}
        >
          {description}
        </Typography>

        {/* Condition Tags with Enhanced Styling */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2 }}>
          {Array.isArray(conditionTags) && conditionTags.map((condition) => (
            <Chip
              key={condition}
              label={`${conditionEmojis[condition] || '🏥'} ${condition}`}
              size="small"
              variant="filled"
              sx={{
                fontSize: { xs: '0.7rem', md: '0.75rem' },
                height: { xs: 22, md: 24 },
                fontWeight: 600,
                background: `${getConditionColor(condition)}30`,
                color: '#2C3E50',
                border: `1px solid ${getConditionColor(condition)}50`,
                '& .MuiChip-label': {
                  px: 1.5
                },
                '&:hover': {
                  background: `${getConditionColor(condition)}40`,
                }
              }}
            />
          ))}
        </Box>

        {/* Additional Tags */}
        {Array.isArray(tags) && tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: { xs: '0.65rem', md: '0.7rem' },
                  height: { xs: 18, md: 20 },
                  borderColor: '#A8D5BA',
                  color: '#A8D5BA',
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
            ))}
            {tags.length > 3 && (
              <Chip
                label={`+${tags.length - 3}`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: { xs: '0.65rem', md: '0.7rem' },
                  height: { xs: 18, md: 20 },
                  borderColor: '#7F8C8D',
                  color: '#7F8C8D',
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
            )}
          </Box>
        )}
      </CardContent>

      <Divider sx={{ mx: 2 }} />

      {/* Action Buttons */}
      <Box sx={{ p: { xs: 2, md: 3 }, pt: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          flexWrap: 'wrap',
          gap: 1
        }}>
          {/* Upvote Button */}
          <Button
            startIcon={isUpvoted ? <UpvoteIcon sx={{ color: '#A8D5BA' }} /> : <UpvoteOutlinedIcon />}
            onClick={onUpvote}
            size="small"
            sx={{
              textTransform: 'none',
              minWidth: 'auto',
              px: { xs: 1.5, md: 2 },
              py: 0.5,
              borderRadius: 2,
              fontWeight: 600,
              backgroundColor: isUpvoted ? '#A8D5BA' : 'transparent',
              color: isUpvoted ? '#2C3E50' : '#7F8C8D',
              fontSize: { xs: '0.75rem', md: '0.875rem' },
              '&:hover': {
                backgroundColor: isUpvoted ? '#81C784' : 'rgba(168, 213, 186, 0.1)',
              }
            }}
          >
            {upvotes ? upvotes.toLocaleString() : '0'}
          </Button>

          {/* Use Button */}
          <Button
            startIcon={isUsed ? <UseIcon sx={{ color: '#F8BBD9' }} /> : <UseOutlinedIcon />}
            onClick={onUse}
            size="small"
            sx={{
              textTransform: 'none',
              minWidth: 'auto',
              px: { xs: 1.5, md: 2 },
              py: 0.5,
              borderRadius: 2,
              fontWeight: 600,
              backgroundColor: isUsed ? '#F8BBD9' : 'transparent',
              color: isUsed ? '#2C3E50' : '#7F8C8D',
              fontSize: { xs: '0.75rem', md: '0.875rem' },
              '&:hover': {
                backgroundColor: isUsed ? '#F48FB1' : 'rgba(248, 187, 217, 0.1)',
              }
            }}
          >
            {isUsed ? 'Using' : 'Use This'}
          </Button>

          {/* Comment Button */}
          <Button
            startIcon={<CommentIcon />}
            onClick={onComment}
            size="small"
            sx={{
              textTransform: 'none',
              minWidth: 'auto',
              px: { xs: 1.5, md: 2 },
              py: 0.5,
              borderRadius: 2,
              fontWeight: 600,
              color: '#7F8C8D',
              fontSize: { xs: '0.75rem', md: '0.875rem' },
              '&:hover': {
                backgroundColor: 'rgba(127, 140, 141, 0.1)',
              }
            }}
          >
            {comments || 0}
          </Button>

          {/* Bookmark Button */}
          <IconButton
            onClick={onBookmark}
            size="small"
            sx={{
              backgroundColor: isBookmarked ? '#E1BEE7' : 'transparent',
              color: isBookmarked ? '#2C3E50' : '#7F8C8D',
              '&:hover': {
                backgroundColor: isBookmarked ? '#CE93D8' : 'rgba(225, 190, 231, 0.1)',
              }
            }}
          >
            {isBookmarked ? <BookmarkIcon /> : <BookmarkOutlinedIcon />}
          </IconButton>
        </Box>

        {/* Usage Stats */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              fontWeight: 500,
              fontSize: { xs: '0.7rem', md: '0.75rem' }
            }}
          >
            {safeUseCount ? safeUseCount.toLocaleString() : '0'} people use this
          </Typography>
          
          {isUsed && (
            <Chip
              label="You use this"
              size="small"
              variant="filled"
              sx={{ 
                fontSize: { xs: '0.65rem', md: '0.7rem' }, 
                height: { xs: 18, md: 20 },
                fontWeight: 600,
                background: '#A8D5BA',
                color: '#2C3E50'
              }}
            />
          )}
        </Box>
      </Box>
    </Card>
  );
}

export default ProductCard; 