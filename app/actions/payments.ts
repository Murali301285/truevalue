"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getPaymentHistory() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { error: "Unauthorized" };
        }

        const isAdmin = (session.user as any).role === "ADMIN";

        let transactions;

        if (isAdmin) {
            // Admin sees all transactions
            transactions = await prisma.paymentTransaction.findMany({
                include: {
                    order: true,
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        } else {
            // User sees only their transactions
            transactions = await prisma.paymentTransaction.findMany({
                where: {
                    order: {
                        userEmail: session.user.email
                    }
                },
                include: {
                    order: true,
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        }

        // Serialize Decimal objects
        return {
            success: true,
            data: transactions.map(t => ({
                id: t.id,
                razorpayPaymentId: t.razorpayPaymentId,
                amount: Number(t.amount),
                status: t.status,
                paymentMethod: t.paymentMethod,
                isRefunded: t.isRefunded,
                refundedAt: t.refundedAt ? t.refundedAt.toISOString() : null,
                refundReason: t.refundReason,
                createdAt: t.createdAt.toISOString(),
                order: {
                    userEmail: t.order.userEmail,
                    receipt: t.order.receipt // Valuation ID
                }
            }))
        };
    } catch (error) {
        console.error("Failed to fetch payment history:", error);
        return { error: "Internal Server Error" };
    }
}

export async function markPaymentAsRefunded(transactionId: string, reason: string) {
    try {
        const session = await auth();
        if ((session?.user as any)?.role !== "ADMIN") {
            return { error: "Unauthorized" };
        }

        await prisma.paymentTransaction.update({
            where: { id: transactionId },
            data: {
                isRefunded: true,
                status: "refunded",
                refundReason: reason,
                refundedAt: new Date(),
            }
        });

        revalidatePath("/payments");
        return { success: true };
    } catch (error) {
        console.error("Failed to mark refund:", error);
        return { error: "Internal Server Error" };
    }
}
