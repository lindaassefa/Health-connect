import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <AppBar
  position="static"
  sx={{
    background: '#1a1a1a', // Dark background
    boxShadow: 'var(--shadow-md)',
  }}
>
  <Toolbar>
    <Typography
      variant="h5"
      component="div"
      sx={{
        flexGrow: 1,
        fontFamily: 'Poppins, Roboto, sans-serif',
        fontWeight: 'bold',
        color: '#33ab9f', // Teal text
      }}
    >
      Med Mingle
    </Typography>
    <Button
      color="inherit"
      component={Link}
      to="/"
      sx={{
        fontFamily: 'Poppins',
        color: 'white',
        ':hover': { color: '#33ab9f' },
      }}
    >
      Home
    </Button>
    <Button
      color="inherit"
      component={Link}
      to="/profile"
      sx={{
        fontFamily: 'Poppins',
        color: 'white',
        ':hover': { color: '#33ab9f' },
      }}
    >
      My Profile
    </Button>
    <Button
      color="inherit"
      component={Link}
      to="/peers"
      sx={{
        fontFamily: 'Poppins',
        color: 'white',
        ':hover': { color: '#33ab9f' },
      }}
    >
      Find Your Peers
    </Button>
  </Toolbar>
</AppBar>

  );
}

export default Header;
