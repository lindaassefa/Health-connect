import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Avatar,
  IconButton,
  Button,
  TextField,
  Chip,
  Container,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ChatBubbleOutline as CommentIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  AccessTime as TimeIcon,
  Delete as DeleteIcon,
  ExpandMore
} from "@mui/icons-material";
import axios from "axios";
import CreatePost from "./CreatePost";
import { useNavigate } from 'react-router-dom';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [commentDialog, setCommentDialog] = useState({ open: false, postId: null, comment: "" });
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/posts/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchComments = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/comments/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments((prev) => ({ ...prev, [postId]: response.data }));
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load comments' });
    }
  };

  const handleExpand = (postId) => (event, isExpanded) => {
    setExpanded(isExpanded ? postId : false);
    if (isExpanded && !comments[postId]) fetchComments(postId);
  };

  const handleCommentInput = (postId, value) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleAddComment = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const content = commentInputs[postId];
      if (!content) return;
      const response = await axios.post(
        `/api/comments/${postId}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), response.data] }));
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
      setSnackbar({ open: true, message: 'Failed to add comment: ' + (error.response?.data?.error || error.message) });
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      console.log('Attempting to delete comment:', { postId, commentId });
      const token = localStorage.getItem("token");
      const response = await axios.delete(`/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Delete response:', response.data);
      setComments((prev) => ({
        ...prev,
        [postId]: prev[postId].filter((c) => c.id !== commentId),
      }));
      setSnackbar({ open: true, message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      setSnackbar({ open: true, message: 'Failed to delete comment: ' + (error.response?.data?.error || error.message) });
    }
  };

  const handleLike = async (postId, isLiked) => {
    try {
      const token = localStorage.getItem("token");
      if (isLiked) {
        await axios.delete(`/api/likes/${postId}/like`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`/api/likes/${postId}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { 
            ...post, 
            isLiked: !isLiked,
            likeCount: isLiked ? (post.likeCount || 1) - 1 : (post.likeCount || 0) + 1
          } : post
        )
      );
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  const handleComment = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/comments/${commentDialog.postId}`,
        { comment: commentDialog.comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentDialog({ open: false, postId: null, comment: "" });
      // Refresh posts to show new comment
      fetchPosts();
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Create Post FAB */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setCreatePostOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FF5252, #26A69A)',
          }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Create Post Dialog */}
      <CreatePost
        open={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        onPostCreated={fetchPosts}
      />

      {/* Posts Grid */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {posts.length > 0 ? (
        posts.map((post) => (
            <Card
              key={post.id}
              elevation={2}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  elevation: 8,
                  transform: 'translateY(-2px)',
                },
                border: '1px solid rgba(0, 0, 0, 0.08)',
              }}
            >
              {/* Post Header */}
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={post.user?.profilePicture ? post.user.profilePicture : undefined}
                  sx={{
                    width: 48,
                    height: 48,
                    background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      transition: 'transform 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => handleUserClick(post.user?.id)}
                >
                  {post.user?.username?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, cursor: 'pointer' }} onClick={() => handleUserClick(post.user?.id)}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#14171A' }}>
                    {post.user?.username}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon sx={{ fontSize: 14, color: '#657786' }} />
                    <Typography variant="caption" sx={{ color: '#657786' }}>
                      {formatTimeAgo(post.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                {/* Show delete button only if the logged-in user is the author */}
                {post.user?.id === JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id && (
                  <IconButton size="small" onClick={() => handleDeletePost(post.id)}>
                    <DeleteIcon sx={{ color: '#E53935' }} />
                  </IconButton>
                )}
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>

              {/* Post Image */}
            {post.imageUrl && (
                <CardMedia
                  component="img"
                  image={post.imageUrl}
                alt="Post"
                  sx={{
                    height: 400,
                    objectFit: 'cover',
                  }}
                />
              )}

              {/* Post Content */}
              <CardContent sx={{ p: 3, pt: 2 }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#14171A',
                    lineHeight: 1.6,
                    mb: 2,
                    fontSize: '1rem',
                  }}
                >
                  {post.caption}
                </Typography>

                {/* Health Tags */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {post.caption?.toLowerCase().includes('mental health') && (
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
                  {post.caption?.toLowerCase().includes('fitness') && (
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
                  {post.caption?.toLowerCase().includes('nutrition') && (
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

                {/* Post Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <IconButton
                onClick={() => handleLike(post.id, post.isLiked)}
                    sx={{
                      color: post.isLiked ? '#E91E63' : '#657786',
                      '&:hover': {
                        color: '#E91E63',
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {post.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <Typography variant="body2" sx={{ color: '#657786', mr: 2 }}>
                    {post.likeCount || 0}
                  </Typography>

                  <IconButton
                    onClick={() => setCommentDialog({ open: true, postId: post.id, comment: "" })}
                    sx={{
                      color: '#657786',
                      '&:hover': {
                        color: '#1DA1F2',
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <CommentIcon />
                  </IconButton>
                  <Typography variant="body2" sx={{ color: '#657786', mr: 2 }}>
                    {comments[post.id]?.length || 0}
                  </Typography>

                  <IconButton
                    sx={{
                      color: '#657786',
                      '&:hover': {
                        color: '#4CAF50',
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <ShareIcon />
                  </IconButton>
                </Box>

                {/* Comments Accordion */}
                <Accordion expanded={expanded === post.id} onChange={handleExpand(post.id)}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>Comments ({comments[post.id]?.length || 0})</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {(comments[post.id] || []).map((comment) => {
                        const userId = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id;
                        return (
                          <ListItem key={comment.id} alignItems="flex-start" secondaryAction={
                            comment.user?.id === userId && (
                              <IconButton edge="end" onClick={() => handleDeleteComment(post.id, comment.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )
                          }>
                            <ListItemAvatar>
                              <Avatar src={comment.user?.profilePicture}>{comment.user?.username?.[0]?.toUpperCase() || 'A'}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={comment.user?.username || 'Anonymous'}
                              secondary={<>
                                <Typography component="span" variant="body2">{comment.content}</Typography>
                                <br />
                                <Typography component="span" variant="caption" color="text.secondary">{formatTimeAgo(comment.createdAt)}</Typography>
                              </>}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <TextField
                        multiline
                        minRows={1}
                        maxRows={4}
                        fullWidth
                        size="small"
                        placeholder="Add a comment..."
                        value={commentInputs[post.id] || ''}
                        onChange={e => handleCommentInput(post.id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                      />
                      <Button 
                        variant="contained" 
                        onClick={() => handleAddComment(post.id)} 
                        disabled={!commentInputs[post.id]}
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        Send
                      </Button>
                      </Box>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
        ))
      ) : (
          <Card
            elevation={2}
            sx={{
              borderRadius: 3,
              p: 4,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Welcome to Med Mingle! 🏥
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Be the first to share your health journey and connect with others.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setCreatePostOpen(true)}
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              Create Your First Post
            </Button>
          </Card>
        )}
      </Box>

      {/* Comment Dialog */}
      <Dialog
        open={commentDialog.open}
        onClose={() => setCommentDialog({ open: false, postId: null, comment: "" })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add a Comment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your comment"
            fullWidth
            multiline
            rows={3}
            value={commentDialog.comment}
            onChange={(e) => setCommentDialog({ ...commentDialog, comment: e.target.value })}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCommentDialog({ open: false, postId: null, comment: "" })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleComment}
            variant="contained"
            disabled={!commentDialog.comment.trim()}
            sx={{
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF5252, #26A69A)',
              }
            }}
          >
            Post Comment
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ open: false, message: '' })} message={snackbar.message} />
    </Container>
  );
}

export default PostList;