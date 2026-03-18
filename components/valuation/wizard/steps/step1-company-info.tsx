"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { ValuationFormData } from "../schema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Building2, MapPin, Receipt, CalendarDays, Upload, Download, CheckCircle2, Zap, FileCheck, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

const INDIAN_STATES = [
    { name: "Andhra Pradesh", code: "37" }, { name: "Arunachal Pradesh", code: "12" }, { name: "Assam", code: "18" },
    { name: "Bihar", code: "10" }, { name: "Chhattisgarh", code: "22" }, { name: "Goa", code: "30" },
    { name: "Gujarat", code: "24" }, { name: "Haryana", code: "06" }, { name: "Himachal Pradesh", code: "02" },
    { name: "Jharkhand", code: "20" }, { name: "Karnataka", code: "29" }, { name: "Kerala", code: "32" },
    { name: "Madhya Pradesh", code: "23" }, { name: "Maharashtra", code: "27" }, { name: "Manipur", code: "14" },
    { name: "Meghalaya", code: "17" }, { name: "Mizoram", code: "15" }, { name: "Nagaland", code: "13" },
    { name: "Odisha", code: "21" }, { name: "Punjab", code: "03" }, { name: "Rajasthan", code: "08" },
    { name: "Sikkim", code: "11" }, { name: "Tamil Nadu", code: "33" }, { name: "Telangana", code: "36" },
    { name: "Tripura", code: "16" }, { name: "Uttar Pradesh", code: "09" }, { name: "Uttarakhand", code: "05" },
    { name: "West Bengal", code: "19" }, { name: "Andaman and Nicobar Islands", code: "35" },
    { name: "Chandigarh", code: "04" }, { name: "Dadra and Nagar Haveli and Daman and Diu", code: "26" },
    { name: "Delhi", code: "07" }, { name: "Jammu and Kashmir", code: "01" }, { name: "Ladakh", code: "38" },
    { name: "Lakshadweep", code: "31" }, { name: "Puducherry", code: "34" }
].sort((a, b) => a.name.localeCompare(b.name));

const INDUSTRY_OPTIONS = [
    "Manufacturing", "Technology / SaaS", "Retail / E-commerce",
    "Healthcare", "Financial Services", "Logistics / Transportation",
    "Real Estate", "Consumer Goods", "Energy / Utilities", "Others"
];



const LEGAL_STRUCTURES = [
    "Private Limited", "Public Limited", "LLP", "Partnership", "Proprietorship", "One Person Company"
];

const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
};

