import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Paper,
  Grid,
  Alert,
  Container,
  CircularProgress,
  Snackbar,
  Autocomplete
} from '@mui/material';
import {
  Person as PersonIcon,
  Cake as CakeIcon,
  LocationOn as LocationIcon,
  Wc as GenderIcon
} from '@mui/icons-material';
import axios from 'axios';

const steps = [
  'Basic Info',
  'Conditions & Preferences',
  'Vibes & Privacy'
];

const chronicConditions = [
  'Eczema', 'Acne', 'Anxiety', 'Endometriosis', 'PCOS', 'IBS'
];

const lookingFor = [
  { label: 'Friendship', icon: '👥' },
  { label: 'Advice', icon: '💡' },
  { label: 'Product Recs', icon: '⭐' },
  { label: 'Venting Buddy', icon: '😤' }
];

const vibeTags = [
  { label: 'Deep Talker', emoji: '💬' },
  { label: 'Funny', emoji: '🤡' },
  { label: 'Cozy', emoji: '🧸' },
  { label: 'Nerdy', emoji: '🔬' },
  { label: 'Shy', emoji: '😶‍🌫️' }
];

const comfortLevels = [
  { value: 'public', label: 'Public', description: 'Show my name and profile' },
  { value: 'semi-anonymous', label: 'Semi-Anonymous', description: 'Show my condition but hide my name' },
  { value: 'fully-anonymous', label: 'Fully Anonymous', description: 'Hide my identity completely' }
];

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary (little to no exercise)' },
  { value: 'light', label: 'Light (1-3 days/week)' },
  { value: 'moderate', label: 'Moderate (3-5 days/week)' },
  { value: 'active', label: 'Active (6-7 days/week)' },
  { value: 'very-active', label: 'Very Active (intense daily exercise)' }
];

const mentalHealthOptions = [
  'Depression', 'Anxiety', 'Stress', 'Mood Swings', 'Sleep Issues',
  'Eating Disorders', 'Substance Use', 'Trauma', 'Grief', 'None'
];

const communityInterests = [
  'Support Groups', 'Fitness Classes', 'Meditation', 'Art Therapy',
  'Book Clubs', 'Cooking Classes', 'Outdoor Activities', 'Volunteering',
  'Educational Workshops', 'Social Events'
];

function OnboardingForm({ onComplete, onCancel }) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    location: '',
    gender: '',
    chronicConditions: [],
    lookingFor: [],
    vibeTags: [],
    comfortLevel: 'semi-anonymous',
    medications: [],
    allergies: [],
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    activityLevel: 'moderate',
    sleepQuality: 3,
    stressLevel: 2,
    dietaryRestrictions: [],
    fitnessGoals: [],
    mentalHealthConcerns: [],
    copingStrategies: [],
    supportSystem: 'moderate',
    therapyExperience: 'none',
    communityInterests: [],
    preferredCommunication: 'text',
    notificationPreferences: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (error[field]) {
      setError(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Check if token exists
      if (!token) {
        setError('No authentication token found. Please login again.');
        setSnackbarMessage('Please login again to continue.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      await axios.post('/api/profile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSnackbarMessage('Profile saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      if (err.response?.status === 401) {
        // Token expired or invalid
        setError('Your session has expired. Please login again.');
        setSnackbarMessage('Session expired. Redirecting to login...');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
        
        // Clear the expired token
        localStorage.removeItem('token');
        
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
      const errorMessage = err.response?.data?.message || 'Failed to save profile';
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
              Let's get to know you better
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  InputProps={{
                    startAdornment: <CakeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  freeSolo
                  options={[
                    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan', 'India', 'Brazil', 'Mexico',
                    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
                    'Toronto, ON', 'Montreal, QC', 'Vancouver, BC', 'Calgary, AB', 'Edmonton, AB',
                    'London, UK', 'Manchester, UK', 'Birmingham, UK', 'Leeds, UK', 'Liverpool, UK',
                    'Sydney, NSW', 'Melbourne, VIC', 'Brisbane, QLD', 'Perth, WA', 'Adelaide, SA'
                  ]}
                  value={formData.location}
                  onChange={(event, newValue) => handleInputChange('location', newValue || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label="Location (Country or City)"
                      placeholder="Type to search countries and cities..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    startAdornment={<GenderIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                  >
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="non-binary">Non-binary</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
              Conditions & Preferences
            </Typography>
            
            {/* Chronic Conditions */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Chronic Conditions (select all that apply)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {chronicConditions.map((condition) => (
                  <Chip
                    key={condition}
                    label={condition}
                    onClick={() => handleMultiSelect('chronicConditions', condition)}
                    color={formData.chronicConditions.includes(condition) ? 'primary' : undefined}
                    variant={formData.chronicConditions.includes(condition) ? 'filled' : 'outlined'}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Box>

            {/* What They're Looking For */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                What you're looking for (select all that apply)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {lookingFor.map((option) => (
                  <Button
                    key={option.label}
                    variant={formData.lookingFor.includes(option.label) ? 'contained' : 'outlined'}
                    color={formData.lookingFor.includes(option.label) ? 'primary' : undefined}
                    onClick={() => handleMultiSelect('lookingFor', option.label)}
                    startIcon={<span style={{ fontSize: '1.2rem' }}>{option.icon}</span>}
                    sx={{ 
                      minWidth: '120px',
                      height: '48px',
                      borderRadius: '24px',
                      textTransform: 'none'
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
              Vibes & Privacy
            </Typography>
            
            {/* Vibe Tags */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Vibe Tags (select all that apply)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {vibeTags.map((tag) => (
                  <Button
                    key={tag.label}
                    variant={formData.vibeTags.includes(tag.label) ? 'contained' : 'outlined'}
                    color={formData.vibeTags.includes(tag.label) ? 'primary' : undefined}
                    onClick={() => handleMultiSelect('vibeTags', tag.label)}
                    startIcon={<span style={{ fontSize: '1.5rem' }}>{tag.emoji}</span>}
                    sx={{ 
                      minWidth: '140px',
                      height: '56px',
                      borderRadius: '28px',
                      textTransform: 'none',
                      fontSize: '1rem'
                    }}
                  >
                    {tag.label}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Comfort Level */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Comfort Level
              </Typography>
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={formData.comfortLevel}
                  onChange={(e) => handleInputChange('comfortLevel', e.target.value)}
                >
                  {comfortLevels.map((level) => (
                    <FormControlLabel
                      key={level.value}
                      value={level.value}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {level.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {level.description}
                          </Typography>
                        </Box>
                      }
                      sx={{ 
                        alignItems: 'flex-start',
                        '& .MuiFormControlLabel-label': { width: '100%' }
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Welcome to Med Mingle
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary">
            Let's personalize your experience
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          
          <Box>
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="text"
                sx={{ mr: 2 }}
              >
                Skip for Now
              </Button>
            )}
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Completing...' : 'Complete Setup'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}

export default OnboardingForm; 