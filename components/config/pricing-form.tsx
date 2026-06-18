"use client"

import { useForm, useFieldArray } from "react-hook-form"
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
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useMemo } from "react"
import { createPricingPlan, updatePricingPlan } from "@/app/actions/pricing"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2 } from "lucide-react"

const chargeSchema = z.object({
    name: z.string().min(1, "Name required"),
    amount: z.coerce.number().min(0, "Amount must be 0 or more"),
})

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    price: z.coerce.number().min(0, "Price must be positive"),
    taxPercentage: z.coerce.number().min(0, "Tax cannot be negative"),
    otherCharges: z.array(chargeSchema).default([]),
    currency: z.string().default("INR"),
    features: z.string().min(1, "Enter at least one feature"),
})

interface PricingFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: any
    onSuccess: () => void
}

export function PricingForm({ open, onOpenChange, initialData, onSuccess }: PricingFormProps) {
    const { toast } = useToast()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            price: 0,
            taxPercentage: 18,
            otherCharges: [],
            currency: "INR",
            features: "",
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "otherCharges"
    })

    // Watch values for live calculation
    const watchPrice = form.watch("price") || 0;
    const watchTax = form.watch("taxPercentage") || 0;
    const watchCharges = form.watch("otherCharges") || [];

    // Calculate Live Total
    const calculatedTotal = useMemo(() => {
        const basePrice = Number(watchPrice);
        const taxAmount = basePrice * (Number(watchTax) / 100);
        const extraCharges = watchCharges.reduce((sum, charge) => sum + (Number(charge.amount) || 0), 0);
        return basePrice + taxAmount + extraCharges;
    }, [watchPrice, watchTax, watchCharges]);

    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name,
                price: initialData.price,
                taxPercentage: initialData.taxPercentage ?? 18,
                otherCharges: Array.isArray(initialData.otherCharges) ? initialData.otherCharges : [],
                currency: initialData.currency || "INR",
                features: Array.isArray(initialData.features) ? initialData.features.join("\n") : initialData.features,
            })
        } else {
            form.reset({
                name: "",
                price: 0,
                taxPercentage: 18,
                otherCharges: [],
                currency: "INR",
                features: "",
            })
        }
    }, [initialData, form, open])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // Convert features string to array
            const featuresArray = values.features.split('\n').filter(f => f.trim() !== "");

            const payload = {
                ...values,
                features: featuresArray,
                totalPrice: calculatedTotal
            };

            let res;
            if (initialData) {
                res = await updatePricingPlan(initialData.id, payload);
            } else {
                res = await createPricingPlan(payload);
            }

            if (res.success) {
                toast({
                    title: "Success",
                    description: `Plan ${initialData ? "updated" : "created"} successfully.`,
                })
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
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Plan" : "Add Plan"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Plan Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Standard" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Pricing Section */}
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 space-y-4">
                            <h4 className="font-semibold text-sm text-gray-700">Pricing Details</h4>
                            
                            <div className="flex gap-4">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel className="text-xs">Base Price</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="taxPercentage"
                                    render={({ field }) => (
                                        <FormItem className="w-24">
                                            <FormLabel className="text-xs">Tax (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="18" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem className="w-20">
                                            <FormLabel className="text-xs">Currency</FormLabel>
                                            <FormControl>
                                                <Input placeholder="INR" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Dynamic Other Charges */}
                            <div className="space-y-2 pt-2 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <FormLabel className="text-xs">Other Charges</FormLabel>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 text-xs px-2"
                                        onClick={() => append({ name: "", amount: 0 })}
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> Add Charge
                                    </Button>
                                </div>
                                
                                {fields.length === 0 && (
                                    <p className="text-xs text-gray-400 italic">No extra charges added.</p>
                                )}

                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start">
                                        <FormField
                                            control={form.control}
                                            name={`otherCharges.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem className="flex-[2]">
                                                    <FormControl>
                                                        <Input placeholder="Charge Name (e.g. Setup Fee)" className="h-8 text-xs" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`otherCharges.${index}.amount`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input type="number" placeholder="Amount" className="h-8 text-xs" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Live Total Calculator */}
                            <div className="mt-4 bg-brand-red/5 border border-brand-red/10 rounded-md p-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-700">Calculated Total</span>
                                    <span className="text-xl font-bold text-brand-red">
                                        ₹ {calculatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">
                                    Base (₹{watchPrice}) + Tax (₹{(watchPrice * (watchTax / 100)).toFixed(2)}) + Extras (₹{watchCharges.reduce((a, c) => a + (Number(c.amount)||0), 0).toFixed(2)})
                                </p>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="features"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Features (One per line)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Feature 1&#10;Feature 2&#10;Feature 3" className="min-h-[100px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-brand-red hover:bg-[#8e161c]">
                                {initialData ? "Update Plan" : "Create Plan"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
