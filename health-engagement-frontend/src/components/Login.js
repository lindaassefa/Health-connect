import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Link } from '@mui/material';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/home'); // Changed from window.location.href
    } catch (error) {
      if (error.response) {
        console.error('Login error', error.response.data);
        setError(error.response.data.message || 'Invalid credentials');
      } else {
        console.error('Login error', error.message);
        setError('Server error, please try again later.');
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box textAlign="center" mt={5} mb={2}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            fontFamily: 'Poppins, Roboto, Arial, sans-serif',
          }}
        >
          Med Mingle
        </Typography>
      </Box>
      <Box
        sx={{
          boxShadow: 3,
          p: 4,
          borderRadius: 2,
          bgcolor: 'background.paper',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Poppins' }}>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{
              mt: 3,
              mb: 2,
              fontFamily: 'Poppins',
              bgcolor: 'primary.main',
              ':hover': { bgcolor: 'primary.dark' },
            }}
          >
            Sign In
          </Button>
        </form>
        <Typography variant="body2">
          Don't have an account?{' '}
          <Link
            href="/register"
            color="secondary"
            underline="hover"
            sx={{ fontFamily: 'Poppins' }}
          >
            Sign Up
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Login;