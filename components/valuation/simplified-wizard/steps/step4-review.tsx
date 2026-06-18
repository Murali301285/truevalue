"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/logic";
import { Lock, Zap, FileCheck, ShieldCheck, Tag, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { saveValuation, calculateSimplifiedValuation } from "@/app/actions/valuation";
import { validateOfferCode } from "@/app/actions/offers";
import { getPricingPlans } from "@/app/actions/pricing";
import { SimplifiedValuationFormData } from "../schema";
import { calculateAdvancedValuation, cleanNumber } from "@/lib/valuationMath";
import { useSession } from "next-auth/react";

export function Step4Review({ onPaymentSuccess, industries }: { onPaymentSuccess: (id: string, calculatedEV: number) => void, industries: any[] }) {
    const { getValues } = useFormContext<SimplifiedValuationFormData>();
    const values = getValues();
    const [isProcessing, setIsProcessing] = useState(false);
    const [breakdown, setBreakdown] = useState<any>(null);
    const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(true);
    const { toast } = useToast();
    const { data: session } = useSession();

    // Offer Code State
    const [offerCodeInput, setOfferCodeInput] = useState("");
    const [isApplyingOffer, setIsApplyingOffer] = useState(false);
    const [appliedOffer, setAppliedOffer] = useState<{ discountAmount: number, finalAmount: number, offerId: string } | null>(null);
    const [offerError, setOfferError] = useState("");

    const [pricingPlan, setPricingPlan] = useState<any>(null);

    // Fetch Plan Details
    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const plans = await getPricingPlans();
                const expressPlan = plans.find((p: any) => p.name === "Express");
                if (expressPlan) setPricingPlan(expressPlan);
            } catch (err) {
                console.error("Failed to fetch plan", err);
            }
        };
        fetchPlan();
    }, []);

    // Price Math
    const basePrice = pricingPlan ? Math.round(Number(pricingPlan.price)) : 499;
    const discountAmount = appliedOffer ? Math.round(appliedOffer.discountAmount) : 0;
    const priceAfterDiscount = Math.max(0, basePrice - discountAmount);
    
    const taxPercentage = pricingPlan && pricingPlan.taxPercentage !== null && pricingPlan.taxPercentage !== undefined 
        ? Number(pricingPlan.taxPercentage) 
        : 18;
    const taxAmount = Math.round(priceAfterDiscount * (taxPercentage / 100));
    
    const otherChargesArray = Array.isArray(pricingPlan?.otherCharges) ? pricingPlan.otherCharges : [];
    const otherChargesTotal = Math.round(otherChargesArray.reduce((sum: number, c: any) => sum + Number(c.amount), 0));

    const finalPrice = priceAfterDiscount + taxAmount + otherChargesTotal;

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

    const handleApplyOffer = async () => {
        if (!offerCodeInput.trim()) return;
        setIsApplyingOffer(true);
        setOfferError("");
        
        try {
            const userEmail = session?.user?.email || "user@realsme.com";
            const res = await validateOfferCode(offerCodeInput, userEmail, "Express", basePrice);
            
            if (res.valid) {
                const roundedDiscount = Math.round(res.discountAmount!);
                setAppliedOffer({
                    discountAmount: roundedDiscount,
                    finalAmount: Math.max(0, basePrice - roundedDiscount), // just base - discount
                    offerId: res.offerId!
                });
                toast({ title: "Offer Applied!", description: `You saved ₹${roundedDiscount}` });
            } else {
                setOfferError(res.error || "Invalid code");
                setAppliedOffer(null);
            }
        } catch (e) {
            setOfferError("Something went wrong verifying the code.");
        } finally {
            setIsApplyingOffer(false);
        }
    };

    const handleRemoveOffer = () => {
        setAppliedOffer(null);
        setOfferCodeInput("");
        setOfferError("");
    };

    const handlePayment = async () => {
        setIsProcessing(true);

        const resultMath = calculateAdvancedValuation(values, industries);
        let ev = resultMath.midValue;
        if (cleanNumber(values.revenue) <= 0 && cleanNumber(values.ebitda) <= 0) {
            ev = 0; 
        }

        try {
            // 1. Save Valuation Draft
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

            if (!result.success || !result.id) {
                toast({ title: "Error", description: "Failed to save valuation data.", variant: "destructive" });
                setIsProcessing(false);
                return;
            }

            // 1.5 Handle 100% Discount Bypass
            if (finalPrice <= 0) {
                toast({ title: "Success", description: "Free plan claimed! Generating report..." });
                onPaymentSuccess(result.id as string, ev);
                return;
            }

            // 2. Create Razorpay Order
            const res = await fetch("/api/payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    amount: finalPrice, 
                    receipt: result.id,
                    offerId: appliedOffer?.offerId 
                }),
            });
            
            const order = await res.json();

            if (order.error) {
                toast({ title: "Error", description: "Failed to create payment order. Please try again.", variant: "destructive" });
                setIsProcessing(false);
                return;
            }

            // 3. Load Razorpay script dynamically
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            
            script.onload = () => {
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency,
                    name: "RealSME Valuation",
                    description: `Express Valuation Report`,
                    order_id: order.id,
                    handler: async function (response: any) {
                        try {
                            const verifyRes = await fetch("/api/payment/verify", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    amount: finalPrice,
                                    offerId: appliedOffer?.offerId,
                                    planName: "Express"
                                }),
                            });
                            
                            const verifyData = await verifyRes.json();
                            
                            if (verifyData.success) {
                                toast({ title: "Success", description: "Payment successful! Generating report..." });
                                onPaymentSuccess(result.id as string, ev);
                            } else {
                                toast({ title: "Verification Failed", description: "Payment could not be verified securely.", variant: "destructive" });
                                setIsProcessing(false);
                            }
                        } catch (err) {
                            console.error("Verification error:", err);
                            toast({ title: "Error", description: "An error occurred during verification.", variant: "destructive" });
                            setIsProcessing(false);
                        }
                    },
                    prefill: {
                        name: values.companyName || "User",
                        email: session?.user?.email || "test@example.com",
                        contact: "9999999999",
                    },
                    theme: {
                        color: "#a81b21",
                    },
                    modal: {
                        ondismiss: function() {
                            setIsProcessing(false);
                        }
                    }
                };

                const paymentObject = new (window as any).Razorpay(options);
                paymentObject.on('payment.failed', function (response: any){
                    toast({ title: "Payment Failed", description: response.error.description, variant: "destructive" });
                    setIsProcessing(false);
                });
                
                paymentObject.open();
            };
            
            script.onerror = () => {
                toast({ title: "Error", description: "Failed to load Razorpay SDK", variant: "destructive" });
                setIsProcessing(false);
            };

            document.body.appendChild(script);

        } catch (err) {
            console.error("Payment setup failed:", err);
            setIsProcessing(false);
            toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
        }
    };

    return (
        <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
        >
            {isApplyingOffer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-red mb-4"></div>
                        <p className="text-gray-700 font-medium">Please wait...</p>
                        <p className="text-sm text-gray-500">Applying promo code</p>
                    </div>
                </div>
            )}

            {isProcessing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-red mb-4"></div>
                        <p className="text-gray-700 font-medium">Please wait...</p>
                        <p className="text-sm text-gray-500">Processing your payment securely</p>
                    </div>
                </div>
            )}

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

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-8 space-y-6">
                <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">Unlock Your Valuation Report</h3>
                    <p className="text-gray-500 text-sm mb-4">Complete your secure checkout to process the valuation and generate the report.</p>
                    <div className="flex items-center gap-2 text-xs text-brand-red font-medium bg-red-50 w-fit px-3 py-1.5 rounded-full border border-red-100">
                        <Lock className="w-3.5 h-3.5" /> Secure Payment via Razorpay
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-6 border-t border-gray-200 pt-6">
                    {/* Offer Code Section */}
                    <div className="w-full md:w-1/2 max-w-sm space-y-2">
                        <label className="text-sm font-semibold flex items-center text-gray-700">
                            <Tag className="w-4 h-4 mr-1 text-brand-red" /> Have a promo code?
                        </label>
                        {!appliedOffer ? (
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Enter code" 
                                    className="uppercase bg-white" 
                                    value={offerCodeInput}
                                    onChange={(e) => setOfferCodeInput(e.target.value)}
                                />
                                <Button 
                                    variant="outline" 
                                    onClick={handleApplyOffer}
                                    disabled={isApplyingOffer || !offerCodeInput.trim()}
                                >
                                    {isApplyingOffer ? "..." : "Apply"}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2 rounded-md">
                                <div className="text-sm">
                                    <span className="font-bold text-emerald-700 mr-2">{offerCodeInput.toUpperCase()}</span>
                                    <span className="text-emerald-600">-₹{appliedOffer.discountAmount} applied</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleRemoveOffer} className="h-6 w-6 p-0 hover:bg-emerald-100 text-emerald-700">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                        {offerError && <p className="text-xs text-red-500 mt-1">{offerError}</p>}
                    </div>

                    <div className="w-full md:w-1/2 md:max-w-[280px]">
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Base Price</span>
                                <span>₹{basePrice}</span>
                            </div>
                            {appliedOffer && (
                                <div className="flex justify-between text-sm font-medium text-emerald-600">
                                    <span>Discount applied</span>
                                    <span>-₹{appliedOffer.discountAmount}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tax ({taxPercentage}%)</span>
                                <span>₹{taxAmount}</span>
                            </div>
                            {otherChargesTotal > 0 && (
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Other Charges</span>
                                    <span>₹{otherChargesTotal}</span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900 text-lg">
                                <span>Total Payable</span>
                                <span>₹{finalPrice}</span>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="w-full bg-brand-red hover:bg-red-700 text-white font-bold shadow-lg shadow-red-900/20 active:scale-95 transition-transform"
                            onClick={handlePayment}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Processing..." : finalPrice <= 0 ? "Claim Free Report" : "Pay Now & Continue"}
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
