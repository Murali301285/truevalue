"use client";

import { useFormContext } from "react-hook-form";
import { ValuationFormData } from "../schema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

const INDUSTRY_OPTIONS = [
    "Manufacturing",
    "Technology / SaaS",
    "Retail / E-commerce",
    "Healthcare",
    "Financial Services",
    "Logistics / Transportation"
];

const PURPOSE_OPTIONS = [
    { value: "loan", label: "Business Loan Application" },
    { value: "investment", label: "Equity Investment Round" },
    { value: "internal", label: "Internal Audit / Selling" }
];

export function Step1CompanyInfo() {
    const { control } = useFormContext<ValuationFormData>();

    return (
        <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="grid gap-6 md:grid-cols-2">
                <FormField
                    control={control}
                    name="companyName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Acme Corp Pvt Ltd" {...field} className="h-12" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="industry"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Industry Sector</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder="Select Industry" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {INDUSTRY_OPTIONS.map((option) => (
                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="yearsInOperation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Years in Operation</FormLabel>
                            <FormControl>
                                <Input type="number" min="0" placeholder="e.g., 5" {...field}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                    className="h-12" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="purpose"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Purpose of Valuation</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder="Select Purpose" />
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
            </div>
        </motion.div>
    );
}
