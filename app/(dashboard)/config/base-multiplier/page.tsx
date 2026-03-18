import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BaseMultiplierTable } from "@/components/settings/base-multiplier-table";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export default async function BaseMultiplierPage() {
    // Fetch all active industries and include their base multiplier if it exists
    const industries = await prisma.industry.findMany({
        where: { status: true },
        // @ts-ignore - Prisma Client cache might be stale, suppresses never type
        include: { baseMultiplier: true },
        orderBy: { name: 'asc' } // Alphabetical order
    });

    const tableData = industries.map((ind: any) => ({
        industryId: ind.id,
        industryName: ind.name,
        revFrom: ind.baseMultiplier ? Number(ind.baseMultiplier.revMultipleFrom) : 0,
        revTo: ind.baseMultiplier ? Number(ind.baseMultiplier.revMultipleTo) : 0,
        ebitdaFrom: ind.baseMultiplier ? Number(ind.baseMultiplier.ebitdaMultipleFrom) : 0,
        ebitdaTo: ind.baseMultiplier ? Number(ind.baseMultiplier.ebitdaMultipleTo) : 0,
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Base Multipliers</h2>
                    <p className="text-muted-foreground mt-1">Configure revenue and EBITDA multiplier ranges for each active sector.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="bg-zinc-50 border-b border-zinc-100 pb-4">
                    <CardTitle className="text-lg">Sector Configuration</CardTitle>
                    <CardDescription>Changes made here are saved individually per row.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-0">
                    <BaseMultiplierTable initialData={tableData} />
                </CardContent>
            </Card>
        </div>
    );
}
