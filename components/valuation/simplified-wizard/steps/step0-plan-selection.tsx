import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Step0PlanSelectionProps {
    onSelectPlan: (plan: string) => void;
    hasDraft: boolean;
    draftDate?: string | null;
    onLoadDraft: () => void;
    onClearDraft: () => void;
}

export function Step0PlanSelection({ onSelectPlan, hasDraft, draftDate, onLoadDraft, onClearDraft }: Step0PlanSelectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 max-w-5xl mx-auto"
        >
            <div className="text-center">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-4 mt-8">Select Your Assessment Plan</h1>
                <p className="text-gray-500 max-w-xl mx-auto">Choose the tier that best fits your immediate requirement before proceeding with the valuation data entry.</p>
            </div>

            {hasDraft && (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-5xl mx-auto shadow-sm">
                    <div>
                        <h3 className="font-bold text-amber-900 text-lg flex items-center gap-2">
                            <HelpCircle className="w-5 h-5" />
                            Unsaved Draft Found
                        </h3>
                        <p className="text-amber-700 text-sm mt-1">
                            We found data from a previous draft saved securely in your browser. Would you like to resume it?
                            {draftDate && (
                                <span className="text-blue-600 font-medium italic ml-1 whitespace-nowrap">
                                    (Draft last saved at: {draftDate})
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            variant="outline"
                            className="bg-transparent border-amber-300 text-amber-800 hover:bg-amber-100/50"
                            onClick={onClearDraft}
                        >
                            Clear Draft
                        </Button>
                        <Button 
                            className="bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-900/10"
                            onClick={onLoadDraft}
                        >
                            Load Draft
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8 items-start max-w-6xl mx-auto pb-16">
                {/* Express Plan */}
                <div className="bg-white border-2 border-brand-red rounded-3xl p-8 shadow-2xl shadow-red-50 relative transform hover:-translate-y-1 transition-transform">
                    <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3">
                        <span className="bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">Popular</span>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-[#a81b21] mb-2">Express Target</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-extrabold text-[#a81b21]">₹499</span>
                            <span className="text-gray-500 font-medium">/report</span>
                        </div>
                    </div>
                    <ul className="space-y-4 mb-8 min-h-[140px]">
                        {[
                            "Instant Automatic Calculation",
                            "4-Page Base PDF Report",
                            "Market Multiplier Benchmarks",
                            "Indicative Use Only"
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-gray-700 font-medium text-sm">
                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3 h-3 text-green-700" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <Button 
                        onClick={() => onSelectPlan("Express")}
                        className="w-full h-12 bg-brand-red hover:bg-[#8e161c] text-white font-bold rounded-xl shadow-lg shadow-red-100 active:scale-95 transition-transform"
                    >
                        Select Express
                    </Button>
                </div>

                {/* Standard Plan */}
                <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 opacity-80 cursor-not-allowed">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-500 mb-2">Standard Review</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-extrabold text-gray-400">₹4,999</span>
                            <span className="text-gray-400 font-medium">/report</span>
                        </div>
                    </div>
                    <ul className="space-y-4 mb-8 min-h-[140px]">
                        {[
                            "Analyst Verification Phase",
                            "10-Page Detailed Analysis",
                            "Debt/Loan Submission Ready",
                            "Balance Sheet Normalization"
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-gray-500 font-medium text-sm">
                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3 h-3 text-gray-400" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <Button disabled className="w-full h-12 bg-gray-200 text-gray-400 font-bold rounded-xl">
                        Coming Soon
                    </Button>
                </div>

                {/* Certified Plan */}
                <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 opacity-80 cursor-not-allowed">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-500 mb-2">Certified Formal</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-extrabold text-gray-400">₹14,999</span>
                            <span className="text-gray-400 font-medium">/report</span>
                        </div>
                    </div>
                    <ul className="space-y-4 mb-8 min-h-[140px]">
                        {[
                            "CA/RV Certified Original",
                            "Full Regulatory Compliance",
                            "Stamp Duty Processing Ready",
                            "Manual Scrutiny & Interview"
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-gray-500 font-medium text-sm">
                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3 h-3 text-gray-400" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <Button disabled className="w-full h-12 bg-gray-200 text-gray-400 font-bold rounded-xl">
                        Coming Soon
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
