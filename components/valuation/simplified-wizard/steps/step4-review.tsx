"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/logic";
import { Lock, Zap, FileCheck, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { saveValuation, calculateSimplifiedValuation } from "@/app/actions/valuation";
import { SimplifiedValuationFormData } from "../schema";
import { calculateAdvancedValuation, cleanNumber } from "@/lib/valuationMath";

export function Step4Review({ onPaymentSuccess, industries }: { onPaymentSuccess: (id: string, calculatedEV: number) => void, industries: any[] }) {
    const { getValues } = useFormContext<SimplifiedValuationFormData>();
    const values = getValues();
    const [isProcessing, setIsProcessing] = useState(false);
    const [breakdown, setBreakdown] = useState<any>(null);
    const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchBreakdown = async () => {
            setIsLoadingBreakdown(true);
            try {
                const res = await calculateSimplifiedValuation({
                    sector: values.sector,
                    age: values.age,
                    revenue: Number(values.revenue) || 0,
                    ebitda: Number(values.ebitda) || 0,
                    revenueGrowth: values.revenueGrowth,
                    profitMargin: values.profitMargin,
                    businessStability: values.businessStability,
                    planName: "Express"
                });
                if (res.breakdown) {
                    setBreakdown(res.breakdown);
                } else {
                    setBreakdown("error");
                }
            } catch (err) {
                setBreakdown("error");
            } finally {
                setIsLoadingBreakdown(false);
            }
        };
        fetchBreakdown();
    }, [values]);

    const handlePayment = async () => {
        setIsProcessing(true);

        const resultMath = calculateAdvancedValuation(values, industries);
        let ev = resultMath.midValue;
        if (cleanNumber(values.revenue) <= 0 && cleanNumber(values.ebitda) <= 0) {
            ev = 0; 
        }

        try {
            const result = await saveValuation({
                companyName: values.companyName || "Draft Valuation",
                industry: values.sector || "Other",
                legalStructure: values.legalStructure || "SME",
                revenue: cleanNumber(values.revenue),
                ebitda: cleanNumber(values.ebitda),
                pat: 0,
                totalAssets: cleanNumber(values.totalAssets),
                totalLiabilities: cleanNumber(values.totalLiabilities),
                yearsInOperation: (values.age === "0-3" ? 2 : values.age === "3-7" ? 5 : 10),
                purpose: "Preliminary Estimate",
                estimatedValue: isNaN(ev) ? 0 : ev,
            });

            setIsProcessing(false);

            if (result.success) {
                toast({ title: "Success", description: "Payment successful. Generating report..." });
                onPaymentSuccess(result.id || "", ev);
            } else {
                toast({ title: "Error", description: "Failed to save valuation data.", variant: "destructive" });
            }
        } catch (err) {
            console.error("Payment save failed:", err);
            setIsProcessing(false);
            toast({ title: "Error", description: "Failed to save valuation data.", variant: "destructive" });
        }
    };

        // Formatter for large Indian currency logic (Cr / L)
        const formatIndianScale = (num: number) => {
            if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
            if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
            return `₹${num.toLocaleString('en-IN')}`;
        };

        const valResult = calculateAdvancedValuation(values, industries);

    return (
        <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
        >
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg text-brand-red">Company Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-gray-500">Name:</span>
                            <span className="font-medium">{values.companyName || <span className="text-gray-400 italic">Not Provided</span>}</span>
                            <span className="text-gray-500">Industry:</span>
                            <span className="font-medium">{values.sector}</span>
                            <span className="text-gray-500">Age Bracket:</span>
                            <span className="font-medium">{values.age} years</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg text-brand-red">Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-gray-500">Revenue:</span>
                            <span className="font-medium">{values.revenue !== undefined && values.revenue !== null ? formatCurrency(values.revenue) : <span className="text-gray-400 italic">N/A</span>}</span>
                            <span className="text-gray-500">EBITDA:</span>
                            <span className="font-medium">{values.ebitda !== undefined && values.ebitda !== null ? formatCurrency(values.ebitda) : <span className="text-gray-400 italic">N/A</span>}</span>
                            <span className="text-gray-500">Assets:</span>
                            <span className="font-medium">{values.totalAssets !== undefined && values.totalAssets !== null ? formatCurrency(values.totalAssets) : <span className="text-gray-400 italic">Not Provided</span>}</span>
                            <span className="text-gray-500">Liabilities:</span>
                            <span className="font-medium">{values.totalLiabilities !== undefined && values.totalLiabilities !== null ? formatCurrency(values.totalLiabilities) : <span className="text-gray-400 italic">Not Provided</span>}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>



            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900">Unlock Your Valuation Report</h3>
                        <p className="text-gray-500 text-sm mb-4">Complete your secure checkout to process the valuation and generate the report.</p>
                        <div className="flex items-center gap-2 text-xs text-brand-red font-medium bg-red-50 w-fit px-3 py-1.5 rounded-full border border-red-100">
                            <Lock className="w-3.5 h-3.5" /> Secure Payment via Razorpay
                        </div>
                    </div>

                    <div className="text-center md:text-right">
                        <p className="text-sm text-gray-500 mb-1">Total Payable</p>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">₹499</h2>
                        <Button
                            size="lg"
                            className="w-full md:w-auto bg-brand-red hover:bg-red-700 text-white font-bold shadow-lg shadow-red-900/20 active:scale-95 transition-transform"
                            onClick={handlePayment}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Processing..." : "Pay Now & Continue"}
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
