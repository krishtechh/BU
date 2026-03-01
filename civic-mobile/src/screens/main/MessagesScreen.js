import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import chatService from '../../services/chatService';

const MessagesScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        const result = await chatService.getMyChats();
        if (result.success) {
            setChats(result.data);
        }
        setLoading(false);
        setRefreshing(false);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchChats();
    };

    const renderChatItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.chatItem, { backgroundColor: theme.colors.surface.primary }]}
            onPress={() => navigation.navigate('Chat', {
                chatId: item.chat_id,
                otherUser: { id: item.other_user_id, name: item.full_name }
            })}
        >
            <View style={styles.avatarContainer}>
                {item.profile_picture ? (
                    <Image source={{ uri: item.profile_picture }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary.main + '20' }]}>
                        <MaterialCommunityIcons name="account" size={30} color={theme.colors.primary.main} />
                    </View>
                )}
                {item.unread_count > 0 && <View style={styles.unreadBadge} />}
            </View>

            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={[styles.userName, { color: theme.colors.text.primary }]}>{item.full_name}</Text>
                    <Text style={[styles.time, { color: theme.colors.text.tertiary }]}>
                        {item.last_message_time ? new Date(item.last_message_time).toLocaleDateString() : ''}
                    </Text>
                </View>
                <View style={styles.chatFooter}>
                    <Text
                        style={[
                            styles.lastMessage,
                            { color: item.unread_count > 0 ? theme.colors.text.primary : theme.colors.text.secondary },
                            item.unread_count > 0 && styles.unreadText
                        ]}
                        numberOfLines={1}
                    >
                        {item.last_message || 'No messages yet'}
                    </Text>
                    {item.unread_count > 0 && (
                        <View style={[styles.unreadCountBadge, { backgroundColor: theme.colors.primary.main }]}>
                            <Text style={styles.unreadCountText}>{item.unread_count}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
                <ActivityIndicator size="large" color={theme.colors.primary.main} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <View style={[styles.header, { borderBottomColor: theme.colors.border.primary }]}>
                <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Messages</Text>
            </View>

            <FlatList
                data={chats}
                renderItem={renderChatItem}
                keyExtractor={item => item.chat_id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary.main} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="message-outline" size={80} color={theme.colors.text.tertiary} />
                        <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>No conversations yet</Text>
                        <Text style={[styles.emptySubtext, { color: theme.colors.text.tertiary }]}>
                            Start a chat from your reports to communicate with departments.
                        </Text>
                    </View>
                }
            />
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
        padding: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    chatItem: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#ff4b4b',
        borderWidth: 2,
        borderColor: '#fff',
    },
    chatInfo: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    time: {
        fontSize: 12,
    },
    chatFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 14,
        flex: 1,
        marginRight: 8,
    },
    unreadText: {
        fontWeight: 'bold',
    },
    unreadCountBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
    },
    unreadCountText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
});

export default MessagesScreen;
