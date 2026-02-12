
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 font-sans">
            <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl p-8 relative">
                <a href="/" className="absolute top-8 left-8 text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium transition-colors">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    Back to Home
                </a>

                <div className="mt-8 text-center space-y-2 mb-8">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-6 text-brand-red">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Welcome Back
                    </h1>
                    <p className="text-gray-500 text-sm">Sign in to your <span className="text-brand-red font-semibold">MyValue</span> account</p>
                </div>
                <LoginForm />

                <div className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account? <a href="/signup" className="text-brand-red font-bold hover:underline">Sign up</a>
                </div>
            </div>
        </div>
    );
}
