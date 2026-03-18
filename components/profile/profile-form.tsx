"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { updateUserProfile } from "@/app/actions/user"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Camera, EyeIcon, EyeOffIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ProfileForm({ user }: { user: any }) {
    const { update } = useSession() // Keep update for refreshing session if needed
    const { toast } = useToast()
    // Remove session.user usage, use props.user

    const [isLoading, setIsLoading] = useState(false)

    // Profile Fields
    const [name, setName] = useState(user.name || "")
    const [businessName, setBusinessName] = useState(user.businessName || "")
    const [mobileNumber, setMobileNumber] = useState(user.mobileNumber || "") // "Pre-filled" if exists

    // Consents
    const [termsAccepted, setTermsAccepted] = useState(user.termsAccepted || false)
    const [dpdpAccepted, setDpdpAccepted] = useState(user.dpdpAccepted || false)

    // Password Fields
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    // Checkbox component (using Radix Checkbox or native input)
    // Importing Checkbox from components/ui/checkbox if available, else native.
    // Assuming Input/Label are available.

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword && newPassword !== confirmPassword) {
            toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
            return;
        }

        if (newPassword && !oldPassword) {
            toast({ title: "Error", description: "Please enter your current password to change it.", variant: "destructive" });
            return;
        }

        if (!termsAccepted) {
            toast({ title: "Error", description: "You must accept the Terms and Conditions.", variant: "destructive" });
            return;
        }

        if (!dpdpAccepted) {
            toast({ title: "Error", description: "You must provide DPDP consent.", variant: "destructive" });
            return;
        }

        setIsLoading(true);

        try {
            const res = await updateUserProfile(user.id, {
                name,
                businessName,
                mobileNumber,
                termsAccepted,
                dpdpAccepted,
                oldPassword: oldPassword || undefined,
                newPassword: newPassword || undefined,
                image: previewImage || undefined
            });

            if (res.success) {
                toast({ title: "Success", description: "Profile updated successfully." });
                // Update session
                await update({
                    name: name,
                    image: previewImage || user.image
                }); // Basic session update

                // Clear password fields
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast({ title: "Error", description: res.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-6">

                {/* User Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                        <CardDescription>View and update your profile details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <Avatar className="h-24 w-24 border-2 border-zinc-100">
                                    <AvatarImage src={previewImage || user.image || ""} />
                                    <AvatarFallback className="text-2xl font-bold bg-zinc-100 text-zinc-500">
                                        {user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                                    <Camera className="w-6 h-6" />
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-medium text-lg leading-none">{user.name}</h3>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <p className="text-xs text-emerald-600 font-medium border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded-full w-fit mt-2">
                                    {String(user.role)}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-2 pt-4">
                            <Label>Full Name</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" />
                        </div>

                        <div className="grid gap-2">
                            <Label>Business Name</Label>
                            <Input
                                value={businessName}
                                onChange={e => setBusinessName(e.target.value)}
                                placeholder="Your Business Name"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Mobile Number</Label>
                            <Input
                                value={mobileNumber}
                                onChange={e => setMobileNumber(e.target.value)}
                                placeholder="Mobile Number"
                            />
                            <p className="text-xs text-muted-foreground">This number is pre-filled from your registration details.</p>
                        </div>

                        <div className="grid gap-2">
                            <Label>Email Address (Read Only)</Label>
                            <Input value={user.email || ""} disabled className="bg-zinc-50" />
                        </div>
                    </CardContent>
                </Card>

                {/* Consents Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Consents & Agreements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="terms"
                                className="h-4 w-4 rounded border-gray-300 text-zinc-900 focus:ring-zinc-900"
                                checked={termsAccepted}
                                onChange={e => setTermsAccepted(e.target.checked)}
                            />
                            <Label htmlFor="terms" className="font-normal">
                                I accept the <a href="#" className="underline text-blue-600">Terms and Conditions</a>
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="dpdp"
                                className="h-4 w-4 rounded border-gray-300 text-zinc-900 focus:ring-zinc-900"
                                checked={dpdpAccepted}
                                onChange={e => setDpdpAccepted(e.target.checked)}
                            />
                            <Label htmlFor="dpdp" className="font-normal">
                                I provide my explicit consent under the DPDP Act.
                            </Label>
                        </div>
                        {user.dpdpAcceptedAt && (
                            <p className="text-xs text-muted-foreground ml-6">
                                Consent recorded on: {new Date(user.dpdpAcceptedAt).toLocaleString()}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Security Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Update your password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Current Password</Label>
                            <Input
                                type="password"
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                                placeholder="Required to set new password"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>New Password</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOffIcon className="h-4 w-4" />
                                    ) : (
                                        <EyeIcon className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Confirm New Password</Label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t pt-4">
                        <Button type="submit" className="bg-zinc-900 text-white hover:bg-zinc-800 min-w-[120px]" disabled={isLoading}>
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </form>
    )
}
