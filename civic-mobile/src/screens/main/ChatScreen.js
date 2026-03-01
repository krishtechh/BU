import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
    SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';

const ChatScreen = ({ route, navigation }) => {
    const { theme } = useTheme();
    const { user: currentUser } = useAuth();
    const { chatId, otherUser } = route.params;

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef();

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchMessages = async () => {
        const result = await chatService.getMessages(chatId);
        if (result.success) {
            setMessages(result.data);
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        setSending(true);
        const result = await chatService.sendMessage(chatId, newMessage.trim());
        if (result.success) {
            setNewMessage('');
            fetchMessages();
        }
        setSending(false);
    };

    const renderMessage = ({ item }) => {
        const isOwn = item.sender_id === currentUser.id;
        return (
            <View style={[
                styles.messageContainer,
                isOwn ? styles.ownMessage : styles.otherMessage
            ]}>
                {!isOwn && (
                    <View style={styles.avatarContainer}>
                        <MaterialCommunityIcons name="account" size={24} color={theme.colors.text.tertiary} />
                    </View>
                )}
                <View style={[
                    styles.messageBubble,
                    { backgroundColor: isOwn ? theme.colors.primary.main : theme.colors.surface.secondary }
                ]}>
                    <Text style={[
                        styles.messageText,
                        { color: isOwn ? '#fff' : theme.colors.text.primary }
                    ]}>
                        {item.content}
                    </Text>
                    <Text style={[
                        styles.messageTime,
                        { color: isOwn ? 'rgba(255,255,255,0.7)' : theme.colors.text.tertiary }
                    ]}>
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
                <ActivityIndicator size="large" color={theme.colors.primary.main} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <View style={[styles.header, { borderBottomColor: theme.colors.border.primary }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={[styles.headerName, { color: theme.colors.text.primary }]}>
                        {otherUser?.name || 'Department Staff'}
                    </Text>
                    <Text style={[styles.headerStatus, { color: theme.colors.status.success }]}>Online</Text>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[styles.inputContainer, {
                    backgroundColor: theme.colors.surface.primary,
                    borderTopColor: theme.colors.border.primary
                }]}>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text.primary, backgroundColor: theme.colors.surface.secondary }]}
                        placeholder="Type a message..."
                        placeholderTextColor={theme.colors.text.tertiary}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: theme.colors.primary.main }]}
                        onPress={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <MaterialCommunityIcons name="send" size={24} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        marginRight: 16,
    },
    headerInfo: {
        flex: 1,
    },
    headerName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerStatus: {
        fontSize: 12,
    },
    messagesList: {
        padding: 16,
        paddingBottom: 32,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        maxWidth: '80%',
    },
    ownMessage: {
        alignSelf: 'flex-end',
    },
    otherMessage: {
        alignSelf: 'flex-start',
    },
    avatarContainer: {
        marginRight: 8,
        marginTop: 4,
    },
    messageBubble: {
        padding: 12,
        borderRadius: 16,
    },
    messageText: {
        fontSize: 16,
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
        textAlign: 'right',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChatScreen;
