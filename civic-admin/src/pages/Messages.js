import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Divider,
  TextField,
  IconButton,
  Badge,
  CircularProgress,
  InputAdornment,
  alpha,
  useTheme
} from '@mui/material';
import {
  Send,
  Search,
  MoreVert,
  FiberManualRecord,
  DoneAll,
  EmojiEmotions,
  AttachFile,
  Chat as ChatIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://bu-backend-t0vl.onrender.com/api';

const Messages = () => {
  const theme = useTheme();
  const { user: currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 10000); // Poll for new chats/updates every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.chat_id);
      const interval = setInterval(() => fetchMessages(activeChat.chat_id), 3000); // Poll for messages every 3s
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/my-chats`, { withCredentials: true });
      setChats(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/${chatId}/messages`, { withCredentials: true });
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      await axios.post(
        `${API_BASE_URL}/chat/message`,
        {
          chatId: activeChat.chat_id,
          content: newMessage,
        },
        { withCredentials: true }
      );

      setNewMessage('');
      fetchMessages(activeChat.chat_id);
      fetchChats();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Search Users logic
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        // Fetch users to start chat (Citizens/Staff)
        // assuming we can fetch list of users
        const usersRes = await axios.get(`${API_BASE_URL}/users`, { withCredentials: true });
        if (usersRes.data && usersRes.data.data) {
          const filtered = usersRes.data.data.filter(
            (u) =>
              (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
              u.id !== currentUser.id
          );
          setSearchResults(filtered);
        }
      } catch (err) {
        console.error('Error searching users:', err);
      } finally {
        setSearching(false);
      }
    };

    const timer = setTimeout(searchUsers, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, currentUser.id]);

  const handleStartChat = async (otherUserId) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/chat/create`,
        { otherUserId },
        { withCredentials: true }
      );
      const { chatId } = res.data;
      setSearchQuery('');
      setSearchResults([]);
      await fetchChats();
      // Find the new chat in the updated list
      const newChat = chats.find(c => c.chat_id === chatId);
      if (newChat) setActiveChat(newChat);
    } catch (err) {
      console.error('Error creating chat:', err);
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', gap: 2 }}>
      {/* Sidebar - Chat List */}
      <Paper
        sx={{
          width: 350,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          overflow: 'hidden',
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Messages
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 10, bgcolor: alpha(theme.palette.primary.main, 0.05) }
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
          {searching ? (
            <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>
          ) : searchQuery && searchResults.length > 0 ? (
            <List>
              <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', fontWeight: 600 }}>SEARCH RESULTS</Typography>
              {searchResults.map((user) => (
                <ListItemButton key={user.id} onClick={() => handleStartChat(user.id)} sx={{ borderRadius: 2, mb: 0.5 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>{user.name?.charAt(0) || '?'}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={user.name} secondary={user.role} />
                </ListItemButton>
              ))}
              <Divider sx={{ my: 1 }} />
            </List>
          ) : null}

          <List sx={{ pt: 0 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
            ) : chats.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <ChatIcon sx={{ fontSize: 48, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
                <Typography color="text.secondary">No conversations yet</Typography>
              </Box>
            ) : (
              chats.map((chat) => (
                <ListItem
                  key={chat.chat_id}
                  disablePadding
                  component={motion.div}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ListItemButton
                    selected={activeChat?.chat_id === chat.chat_id}
                    onClick={() => setActiveChat(chat)}
                    sx={{
                      borderRadius: 3,
                      mb: 1,
                      mx: 0.5,
                      transition: 'all 0.2s',
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        color="success"
                      >
                        <Avatar
                          src={chat.profile_picture}
                          sx={{
                            bgcolor: theme.palette.secondary.main,
                            boxShadow: `0 4px 10px ${alpha(theme.palette.secondary.main, 0.3)}`
                          }}
                        >
                          {chat.full_name?.charAt(0) || '?'}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{chat.full_name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {chat.last_message_time ? new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{
                            maxWidth: 150,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: chat.unread_count > 0 ? 700 : 400,
                            color: chat.unread_count > 0 ? 'text.primary' : 'text.secondary'
                          }}>
                            {chat.last_message || 'No messages yet'}
                          </Typography>
                          {chat.unread_count > 0 && (
                            <Badge badgeContent={chat.unread_count} color="primary" sx={{
                              '& .MuiBadge-badge': {
                                height: 16,
                                minWidth: 16,
                                fontSize: '0.6rem',
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                              }
                            }} />
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Paper>

      {/* Main Chat Area */}
      <Paper
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          overflow: 'hidden',
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        {activeChat ? (
          <>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: alpha(theme.palette.background.default, 0.5) }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={activeChat.profile_picture} sx={{ bgcolor: theme.palette.secondary.main }}>{activeChat.full_name?.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{activeChat.full_name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FiberManualRecord sx={{ color: theme.palette.success.main, fontSize: 10 }} />
                    <Typography variant="caption" color="text.secondary">Online</Typography>
                  </Box>
                </Box>
              </Box>
              <Box>
                <IconButton><Search /></IconButton>
                <IconButton><MoreVert /></IconButton>
              </Box>
            </Box>

            {/* Messages Area */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <AnimatePresence initial={false}>
                {messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', mt: 10 }}>
                    <Typography color="text.secondary">Start the conversation with {activeChat.full_name}!</Typography>
                  </Box>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.sender_id === currentUser.id;
                    return (
                      <Box
                        key={msg.id}
                        component={motion.div}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        sx={{
                          alignSelf: isOwn ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isOwn ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            bgcolor: isOwn ? theme.palette.primary.main : alpha(theme.palette.background.default, 0.8),
                            color: isOwn ? theme.palette.primary.contrastText : 'text.primary',
                            boxShadow: isOwn ? `0 8px 20px ${alpha(theme.palette.primary.main, 0.2)}` : '0 4px 10px rgba(0,0,0,0.05)',
                            borderTopRightRadius: isOwn ? 0 : 3,
                            borderTopLeftRadius: !isOwn ? 0 : 3,
                            position: 'relative'
                          }}
                        >
                          <Typography variant="body2">{msg.content}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, px: 0.5 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                          {isOwn && (
                            <DoneAll sx={{ fontSize: 14, color: msg.is_seen ? theme.palette.primary.main : 'text.disabled' }} />
                          )}
                        </Box>
                      </Box>
                    );
                  })
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
              <form onSubmit={handleSendMessage}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton color="primary" size="small"><AttachFile /></IconButton>
                  <IconButton color="primary" size="small"><EmojiEmotions /></IconButton>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        bgcolor: theme.palette.background.paper,
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                      }
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': { bgcolor: theme.palette.primary.dark, transform: 'scale(1.1)' },
                      '&.Mui-disabled': { bgcolor: alpha(theme.palette.primary.main, 0.3) },
                      transition: 'all 0.2s'
                    }}
                  >
                    <Send fontSize="small" />
                  </IconButton>
                </Box>
              </form>
            </Box>
          </>
        ) : (
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center' }}>
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 4
                }}
              >
                <ChatIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />
              </Box>
            </motion.div>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Your Inbox</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
              Select a conversation or search for a citizen to start chatting and resolving issues in real-time.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Messages;
