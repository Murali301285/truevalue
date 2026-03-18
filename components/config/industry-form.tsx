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
import { createIndustry, updateIndustry } from "@/app/actions/industry"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    remarks: z.string().optional(),
})

interface IndustryFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: any
    onSuccess: () => void
}

export function IndustryForm({ open, onOpenChange, initialData, onSuccess }: IndustryFormProps) {
    const { toast } = useToast()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            remarks: "",
        },
    })

    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name,
                remarks: initialData.remarks || "",
            })
        } else {
            form.reset({
                name: "",
                remarks: "",
            })
        }
    }, [initialData, form, open])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            let res;
            if (initialData) {
                res = await updateIndustry(initialData.id, values);
            } else {
                res = await createIndustry(values);
            }

            if (res.success) {
                toast({
                    title: "Success",
                    description: `Industry ${initialData ? "updated" : "created"} successfully.`,
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
                    <DialogTitle>{initialData ? "Edit Industry" : "Add Industry"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Industry Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Manufacturing" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Remarks (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Additional notes..." {...field} />
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
