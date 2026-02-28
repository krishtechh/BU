import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Card, Chip, Searchbar, FAB, Menu, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL, REPORT_STATUS } from '../../constants/config';

const ManageReportsScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchQuery, selectedStatus]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/reports`);
      setReports(response.data.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      
      let errorMessage = 'Failed to load reports';
      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error occurred';
      } else if (error.request) {
        errorMessage = 'Network error - please check your connection';
      } else {
        errorMessage = 'An unexpected error occurred';
      }
      
      Alert.alert('Error', errorMessage, [
        { text: 'Retry', onPress: fetchReports },
        { text: 'Cancel', style: 'cancel' }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(report => report.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(report =>
        (report.title || '').toLowerCase().includes(query) ||
        (report.description || '').toLowerCase().includes(query) ||
        (report.category || '').toLowerCase().includes(query)
      );
    }

    setFilteredReports(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const updateReportStatus = async (reportId, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/reports/${reportId}`, {
        status: newStatus
      });
      
      // Update local state
      setReports(prevReports =>
        prevReports.map(report =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );
      
      Alert.alert('Success', `Report status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating report status:', error);
      
      let errorMessage = 'Failed to update report status';
      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error occurred';
      } else if (error.request) {
        errorMessage = 'Network error - please check your connection';
      } else {
        errorMessage = 'An unexpected error occurred';
      }
      
      Alert.alert('Error', errorMessage, [
        { text: 'Retry', onPress: () => updateReportStatus(reportId, newStatus) },
        { text: 'Cancel', style: 'cancel' }
      ]);
    }
  };

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

  const getCategoryIcon = (category) => {
    const icons = {
      road_issue: 'road',
      water_supply: 'water',
      electricity: 'flash',
      garbage: 'trash-can',
      drainage: 'pipe',
      street_light: 'lamp',
      traffic: 'traffic-light',
      pollution: 'cloud-alert',
      encroachment: 'home-alert',
      other: 'alert-circle'
    };
    return icons[category] || 'alert-circle';
  };

  const showStatusUpdateDialog = (report) => {
    const statusOptions = [
      { label: 'Acknowledged', value: 'acknowledged' },
      { label: 'Assigned', value: 'assigned' },
      { label: 'In Progress', value: 'in_progress' },
      { label: 'Resolved', value: 'resolved' },
      { label: 'Rejected', value: 'rejected' }
    ];

    Alert.alert(
      'Update Status',
      'Select new status for this report:',
      [
        ...statusOptions.map(option => ({
          text: option.label,
          onPress: () => updateReportStatus(report.id, option.value)
        })),
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderReport = ({ item }) => {
    if (!item || !item.id) {
      return null; // Skip rendering if item is invalid
    }

    const status = REPORT_STATUS[item.status] || { label: 'Unknown', color: '#999' };
    
    return (
      <Card style={styles.reportCard} key={item.id}>
        <Card.Content>
          <View style={styles.reportHeader}>
            <MaterialCommunityIcons
              name={getCategoryIcon(item.category || 'other')}
              size={24}
              color="#2196F3"
            />
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle} numberOfLines={1}>
                {item.title || 'Untitled Report'}
              </Text>
              <Text style={styles.reportLocation} numberOfLines={1}>
                {item.location?.address || 'Location not specified'}
              </Text>
            </View>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status || 'submitted') }]}
              textStyle={styles.statusText}
            >
              {item.status || 'submitted'}
            </Chip>
          </View>
          
          <Text style={styles.reportDescription} numberOfLines={2}>
            {item.description || 'No description provided'}
          </Text>
          
          <View style={styles.reportFooter}>
            <Text style={styles.reportDate}>
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date'}
            </Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
              >
                <MaterialCommunityIcons name="eye" size={16} color="#2196F3" />
                <Text style={styles.actionText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => showStatusUpdateDialog(item)}
              >
                <MaterialCommunityIcons name="update" size={16} color="#FF9800" />
                <Text style={styles.actionText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const statusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Acknowledged', value: 'acknowledged' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Rejected', value: 'rejected' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search reports..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={statusFilters}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedStatus === item.value && styles.filterChipActive
              ]}
              onPress={() => setSelectedStatus(item.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedStatus === item.value && styles.filterTextActive
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <FlatList
        data={filteredReports}
        renderItem={renderReport}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No reports found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 10,
  },
  searchBar: {
    elevation: 2,
  },
  filtersContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  filterChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  reportCard: {
    marginHorizontal: 10,
    marginVertical: 5,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportInfo: {
    flex: 1,
    marginLeft: 10,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reportLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  reportDate: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    marginLeft: 8,
  },
  actionText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#333',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
});

export default ManageReportsScreen;