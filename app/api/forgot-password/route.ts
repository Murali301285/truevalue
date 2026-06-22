import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Return 200 even if user not found for security (prevent email enumeration)
            return NextResponse.json({ message: "If an account exists, a reset link has been sent." }, { status: 200 });
        }

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let newCount = 1;
        if (user.resetTokenDate && user.resetTokenDate >= startOfDay) {
            if (user.resetTokenCount >= 5) {
                return NextResponse.json({ message: "Maximum password reset requests reached for today. Please try again tomorrow." }, { status: 429 });
            }
            newCount = user.resetTokenCount + 1;
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
                resetTokenCount: newCount,
                resetTokenDate: now,
            },
        });

        const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

        await sendPasswordResetEmail(user.email, resetLink);

        return NextResponse.json({ message: "If an account exists, a reset link has been sent." }, { status: 200 });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
    }
}
