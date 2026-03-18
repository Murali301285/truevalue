import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { SimplifiedValuationFormData } from "../schema";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateSimplifiedValuation } from "@/app/actions/valuation";

export function Step3Estimate() {
    const { getValues } = useFormContext<SimplifiedValuationFormData>();
    const [isCalculating, setIsCalculating] = useState(true);
    const [estimate, setEstimate] = useState<{ min: string, max: string, multMin: string, multMax: string, industryTypical: string, isUsingEbitda: boolean } | null>(null);

    useEffect(() => {
        let isMounted = true;
        setIsCalculating(true);

        async function fetchEstimate() {
            try {
                const data = getValues();
                const result = await calculateSimplifiedValuation(data);
                if (isMounted) {
                    setEstimate(result);
                    setIsCalculating(false);
                }
            } catch (error) {
                console.error("Failed to fetch estimate", error);
                if (isMounted) setIsCalculating(false);
            }
        }

        // Add a slight artificial delay for the "calculating" UX effect
        const timer = setTimeout(() => {
            fetchEstimate();
        }, 1500);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [getValues]);

    if (isCalculating) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-brand-red/20 rounded-full blur-xl animate-pulse"></div>
                    <Loader2 className="w-12 h-12 text-brand-red animate-spin relative" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Calculating your MyValue...</h3>
                <p className="text-gray-500 text-sm">Analyzing sector benchmarks and performance drivers</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center min-h-[300px] text-center">
            
            <div className="mb-4">
                <div className="inline-flex items-center justify-center p-3 bg-red-50 rounded-full text-brand-red mb-2">
                    <Sparkles className="w-8 h-8" />
                </div>
            </div>

            <Card className="w-full max-w-lg p-8 border-2 border-brand-red/20 shadow-lg bg-gradient-to-b from-white to-red-50/30">
                <div className="space-y-6">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">Estimated Business Value</p>
                        <div className="inline-block bg-brand-red text-white text-3xl sm:text-4xl font-bold py-4 px-8 rounded-full shadow-md">
                            ₹{estimate?.min} – ₹{estimate?.max}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <p className="text-base text-gray-700 font-medium">
                            Implied multiple: {estimate?.multMin}x – {estimate?.multMax}x {estimate?.isUsingEbitda ? 'EBITDA' : 'Revenue'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            (Industry typical: {estimate?.industryTypical} in India)
                        </p>
                    </div>
                </div>
            </Card>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                <Button variant="outline" className="w-full border-gray-300 text-gray-700 h-12">
                    Recalculate
                </Button>
                <Button className="w-full bg-brand-red hover:bg-red-700 text-white h-12 shadow-sm">
                    Get Detailed Report <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
