require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Fetching all departments raw...');
        // Use raw query to avoid Prisma enum validation
        const departments = await prisma.$queryRaw`SELECT id, name, categories FROM "Department"`;
        console.log(JSON.stringify(departments, null, 2));

        const allCategories = departments.flatMap(d => d.categories || []);
        const uniqueCategories = [...new Set(allCategories)];
        console.log('Unique categories in DB:', uniqueCategories);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
