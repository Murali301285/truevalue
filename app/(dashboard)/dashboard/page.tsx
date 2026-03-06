"use client";

import { ValuationHistory } from "@/components/dashboard/valuation-history";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-1">
                        My Dashboard
                    </h1>
                    <p className="text-zinc-500">Manage your valuation requests and download reports.</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200">
                        Active Plan: Free Tier
                    </span>
                    <Link href="/dashboard/new">
                        <Button className="bg-brand-red hover:bg-red-700 text-white shadow-lg shadow-red-900/20 transition-all hover:scale-105 active:scale-95">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Valuation
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Valuation History Table */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ValuationHistory />
            </div>
        </div>
    );
}
