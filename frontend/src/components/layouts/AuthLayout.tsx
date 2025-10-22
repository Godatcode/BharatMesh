import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const AuthLayout = () => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'primary.main',
        backgroundImage: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '2rem',
              margin: '0 auto 16px'
            }}
          >
            BM
          </Box>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            {t('auth.welcome')}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {t('auth.subtitle')}
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Outlet />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;

