const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
    console.log('--- Chat API Diagnosis ---');
    try {
        // 1. Check if we can find any user to test with
        const user = await prisma.user.findFirst({
            where: { isDeleted: false }
        });

        if (!user) {
            console.log('No users found in database.');
            return;
        }

        console.log(`Testing with user: ${user.name} (${user.id})`);

        // 2. Try to fetch chats (simulating getMyChats logic)
        console.log('\nTesting getMyChats logic...');
        try {
            const chats = await prisma.chat.findMany({
                where: {
                    ChatParticipant: {
                        some: { userId: user.id }
                    }
                },
                include: {
                    ChatParticipant: {
                        where: {
                            userId: { not: user.id }
                        },
                        include: {
                            User: {
                                select: {
                                    id: true,
                                    name: true,
                                    role: true,
                                    profilePicture: true
                                }
                            }
                        }
                    },
                    Message: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                },
                orderBy: { updatedAt: 'desc' }
            });
            console.log(`Success: Found ${chats.length} chats.`);
        } catch (e) {
            console.error('Error in getMyChats logic:', e);
        }

        // 3. Try to create a dummy chat to see if ID generation/defaults work
        console.log('\nTesting createChat logic...');
        try {
            // Find another user
            const otherUser = await prisma.user.findFirst({
                where: { id: { not: user.id }, isDeleted: false }
            });

            if (otherUser) {
                console.log(`Trying to create chat between ${user.name} and ${otherUser.name}`);
                const newChat = await prisma.chat.create({
                    data: {
                        updatedAt: new Date(), // Manually adding it since @updatedAt might be missing
                        ChatParticipant: {
                            create: [
                                { userId: user.id },
                                { userId: otherUser.id }
                            ]
                        }
                    }
                });
                console.log('Success: Created chat with ID:', newChat.id);
            } else {
                console.log('No other user found to test chat creation.');
            }
        } catch (e) {
            console.error('Error in createChat logic:', e);
        }

    } catch (error) {
        console.error('General Diagnosis Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
