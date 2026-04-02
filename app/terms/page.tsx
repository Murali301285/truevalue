import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12">
                <div className="mb-8">
                    <Link href="/signup" className="text-gray-500 hover:text-brand-red inline-flex items-center text-sm font-medium transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Signup
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Terms and Conditions</h1>
                    <p className="text-sm text-gray-500">Last updated: April 1, 2026</p>
                </div>

                <div className="prose prose-sm sm:prose-base text-gray-600 max-w-none space-y-6">
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By creating an account, accessing, or using the MyValue valuation platform ("Service"), 
                            you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, 
                            you may not access the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">2. Description of Service</h2>
                        <p>
                            MyValue provides automated and semi-automated business valuation estimates based on inputs provided by the user and prevailing market heuristics. 
                            <strong> Disclaimer:</strong> Our standard automated reports are strictly indicative and do not constitute formal, certified valuations under ICAI Valuation Standards or regulatory purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">3. Data Privacy and DPDP Compliance</h2>
                        <p>
                            We treat all financial and operational data provided during the valuation process with strict confidentiality. 
                            Your data is processed in compliance with the Digital Personal Data Protection (DPDP) Act of India. 
                            We do not share your raw financial data with third-parties without your explicit consent.
                        </p>
                    </section>
                    
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">4. User Responsibilities</h2>
                        <p>
                            You agree to provide accurate, current, and complete information during the registration and valuation process. 
                            MyValue is not liable for inaccurate valuation results stemming from false or misrepresented data inputs.
                        </p>
                    </section>
                    
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">5. Account Security</h2>
                        <p>
                            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. 
                            You agree not to disclose your password to any third party.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
