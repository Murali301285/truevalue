"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useDropzone } from "react-dropzone"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCompany, updateCompany } from "@/app/actions/company"
import { useToast } from "@/components/ui/use-toast"
import { X, Upload, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { clsx } from "clsx"

// Extended Schema
const companySchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
    description: z.string().optional(),
    industry: z.string().optional(),
    startedOn: z.string().optional(),
    address: z.string().optional(), // Keeping for backward compat logic if needed

    // New Fields
    legalStructure: z.string().optional(),
    pan: z.string().optional(), // Required for Standard/Certified in real app
    gstNo: z.string().optional(),
    cin: z.string().optional(),

    // Address Details
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),

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

const steps = [
    { id: 'basic', title: 'Company Details' },
    { id: 'address', title: 'Registered Address' },
    { id: 'statutory', title: 'Statutory & Financials' },
    { id: 'management', title: 'Management' }
]

export function CompanyForm({ open, onOpenChange, initialData, onSuccess }: CompanyFormProps) {
    const { toast } = useToast()
    const [currentStep, setCurrentStep] = React.useState(0)

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            name: "", code: "", description: "", industry: "", startedOn: "",
            address: "", gstNo: "", pan: "", cin: "", legalStructure: "",
            addressLine1: "", addressLine2: "", city: "", state: "", pincode: "",
            logoUrl: "", statutoryDoc: "", management: []
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "management"
    })

    React.useEffect(() => {
        if (open) {
            setCurrentStep(0);
            if (initialData) {
                form.reset({
                    ...initialData,
                    startedOn: initialData.startedOn ? new Date(initialData.startedOn).toISOString().split('T')[0] : "",
                    management: initialData.management ? (Array.isArray(initialData.management) ? initialData.management : []) : []
                })
            } else {
                form.reset({
                    name: "", code: "", description: "", industry: "", startedOn: "",
                    address: "", gstNo: "", pan: "", cin: "", legalStructure: "",
                    addressLine1: "", addressLine2: "", city: "", state: "", pincode: "",
                    logoUrl: "", statutoryDoc: "", management: []
                })
            }
        }
    }, [initialData, open, form])

    const onSubmit = async (data: CompanyFormValues) => {
        let res;
        // Combine address lines if address is empty (as fallback)
        if (!data.address) {
            data.address = `${data.addressLine1 || ''} ${data.addressLine2 || ''} ${data.city || ''} ${data.state || ''} ${data.pincode || ''}`.trim();
        }

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

    // Navigation
    const nextStep = async () => {
        // Trigger validation for current step fields
        const fieldsToValidate = getFieldsForStep(currentStep);
        const result = await form.trigger(fieldsToValidate as any);
        if (result) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const getFieldsForStep = (step: number) => {
        switch (step) {
            case 0: return ['name', 'code', 'industry', 'startedOn', 'legalStructure'];
            case 1: return ['addressLine1', 'city', 'state', 'pincode'];
            case 2: return ['gstNo', 'pan', 'cin'];
            case 3: return []; // Management is dynamic
            default: return [];
        }
    }

    // Logo Upload
    const onDropLogo = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file.size > 2 * 1024 * 1024) {
            toast({ title: "Error", description: "File size must be less than 2MB", variant: "destructive" });
            return;
        }
        const url = URL.createObjectURL(file);
        form.setValue("logoUrl", url);
    }
    const { getRootProps: getLogoProps, getInputProps: getLogoInput, isDragActive: isLogoActive } = useDropzone({ maxFiles: 1, accept: { 'image/*': [] }, onDrop: onDropLogo });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl min-h-[600px] flex flex-col p-0 overflow-hidden bg-zinc-50/50">
                <DialogHeader className="px-8 py-6 border-b bg-white">
                    <DialogTitle className="text-xl">{initialData ? 'Edit Company Profile' : 'New Valuation Setup'}</DialogTitle>
                    <p className="text-sm text-zinc-500">Provide the required details to initialize the company valuation process.</p>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Steps */}
                    <div className="w-64 bg-white border-r hidden md:block py-8 px-6 space-y-6">
                        {steps.map((step, index) => (
                            <div key={step.id} className={clsx("relative flex items-center gap-3 transition-colors", currentStep === index ? "text-zinc-900" : currentStep > index ? "text-emerald-600" : "text-zinc-400")}>
                                <div className={clsx(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                                    currentStep === index ? "border-zinc-900 bg-zinc-900 text-white" :
                                        currentStep > index ? "border-emerald-600 bg-emerald-50 text-emerald-600" : "border-zinc-200 bg-white"
                                )}>
                                    {currentStep > index ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                                </div>
                                <span className="font-medium text-sm">{step.title}</span>
                                {index < steps.length - 1 && (
                                    <div className={clsx("absolute left-4 top-8 w-0.5 h-6 -ml-[1px]", currentStep > index ? "bg-emerald-200" : "bg-zinc-100")} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 relative scrollbar-hide">
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    {/* STEP 0: BASIC DETAILS */}
                                    {currentStep === 0 && (
                                        <div className="space-y-5">
                                            <div className="grid grid-cols-2 gap-5">
                                                <div className="space-y-2 col-span-2 md:col-span-1">
                                                    <Label>Company Name <span className="text-red-500">*</span></Label>
                                                    <Input {...form.register("name")} placeholder="e.g. Acme Innovations Pvt Ltd" className="h-10" />
                                                    {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
                                                </div>
                                                <div className="space-y-2 col-span-2 md:col-span-1">
                                                    <Label>Legal Structure</Label>
                                                    <Select onValueChange={(val) => form.setValue("legalStructure", val)} defaultValue={form.watch("legalStructure")}>
                                                        <SelectTrigger className="h-10">
                                                            <SelectValue placeholder="Select Structure" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Private Limited">Private Limited</SelectItem>
                                                            <SelectItem value="Public Limited">Public Limited</SelectItem>
                                                            <SelectItem value="LLP">LLP</SelectItem>
                                                            <SelectItem value="Partnership">Partnership</SelectItem>
                                                            <SelectItem value="Proprietorship">Proprietorship</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2 col-span-2 md:col-span-1">
                                                    <Label>Company Code <span className="text-red-500">*</span></Label>
                                                    <Input {...form.register("code")} placeholder="Unique ID (e.g. ACM001)" className="h-10" />
                                                    {form.formState.errors.code && <p className="text-red-500 text-xs">{form.formState.errors.code.message}</p>}
                                                </div>
                                                <div className="space-y-2 col-span-2 md:col-span-1">
                                                    <Label>Date of Incorporation</Label>
                                                    <Input type="date" {...form.register("startedOn")} max={new Date().toISOString().split('T')[0]} className="h-10" />
                                                </div>
                                                <div className="space-y-2 col-span-2">
                                                    <Label>Industry Sector</Label>
                                                    <Select onValueChange={(val) => form.setValue("industry", val)} defaultValue={form.watch("industry")}>
                                                        <SelectTrigger className="h-10">
                                                            <SelectValue placeholder="Select Industry" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Technology">Technology / SaaS</SelectItem>
                                                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                                                            <SelectItem value="Retail">Retail / E-commerce</SelectItem>
                                                            <SelectItem value="Logistics">Logistics</SelectItem>
                                                            <SelectItem value="Finance">Finance / Fintech</SelectItem>
                                                            <SelectItem value="Education">Education</SelectItem>
                                                            <SelectItem value="Real Estate">Real Estate</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="col-span-2 space-y-2">
                                                    <Label>Description</Label>
                                                    <Textarea {...form.register("description")} placeholder="Briefly describe what the company does..." className="resize-none h-24" />
                                                </div>

                                                {/* Hidden Logo Upload for simplicity in Wizard, or add as small optional */}
                                                <div className="col-span-2 space-y-2">
                                                    <Label>Company Logo</Label>
                                                    <div {...getLogoProps()} className="border border-dashed rounded-md p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-50">
                                                        <input {...getLogoInput()} />
                                                        <div className="flex items-center gap-3">
                                                            {form.watch("logoUrl") ? (
                                                                <img src={form.watch("logoUrl")} className="w-10 h-10 object-contain rounded bg-white shadow-sm" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded bg-zinc-100 flex items-center justify-center text-zinc-400"><Upload className="w-5 h-5" /></div>
                                                            )}
                                                            <div className="text-sm">
                                                                <p className="font-medium text-zinc-700">{form.watch("logoUrl") ? "Logo Selected" : "Upload Logo"}</p>
                                                                <p className="text-xs text-zinc-500">JPG, PNG up to 2MB</p>
                                                            </div>
                                                        </div>
                                                        <Button type="button" variant="ghost" size="sm">Select</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 1: ADDRESS */}
                                    {currentStep === 1 && (
                                        <div className="space-y-5">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Address Line 1</Label>
                                                    <Input {...form.register("addressLine1")} placeholder="Floor, Building Name" className="h-10" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Address Line 2 (Optional)</Label>
                                                    <Input {...form.register("addressLine2")} placeholder="Street, Area" className="h-10" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>City</Label>
                                                        <Input {...form.register("city")} placeholder="City" className="h-10" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>State</Label>
                                                        <Input {...form.register("state")} placeholder="State" className="h-10" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2 w-1/2 pr-2">
                                                    <Label>Pincode</Label>
                                                    <Input {...form.register("pincode")} placeholder="000000" className="h-10" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 2: STATUTORY & FINANCIALS */}
                                    {currentStep === 2 && (
                                        <div className="space-y-6">
                                            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-4">
                                                <p className="text-sm text-blue-800">Please provide statutory identifiers. These are critical for valuation report generation.</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>PAN Number</Label>
                                                    <Input {...form.register("pan")} placeholder="ABCDE1234F" className="uppercase font-mono h-10" maxLength={10} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>GSTIN (Optional)</Label>
                                                    <Input {...form.register("gstNo")} placeholder="22AAAAA0000A1Z5" className="uppercase font-mono h-10" />
                                                </div>
                                                <div className="space-y-2 col-span-2">
                                                    <Label>CIN (Corporate Identity Number)</Label>
                                                    <Input {...form.register("cin")} placeholder="U12345MH2023PTC123456" className="uppercase font-mono h-10" />
                                                    <p className="text-xs text-zinc-500">Required for Pvt Ltd / Public Ltd companies.</p>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t">
                                                <Label className="mb-3 block text-base">Key Financial Indicators (Estimate)</Label>
                                                <div className="grid grid-cols-2 gap-4 opacity-70 pointer-events-none">
                                                    {/* Placeholders for now as requested 'financial details etc' but strictly mapped yet to schema mostly */}
                                                    <div className="space-y-2">
                                                        <Label>Last Year Revenue</Label>
                                                        <Input placeholder="₹ 0.00" disabled />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Last Year EBITDA</Label>
                                                        <Input placeholder="₹ 0.00" disabled />
                                                    </div>
                                                    <p className="col-span-2 text-xs text-zinc-500">Full financial data entry will be available after company creation.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 3: MANAGEMENT */}
                                    {currentStep === 3 && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-zinc-50 p-3 rounded border">
                                                <div>
                                                    <h3 className="text-sm font-bold text-zinc-900">Key Personnel / Promoters</h3>
                                                    <p className="text-xs text-zinc-500">Add directors and key stakeholders.</p>
                                                </div>
                                                <Button type="button" size="sm" variant="outline" onClick={() => append({ name: "", designation: "" })} className="bg-white hover:bg-zinc-50">
                                                    <Plus className="w-4 h-4 mr-1" /> Add Person
                                                </Button>
                                            </div>

                                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                                {fields.map((field, index) => (
                                                    <motion.div
                                                        key={field.id}
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="grid grid-cols-12 gap-3 items-end bg-white p-3 rounded-md border shadow-sm group"
                                                    >
                                                        <div className="col-span-5 space-y-1">
                                                            <Label className="text-xs text-zinc-500">Name</Label>
                                                            <Input {...form.register(`management.${index}.name`)} placeholder="Full Name" className="h-9" />
                                                        </div>
                                                        <div className="col-span-5 space-y-1">
                                                            <Label className="text-xs text-zinc-500">Designation</Label>
                                                            <Input {...form.register(`management.${index}.designation`)} placeholder="Position" className="h-9" />
                                                        </div>
                                                        <div className="col-span-2 flex justify-end">
                                                            <Button type="button" size="icon" variant="ghost" className="text-zinc-400 hover:text-red-500 hover:bg-red-50 h-9 w-9" onClick={() => remove(index)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                                {fields.length === 0 && (
                                                    <div className="text-center py-10 border-2 border-dashed rounded-lg bg-zinc-50">
                                                        <p className="text-zinc-500 text-sm">No personnel added yet.</p>
                                                        <Button type="button" variant="link" className="text-emerald-600" onClick={() => append({ name: "", designation: "" })}>Add the first person</Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </form>
                    </div>
                </div>

                <div className="p-4 border-t bg-white flex justify-between items-center px-8 z-10">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={currentStep === 0 ? () => onOpenChange(false) : prevStep}
                        className="text-zinc-500 hover:text-zinc-900"
                    >
                        {currentStep === 0 ? "Cancel" : "Back"}
                    </Button>

                    <div className="flex gap-3">
                        {currentStep < steps.length - 1 ? (
                            <Button type="button" onClick={nextStep} className="bg-zinc-900 text-white hover:bg-zinc-800 min-w-[120px]">
                                Next Step <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button type="button" onClick={form.handleSubmit(onSubmit)} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]">
                                Create Valuation Info
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
