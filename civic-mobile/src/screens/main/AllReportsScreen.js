import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getStatusColor, getStatusLabel } from '../../constants/reportStatus';
import { CATEGORIES } from '../../constants/config';
import reportService from '../../services/reportService';
import { showErrorAlert } from '../../utils/errorHandler';

const AllReportsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [selectedCategory, selectedStatus]);

  const fetchReports = async () => {
    try {
      setError(null);

      let result;
      if (selectedCategory !== 'all' || selectedStatus !== 'all') {
        // Use filtered endpoint if filters are applied
        const params = {};
        if (selectedStatus !== 'all') params.status = selectedStatus;
        if (selectedCategory !== 'all') params.category = selectedCategory;
        result = await reportService.getAllReports(1000, params);
      } else {
        result = await reportService.getAllReports();
      }

      if (result.success) {
        const transformedReports = result.data.map(report => ({
          id: report.id,
          title: report.title,
          category: report.category,
          status: report.status,
          createdAt: new Date(report.createdAt).toLocaleDateString(),
          location: report.location?.address || 'Location not specified',
          description: report.description,
          media: report.media || [],
          upvotes: Array.isArray(report.upvotes) ? report.upvotes.length : 0,
          comments: Array.isArray(report.comments) ? report.comments.length : 0,
          reporterName: report.reporterId?.name || 'Anonymous'
        }));

        setReports(transformedReports);
      } else {
        console.error('Failed to fetch reports:', result.message);
        const errorMsg = result.message || 'Failed to fetch reports';
        setError(errorMsg);
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      const errorMessage = error?.message?.includes('Network Error')
        ? 'No internet connection. Please check your network and try again.'
        : 'Failed to load reports. Please try again.';
      setError(errorMessage);
      setReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const statusOptions = [
    { key: 'all', label: 'All Status' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'acknowledged', label: 'Acknowledged' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'closed', label: 'Closed' }
  ];

  const categoryOptions = [
    { key: 'all', label: 'All Categories' },
    ...Object.entries(CATEGORIES).map(([key, value]) => ({ key, label: value }))
  ];

  const getCategoryIcon = (category) => {
    const iconMap = {
      road_issue: 'road',
      water_supply: 'water',
      electricity: 'lightning-bolt',
      garbage: 'delete',
      drainage: 'pipe',
      street_light: 'lightbulb',
      traffic: 'traffic-light',
      pollution: 'smoke',
      encroachment: 'alert',
      other: 'help-circle'
    };
    return iconMap[category] || 'help-circle';
  };

  const renderReportItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.reportItem, { backgroundColor: theme.colors.surface.primary }]}
      onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <MaterialCommunityIcons
            name={getCategoryIcon(item.category)}
            size={24}
            color={theme.colors.primary.main}
            style={styles.categoryIcon}
          />
          <View style={styles.reportDetails}>
            <Text style={[styles.reportTitle, { color: theme.colors.text.primary }]}>{item.title}</Text>
            <Text style={[styles.reportLocation, { color: theme.colors.text.secondary }]}>{item.location}</Text>
            <Text style={[styles.reporterName, { color: theme.colors.text.tertiary }]}>by {item.reporterName}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
      <View style={[styles.reportFooter, { borderTopColor: theme.colors.border.primary }]}>
        <Text style={[styles.reportDate, { color: theme.colors.text.secondary }]}>Created: {item.createdAt}</Text>
        <View style={styles.reportStats}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="thumb-up" size={14} color={theme.colors.text.secondary} />
            <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>{item.upvotes}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="comment" size={14} color={theme.colors.text.secondary} />
            <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>{item.comments}</Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={theme.colors.text.secondary}
        />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (error) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="wifi-off"
            size={64}
            color={theme.colors.status.error}
          />
          <Text style={[styles.errorText, { color: theme.colors.status.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, {
              backgroundColor: theme.colors.primary.main + '20',
              borderColor: theme.colors.primary.main
            }]}
            onPress={() => {
              setLoading(true);
              fetchReports();
            }}
          >
            <MaterialCommunityIcons name="refresh" size={20} color={theme.colors.primary.main} />
            <Text style={[styles.retryButtonText, { color: theme.colors.primary.main }]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyStateContainer}>
        <View style={[styles.emptyStateHeader, {
          backgroundColor: theme.colors.surface.primary,
          borderBottomColor: theme.colors.border.primary
        }]}>
          <Text style={[styles.emptyHeaderTitle, { color: theme.colors.text.primary }]}>All Reports</Text>
          <Text style={[styles.emptyHeaderSubtitle, { color: theme.colors.text.secondary }]}>
            View all civic issue reports in your area
          </Text>
        </View>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="map-marker-multiple"
            size={80}
            color={theme.colors.primary.main}
          />
          <Text style={[styles.emptyStateText, { color: theme.colors.text.primary }]}>No Reports Found</Text>
          <Text style={[styles.emptyStateSubtext, { color: theme.colors.text.secondary }]}>
            No civic issue reports have been submitted in your area yet.
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface.primary, borderBottomColor: theme.colors.border.primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.primary.main} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>All Reports</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Section */}
      <View style={[styles.filterSection, { backgroundColor: theme.colors.surface.primary, borderBottomColor: theme.colors.border.primary }]}>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialCommunityIcons name="filter" size={20} color={theme.colors.primary.main} />
          <Text style={[styles.filterToggleText, { color: theme.colors.primary.main }]}>Filters</Text>
          <MaterialCommunityIcons
            name={showFilters ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.colors.primary.main}
          />
        </TouchableOpacity>

        {showFilters && (
          <View style={styles.filtersContainer}>
            {/* Status Filters */}
            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, { color: theme.colors.text.primary }]}>Status</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterOptions}>
                  {statusOptions.map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.filterOption,
                        {
                          backgroundColor: selectedStatus === option.key ? theme.colors.primary.main : theme.colors.surface.secondary,
                          borderColor: selectedStatus === option.key ? theme.colors.primary.main : theme.colors.border.primary
                        }
                      ]}
                      onPress={() => setSelectedStatus(option.key)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          {
                            color: selectedStatus === option.key ? theme.colors.text.contrast : theme.colors.text.secondary
                          }
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Category Filters */}
            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, { color: theme.colors.text.primary }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterOptions}>
                  {categoryOptions.map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.filterOption,
                        {
                          backgroundColor: selectedCategory === option.key ? theme.colors.primary.main : theme.colors.surface.secondary,
                          borderColor: selectedCategory === option.key ? theme.colors.primary.main : theme.colors.border.primary
                        }
                      ]}
                      onPress={() => setSelectedCategory(option.key)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          {
                            color: selectedCategory === option.key ? theme.colors.text.contrast : theme.colors.text.secondary
                          }
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Clear Filters Button */}
            {(selectedStatus !== 'all' || selectedCategory !== 'all') && (
              <TouchableOpacity
                style={[styles.clearFiltersButton, { backgroundColor: theme.colors.surface.secondary }]}
                onPress={() => {
                  setSelectedStatus('all');
                  setSelectedCategory('all');
                }}
              >
                <MaterialCommunityIcons name="filter-off" size={16} color={theme.colors.text.secondary} />
                <Text style={[styles.clearFiltersText, { color: theme.colors.text.secondary }]}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary.main]}
            tintColor={theme.colors.primary.main}
          />
        }
        contentContainerStyle={reports.length === 0 ? styles.emptyContainer : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  reportItem: {
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  categoryIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  reportDetails: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reportLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  reporterName: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  reportDate: {
    fontSize: 12,
    color: '#666',
  },
  reportStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
  },
  emptyStateHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  emptyHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyHeaderSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    marginHorizontal: 32,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  retryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  filterSection: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterToggleText: {
    marginLeft: 8,
    marginRight: 'auto',
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  filterOptionActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  clearFiltersText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

export default AllReportsScreen;