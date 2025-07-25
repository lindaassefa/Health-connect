import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link,
  Container,
  Avatar,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  HealthAndSafety as HealthIcon,
  Email as EmailIcon,
  Lock as LockIcon
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/login", formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);
      navigate("/home");
    } catch (error) {
      setError(
        error.response?.data?.message || "An error occurred during login"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#A8D5BA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 2, md: 4 },
        px: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="sm" sx={{ px: { xs: 1, sm: 2 } }}>
        <Card
          elevation={8}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 20px 40px rgba(168, 213, 186, 0.3)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "linear-gradient(45deg, #A8D5BA, #F8BBD9)",
              p: { xs: 3, md: 4 },
              textAlign: "center",
              color: "#2C3E50",
            }}
          >
            <Avatar
              sx={{
                width: { xs: 60, md: 80 },
                height: { xs: 60, md: 80 },
                mx: "auto",
                mb: 2,
                background: "rgba(255, 255, 255, 0.3)",
                border: "3px solid rgba(255, 255, 255, 0.4)",
                color: "#2C3E50",
              }}
            >
              <HealthIcon sx={{ fontSize: { xs: 30, md: 40 } }} />
            </Avatar>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ 
                fontWeight: 800, 
                mb: 1,
                color: "#2C3E50"
              }}
            >
              Med Mingle
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                opacity: 0.8,
                color: "#2C3E50",
                fontSize: { xs: '0.9rem', md: '1rem' }
              }}
            >
              Connect with your health community
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    color: '#FF6B6B'
                  }
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: '#E1BEE7',
                    },
                    '&:hover fieldset': {
                      borderColor: '#A8D5BA',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#A8D5BA',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#7F8C8D',
                    '&.Mui-focused': {
                      color: '#A8D5BA',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#2C3E50',
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    '&::placeholder': {
                      color: '#7F8C8D',
                      opacity: 1,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "#A8D5BA" }} />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: '#E1BEE7',
                    },
                    '&:hover fieldset': {
                      borderColor: '#A8D5BA',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#A8D5BA',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#7F8C8D',
                    '&.Mui-focused': {
                      color: '#A8D5BA',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#2C3E50',
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    '&::placeholder': {
                      color: '#7F8C8D',
                      opacity: 1,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "#A8D5BA" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        sx={{ color: '#A8D5BA' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: { xs: 1.5, md: 2 },
                  mb: 3,
                  background: "linear-gradient(45deg, #A8D5BA, #F8BBD9)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #81C784, #F48FB1)",
                    transform: "translateY(-2px)",
                  },
                  "&:disabled": {
                    background: "#E0E0E0",
                    color: "#9E9E9E",
                  },
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: "none",
                  boxShadow: "0 4px 15px rgba(168, 213, 186, 0.4)",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: "#7F8C8D",
                  fontSize: { xs: '0.8rem', md: '0.875rem' }
                }}
              >
                or
              </Typography>
            </Divider>

            <Box sx={{ textAlign: "center" }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: "#7F8C8D", 
                  mb: 2,
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}
              >
                Don't have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: "#A8D5BA",
                    textDecoration: "none",
                    fontWeight: 600,
                    "&:hover": {
                      color: "#81C784",
                      textDecoration: "underline",
                    },
                  }}
                >
                  Sign up
                </Link>
              </Typography>

              <Typography 
                variant="body2" 
                sx={{ 
                  color: "#7F8C8D",
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }}
              >
                By signing in, you agree to our{" "}
                <Link href="#" sx={{ color: "#A8D5BA" }}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" sx={{ color: "#A8D5BA" }}>
                  Privacy Policy
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Login;