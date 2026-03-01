import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ChatService {
    constructor() {
        this.apiClient = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000,
        });

        // Add token interceptor
        this.apiClient.interceptors.request.use(
            async (config) => {
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
    }

    async getMyChats() {
        try {
            const response = await this.apiClient.get('/chat/my-chats');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Fetch chats error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch chats'
            };
        }
    }

    async getMessages(chatId) {
        try {
            const response = await this.apiClient.get(`/chat/${chatId}/messages`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Fetch messages error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch messages'
            };
        }
    }

    async sendMessage(chatId, content) {
        try {
            const response = await this.apiClient.post('/chat/message', { chatId, content });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Send message error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to send message'
            };
        }
    }

    async createChat(otherUserId) {
        try {
            const response = await this.apiClient.post('/chat/create', { otherUserId });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Create chat error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to start chat'
            };
        }
    }
}

export default new ChatService();
