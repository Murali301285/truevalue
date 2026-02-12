'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card } from "@/components/ui/card";

type BurnDownChartProps = {
    data: { date: string; amount: number }[];
    height?: number;
};

export function BurnDownChart({ data, height = 120 }: BurnDownChartProps) {
    return (
        <div className="w-full mt-4" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <Card className="bg-zinc-950 border-zinc-800 p-2 text-xs shadow-xl">
                                        <p className="text-zinc-400 mb-1">{payload[0].payload.date}</p>
                                        <p className="text-emerald-400 font-bold font-mono">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(payload[0].value as number)}
                                        </p>
                                    </Card>
                                );
                            }
                            return null;
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorAmount)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
