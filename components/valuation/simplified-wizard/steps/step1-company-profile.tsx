import { useFormContext } from "react-hook-form";
import { SimplifiedValuationFormData } from "../schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Step1CompanyProfile({ industries = [] }: { industries?: any[] }) {
    const { register, formState: { errors }, setValue, watch } = useFormContext<SimplifiedValuationFormData>();
    
    const watchSector = watch("sector");
    const [openSector, setOpenSector] = useState(false);

    const activeSectorOptions = industries.length > 0 
        ? industries.map(i => ({ value: i.name, label: i.name }))
        : ["IT Services", "Manufacturing", "Retail", "Healthcare", "Other"].map(o => ({ value: o, label: o }));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Core Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg text-brand-red">Core Requirements</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-gray-700 font-semibold">
                            Company Name <span className="text-brand-red">*</span>
                        </Label>
                        <Input
                            id="companyName"
                            placeholder="e.g. Acme Corp Pvt Ltd"
                            {...register("companyName")}
                            className={errors.companyName ? 'border-brand-red focus-visible:ring-brand-red' : ''}
                        />
                        {errors.companyName && <p className="text-sm text-brand-red mt-1">{errors.companyName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sector" className="text-gray-700 font-semibold">
                            Industry Sector <span className="text-brand-red">*</span>
                        </Label>
                        <Popover open={openSector} onOpenChange={setOpenSector}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openSector}
                                    className={cn(
                                        "w-full justify-between h-10 font-normal",
                                        !watchSector && "text-muted-foreground",
                                        errors.sector ? 'border-brand-red focus:ring-brand-red' : ''
                                    )}
                                >
                                    {watchSector
                                        ? activeSectorOptions.find((opt) => opt.value === watchSector)?.label
                                        : "Select your industry"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search industry..." />
                                    <CommandList>
                                        <CommandEmpty>No industry found.</CommandEmpty>
                                        <CommandGroup>
                                            {activeSectorOptions.map((opt) => (
                                                <CommandItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                    onSelect={() => {
                                                        setValue("sector", opt.value, { shouldValidate: true });
                                                        setOpenSector(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn("mr-2 h-4 w-4", watchSector === opt.value ? "opacity-100" : "opacity-0")}
                                                    />
                                                    {opt.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {errors.sector && <p className="text-sm text-brand-red mt-1">{errors.sector.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="legalStructure" className="text-gray-700 font-semibold">Legal Structure</Label>
                        <Input id="legalStructure" placeholder="e.g. Pvt Ltd, LLP" {...register("legalStructure")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="incorporationDate" className="text-gray-700 font-semibold">Incorporation Date</Label>
                        <Input id="incorporationDate" type="date" {...register("incorporationDate")} />
                    </div>
                </CardContent>
            </Card>

            {/* Statutory IDs */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg text-brand-red">Statutory IDs</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="pan" className="text-gray-700 font-semibold">PAN Number</Label>
                        <Input id="pan" placeholder="ABCDE1234F" className="uppercase" {...register("pan")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gstNo" className="text-gray-700 font-semibold">GST Number</Label>
                        <Input id="gstNo" placeholder="22AAAAA0000A1Z5" className="uppercase" {...register("gstNo")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cin" className="text-gray-700 font-semibold">CIN</Label>
                        <Input id="cin" placeholder="U12345MH2000PTC123456" className="uppercase" {...register("cin")} />
                    </div>
                </CardContent>
            </Card>

            {/* Registered Address */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg text-brand-red">Registered Address</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="addressLine1" className="text-gray-700 font-semibold">Address Line 1</Label>
                        <Input id="addressLine1" placeholder="Building/Street info" {...register("addressLine1")} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="addressLine2" className="text-gray-700 font-semibold">Address Line 2</Label>
                        <Input id="addressLine2" placeholder="Suite/Apt/Landmark" {...register("addressLine2")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city" className="text-gray-700 font-semibold">City</Label>
                        <Input id="city" placeholder="e.g. Chennai" {...register("city")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="state" className="text-gray-700 font-semibold">State</Label>
                        <Input id="state" placeholder="e.g. Tamil Nadu" {...register("state")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pincode" className="text-gray-700 font-semibold">Pincode</Label>
                        <Input id="pincode" placeholder="e.g. 600100" {...register("pincode")} />
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
