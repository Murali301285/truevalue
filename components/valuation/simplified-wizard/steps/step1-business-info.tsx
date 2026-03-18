import { useFormContext } from "react-hook-form";
import { SimplifiedValuationFormData } from "../schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";

export function Step1BusinessInfo({ industries = [] }: { industries?: any[] }) {
    const { register, formState: { errors }, setValue, watch, getValues } = useFormContext<SimplifiedValuationFormData>();
    
    const watchSector = watch("sector");
    const watchAge = watch("age");

    const [displayRev, setDisplayRev] = useState("");
    const [displayEbitda, setDisplayEbitda] = useState("");
    const [openSector, setOpenSector] = useState(false);

    const formatCurrency = (val: string | number | null | undefined) => {
        if (val === null || val === undefined || val === "") return "";
        const num = Number(val.toString().replace(/,/g, ""));
        if (isNaN(num)) return "";
        return new Intl.NumberFormat('en-IN').format(num);
    };

    useEffect(() => {
        const rev = getValues('revenue');
        if (rev !== undefined) setDisplayRev(formatCurrency(rev));
        const ebi = getValues('ebitda');
        if (ebi !== undefined) setDisplayEbitda(formatCurrency(ebi));
    }, [getValues]);

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "revenue" | "ebitda") => {
        const rawVal = e.target.value.replace(/,/g, "");
        if (/^\d*$/.test(rawVal)) {
            setValue(fieldName, rawVal ? Number(rawVal) : undefined, { shouldValidate: true });
            if (fieldName === "revenue") setDisplayRev(formatCurrency(rawVal));
            if (fieldName === "ebitda") setDisplayEbitda(formatCurrency(rawVal));
        }
    };

    const handleSelectChange = (name: keyof SimplifiedValuationFormData, value: string) => {
        setValue(name, value, { shouldValidate: true });
    };

    const activeSectorOptions = industries.length > 0 
        ? industries.map(i => ({ value: i.name, label: i.name }))
        : ["IT Services", "Manufacturing", "Retail", "Healthcare", "Other"].map(o => ({ value: o, label: o }));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <Card className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sector Dropdown */}
                    <div className="space-y-2">
                        <Label htmlFor="sector" className="text-gray-700 font-semibold">
                            Sector <span className="text-brand-red">*</span>
                        </Label>
                        <Popover open={openSector} onOpenChange={setOpenSector}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openSector}
                                    className={cn(
                                        "w-full justify-between h-10 font-normal",
                                        !watchSector && "text-muted-foreground",
                                        errors.sector ? 'border-brand-red focus:ring-brand-red' : ''
                                    )}
                                >
                                    {watchSector
                                        ? activeSectorOptions.find((opt) => opt.value === watchSector)?.label
                                        : "Select your industry"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search industry..." />
                                    <CommandList>
                                        <CommandEmpty>No industry found.</CommandEmpty>
                                        <CommandGroup>
                                            {activeSectorOptions.map((opt) => (
                                                <CommandItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                    onSelect={(currentValue) => {
                                                        handleSelectChange("sector", opt.value);
                                                        setOpenSector(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            watchSector === opt.value ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {opt.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {errors.sector && (
                            <p className="text-sm text-brand-red mt-1">{errors.sector.message}</p>
                        )}
                    </div>

                    {/* Age Dropdown */}
                    <div className="space-y-2">
                        <Label htmlFor="age" className="text-gray-700 font-semibold">
                            Age of Business (Years) <span className="text-brand-red">*</span>
                        </Label>
                        <Select 
                            onValueChange={(value) => handleSelectChange("age", value)}
                            value={watchAge}
                        >
                            <SelectTrigger className={`w-full ${errors.age ? 'border-brand-red focus:ring-brand-red' : ''}`}>
                                <SelectValue placeholder="Select age bracket" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0-3">0 – 3 years</SelectItem>
                                <SelectItem value="3-7">3 – 7 years</SelectItem>
                                <SelectItem value="7+">7+ years</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.age && (
                            <p className="text-sm text-brand-red mt-1">{errors.age.message}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                    {/* Revenue Input */}
                    <div className="space-y-2">
                        <Label htmlFor="revenue" className="text-gray-700 font-semibold">
                            Annual Revenue (₹) <span className="text-brand-red">*</span>
                        </Label>
                        <Input
                            id="revenue"
                            type="text"
                            placeholder="e.g. 5,00,00,000"
                            className={errors.revenue ? 'border-brand-red focus-visible:ring-brand-red' : ''}
                            value={displayRev}
                            onChange={(e) => handleNumberChange(e, "revenue")}
                        />
                        {errors.revenue && (
                            <p className="text-sm text-brand-red mt-1">{errors.revenue.message}</p>
                        )}
                    </div>

                    {/* EBITDA/Profit Input with Helper */}
                    <div className="space-y-2">
                        <Label htmlFor="ebitda" className="text-gray-700 font-semibold flex items-center justify-between">
                            <span>EBITDA / Profit (₹)</span>
                            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Optional</span>
                        </Label>
                        <Input
                            id="ebitda"
                            type="text"
                            placeholder="e.g. 1,00,00,000"
                            className={errors.ebitda ? 'border-brand-red focus-visible:ring-brand-red' : ''}
                            value={displayEbitda}
                            onChange={(e) => handleNumberChange(e, "ebitda")}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            If you don't know profit, just enter revenue; we'll handle the rest.
                        </p>
                        {errors.ebitda && (
                            <p className="text-sm text-brand-red mt-1">{errors.ebitda.message}</p>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
