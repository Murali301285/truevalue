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
import { Textarea } from "@/components/ui/textarea"
import { useEffect } from "react"
import { createPricingPlan, updatePricingPlan } from "@/app/actions/pricing"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    price: z.coerce.number().min(0, "Price must be positive"),
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
            currency: "INR",
            features: "",
        },
    })

    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name,
                price: initialData.price,
                currency: initialData.currency || "INR",
                features: Array.isArray(initialData.features) ? initialData.features.join("\n") : initialData.features,
            })
        } else {
            form.reset({
                name: "",
                price: 0,
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
                features: featuresArray
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Plan" : "Add Plan"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem className="w-24">
                                        <FormLabel>Currency</FormLabel>
                                        <FormControl>
                                            <Input placeholder="INR" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-brand-red hover:bg-[#8e161c]">
                                {initialData ? "Update" : "Create"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
