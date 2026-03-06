"use client";

import { useFormContext } from "react-hook-form";
import { ValuationFormData } from "../schema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Info, CheckCircle2, Users, Calendar, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatIndianNumber } from "@/lib/logic";

const FINANCIAL_FIELDS = [
    { name: "revenue", label: "Latest FY Revenue", tooltip: "Total income generated from sales before any expenses in the last financial year." },
    { name: "ebitda", label: "EBITDA", tooltip: "Earnings Before Interest, Taxes, Depreciation, and Amortization." },
    { name: "pat", label: "Profit After Tax (PAT)", tooltip: "The net profit earned by the company after deducting all taxes." },
    { name: "totalAssets", label: "Total Assets", tooltip: "Sum of all current and non-current assets owned by the company." },
    { name: "totalLiabilities", label: "Total Liabilities", tooltip: "Sum of all debts and financial obligations." },
];

const PURPOSE_OPTIONS = [
    { value: "loan", label: "Business Loan Application" },
    { value: "investment", label: "Equity Investment Round" },
    { value: "internal", label: "Internal Audit / Strategic Planning" },
    { value: "merger", label: "Merger & Acquisition" },
    { value: "compliance", label: "Statutory Compliance" },
    { value: "other", label: "Other" }
];

const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
};

export function Step2Financials() {
    const { control, setValue, watch } = useFormContext<ValuationFormData>();
    // Watch incorporation date to auto-calculate years in operation
    const incorporationDate = watch("incorporationDate");
    const yearsInOperation = watch("yearsInOperation");

    useEffect(() => {
        if (incorporationDate && !yearsInOperation) {
            const years = new Date().getFullYear() - new Date(incorporationDate).getFullYear();
            setValue("yearsInOperation", years > 0 ? years : 0);
        }
    }, [incorporationDate, setValue, yearsInOperation]);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
                {FINANCIAL_FIELDS.map((fieldMeta) => (
                    <FormField
                        key={fieldMeta.name}
                        control={control}
                        name={fieldMeta.name as keyof ValuationFormData}
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <FormLabel>{fieldMeta.label} <span className="text-red-500">*</span></FormLabel>
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
                                            className="pl-7 h-12 font-mono bg-zinc-50/50 border-zinc-200 focus:bg-white transition-colors"
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

                <FormField
                    control={control}
                    name="numberOfEmployees"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2 mb-1.5">
                                <FormLabel>Number of Employees</FormLabel>
                                <Users className="h-4 w-4 text-gray-400" />
                            </div>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="e.g. 50"
                                    {...field}
                                    className="h-12 bg-zinc-50/50 border-zinc-200 focus:bg-white transition-colors"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="yearsInOperation"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2 mb-1.5">
                                <FormLabel>Years in Operation <span className="text-red-500">*</span></FormLabel>
                                <Calendar className="h-4 w-4 text-gray-400" />
                            </div>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="e.g. 5"
                                    {...field}
                                    className="h-12 bg-zinc-50/50 border-zinc-200 focus:bg-white transition-colors"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="md:col-span-2 space-y-4 pt-4 border-t border-dashed border-gray-200">
                    <FormField
                        control={control}
                        name="purpose"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <FormLabel>Purpose of Valuation <span className="text-red-500">*</span></FormLabel>
                                    <Target className="h-4 w-4 text-gray-400" />
                                </div>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 bg-zinc-50/50 border-zinc-200 focus:bg-white">
                                            <SelectValue placeholder="Select Reason for Valuation" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {PURPOSE_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {watch("purpose") === "other" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                            <FormField
                                control={control}
                                name="otherPurpose"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input placeholder="Please specify purpose" {...field} className="h-12 bg-white border-zinc-200" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </motion.div>
                    )}
                </div>

            </motion.div>
        </motion.div>
    );
}
