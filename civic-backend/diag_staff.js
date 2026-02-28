require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing getAllUsers for staff...');
        const users = await prisma.user.findMany({
            where: {
                isDeleted: false,
                role: { not: 'citizen' }
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                departmentName: true
            },
            orderBy: { createdAt: 'desc' }
        });
        console.log('Success! Staff found:', users.length);
        console.log(JSON.stringify(users, null, 2));
    } catch (e) {
        console.error('Error in getAllUsers logic:');
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
