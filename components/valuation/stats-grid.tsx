"use client";

import { LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/logic";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export interface StatProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendColor?: "text-green-500" | "text-red-500" | "text-yellow-500";
}

export function StatsGrid({ stats }: { stats: StatProps[] }) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="flex items-center p-6 space-x-4">
                            <div className="p-3 bg-red-50 rounded-full">
                                <stat.icon className="w-6 h-6 text-brand-red" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                                    {stat.trend && (
                                        <span className={`text-xs font-medium ${stat.trendColor || "text-green-500"}`}>
                                            {stat.trend}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
