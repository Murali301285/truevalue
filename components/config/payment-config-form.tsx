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
import { useEffect } from "react"
import { upsertPaymentConfig } from "@/app/actions/payment-config"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const formSchema = z.object({
    provider: z.string().min(2, "Provider Name must be at least 2 characters"),
    apiKey: z.string().min(2, "API Key / User Name is required"),
    apiSecret: z.string().min(2, "API Secret / Password is required"),
    validity: z.date().optional(),
    documents: z.string().optional(), // Comma separated URLs for now
})

interface PaymentConfigFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: any
    onSuccess: () => void
}

export function PaymentConfigForm({ open, onOpenChange, initialData, onSuccess }: PaymentConfigFormProps) {
    const { toast } = useToast()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            provider: "",
            apiKey: "",
            apiSecret: "",
            validity: undefined,
            documents: "",
        },
    })

    useEffect(() => {
        if (initialData) {
            form.reset({
                provider: initialData.provider,
                apiKey: initialData.apiKey,
                apiSecret: initialData.apiSecret,
                validity: initialData.validity ? new Date(initialData.validity) : undefined,
                documents: Array.isArray(initialData.documents) ? initialData.documents.join(",") : "",
            })
        } else {
            form.reset({
                provider: "",
                apiKey: "",
                apiSecret: "",
                validity: undefined,
                documents: "",
            })
        }
    }, [initialData, form, open])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const documentArray = values.documents ? values.documents.split(',').map(s => s.trim()) : [];

            const payload = {
                id: initialData?.id,
                ...values,
                documents: documentArray
            };

            const res = await upsertPaymentConfig(payload);

            if (res.success) {
                toast({
                    title: "Success",
                    description: `Configuration saved successfully.`,
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Configuration" : "Add Configuration"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="provider"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Provider Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Razorpay, Stripe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="apiKey"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>API Key / Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Key or Username" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="apiSecret"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>API Secret / Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Secret or Password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="validity"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>License Validity</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="documents"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Submitted Documents (URLs)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. https://example.com/license.pdf (comma separated)" {...field} />
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
                                Save Configuration
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
