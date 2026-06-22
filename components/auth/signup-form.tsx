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
    
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [password, setPassword] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [dpdpAccepted, setDpdpAccepted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validations
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast({
                title: "Invalid Email",
                description: "Please enter a valid email address.",
                variant: "destructive"
            });
            return;
        }

        const cleanMobile = mobileNumber.replace(/[\s\-+()]/g, '');
        if (!/^\d{7,15}$/.test(cleanMobile)) {
            toast({
                title: "Invalid Mobile Number",
                description: "Please enter a valid mobile number (7-15 digits).",
                variant: "destructive"
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: "Invalid Password",
                description: "Password must be at least 6 characters long.",
                variant: "destructive"
            });
            return;
        }

        if (!termsAccepted) {
            toast({
                title: "Terms and Conditions",
                description: "You must agree to the Terms & Conditions.",
                variant: "destructive"
            });
            return;
        }

        if (!dpdpAccepted) {
            toast({
                title: "DPDP Consent",
                description: "You must provide your explicit consent under the DPDP Act.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, mobileNumber, password, termsAccepted, dpdpAccepted }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast({
                    title: "Registration Failed",
                    description: data.message || "Could not create account.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Account Created!",
                    description: "You can now sign in with your credentials.",
                });
                router.push("/login");
            }
        } catch (error) {
            console.error("Signup error:", error);
            toast({
                title: "Error",
                description: "Something went wrong.",
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
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="pl-10 h-11 bg-gray-50 border-gray-200 focus-visible:ring-brand-red focus-visible:border-brand-red"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-semibold">Email Address</Label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                        </div>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Your Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="off"
                            className="pl-10 h-11 bg-gray-50 border-gray-200 focus-visible:ring-brand-red focus-visible:border-brand-red"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mobileNumber" className="text-gray-700 font-semibold">Mobile Number</Label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        </div>
                        <Input
                            id="mobileNumber"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9+\s()\-]/g, ''))}
                            required
                            autoComplete="off"
                            className="pl-10 h-11 bg-gray-50 border-gray-200 focus-visible:ring-brand-red focus-visible:border-brand-red"
                        />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-semibold">Password</Label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </div>
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            autoComplete="new-password"
                            className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 focus-visible:ring-brand-red focus-visible:border-brand-red"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                <div className="space-y-4 pt-2 pb-2">
                    <div className="flex items-start space-x-2">
                        <input 
                            type="checkbox" 
                            id="terms" 
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            required 
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-red focus:ring-brand-red" 
                        />
                        <label htmlFor="terms" className="text-gray-500 font-medium text-sm leading-snug">
                            I accept the <a href="#" className="text-brand-red hover:underline">Terms and Conditions</a>
                        </label>
                    </div>

                    <div className="flex items-start space-x-2">
                        <input 
                            type="checkbox" 
                            id="dpdp" 
                            checked={dpdpAccepted}
                            onChange={(e) => setDpdpAccepted(e.target.checked)}
                            required 
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-red focus:ring-brand-red" 
                        />
                        <label htmlFor="dpdp" className="text-gray-500 font-medium text-sm leading-snug">
                            I provide my explicit consent under the DPDP Act.
                        </label>
                    </div>
                </div>

                <Button type="submit" className="w-full h-11 text-base font-bold bg-[#a81b21] hover:bg-[#8e161c] shadow-lg shadow-red-100" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                </Button>
            </form>
        </div>
    );
}
