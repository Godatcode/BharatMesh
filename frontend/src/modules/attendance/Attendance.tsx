import { Box, Typography, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Attendance = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        {t('attendance.title')}
      </Typography>
      <Card>
        <CardContent>
          <Typography>Attendance module coming soon...</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Attendance;

