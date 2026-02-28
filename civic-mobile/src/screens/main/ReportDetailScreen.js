import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Linking
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { REPORT_STATUS, PRIORITY_LEVELS } from '../../constants/config';
import reportService from '../../services/reportService';
import { showErrorAlert } from '../../utils/errorHandler';

const ReportDetailScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { reportId } = route.params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportDetails();
  }, []);

  const fetchReportDetails = async () => {
    try {
      console.log('📋 Fetching report details for ID:', reportId);
      const result = await reportService.getReportById(reportId);
      
      if (result.success) {
        const reportData = result.data;
        
        // Transform the data to match our UI expectations
        const transformedReport = {
          id: reportData.id,
          title: reportData.title,
          description: reportData.description,
          category: reportData.category,
          status: reportData.status,
          priority: reportData.priority || 'medium',
          location: reportData.location?.address || 'Location not specified',
          latitude: reportData.location?.latitude,
          longitude: reportData.location?.longitude,
          reportedBy: reportData.reporterId?.name || reportData.reporterId || 'Anonymous',
          createdAt: reportData.createdAt,
          updatedAt: reportData.updatedAt,
          assignedTo: reportData.assignedTo?.name || reportData.assignedTo || null,
          estimatedCompletion: reportData.estimatedCompletion || null,
          resolution: reportData.resolution || null,
          // Extract URLs from media objects, handle both populated objects and direct URLs
          images: (reportData.media || []).map(media =>
            typeof media === 'string' ? media : media?.url
          ).filter(Boolean),
          comments: reportData.comments || [],
          upvotes: Array.isArray(reportData.upvotes) ? reportData.upvotes.length : 0
        };
        
        console.log('✅ Report details loaded:', transformedReport);
        setReport(transformedReport);
      } else {
        console.error('❌ Failed to load report:', result.message);
        showErrorAlert(new Error(result.message || 'Failed to load report details'));
      }
    } catch (error) {
      console.error('❌ Error fetching report details:', error);
      showErrorAlert(error, 'Failed to Load Report');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return REPORT_STATUS[status]?.color || theme.colors.text.secondary;
  };

  const getStatusLabel = (status) => {
    return REPORT_STATUS[status]?.label || status;
  };

  const getPriorityColor = (priority) => {
    const priorityObj = PRIORITY_LEVELS.find(p => p.value === priority);
    return priorityObj?.color || theme.colors.text.secondary;
  };

  const getPriorityLabel = (priority) => {
    const priorityObj = PRIORITY_LEVELS.find(p => p.value === priority);
    return priorityObj?.label || priority;
  };

  const openLocation = () => {
    if (report?.latitude && report?.longitude) {
      const url = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
      Linking.openURL(url);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>Loading report details...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background.primary }]}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={64}
          color={theme.colors.status.error}
        />
        <Text style={[styles.errorText, { color: theme.colors.status.error }]}>Report not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface.primary }]}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>{report.title}</Text>
        <View style={styles.badgesContainer}>
          <View style={[styles.badge, { backgroundColor: getStatusColor(report.status) }]}>
            <Text style={styles.badgeText}>{getStatusLabel(report.status)}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getPriorityColor(report.priority) }]}>
            <Text style={styles.badgeText}>{getPriorityLabel(report.priority)}</Text>
          </View>
        </View>
      </View>

      {/* Images */}
      {report.images && report.images.length > 0 && (
        <View style={[styles.imagesSection, { backgroundColor: theme.colors.surface.primary }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {report.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.reportImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Details */}
      <View style={[styles.detailsSection, { backgroundColor: theme.colors.surface.primary }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Description</Text>
        <Text style={[styles.description, { color: theme.colors.text.primary }]}>{report.description}</Text>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.text.secondary} />
          <View style={styles.detailContent}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Location</Text>
            <TouchableOpacity onPress={openLocation}>
              <Text style={[styles.detailValue, styles.linkText, { color: theme.colors.primary.main }]}>
                {report.location}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="account" size={20} color={theme.colors.text.secondary} />
          <View style={styles.detailContent}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Reported By</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>{report.reportedBy}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.text.secondary} />
          <View style={styles.detailContent}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Reported On</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>{formatDate(report.createdAt)}</Text>
          </View>
        </View>

        {report.assignedTo && (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="account-group" size={20} color={theme.colors.text.secondary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Assigned To</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>{report.assignedTo}</Text>
            </View>
          </View>
        )}

        {report.estimatedCompletion && (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock" size={20} color={theme.colors.text.secondary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Estimated Completion</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                {new Date(report.estimatedCompletion).toLocaleDateString('en-IN')}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name={report.status === 'resolved' ? "check-circle" : "clock-outline"}
            size={20}
            color={report.status === 'resolved' ? theme.colors.status.success : theme.colors.text.secondary}
          />
          <View style={styles.detailContent}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Resolved On</Text>
            <Text style={[
              styles.detailValue,
              { color: report.status === 'resolved' ? theme.colors.status.success : theme.colors.text.secondary }
            ]}>
              {report.status === 'resolved' && report.resolution?.resolvedAt
                ? formatDate(report.resolution.resolvedAt)
                : 'Pending'
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Updates */}
      {report.comments && report.comments.length > 0 && (
        <View style={[styles.updatesSection, { backgroundColor: theme.colors.surface.primary }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Progress Updates</Text>
          {report.comments.map((comment) => (
            <View key={comment.id} style={[styles.updateItem, { backgroundColor: theme.colors.surface.secondary }]}>
              <View style={styles.updateHeader}>
                <MaterialCommunityIcons
                  name="account-circle"
                  size={16}
                  color={theme.colors.primary.main}
                />
                <Text style={[styles.updateAuthor, { color: theme.colors.text.primary }]}>{comment.createdBy}</Text>
                <Text style={[styles.updateDate, { color: theme.colors.text.secondary }]}>{formatDate(comment.createdAt)}</Text>
              </View>
              <Text style={[styles.updateText, { color: theme.colors.text.primary }]}>{comment.text}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imagesSection: {
    padding: 20,
    marginBottom: 12,
  },
  reportImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 12,
  },
  detailsSection: {
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  updatesSection: {
    padding: 20,
    marginBottom: 12,
  },
  updateItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  updateAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  updateDate: {
    fontSize: 12,
    marginLeft: 'auto',
  },
  updateText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ReportDetailScreen;