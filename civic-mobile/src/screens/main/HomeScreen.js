import React, { useState, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import axios from 'axios';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL, REPORT_STATUS, CATEGORIES } from '../../constants/config';
import {
  AnimatedCard,
  AnimatedButton,
  FloatingActionButton,
  LoadingOverlay,
} from '../../components/ui/AnimatedComponents';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    acknowledged: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    closed: 0,
  });

  const scrollY = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      fetchReports();
      fetchStats();
    }, [])
  );

  const fetchReports = async (filters = {}) => {
    try {
      const params = {};

      // Add filters to params
      if (filters.status && filters.status !== 'all') {
        // Handle 'pending' as a special case that includes multiple statuses
        if (filters.status === 'pending') {
          // For pending, we need to fetch reports client-side and filter
          // or fetch all and filter locally
        } else {
          params.status = filters.status;
        }
      }
      if (filters.category && filters.category !== 'all') {
        params.category = filters.category;
      }

      // If no filters applied, limit to recent 15 reports
      if (!params.status && !params.category && filters.status !== 'pending') {
        params.limit = 15;
      }

      const response = await axios.get(`${API_BASE_URL}/reports`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        params
      });

      if (response.data.success) {
        let reportsData = response.data.data;

        // Filter for pending status (submitted, acknowledged, assigned)
        if (filters.status === 'pending') {
          reportsData = reportsData.filter(report =>
            ['submitted', 'acknowledged', 'assigned'].includes(report.status)
          );
        }

        setReports(reportsData);
        setFilteredReports(reportsData);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/stats`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (response.data.success) {
        const data = response.data.data;
        const statusCounts = data.statusCounts || {};

        setStats({
          total: data.total || 0,
          pending: statusCounts.submitted || 0,
          acknowledged: statusCounts.acknowledged || 0,
          assigned: statusCounts.assigned || 0,
          inProgress: statusCounts.in_progress || 0,
          resolved: statusCounts.resolved || 0,
          rejected: statusCounts.rejected || 0,
          closed: statusCounts.closed || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports({ status: selectedStatus, category: selectedCategory });
    fetchStats();
  };

  useEffect(() => {
    // Fetch data when filters change
    fetchReports({ status: selectedStatus, category: selectedCategory });
  }, [selectedCategory, selectedStatus]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
    }
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
      case 'acknowledged':
        return theme.colors.status.info;
      case 'assigned':
      case 'in_progress':
        return theme.colors.status.warning;
      case 'resolved':
        return theme.colors.status.success;
      case 'rejected':
        return theme.colors.status.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      road_issue: 'road',
      water_supply: 'water',
      electricity: 'lightning-bolt',
      garbage: 'delete',
      drainage: 'pipe',
      street_light: 'lightbulb',
      traffic: 'traffic-light',
      pollution: 'leaf',
      encroachment: 'home-alert',
      other: 'help-circle',
    };
    return iconMap[category] || 'help-circle';
  };

  const renderStatCard = ({ item, index }) => (
    <AnimatedCard
      delay={index * 100}
      animation="fadeInUp"
      style={[
        styles.statCard,
        {
          backgroundColor: theme.colors.surface.primary,
          borderLeftWidth: 4,
          borderLeftColor: item.color,
        },
      ]}
      onPress={() => setSelectedStatus(item.key)}
    >
      <View style={styles.statBadgeContainer}>
        <View style={[styles.statBadge, { backgroundColor: item.color }]}>
          <Text style={styles.statBadgeText}>{item.value}</Text>
        </View>
      </View>
      <View style={styles.statCardContent}>
        <View style={styles.statIconContainer}>
          <LinearGradient
            colors={[item.color + '20', item.color + '10']}
            style={[styles.statIcon, { backgroundColor: item.color + '15' }]}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={24}
              color={item.color}
            />
          </LinearGradient>
        </View>
        <View style={styles.statInfo}>
          <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
            {item.label}
          </Text>
        </View>
      </View>
    </AnimatedCard>
  );

  const renderReportCard = ({ item, index }) => (
    <AnimatedCard
      delay={index * 50}
      animation="fadeInUp"
      style={styles.reportCard}
      onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportTitleContainer}>
          <MaterialCommunityIcons
            name={getCategoryIcon(item.category)}
            size={20}
            color={theme.colors.primary.main}
            style={{ marginRight: theme.spacing.sm }}
          />
          <Text
            style={[styles.reportTitle, { color: theme.colors.text.primary }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {REPORT_STATUS[item.status]?.label || item.status}
          </Text>
        </View>
      </View>

      <Text
        style={[styles.reportDescription, { color: theme.colors.text.secondary }]}
        numberOfLines={2}
      >
        {item.description}
      </Text>

      <View style={styles.reportFooter}>
        <View style={styles.reportLocation}>
          <MaterialCommunityIcons
            name="map-marker"
            size={14}
            color={theme.colors.text.tertiary}
          />
          <Text
            style={[styles.locationText, { color: theme.colors.text.tertiary }]}
            numberOfLines={1}
          >
            {item.address || 'Location not specified'}
          </Text>
        </View>
        <Text
          style={[styles.reportDate, { color: theme.colors.text.tertiary }]}
        >
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </AnimatedCard>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={theme.colors.gradient.primary}
        style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Animatable.View animation="fadeInLeft" delay={200}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Citizen'}</Text>
          </Animatable.View>
          <Animatable.View animation="fadeInRight" delay={400}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <MaterialCommunityIcons
                name="account-circle-outline"
                size={36}
                color={theme.colors.text.contrast}
              />
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderSearchAndFilters = () => (
    <Animatable.View animation="fadeInUp" delay={600} style={styles.searchContainer}>
      <View style={styles.whitespace} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {['all', ...Object.keys(CATEGORIES)].map((category, index) => (
          <AnimatedButton
            key={category}
            onPress={() => setSelectedCategory(category)}
            variant={selectedCategory === category ? 'primary' : 'outline'}
            size="small"
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedCategory === category
                  ? theme.colors.primary.main
                  : theme.colors.surface.primary,
                borderColor: theme.colors.primary.main,
              },
            ]}
          >
            <Text
              style={[
                styles.filterButtonText,
                {
                  color: selectedCategory === category
                    ? theme.colors.text.contrast
                    : theme.colors.text.primary,
                },
              ]}
            >
              {category === 'all' ? 'All' : CATEGORIES[category]}
            </Text>
          </AnimatedButton>
        ))}
      </ScrollView>
    </Animatable.View>
  );

  const statsData = [
    {
      key: 'all',
      label: 'Total Reports',
      value: stats.total,
      icon: 'file-document-multiple',
      color: theme.colors.primary.main,
    },
    {
      key: 'pending',
      label: 'Pending',
      value: (stats.pending || 0) + (stats.acknowledged || 0) + (stats.assigned || 0),
      icon: 'clock-outline',
      color: theme.colors.status.warning,
    },
    {
      key: 'in_progress',
      label: 'In Progress',
      value: stats.inProgress,
      icon: 'progress-clock',
      color: theme.colors.status.info,
    },
    {
      key: 'resolved',
      label: 'Resolved',
      value: stats.resolved,
      icon: 'check-circle',
      color: theme.colors.status.success,
    },
  ];

  if (loading) {
    return <LoadingOverlay visible={true} text="Loading reports..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background.primary}
      />

      {renderHeader()}

      <Animated.ScrollView
        style={[styles.content, { marginTop: insets.top + 55 }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={theme.colors.gradient.primary}
            tintColor={theme.colors.primary.main}
          />
        }
      >
        {renderSearchAndFilters()}

        <Animatable.View animation="fadeInUp" delay={800} style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Quick Stats
          </Text>
          <FlatList
            data={statsData}
            renderItem={renderStatCard}
            keyExtractor={(item) => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          />
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={1000} style={styles.reportsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Recent Reports
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllReports')}>
              <Text style={[styles.seeAllText, { color: theme.colors.primary.main }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {filteredReports.length === 0 ? (
            <AnimatedCard style={styles.emptyCard}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={48}
                color={theme.colors.text.tertiary}
                style={{ alignSelf: 'center', marginBottom: theme.spacing.md }}
              />
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                {selectedCategory !== 'all' || selectedStatus !== 'all'
                  ? 'No reports match your filters'
                  : 'No reports found'}
              </Text>
            </AnimatedCard>
          ) : (
            <>
              <FlatList
                data={filteredReports.slice(0, 15)}
                renderItem={renderReportCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
              {/* Show "See More" button when showing limited results (no filters) */}
              {selectedStatus === 'all' && selectedCategory === 'all' && filteredReports.length === 15 && (
                <TouchableOpacity
                  style={[styles.seeMoreButton, { borderColor: theme.colors.primary.main }]}
                  onPress={() => navigation.navigate('AllReports')}
                >
                  <Text style={[styles.seeMoreText, { color: theme.colors.primary.main }]}>
                    See More Reports
                  </Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={16}
                    color={theme.colors.primary.main}
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </Animatable.View>
      </Animated.ScrollView>

      <FloatingActionButton
        onPress={() => navigation.navigate('CreateReport')}
        icon={
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={theme.colors.text.contrast}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerGradient: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  userName: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '700',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  whitespace: {
    height: 20,
    marginBottom: 16,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersContent: {
    paddingRight: 20,
  },
  filterButton: {
    marginRight: 6,
    borderRadius: 16,
    paddingHorizontal: 1,
    paddingVertical: 1,
    borderWidth: 1,
    minHeight: 1,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '620',
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  statsContainer: {
    paddingHorizontal: 20,
  },
  statCard: {
    marginRight: 16,
    width: screenWidth * 0.4,
    minHeight: 100,
    position: 'relative',
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    marginRight: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statBadgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  statBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  statBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  reportsSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reportCard: {
    marginBottom: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reportDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  reportDate: {
    fontSize: 12,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;