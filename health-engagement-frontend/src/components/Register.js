import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Alert } from '@mui/material';
import axios from 'axios'; // Direct axios import

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      console.log('Attempting registration with:', { username, email, password });
      const response = await axios.post('http://localhost:5003/api/auth/register', { username, email, password });
      console.log('Registration response:', response.data);
      setSuccess('Registration successful! You can now log in.');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        setError(error.response.data.error || 'Registration failed. Please try again.');
      } else if (error.request) {
        setError('No response from server. Please check your connection and try again.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h5" component="h1" gutterBottom>
        Register
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3, mb: 2 }}
        >
          Register
        </Button>
      </form>
    </Container>
  );
}

export default Register;
