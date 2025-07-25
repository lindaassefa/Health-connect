import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  Fab,
  Grid,
  Divider,
  Badge,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Favorite as LikeIcon,
  FavoriteBorder as LikeBorderIcon,
  ChatBubbleOutline as CommentIcon,
  BookmarkBorder as SaveIcon,
  Report as ReportIcon,
  Add as AddIcon,
  Visibility as AnonymousIcon
} from '@mui/icons-material';
import axios from 'axios';
import CreatePost from './CreatePost';

// Mock data for demonstration
const mockPosts = [
  {
    id: 1,
    user: {
      id: 1,
      username: 'Sarah',
      profilePicture: null,
      isAnonymous: false
    },
    caption: 'Finally found a moisturizer that doesn\'t irritate my eczema! The CeraVe cream has been a game changer. Anyone else tried it?',
    imageUrl: null,
    conditionTags: ['Eczema'],
    likeCount: 24,
    isLiked: false,
    commentCount: 8,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    user: {
      id: 2,
      username: 'Anonymous',
      profilePicture: null,
      isAnonymous: true
    },
    caption: 'Having a really rough day with my PCOS symptoms. The bloating and cramps are unbearable today. Just needed to vent to people who understand 😔',
    imageUrl: null,
    conditionTags: ['PCOS'],
    likeCount: 45,
    isLiked: true,
    commentCount: 12,
    createdAt: '2024-01-15T09:15:00Z'
  },
  {
    id: 3,
    user: {
      id: 3,
      username: 'Mike',
      profilePicture: null,
      isAnonymous: false
    },
    caption: 'Started a new workout routine for my anxiety and it\'s been amazing! Cardio really helps clear my mind. What exercises work best for you?',
    imageUrl: null,
    conditionTags: ['Anxiety'],
    likeCount: 18,
    isLiked: false,
    commentCount: 5,
    createdAt: '2024-01-15T08:45:00Z'
  }
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

function HomeFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [userConditions, setUserConditions] = useState(['Eczema', 'PCOS', 'Anxiety']); // Mock user conditions
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/posts/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      // Use mock data for now
      setPosts(mockPosts);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/likes/${postId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLiked: !post.isLiked,
                likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
              }
            : post
        )
      );
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleReport = (postId) => {
    // TODO: Implement report functionality
    console.log('Report post:', postId);
  };

  const handleSave = (postId) => {
    // TODO: Implement save functionality
    console.log('Save post:', postId);
  };

  const handleComment = (postId) => {
    // TODO: Implement comment functionality
    console.log('Comment on post:', postId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getFilteredPosts = () => {
    if (selectedTab === 0) return posts; // All posts
    
    const selectedCondition = userConditions[selectedTab - 1];
    return posts.filter(post => 
      post.conditionTags.includes(selectedCondition)
    );
  };

  const filteredPosts = getFilteredPosts();

  const renderPostCard = (post) => (
    <Card key={post.id} sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              mr: 2,
              bgcolor: post.user.isAnonymous ? 'grey.400' : 'primary.main'
            }}
          >
            {post.user.isAnonymous ? <AnonymousIcon /> : post.user.username[0]}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {post.user.isAnonymous ? 'Anonymous' : post.user.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(post.createdAt)}
            </Typography>
          </Box>
          
          <IconButton size="small" onClick={() => handleReport(post.id)}>
            <ReportIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {post.caption}
        </Typography>

        {post.imageUrl && (
          <Box sx={{ mb: 2 }}>
            <img
              src={post.imageUrl}
              alt="Post"
              style={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'cover',
                borderRadius: 8
              }}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {post.conditionTags.map((condition) => (
            <Chip
              key={condition}
              label={`${conditionEmojis[condition] || '🏥'} ${condition}`}
              size="small"
              variant="outlined"
              sx={{
                fontSize: '0.75rem',
                height: 24
              }}
            />
          ))}
        </Box>
      </CardContent>

      <Divider />

      <CardActions sx={{ px: 2, py: 1 }}>
        <Button
          startIcon={post.isLiked ? <LikeIcon color="error" /> : <LikeBorderIcon />}
          onClick={() => handleLike(post.id)}
          sx={{ 
            color: post.isLiked ? 'error.main' : 'text.secondary',
            textTransform: 'none'
          }}
        >
          {post.likeCount}
        </Button>

        <Button
          startIcon={<CommentIcon />}
          onClick={() => handleComment(post.id)}
          sx={{ color: 'text.secondary', textTransform: 'none' }}
        >
          {post.commentCount}
        </Button>

        <Button
          startIcon={<SaveIcon />}
          onClick={() => handleSave(post.id)}
          sx={{ color: 'text.secondary', textTransform: 'none' }}
        >
          Save
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* Condition Filter Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 2,
              py: 1,
              borderRadius: 2,
              mx: 0.5,
              textTransform: 'none',
              fontWeight: 500
            }
          }}
        >
          <Tab label="All Posts" />
          {userConditions.map((condition) => (
            <Tab
              key={condition}
              label={`${condition} ${conditionEmojis[condition] || '🏥'}`}
            />
          ))}
        </Tabs>
      </Box>

      {/* Posts Feed */}
      <Box>
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </Box>
                </Box>
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
                <Box sx={{ mt: 2 }}>
                  <Skeleton variant="rectangular" height={24} width={80} sx={{ borderRadius: 1 }} />
                </Box>
              </CardContent>
            </Card>
          ))
        ) : filteredPosts.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No posts found for this filter. Be the first to share something! 🌟
          </Alert>
        ) : (
          filteredPosts.map(renderPostCard)
        )}
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add post"
        onClick={() => setCreatePostOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
          }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Create Post Modal */}
      <CreatePost
        open={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        onPostCreated={() => {
          setCreatePostOpen(false);
          fetchPosts();
        }}
      />
    </Box>
  );
}

export default HomeFeed; 