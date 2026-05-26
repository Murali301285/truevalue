"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPlanValuationFactor, savePlanValuationFactor, PlanValuationFactorInput } from "@/app/actions/valuation-factors";
import { useToast } from "@/components/ui/use-toast";
import { Save, Loader2 } from "lucide-react";

export default function ValuationFactorsPage() {
    const { toast } = useToast();
    const [selectedPlan, setSelectedPlan] = useState<string>("Express");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [factors, setFactors] = useState<PlanValuationFactorInput>({
        planName: "Express",
        growthLow: 0.90, growthMed: 1.00, growthHigh: 1.15,
        marginLow: 0.90, marginMed: 1.00, marginHigh: 1.10,
        riskHigh: 0.85, riskMed: 1.00, riskLow: 1.10,
        age0to3: 0.90, age3to7: 1.00, age7plus: 1.05
    });

    // Fetch data when plan changes
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const data = await getPlanValuationFactor(selectedPlan);
                setFactors(data as PlanValuationFactorInput);
            } catch (error) {
                toast.error("Failed to load configuration");
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [selectedPlan]);

    const handleChange = (field: keyof PlanValuationFactorInput, value: string) => {
        const numValue = parseFloat(value);
        setFactors(prev => ({ ...prev, [field]: isNaN(numValue) ? value : numValue }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await savePlanValuationFactor(factors);
            if (result.success) {
                toast.success(`${selectedPlan} Plan factors updated successfully!`);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Valuation Factors</h1>
                <p className="text-zinc-500">Configure dynamic adjustment multipliers specifically for each Pricing Plan.</p>
            </div>

            {/* Plan Selector */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <Label className="font-semibold whitespace-nowrap">Target Plan Configuration :</Label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Plan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Express">Express Tier</SelectItem>
                        <SelectItem value="Standard">Standard Tier</SelectItem>
                        <SelectItem value="Certified">Certified Tier</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                </div>
            ) : (
                <Tabs defaultValue="growth" className="w-full">
                    <TabsList className="w-full justify-start border-b rounded-none pb-0 h-auto bg-transparent mb-6">
                        <TabsTrigger value="growth" className="rounded-t-lg rounded-b-none data-[state=active]:bg-white data-[state=active]:border-x data-[state=active]:border-t">1. Growth (GF)</TabsTrigger>
                        <TabsTrigger value="margin" className="rounded-t-lg rounded-b-none data-[state=active]:bg-white data-[state=active]:border-x data-[state=active]:border-t">2. Margin (MF)</TabsTrigger>
                        <TabsTrigger value="risk" className="rounded-t-lg rounded-b-none data-[state=active]:bg-white data-[state=active]:border-x data-[state=active]:border-t">3. Risk (RF)</TabsTrigger>
                        <TabsTrigger value="age" className="rounded-t-lg rounded-b-none data-[state=active]:bg-white data-[state=active]:border-x data-[state=active]:border-t">4. Age (AF)</TabsTrigger>
                    </TabsList>

                    <Card className="border-none shadow-none">
                        <CardContent className="p-0">
                            {/* GROWTH FACTOR */}
                            <TabsContent value="growth" className="space-y-4 m-0">
                                <CardHeader className="px-0 pt-0">
                                    <CardTitle className="text-lg text-brand-red">Growth Factor (GF)</CardTitle>
                                    <CardDescription>Adjust the multiples based on projected revenue/EBITDA growth.</CardDescription>
                                </CardHeader>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label>Low Growth Multiplier</Label>
                                        <Input type="number" step="0.05" value={factors.growthLow} onChange={(e) => handleChange("growthLow", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Medium Growth Multiplier</Label>
                                        <Input type="number" step="0.05" value={factors.growthMed} onChange={(e) => handleChange("growthMed", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>High Growth Multiplier</Label>
                                        <Input type="number" step="0.05" value={factors.growthHigh} onChange={(e) => handleChange("growthHigh", e.target.value)} />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* MARGIN FACTOR */}
                            <TabsContent value="margin" className="space-y-4 m-0">
                                <CardHeader className="px-0 pt-0">
                                    <CardTitle className="text-lg text-brand-red">Margin Factor (MF)</CardTitle>
                                    <CardDescription>Only applies if the Metric Type is Revenue.</CardDescription>
                                </CardHeader>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label>Low Margin Multiplier</Label>
                                        <Input type="number" step="0.05" value={factors.marginLow} onChange={(e) => handleChange("marginLow", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Medium Margin Multiplier</Label>
                                        <Input type="number" step="0.05" value={factors.marginMed} onChange={(e) => handleChange("marginMed", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>High Margin Multiplier</Label>
                                        <Input type="number" step="0.05" value={factors.marginHigh} onChange={(e) => handleChange("marginHigh", e.target.value)} />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* RISK FACTOR */}
                            <TabsContent value="risk" className="space-y-4 m-0">
                                <CardHeader className="px-0 pt-0">
                                    <CardTitle className="text-lg text-brand-red">Risk Factor (RF)</CardTitle>
                                    <CardDescription>Penalizes high risk and rewards high stability.</CardDescription>
                                </CardHeader>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label>High Risk (Low Stability)</Label>
                                        <Input type="number" step="0.05" value={factors.riskHigh} onChange={(e) => handleChange("riskHigh", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Medium Risk (Med Stability)</Label>
                                        <Input type="number" step="0.05" value={factors.riskMed} onChange={(e) => handleChange("riskMed", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Low Risk (High Stability)</Label>
                                        <Input type="number" step="0.05" value={factors.riskLow} onChange={(e) => handleChange("riskLow", e.target.value)} />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* AGE FACTOR */}
                            <TabsContent value="age" className="space-y-4 m-0">
                                <CardHeader className="px-0 pt-0">
                                    <CardTitle className="text-lg text-brand-red">Age Factor (AF)</CardTitle>
                                    <CardDescription>Multipliers based on how long the business has been in operation.</CardDescription>
                                </CardHeader>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label>0 - 3 Years</Label>
                                        <Input type="number" step="0.05" value={factors.age0to3} onChange={(e) => handleChange("age0to3", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>3 - 7 Years</Label>
                                        <Input type="number" step="0.05" value={factors.age3to7} onChange={(e) => handleChange("age3to7", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>7+ Years</Label>
                                        <Input type="number" step="0.05" value={factors.age7plus} onChange={(e) => handleChange("age7plus", e.target.value)} />
                                    </div>
                                </div>
                            </TabsContent>
                        </CardContent>
                    </Card>

                    <div className="mt-10 flex justify-end">
                        <Button onClick={handleSave} disabled={isSaving} className="bg-brand-red hover:bg-red-700 w-32">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            {isSaving ? "Saving..." : "Save Config"}
                        </Button>
                    </div>
                </Tabs>
            )}
        </div>
    );
}
