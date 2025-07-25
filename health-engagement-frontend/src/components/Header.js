import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Avatar, 
  IconButton, 
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Home as HomeIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Brightness4,
  Brightness7,
  Explore as ExploreIcon
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchModal from './SearchModal';

function Header({ mode = 'light', toggleMode = () => {} }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationCount, setNotificationCount] = useState(3);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    if (notificationsEnabled) {
      setNotificationCount(0);
    } else {
      setNotificationCount(3);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleProfileClick = () => {
    handleProfileMenuClose();
    navigate('/profile');
  };

  const handleSearchClick = () => {
    setSearchModalOpen(true);
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/home' },
    { text: 'Discover', icon: <ExploreIcon />, path: '/products' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Find Peers', icon: <PeopleIcon />, path: '/peers' },
    { text: 'Events', icon: <EventIcon />, path: '/events' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: '#A8D5BA',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(168, 213, 186, 0.3)',
        }}
      >
        <Toolbar sx={{ 
          justifyContent: 'space-between', 
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 1, md: 1.5 },
          minHeight: { xs: 64, md: 70 }
        }}>
          {/* Logo */}
          <Typography
            variant="h5"
            component={Link}
            to="/home"
            sx={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 800,
              color: '#1A252F',
              textDecoration: 'none',
              display: { xs: 'block' },
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
            }}
          >
            Med Mingle
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  color: '#2C3E50',
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                  fontWeight: isActive(item.path) ? 600 : 500,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* Right side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            <IconButton
              onClick={handleSearchClick}
              sx={{
                color: '#2C3E50',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease-in-out',
                width: { xs: 40, md: 44 },
                height: { xs: 40, md: 44 }
              }}
            >
              <SearchIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
            
            <IconButton
              onClick={handleNotificationToggle}
              sx={{
                color: '#2C3E50',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease-in-out',
                width: { xs: 40, md: 44 },
                height: { xs: 40, md: 44 }
              }}
            >
              <Badge 
                badgeContent={notificationsEnabled ? notificationCount : 0} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#FF6B6B',
                    color: 'white',
                    fontSize: '0.7rem',
                    minWidth: '18px',
                    height: '18px'
                  }
                }}
              >
                {notificationsEnabled ? <NotificationsIcon fontSize={isMobile ? "small" : "medium"} /> : <NotificationsOffIcon fontSize={isMobile ? "small" : "medium"} />}
              </Badge>
            </IconButton>

            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{
                color: '#2C3E50',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease-in-out',
                width: { xs: 40, md: 44 },
                height: { xs: 40, md: 44 }
              }}
            >
              <Avatar 
                sx={{ 
                  width: { xs: 28, md: 32 }, 
                  height: { xs: 28, md: 32 },
                  background: 'linear-gradient(45deg, #A8D5BA, #F8BBD9)',
                  color: '#2C3E50'
                }}
              >
                <PersonIcon fontSize={isMobile ? "small" : "medium"} />
              </Avatar>
            </IconButton>

            <IconButton 
              onClick={toggleMode} 
              sx={{ 
                color: '#2C3E50',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease-in-out',
                width: { xs: 40, md: 44 },
                height: { xs: 40, md: 44 },
                ml: { xs: 0.5, sm: 1 }
              }}
            >
              {mode === 'dark' ? <Brightness7 fontSize={isMobile ? "small" : "medium"} /> : <Brightness4 fontSize={isMobile ? "small" : "medium"} />}
            </IconButton>

            {/* Profile Menu */}
            <Menu
              anchorEl={profileMenuAnchor}
              open={Boolean(profileMenuAnchor)}
              onClose={handleProfileMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 3,
                  minWidth: 200,
                  boxShadow: '0 8px 32px rgba(168, 213, 186, 0.2)',
                  border: '1px solid rgba(168, 213, 186, 0.1)',
                }
              }}
            >
              <MenuItem onClick={handleProfileClick} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" sx={{ color: '#A8D5BA' }} />
                </ListItemIcon>
                Profile
              </MenuItem>
              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: '#F8BBD9' }} />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>

            {/* Mobile Menu Button */}
            <IconButton
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                color: '#2C3E50',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease-in-out',
                width: 40,
                height: 40,
                ml: 0.5
              }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: 280, sm: 320 },
            background: 'linear-gradient(135deg, #A8D5BA 0%, #F8BBD9 100%)',
            color: '#2C3E50',
            boxShadow: '4px 0 20px rgba(168, 213, 186, 0.3)'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 3, 
              fontWeight: 700,
              color: '#2C3E50',
              textAlign: 'center'
            }}
          >
            Med Mingle
          </Typography>
          <List sx={{ pt: 0 }}>
            {menuItems.map((item) => (
              <ListItem
                key={item.text}
                component={Link}
                to={item.path}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  color: '#2C3E50',
                  borderRadius: 3,
                  mb: 1.5,
                  backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                  py: 1.5,
                  px: 2
                }}
              >
                <ListItemIcon sx={{ color: '#2C3E50', minWidth: 44 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    '& .MuiListItemText-primary': {
                      fontWeight: isActive(item.path) ? 600 : 500,
                      fontSize: '1rem'
                    }
                  }}
                />
              </ListItem>
            ))}
            <Divider sx={{ my: 3, borderColor: 'rgba(44, 62, 80, 0.2)' }} />
            <ListItem
              onClick={handleLogout}
              sx={{
                color: '#2C3E50',
                borderRadius: 3,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
                py: 1.5,
                px: 2
              }}
            >
              <ListItemIcon sx={{ color: '#2C3E50', minWidth: 44 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                sx={{ 
                  '& .MuiListItemText-primary': {
                    fontWeight: 500,
                    fontSize: '1rem'
                  }
                }}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Search Modal */}
      <SearchModal 
        open={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
      />
    </>
  );
}

export default Header;