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
        <Button component={Link} to="/profile" variant="contained" color="primary">
          View Profile
        </Button>
      </Box>
      {/* Add more dashboard content here */}
    </Container>
  );
}

export default Dashboard;