import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Typography,
  Container,
  Paper,
  Fade,
  Slide
} from '@mui/material';
import { Visibility, VisibilityOff, Lock } from '@mui/icons-material';
// import { useTranslation } from 'react-i18next'; // Removed unused import
import { useAuthStore } from '@stores/authStore';
import PhoneInput from '../../components/PhoneInput';
import GradientBlinds from '../../components/GradientBlinds';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const { login, isLoading, error, setError } = useAuthStore();
  const navigate = useNavigate();
  // const { t } = useTranslation(); // Removed unused translation

  // Consistent glassmorphic styling for all inputs
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      '& fieldset': {
        borderColor: error ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)',
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: error ? '#ff6b6b' : 'rgba(255, 255, 255, 0.4)',
      },
      '&.Mui-focused fieldset': {
        borderColor: error ? '#ff6b6b' : '#4dabf7',
        borderWidth: '2px',
      },
      '& input': {
        color: 'rgba(255, 255, 255, 0.9)',
        padding: '12px 14px',
        '&::placeholder': {
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)',
      '&.Mui-focused': {
        color: '#4dabf7',
      },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation - check if phone has country code and proper length
    if (!phone.startsWith('+')) {
      setError('Please select a country and enter a valid phone number');
      return;
    }
    
    // Extract phone number without country code
    const phoneWithoutCountryCode = phone.substring(phone.indexOf('+') + 1);
    if (phoneWithoutCountryCode.length < 10) {
      setError('Phone number must be at least 10 digits');
      return;
    }

    if (pin.length < 4 || pin.length > 6) {
      setError('PIN must be 4-6 digits');
      return;
    }

    // Send phone number as entered - backend will normalize it
    console.log('🔍 Logging in with phone:', phone);
    
    try {
      await login(phone, pin);
      // Store user ID for sync
      localStorage.setItem('userId', phone); // Temporary, will be replaced with actual user ID
      navigate('/');
    } catch (error) {
      console.log('❌ Login failed:', error);
      // Error is handled by auth store
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        position: 'relative',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      {/* Animated Gradient Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
        }}
      >
        <GradientBlinds
          gradientColors={['#FF9FFC', '#5227FF']}
          angle={0}
          noise={0.3}
          blindCount={12}
          blindMinWidth={50}
          spotlightRadius={0.5}
          spotlightSoftness={1}
          spotlightOpacity={1}
          mouseDampening={0.15}
          distortAmount={0}
          shineDirection="left"
          mixBlendMode="lighten"
        />
      </Box>
      <Fade in timeout={800}>
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Slide direction="up" in timeout={1000}>
            <Paper
              elevation={24}
              sx={{
                background: 'rgba(30, 30, 30, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: { xs: 3, sm: 4 },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                },
              }}
            >
              {/* Header Image */}
              <Box
                sx={{
                  width: '100%',
                  height: 200,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '16px',
                  mb: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
                    `,
                  },
                }}
              >
                <Box
                  sx={{
                    fontSize: '4rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    textAlign: 'center',
                    zIndex: 1,
                  }}
                >
                  📱
                </Box>
              </Box>

              {/* Welcome Text */}
              <Typography
                variant="h4"
                sx={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontWeight: 700,
                  textAlign: 'center',
                  mb: 1,
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Welcome Back
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textAlign: 'center',
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                Today is a new day. It's your day. You shape it. Sign in to start managing your business.
              </Typography>

              <Box component="form" onSubmit={handleSubmit} noValidate>
                {error && (
                  <Fade in>
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3,
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        border: '1px solid rgba(244, 67, 54, 0.3)',
                        color: '#ff6b6b',
                        '& .MuiAlert-icon': {
                          color: '#ff6b6b',
                        },
                      }}
                    >
                      {error}
                    </Alert>
                  </Fade>
                )}

                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  label="Phone Number"
                  required
                  error={!!error}
                  helperText={error || undefined}
                  disabled={isLoading}
                />

                <Box sx={{ mb: 3 }} />

                <TextField
                  fullWidth
                  label="PIN"
                  placeholder="Enter your 4-6 digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  type={showPin ? 'text' : 'password'}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle pin visibility"
                          onClick={() => setShowPin(!showPin)}
                          edge="end"
                          sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                        >
                          {showPin ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  disabled={isLoading}
                  sx={{ ...inputSx, mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{ 
                    mb: 3, 
                    py: 1.8,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      '& a': {
                        color: '#4dabf7',
                        textDecoration: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      },
                    }}
                  >
                    Don't have an account?{' '}
                    <Link to="/auth/register">
                      Sign up
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Slide>
        </Container>
      </Fade>
    </Box>
  );
};

export default Login;

