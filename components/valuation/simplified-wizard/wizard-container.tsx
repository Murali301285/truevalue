"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { simplifiedValuationSchema, SimplifiedValuationFormData, STEPS } from "./schema";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Step1CompanyProfile } from "./steps/step1-company-profile";
import { Step2BusinessDetails } from "./steps/step2-business-details";
import { Step3ValueDrivers } from "./steps/step3-value-drivers";
import { Step4Review } from "./steps/step4-review";
import { Step5Report } from "./steps/step5-report";
import { Step0PlanSelection } from "./steps/step0-plan-selection";
import { ArrowRight, ArrowLeft, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const STORAGE_KEY = "simplifiedValuationDraft";

export function SimplifiedWizardContainer({ industries = [] }: { industries?: any[] }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [valuationId, setValuationId] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [hasDraft, setHasDraft] = useState(false);
    const [draftDate, setDraftDate] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    
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

    // Check for Draft quietly on Mount
    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
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
                // ignoring invalid json
            }
        }
    }, []);

    // Manual Draft Load Hook
    const loadDraft = () => {
        const savedData = localStorage.getItem(STORAGE_KEY);
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
            // Check if there's actually meaningful data (to prevent empty starting saves)
            const saveObject = {
                data: value,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saveObject));
            setLastSaved(new Date());
        });
        return () => subscription.unsubscribe();
    }, [methods]);

    // Manual Save Draft Hook
    const saveToDraft = () => {
        const currentData = getValues();
        const saveObject = {
            data: currentData,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveObject));
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
                        localStorage.removeItem(STORAGE_KEY);
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
                                className="bg-brand-red hover:bg-red-700 text-white min-w-[120px]"
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
