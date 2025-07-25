import React, { useMemo, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useTheme, useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import PostList from './components/PostList';
import PeerMatching from './components/PeerMatching';
import ProtectedRoute from './components/ProtectedRoute';
import UserProfile from './components/UserProfile';
import RecommendedEvents from './components/RecommendedEvents';
import OnboardingForm from './components/OnboardingForm';
import ProductDiscovery from './components/ProductDiscovery';

const getInitialMode = () => {
  const saved = localStorage.getItem('themeMode');
  return saved ? saved : 'light';
};

export default function App() {
  const [mode, setMode] = useState(getInitialMode());

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { 
        main: '#A8D5BA', // Solid mint green
        light: '#C8E6C9', 
        dark: '#81C784' 
      },
      secondary: { 
        main: '#F8BBD9', // Solid pink
        light: '#FCE4EC', 
        dark: '#F48FB1' 
      },
      accent: {
        lavender: '#E1BEE7', // Soft lavender
        peach: '#FFCCBC', // Soft peach
        sky: '#B3E5FC', // Soft sky blue
        cream: '#FFF8E1', // Soft cream
        coral: '#FFAB91', // Soft coral
      },
      background: mode === 'dark' ? { 
        default: '#2C3E50', 
        paper: '#34495E' 
      } : { 
        default: '#F8F9FA', 
        paper: '#FFFFFF' 
      },
      text: mode === 'dark' ? { 
        primary: '#ECF0F1', 
        secondary: '#BDC3C7' 
      } : { 
        primary: '#2C3E50', 
        secondary: '#7F8C8D' 
      }
    },
    typography: { 
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { 
        fontWeight: 700, 
        fontSize: 'clamp(2rem, 5vw, 2.5rem)',
        lineHeight: 1.2
      },
      h2: { 
        fontWeight: 600, 
        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
        lineHeight: 1.3
      },
      h3: { 
        fontWeight: 600, 
        fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
        lineHeight: 1.4
      },
      h4: {
        fontWeight: 500,
        fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)',
        lineHeight: 1.4
      },
      body1: { 
        fontSize: 'clamp(0.875rem, 2vw, 1rem)', 
        lineHeight: 1.6 
      },
      body2: {
        fontSize: 'clamp(0.8rem, 1.8vw, 0.875rem)',
        lineHeight: 1.5
      }
    },
    shape: { 
      borderRadius: 16 
    },
    spacing: 8,
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            textTransform: 'none',
            fontWeight: 500,
            padding: '10px 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            '&:hover': {
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease-in-out',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#A8D5BA',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#A8D5BA',
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          },
        },
      },
    },
  }), [mode]);

  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

const AuthenticatedLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: theme.palette.background.default, 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <Header mode={mode} toggleMode={toggleMode} />
      <main style={{ 
        flex: 1, 
        padding: isMobile ? '16px 12px' : '24px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {children}
      </main>
    </div>
  );
};

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/home" element={<ProtectedRoute><AuthenticatedLayout><PostList /></AuthenticatedLayout></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><AuthenticatedLayout><ProductDiscovery /></AuthenticatedLayout></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><AuthenticatedLayout><OnboardingForm /></AuthenticatedLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AuthenticatedLayout><Profile /></AuthenticatedLayout></ProtectedRoute>} />
          <Route path="/peers" element={<ProtectedRoute><AuthenticatedLayout><PeerMatching /></AuthenticatedLayout></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><AuthenticatedLayout><RecommendedEvents /></AuthenticatedLayout></ProtectedRoute>} />
          <Route path="/user/:userId" element={<ProtectedRoute><AuthenticatedLayout><UserProfile /></AuthenticatedLayout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}