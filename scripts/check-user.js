
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function check() {
    const email = 'admin@myvalue.com';
    const plainPassword = '123456';

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log("User NOT FOUND:", email);
        return;
    }

    console.log("User FOUND:", user.email, "Role:", user.role);
    console.log("Stored Hash:", user.password);

    const match = await bcrypt.compare(plainPassword, user.password);
    console.log("Password Match:", match);
}

check()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
