import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Phone, Pin } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@stores/authStore';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const { login, isLoading, error, setError } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (phone.length !== 10) {
      setError('Phone number must be 10 digits');
      return;
    }

    if (pin.length < 4 || pin.length > 6) {
      setError('PIN must be 4-6 digits');
      return;
    }

    try {
      await login(phone, pin);
      // Store user ID for sync
      localStorage.setItem('userId', phone); // Temporary, will be replaced with actual user ID
      navigate('/');
    } catch (error) {
      // Error is handled by auth store
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label={t('auth.phone')}
        placeholder={t('auth.enterPhone')}
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
        type="tel"
        required
        autoFocus
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Phone />
            </InputAdornment>
          )
        }}
      />

      <TextField
        fullWidth
        label={t('auth.pin')}
        placeholder={t('auth.enterPin')}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
        type={showPin ? 'text' : 'password'}
        required
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Pin />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPin(!showPin)}
                edge="end"
              >
                {showPin ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ py: 1.5 }}
      >
        {isLoading ? <CircularProgress size={24} /> : t('auth.loginButton')}
      </Button>
    </Box>
  );
};

export default Login;

