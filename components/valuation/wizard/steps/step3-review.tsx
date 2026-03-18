"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/logic";
import { CreditCard, Lock, CheckCircle, Zap, FileCheck, ShieldCheck, HelpCircle, Phone, Mail, MessageCircle, ChevronDown, ChevronUp, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { saveValuation } from "@/app/actions/valuation";
import { useToast } from "@/components/ui/use-toast";

export function Step3Review({ onPaymentSuccess }: { onPaymentSuccess: (id: string) => void }) {
    const { getValues } = useFormContext();
    const values = getValues();
    const [isProcessing, setIsProcessing] = useState(false);

    const { toast } = useToast();

    const handlePayment = async () => {
        setIsProcessing(true);

        // Calculate estimated value locally for saving (matching logic in step4) or let server do it?
        // Logic: EV = (EBITDA * 4.5) - (Liabilities - Assets * 0.1)
        const ebitda = Number(values.ebitda || 0);
        const liabilities = Number(values.totalLiabilities || 0);
        const assets = Number(values.totalAssets || 0);
        let ev = (ebitda * 4.5) - (liabilities - (assets * 0.1));
        ev = ev > 0 ? ev : 0;

        const payload = {
            ...values,
            incorporationDate: values.incorporationDate ? new Date(values.incorporationDate) : null,
            estimatedValue: ev
        };

        // Simulate payment gateway delay
        setTimeout(async () => {
            const result = await saveValuation(payload);
            setIsProcessing(false);

            if (result.success) {
                toast({ title: "Success", description: "Payment successful. Generating report..." });
                onPaymentSuccess(result.id);
            } else {
                toast({ title: "Error", description: "Failed to save valuation data.", variant: "destructive" });
            }
        }, 2000);
    };

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
                            <span className="font-medium">{values.companyName}</span>
                            <span className="text-gray-500">Industry:</span>
                            <span className="font-medium">{values.industry}</span>
                            <span className="text-gray-500">Years:</span>
                            <span className="font-medium">{values.yearsInOperation}</span>
                            <span className="text-gray-500">Purpose:</span>
                            <span className="font-medium capitalize">{values.purpose}</span>
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
                            <span className="font-medium">{formatCurrency(values.revenue || 0)}</span>
                            <span className="text-gray-500">EBITDA:</span>
                            <span className="font-medium">{formatCurrency(values.ebitda || 0)}</span>
                            <span className="text-gray-500">Assets:</span>
                            <span className="font-medium">{formatCurrency(values.totalAssets || 0)}</span>
                            <span className="text-gray-500">Liabilities:</span>
                            <span className="font-medium">{formatCurrency(values.totalLiabilities || 0)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {/* Instant Valuation - Active */}
                <div className="relative bg-white rounded-xl border-2 border-brand-red/10 shadow-sm p-5 transition-all group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap className="w-16 h-16 text-brand-red" />
                    </div>
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 bg-red-50 rounded-lg">
                                <Zap className="w-5 h-5 text-brand-red" />
                            </div>
                            <div className="text-right">
                                <span className="text-xl font-bold text-zinc-900 block">₹499</span>
                                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Per Report</span>
                            </div>
                        </div>
                        <div className="mb-6 flex-grow">
                            <h3 className="font-semibold text-zinc-900 mb-1">Instant Valuation</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed">Automated enterprise value report with industry benchmarks.</p>
                        </div>

                        <Button disabled className="w-full bg-brand-red/10 text-brand-red border border-brand-red/20 font-medium">
                            Current Plan
                        </Button>
                    </div>
                </div>

                {/* Standard Valuation - Coming Soon */}
                <div className="relative bg-zinc-50 rounded-xl border border-zinc-200 p-5 opacity-70 cursor-not-allowed group hover:opacity-100 transition-opacity">
                    <div className="absolute top-3 right-3">
                        <span className="bg-zinc-200 text-zinc-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Coming Soon</span>
                    </div>
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 bg-zinc-100 rounded-lg grayscale">
                                <FileCheck className="w-5 h-5 text-zinc-600" />
                            </div>
                            <div className="text-right">
                                <span className="text-xl font-bold text-zinc-400 block">₹4,999</span>
                            </div>
                        </div>
                        <div className="mb-6 flex-grow">
                            <h3 className="font-semibold text-zinc-600 mb-1">Standard Tier</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">Includes document upload, OCR data extraction & analyst review.</p>
                        </div>
                        <Button variant="outline" disabled className="w-full bg-transparent border-zinc-200 text-zinc-400">
                            Not Available
                        </Button>
                    </div>
                </div>

                {/* Certified Valuation - Coming Soon */}
                <div className="relative bg-zinc-50 rounded-xl border border-zinc-200 p-5 opacity-70 cursor-not-allowed group hover:opacity-100 transition-opacity">
                    <div className="absolute top-3 right-3">
                        <span className="bg-zinc-200 text-zinc-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Coming Soon</span>
                    </div>
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 bg-zinc-100 rounded-lg grayscale">
                                <ShieldCheck className="w-5 h-5 text-zinc-600" />
                            </div>
                            <div className="text-right">
                                <span className="text-xl font-bold text-zinc-400 block">₹14,999</span>
                            </div>
                        </div>
                        <div className="mb-6 flex-grow">
                            <h3 className="font-semibold text-zinc-600 mb-1">Certified Tier</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">Comprehensive audit & official certification by analysts.</p>
                        </div>
                        <Button variant="outline" disabled className="w-full bg-transparent border-zinc-200 text-zinc-400">
                            Not Available
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Unlock Your Valuation Report</h3>
                        <p className="text-gray-500 text-sm mb-4">Get instant access to your enterprise value report with industry benchmarks.</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Lock className="w-3 h-3" /> Secure Payment via Razorpay
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
                            {isProcessing ? "Processing..." : "Pay Now & View Report"}
                        </Button>
                    </div>
                </div>
            </div>


        </motion.div>
    );
}
