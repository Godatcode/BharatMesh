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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Paper,
  Fade,
  Slide
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Email, Lock } from '@mui/icons-material';
// import { useTranslation } from 'react-i18next'; // Removed unused import
// import { useAuthStore } from '@stores/authStore'; // Removed unused import
import PhoneInput from '../../components/PhoneInput';
import GradientBlinds from '../../components/GradientBlinds';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    pin: '',
    confirmPin: '',
    role: 'owner' as 'owner' | 'manager' | 'employee'
  });
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Styling for Select components
  const selectSx = {
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
      '& .MuiSelect-select': {
        color: 'rgba(255, 255, 255, 0.9)',
        padding: '12px 14px',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)',
      '&.Mui-focused': {
        color: '#4dabf7',
      },
    },
    '& .MuiSvgIcon-root': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
  };

  const handleChange = (field: string) => (e: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!formData.phone || !formData.phone.startsWith('+')) {
      setError('Please select a country and enter a valid phone number');
      return;
    }
    
    // Extract phone number without country code
    const phoneWithoutCountryCode = formData.phone.substring(formData.phone.indexOf('+') + 1);
    if (phoneWithoutCountryCode.length < 10) {
      setError('Phone number must be at least 10 digits');
      return;
    }

    if (formData.pin.length < 4 || formData.pin.length > 6) {
      setError('PIN must be 4-6 digits');
      return;
    }

    if (formData.pin !== formData.confirmPin) {
      setError('PINs do not match');
      return;
    }

    setIsLoading(true);

    try {
        const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'https://bharatmesh-backend.onrender.com/api'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`,
          email: formData.email || undefined,
          role: formData.role,
          preferredLang: 'en',
          pin: formData.pin
        })
      });

      const data = await response.json();

      if (data.success) {
        // Auto-login after successful registration
        const loginResponse = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'https://bharatmesh-backend.onrender.com/api'}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: formData.phone, // Backend will normalize
            pin: formData.pin
          })
        });

        const loginData = await loginResponse.json();

        if (loginData.success) {
          localStorage.setItem('accessToken', loginData.data.tokens.accessToken);
          localStorage.setItem('refreshToken', loginData.data.tokens.refreshToken);
          localStorage.setItem('userId', loginData.data.user.id);
          navigate('/');
        } else {
          setError('Registration successful, but auto-login failed. Please login manually.');
        }
      } else {
        setError(data.error?.message || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
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
          angle={20}
          noise={0.34}
          blindCount={35}
          blindMinWidth={55}
          spotlightRadius={0.5}
          spotlightSoftness={1}
          spotlightOpacity={1}
          mouseDampening={0.48}
          distortAmount={5}
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
                  🚀
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
                Join BharatMesh
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  textAlign: 'center',
                  mb: 2,
                  lineHeight: 1.6,
                }}
              >
                Create your account and start building your business empire today.
              </Typography>

              {/* Render Wake-up Warning */}
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  color: '#4dabf7',
                  '& .MuiAlert-icon': {
                    color: '#4dabf7',
                  },
                }}
              >
                ⏰ Please wait while the server wakes up (Render deployment may take some time)
              </Alert>

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

                <TextField
                  fullWidth
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{ ...inputSx, mb: 3 }}
                />

                <PhoneInput
                  value={formData.phone}
                  onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                  label="Phone Number"
                  required
                  disabled={isLoading}
                />

                <Box sx={{ mb: 3 }} />

                <TextField
                  fullWidth
                  label="Email (Optional)"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  type="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{ ...inputSx, mb: 3 }}
                />

                <FormControl 
                  fullWidth 
                  sx={{ ...selectSx, mb: 3 }}
                >
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={handleChange('role')}
                    label="Role"
                  >
                    <MenuItem value="owner">Owner</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="employee">Employee</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="PIN"
                  placeholder="Enter 4-6 digit PIN"
                  value={formData.pin}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pin: e.target.value.replace(/\D/g, '').slice(0, 6)
                  }))}
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
                          onClick={() => setShowPin(!showPin)}
                          edge="end"
                          sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                        >
                          {showPin ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ ...inputSx, mb: 3 }}
                />

                <TextField
                  fullWidth
                  label="Confirm PIN"
                  placeholder="Confirm your PIN"
                  value={formData.confirmPin}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    confirmPin: e.target.value.replace(/\D/g, '').slice(0, 6)
                  }))}
                  type={showConfirmPin ? 'text' : 'password'}
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
                          onClick={() => setShowConfirmPin(!showConfirmPin)}
                          edge="end"
                          sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                        >
                          {showConfirmPin ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
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
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <span>Creating account...</span>
                    </Box>
                  ) : 'Create Account'}
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
                    Already have an account?{' '}
                    <Link to="/auth/login">
                      Sign In
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

export default Register;
