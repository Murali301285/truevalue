"use client"

import { Activity, AlertTriangle, Heart } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PulseStripProps {
    sentiment: number;
    risk: boolean;
    pipeline: string;
}

export function PulseStrip({ sentiment, risk, pipeline }: PulseStripProps) {
    // 1. Sentiment Config
    const isHappy = sentiment >= 7;
    const isSad = sentiment <= 4;

    // 2. Pipeline Config
    const pipeColor = pipeline === 'GOOD' ? 'bg-emerald-500' : pipeline === 'NORMAL' ? 'bg-amber-500' : 'bg-red-500';

    return (
        <div className="flex items-center gap-4 bg-zinc-50/50 p-2 rounded-lg border border-zinc-100/50">
            <TooltipProvider delayDuration={200}>
                {/* Sentiment */}
                <Tooltip>
                    <TooltipTrigger>
                        <div className={`p-1.5 rounded-full ${isHappy ? 'bg-emerald-100 text-emerald-600' : isSad ? 'bg-red-100 text-red-600' : 'bg-zinc-100 text-zinc-500'}`}>
                            <Heart className={`w-4 h-4 ${isHappy ? 'fill-current animate-pulse' : ''}`} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent><p>Founder Sentiment: {sentiment}/10</p></TooltipContent>
                </Tooltip>

                {/* Risk Radar */}
                <div className="h-6 w-px bg-zinc-200"></div>
                <Tooltip>
                    <TooltipTrigger>
                        <div className="relative flex items-center justify-center w-8 h-8">
                            {risk ? (
                                <>
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <AlertTriangle className="relative w-4 h-4 text-red-600" />
                                </>
                            ) : (
                                <Activity className="w-4 h-4 text-zinc-300" />
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent><p>{risk ? 'Cash Shortage Risk Detected!' : 'No Immediate Risk'}</p></TooltipContent>
                </Tooltip>

                {/* Pipeline */}
                <div className="h-6 w-px bg-zinc-200"></div>
                <Tooltip>
                    <TooltipTrigger>
                        <div className="flex flex-col gap-1 items-center">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">Pipe</span>
                            <div className={`w-12 h-1.5 rounded-full ${pipeColor} shadow-sm`}></div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent><p>Sales Pipeline: {pipeline}</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}
