'use client';

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { calculateRunwayDays } from "@/lib/logic";
import { CompanyHealthData } from "@/types/dashboard";
import { ArrowRight, RefreshCcw } from "lucide-react";

type RunwaySimulatorProps = {
    data: CompanyHealthData;
};

export function RunwaySimulator({ data }: RunwaySimulatorProps) {
    const [collectionRate, setCollectionRate] = useState(0); // 0% to 100% of receivables

    // Simulated Cash = Current + (Receivables * Rate)
    const simulatedCash = data.cashBalance + (data.receivables * collectionRate / 100);
    const simulatedRunway = calculateRunwayDays(simulatedCash, data.burnRate);

    const runwayGain = simulatedRunway - data.runwayDays;

    return (
        <div className="bg-white/50 p-4 rounded-xl border border-zinc-200 space-y-4 shadow-sm">
            <div className="flex justify-between items-center bg-zinc-50 border border-zinc-100 p-2 rounded-lg">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">What-If Simulator</span>
                <button
                    onClick={() => setCollectionRate(0)}
                    className="text-zinc-400 hover:text-emerald-600 transition-colors"
                    title="Reset"
                >
                    <RefreshCcw className="w-3 h-3" />
                </button>
            </div>

            <div className="space-y-3">
                <label className="text-sm text-zinc-600 flex justify-between font-medium">
                    <span>Collect Receivables</span>
                    <span className="font-mono text-emerald-600 font-bold">{collectionRate}%</span>
                </label>
                <Slider
                    value={[collectionRate]}
                    max={100}
                    step={5}
                    onValueChange={(val) => setCollectionRate(val[0])}
                    className="cursor-col-resize"
                />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <div className="text-xs">
                    <p className="text-zinc-400 uppercase font-bold text-[10px]">Current</p>
                    <p className="text-zinc-900 font-mono text-lg">{data.runwayDays} days</p>
                </div>

                {runwayGain > 0 && (
                    <div className="flex flex-col items-center px-2 bg-emerald-50 rounded-md py-1">
                        <ArrowRight className="w-3 h-3 text-emerald-600" />
                        <span className="text-[10px] text-emerald-700 font-bold">+{runwayGain}d</span>
                    </div>
                )}

                <div className="text-xs text-right">
                    <p className="text-zinc-400 uppercase font-bold text-[10px]">Projected</p>
                    <p className={`font-mono text-lg font-bold ${runwayGain > 0 ? 'text-emerald-600' : 'text-zinc-500'}`}>
                        {simulatedRunway} days
                    </p>
                </div>
            </div>
        </div>
    );
}
