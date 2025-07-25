import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Event as EventIcon } from '@mui/icons-material';

function RecommendedEvents() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto', 
      p: { xs: 2, md: 4 },
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          sx={{ 
            fontWeight: 700,
            color: '#2C3E50',
            mb: 2,
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' }
          }}
        >
          Health Events
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#7F8C8D',
            fontSize: { xs: '1rem', md: '1.25rem' },
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          Discover wellness events and community gatherings
        </Typography>
      </Box>

      {/* Empty State */}
      <Paper sx={{ 
        p: { xs: 4, md: 6 },
        borderRadius: 4,
        textAlign: 'center',
        backgroundColor: '#FFF8E1',
        border: '2px solid #FFCCBC',
        maxWidth: 500,
        width: '100%',
        boxShadow: '0 8px 32px rgba(255, 204, 188, 0.3)'
      }}>
        <EventIcon sx={{ 
          fontSize: { xs: 60, md: 80 }, 
          color: '#FFAB91',
          mb: 3
        }} />
        
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          sx={{ 
            fontWeight: 600,
            color: '#2C3E50',
            mb: 2
          }}
        >
          No Events Available
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#7F8C8D',
            mb: 4,
            lineHeight: 1.6
          }}
        >
          We're working on bringing you amazing health and wellness events. 
          Check back soon for community gatherings, workshops, and support groups.
        </Typography>

        {/* Feature Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 3,
          mt: 4
        }}>
          {/* Coming Soon Card */}
          <Box sx={{ 
            p: 3,
            borderRadius: 3,
            backgroundColor: '#E1BEE7',
            border: '1px solid #CE93D8'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: '#2C3E50',
                mb: 1
              }}
            >
              🎯 Support Groups
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#7F8C8D'
              }}
            >
              Connect with others who understand your journey
            </Typography>
          </Box>

          {/* Wellness Workshops */}
          <Box sx={{ 
            p: 3,
            borderRadius: 3,
            backgroundColor: '#B3E5FC',
            border: '1px solid #81D4FA'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: '#2C3E50',
                mb: 1
              }}
            >
              🌱 Wellness Workshops
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#7F8C8D'
              }}
            >
              Learn new skills for better health management
            </Typography>
          </Box>

          {/* Community Events */}
          <Box sx={{ 
            p: 3,
            borderRadius: 3,
            backgroundColor: '#C8E6C9',
            border: '1px solid #A5D6A7'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: '#2C3E50',
                mb: 1
              }}
            >
              🤝 Community Events
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#7F8C8D'
              }}
            >
              Meet fellow health enthusiasts in your area
            </Typography>
          </Box>

          {/* Expert Talks */}
          <Box sx={{ 
            p: 3,
            borderRadius: 3,
            backgroundColor: '#FCE4EC',
            border: '1px solid #F8BBD9'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: '#2C3E50',
                mb: 1
              }}
            >
              👩‍⚕️ Expert Talks
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#7F8C8D'
              }}
            >
              Learn from healthcare professionals and specialists
            </Typography>
          </Box>
        </Box>

        {/* Call to Action */}
        <Box sx={{ 
          mt: 4,
          p: 3,
          borderRadius: 3,
          backgroundColor: '#A8D5BA',
          border: '1px solid #81C784'
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: '#2C3E50',
              mb: 1
            }}
          >
            Stay Updated
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#2C3E50',
              opacity: 0.8
            }}
          >
            We'll notify you when new events are available in your area
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default RecommendedEvents;