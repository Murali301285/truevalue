import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const prisma = new PrismaClient();

export default async function FeedbacksPage() {
    const session = await auth();
    if ((session?.user as any)?.role !== 'ADMIN') {
        redirect("/dashboard");
    }

    const submissions = await prisma.feedbackSubmission.findMany({
        orderBy: { createdAt: "desc" },
    });

    const fields = await prisma.feedbackField.findMany({
        orderBy: { order: "asc" }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">User Feedbacks</h1>
                <p className="text-zinc-500">View feedback submitted via the chatbot widget.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Submissions</CardTitle>
                    <CardDescription>All feedback responses from users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">Date</TableHead>
                                    <TableHead>User</TableHead>
                                    {fields.map(f => (
                                        <TableHead key={f.id}>{f.label}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={fields.length + 2} className="text-center h-24 text-zinc-500">
                                            No feedback submissions yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    submissions.map((sub) => {
                                        const responses = sub.responses as any || {};
                                        return (
                                            <TableRow key={sub.id}>
                                                <TableCell className="font-medium whitespace-nowrap">
                                                    {sub.createdAt.toLocaleDateString()} {sub.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </TableCell>
                                                <TableCell>{sub.userEmail || "Anonymous"}</TableCell>
                                                {fields.map(f => (
                                                    <TableCell key={f.id}>
                                                        {f.type === "SLIDER" && (
                                                            <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 w-8 h-8 rounded-full font-bold text-sm">
                                                                {responses[f.id] || "-"}
                                                            </span>
                                                        )}
                                                        {f.type !== "SLIDER" && (
                                                            <span className="text-sm text-zinc-600 truncate max-w-[250px] inline-block" title={responses[f.id]}>
                                                                {responses[f.id] || "-"}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
