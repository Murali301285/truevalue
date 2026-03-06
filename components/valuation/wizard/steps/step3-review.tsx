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

export function Step3Review({ onPaymentSuccess }: { onPaymentSuccess: () => void }) {
    const { getValues } = useFormContext();
    const values = getValues();
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate payment gateway delay
        setTimeout(() => {
            setIsProcessing(false);
            onPaymentSuccess();
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

            <div className="mt-8">
                <h3 className="font-bold text-gray-900 mb-4 text-lg border-b pb-2">Selected Plan</h3>
                {values.tier === "express" && (
                    <div className="relative bg-white rounded-xl border-[3px] border-brand-red shadow-sm p-5 overflow-hidden max-w-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Zap className="w-16 h-16 text-brand-red" />
                        </div>
                        <div className="flex flex-col h-full relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-red-50 text-brand-red rounded-lg">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-extrabold text-zinc-900 block">₹499</span>
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Per Report</span>
                                </div>
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-bold text-zinc-900 text-lg mb-1">Express Tier</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">Automated enterprise value report with industry benchmarks.</p>
                            </div>
                        </div>
                    </div>
                )}

                {values.tier === "standard" && (
                    <div className="relative bg-white rounded-xl border-[3px] border-brand-red shadow-sm p-5 overflow-hidden max-w-sm">
                        <div className="flex flex-col h-full relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-red-50 text-brand-red rounded-lg">
                                    <FileCheck className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-extrabold text-zinc-900 block">₹4,999</span>
                                </div>
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-bold text-zinc-900 text-lg mb-1">Standard Tier</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">Includes document upload, OCR data extraction & analyst review.</p>
                            </div>
                        </div>
                    </div>
                )}

                {values.tier === "certified" && (
                    <div className="relative bg-white rounded-xl border-[3px] border-brand-red shadow-sm p-5 overflow-hidden max-w-sm">
                        <div className="flex flex-col h-full relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-red-50 text-brand-red rounded-lg">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-extrabold text-zinc-900 block">₹14,999</span>
                                </div>
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-bold text-zinc-900 text-lg mb-1">Certified Tier</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">Comprehensive audit, compliance checking & official certification.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Unlock Your Valuation Report</h3>
                        <p className="text-gray-500 text-sm mb-4">Complete your secure checkout to process the valuation and generate the report.</p>
                        <div className="flex items-center gap-2 text-xs text-brand-red font-semibold bg-red-50 w-fit px-3 py-1.5 rounded-full border border-red-100">
                            <Lock className="w-3.5 h-3.5" /> Secure Payment via Razorpay
                        </div>
                    </div>

                    <div className="text-center md:text-right shrink-0">
                        <p className="text-sm text-gray-500 font-medium mb-1">Total Payable</p>
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                            {values.tier === "standard" ? "₹4,999" : values.tier === "certified" ? "₹14,999" : "₹499"}
                        </h2>
                        <Button
                            size="lg"
                            className="w-full md:w-auto bg-brand-red hover:bg-[#8e161c] text-white font-bold text-base px-8 py-6 rounded-full shadow-xl shadow-red-900/20 active:scale-95 transition-transform"
                            onClick={handlePayment}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Processing Securely..." : "Pay Now & Continue"}
                        </Button>
                    </div>
                </div>
            </div>


        </motion.div>
    );
}
