import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL, REPORT_STATUS } from '../../constants/config';

const DashboardScreen = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    rejectedReports: 0,
    recentReports: []
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/reports`);
      const reports = response.data.data || [];
      
      const totalReports = reports.length;
      const pendingReports = reports.filter(r => ['submitted', 'acknowledged'].includes(r.status)).length;
      const resolvedReports = reports.filter(r => r.status === 'resolved').length;
      const rejectedReports = reports.filter(r => r.status === 'rejected').length;
      const recentReports = reports.slice(0, 5);

      setDashboardData({
        totalReports,
        pendingReports,
        resolvedReports,
        rejectedReports,
        recentReports
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      let errorMessage = 'Failed to load dashboard data';
      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error occurred';
      } else if (error.request) {
        errorMessage = 'Network error - please check your connection';
      } else {
        errorMessage = 'An unexpected error occurred';
      }
      
      Alert.alert('Error', errorMessage, [
        { text: 'Retry', onPress: fetchDashboardData },
        { text: 'Cancel', style: 'cancel' }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card style={[styles.statCard, { borderLeftColor: color }]}>
      <Card.Content style={styles.statContent}>
        <View style={styles.statIcon}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{title}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const getStatusColor = (status) => {
    const statusColors = {
      submitted: '#2196F3',
      acknowledged: '#FF9800',
      assigned: '#9C27B0',
      in_progress: '#3F51B5',
      resolved: '#4CAF50',
      rejected: '#F44336',
      closed: '#757575'
    };
    return statusColors[status] || '#999';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.title}>Admin Dashboard</Title>
        <Paragraph style={styles.subtitle}>Civic Issue Management</Paragraph>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title="Total Reports"
          value={dashboardData.totalReports}
          icon="file-document-multiple"
          color="#2196F3"
        />
        <StatCard
          title="Pending"
          value={dashboardData.pendingReports}
          icon="clock-outline"
          color="#FF9800"
        />
        <StatCard
          title="Resolved"
          value={dashboardData.resolvedReports}
          icon="check-circle"
          color="#4CAF50"
        />
        <StatCard
          title="Rejected"
          value={dashboardData.rejectedReports}
          icon="close-circle"
          color="#F44336"
        />
      </View>

      <Card style={styles.recentCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Recent Reports</Title>
          {dashboardData.recentReports.length === 0 ? (
            <Text style={styles.noData}>No reports found</Text>
          ) : (
            dashboardData.recentReports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={styles.reportItem}
                onPress={() => navigation.navigate('ReportDetail', { reportId: report.id })}
              >
                <View style={styles.reportContent}>
                  <Text style={styles.reportTitle} numberOfLines={1}>
                    {report.title}
                  </Text>
                  <Text style={styles.reportDescription} numberOfLines={2}>
                    {report.description}
                  </Text>
                  <View style={styles.reportMeta}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
                      <Text style={styles.statusText}>{report.status}</Text>
                    </View>
                    <Text style={styles.reportDate}>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
              </TouchableOpacity>
            ))
          )}
        </Card.Content>
      </Card>

      <View style={styles.actionButtons}>
        <Button
          mode="contained"
          icon="folder-multiple"
          onPress={() => navigation.navigate('ManageReports')}
          style={styles.actionButton}
        >
          Manage All Reports
        </Button>
        <Button
          mode="outlined"
          icon="refresh"
          onPress={fetchDashboardData}
          style={styles.actionButton}
        >
          Refresh Data
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#fff',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 10,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recentCard: {
    margin: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  reportDate: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    padding: 20,
  },
  actionButton: {
    marginBottom: 10,
  },
});

export default DashboardScreen;