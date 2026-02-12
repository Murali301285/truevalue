"use client"

import { formatCurrency } from "@/lib/logic"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface LiquidityGaugeProps {
    cash: number;
    payables: number;
    burnRate: number;
}

export function LiquidityGauge({ cash, payables, burnRate }: LiquidityGaugeProps) {
    const total = cash + payables;
    // Prevent div by zero
    const safeTotal = total || 1;

    const cashPct = (cash / safeTotal) * 100;
    const payablesPct = (payables / safeTotal) * 100;

    // Safety check: if payables > cash * 2, it's critical
    const isCritical = payables > cash;

    return (
        <div className="space-y-2 w-full">
            <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    Cash
                </span>
                <span className="flex items-center gap-1">
                    Payables
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                </span>
            </div>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden flex cursor-pointer">
                            <div style={{ width: `${cashPct}%` }} className="bg-gradient-to-r from-emerald-400 to-emerald-500 hover:opacity-90 transition-all"></div>
                            {/* Separator */}
                            <div className="w-0.5 h-full bg-transparent"></div>
                            <div style={{ width: `${payablesPct}%` }} className="bg-gradient-to-r from-rose-400 to-rose-500 hover:opacity-90 transition-all"></div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                        <p>Cash: {formatCurrency(cash)}</p>
                        <p>Payables: {formatCurrency(payables)}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <div className="flex justify-between text-xs font-mono font-semibold text-zinc-700">
                <span>{formatCurrency(cash)}</span>
                <span className={isCritical ? 'text-rose-600' : 'text-zinc-500'}>{formatCurrency(payables)}</span>
            </div>
        </div>
    )
}
