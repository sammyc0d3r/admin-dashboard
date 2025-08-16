import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  WorkHistory as WorkHistoryIcon,
  ExitToApp as ExitToAppIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import UserList from '../Users/UserList';
import AdminManagement from '../Admin/AdminManagement';

const API_URL = 'https://api.smartcareerassistant.online';

const Dashboard = () => {
  const navigate = useNavigate();
  const [adminProfile, setAdminProfile] = useState(null);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  }, [navigate]);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const tokenType = localStorage.getItem('tokenType');
      
      console.log('Dashboard - Token:', token);
      console.log('Dashboard - Token Type:', tokenType);
      
      if (!token || !tokenType) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://api.smartcareerassistant.online/auth/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const data = await response.json();
      setDashboardStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const tokenType = localStorage.getItem('tokenType');

        if (!token || !tokenType) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_URL}/auth/admin/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json'
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin profile');
        }

        const data = await response.json();
        setAdminProfile(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching admin profile:', err);
        // If unauthorized, redirect to login
        if (err.message.includes('No authentication token')) {
          handleLogout();
        }
      }
    };

    fetchAdminProfile();
    fetchDashboardStats();
  }, [fetchDashboardStats, handleLogout]);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    handleLogout();
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const stats = dashboardStats ? [
    { title: 'Total Users', value: dashboardStats.total_users?.toLocaleString() || '0', icon: PersonIcon },
    { title: 'Active Users (24h)', value: dashboardStats.active_users_24h?.toLocaleString() || '0', icon: PersonIcon },
    { title: 'Total CVs', value: dashboardStats.total_cvs_analyzed?.toLocaleString() || '0', icon: AssessmentIcon },
    { title: 'Success Rate', value: dashboardStats.total_cvs_analyzed > 0 ? 
      `${((dashboardStats.successful_analyses / dashboardStats.total_cvs_analyzed) * 100).toFixed(1)}%` : '0%', 
      icon: WorkHistoryIcon },
    { title: 'Failed Analyses', value: dashboardStats.failed_analyses?.toLocaleString() || '0', icon: WorkHistoryIcon },
    { title: 'Avg Processing Time', value: `${dashboardStats.average_processing_time?.toFixed(1) || '0'}s`, icon: AssessmentIcon }
  ] : [
    { title: 'Total Users', value: '0', icon: PersonIcon },
    { title: 'Active Users (24h)', value: '0', icon: PersonIcon },
    { title: 'Total CVs', value: '0', icon: AssessmentIcon },
    { title: 'Success Rate', value: '0%', icon: WorkHistoryIcon },
    { title: 'Failed Analyses', value: '0', icon: WorkHistoryIcon },
    { title: 'Avg Processing Time', value: '0s', icon: AssessmentIcon }
  ];

  const recentErrors = dashboardStats?.recent_errors || [];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Smart Career Assistant - Admin Dashboard
            {adminProfile && (
              <Typography variant="subtitle2" component="div">
                Welcome, {adminProfile.username}
              </Typography>
            )}
          </Typography>
          <IconButton color="inherit" onClick={handleLogoutClick}>
            <ExitToAppIcon />
          </IconButton>

          <Dialog
            open={logoutDialogOpen}
            onClose={handleLogoutCancel}
          >
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogContent>
              Are you sure you want to log out?
            </DialogContent>
            <DialogActions>
              <Button onClick={handleLogoutCancel}>Cancel</Button>
              <Button onClick={handleLogoutConfirm} color="primary" variant="contained">
                Logout
              </Button>
            </DialogActions>
          </Dialog>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Tabs
              value={currentTab}
              onChange={(e, newValue) => setCurrentTab(newValue)}
              sx={{ mb: 3 }}
            >
              <Tab
                icon={<AssessmentIcon />}
                label="Dashboard"
                iconPosition="start"
              />
              <Tab
                icon={<GroupIcon />}
                label="User Management"
                iconPosition="start"
              />
              {(adminProfile?.role === 'super_admin' || adminProfile?.role === 'admin') && (
                <Tab
                  icon={<GroupIcon />}
                  label="Admin Management"
                  iconPosition="start"
                />
              )}
            </Tabs>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : !dashboardStats ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                No dashboard data available
              </Alert>
            ) : currentTab === 0 ? (
              <>
                <Grid container spacing={3}>
                  {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                      <Paper
                        sx={{
                          p: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%'
                        }}
                        elevation={3}
                      >
                        <stat.icon sx={{ fontSize: 40, mb: 1, color: '#1976d2' }} />
                        <Typography variant="h6" component="h2">
                          {stat.value}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                          {stat.title}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Grid container spacing={3} sx={{ mt: 3 }}>
                  {/* Activity Over Time */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }} elevation={3}>
                      <Typography variant="h6" gutterBottom>Activity Over Time</Typography>
                      <List>
                        <ListItem>
                          <ListItemText 
                            primary="CV Analyses"
                            secondary={
                              <>
                                  {dashboardStats?.cv_analyses_over_time?.last_24h || 0}
                                <br />
                                  {dashboardStats?.cv_analyses_over_time?.last_7d || 0}
                                <br />
                                  {dashboardStats?.cv_analyses_over_time?.last_30d || 0}
                              </>
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="User Registrations"
                            secondary={
                              <>
                                  {dashboardStats?.user_registrations_over_time?.last_24h || 0}
                                <br />
                                  {dashboardStats?.user_registrations_over_time?.last_7d || 0}
                                <br />
                                  {dashboardStats?.user_registrations_over_time?.last_30d || 0}
                              </>
                            }
                          />
                        </ListItem>
                      </List>
                    </Paper>
                  </Grid>

                  {/* Top Fields */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }} elevation={3}>
                      <Typography variant="h6" gutterBottom>Top Fields</Typography>
                      <List>
                        {dashboardStats.top_fields.slice(0, 3).map((field, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={field.field_name}
                              secondary={
                                <>
                                  Users: {field.user_count} | CVs: {field.cv_count}
                                  <br />
                                  Average Match Score: {(field.average_match_score * 100).toFixed(1)}%
                                </>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>

                  {/* Recent Errors */}
                  {dashboardStats.recent_errors.length > 0 && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }} elevation={3}>
                        <Typography variant="h6" gutterBottom>Recent Errors</Typography>
                        <List>
                          {dashboardStats.recent_errors.map((error, index) => (
                            <ListItem key={index}>
                              <Alert severity="error" sx={{ width: '100%' }}>
                                {error}
                              </Alert>
                            </ListItem>
                          ))}
                          {recentErrors.length === 0 && (
                            <ListItem>
                              <ListItemText primary="No recent errors" />
                            </ListItem>
                          )}
                        </List>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </>
            ) : currentTab === 1 ? (
              <UserList />
            ) : currentTab === 2 && (adminProfile?.role === 'super_admin' || adminProfile?.role === 'admin') ? (
              <AdminManagement />
            ) : null}
          </>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
