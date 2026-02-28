require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const sc = await prisma.user.count({ where: { role: { not: 'citizen' }, isDeleted: false } });
        const dc = await prisma.department.count({ where: { isDeleted: false } });
        const totalU = await prisma.user.count({ where: { isDeleted: false } });

        console.log(JSON.stringify({
            success: true,
            staffCount: sc,
            departmentCount: dc,
            totalUserCount: totalU
        }, null, 2));
    } catch (e) {
        console.log(JSON.stringify({ success: false, error: e.stack }, null, 2));
    } finally {
        await prisma.$disconnect();
    }
}

main();
