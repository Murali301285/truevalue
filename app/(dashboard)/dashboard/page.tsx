"use client";

import { StatsGrid, StatProps } from "@/components/valuation/stats-grid";
import { RecentValuationsTable } from "@/components/valuation/recent-valuations";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const stats: StatProps[] = [
        { label: "Total Valuations", value: 124, icon: FileText, trend: "+12% this month", trendColor: "text-green-500" },
        { label: "Pending Actions", value: 3, icon: Clock, trend: "2 drafts remaining", trendColor: "text-yellow-500" },
        { label: "Avg. Valuation", value: "₹ 4.2 Cr", icon: TrendingUp, trend: "+5% vs industry", trendColor: "text-green-500" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-end border-b border-gray-200 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-brand-red">
                        MyValue Dashboard
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Manage your business valuations and generate instant reports.
                    </p>
                </div>
                <Link href="/dashboard/new">
                    <Button className="bg-brand-red hover:bg-red-700 text-white shadow-lg shadow-red-900/20 transition-all hover:scale-105 active:scale-95">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Valuation
                    </Button>
                </Link>
            </div>

            <StatsGrid stats={stats} />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Recent Valuations</h2>
                    <Button variant="link" className="text-brand-red">View All</Button>
                </div>
                <RecentValuationsTable />
            </div>
        </div>
    );
}
