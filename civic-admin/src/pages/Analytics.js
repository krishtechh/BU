import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  CheckCircle,
  AccessTime,
  Category,
  People,
  CalendarToday,
  FileDownload,
  Refresh,
  PlayArrow,
  Pause
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import axios from 'axios';
import AnimatedCard from '../components/AnimatedCard';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const Analytics = () => {
  const [reportAnalytics, setReportAnalytics] = useState({ timeline: [], categories: [] });
  const [userAnalytics, setUserAnalytics] = useState({ userStats: [], registrationTrend: [], topReporters: [] });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  // Real-time updates with auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, timeRange]);
const fetchAnalytics = async () => {
  try {
    const params = timeRange === 'all' ? {} : { timeRange };

    const [reportsResponse, usersResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/admin/reports/analytics`, { params }),
      axios.get(`${API_BASE_URL}/admin/users/analytics`, { params })
    ]);

    const reportsData = reportsResponse.data?.data || reportsResponse.data || {};
    const usersData = usersResponse.data?.data || usersResponse.data || {};

    setReportAnalytics({
      timeline: Array.isArray(reportsData.timeline) ? reportsData.timeline : [],
      categories: Array.isArray(reportsData.categories) ? reportsData.categories : []
    });

    setUserAnalytics({
      userStats: Array.isArray(usersData.userStats) ? usersData.userStats : [],
      registrationTrend: Array.isArray(usersData.registrationTrend) ? usersData.registrationTrend : [],
      topReporters: Array.isArray(usersData.topReporters) ? usersData.topReporters : []
    });

    setLastUpdated(new Date());
  } catch (error) {
    console.error('Error fetching analytics:', error);

    // Hard fallback
    setReportAnalytics({ timeline: [], categories: [] });
    setUserAnalytics({ userStats: [], registrationTrend: [], topReporters: [] });
  } finally {
    setLoading(false);
  }
};

  const summaryStats = useMemo(() => {
    const totalReports = reportAnalytics.timeline?.reduce((acc, item) => acc + (item.total || 0), 0) || 0;

    const totalResolved = reportAnalytics.timeline?.reduce((acc, item) => {
      const resolvedStatus = item.statusCounts?.find(s => s.status === 'resolved');
      return acc + (resolvedStatus?.count || 0);
    }, 0) || 0;

    const resolutionRate = totalReports > 0 ? ((totalResolved / totalReports) * 100).toFixed(1) : 0;
    const mostActiveCategory = reportAnalytics.categories?.[0]?.id || 'N/A';
    const totalUsers = userAnalytics.userStats?.reduce((acc, stat) => acc + stat.count, 0) || 0;

    return {
      totalReports,
      resolutionRate,
      avgResolutionTime: '2.4 days',
      mostActiveCategory,
      activeUsersToday: totalUsers,
      pendingVsResolved: totalReports - totalResolved
    };
  }, [reportAnalytics, userAnalytics]);

  const statCards = [
    {
      title: 'Total Reports',
      value: summaryStats.totalReports,
      icon: <Assessment fontSize="large" />,
      color: '#2196F3',
      trend: '+12%'
    },
    {
      title: 'Resolution Rate',
      value: `${summaryStats.resolutionRate}%`,
      icon: <CheckCircle fontSize="large" />,
      color: '#4CAF50',
      trend: '+5%'
    },
    {
      title: 'Avg Resolution Time',
      value: summaryStats.avgResolutionTime,
      icon: <AccessTime fontSize="large" />,
      color: '#FF9800',
      trend: '-8%',
      isNegative: false
    },
    {
      title: 'Most Active Category',
      value: summaryStats.mostActiveCategory,
      icon: <Category fontSize="large" />,
      color: '#9C27B0',
      isText: true
    },
    {
      title: 'Active Users',
      value: summaryStats.activeUsersToday,
      icon: <People fontSize="large" />,
      color: '#00BCD4',
      trend: '+3%'
    },
    {
      title: 'Pending Reports',
      value: summaryStats.pendingVsResolved,
      icon: <CalendarToday fontSize="large" />,
      color: '#F44336',
      trend: '-15%',
      isNegative: false
    }
  ];

  const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Analytics & Insights
            </Typography>
            <Box display="flex" alignItems="center" gap={1} sx={{ mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: autoRefresh ? 'success.main' : 'warning.main',
                  animation: autoRefresh ? 'pulse 2s infinite' : 'none'
                }}
              />
            </Box>
          </motion.div>

          <Box display="flex" gap={2} alignItems="center">
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={(e, newValue) => newValue && setTimeRange(newValue)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 2,
                  py: 0.5,
                  fontSize: '0.875rem'
                }
              }}
            >
              <ToggleButton value="all">Till Date</ToggleButton>
              <ToggleButton value="30">30 Days</ToggleButton>
              <ToggleButton value="90">90 Days</ToggleButton>
            </ToggleButtonGroup>

            <Tooltip title={autoRefresh ? "Disable Auto-refresh" : "Enable Auto-refresh"}>
              <IconButton
                color={autoRefresh ? "success" : "default"}
                onClick={() => setAutoRefresh(!autoRefresh)}
                sx={{ bgcolor: 'action.hover' }}
              >
                {autoRefresh ? <Pause /> : <PlayArrow />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh Now">
              <IconButton
                color="primary"
                onClick={fetchAnalytics}
                disabled={loading}
                sx={{ bgcolor: 'action.hover' }}
              >
                <Refresh sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Export Report">
              <IconButton color="primary" sx={{ bgcolor: 'action.hover' }}>
                <FileDownload />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {statCards.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={index}>
              <StatCard stat={stat} index={index} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <AnimatedSection delay={0.1}>
              <Paper sx={{ p: 3, borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Reports Timeline
                  </Typography>
                  <Chip label="Trend Analysis" size="small" color="primary" variant="outlined" />
                </Box>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={reportAnalytics.timeline}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="_id" stroke="#666" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                    <ChartTooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fill="url(#colorTotal)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </AnimatedSection>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <AnimatedSection delay={0.2}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Reports by Category
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportAnalytics.categories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="_id"
                      animationDuration={1500}
                    >
                      {reportAnalytics.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 2 }}>
                  {reportAnalytics.categories.slice(0, 5).map((cat, idx) => (
                    <Box key={idx} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: CHART_COLORS[idx % CHART_COLORS.length]
                          }}
                        />
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {cat.id}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {cat.count}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </AnimatedSection>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <AnimatedSection delay={0.3}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    User Registration Trend
                  </Typography>
                  <Chip
                    label={timeRange === 'all' ? 'All Time' : `Last ${timeRange} Days`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Box>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={userAnalytics.registrationTrend.slice().reverse()}>
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="_id" stroke="#666" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                    <ChartTooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="url(#colorBar)"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </AnimatedSection>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <AnimatedSection delay={0.4}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  User Role Distribution
                </Typography>
                <Box>
                  {userAnalytics.userStats.map((stat, index) => {
                    const total = userAnalytics.userStats.reduce((acc, s) => acc + s.count, 0);
                    const percentage = ((stat.count / total) * 100).toFixed(1);
                    const roleColors = {
                      admin: '#ef4444',
                      supervisor: '#f59e0b',
                      staff: '#3b82f6',
                      citizen: '#10b981'
                    };
                    const color = roleColors[stat.id] || '#6366f1';

                    return (
                      <Box key={stat.id} sx={{ mb: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: color,
                                fontSize: '0.75rem'
                              }}
                            >
                              {stat.id.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600}>
                              {stat.id.toUpperCase()}
                            </Typography>
                          </Box>
                          <Typography variant="h6" color={color} fontWeight={700}>
                            {stat.count}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={parseFloat(percentage)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: `${color}20`,
                            '& .MuiLinearProgress-bar': {
                              bgcolor: color,
                              borderRadius: 4
                            }
                          }}
                        />
                        <Box display="flex" justifyContent="space-between" mt={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Active: {stat.active} | Verified: {stat.verified}
                          </Typography>
                          <Typography variant="caption" fontWeight={600} color={color}>
                            {percentage}%
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </AnimatedSection>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <AnimatedSection delay={0.5}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Top Reporters
                  </Typography>
                  <Chip label="Most Active" size="small" color="primary" />
                </Box>
                <Grid container spacing={2}>
                  {userAnalytics.topReporters?.slice(0, 6).map((reporter, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                      <Card
                        sx={{
                          position: 'relative',
                          overflow: 'visible',
                          transition: 'all 0.3s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                          }
                        }}
                      >
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box position="relative">
                              <Avatar
                                sx={{
                                  width: 50,
                                  height: 50,
                                  bgcolor: CHART_COLORS[index % CHART_COLORS.length],
                                  fontSize: '1.25rem',
                                  fontWeight: 700
                                }}
                              >
                                {reporter.name?.charAt(0).toUpperCase()}
                              </Avatar>
                              {index < 3 && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    fontSize: '1.5rem'
                                  }}
                                >
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                </Box>
                              )}
                            </Box>
                            <Box flex={1}>
                              <Typography variant="body1" fontWeight={600}>
                                {reporter.name}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                <Chip
                                  label={`${reporter.reportCount} reports`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </AnimatedSection>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

const StatCard = ({ stat, index }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <AnimatedCard
      ref={ref}
      delay={index * 0.05}
      sx={{
        background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
        border: `1px solid ${stat.color}30`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${stat.color} 0%, ${stat.color}80 100%)`,
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
          <Box flex={1} minWidth={0}>
            <Typography color="text.secondary" gutterBottom variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
              {stat.title}
            </Typography>
            <Typography
              variant={stat.isText ? "body1" : "h5"}
              sx={{
                fontWeight: 700,
                color: stat.color,
                mb: 0.5,
                fontSize: stat.isText ? '0.875rem' : undefined,
                whiteSpace: stat.isText ? 'nowrap' : undefined,
                overflow: stat.isText ? 'hidden' : undefined,
                textOverflow: stat.isText ? 'ellipsis' : undefined
              }}
            >
              {stat.isText ? stat.value : inView ? <CountUp end={parseFloat(stat.value) || 0} duration={2} decimals={String(stat.value).includes('.') ? 1 : 0} /> : '0'}
            </Typography>
            {stat.trend && (
              <Box display="flex" alignItems="center" gap={0.5}>
                {stat.isNegative === false ? (
                  <TrendingDown sx={{ fontSize: '1rem', color: '#10b981' }} />
                ) : (
                  <TrendingUp sx={{ fontSize: '1rem', color: '#10b981' }} />
                )}
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                  {stat.trend}
                </Typography>
              </Box>
            )}
          </Box>
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            <Box
              sx={{
                color: stat.color,
                background: `${stat.color}20`,
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {stat.icon}
            </Box>
          </motion.div>
        </Box>
      </CardContent>
    </AnimatedCard>
  );
};

const AnimatedSection = ({ children, delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default Analytics;

// Add CSS animations
const styles = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