export function Step1CompanyInfo() {
    const { control, watch, setValue } = useFormContext<ValuationFormData>();
    const [isAutoFilling, setIsAutoFilling] = useState(false);
    const [autoFillDone, setAutoFillDone] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Auto-calculate years in operation if date changes
    const startedOn = watch("incorporationDate");

    const handleAutoFill = () => {
        setIsAutoFilling(true);
        // Simulate file parsing delay
        setTimeout(() => {
            setValue("companyName", "Acme Innovations Pvt Ltd");
            setValue("industry", "Technology / SaaS");
            setValue("addressLine1", "123, Tech Park");
            setValue("city", "Bangalore");
            setValue("state", "Karnataka");
            setValue("pincode", "560100");
            setValue("revenue", 50000000); // 5 Cr
            setValue("ebitda", 12000000);  // 1.2 Cr
            setValue("pat", 8500000);      // 85 L
            setValue("totalAssets", 25000000); // 2.5 Cr
            setValue("totalLiabilities", 10000000); // 1 Cr
            setValue("numberOfEmployees", 45);
            setValue("yearsInOperation", 5);

            setIsAutoFilling(false);
            setAutoFillDone(true);
            setTimeout(() => setIsDialogOpen(false), 1000); // Close dialog after success
        }, 2000);
    };

    useEffect(() => {
        if (startedOn) {
            const years = new Date().getFullYear() - new Date(startedOn).getFullYear();
            setValue("yearsInOperation", years > 0 ? years : 0);
        }
    }, [startedOn, setValue]);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="space-y-8">

                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-zinc-900 font-semibold mb-1">Company already registered or have details?</h3>
                        <p className="text-zinc-600 text-sm">Upload your company documents or statements to auto-fill details.</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                className="bg-brand-red hover:bg-red-700 text-white min-w-[160px]"
                            >
                                <Upload className="mr-2 h-4 w-4" /> Upload & Auto-fill
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Auto-fill Details</DialogTitle>
                                <DialogDescription>
                                    Download the template, fill in your company details, and upload it here.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-4 py-4">
                                <Button variant="outline" className="w-full justify-start" onClick={() => window.open("/template.xlsx", "_blank")}>
                                    <Download className="mr-2 h-4 w-4" /> Download Template
                                </Button>
                                <div className="border-2 border-dashed border-zinc-200 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-zinc-50 transition-colors cursor-pointer" onClick={handleAutoFill}>
                                    {isAutoFilling ? (
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red mb-2"></div>
                                            <p className="text-sm text-zinc-500">Processing document...</p>
                                        </div>
                                    ) : autoFillDone ? (
                                        <div className="flex flex-col items-center text-green-600">
                                            <CheckCircle2 className="h-10 w-10 mb-2" />
                                            <p className="font-medium">Details Auto-filled!</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-zinc-400 mb-2" />
                                            <p className="text-sm font-medium text-zinc-900">Click to Upload Filled Template</p>
                                            <p className="text-xs text-zinc-500 mt-1">Supports Excel, PDF</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* General Information Section */}
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div className="bg-zinc-50/50 px-6 py-4 flex items-center gap-3 border-b border-zinc-100">
                        <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-brand-red" />
                        </div>
                        <h3 className="text-base font-semibold text-zinc-900 tracking-tight">General Information</h3>
                    </div>

                    <div className="p-6">
                        <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                            <FormField
                                control={control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 md:col-span-1">
                                        <FormLabel className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Company Name <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Acme Innovations Pvt Ltd" {...field} className="h-10 bg-white border-zinc-200 focus:border-brand-red focus:ring-brand-red/20 transition-all font-medium text-zinc-800" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 md:col-span-1">
                                        <FormLabel className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Company Code (ID)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Unique Identifier (e.g. ACM001)" {...field} className="h-10 bg-white border-zinc-200 focus:border-brand-red focus:ring-brand-red/20 transition-all" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="col-span-2 md:col-span-1 space-y-3">
                                <FormField
                                    control={control}
                                    name="industry"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Industry Sector <span className="text-red-500">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-10 bg-white border-zinc-200 focus:border-brand-red focus:ring-brand-red/20">
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
                            </div>
                            {watch("industry") === "Others" && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="col-span-2 md:col-span-1">
                                    <FormField
                                        control={control}
                                        name="otherIndustry"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Specify Industry</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Please specify industry" {...field} className="h-10 bg-white border-zinc-200 focus:border-brand-red focus:ring-brand-red/20" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Registration Details Section */}
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div className="bg-zinc-50/50 px-6 py-4 flex items-center gap-3 border-b border-zinc-100">
                        <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
                            <Receipt className="w-4 h-4 text-brand-red" />
                        </div>
                        <h3 className="text-base font-semibold text-zinc-900 tracking-tight">Registration Details</h3>
                    </div>

                    <div className="p-6">
                        <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                            <FormField
                                control={control}
                                name="legalStructure"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Legal Structure</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-10 bg-white border-zinc-200 focus:border-brand-red focus:ring-brand-red/20 text-zinc-800">
                                                    <SelectValue placeholder="Select Structure" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {LEGAL_STRUCTURES.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="incorporationDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Date of Incorporation</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                                <Input type="date" {...field} className="pl-9 h-10 bg-white border-zinc-200 focus:border-brand-red focus:ring-brand-red/20 cursor-pointer text-zinc-800" max={new Date().toISOString().split('T')[0]} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="pan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-medium text-zinc-500 uppercase tracking-wide">PAN Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ABCDE1234F" {...field} className="h-10 uppercase font-mono tracking-wide bg-white border-zinc-200 focus:border-brand-red focus:ring-brand-red/20 text-zinc-800" maxLength={10} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="gstNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-medium text-zinc-500 uppercase tracking-wide">GSTIN <span className="text-zinc-400 normal-case">(Optional)</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="22AAAAA0000A1Z5" {...field} className="h-10 uppercase font-mono tracking-wide bg-white border-zinc-200 focus:border-brand-red focus:ring-brand-red/20 text-zinc-800" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="cin"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel className="text-xs font-medium text-zinc-500 uppercase tracking-wide">CIN <span className="text-zinc-400 normal-case">(Optional)</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="U12345MH2023PTC123456" {...field} className="h-10 uppercase font-mono tracking-wide bg-white border-zinc-200 focus:border-brand-red focus:ring-brand-red/20 text-zinc-800" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Registered Address Section */}
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div className="bg-zinc-50/50 px-6 py-4 flex items-center gap-3 border-b border-zinc-100">
                        <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-brand-red" />
                        </div>
                        <h3 className="text-base font-semibold text-zinc-900 tracking-tight">Registered Address</h3>
                    </div>

                    <div className="p-6">
                        <motion.div variants={itemVariants} className="space-y-5">
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={control}
                                    name="addressLine1"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Address Line 1</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Building, Floor, Street" {...field} className="h-10 bg-white border-zinc-200 focus:border-brand-red focus:ring-brand-red/20 text-zinc-800" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="addressLine2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Address Line 2</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Landmark, Area" {...field} className="h-10 bg-white border-zinc-200 focus:border-brand-red focus:ring-brand-red/20 text-zinc-800" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-medium text-zinc-500 uppercase tracking-wide">State</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={cn(
                                                                "w-full justify-between h-10 bg-white border-zinc-200 focus:border-brand-red focus:ring-brand-red/20 text-zinc-800",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value
                                                                ? INDIAN_STATES.find(
                                                                    (state) => state.name === field.value
                                                                )?.name
                                                                : "Select State"}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[200px] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search state..." />
                                                        <CommandList>
                                                            <CommandEmpty>No state found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {INDIAN_STATES.map((state) => (
                                                                    <CommandItem
                                                                        value={state.name}
                                                                        key={state.code}
                                                                        onSelect={() => {
                                                                            field.onChange(state.name);
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                state.name === field.value
                                                                                    ? "opacity-100"
                                                                                    : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {state.name} ({state.code})
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-medium text-zinc-500 uppercase tracking-wide">City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="City" {...field} className="h-10 bg-white border-zinc-200 focus:border-brand-red focus:ring-brand-red/20 text-zinc-800" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="pincode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Pincode</FormLabel>
                                            <FormControl>
                                                <Input placeholder="000000" {...field} className="h-10 bg-white border-zinc-200 focus:border-brand-red focus:ring-brand-red/20 text-zinc-800" maxLength={6} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
