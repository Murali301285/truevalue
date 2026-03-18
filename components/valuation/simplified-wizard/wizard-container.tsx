"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { simplifiedValuationSchema, SimplifiedValuationFormData, STEPS } from "./schema";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Step1BusinessInfo } from "./steps/step1-business-info";
import { Step2ValueDrivers } from "./steps/step2-value-drivers";
import { Step3Review } from "./steps/step3-review";
import { Step4Report } from "./steps/step4-report";
import { ArrowRight, ArrowLeft, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "simplifiedValuationDraft";

export function SimplifiedWizardContainer({ industries = [] }: { industries?: any[] }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [valuationId, setValuationId] = useState<string | null>(null);

    const methods = useForm<SimplifiedValuationFormData>({
        resolver: zodResolver(simplifiedValuationSchema) as any,
        mode: "onChange",
        defaultValues: {
            sector: "",
            revenue: undefined,
        }
    });

    const { trigger, getValues, reset } = methods;

    // Load from LocalStorage
    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                reset(parsed);
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
        let valid = false;
        if (currentStep === 1) {
            valid = await trigger(["sector", "age", "revenue", "ebitda"]);
        } else if (currentStep === 2) {
            // Conditionally trigger profit margin if ebitda wasn't provided
            const ebitdaVal = getValues("ebitda");
            const fieldsToValidate: any[] = ["revenueGrowth", "businessStability"];
            if (!ebitdaVal || ebitdaVal <= 0) {
                fieldsToValidate.push("profitMargin");
            }
            valid = await trigger(fieldsToValidate);
        }

        if (valid) {
            setDirection(1);
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePaymentSuccess = (id: string) => {
        setValuationId(id);
        
        // Final transition to Step 4 (Report)
        setDirection(1);
        setCurrentStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevStep = () => {
        setDirection(-1);
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

    return (
        <FormProvider {...methods}>
            <div className="max-w-3xl mx-auto px-4 py-8">
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
                        <div className="flex items-center gap-2 text-xs text-brand-red font-medium">
                            {currentStep < 4 && <><Save className="w-4 h-4" /> Save & Exit</>}
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
                            {currentStep === 1 && <Step1BusinessInfo industries={industries} />}
                            {currentStep === 2 && <Step2ValueDrivers />}
                            {currentStep === 3 && <Step3Review onPaymentSuccess={handlePaymentSuccess} industries={industries} />}
                            {currentStep === 4 && <Step4Report valuationId={valuationId} industries={industries} />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Navigation */}
                {currentStep < 4 && (
                    <div className={`flex items-center py-6 border-t border-gray-100 ${currentStep === 3 ? 'justify-start' : 'justify-between'}`}>
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="text-gray-500 hover:text-gray-900"
                            type="button"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>

                        {currentStep < 3 && (
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
