import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  Inventory,
  Payment,
  Receipt,
  People
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { billingApi, inventoryApi } from '@services/api';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={600}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: 2,
            bgcolor: `${color}.lighter`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: `${color}.main`
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayCount: 0,
    lowStockCount: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [billingData, inventoryData] = await Promise.all([
          billingApi.getStats(),
          inventoryApi.getStats()
        ]);

        if (billingData.success) {
          setStats(prev => ({
            ...prev,
            todayRevenue: billingData.data.todayRevenue || 0,
            todayCount: billingData.data.todayCount || 0
          }));
        }

        if (inventoryData.success) {
          setStats(prev => ({
            ...prev,
            lowStockCount: inventoryData.data.lowStockCount || 0
          }));
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        {t('dashboard.title')}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.todaySales')}
            value={`₹${stats.todayRevenue.toLocaleString('en-IN')}`}
            icon={<TrendingUp fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.todayOrders')}
            value={stats.todayCount}
            icon={<ShoppingCart fontSize="large" />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.lowStock')}
            value={stats.lowStockCount}
            icon={<Inventory fontSize="large" />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.pendingPayments')}
            value={stats.pendingPayments}
            icon={<Payment fontSize="large" />}
            color="error"
          />
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            {t('dashboard.quickActions')}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Receipt />}
                onClick={() => navigate('/billing')}
                sx={{ py: 1.5 }}
              >
                {t('dashboard.newBill')}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ShoppingCart />}
                onClick={() => navigate('/orders')}
                sx={{ py: 1.5 }}
              >
                {t('dashboard.newOrder')}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<People />}
                onClick={() => navigate('/attendance')}
                sx={{ py: 1.5 }}
              >
                {t('dashboard.attendance')}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<TrendingUp />}
                sx={{ py: 1.5 }}
              >
                {t('dashboard.viewReports')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;

