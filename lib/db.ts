import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

console.log("[DEBUG] Initializing Prisma Client...");
try {
    if (!globalForPrisma.prisma) {
        console.log("[DEBUG] Creating new PrismaClient instance");
    } else {
        console.log("[DEBUG] Using cached PrismaClient instance");
    }
} catch (e) {
    console.error("[DEBUG] Error checking global prisma:", e);
}

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["query"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
console.log("[DEBUG] Prisma configuration complete. Env:", process.env.NODE_ENV);
