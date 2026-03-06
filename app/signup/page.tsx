import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 font-sans py-12">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 sm:p-10">
                <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    Back to Home
                </a>

                <div className="text-center space-y-2 mb-8">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-6 text-brand-red">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Create an Account
                    </h1>
                    <p className="text-gray-500 text-sm">Join <span className="text-brand-red font-semibold">MyValue</span> to start your valuation</p>
                </div>

                <SignupForm />

                <div className="mt-8 text-center text-sm text-gray-500">
                    Already have an account? <a href="/login" className="text-brand-red font-bold hover:underline">Sign in</a>
                </div>
            </div>
        </div>
    );
}
