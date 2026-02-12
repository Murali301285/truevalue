"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useDropzone } from "react-dropzone"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { createCompany, updateCompany } from "@/app/actions/company"
import { useToast } from "@/components/ui/use-toast"
import { X, Upload, Plus, Trash2 } from "lucide-react"

const companySchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
    description: z.string().optional(),
    industry: z.string().optional(),
    startedOn: z.string().optional(), // Date input returns string
    address: z.string().optional(),
    gstNo: z.string().optional(),
    logoUrl: z.string().optional(),
    statutoryDoc: z.string().optional(),
    management: z.array(z.object({
        name: z.string().min(1, "Name required"),
        designation: z.string().min(1, "Designation required")
    })).optional()
})

type CompanyFormValues = z.infer<typeof companySchema>

interface CompanyFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: any;
    onSuccess: () => void;
}

export function CompanyForm({ open, onOpenChange, initialData, onSuccess }: CompanyFormProps) {
    const { toast } = useToast()
    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            name: "",
            code: "",
            description: "",
            industry: "",
            startedOn: "",
            address: "",
            gstNo: "",
            logoUrl: "",
            statutoryDoc: "",
            management: []
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "management"
    })

    React.useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                startedOn: initialData.startedOn ? new Date(initialData.startedOn).toISOString().split('T')[0] : "",
                management: initialData.management ? (Array.isArray(initialData.management) ? initialData.management : []) : []
            })
        } else {
            form.reset({
                name: "", code: "", description: "", industry: "", startedOn: "", address: "", gstNo: "", logoUrl: "", statutoryDoc: "", management: []
            })
        }
    }, [initialData, form])

    const onSubmit = async (data: CompanyFormValues) => {
        let res;
        if (initialData) {
            res = await updateCompany(initialData.id, data);
        } else {
            res = await createCompany(data);
        }

        if (res.success) {
            toast({ title: "Success", description: `Company ${initialData ? 'updated' : 'created'} successfully.` });
            onSuccess();
            onOpenChange(false);
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
    }

    // File Upload Handler (Mock for now, would upload to S3/Blob in real app)
    const onDropLogo = (acceptedFiles: File[]) => {
        // In real app: Upload file -> Get URL -> Set Form Value
        // For demo: Create local object URL
        const file = acceptedFiles[0];
        if (file.size > 2 * 1024 * 1024) {
            toast({ title: "Error", description: "File size must be less than 2MB", variant: "destructive" });
            return;
        }
        const url = URL.createObjectURL(file);
        form.setValue("logoUrl", url); // Mock
        toast({ title: "Attached", description: "Logo attached successfully (Mock)." });
    }

    const { getRootProps: getLogoProps, getInputProps: getLogoInput, isDragActive: isLogoActive } = useDropzone({ maxFiles: 1, accept: { 'image/*': [] }, onDrop: onDropLogo });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Company' : 'Add New Company'}</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="statutory">Statutory</TabsTrigger>
                        <TabsTrigger value="management">Management</TabsTrigger>
                    </TabsList>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        {/* Tab 1: Basic Details */}
                        <TabsContent value="details" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Company Name *</Label>
                                    <Input {...form.register("name")} placeholder="Acme Corp" />
                                    {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Company Code *</Label>
                                    <Input {...form.register("code")} placeholder="ACME001" />
                                    {form.formState.errors.code && <p className="text-red-500 text-xs">{form.formState.errors.code.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Area of Business</Label>
                                    <Input {...form.register("industry")} placeholder="SaaS, Logistics..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Started On</Label>
                                    <Input type="date" {...form.register("startedOn")} max={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Address</Label>
                                    <Textarea {...form.register("address")} placeholder="Registered Office Address..." />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Description</Label>
                                    <Textarea {...form.register("description")} placeholder="Brief description..." />
                                </div>
                            </div>

                            {/* Logo Upload */}
                            <div className="space-y-2">
                                <Label>Company Logo (Max 2MB)</Label>
                                <div {...getLogoProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isLogoActive ? 'border-emerald-500 bg-emerald-50' : 'border-zinc-200 hover:border-zinc-400'}`}>
                                    <input {...getLogoInput()} />
                                    {form.watch("logoUrl") ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <img src={form.watch("logoUrl")} alt="Logo" className="h-12 w-12 object-contain rounded" />
                                            <span className="text-emerald-600 font-medium">Change Logo</span>
                                        </div>
                                    ) : (
                                        <div className="text-zinc-500 text-sm">
                                            <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                                            <p>Drag & drop or Click to upload icon</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab 2: Statutory */}
                        <TabsContent value="statutory" className="space-y-4">
                            <div className="space-y-2">
                                <Label>GST Number</Label>
                                <Input {...form.register("gstNo")} placeholder="22AAAAA0000A1Z5" />
                            </div>
                            <div className="space-y-2">
                                <Label>Statutory Document (PDF/Image)</Label>
                                <Input type="file" disabled className="cursor-not-allowed bg-zinc-100" />
                                <p className="text-xs text-zinc-500">Document storage config required for real implementation.</p>
                            </div>
                        </TabsContent>

                        {/* Tab 3: Management */}
                        <TabsContent value="management" className="space-y-4">
                            <div className="flex justify-between items-center bg-zinc-50 p-2 rounded">
                                <h3 className="text-sm font-bold">Key Personnel</h3>
                                <Button type="button" size="sm" variant="outline" onClick={() => append({ name: "", designation: "" })}>
                                    <Plus className="w-4 h-4 mr-1" /> Add Person
                                </Button>
                            </div>

                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-end">
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-xs">Name</Label>
                                        <Input {...form.register(`management.${index}.name`)} placeholder="Full Name" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-xs">Designation</Label>
                                        <Input {...form.register(`management.${index}.designation`)} placeholder="CEO, Director..." />
                                    </div>
                                    <Button type="button" size="icon" variant="ghost" className="text-red-500 hover:bg-red-50 mb-0.5" onClick={() => remove(index)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            {fields.length === 0 && <p className="text-center text-zinc-400 text-sm py-4">No personnel added yet.</p>}
                        </TabsContent>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
