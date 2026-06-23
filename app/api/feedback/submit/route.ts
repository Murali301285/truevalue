import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const session = await auth();
        const userEmail = session?.user?.email || "anonymous";

        const { responses } = await req.json();

        if (!responses || typeof responses !== 'object') {
            return NextResponse.json({ error: "Invalid responses payload" }, { status: 400 });
        }

        const submission = await prisma.feedbackSubmission.create({
            data: {
                userEmail,
                responses
            }
        });

        return NextResponse.json({ success: true, id: submission.id }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
