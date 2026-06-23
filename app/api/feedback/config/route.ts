import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const fields = await prisma.feedbackField.findMany({
            orderBy: { order: "asc" }
        });

        // Seed initial fields if none exist
        if (fields.length === 0) {
            const defaultFields = [
                { label: "Ease of handling", type: "SLIDER", order: 1 },
                { label: "Financial metric collected", type: "SLIDER", order: 2 },
                { label: "Other Feedback or comments", type: "TEXT", order: 3 }
            ];

            await prisma.feedbackField.createMany({ data: defaultFields });
            const newFields = await prisma.feedbackField.findMany({ orderBy: { order: "asc" } });
            return NextResponse.json(newFields, { status: 200 });
        }

        return NextResponse.json(fields, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if ((session?.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { fields } = await req.json();

        await prisma.feedbackField.deleteMany();
        
        const mappedFields = fields.map((f: any, i: number) => ({
            label: f.label,
            type: f.type,
            isActive: f.isActive,
            order: i
        }));

        await prisma.feedbackField.createMany({ data: mappedFields });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
