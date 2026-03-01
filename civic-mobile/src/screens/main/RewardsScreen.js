import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import reportService from '../../services/reportService';
import { LinearGradient } from 'expo-linear-gradient';

const RewardsScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [totalPoints, setTotalPoints] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const result = await reportService.getMyReports();
            if (result.success) {
                setReports(result.data);

                // Calculate points: 1 point per resolved report
                const points = result.data.filter(r => r.status === 'resolved').length;
                setTotalPoints(points);
            }
        } catch (error) {
            console.error('Error fetching rewards data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const renderReportItem = ({ item }) => {
        const isResolved = item.status === 'resolved';
        return (
            <View style={[styles.reportItem, { backgroundColor: theme.colors.surface.primary }]}>
                <View style={styles.reportIconContainer}>
                    <MaterialCommunityIcons
                        name={isResolved ? "check-circle" : "clock-outline"}
                        size={24}
                        color={isResolved ? theme.colors.status.success : theme.colors.status.warning}
                    />
                </View>
                <View style={styles.reportContent}>
                    <Text style={[styles.reportTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={[styles.reportStatus, { color: theme.colors.text.secondary }]}>
                        Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                </View>
                <View style={styles.pointContainer}>
                    <Text style={[styles.pointText, { color: isResolved ? theme.colors.primary.main : theme.colors.text.tertiary }]}>
                        {isResolved ? '+1' : '0'} pt
                    </Text>
                </View>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
                <ActivityIndicator size="large" color={theme.colors.primary.main} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            {/* Wallet Header */}
            <LinearGradient
                colors={theme.colors.gradient.primary || ['#4c669f', '#3b5998', '#192f6a']}
                style={styles.header}
            >
                <View style={styles.walletHeader}>
                    <MaterialCommunityIcons name="wallet" size={40} color="#fff" />
                    <View style={styles.walletInfo}>
                        <Text style={styles.walletLabel}>Total Rewards</Text>
                        <Text style={styles.walletValue}>{totalPoints} Points</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.convertButton}>
                    <Text style={styles.convertButtonText}>Convert to Money (₹{totalPoints})</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary.main} />
                }
            >
                {/* Explanation Section */}
                <View style={[styles.infoCard, { backgroundColor: theme.colors.surface.secondary }]}>
                    <MaterialCommunityIcons name="information-outline" size={24} color={theme.colors.primary.main} />
                    <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoTitle, { color: theme.colors.text.primary }]}>How it works</Text>
                        <Text style={[styles.infoDesc, { color: theme.colors.text.secondary }]}>
                            Earn 1 point for every successful report you submit that gets resolved.
                            1 point is equal to ₹1 on India Taxi App.
                        </Text>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>My Reports & Earnings</Text>

                {reports.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="file-document-outline" size={60} color={theme.colors.text.tertiary} />
                        <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>No reports yet</Text>
                    </View>
                ) : (
                    reports.map((item) => (
                        <View key={item.id}>
                            {renderReportItem({ item })}
                        </View>
                    ))
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
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
    header: {
        padding: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    walletHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    walletInfo: {
        marginLeft: 16,
    },
    walletLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
    walletValue: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    convertButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    convertButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    infoCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        alignItems: 'center',
    },
    infoTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    infoDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    reportItem: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    reportIconContainer: {
        marginRight: 12,
    },
    reportContent: {
        flex: 1,
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    reportStatus: {
        fontSize: 12,
    },
    pointContainer: {
        marginLeft: 8,
    },
    pointText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
    },
});

export default RewardsScreen;
