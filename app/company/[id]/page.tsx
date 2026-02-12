import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CashFlowForm } from "@/components/company/cash-flow-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getTransactions } from "@/app/actions/cash-flow";
import { formatCurrency } from "@/lib/logic";

async function getCompany(id: string) {
    // Use Prisma to get real company
    const company = await prisma.company.findUnique({ where: { id } });

    if (!company) {
        // Fallback for demo ID "1" if DB is empty
        if (id === "1") return { id: "1", name: "TechFlow Solutions", industry: "SaaS" };
        return null;
    }
    return company;
}

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
    const company = await getCompany(params.id);

    // Fetch real transactions
    const transactions = await getTransactions(params.id);

    if (!company) {
        return <div className="p-10 text-center">Company not found. <Link href="/" className="text-emerald-600 underline">Go Back</Link></div>;
    }

    return (
        <div className="container mx-auto py-6 space-y-8">

            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/">
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-zinc-200 hover:bg-zinc-100">
                        <ArrowLeft className="h-5 w-5 text-zinc-600" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">{company.name}</h1>
                    <p className="text-zinc-500 font-medium">{company.industry} &bull; Health Dashboard</p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <div className="border-b border-zinc-200">
                    <TabsList className="bg-transparent h-12 p-0 space-x-8">
                        <TabsTrigger
                            value="overview"
                            className="px-0 h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none bg-transparent"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="cash-flow"
                            className="px-0 h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none bg-transparent"
                        >
                            Cash Flow Engine
                        </TabsTrigger>
                        <TabsTrigger
                            value="settings"
                            className="px-0 h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none bg-transparent"
                        >
                            Settings
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="py-4">
                    <div className="bg-zinc-50 border border-zinc-200 border-dashed rounded-xl h-64 flex items-center justify-center text-zinc-400">
                        Overview Widgets (Coming Soon)
                    </div>
                </TabsContent>

                <TabsContent value="cash-flow" className="py-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Col: Entry Form */}
                        <div className="lg:col-span-1">
                            <CashFlowForm companyId={company.id} />
                        </div>

                        {/* Right Col: Analytics & Table */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                                <h3 className="font-bold text-lg mb-4 text-zinc-900">Recent Transactions</h3>
                                <div className="border border-zinc-100 rounded-lg overflow-hidden">
                                    {transactions.length === 0 ? (
                                        <p className="p-8 text-center text-zinc-400 text-sm">No transactions logged yet.</p>
                                    ) : (
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-zinc-50 text-zinc-500">
                                                <tr>
                                                    <th className="p-3 font-medium">Date</th>
                                                    <th className="p-3 font-medium">Description</th>
                                                    <th className="p-3 font-medium">Category</th>
                                                    <th className="p-3 font-medium text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100">
                                                {transactions.map((tx) => (
                                                    <tr key={tx.id}>
                                                        <td className="p-3 text-zinc-600">{new Date(tx.date).toLocaleDateString('en-IN')}</td>
                                                        <td className="p-3 font-medium text-zinc-900">{tx.description}</td>
                                                        <td className="p-3"><span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded text-xs border border-zinc-200 uppercase">{tx.category}</span></td>
                                                        <td className={`p-3 text-right font-bold ${tx.type === 'INFLOW' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                            {tx.type === 'INFLOW' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                                <h3 className="font-bold text-lg mb-4 text-zinc-900">Cash Flow Trend</h3>
                                <div className="h-64 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400">
                                    Recharts Line Chart Placeholder
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="settings">
                    <p className="text-zinc-500">Settings panel.</p>
                </TabsContent>
            </Tabs>
        </div>
    );
}
