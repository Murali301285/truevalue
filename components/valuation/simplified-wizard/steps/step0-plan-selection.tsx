import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, HelpCircle, Clock } from "lucide-react";
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
                <div className="bg-white border-2 border-brand-red rounded-3xl p-8 shadow-2xl shadow-red-50 relative transform hover:-translate-y-1 transition-transform flex flex-col h-full">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-[#a81b21] mb-1 flex items-center gap-2">Express <span className="text-xl">⚡</span></h3>
                        <p className="text-gray-500 font-medium mb-4">Indicative Valuation</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-brand-red text-sm font-medium border border-red-100">
                            <Clock className="w-4 h-4" /> Turnaround: ~2 Minutes
                        </div>
                    </div>
                    <ul className="space-y-4 mb-6 flex-grow">
                        {[
                            "Quick estimate",
                            "Financial snapshot",
                            "Understand current valuation"
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-gray-700 font-medium text-sm">
                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3 h-3 text-green-700" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <div className="mb-6 mt-auto">
                        <p className="text-xs text-gray-400 italic">EBITA/Profit Multiplier Method used</p>
                    </div>
                    <Button 
                        onClick={() => onSelectPlan("Express")}
                        className="w-full h-14 bg-brand-red hover:bg-[#8e161c] text-white text-xl font-extrabold rounded-xl shadow-lg shadow-red-100 active:scale-95 transition-transform"
                    >
                        ₹499
                    </Button>
                </div>

                {/* Standard Plan */}
                <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 opacity-80 cursor-not-allowed relative flex flex-col h-full">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">Coming Soon</span>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-700 mb-1 flex items-center gap-2">Standard <span className="text-lg">📊</span></h3>
                        <p className="text-gray-400 font-medium mb-4">Business Review</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-sm font-medium border border-gray-200">
                            <Clock className="w-4 h-4" /> Turnaround: ~10 Minutes
                        </div>
                    </div>
                    <ul className="space-y-4 mb-6 flex-grow">
                        {[
                            "Valuation",
                            "Dependency Assessment",
                            "Financial Analysis",
                            "Risk Review",
                            "Continuity Score"
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-gray-500 font-medium text-sm">
                                <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 opacity-70">
                                    <Check className="w-3 h-3 text-green-600" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <div className="mb-6 mt-auto">
                        <p className="text-xs text-gray-400 italic">Discounted Cash Flow (DCF) Method used</p>
                    </div>
                    <Button disabled className="w-full h-14 bg-gray-200 text-gray-400 text-xl font-extrabold rounded-xl">
                        ₹4,999
                    </Button>
                </div>

                {/* Certified Plan */}
                <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 opacity-80 cursor-not-allowed relative flex flex-col h-full">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">Coming Soon</span>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-700 mb-1 flex items-center gap-2">Certified <span className="text-lg">🛡️</span></h3>
                        <p className="text-gray-400 font-medium mb-4">Professional Opinion</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-sm font-medium border border-gray-200">
                            <Clock className="w-4 h-4" /> Turnaround: ~48 Hours
                        </div>
                    </div>
                    <ul className="space-y-4 mb-6 flex-grow">
                        {[
                            "Valuation",
                            "Manual Review",
                            "CA / RV Certification",
                            "Governance Review",
                            "Business Continuity Assessment"
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-gray-500 font-medium text-sm">
                                <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 opacity-70">
                                    <Check className="w-3 h-3 text-green-600" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <div className="mb-6 mt-auto">
                        <p className="text-xs text-gray-400 italic">Certified Multiple analytical models used</p>
                    </div>
                    <Button disabled className="w-full h-14 bg-gray-200 text-gray-400 text-xl font-extrabold rounded-xl">
                        ₹14,999
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
