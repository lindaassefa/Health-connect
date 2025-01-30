import React from 'react';
import { Container, Typography } from '@mui/material';
import PostList from './PostList';

function Home() {
  return (
    <Container>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          textAlign: 'center',
          color: 'var(--primary-color)',
          fontFamily: 'Poppins, Roboto, sans-serif',
          fontWeight: 'bold',
          mt: 3,
        }}
      >
        Welcome to Med Mingle
      </Typography>
      <Typography
        variant="body1"
        sx={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          mb: 4,
        }}
      >
        Connect with your peers and find support through shared experiences.
      </Typography>
      <PostList />
    </Container>
  );
}

export default Home;
