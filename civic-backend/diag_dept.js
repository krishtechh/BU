require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing getDepartments logic...');
        const departments = await prisma.department.findMany({
            where: { isDeleted: false },
            include: {
                headOfDepartment: { select: { id: true, name: true } }
            }
        });
        console.log('Success! Departments found:', departments.length);
        console.log(JSON.stringify(departments, null, 2));
    } catch (e) {
        console.error('Error in getDepartments logic:');
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
