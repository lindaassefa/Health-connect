import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import PostList from './components/PostList';
import PeerMatching from './components/PeerMatching';
import ProtectedRoute from './components/ProtectedRoute';
import UserProfile from './components/UserProfile';

const theme = createTheme({
  palette: {
    primary: { main: '#00897b' },
    secondary: { main: '#ff7043' },
  },
  typography: { fontFamily: 'Poppins, sans-serif' },
});

const AuthenticatedLayout = ({ children }) => (
  <>
    <Header />
    {children}
  </>
);

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Protected Routes */}
          <Route path="/home" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <PostList />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Profile />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/peers" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <PeerMatching />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          {/* Add UserProfile Route */}
          <Route path="/user/:userId" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <UserProfile />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          {/* Catch all redirect to login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}