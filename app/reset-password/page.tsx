import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-10">
                <div className="text-center space-y-2 mb-8">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-6 text-brand-red">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Set New Password
                    </h1>
                    <p className="text-gray-500 text-sm">Create a new, strong password for your account.</p>
                </div>
                <Suspense fallback={<div className="text-center text-sm text-gray-500">Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
