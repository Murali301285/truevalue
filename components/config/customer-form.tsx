"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area" // You might need this for long company lists
import { useToast } from "@/components/ui/use-toast"
import { createCustomer, updateCustomer } from "@/app/actions/customer"
import { Plus, Trash2, X } from "lucide-react"

const customerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().optional(),
    area: z.string().optional(),
    companyIds: z.array(z.string()),
    contacts: z.array(z.object({
        name: z.string().min(1, "Contact Name required"),
        phone: z.string().min(1, "Phone required"),
        email: z.string().email().optional().or(z.literal("")),
        designation: z.string().optional()
    }))
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface CustomerFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: any;
    companies: any[]; // List of available companies
    onSuccess: () => void;
}

export function CustomerForm({ open, onOpenChange, initialData, companies, onSuccess }: CustomerFormProps) {
    const { toast } = useToast()
    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: "",
            address: "",
            area: "",
            companyIds: [],
            contacts: []
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "contacts"
    })

    React.useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name,
                address: initialData.address || "",
                area: initialData.area || "",
                companyIds: initialData.companies?.map((c: any) => c.id) || [],
                contacts: initialData.contacts || []
            })
        } else {
            form.reset({
                name: "",
                address: "",
                area: "",
                companyIds: [],
                contacts: [{ name: "", phone: "", email: "", designation: "" }] // Default one empty row
            })
        }
    }, [initialData, form])

    const onSubmit = async (data: CustomerFormValues) => {
        let res;
        if (initialData) {
            res = await updateCustomer(initialData.id, data);
        } else {
            res = await createCustomer(data);
        }

        if (res.success) {
            toast({ title: "Success", description: `Customer ${initialData ? 'updated' : 'created'} successfully.` });
            onSuccess();
            onOpenChange(false);
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
    }

    // Toggle Company Selection
    const toggleCompany = (companyId: string) => {
        const current = form.getValues("companyIds");
        if (current.includes(companyId)) {
            form.setValue("companyIds", current.filter(id => id !== companyId));
        } else {
            form.setValue("companyIds", [...current, companyId]);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>Customer Name *</Label>
                            <Input {...form.register("name")} placeholder="Enter customer name" />
                            {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Area</Label>
                            <Input {...form.register("area")} placeholder="Region/City" />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>Address</Label>
                            <Textarea {...form.register("address")} placeholder="Full Address" />
                        </div>
                    </div>

                    {/* Refer Companies (Multi-Select) */}
                    <div className="space-y-2 p-3 bg-zinc-50 rounded border border-zinc-100">
                        <Label className="mb-2 block">Refer Operations (Linked Companies)</Label>
                        <ScrollArea className="h-24 w-full pr-4">
                            <div className="grid grid-cols-2 gap-2">
                                {companies.map(comp => (
                                    <div key={comp.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`comp-${comp.id}`}
                                            checked={form.watch("companyIds").includes(comp.id)}
                                            onCheckedChange={() => toggleCompany(comp.id)}
                                        />
                                        <label
                                            htmlFor={`comp-${comp.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {comp.name}
                                        </label>
                                    </div>
                                ))}
                                {companies.length === 0 && <p className="text-xs text-zinc-400">No companies found. Create a company first.</p>}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Contact Persons (Repeater) */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center border-b pb-2">
                            <Label>Contact Persons</Label>
                            <Button type="button" size="sm" variant="outline" onClick={() => append({ name: "", phone: "", email: "", designation: "" })}>
                                <Plus className="w-3 h-3 mr-1" /> Add Contact
                            </Button>
                        </div>

                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-12 gap-2 items-start bg-zinc-50 p-2 rounded relative group">
                                    <div className="col-span-4 space-y-1">
                                        <Input {...form.register(`contacts.${index}.name`)} placeholder="Name *" className="h-8 text-xs" />
                                        {form.formState.errors.contacts?.[index]?.name && <p className="text-red-500 text-[10px]">Required</p>}
                                    </div>
                                    <div className="col-span-3 space-y-1">
                                        <Input {...form.register(`contacts.${index}.phone`)} placeholder="Phone *" className="h-8 text-xs" />
                                    </div>
                                    <div className="col-span-4 space-y-1">
                                        <Input {...form.register(`contacts.${index}.designation`)} placeholder="Designation" className="h-8 text-xs" />
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50" onClick={() => remove(index)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {fields.length === 0 && <p className="text-center text-zinc-400 text-xs py-2">At least one contact recommended.</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Save Customer</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
