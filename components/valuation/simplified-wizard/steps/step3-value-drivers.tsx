import { useFormContext } from "react-hook-form";
import { SimplifiedValuationFormData } from "../schema";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { TrendingUp, Percent, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

function ModernSlider({ 
    id, 
    value, 
    labels,
    onChange 
}: { 
    id: string, 
    value: string, 
    labels?: string[],
    onChange: (val: string) => void 
}) {
    const options = ["Low", "Medium", "High"];
    const currentIndex = options.indexOf(value || "");

    const getColorInfo = (val: string) => {
        if (val === "Low") return { bg: "bg-red-500", text: "text-red-700", ring: "ring-red-500/30" };
        if (val === "Medium") return { bg: "bg-amber-500", text: "text-amber-700", ring: "ring-amber-500/30" };
        if (val === "High") return { bg: "bg-emerald-500", text: "text-emerald-700", ring: "ring-emerald-500/30" };
        return { bg: "bg-gray-300", text: "text-gray-400", ring: "ring-transparent" };
    };

    const activeInfo = getColorInfo(value);

    return (
        <div className="relative pt-2 pb-7 w-full px-6 mt-2">
            <div className="relative flex justify-between items-center w-full z-10">
                {/* Track Background */}
                <div className="absolute top-1/2 left-4 right-4 h-3 -mt-1.5 bg-gray-100 rounded-full shadow-inner z-[-1]" />
                
                {/* Active Track Fill */}
                <div 
                    className={`absolute top-1/2 left-4 h-3 -mt-1.5 rounded-full transition-all duration-500 ease-out ${activeInfo.bg} z-[-1] shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]`} 
                    style={{ width: currentIndex <= 0 ? '0%' : currentIndex === 1 ? 'calc(50% - 16px)' : 'calc(100% - 32px)' }}
                />

                {/* Nodes */}
                {options.map((opt, idx) => {
                    const isActive = value === opt;
                    const isPassed = currentIndex >= idx;
                    const optInfo = getColorInfo(opt);

                    return (
                        <div key={opt} className="relative flex flex-col items-center">
                            <button 
                                type="button" 
                                onClick={() => onChange(opt)}
                                className="relative w-8 h-8 rounded-full focus:outline-none flex items-center justify-center group cursor-pointer"
                            >
                                {/* Static Node Dot */}
                                <div className={`w-4 h-4 rounded-full transition-colors duration-300 ${isPassed ? activeInfo.bg : 'bg-white border-2 border-gray-300 shadow-sm'}`} />
                                
                                {/* Animated Thumb Component */}
                                {isActive && (
                                    <motion.div
                                        layoutId={`${id}-thumb`}
                                        className={`absolute inset-0 rounded-full shadow-xl border-[3px] border-white ${optInfo.bg} z-20`}
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 450, damping: 25 }}
                                    >
                                        {/* Outer Glow Effect */}
                                        <div className={`absolute -inset-1 rounded-full ring-4 ${optInfo.ring} opacity-50 animate-pulse`} />
                                    </motion.div>
                                )}

                                {/* Hover Ring */}
                                <div className="absolute inset-[-8px] rounded-full bg-black/5 scale-0 group-hover:scale-100 transition-transform duration-200" />
                            </button>

                            {/* Label */}
                            <span 
                                className={`absolute top-8 text-xs sm:text-sm font-bold transition-all duration-300 ${isActive ? optInfo.text + ' drop-shadow-sm' : 'text-gray-400 font-medium'} whitespace-nowrap`}
                            >
                                {labels ? labels[idx] : opt}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function Step3ValueDrivers() {
    const { watch, setValue, formState: { errors } } = useFormContext<SimplifiedValuationFormData>();

    const revenueGrowth = watch("revenueGrowth");
    const profitMargin = watch("profitMargin");
    const businessStability = watch("businessStability");
    const ebitda = watch("ebitda");
    const revenue = watch("revenue");

    // Strictly check numeric values to ensure empty strings or undefined inputs hide the profit margin
    const revNum = Number(revenue);
    const ebitdaNum = Number(ebitda);
    const showProfitMargin = !isNaN(revNum) && revNum > 0 && (isNaN(ebitdaNum) || ebitdaNum <= 0);

    const handleSelect = (field: keyof SimplifiedValuationFormData, value: string) => {
        setValue(field, value, { shouldValidate: true });
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
                
                {/* Revenue Growth Card */}
                <Card className={`p-4 sm:p-5 border-2 transition-colors ${errors.revenueGrowth ? 'border-brand-red/50 bg-red-50/10' : 'border-transparent bg-white shadow-sm hover:shadow-md'}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <Label className="text-base font-semibold text-gray-900">Revenue growth in last 3 years</Label>
                            {errors.revenueGrowth && <p className="text-xs text-brand-red mt-1">{errors.revenueGrowth.message}</p>}
                        </div>
                    </div>
                    <ModernSlider 
                        id="growth" 
                        value={revenueGrowth || ""} 
                        labels={["Low (0-10%)", "Medium (10-20%)", "High (20%+)"]}
                        onChange={(val) => handleSelect("revenueGrowth", val)} 
                    />
                </Card>

                {/* Profit Margin Card (Conditional) */}
                {showProfitMargin && (
                    <Card className={`p-4 sm:p-5 border-2 transition-colors ${errors.profitMargin ? 'border-brand-red/50 bg-red-50/10' : 'border-transparent bg-white shadow-sm hover:shadow-md'}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                <Percent className="w-5 h-5" />
                            </div>
                            <div>
                                <Label className="text-base font-semibold text-gray-900">Estimated Profit Margin</Label>
                                {errors.profitMargin && <p className="text-xs text-brand-red mt-1">{errors.profitMargin.message}</p>}
                            </div>
                        </div>
                        <ModernSlider 
                            id="margin" 
                            value={profitMargin || ""} 
                            labels={["Low (<10%)", "Medium (10-20%)", "High (>20%)"]}
                            onChange={(val) => handleSelect("profitMargin", val)} 
                        />
                    </Card>
                )}

                {/* Business Stability Card */}
                <Card className={`p-4 sm:p-5 border-2 transition-colors ${errors.businessStability ? 'border-brand-red/50 bg-red-50/10' : 'border-transparent bg-white shadow-sm hover:shadow-md'}`}>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <Label className="text-base font-semibold text-gray-900">Business Stability</Label>
                            <p className="text-sm text-gray-500 font-normal">High = recurring customers, low dependence on one client</p>
                            {errors.businessStability && <p className="text-xs text-brand-red mt-1">{errors.businessStability.message}</p>}
                        </div>
                    </div>
                    <ModernSlider 
                        id="stability" 
                        value={businessStability || ""} 
                        onChange={(val) => handleSelect("businessStability", val)} 
                    />
                </Card>
            </div>
        </div>
    );
}
