"use client";

import { useFormContext } from "react-hook-form";
import { ValuationFormData } from "../schema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Info, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatIndianNumber } from "@/lib/logic";

const FINANCIAL_FIELDS = [
    { name: "revenue", label: "Annual Revenue", tooltip: "Total income generated from sales before any expenses." },
    { name: "ebitda", label: "EBITDA", tooltip: "Earnings Before Interest, Taxes, Depreciation, and Amortization." },
    { name: "pat", label: "PAT (Profit After Tax)", tooltip: "The net profit earned by the company after deducting all taxes." },
    { name: "totalAssets", label: "Total Assets", tooltip: "Sum of all current and non-current assets owned by the company." },
    { name: "totalLiabilities", label: "Total Liabilities", tooltip: "Sum of all debts and financial obligations." },
];

export function Step2Financials() {
    const { control, setValue, watch } = useFormContext<ValuationFormData>();
    const [isAutoFilling, setIsAutoFilling] = useState(false);
    const [autoFillDone, setAutoFillDone] = useState(false);

    const handleAutoFill = () => {
        setIsAutoFilling(true);
        // Simulate file parsing delay
        setTimeout(() => {
            setValue("revenue", 50000000); // 5 Cr
            setValue("ebitda", 12000000);  // 1.2 Cr
            setValue("pat", 8500000);      // 85 L
            setValue("totalAssets", 25000000); // 2.5 Cr
            setValue("totalLiabilities", 10000000); // 1 Cr
            setIsAutoFilling(false);
            setAutoFillDone(true);
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
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-blue-900 font-semibold mb-1">Have your financial statements?</h3>
                    <p className="text-blue-700 text-sm">Upload your P&L or Balance Sheet (PDF/Excel) to auto-fill these details.</p>
                </div>
                <Button
                    onClick={handleAutoFill}
                    disabled={isAutoFilling || autoFillDone}
                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[160px]"
                >
                    {isAutoFilling ? (
                        <>Parsing...</>
                    ) : autoFillDone ? (
                        <><CheckCircle2 className="mr-2 h-4 w-4" /> Auto-filled</>
                    ) : (
                        <><Upload className="mr-2 h-4 w-4" /> Upload & Auto-fill</>
                    )}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {FINANCIAL_FIELDS.map((fieldMeta) => (
                    <FormField
                        key={fieldMeta.name}
                        control={control}
                        name={fieldMeta.name as keyof ValuationFormData}
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <FormLabel>{fieldMeta.label}</FormLabel>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger type="button">
                                                <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs text-xs">{fieldMeta.tooltip}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <FormControl>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                                        <Input
                                            type="text"
                                            placeholder="0"
                                            className="pl-7 h-12 font-mono"
                                            value={field.value ? formatIndianNumber(Number(field.value) || 0) : ""}
                                            onChange={(e) => {
                                                // Strip non-numeric characters except decimal
                                                const rawValue = e.target.value.replace(/[^0-9.]/g, '');
                                                field.onChange(Number(rawValue));
                                            }}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}
            </div>
        </motion.div>
    );
}
