"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Search, ArrowLeft } from "lucide-react"
import { PowerTable } from "@/components/ui/power-table"
import { getWeeklyStatsHistory } from "@/app/actions/weekly-stats"
import { getCompanies } from "@/app/actions/company"
import { format } from "date-fns"
import { useRouter } from 'next/navigation'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    ComposedChart
} from 'recharts';

export default function WeeklyStatsAnalyticsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState<any[]>([]);
    const [stats, setStats] = useState<any[]>([]);

    // Filters
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("ALL");
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");

    // Initial Load (Companies)
    useEffect(() => {
        const loadCompanies = async () => {
            const data = await getCompanies();
            setCompanies(data);
        };
        loadCompanies();
    }, []);

    // Load Stats
    const loadStats = async () => {
        setLoading(true);
        try {
            const result = await getWeeklyStatsHistory({
                companyId: selectedCompanyId,
                fromDate: fromDate ? new Date(fromDate) : undefined,
                toDate: toDate ? new Date(toDate) : undefined
            });

            if (result.success && result.data) {
                setStats(result.data);
            } else {
                setStats([]);
            }
        } catch (error) {
            console.error("Failed to load stats", error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-load on mount or filter change? Let's do explicit filtering per user request ("show button")
    // But maybe auto-load initially to show something.
    useEffect(() => {
        loadStats();
    }, []); // Run once on mount with default filters (ALL)

    // Tabular Columns
    const columns = [
        {
            header: "Week Ending",
            accessorKey: (item: any) => format(new Date(item.weekEnding), 'dd MMM yyyy'),
            className: "min-w-[150px] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
        },
        {
            header: "Company",
            accessorKey: "companyName",
            className: "min-w-[200px] sticky left-[150px] bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
        },
        // Financials
        { header: "Inflow", accessorKey: (item: any) => `₹${item.cashInflow.toLocaleString()}`, className: "text-right font-mono text-emerald-600 min-w-[120px]" },
        { header: "Outflow", accessorKey: (item: any) => `₹${item.cashOutflow.toLocaleString()}`, className: "text-right font-mono text-red-600 min-w-[120px]" },
        { header: "Net Cash", accessorKey: (item: any) => `₹${(item.cashInflow - item.cashOutflow).toLocaleString()}`, className: "text-right font-mono font-bold min-w-[120px]" },

        // Receivables
        { header: "Rec. Opening", accessorKey: (item: any) => `₹${(item.receivables - item.receivablesCollected).toLocaleString()}`, className: "text-right font-mono min-w-[120px] text-zinc-500" }, // Approx
        { header: "Collected", accessorKey: (item: any) => `₹${item.receivablesCollected.toLocaleString()}`, className: "text-right font-mono text-emerald-600 min-w-[120px]" },
        { header: "Rec. Closing", accessorKey: (item: any) => `₹${item.receivables.toLocaleString()}`, className: "text-right font-mono font-bold min-w-[120px]" },

        // Growth
        { header: "New Orders", accessorKey: (item: any) => `₹${item.newOrders.toLocaleString()}`, className: "text-right font-mono min-w-[120px]" },
        { header: "New Cust.", accessorKey: "newCustomers", className: "text-center min-w-[100px]" },
        { header: "Pipeline", accessorKey: "pipelineStatus", className: "min-w-[100px]" },

        // Ops & People
        { header: "Asset Util.", accessorKey: "assetUtilisation", className: "text-center min-w-[100px]" },
        { header: "Sentiment", accessorKey: "sentiment", className: "text-center min-w-[100px]" },
        { header: "Hires", accessorKey: (item: any) => item.peopleChanges?.newHires || 0, className: "text-center min-w-[80px]" },
        { header: "Resign.", accessorKey: (item: any) => item.peopleChanges?.resignations || 0, className: "text-center min-w-[80px]" },

        // Notes
        { header: "Challenges", accessorKey: (item: any) => item.majorChallenges ? item.majorChallenges.substring(0, 30) + '...' : '-', className: "min-w-[250px] text-xs text-zinc-500 truncate" },
    ];

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-zinc-100">
                    <ArrowLeft className="w-5 h-5 text-zinc-600" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-800 tracking-tight">Weekly Stats Analytics</h1>
                    <p className="text-zinc-500">Historical performance and comparative insights</p>
                </div>
            </div>

            {/* Filters Card */}
            <Card className="bg-white border-zinc-200 shadow-sm">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="space-y-2">
                            <Label>Company</Label>
                            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Company" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Companies (Portfolio)</SelectItem>
                                    {companies.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>From Week</Label>
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={e => setFromDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>To Week</Label>
                            <Input
                                type="date"
                                value={toDate}
                                onChange={e => setToDate(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={loadStats}
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Show Stats
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Areas */}
            <Tabs defaultValue="tabular" className="space-y-6">
                <TabsList className="bg-zinc-100 p-1 rounded-lg">
                    <TabsTrigger value="tabular" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Tabular Data</TabsTrigger>
                    <TabsTrigger value="graphical" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Graphical Comparison</TabsTrigger>
                </TabsList>

                {/* Tabular View */}
                <TabsContent value="tabular" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="border-zinc-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-zinc-700">Detailed Data Points</CardTitle>
                            <CardDescription>Exportable list of all weekly submissions in range.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PowerTable
                                data={stats}
                                columns={columns}
                                searchKey="companyName"
                                actionColumn={false}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Graphical View */}
                <TabsContent value="graphical" className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">

                    {/* Chart Row 1: Financials */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="border-zinc-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-zinc-600">Cash Flow Trends (Inflow vs Outflow)</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="weekEnding"
                                            tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                                            fontSize={12}
                                            tickMargin={10}
                                        />
                                        <YAxis fontSize={12} tickFormatter={(val) => `₹${val / 1000}k`} />
                                        <Tooltip
                                            formatter={(value: any) => [`₹${(Number(value) || 0).toLocaleString()}`, ""]}
                                            labelFormatter={(label) => format(new Date(label), 'dd MMM yyyy')}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="cashInflow" name="Cash Inflow" fill="#059669" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="cashOutflow" name="Cash Outflow" fill="#dc2626" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="border-zinc-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-zinc-600">Receivables Closing Balance</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="colorReceivables" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#059669" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="weekEnding"
                                            tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                                            fontSize={12}
                                            tickMargin={10}
                                        />
                                        <YAxis fontSize={12} tickFormatter={(val) => `₹${val / 1000}k`} />
                                        <Tooltip
                                            formatter={(value: any) => [`₹${(Number(value) || 0).toLocaleString()}`, "Receivables"]}
                                            labelFormatter={(label) => format(new Date(label), 'dd MMM yyyy')}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="receivables" stroke="#059669" fillOpacity={1} fill="url(#colorReceivables)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chart Row 2: Operational */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="border-zinc-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-zinc-600">Asset Utilization & Sentiment</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="weekEnding"
                                            tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                                            fontSize={12}
                                            tickMargin={10}
                                        />
                                        <YAxis domain={[0, 10]} fontSize={12} />
                                        <Tooltip
                                            labelFormatter={(label) => format(new Date(label), 'dd MMM yyyy')}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="assetUtilisation" name="Asset Utilization (1-5)" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="sentiment" name="Sentiment (1-10)" stroke="#9333ea" strokeWidth={2} dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                </TabsContent>
            </Tabs>
        </div>
    )
}
