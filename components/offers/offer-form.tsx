"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createOfferCode } from "@/app/actions/offers"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
    code: z.string().min(3, "Code must be at least 3 characters").max(20),
    offerValue: z.coerce.number().min(1, "Value must be positive"),
    type: z.string().min(1),
    validTill: z.string().min(1, "Valid till date is required"),
    frequency: z.string().min(1),
    applicablePlans: z.string().min(1), // We'll just use a comma separated string for simplicity or "ALL"
})

interface OfferFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    pricingPlans: any[]
}

export function OfferForm({ open, onOpenChange, onSuccess, pricingPlans }: OfferFormProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: "",
            offerValue: 0,
            type: "percentage",
            validTill: "",
            frequency: "onetime",
            applicablePlans: "ALL",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true)
        try {
            const payload = {
                ...values,
                validTill: new Date(values.validTill),
                applicablePlans: values.applicablePlans === "ALL" ? ["ALL"] : values.applicablePlans.split(",").map(s => s.trim())
            };

            const res = await createOfferCode(payload);

            if (res.success) {
                toast({
                    title: "Success",
                    description: "Offer code created successfully.",
                })
                form.reset()
                onSuccess()
            } else {
                toast({
                    title: "Error",
                    description: res.error,
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Offer Code</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Offer Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. SUMMER50" className="uppercase" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="offerValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Value</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="50" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="validTill"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valid Till</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="frequency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Frequency (Per User)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select frequency" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="onetime">One Time Only</SelectItem>
                                            <SelectItem value="multiple">Multiple Times</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="applicablePlans"
                            render={({ field }) => {
                                const selectedPlans = field.value === "ALL" ? ["ALL"] : field.value.split(",").filter(Boolean);
                                
                                const togglePlan = (planName: string) => {
                                    if (planName === "ALL") {
                                        field.onChange("ALL");
                                        return;
                                    }

                                    let newSelected = selectedPlans.filter(p => p !== "ALL");
                                    if (newSelected.includes(planName)) {
                                        newSelected = newSelected.filter(p => p !== planName);
                                        if (newSelected.length === 0) newSelected = ["ALL"];
                                    } else {
                                        newSelected.push(planName);
                                    }
                                    field.onChange(newSelected.join(","));
                                };

                                return (
                                    <FormItem>
                                        <FormLabel>Applicable Plans</FormLabel>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Badge 
                                                variant="outline" 
                                                className={`cursor-pointer px-3 py-1 text-sm ${selectedPlans.includes("ALL") ? "bg-brand-red text-white border-brand-red hover:bg-brand-red/90" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                                                onClick={() => togglePlan("ALL")}
                                            >
                                                ALL
                                            </Badge>
                                            {pricingPlans?.map((plan: any) => (
                                                <Badge 
                                                    key={plan.id}
                                                    variant="outline" 
                                                    className={`cursor-pointer px-3 py-1 text-sm ${selectedPlans.includes(plan.name) ? "bg-brand-red text-white border-brand-red hover:bg-brand-red/90" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                                                    onClick={() => togglePlan(plan.name)}
                                                >
                                                    {plan.name}
                                                </Badge>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-brand-red hover:bg-[#8e161c]" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Offer"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
