'use client';

import { useActionState, useEffect, useState } from "react";
import { logTransaction } from "@/app/actions/cash-flow"; // Server Action
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useToast } from "@/components/ui/use-toast";

function SubmitButton({ type }: { type: "INFLOW" | "OUTFLOW" }) {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            className={`w-full py-6 text-lg font-bold shadow-lg transition-all hover:-translate-y-1 ${type === 'INFLOW'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
                }`}
            disabled={pending}
        >
            {pending ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
            ) : (
                `Log ${type === 'INFLOW' ? 'Inflow' : 'Outflow'}`
            )}
        </Button>
    )
}

interface CashFlowFormProps {
    companyId?: string;
    companies?: { id: string; name: string; code: string | null }[];
    onSuccess?: () => void;
}

export function CashFlowForm({ companyId, companies, onSuccess }: CashFlowFormProps) {
    const [state, formAction] = useActionState(logTransaction, { success: false, message: "" });
    const { toast } = useToast();
    const [type, setType] = useState<"INFLOW" | "OUTFLOW">("INFLOW");
    const [isRecurring, setIsRecurring] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState(companyId || "");

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? "Success" : "Error",
                description: state.message,
                variant: state.success ? "default" : "destructive",
            });
            if (state.success && onSuccess) {
                onSuccess();
            }
        }
    }, [state, toast, onSuccess]);

    return (
        <div className="max-w-2xl mx-auto py-4">
            <Card className="border-0 shadow-lg bg-white overflow-hidden">
                <div className={`h-2 w-full ${type === 'INFLOW' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <CardHeader className="bg-zinc-50 border-b border-zinc-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl text-zinc-900">Log Transaction</CardTitle>
                            <CardDescription>Record cash movement for this company.</CardDescription>
                        </div>
                        <div className="flex bg-zinc-200 rounded-lg p-1 gap-1">
                            <button
                                onClick={() => setType("INFLOW")}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${type === 'INFLOW' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                                type="button"
                            >
                                Inflow
                            </button>
                            <button
                                onClick={() => setType("OUTFLOW")}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${type === 'OUTFLOW' ? 'bg-white text-red-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                                type="button"
                            >
                                Outflow
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <form action={formAction} className="space-y-6">
                        {/* Company Selection if not pre-filled */}
                        {!companyId && companies && (
                            <div className="space-y-2">
                                <Label>Select Company</Label>
                                <Select name="companyId" required onValueChange={setSelectedCompanyId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select company..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {companies.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {companyId && <input type="hidden" name="companyId" value={companyId} />}

                        <input type="hidden" name="type" value={type} />

                        {/* Amount & Date Row */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Amount (₹)</Label>
                                <Input type="number" name="amount" placeholder="0.00" className="text-lg font-mono" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" name="date" className="block w-full" defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                        </div>

                        {/* Category & Description */}
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select name="category">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sales">Sales / Revenue</SelectItem>
                                    <SelectItem value="investment">Investment</SelectItem>
                                    <SelectItem value="payroll">Payroll / Salary</SelectItem>
                                    <SelectItem value="vendor">Vendor Payment</SelectItem>
                                    <SelectItem value="rent">Rent / Ops</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Description / Notes</Label>
                            <Input name="description" placeholder="Invoice #1234 or Client Name" />
                        </div>

                        {/* Recurrence Toggle */}
                        <div className="flex items-center space-x-2 bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                            <input
                                type="checkbox"
                                name="isRecurring"
                                id="recurring"
                                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                            />
                            <div className="flex-1">
                                <Label htmlFor="recurring" className="font-medium">Recurring Transaction?</Label>
                                <p className="text-xs text-zinc-500">Enable if this repeats automatically.</p>
                            </div>
                            {isRecurring && (
                                <Select name="frequency" defaultValue="MONTHLY">
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DAILY">Daily</SelectItem>
                                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* File Upload Mock */}
                        <div className="space-y-2">
                            <Label>Attachments</Label>
                            <div className="border-2 border-dashed border-zinc-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-zinc-50 transition-colors cursor-pointer group">
                                <div className="bg-zinc-100 p-3 rounded-full mb-2 group-hover:bg-zinc-200">
                                    <Upload className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600" />
                                </div>
                                <p className="text-sm font-medium text-zinc-700">Click to upload documents</p>
                                <p className="text-xs text-zinc-400">PDF, PNG, JPG (Max 5MB)</p>
                            </div>
                        </div>

                        <SubmitButton type={type} />

                    </form>
                </CardContent>
            </Card>
        </div >
    );
}
