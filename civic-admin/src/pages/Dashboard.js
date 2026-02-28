import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Report,
  People,
  CheckCircle,
  Pending,
  TrendingUp
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { getStatusColor, getStatusLabel } from '../constants/reportStatus';
import AnimatedCard from '../components/AnimatedCard';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const defaultStats = {
  totalReports: 0,
  todayReports: 0,
  pendingReports: 0,
  resolvedReports: 0,
  totalUsers: 0,
  activeStaff: 0
};

const Dashboard = () => {
  const [stats, setStats] = useState(defaultStats);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/dashboard`);

      console.log("Dashboard API Response:", response.data);

      // Supports both: { data: { stats, recentReports } } OR { stats, recentReports }
      const apiData = response.data?.data || response.data;

      if (apiData) {
        const { stats: newStats, recentReports: newReports } = apiData;
        setStats(prevStats => ({
          ...prevStats,
          ...(newStats || {})
        }));
        setRecentReports(newReports || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(defaultStats);
      setRecentReports([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Reports',
      value: stats?.totalReports || 0,
      icon: <Report fontSize="large" />,
      color: '#2196F3'
    },
    {
      title: "Today's Reports",
      value: stats?.todayReports || 0,
      icon: <TrendingUp fontSize="large" />,
      color: '#4CAF50'
    },
    {
      title: 'Pending Reports',
      value: stats?.pendingReports || 0,
      icon: <Pending fontSize="large" />,
      color: '#FF9800'
    },
    {
      title: 'Resolved Reports',
      value: stats?.resolvedReports || 0,
      icon: <CheckCircle fontSize="large" />,
      color: '#4CAF50'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <People fontSize="large" />,
      color: '#9C27B0'
    },
    {
      title: 'Active Staff',
      value: stats?.activeStaff || 0,
      icon: <People fontSize="large" />,
      color: '#00BCD4'
    }
  ];

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
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          Dashboard Overview
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <StatCard stat={stat} index={index} />
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Recent Reports
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Reporter</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No recent reports
                    </TableCell>
                  </TableRow>
                ) : (
                  recentReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.title}</TableCell>
                      <TableCell>{report.reporter?.name || report.reporterId?.name || 'Anonymous'}</TableCell>
                      <TableCell>{report.category}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(report.status)}
                          color={getStatusColor(report.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{report.assignedTo?.name || '-'}</TableCell>
                      <TableCell>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
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
      delay={index * 0.1}
      sx={{
        background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
        border: `1px solid ${stat.color}30`,
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {stat.title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
              {inView ? <CountUp end={stat.value} duration={2} /> : 0}
            </Typography>
          </Box>

          <Box
            sx={{
              color: stat.color,
              background: `${stat.color}20`,
              p: 1.5,
              borderRadius: 2,
            }}
          >
            {stat.icon}
          </Box>
        </Box>
      </CardContent>
    </AnimatedCard>
  );
};

export default Dashboard;