import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Header from './components/Header'; 
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Dashboard from './components/Dashboard';
import CreatePost from './components/CreatePost';  // Import Create Post component
import PostList from './components/PostList';      // Import Post List component

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} /> 
          <Route path="/profile" element={<Profile />} />
          
          {/* Add the Create Post route */}
          <Route path="/create-post" element={<CreatePost />} />

          {/* Add the Post List route to display posts */}
          <Route path="/posts" element={<PostList />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
