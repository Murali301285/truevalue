
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'demo@realsme.com';
    console.log(`Cleaning up user: ${email}...`);

    try {
        // Use deleteMany to avoid reading the potenitally invalid record first
        const { count } = await prisma.user.deleteMany({
            where: { email },
        });

        console.log(`Deleted ${count} user(s).`);
    } catch (error) {
        console.error("Error cleaning up user:", error);
    }
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
