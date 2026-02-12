"use client"

import { useState, useEffect } from "react"
import { format, getISOWeek, parseISO } from "date-fns" // Added date helpers
import { useToast } from "@/components/ui/use-toast"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { CurrencyInput } from "@/components/cash-flow/currency-input"
import { upsertWeeklyStat, getWeeklyStat, getPreviousWeekStat, getLatestWeeklyStat } from "@/app/actions/weekly-stats"
import { Calendar, Check, ChevronsUpDown, Loader2, Save, Send, Trash2, TrendingUp, TrendingDown, AlertTriangle, AlertCircle, ArrowRight, Building2, History, Users, Edit, Wallet, BarChart3, GitMerge, ClipboardList } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import confetti from "canvas-confetti" // Import confetti

interface WeeklyHealthPageProps {
    companies: any[];
}

export default function WeeklyHealthPage({ companies }: WeeklyHealthPageProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [latestStatDate, setLatestStatDate] = useState<string | null>(null);
    const [latestStatData, setLatestStatData] = useState<any>(null);

    // Derived Date State for Animation
    const dateObj = parseISO(selectedDate);
    const weekNumber = getISOWeek(dateObj);
    const monthYear = format(dateObj, "MMMM yyyy");

    // Form State
    const [formData, setFormData] = useState({
        cashInflow: 0,
        cashOutflow: 0,
        newOrders: 0,
        newCustomers: 0,
        receivablesOpen: 0, // Editable now
        receivablesCollected: 0,
        receivablesClosing: 0, // Calculated
        pipelineStatus: "NORMAL",
        assetUtilisation: 3,
        cashShortageRisk: false,
        cashShortageAmount: 0,
        people: { newHires: 0, resignations: 0, absenteeism: 0 },
        majorChallenges: ""
    })

    // Logic: Load Data
    useEffect(() => {
        if (selectedCompanyId) {
            fetchData();
        }
    }, [selectedCompanyId, selectedDate])

    const fetchData = async () => {
        setLoading(true);
        // 1. Try get existing
        const res = await getWeeklyStat(selectedCompanyId, selectedDate);
        if (res.success && res.data) {
            // Edit Mode
            const d = res.data;
            const rawPeople = d.peopleChanges ? (d.peopleChanges as any) : {};
            const p = { newHires: 0, resignations: 0, absenteeism: 0, ...rawPeople };
            setFormData({
                cashInflow: Number(d.cashInflow),
                cashOutflow: Number(d.cashOutflow),
                newOrders: Number(d.newOrders),
                newCustomers: d.newCustomers,
                receivablesOpen: Number(d.receivables) + Number(d.receivablesCollected),
                receivablesCollected: Number(d.receivablesCollected),
                receivablesClosing: Number(d.receivables),
                pipelineStatus: d.pipelineStatus,
                assetUtilisation: d.assetUtilisation,
                cashShortageRisk: d.cashShortageRisk,
                cashShortageAmount: d.cashShortageAmount ? Number(d.cashShortageAmount) : 0,
                people: p,
                majorChallenges: d.majorChallenges || ""
            })
        } else {
            // Create Mode: Try fetch previous for opening balances
            const prev = await getPreviousWeekStat(selectedCompanyId, selectedDate);
            const openRec = prev.success && prev.data ? Number(prev.data.receivables) : 0;
            setFormData(prev => ({ ...prev, receivablesOpen: openRec, receivablesCollected: 0, receivablesClosing: openRec, cashInflow: 0, cashOutflow: 0 }))
        }
        setLoading(false);
    }

    useEffect(() => {
        const fetchLatest = async () => {
            if (selectedCompanyId) {
                const res = await getLatestWeeklyStat(selectedCompanyId);
                if (res.success && res.data) {
                    setLatestStatDate(res.data.weekEnding);
                    setLatestStatData(res.data);
                } else {
                    setLatestStatDate(null);
                    setLatestStatData(null);
                }
            }
        };
        fetchLatest();
    }, [selectedCompanyId]);


    // Calc Logic: Closing Balance
    useEffect(() => {
        const closing = Math.max(0, formData.receivablesOpen - formData.receivablesCollected);
        setFormData(prev => ({ ...prev, receivablesClosing: closing }));
    }, [formData.receivablesOpen, formData.receivablesCollected])


    const handleSave = async () => {
        setLoading(true);
        const res = await upsertWeeklyStat({
            companyId: selectedCompanyId,
            weekEnding: selectedDate,
            ...formData,
            receivables: formData.receivablesClosing
        });

        if (res.success) {
            // WOW Feature: Confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#34d399', '#059669'] // Emerald shades
            });
            toast({ title: "Update Posted!", description: "Your weekly health check is saved." });
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
        setLoading(false);
    }



    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header with Animated Week Selector */}
            <div className="flex flex-col lg:flex-row justify-between gap-6 items-end border-b border-zinc-100 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                        Weekly Health Check
                    </h1>
                    <p className="text-zinc-500">Review key metrics and pulse for the week.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                        <SelectTrigger className="w-[240px] h-12 text-base bg-white shadow-sm border-zinc-200">
                            <SelectValue placeholder="Select Portfolio Company" />
                        </SelectTrigger>
                        <SelectContent>
                            {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 bg-white border-zinc-200 shadow-sm text-zinc-500 hover:text-emerald-600 hover:border-emerald-200"
                        onClick={() => router.push('/weekly-stats')}
                        title="View Historical Stats"
                    >
                        <History className="w-5 h-5" />
                    </Button>

                    {/* Animated Date Block */}
                    <div className="relative group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 blur-lg opacity-20 group-hover:opacity-30 transition-opacity rounded-xl"></div>
                        <div className="relative flex items-center bg-white border border-zinc-200 rounded-xl px-4 h-12 shadow-sm min-w-[200px] gap-3 overflow-hidden">
                            <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col justify-center animate-in slide-in-from-bottom-2 duration-300 key={selectedDate}">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-none">Week {weekNumber}</span>
                                <span className="text-sm font-bold text-zinc-800 leading-tight">{monthYear}</span>
                            </div>
                            {/* Hidden Input Overlay */}
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                                onClick={(e) => (e.currentTarget as any).showPicker()}
                                max={new Date().toISOString().split('T')[0]}
                                className="absolute inset-0 opacity-0 cursor-pointer z-50 h-full w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {!selectedCompanyId ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-400 bg-zinc-50/50 rounded-3xl border-2 border-dashed border-zinc-200 animate-pulse">
                    <Building2 className="w-16 h-16 mb-4 opacity-20" />
                    <p className="font-medium">Select a company above to begin.</p>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">

                    {/* Last Updated Info Banner */}
                    {latestStatDate && (
                        <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm text-zinc-600">
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-emerald-600" />
                                <span>
                                    Last updated on: <span className="font-semibold">{latestStatDate ? format(new Date(latestStatDate), 'dd MMM yyyy') : '-'}</span>
                                    (Week {latestStatDate ? getISOWeek(new Date(latestStatDate)) : '-'}, {latestStatDate ? new Date(latestStatDate).getFullYear() : '-'})
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-2"
                                onClick={() => {
                                    if (latestStatData) {
                                        setSelectedDate(new Date(latestStatData.weekEnding).toISOString().split('T')[0]);
                                        // The useEffect will trigger and load data, but let's ensure we are viewing that week
                                        toast({ title: "Loaded", description: "loaded previous submission." })
                                    }
                                }}
                            >
                                <Edit className="w-3 h-3" />
                                Edit Previous Data
                            </Button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* LEFT COLUMN: 40% Width (Hero, Asset, Receivables) */}
                        <div className="lg:col-span-5 space-y-6">

                            {/* 1. Dynamic Hero Card */}
                            <Card className="border-0 shadow-2xl bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900 text-white overflow-hidden relative transition-colors duration-1000">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"><Wallet className="w-4 h-4" /></div>
                                        <CardTitle className="text-sm font-semibold text-white/90">Financial Overview</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-1">
                                        <Label className="text-white/60 text-[10px] tracking-widest font-bold">Cash Inflow</Label>
                                        <CurrencyInput
                                            value={formData.cashInflow ?? 0}
                                            onValueChange={v => setFormData({ ...formData, cashInflow: Math.max(0, v || 0) })}
                                            className="bg-white/10 border-white/10 text-white text-3xl h-14 focus:ring-white/20 placeholder:text-white/20 font-light"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-white/60 text-[10px] tracking-widest font-bold">Cash Outflow</Label>
                                        <CurrencyInput
                                            value={formData.cashOutflow ?? 0}
                                            onValueChange={v => setFormData({ ...formData, cashOutflow: Math.max(0, v || 0) })}
                                            className="bg-white/10 border-white/10 text-white text-3xl h-14 focus:ring-white/20 placeholder:text-white/20 font-light"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1">

                                            <Label className="text-white/70 text-xs font-medium">New Orders</Label>
                                            <CurrencyInput
                                                value={formData.newOrders ?? 0}
                                                onValueChange={v => setFormData({ ...formData, newOrders: Math.max(0, v || 0) })}
                                                className="bg-white/5 border-white/10 text-white h-10 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-white/70 text-xs font-medium">New Customers</Label>
                                            <Input
                                                type="number"
                                                value={formData.newCustomers ?? 0}
                                                onChange={e => setFormData({ ...formData, newCustomers: Math.max(0, Number(e.target.value)) })}
                                                className="bg-white/5 border-white/10 text-white h-10 text-sm"
                                                min={0}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>


                            {/* 3. Receivables Card (Editable Open) */}
                            <Card className="bg-gradient-to-br from-emerald-950 to-teal-900 border-emerald-900/50 text-white shadow-lg flex-1">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-800/50 flex items-center justify-center text-emerald-100"><TrendingUp className="w-4 h-4" /></div>
                                        <CardTitle className="text-sm font-semibold text-emerald-100/90">Receivables</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="relative pl-6 border-l-2 border-emerald-800/50 space-y-6">
                                        {/* Opening */}
                                        <div className="relative">
                                            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-800 border-2 border-emerald-950"></div>
                                            <Label className="text-xs text-emerald-400/70 mb-1 block">Opening Balance</Label>
                                            <CurrencyInput
                                                value={formData.receivablesOpen ?? 0}
                                                onValueChange={v => setFormData({ ...formData, receivablesOpen: Math.max(0, v || 0) })}
                                                className="h-10 text-lg bg-emerald-900/30 border-emerald-800/50 text-white font-mono"
                                                placeholder="0"
                                            />
                                        </div>

                                        {/* Collected */}
                                        <div className="relative">
                                            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-emerald-950"></div>
                                            <Label className="text-xs text-emerald-400 mb-1 block">Collected</Label>
                                            <CurrencyInput
                                                value={formData.receivablesCollected ?? 0}
                                                onValueChange={v => setFormData({ ...formData, receivablesCollected: Math.max(0, v || 0) })}
                                                className="h-10 text-lg bg-emerald-900/30 border-emerald-800/50 text-emerald-300 font-mono"
                                                placeholder="0"
                                            />
                                        </div>

                                        {/* Closing */}
                                        <div className="relative">
                                            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-emerald-950"></div>
                                            <Label className="text-xs text-emerald-200/50 mb-1 block">Closing Balance</Label>
                                            <div className="h-12 flex items-center text-2xl font-mono text-white border-b border-emerald-800/50">
                                                ₹ {formData.receivablesClosing.toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT COLUMN: 60% Width */}
                        <div className="lg:col-span-7 space-y-6 flex flex-col">

                            {/* 1. Asset Utilization (Moved Back to Right) */}
                            <Card className="bg-white shadow-sm border-zinc-200 hover:shadow-md transition-shadow group">
                                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><BarChart3 className="w-4 h-4" /></div>
                                        <CardTitle className="text-sm font-semibold text-zinc-600">Asset Utilization</CardTitle>
                                    </div>
                                    <span className={`text-xl font-black ${formData.assetUtilisation >= 4 ? 'text-emerald-600' : formData.assetUtilisation <= 2 ? 'text-rose-500' : 'text-blue-500'}`}>
                                        {formData.assetUtilisation}/5
                                    </span>
                                </CardHeader>
                                <CardContent>
                                    <div className="py-4 px-2">
                                        <Slider
                                            defaultValue={[formData.assetUtilisation]}
                                            max={5}
                                            min={1}
                                            step={1}
                                            onValueChange={v => setFormData({ ...formData, assetUtilisation: v[0] })}
                                            className="cursor-pointer"
                                        />
                                        <div className="flex justify-between mt-3 text-xs font-medium text-zinc-400">
                                            <span>Poor</span>
                                            <span>Excellent</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 2. Pipeline & People (Side by Side) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Pipeline Toggle */}
                                <Card className="bg-white shadow-sm border-zinc-200 h-full flex flex-col">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><GitMerge className="w-4 h-4" /></div>
                                            <CardTitle className="text-sm font-semibold text-zinc-600">Sales Pipeline</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col justify-center">
                                        <div className="flex flex-col gap-2">
                                            {['LOW', 'NORMAL', 'GOOD'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => setFormData({ ...formData, pipelineStatus: status })}
                                                    className={`
                                                    relative w-full py-3 px-4 rounded-xl text-xs font-semibold transition-all duration-300 border
                                                    ${formData.pipelineStatus === status
                                                            ? (status === 'GOOD' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' :
                                                                status === 'NORMAL' ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' : 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm')
                                                            : 'bg-white text-zinc-500 border-transparent hover:bg-zinc-50'
                                                        }
                                                `}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>
                                                            {status === 'LOW' && 'Very Low'}
                                                            {status === 'NORMAL' && 'Normal Structure'}
                                                            {status === 'GOOD' && 'Healthy Pipeline'}
                                                        </span>
                                                        {formData.pipelineStatus === status && <div className={`w-2 h-2 rounded-full ${status === 'GOOD' ? 'bg-emerald-500' : status === 'NORMAL' ? 'bg-blue-500' : 'bg-rose-500'}`}></div>}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* People Stats */}
                                <Card className="bg-white shadow-sm border-zinc-200 h-full">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><Users className="w-4 h-4" /></div>
                                            <CardTitle className="text-sm font-semibold text-zinc-600">People Updates</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Hires */}
                                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Users className="w-4 h-4" /></div>
                                                <span className="text-sm font-medium text-zinc-600">New Hires</span>
                                            </div>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={formData.people.newHires ?? 0}
                                                onChange={e => setFormData({ ...formData, people: { ...formData.people, newHires: Math.max(0, Number(e.target.value)) } })}
                                                className="h-8 w-14 text-center font-bold"
                                            />
                                        </div>
                                        {/* Resignations */}
                                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600"><TrendingDown className="w-4 h-4" /></div>
                                                <span className="text-sm font-medium text-zinc-600">Resignations</span>
                                            </div>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={formData.people.resignations ?? 0}
                                                onChange={e => setFormData({ ...formData, people: { ...formData.people, resignations: Math.max(0, Number(e.target.value)) } })}
                                                className="h-8 w-14 text-center font-bold"
                                            />
                                        </div>
                                        {/* Absenteeism */}
                                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><AlertCircle className="w-4 h-4" /></div>
                                                <span className="text-sm font-medium text-zinc-600">Absenteeism</span>
                                            </div>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={formData.people.absenteeism ?? 0}
                                                onChange={e => setFormData({ ...formData, people: { ...formData.people, absenteeism: Math.max(0, Number(e.target.value)) } })}
                                                className="h-8 w-14 text-center font-bold"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* 3. Cash Shortage Risk */}
                            <Card className={`transition-all duration-500 overflow-hidden ${formData.cashShortageRisk ? 'bg-red-50 border-red-200 shadow-red-100' : 'bg-white border-zinc-200'}`}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${formData.cashShortageRisk ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-zinc-100 text-zinc-400'}`}>
                                                <AlertCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className={`font-semibold text-sm ${formData.cashShortageRisk ? 'text-red-900' : 'text-zinc-700'}`}>Cash Shortage Risk</div>
                                                <div className="text-xs text-zinc-500">Enable this if you foresee a shortfall this week.</div>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={formData.cashShortageRisk}
                                            onCheckedChange={c => setFormData({ ...formData, cashShortageRisk: c })}
                                            className="data-[state=checked]:bg-red-500"
                                        />
                                    </div>

                                    {formData.cashShortageRisk && (
                                        <div className="mt-6 ml-16 animate-in slide-in-from-top-4 fade-in duration-300">
                                            <Label className="text-xs text-red-600 font-semibold mb-2 block">Estimated Shortage Amount</Label>
                                            <CurrencyInput
                                                value={formData.cashShortageAmount ?? 0}
                                                onValueChange={v => setFormData({ ...formData, cashShortageAmount: Math.max(0, v || 0) })}
                                                className="bg-white border-red-200 focus:ring-red-200 text-red-600 text-xl font-bold h-12"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                        </div>

                        {/* BOTTOM FULL WIDTH SECTION: Challenges & Submit */}
                        <div className="lg:col-span-12 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                            <Card className="bg-white border-zinc-200 shadow-sm">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600"><ClipboardList className="w-4 h-4" /></div>
                                        <CardTitle className="text-sm font-semibold text-zinc-600">Major Challenges / Notes</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        value={formData.majorChallenges}
                                        onChange={e => setFormData({ ...formData, majorChallenges: e.target.value })}
                                        placeholder="Describe any critical blockers, operational issues, or wins for the week..."
                                        className="resize-none border-0 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-emerald-200 text-sm text-zinc-700 leading-relaxed min-h-[60px]"
                                        rows={2}
                                    />
                                </CardContent>
                            </Card>

                            <div className="flex justify-end">
                                <Button size="lg" onClick={handleSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-200 w-full sm:w-auto">
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Submit Weekly Update <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
