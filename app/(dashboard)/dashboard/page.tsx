"use client";

import { ValuationHistory, AdminKPICards, UserValuationHistory } from "@/components/dashboard/valuation-history";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getUserValuations } from "@/app/actions/valuation";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const isAdmin = (session?.user as any)?.role === 'ADMIN';
    const [valuations, setValuations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchValuations() {
            try {
                const data = await getUserValuations();
                setValuations(data);
            } catch (err) {
                console.error("Failed to load valuations:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchValuations();
    }, []);

    if (status === "loading" || isLoading) {
        return <div className="p-6 text-center text-zinc-500 animate-pulse mt-10">Loading Dashboard Data...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-1">
                        My Dashboard
                    </h1>
                    <p className="text-zinc-500">
                        {isAdmin ? "Admin overview and comprehensive report tracking." : "Manage your valuation requests and download reports."}
                    </p>
                </div>
                
                {/* Only Users can mint new valuations. Admins only view. */}
                {!isAdmin && (
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/new">
                            <motion.div
                                animate={{ scale: [1, 1.03, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Button className="bg-brand-red hover:bg-red-700 text-white shadow-lg shadow-red-900/20 px-8 py-6 text-lg rounded-xl font-bold">
                                    <PlusCircle className="mr-2 h-5 w-5" />
                                    New Valuation
                                </Button>
                            </motion.div>
                        </Link>
                    </div>
                )}
            </div>

            {/* Role Based Content Fork */}
            {isAdmin ? (
                <>
                    {/* Admin KPI Header */}
                    <AdminKPICards valuations={valuations} />

                    {/* Admin Hierarchical Valuation History Table */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ValuationHistory valuations={valuations} />
                    </div>
                </>
            ) : (
                <>
                    {/* Standard User Flat History Table */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <UserValuationHistory valuations={valuations} />
                    </div>
                </>
            )}
        </div>
    );
}
