"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, TooltipProps } from "recharts"

const DATA = [
    { name: "TechStart", days: 28, fill: "#fbbf24" }, // Amber
    { name: "MfgCo", days: 22, fill: "#ef4444" },     // Red
    { name: "SoftCorp", days: 45, fill: "#10b981" },  // Green
    { name: "NewVent", days: 18, fill: "#ef4444" },   // Red
    { name: "GrowthCo", days: 38, fill: "#10b981" },  // Green
]

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-900 text-white text-xs p-2 rounded-md shadow-xl border border-zinc-800">
                <p className="font-bold mb-1">{label}</p>
                <p className="font-mono">Runway: {payload[0].value} days</p>
            </div>
        );
    }
    return null;
};

export function RunwayChart() {
    return (
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm mt-6">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-emerald-600">Average Runway Across Portfolio</h3>
                <p className="text-zinc-500 text-xs">Projected cash exhaustion dates based on current burn rate.</p>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DATA}>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}d`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5' }} />
                        <Bar
                            dataKey="days"
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                        // Fill is handled in data payload
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
