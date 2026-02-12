"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { valuationSchema, ValuationFormData, STEPS } from "./schema";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Step1CompanyInfo } from "./steps/step1-company-info";
import { Step2Financials } from "./steps/step2-financials";
import { Step3Review } from "./steps/step3-review";
import { Step4Report } from "./steps/step4-report";
import { ArrowRight, ArrowLeft, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const STORAGE_KEY = "valuationDraft";

export function WizardContainer() {
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0);

    const methods = useForm<ValuationFormData>({
        resolver: zodResolver(valuationSchema) as any,
        mode: "onChange",
        defaultValues: {
            companyName: "",
            industry: "",
            yearsInOperation: 0,
            purpose: "",
            revenue: 0,
            ebitda: 0,
            pat: 0,
            totalAssets: 0,
            totalLiabilities: 0
        }
    });

    const { trigger, getValues, reset, formState: { isValid } } = methods;

    // Load from LocalStorage
    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                reset(parsed);
                // toast({ title: "Draft Restored", description: "Previously saved progress loaded." });
            } catch (e) {
                console.error("Failed to load draft", e);
            }
        }
    }, [reset]);

    // Auto-Save
    useEffect(() => {
        const subscription = methods.watch((value) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        });
        return () => subscription.unsubscribe();
    }, [methods]);

    const nextStep = async () => {
        // Validate current step fields
        let valid = false;
        if (currentStep === 1) valid = await trigger(["companyName", "industry", "yearsInOperation", "purpose"]);
        if (currentStep === 2) valid = await trigger(["revenue", "ebitda", "pat", "totalAssets", "totalLiabilities"]);

        if (valid) {
            setDirection(1);
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
        }
    };

    const prevStep = () => {
        setDirection(-1);
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handlePaymentSuccess = () => {
        // Clear draft
        localStorage.removeItem(STORAGE_KEY);
        setDirection(1);
        setCurrentStep(4);
    };

    // Calculate progress percentage
    const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

    return (
        <FormProvider {...methods}>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Progress Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {STEPS[currentStep - 1].title}
                            </h2>
                            <p className="text-sm text-gray-500">Step {currentStep} of {STEPS.length}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Save className="w-3 h-3" /> Auto-saving...
                        </div>
                    </div>
                    <Progress value={progress} className="h-2" />
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
                            {currentStep === 1 && <Step1CompanyInfo />}
                            {currentStep === 2 && <Step2Financials />}
                            {currentStep === 3 && <Step3Review onPaymentSuccess={handlePaymentSuccess} />}
                            {currentStep === 4 && <Step4Report />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Navigation */}
                {currentStep < 4 && (
                    <div className="flex justify-between items-center py-6 border-t border-gray-100">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="text-gray-500 hover:text-gray-900"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>

                        {currentStep < 3 ? (
                            <Button
                                onClick={nextStep}
                                className="bg-brand-red hover:bg-red-700 text-white min-w-[120px]"
                            >
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : currentStep === 3 ? (
                            // Paid button in Step3 component handles transition
                            <></>
                        ) : null}
                    </div>
                )}
            </div>
        </FormProvider>
    );
}
