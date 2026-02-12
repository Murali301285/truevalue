
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // 1. Create Admin User
    const adminEmail = 'admin@myvalue.com';
    const adminPassword = await bcrypt.hash('123456', 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: adminPassword,
            role: 'ADMIN',
            isActive: true,
            name: 'Admin User'
        },
        create: {
            email: adminEmail,
            name: 'Admin User',
            password: adminPassword,
            role: 'ADMIN',
            isActive: true,
        },
    });

    console.log("Admin created:", admin.email);

    // 2. Create Standard User
    const userEmail = 'user@myvalue.com';
    const userPassword = await bcrypt.hash('123456', 10);

    const user = await prisma.user.upsert({
        where: { email: userEmail },
        update: {
            password: userPassword,
            role: 'USER',
            isActive: true,
            name: 'Standard User'
        },
        create: {
            email: userEmail,
            name: 'Standard User',
            password: userPassword,
            role: 'USER',
            isActive: true,
        },
    });

    console.log("User created:", user.email);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
