import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, mobileNumber } = body;

        // Basic validation
        if (!email || !password || !mobileNumber) {
            return NextResponse.json(
                { message: "Email, password, and mobile number are required" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 409 }
            );
        }

        // Check if phone exists
        const existingPhone = await prisma.user.findUnique({
            where: { mobileNumber },
        });

        if (existingPhone) {
            return NextResponse.json(
                { message: "User with this mobile number already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name: name || null,
                email,
                mobileNumber,
                password: hashedPassword,
                role: "USER",
            },
        });

        // Hide password hash from response
        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json(
            { message: "User created successfully", user: userWithoutPassword },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "An unexpected error occurred during registration" },
            { status: 500 }
        );
    }
}
