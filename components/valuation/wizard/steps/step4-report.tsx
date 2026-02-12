"use client";

import { useFormContext } from "react-hook-form";
import { formatCurrency } from "@/lib/logic";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Download, FileText, ArrowLeft, CheckCircle } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

export function Step4Report() {
    const { getValues } = useFormContext();
    const values = getValues();

    // Default Multiple
    const [multiple, setMultiple] = useState([4.5]);

    // State for animated value
    const [displayEV, setDisplayEV] = useState(0);

    // Core Logic: EV = (EBITDA * Multiple) - (Liabilities - Assets * 0.1)
    // Note: Assets * 0.1 is usually "Cash" proxy or similar in simplified models, sticking to prompt logic.
    // Prompt: EV = (EBITDA * Multiple) - (Liabilities - Assets * 0.1)
    const calculateEV = (mult: number) => {
        const ebitda = Number(values.ebitda || 0);
        const liabilities = Number(values.totalLiabilities || 0);
        const assets = Number(values.totalAssets || 0);

        let ev = (ebitda * mult) - (liabilities - (assets * 0.1));
        return ev > 0 ? ev : 0; // Ensure non-negative
    };

    const targetEV = calculateEV(multiple[0]);

    // CountUp Effect
    useEffect(() => {
        let start = 0;
        const end = targetEV;
        const duration = 1500; // 1.5s
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // EaseOutExpo or similar
            const ease = 1 - Math.pow(1 - progress, 3);

            const currentVal = start + (end - start) * ease;
            setDisplayEV(currentVal);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [targetEV]); // Re-run when targetEV changes (slider)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-10 text-center py-8"
        >
            <div className="flex flex-col items-center justify-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6"
                >
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Valuation Complete!</h2>
                <p className="text-gray-500">Based on your inputs and industry benchmarks.</p>
            </div>

            <div className="bg-brand-red/5 rounded-2xl p-8 md:p-12 border border-brand-red/10">
                <p className="text-sm uppercase tracking-widest text-brand-red font-bold mb-4">Estimated Enterprise Value</p>
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-2 font-mono">
                    {formatCurrency(displayEV)}
                </h1>
                <p className="text-xs text-gray-400 mt-4">*Indicative value. Specific deal terms may vary.</p>
            </div>

            <div className="max-w-xl mx-auto space-y-6">
                <div className="flex justify-between items-center text-sm font-medium">
                    <span>Conservative (3x)</span>
                    <span className="text-brand-red">EBITDA Multiple: {multiple[0]}x</span>
                    <span>Aggressive (10x)</span>
                </div>
                <Slider
                    value={multiple}
                    onValueChange={setMultiple}
                    min={3}
                    max={10}
                    step={0.1}
                    className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 text-center">
                    Adjust the slider to see how market sentiment affects your valuation.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                <Button variant="outline" className="border-gray-300">
                    <FileText className="mr-2 h-4 w-4" />
                    Preview Report
                </Button>
                <Button className="bg-brand-red hover:bg-red-700 text-white shadow-lg shadow-brand-red/20">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
            </div>

            <div className="pt-8 border-t border-gray-200">
                <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-brand-red flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
            </div>
        </motion.div>
    );
}
