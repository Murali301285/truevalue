import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, BarChart, FileText, ArrowRight, Shield, Zap, Lock } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="flex items-center justify-between px-6 md:px-12 h-20 border-b border-gray-100 bg-white sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center text-white font-black text-sm">
                        <BarChart className="w-4 h-4" />
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">MyValue</span>
                </div>
                <div className="flex items-center gap-6">
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
                        <Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link>
                        <Link href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
                    </nav>
                    <Link href="/login">
                        <Button className="bg-brand-red hover:bg-[#8e161c] text-white px-6">Login</Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-20 pb-16 px-6 text-center max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-brand-red text-xs font-bold uppercase tracking-wider mb-6 border border-red-100">
                    New: AI-Powered Analysis
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
                    Professional MSME <br />
                    Valuations, <span className="relative inline-block">
                        <span className="relative z-10">Instantly.</span>
                        <span className="absolute bottom-2 left-0 w-full h-3 bg-red-100 -z-0 transform -rotate-1 rounded-sm"></span>
                    </span>
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                    The fastest way for Indian small businesses to get indicative valuations for loans, investments, or internal planning. Start with our Express Tier today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/login">
                        <Button size="lg" className="bg-brand-red hover:bg-[#8e161c] text-white h-14 px-8 rounded-full text-lg shadow-xl shadow-red-200 hover:shadow-2xl hover:shadow-red-200 transition-all transform hover:-translate-y-1">
                            Start Your Valuation <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 bg-gray-50 px-6">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Zap className="w-6 h-6 text-brand-red" />,
                            title: "Instant Algorithm",
                            desc: "Proprietary calculation logic trained on 20+ MSME sectors for high accuracy and speed."
                        },
                        {
                            icon: <Shield className="w-6 h-6 text-brand-red" />,
                            title: "Bank-Ready Reports",
                            desc: "Professional PDF reports formatted for credit submissions and internal reviews."
                        },
                        {
                            icon: <Lock className="w-6 h-6 text-brand-red" />,
                            title: "DPDP Compliant",
                            desc: "Enterprise-grade security ensuring your financial data is private and encrypted."
                        }
                    ].map((feature, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-6 bg-white">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-[#a81b21] mb-4">Choose Your Tier</h2>
                    <p className="text-xl text-gray-500">Simple, transparent pricing for every stage of your business.</p>
                </div>

                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 items-start">
                    {/* Express Plan */}
                    <div className="relative bg-white border-2 border-brand-red rounded-3xl p-8 shadow-2xl shadow-red-50 transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-[#a81b21] mb-2">Express</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-extrabold text-[#a81b21]">₹499</span>
                                <span className="text-gray-500">/report</span>
                            </div>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {[
                                "95% Automated",
                                "Instant Calculation",
                                "4-Page PDF Report",
                                "Indicative Use Only"
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-gray-600">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-green-600" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link href="/login">
                            <Button className="w-full h-12 bg-[#a81b21] hover:bg-[#8e161c] text-white font-bold rounded-xl shadow-lg shadow-red-100">
                                Get Started
                            </Button>
                        </Link>
                    </div>

                    {/* Standard Plan */}
                    <div className="relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 transition-colors opacity-80">
                        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                            <span className="bg-[#fffbeb] text-[#b45309] text-xs font-bold px-3 py-1 rounded-full border border-[#fcd34d] uppercase tracking-wide">Coming Soon</span>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-[#a81b21] mb-2">Standard</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-extrabold text-[#a81b21]">₹4,999</span>
                                <span className="text-gray-500">/report</span>
                            </div>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {[
                                "60% Automated",
                                "Analyst Verification",
                                "10-Page Detailed Report",
                                "Loan Submission Ready"
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-gray-600">
                                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-gray-400" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Button disabled className="w-full h-12 bg-gray-100 text-gray-400 font-bold rounded-xl">
                            Notify Me
                        </Button>
                    </div>

                    {/* Certified Plan */}
                    <div className="relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 transition-colors opacity-80">
                        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                            <span className="bg-[#fffbeb] text-[#b45309] text-xs font-bold px-3 py-1 rounded-full border border-[#fcd34d] uppercase tracking-wide">Coming Soon</span>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-[#a81b21] mb-2">Certified</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-extrabold text-[#a81b21]">₹14,999</span>
                                <span className="text-gray-500">/report</span>
                            </div>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {[
                                "40% Automated",
                                "CA/RV Certified",
                                "Regulatory Compliance",
                                "Stamp Duty Ready",
                                "Manual Scrutiny"
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-gray-600">
                                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-gray-400" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Button disabled className="w-full h-12 bg-gray-100 text-gray-400 font-bold rounded-xl">
                            Notify Me
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="max-w-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-brand-red rounded-md flex items-center justify-center text-white text-xs font-black">
                                <BarChart className="w-3 h-3" />
                            </div>
                            <span className="text-lg font-bold text-brand-red tracking-tight">MyValue</span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed mb-4">
                            Building trust in Indian MSMEs through real-time, professional valuation services.
                        </p>
                        <p className="text-xs text-brand-red">© myvalue.realsme.in 2026</p>
                    </div>
                    <div className="grid grid-cols-2 gap-12">
                        <div>
                            <h4 className="font-bold text-brand-red mb-4 text-sm uppercase tracking-wide">Platform</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li>Home</li>
                                <li>Pricing</li>
                                <li>FAQs</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-brand-red mb-4 text-sm uppercase tracking-wide">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li>Privacy Policy</li>
                                <li>Refund Policy</li>
                                <li>Terms of Use</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
