const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
    console.log('--- Final Chat API Diagnosis ---');
    try {
        const user = await prisma.user.findFirst({ where: { isDeleted: false } });
        if (!user) return console.log('No users found.');

        console.log(`Testing with user: ${user.name} (${user.id})`);

        // Testing getMyChats logic with CORRECT names
        console.log('\nTesting getMyChats logic (aligned with controller)...');
        const chats = await prisma.chat.findMany({
            where: {
                participants: { // Now matches schema
                    some: { userId: user.id }
                }
            },
            include: {
                participants: { // Now matches schema
                    where: { userId: { not: user.id } },
                    include: {
                        user: { // Now matches schema
                            select: { id: true, name: true, role: true }
                        }
                    }
                },
                messages: { // Now matches schema
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });
        console.log(`Success: Found ${chats.length} chats.`);

        // Testing createChat logic
        const otherUser = await prisma.user.findFirst({
            where: { id: { not: user.id }, isDeleted: false }
        });

        if (otherUser) {
            console.log(`\nTesting creating chat between ${user.name} and ${otherUser.name}...`);
            const newChat = await prisma.chat.create({
                data: {
                    participants: {
                        create: [
                            { userId: user.id },
                            { userId: otherUser.id }
                        ]
                    }
                }
            });
            console.log('Success: Created chat with ID:', newChat.id);
        }

    } catch (error) {
        console.error('Diagnosis Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
