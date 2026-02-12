"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { updateUserProfile } from "@/app/actions/user"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Camera } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ProfileForm() {
    const { data: session, update } = useSession()
    const { toast } = useToast()
    const user = session?.user

    const [isLoading, setIsLoading] = useState(false)
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [previewImage, setPreviewImage] = useState<string | null>(null)

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

        setIsLoading(true);

        try {
            const res = await updateUserProfile(user?.id as string, {
                oldPassword: oldPassword || undefined,
                newPassword: newPassword || undefined,
                image: previewImage || undefined
            });

            if (res.success) {
                toast({ title: "Success", description: "Profile updated successfully." });
                // Attempt to update client-side session if image changed
                if (previewImage) {
                    await update({
                        ...session,
                        user: { ...session?.user, image: previewImage }
                    });
                }
                // Clear password fields on success
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

    if (!user) return null;

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-6">

                {/* User Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                        <CardDescription>View your account details. Username cannot be changed.</CardDescription>
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
                            <Label>Full Name (Read Only)</Label>
                            <Input value={user.name || ""} disabled className="bg-zinc-50" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Email Address (Read Only)</Label>
                            <Input value={user.email || ""} disabled className="bg-zinc-50" />
                        </div>
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
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                            />
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
