'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyHealthData } from "@/types/dashboard";
import { formatCurrency } from "@/lib/logic";
import { ArrowUpRight, TrendingDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { PulseStrip } from "./pulse-strip";
import { LiquidityGauge } from "./liquidity-gauge";
import { BurnDownChart } from "./burn-down-chart"; // Keeping trend chart

export function CompanyCard({ company }: { company: CompanyHealthData }) {
    // Traffic Light Logic (Light Theme)
    let statusColor = "bg-white border-zinc-200 shadow-sm";
    let statusBadge = "bg-zinc-100 text-zinc-600 border-zinc-200";
    let statusRing = "ring-zinc-100";

    if (company.realSmeIndex >= 70) {
        statusColor = "bg-white border-emerald-100 shadow-sm hover:border-emerald-300 hover:shadow-emerald-100/50";
        statusBadge = "bg-emerald-100 text-emerald-700 border-emerald-200";
        statusRing = "ring-emerald-50";
    } else if (company.realSmeIndex >= 40) {
        statusColor = "bg-white border-amber-100 shadow-sm hover:border-amber-300 hover:shadow-amber-100/50";
        statusBadge = "bg-amber-100 text-amber-700 border-amber-200";
        statusRing = "ring-amber-50";
    } else {
        statusColor = "bg-white border-red-100 shadow-sm hover:border-red-300 hover:shadow-red-100/50";
        statusBadge = "bg-red-100 text-red-700 border-red-200";
        statusRing = "ring-red-50";
    }

    const router = useRouter();

    return (
        <Card className={`transition-all duration-300 hover:-translate-y-1 ${statusColor} group relative overflow-hidden h-full flex flex-col`}>
            {/* Top Status Bar indicator */}
            <div className={`absolute top-0 left-0 w-full h-1 ${company.realSmeIndex >= 70 ? 'bg-emerald-500' :
                company.realSmeIndex >= 40 ? 'bg-amber-500' : 'bg-red-500'
                }`} />

            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold tracking-tight text-zinc-900 group-hover:text-black cursor-pointer" onClick={() => router.push(`/company/${company.id}`)}>
                        {company.name}
                    </CardTitle>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{company.industry}</p>
                </div>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 shadow-sm text-sm font-black ${statusBadge.replace('border-', '')} ${statusRing.replace('ring-', 'border-')}`}>
                    {company.realSmeIndex}
                </div>
            </CardHeader>

            <CardContent className="space-y-6 flex-1">

                {/* 1. Weekly Pulse */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-400 tracking-wider px-1">
                        <span>Weekly Pulse</span>
                        <span>{formatCurrency(company.burnRate)} <span className="font-normal text-zinc-300 lowercase">burn</span></span>
                    </div>
                    <PulseStrip
                        sentiment={company.sentiment}
                        risk={company.cashShortageRisk}
                        pipeline={company.pipelineStatus}
                    />
                </div>

                {/* 2. Monthly Deep Dive */}
                <div className="space-y-2 bg-zinc-50/50 p-3 rounded-xl border border-zinc-100/50">
                    <LiquidityGauge
                        cash={company.cashBalance}
                        payables={company.payables}
                        burnRate={company.burnRate}
                    />

                    {company.topExpense && (
                        <div className="pt-2 mt-2 border-t border-zinc-100 flex justify-between items-center text-xs">
                            <span className="text-zinc-500">Top Spend:</span>
                            <span className="font-medium text-zinc-800">{company.topExpense.name} <span className="text-zinc-400">({formatCurrency(company.topExpense.amount)})</span></span>
                        </div>
                    )}
                </div>

                {/* 3. Trend (Mini) */}
                <div className="hidden sm:block opacity-75 grayscale hover:grayscale-0 transition-all">
                    <div className="text-[9px] uppercase font-bold text-zinc-300 mb-1 px-1">6-Week Net Flow</div>
                    <BurnDownChart data={company.cashTrend} height={40} />
                </div>

                {/* Footer Action */}
                <div className="flex justify-end pt-2 border-t border-zinc-50 mt-auto">
                    <button
                        onClick={() => router.push(`/company/${company.id}`)}
                        className="text-xs flex items-center gap-1 text-zinc-500 hover:text-zinc-900 font-medium transition-colors"
                    >
                        Detailed View <ArrowUpRight className="w-3 h-3" />
                    </button>
                </div>

            </CardContent>
        </Card>
    );
}
