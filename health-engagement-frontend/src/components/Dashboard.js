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
        const token = localStorage.getItem('token'); // Retrieve token for authentication
        const response = await axios.get('/api/protected/dashboard', {
          headers: { Authorization: `Bearer ${token}` }, // Send token in headers
        });
        setDashboardData(response.data); // Set dashboard data
      } catch (error) {
        setError('Error fetching dashboard data'); // Handle error state
        console.error('Dashboard error', error);
      }
    };
    fetchDashboardData();
  }, []);

  if (error) return <Typography color="error">{error}</Typography>;
  if (!dashboardData) return <CircularProgress />; // Show loader until data is fetched

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to Your Dashboard
      </Typography>
      <Typography variant="body1" paragraph>
        {dashboardData.message}
      </Typography>

      {/* Buttons for navigation */}
      <Box mt={3}>
        <Button
          component={Link}
          to="/profile"
          variant="contained"
          color="primary"
          sx={{ marginRight: 2 }}
        >
          View Profile
        </Button>
        <Button
          component={Link}
          to="/peers"
          variant="contained"
          color="secondary"
        >
          Find Your Peers
        </Button>
      </Box>
    </Container>
  );
}

export default Dashboard;
