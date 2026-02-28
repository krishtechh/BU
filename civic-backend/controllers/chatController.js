const prisma = require('../config/db');

// Get all chats for the current user
exports.getMyChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: { userId }
        }
      },
      include: {
        participants: {
          where: {
            userId: { not: userId }
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                profilePicture: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                isSeen: false
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participants[0]?.user;
      return {
        chat_id: chat.id,
        updated_at: chat.updatedAt,
        other_user_id: otherParticipant?.id,
        full_name: otherParticipant?.name,
        user_type: otherParticipant?.role,
        profile_picture: otherParticipant?.profilePicture,
        last_message: chat.messages[0]?.content,
        last_message_time: chat.messages[0]?.createdAt,
        unread_count: chat._count.messages
      };
    });

    res.json(formattedChats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ success: false, message: "Error fetching chats", error: error.message });
  }
};

// Get messages for a specific chat
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    // Verify participation
    const participation = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: { chatId, userId }
      }
    });

    if (!participation) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark messages as seen if they weren't sent by current user
    await prisma.message.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        isSeen: false
      },
      data: { isSeen: true }
    });

    res.json(messages.map(m => ({
      id: m.id,
      chat_id: m.chatId,
      sender_id: m.senderId,
      sender_name: m.sender.name,
      content: m.content,
      is_seen: m.isSeen,
      created_at: m.createdAt
    })));
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Error fetching messages", error: error.message });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { chatId, content } = req.body;

    // Verify participation
    const participation = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: { chatId, userId: senderId }
      }
    });

    if (!participation) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId,
        content
      }
    });

    // Update chat timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    res.json({ success: true, messageId: message.id });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Error sending message", error: error.message });
  }
};

// Create a chat (if not exists)
exports.createChat = async (req, res) => {
  try {
    const myId = req.user.id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ success: false, message: "Recipient ID is required" });
    }

    // Check if chat already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: myId } } },
          { participants: { some: { userId: otherUserId } } }
        ]
      }
    });

    if (existingChat) {
      return res.json({ chatId: existingChat.id, alreadyExists: true });
    }

    // Create new chat with participants
    const newChat = await prisma.chat.create({
      data: {
        participants: {
          create: [
            { userId: myId },
            { userId: otherUserId }
          ]
        }
      }
    });

    res.json({ chatId: newChat.id, alreadyExists: false });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ success: false, message: "Error creating chat", error: error.message });
  }
};
