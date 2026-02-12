"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { createUser, updateUser } from "@/app/actions/user"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().optional(),
    role: z.enum(["ADMIN", "USER", "FOUNDER", "PARENT"]),
    isActive: z.boolean()
})

type UserFormValues = z.infer<typeof userSchema>

interface UserFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: any;
    onSuccess: () => void;
}

export function UserForm({ open, onOpenChange, initialData, onSuccess }: UserFormProps) {
    const { toast } = useToast()
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "USER",
            isActive: true
        }
    })

    React.useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name,
                email: initialData.email,
                role: initialData.role,
                isActive: initialData.isActive,
                password: "" // Don't fill password on edit
            })
        } else {
            form.reset({
                name: "",
                email: "",
                role: "USER",
                isActive: true,
                password: ""
            })
        }
    }, [initialData, form])

    const onSubmit = async (data: UserFormValues) => {
        let res;

        // Validation: Password required for new users
        if (!initialData && !data.password) {
            form.setError("password", { message: "Password is required for new users" });
            return;
        }

        if (initialData) {
            res = await updateUser(initialData.id, data);
        } else {
            res = await createUser(data);
        }

        if (res.success) {
            toast({ title: "Success", description: `User ${initialData ? 'updated' : 'created'} successfully.` });
            onSuccess();
            onOpenChange(false);
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit User' : 'Add New User'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input {...form.register("name")} placeholder="John Doe" />
                        {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Email (Login ID) *</Label>
                        <Input type="email" {...form.register("email")} placeholder="john@company.com" disabled={!!initialData} />
                        {form.formState.errors.email && <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>{initialData ? "Password (Leave blank to keep same)" : "Password *"}</Label>
                        <Input type="password" {...form.register("password")} placeholder="******" />
                        {form.formState.errors.password && <p className="text-red-500 text-xs">{form.formState.errors.password.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                            onValueChange={(val: any) => form.setValue("role", val)}
                            defaultValue={form.getValues("role")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="USER">User (View Only)</SelectItem>
                                {/* Parent/Founder kept for internal logic, filtered here */}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                            <Label>Active Status</Label>
                            <div className="text-[0.8rem] text-muted-foreground">
                                Allow user to login
                            </div>
                        </div>
                        <Switch
                            checked={form.watch("isActive")}
                            onCheckedChange={(val) => form.setValue("isActive", val)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Save User</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
