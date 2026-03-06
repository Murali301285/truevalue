"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function SignupForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Form fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [organization, setOrganization] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Simulate API call for signup & validation
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast({
                title: "Account created successfully!",
                description: "You can now sign in with your email.",
            });
            router.push("/login");
        } catch (error) {
            toast({
                title: "Sign up failed",
                description: "This email or phone number might already be registered.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-semibold">Full Name</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-11 bg-gray-50 border-gray-200 focus-visible:ring-brand-red focus-visible:border-brand-red"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="email" className="text-gray-700 font-semibold">Email Address (Login ID)</Label>
                    </div>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 bg-gray-50 border-gray-200 focus-visible:ring-brand-red focus-visible:border-brand-red"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-semibold">Phone Number</Label>
                    <div className="flex gap-2">
                        <div className="flex-shrink-0 flex items-center justify-center w-14 bg-gray-100 border border-gray-200 rounded-md text-gray-500 font-semibold text-sm">
                            +91
                        </div>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="9876543210"
                            pattern="[0-9]{10}"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="h-11 bg-gray-50 border-gray-200 focus-visible:ring-brand-red focus-visible:border-brand-red flex-1"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="organization" className="text-gray-700 font-semibold">Organization / MSME Name</Label>
                    <Input
                        id="organization"
                        type="text"
                        placeholder="Acme Corp"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        required
                        className="h-11 bg-gray-50 border-gray-200 focus-visible:ring-brand-red focus-visible:border-brand-red"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-700 font-semibold">Registered Address</Label>
                    <Input
                        id="address"
                        type="text"
                        placeholder="123 Business Road, City"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        className="h-11 bg-gray-50 border-gray-200 focus-visible:ring-brand-red focus-visible:border-brand-red"
                    />
                </div>

                <div className="space-y-2 pb-2">
                    <Label htmlFor="password" className="text-gray-700 font-semibold">Create Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-11 bg-gray-50 border-gray-200 focus-visible:ring-brand-red focus-visible:border-brand-red"
                    />
                </div>

                <Button type="submit" className="w-full h-11 text-base font-bold bg-[#a81b21] hover:bg-[#8e161c] shadow-lg shadow-red-100" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                </Button>
            </form>
        </div>
    );
}
