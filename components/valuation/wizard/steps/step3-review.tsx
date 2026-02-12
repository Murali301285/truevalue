"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/logic";
import { CreditCard, Lock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Label } from "@/components/ui/label";

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
