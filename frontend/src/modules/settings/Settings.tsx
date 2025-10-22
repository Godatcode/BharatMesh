import { Box, Typography, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        {t('settings.title')}
      </Typography>
      <Card>
        <CardContent>
          <Typography>Settings module coming soon...</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;

