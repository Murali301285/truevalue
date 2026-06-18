"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { simplifiedValuationSchema, SimplifiedValuationFormData, STEPS } from "./schema";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Step1CompanyProfile } from "./steps/step1-company-profile";
import { Step2BusinessDetails } from "./steps/step2-business-details";
import { Step3ValueDrivers } from "./steps/step3-value-drivers";
import { Step4Review } from "./steps/step4-review";
import { Step5Report } from "./steps/step5-report";
import { Step0PlanSelection } from "./steps/step0-plan-selection";
import { ArrowRight, ArrowLeft, Save, Calculator } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { calculateSimplifiedValuation } from "@/app/actions/valuation";

const STORAGE_KEY = "simplifiedValuationDraft";

export function SimplifiedWizardContainer({ industries = [] }: { industries?: any[] }) {
    const { data: session } = useSession();
    const userEmail = session?.user?.email || "guest";
    const userStorageKey = `${STORAGE_KEY}_${userEmail}`;

    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [valuationId, setValuationId] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [hasDraft, setHasDraft] = useState(false);
    const [draftDate, setDraftDate] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    
    // States for "View Calculation Math" in Step 5
    const [breakdown, setBreakdown] = useState<any>(null);
    const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false);
    
    const router = useRouter();
    const { toast } = useToast();

    const methods = useForm<SimplifiedValuationFormData>({
        resolver: zodResolver(simplifiedValuationSchema) as any,
        mode: "onChange",
        defaultValues: {
            companyName: "",
            sector: "",
            revenue: undefined,
            totalAssets: undefined,
            totalLiabilities: undefined,
        }
    });

    const { trigger, getValues, reset } = methods;

    // Fetch breakdown when we reach Step 5
    useEffect(() => {
        if (currentStep === 5) {
            const fetchBreakdown = async () => {
                setIsLoadingBreakdown(true);
                try {
                    const values = getValues();
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
        }
    }, [currentStep, getValues]);

    // Check for Draft quietly on Mount or User Change
    useEffect(() => {
        const savedData = localStorage.getItem(userStorageKey);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setHasDraft(true);
                if (parsed.timestamp) {
                    setDraftDate(new Date(parsed.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                    }));
                }
            } catch (e) {
                setHasDraft(false);
            }
        } else {
            setHasDraft(false);
            setDraftDate(null);
        }
    }, [userStorageKey]);

    // Manual Draft Load Hook
    const loadDraft = () => {
        const savedData = localStorage.getItem(userStorageKey);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.data) {
                    reset(parsed.data);
                } else {
                    reset(parsed); // backward compatibility
                }
                setSelectedPlan("Express"); // Automatically start the wizard
                toast({ title: "Draft Restored", description: "Your previous valuation answers have been loaded." });
            } catch (e) {
                console.error("Failed to load draft", e);
            }
        }
    };

    // Auto-Save
    useEffect(() => {
        const subscription = methods.watch((value) => {
            const saveObject = {
                data: value,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(userStorageKey, JSON.stringify(saveObject));
            setLastSaved(new Date());
        });
        return () => subscription.unsubscribe();
    }, [methods, userStorageKey]);

    // Manual Save Draft Hook
    const saveToDraft = () => {
        const currentData = getValues();
        const saveObject = {
            data: currentData,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(userStorageKey, JSON.stringify(saveObject));
        toast({ title: "Draft Explicitly Saved", description: "Navigating back to Dashboard." });
        router.push("/dashboard"); 
    };

    const nextStep = async () => {
        let valid = false;
        if (currentStep === 1) {
            // Trigger core validations for Company Profile
            valid = await trigger(["companyName", "sector"]);
        } else if (currentStep === 2) {
            // Trigger validations for Financials and Operations
            valid = await trigger(["revenue", "totalAssets", "totalLiabilities", "age"]);
        } else if (currentStep === 3) {
            // Conditionally trigger profit margin if ebitda wasn't provided
            const ebitdaVal = getValues("ebitda");
            const fieldsToValidate: any[] = ["revenueGrowth", "businessStability"];
            if (!ebitdaVal || ebitdaVal <= 0) {
                fieldsToValidate.push("profitMargin");
            }
            valid = await trigger(fieldsToValidate);
        } else {
            valid = true;
        }

        if (valid) {
            setDirection(1);
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePaymentSuccess = (id: string, calculatedEV: number) => {
        setValuationId(id);
        
        // Clear the draft from local storage upon successful completion
        localStorage.removeItem(userStorageKey);
        setHasDraft(false);

        // Final transition to Step 5 (Report)
        setDirection(1);
        setCurrentStep(5);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevStep = () => {
        setDirection(-1);
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

    // GATEKEEPER: Render Plan Selection if none is selected yet
    if (!selectedPlan) {
        return (
            <div className="min-h-screen py-10 px-4">
                <Step0PlanSelection 
                    onSelectPlan={(plan) => setSelectedPlan(plan)} 
                    hasDraft={hasDraft} 
                    draftDate={draftDate}
                    onLoadDraft={loadDraft} 
                    onClearDraft={() => {
                        localStorage.removeItem(userStorageKey);
                        setHasDraft(false);
                    }}
                />
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Progress Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-sm font-bold text-brand-red bg-red-50 px-2 py-1 rounded-md">
                                    Step {currentStep} of {STEPS.length}
                                </span>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {STEPS[currentStep - 1].title}
                                </h2>
                            </div>
                            <p className="text-sm text-gray-500 pl-1">
                                {STEPS[currentStep - 1].description}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium">
                            {currentStep < 5 && lastSaved && (
                                <span className="text-gray-400 italic">
                                    Draft auto-saved: {lastSaved.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                            {currentStep < 5 && (
                                <Button variant="ghost" className="text-brand-red hover:bg-red-50" onClick={saveToDraft}>
                                    <Save className="w-4 h-4 mr-2" /> Save & Exit
                                </Button>
                            )}
                            {currentStep === 5 && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:bg-gray-50 flex items-center gap-2">
                                            <Calculator className="w-4 h-4" /> View Calculation Math
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-bold text-gray-900 border-b pb-4 mb-4 flex items-center gap-2">
                                                <Calculator className="w-5 h-5 text-brand-red" /> Valuation Calculation Breakdown
                                            </DialogTitle>
                                        </DialogHeader>
                                        
                                        {breakdown ? (
                                            <div className="space-y-6 text-sm">
                                                <div className="space-y-2">
                                                    <h4 className="font-semibold text-gray-900">STEP 1 – Identify Metric</h4>
                                                    <p className="text-gray-600">Metric Type = <strong>{breakdown.metric}</strong></p>
                                                    <p className="text-gray-600">Metric Value = <strong>{breakdown.metricValue >= 10000000 ? `₹${(breakdown.metricValue / 10000000).toFixed(2)} Cr` : breakdown.metricValue >= 100000 ? `₹${(breakdown.metricValue / 100000).toFixed(2)} L` : `₹${breakdown.metricValue.toLocaleString('en-IN')}`}</strong></p>
                                                </div>

                                                <div className="space-y-2">
                                                    <h4 className="font-semibold text-gray-900">STEP 2 – Base Multiple</h4>
                                                    <p className="text-gray-600">Base Multiple = <strong>{breakdown.baseMultiple}x</strong> (Industry: {getValues().sector}, {breakdown.metric} column)</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <h4 className="font-semibold text-gray-900">STEP 3 – Calculate Adjustment Factors</h4>
                                                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                                                        <li>Growth Factor (GF): <strong>{breakdown.gf.toFixed(2)}</strong></li>
                                                        <li>Margin Factor (MF): <strong>{breakdown.mf.toFixed(2)}</strong></li>
                                                        <li>Risk Factor (RF): <strong>{breakdown.rf.toFixed(2)}</strong></li>
                                                        <li>Age Factor (AF): <strong>{breakdown.af.toFixed(2)}</strong></li>
                                                    </ul>
                                                </div>

                                                <div className="space-y-2">
                                                    <h4 className="font-semibold text-gray-900">STEP 4 – Calculate Adjusted Multiple</h4>
                                                    <p className="text-gray-600">
                                                        Adjusted Multiple = {breakdown.baseMultiple} × {breakdown.gf.toFixed(2)} × {breakdown.mf.toFixed(2)} × {breakdown.rf.toFixed(2)} × {breakdown.af.toFixed(2)}
                                                    </p>
                                                    <p className="text-gray-900 font-bold bg-gray-100 px-3 py-1.5 rounded inline-block">
                                                        Final Adjusted Multiple = {breakdown.adjustedMultiple}x
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <h4 className="font-semibold text-gray-900">STEP 5 – Calculate Valuation Range</h4>
                                                    <ul className="space-y-2 text-gray-700">
                                                        <li className="flex justify-between border-b border-gray-100 pb-1">
                                                            <span>Valuation Low <span className="text-gray-400 text-xs">(× 0.90)</span></span> 
                                                            <strong>{breakdown.valLow >= 10000000 ? `₹${(breakdown.valLow / 10000000).toFixed(2)} Cr` : breakdown.valLow >= 100000 ? `₹${(breakdown.valLow / 100000).toFixed(2)} L` : `₹${breakdown.valLow.toLocaleString('en-IN')}`}</strong>
                                                        </li>
                                                        <li className="flex justify-between border-b border-gray-100 pb-1 bg-brand-red/5 px-2 font-bold text-brand-red rounded">
                                                            <span>Valuation Mid <span className="text-brand-red/50 text-xs font-normal">(× 1.00)</span></span> 
                                                            <strong>{breakdown.valMid >= 10000000 ? `₹${(breakdown.valMid / 10000000).toFixed(2)} Cr` : breakdown.valMid >= 100000 ? `₹${(breakdown.valMid / 100000).toFixed(2)} L` : `₹${breakdown.valMid.toLocaleString('en-IN')}`}</strong>
                                                        </li>
                                                        <li className="flex justify-between border-b border-gray-100 pb-1">
                                                            <span>Valuation High <span className="text-gray-400 text-xs">(× 1.10)</span></span> 
                                                            <strong>{breakdown.valHigh >= 10000000 ? `₹${(breakdown.valHigh / 10000000).toFixed(2)} Cr` : breakdown.valHigh >= 100000 ? `₹${(breakdown.valHigh / 100000).toFixed(2)} L` : `₹${breakdown.valHigh.toLocaleString('en-IN')}`}</strong>
                                                        </li>
                                                    </ul>
                                                    {breakdown.ebitdaPenalty !== undefined && breakdown.ebitdaPenalty !== null && (
                                                        <div className="mt-3 bg-red-50/50 border border-red-100 rounded-lg p-3 space-y-1">
                                                            <h5 className="font-semibold text-brand-red text-xs">Operating Loss (Negative EBITDA) Penalty Applied</h5>
                                                            <p className="text-zinc-500 text-[11px] leading-relaxed">
                                                                Since the company operates at an operating loss, the base Revenue Valuation is adjusted downward by applying your sector's EBITDA multiple ({breakdown.adjustedEbitdaMultiple}x) directly to the EBITDA loss:
                                                            </p>
                                                            <div className="flex justify-between text-xs font-bold text-brand-red pt-1 border-t border-red-100/50">
                                                                <span>EBITDA Loss Penalty (EBITDA {breakdown.ebitdaVal >= 10000000 ? `₹${(breakdown.ebitdaVal / 10000000).toFixed(2)} Cr` : breakdown.ebitdaVal >= 100000 ? `₹${(breakdown.ebitdaVal / 100000).toFixed(2)} L` : `₹${breakdown.ebitdaVal.toLocaleString('en-IN')}`} × {breakdown.adjustedEbitdaMultiple}x)</span>
                                                                <span>-₹{Math.abs(breakdown.ebitdaPenalty) >= 10000000 ? `${(Math.abs(breakdown.ebitdaPenalty) / 10000000).toFixed(2)} Cr` : Math.abs(breakdown.ebitdaPenalty) >= 100000 ? `${(Math.abs(breakdown.ebitdaPenalty) / 100000).toFixed(2)} L` : Math.abs(breakdown.ebitdaPenalty).toLocaleString('en-IN')}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : breakdown === "error" ? (
                                            <div className="py-8 text-center text-brand-red font-medium">Failed to fetch calculation logic. Please ensure the backend is running and the database is configured.</div>
                                        ) : (
                                            <div className="py-8 text-center text-gray-500">Loading calculation data...</div>
                                        )}
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>
                    <Progress value={progress} className="h-2 bg-gray-100" />
                </div>

                {/* Step Content */}
                <div className="min-h-[400px] mb-8 relative overflow-hidden">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            initial={{ x: direction > 0 ? 50 : -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: direction > 0 ? -50 : 50, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            {currentStep === 1 && <Step1CompanyProfile industries={industries} />}
                            {currentStep === 2 && <Step2BusinessDetails />}
                            {currentStep === 3 && <Step3ValueDrivers />}
                            {currentStep === 4 && <Step4Review onPaymentSuccess={handlePaymentSuccess} industries={industries} />}
                            {currentStep === 5 && <Step5Report valuationId={valuationId} industries={industries} />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Navigation */}
                {currentStep < 5 && (
                    <div className={`flex items-center py-6 border-t border-gray-100 ${currentStep === 4 ? 'justify-start' : 'justify-between'}`}>
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="text-gray-500 hover:text-gray-900"
                            type="button"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>

                        {currentStep < 4 && (
                            <Button
                                onClick={nextStep}
                                className="bg-brand-red hover:bg-red-700 text-white min-w-[120px] cursor-pointer"
                                type="button"
                            >
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </FormProvider>
    );
}
