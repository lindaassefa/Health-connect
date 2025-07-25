import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link,
  Container,
  Avatar,
  Divider,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  HealthAndSafety as HealthIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('Attempting registration with:', formData);
      const response = await axios.post('/api/auth/register', formData);
      console.log('Registration response:', response.data);
      setSuccess('Registration successful! You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        setError(error.response.data.error || 'Registration failed. Please try again.');
      } else if (error.request) {
        setError('No response from server. Please check your connection and try again.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={8}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
              p: 4,
              textAlign: "center",
              color: "white",
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: "auto",
                mb: 2,
                background: "rgba(255, 255, 255, 0.2)",
                border: "3px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <HealthIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Join Med Mingle
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Start your health journey today
      </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Username"
          name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#E1E8ED',
                    },
                    '&:hover fieldset': {
                      borderColor: '#FF6B6B',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF6B6B',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#657786',
                    '&.Mui-focused': {
                      color: '#FF6B6B',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#14171A',
                    '&::placeholder': {
                      color: '#657786',
                      opacity: 1,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "#657786" }} />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />

        <TextField
          fullWidth
                label="Email"
          name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#E1E8ED',
                    },
                    '&:hover fieldset': {
                      borderColor: '#FF6B6B',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF6B6B',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#657786',
                    '&.Mui-focused': {
                      color: '#FF6B6B',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#14171A',
                    '&::placeholder': {
                      color: '#657786',
                      opacity: 1,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "#657786" }} />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />

        <TextField
          fullWidth
                label="Password"
          name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#E1E8ED',
                    },
                    '&:hover fieldset': {
                      borderColor: '#FF6B6B',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF6B6B',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#657786',
                    '&.Mui-focused': {
                      color: '#FF6B6B',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#14171A',
                    '&::placeholder': {
                      color: '#657786',
                      opacity: 1,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "#657786" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />

        <Button
          type="submit"
          fullWidth
          variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  mb: 3,
                  background: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #FF5252, #26A69A)",
                  },
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                }}
        >
                {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" sx={{ color: "#657786" }}>
                or
              </Typography>
            </Divider>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body1" sx={{ color: "#657786", mb: 2 }}>
                Already have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: "#FF6B6B",
                    textDecoration: "none",
                    fontWeight: 600,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
    </Container>
    </Box>
  );
}

export default Register;
