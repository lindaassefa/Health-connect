import React, { useState, useEffect } from 'react';
import { Container, Typography, CircularProgress, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/protected/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(response.data);
      } catch (error) {
        setError('Error fetching dashboard data');
        console.error('Dashboard error', error);
      }
    };
    fetchDashboardData();
  }, []);

  if (error) return <Typography color="error">{error}</Typography>;
  if (!dashboardData) return <CircularProgress />;

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to Your Dashboard
      </Typography>
      <Typography variant="body1" paragraph>
        {dashboardData.message}
      </Typography>
      
      <Box mt={3}>
        {/* Button to go to Profile */}
        <Button component={Link} to="/profile" variant="contained" color="primary" sx={{ mb: 2 }}>
          View Profile
        </Button>
        
        {/* Button to go to Create Post page */}
        <Button component={Link} to="/create-post" variant="contained" color="secondary" sx={{ ml: 2 }}>
          Create a New Post
        </Button>
        
        {/* Button to go to View All Posts page */}
        <Button component={Link} to="/posts" variant="contained" color="secondary" sx={{ ml: 2 }}>
          View All Posts
        </Button>
      </Box>
    </Container>
  );
}

export default Dashboard;
