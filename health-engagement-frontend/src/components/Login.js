import React, { useState } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State to store error messages

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Email:', email, 'Password:', password); // Log inputs
      const response = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token); // Store token in localStorage
      console.log(response.data);

      //  redirect the user..dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      if (error.response) {
        console.error('Login error', error.response.data);
        setError(error.response.data.message || 'Invalid credentials'); // Customize as needed
      } else {
        console.error('Login error', error.message);
        setError('Server error, please try again later.');
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h5" component="h1" gutterBottom>
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
        {error && <Typography color="error">{error}</Typography>} {/* Display error message */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3, mb: 2 }}
        >
          Sign In
        </Button>
      </form>
    </Container>
  );
}

export default Login;
