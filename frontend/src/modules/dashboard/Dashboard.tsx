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
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

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

  // Mock chart data
  const dailySalesData = [
    { name: 'Mon', sales: 4000, orders: 24 },
    { name: 'Tue', sales: 3000, orders: 13 },
    { name: 'Wed', sales: 5000, orders: 28 },
    { name: 'Thu', sales: 4500, orders: 22 },
    { name: 'Fri', sales: 6000, orders: 35 },
    { name: 'Sat', sales: 5500, orders: 31 },
    { name: 'Sun', sales: 4800, orders: 26 }
  ];

  const categoryData = [
    { name: 'Grocery', value: 45, color: '#8884d8' },
    { name: 'Personal Care', value: 25, color: '#82ca9d' },
    { name: 'Snacks', value: 20, color: '#ffc658' },
    { name: 'Beverages', value: 10, color: '#ff7300' }
  ];

  const monthlyRevenueData = [
    { month: 'Jan', revenue: 120000 },
    { month: 'Feb', revenue: 135000 },
    { month: 'Mar', revenue: 150000 },
    { month: 'Apr', revenue: 140000 },
    { month: 'May', revenue: 160000 },
    { month: 'Jun', revenue: 170000 }
  ];

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

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Daily Sales Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Daily Sales Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'sales' ? `₹${value.toLocaleString('en-IN')}` : value,
                        name === 'sales' ? 'Sales' : 'Orders'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Sales by Category
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Revenue Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Monthly Revenue Growth
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

