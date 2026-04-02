import { useFormContext } from "react-hook-form";
import { SimplifiedValuationFormData } from "../schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

export function Step2BusinessDetails() {
    const { register, formState: { errors }, setValue, watch, getValues } = useFormContext<SimplifiedValuationFormData>();
    
    const watchAge = watch("age");

    const [displayRev, setDisplayRev] = useState("");
    const [displayEbitda, setDisplayEbitda] = useState("");
    const [displayAssets, setDisplayAssets] = useState("");
    const [displayLiabilities, setDisplayLiabilities] = useState("");

    const formatCurrency = (val: string | number | null | undefined) => {
        if (val === null || val === undefined || val === "") return "";
        const num = Number(val.toString().replace(/,/g, ""));
        if (isNaN(num)) return "";
        return new Intl.NumberFormat('en-IN').format(num);
    };

    useEffect(() => {
        setDisplayRev(formatCurrency(getValues('revenue')));
        setDisplayEbitda(formatCurrency(getValues('ebitda')));
        setDisplayAssets(formatCurrency(getValues('totalAssets')));
        setDisplayLiabilities(formatCurrency(getValues('totalLiabilities')));
    }, [getValues]);

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "revenue" | "ebitda" | "totalAssets" | "totalLiabilities") => {
        const rawVal = e.target.value.replace(/,/g, "");
        if (/^\d*$/.test(rawVal)) {
            setValue(fieldName, rawVal ? Number(rawVal) : undefined, { shouldValidate: true });
            if (fieldName === "revenue") setDisplayRev(formatCurrency(rawVal));
            if (fieldName === "ebitda") setDisplayEbitda(formatCurrency(rawVal));
            if (fieldName === "totalAssets") setDisplayAssets(formatCurrency(rawVal));
            if (fieldName === "totalLiabilities") setDisplayLiabilities(formatCurrency(rawVal));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Balance Sheet / PnL */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg text-brand-red">Financial Statements</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        {errors.revenue && <p className="text-sm text-brand-red mt-1">{errors.revenue.message}</p>}
                    </div>

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
                        {errors.ebitda && <p className="text-sm text-brand-red mt-1">{errors.ebitda.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="totalAssets" className="text-gray-700 font-semibold">
                            Total Assets (₹) <span className="text-brand-red">*</span>
                        </Label>
                        <Input
                            id="totalAssets"
                            type="text"
                            placeholder="e.g. 2,00,00,000"
                            className={errors.totalAssets ? 'border-brand-red focus-visible:ring-brand-red' : ''}
                            value={displayAssets}
                            onChange={(e) => handleNumberChange(e, "totalAssets")}
                        />
                        {errors.totalAssets && <p className="text-sm text-brand-red mt-1">{errors.totalAssets.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="totalLiabilities" className="text-gray-700 font-semibold">
                            Total Liabilities (₹) <span className="text-brand-red">*</span>
                        </Label>
                        <Input
                            id="totalLiabilities"
                            type="text"
                            placeholder="e.g. 50,00,000"
                            className={errors.totalLiabilities ? 'border-brand-red focus-visible:ring-brand-red' : ''}
                            value={displayLiabilities}
                            onChange={(e) => handleNumberChange(e, "totalLiabilities")}
                        />
                        {errors.totalLiabilities && <p className="text-sm text-brand-red mt-1">{errors.totalLiabilities.message}</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Operations & Context */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg text-brand-red">Operations & Context</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Age Dropdown for calculations */}
                    <div className="space-y-2">
                        <Label htmlFor="age" className="text-gray-700 font-semibold">
                            Age Bracket <span className="text-brand-red">*</span>
                        </Label>
                        <Select onValueChange={(value) => setValue("age", value as any, { shouldValidate: true })} value={watchAge}>
                            <SelectTrigger className={`w-full ${errors.age ? 'border-brand-red focus:ring-brand-red' : ''}`}>
                                <SelectValue placeholder="Select age bracket" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0-3">0 – 3 years</SelectItem>
                                <SelectItem value="3-7">3 – 7 years</SelectItem>
                                <SelectItem value="7+">7+ years</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.age && <p className="text-sm text-brand-red mt-1">{errors.age.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="numberOfEmployees" className="text-gray-700 font-semibold">
                            Number of Employees
                        </Label>
                        <Input
                            id="numberOfEmployees"
                            type="number"
                            min="0"
                            placeholder="e.g. 25"
                            {...register("numberOfEmployees")}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
