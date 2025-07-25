import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  InputAdornment,
  Chip,
  Skeleton
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as BackIcon,
  EmojiEmotions as EmojiIcon,
  AttachFile as AttachIcon
} from '@mui/icons-material';

// Mock chat data
const mockMessages = [
  {
    id: 1,
    senderId: 1,
    senderName: 'Sarah',
    text: 'Hey! I saw you also have eczema. How are you managing it?',
    timestamp: new Date(Date.now() - 3600000),
    isOwn: false
  },
  {
    id: 2,
    senderId: 'currentUser',
    senderName: 'You',
    text: 'Hi Sarah! I\'ve been using CeraVe cream and it\'s been helping a lot. What about you?',
    timestamp: new Date(Date.now() - 3000000),
    isOwn: true
  },
  {
    id: 3,
    senderId: 1,
    senderName: 'Sarah',
    text: 'That\'s great! I\'ve been trying different moisturizers but nothing seems to work as well. Do you have any other recommendations?',
    timestamp: new Date(Date.now() - 2400000),
    isOwn: false
  },
  {
    id: 4,
    senderId: 'currentUser',
    senderName: 'You',
    text: 'I also found that avoiding hot showers and using fragrance-free products really helps. Have you tried that?',
    timestamp: new Date(Date.now() - 1800000),
    isOwn: true
  }
];

function ChatWindow({ match, onBack, open }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && match) {
      fetchMessages();
    }
  }, [open, match]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const token = localStorage.getItem('token');
      // const response = await axios.get(`/api/chat/${match.id}/messages`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // setMessages(response.data);
      
      // Use mock data for now
      setTimeout(() => {
        setMessages(mockMessages);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      id: Date.now(),
      senderId: 'currentUser',
      senderName: 'You',
      text: newMessage.trim(),
      timestamp: new Date(),
      isOwn: true
    };

    setMessages(prev => [...prev, messageData]);
    setNewMessage('');

    try {
      // TODO: Replace with actual API call
      // const token = localStorage.getItem('token');
      // await axios.post(`/api/chat/${match.id}/messages`, {
      //   text: messageData.text
      // }, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = Math.floor((now - messageTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return messageTime.toLocaleDateString();
    }
  };

  if (!match) return null;

  return (
    <Paper 
      sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0
      }}
    >
      {/* Chat Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={onBack} sx={{ color: 'white' }}>
            <BackIcon />
          </IconButton>
          
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: match.user.isAnonymous ? 'grey.400' : 'primary.main'
            }}
          >
            {match.user.isAnonymous ? '?' : match.user.name[0]}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {match.user.isAnonymous ? 'Anonymous' : match.user.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {match.sharedConditions.length} shared conditions
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Messages */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)'
      }}>
        {loading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, index) => (
            <Box key={index} sx={{ mb: 2, display: 'flex', justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end' }}>
              <Box sx={{ maxWidth: '70%' }}>
                <Skeleton variant="rectangular" width={200} height={60} sx={{ borderRadius: 2 }} />
                <Skeleton variant="text" width={80} height={16} sx={{ mt: 0.5 }} />
              </Box>
            </Box>
          ))
        ) : (
          <List sx={{ p: 0 }}>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  flexDirection: 'column',
                  alignItems: message.isOwn ? 'flex-end' : 'flex-start',
                  p: 0,
                  mb: 2
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-end',
                  gap: 1,
                  maxWidth: '70%',
                  flexDirection: message.isOwn ? 'row-reverse' : 'row'
                }}>
                  {!message.isOwn && (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem',
                        bgcolor: match.user.isAnonymous ? 'grey.400' : 'primary.main'
                      }}
                    >
                      {match.user.isAnonymous ? '?' : match.user.name[0]}
                    </Avatar>
                  )}
                  
                  <Box>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        maxWidth: '100%',
                        wordBreak: 'break-word',
                        background: message.isOwn 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'white',
                        color: message.isOwn ? 'white' : 'text.primary',
                        boxShadow: 2
                      }}
                    >
                      <Typography variant="body1" sx={{ lineHeight: 1.4 }}>
                        {message.text}
                      </Typography>
                    </Paper>
                    
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        mt: 0.5, 
                        display: 'block',
                        color: 'text.secondary',
                        textAlign: message.isOwn ? 'right' : 'left'
                      }}
                    >
                      {formatTime(message.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Box>

      {/* Message Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <AttachIcon />
          </IconButton>
          
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" sx={{ color: 'text.secondary' }}>
                    <EmojiIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'background.paper'
              }
            }}
          />
          
          <IconButton
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              '&:disabled': {
                bgcolor: 'grey.300',
                color: 'grey.500'
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Press Enter to send, Shift+Enter for new line
        </Typography>
      </Box>
    </Paper>
  );
}

export default ChatWindow; 