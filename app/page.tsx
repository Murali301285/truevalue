"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, BarChart, FileText, ArrowRight, Shield, Zap, Lock, TrendingUp, ClipboardCheck, Search, Clock, LogIn, FileEdit, CreditCard, Download } from "lucide-react";
import * as framerMotion from "framer-motion";
const motion = framerMotion.motion;
import { NotifyMeModal } from "@/components/landing/notify-me-modal";
import { FeatureCard } from "@/components/landing/feature-card";
import { HeroSection } from "@/components/landing/hero-section";

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
            <HeroSection />

            {/* Features Grid */}
            <section id="features" className="py-20 bg-gray-50 px-6">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Zap className="w-6 h-6 text-brand-red" />,
                            title: "Instant Algorithm",
                            desc: "Proprietary MSME valuation framework designed to provide consistent business valuations."
                        },
                        {
                            icon: <Shield className="w-6 h-6 text-brand-red" />,
                            title: "Professionally formatted",
                            desc: "Reports that suitable for discussions with lenders, investors and advisors."
                        },
                        {
                            icon: <Lock className="w-6 h-6 text-brand-red" />,
                            title: "DPDP Compliant",
                            desc: "Enterprise-grade security ensuring your financial data is private and encrypted."
                        },
                        {
                            icon: <TrendingUp className="w-6 h-6 text-brand-red" />,
                            title: "Financial Analysis",
                            desc: "Review trends, margins, and anomalies."
                        },
                        {
                            icon: <ClipboardCheck className="w-6 h-6 text-brand-red" />,
                            title: "Valuation Assumptions",
                            desc: "Verify sector classification, growth rates, and WACC."
                        },
                        {
                            icon: <Search className="w-6 h-6 text-brand-red" />,
                            title: "Detailed Ratio Analysis",
                            desc: "Detailed ratio analysis, and a thorough review of all three valuation methods (DCF, Market, Asset)."
                        }
                    ].map((feature, i) => (
                        <FeatureCard
                            key={i}
                            index={i}
                            icon={feature.icon}
                            title={feature.title}
                            desc={feature.desc}
                        />
                    ))}
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pt-4 pb-24 px-6 bg-white">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-[#a81b21] mb-4">Choose the Tier to Start Your Valuation</h2>
                    <p className="text-xl text-gray-500">Simple, transparent pricing for every stage of your business.</p>
                </div>

                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 items-start">
                    {/* Express Plan */}
                    <div className="relative bg-white border-2 border-brand-red rounded-3xl p-8 shadow-2xl shadow-red-50 transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-[#a81b21]">Express</h3>
                                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                                    <Zap className="w-5 h-5 text-[#a81b21] fill-[#a81b21]/20" />
                                </motion.div>
                            </div>
                            <p className="text-sm text-gray-500 font-medium mb-2">Indicative Valuation</p>
                            <div className="flex items-baseline gap-1 mb-3">
                                <span className="text-5xl font-extrabold text-[#a81b21]">₹499</span>
                                <span className="text-gray-500">/report</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-brand-red border border-red-100">
                                <Clock className="w-3.5 h-3.5" /> Turnaround: ~2 Minutes
                            </div>
                        </div>
                        <ul className="space-y-4 mb-6">
                            {[
                                "Quick estimate",
                                "Financial snapshot",
                                "Understand current valuation"
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-gray-600">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-green-600" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <div className="text-xs text-gray-400 mb-8 italic">
                            EBITA/Profit Multiplier Method used
                        </div>
                        <Link href="/login">
                            <Button className="w-full h-12 bg-[#a81b21] hover:bg-[#8e161c] text-white font-bold rounded-xl shadow-lg shadow-red-100">
                                Get Started
                            </Button>
                        </Link>
                    </div>

                    {/* Standard Plan */}
                    <div className="relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 transition-colors opacity-80">
                        <div className="absolute -top-3 right-6">
                            <span className="bg-yellow-50 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200 uppercase tracking-wide shadow-sm">Coming Soon</span>
                        </div>
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-[#a81b21]">Standard</h3>
                                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.3, ease: "easeInOut" }}>
                                    <BarChart className="w-5 h-5 text-[#a81b21] fill-[#a81b21]/20" />
                                </motion.div>
                            </div>
                            <p className="text-sm text-gray-500 font-medium mb-2">Business Review</p>
                            <div className="flex items-baseline gap-1 mb-3">
                                <span className="text-5xl font-extrabold text-[#a81b21]">₹4,999</span>
                                <span className="text-gray-500">/report</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                                <Clock className="w-3.5 h-3.5" /> Turnaround: ~10 Minutes
                            </div>
                        </div>
                        <ul className="space-y-4 mb-6">
                            {[
                                "Valuation",
                                "Dependency Assessment",
                                "Financial Analysis",
                                "Risk Review",
                                "Continuity Score"
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-gray-600">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-green-600" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <div className="text-xs text-gray-400 mb-8 italic">
                            Discounted Cash Flow (DCF) Method used
                        </div>
                        <NotifyMeModal
                            tier="Standard"
                            trigger={
                                <Button className="w-full h-12 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 hover:text-black transition-all border border-gray-200 shadow-sm">
                                    Notify Me
                                </Button>
                            }
                        />
                    </div>

                    {/* Certified Plan */}
                    <div className="relative bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 transition-colors opacity-80">
                        <div className="absolute -top-3 right-6">
                            <span className="bg-yellow-50 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200 uppercase tracking-wide shadow-sm">Coming Soon</span>
                        </div>
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-[#a81b21]">Certified</h3>
                                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.6, ease: "easeInOut" }}>
                                    <Shield className="w-5 h-5 text-[#a81b21] fill-[#a81b21]/20" />
                                </motion.div>
                            </div>
                            <p className="text-sm text-gray-500 font-medium mb-2">Professional Opinion</p>
                            <div className="flex items-baseline gap-1 mb-3">
                                <span className="text-5xl font-extrabold text-[#a81b21]">₹14,999</span>
                                <span className="text-gray-500">/report</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                                <Clock className="w-3.5 h-3.5" /> Turnaround: ~48 Hours
                            </div>
                        </div>
                        <ul className="space-y-4 mb-6">
                            {[
                                "Valuation",
                                "Manual Review",
                                "CA / RV Certification",
                                "Governance Review",
                                "Business Continuity Assessment"
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-gray-600">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-green-600" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <div className="text-xs text-gray-400 mb-8 italic">
                            Certified Multiple analytical models used.
                        </div>
                        <NotifyMeModal
                            tier="Certified"
                            trigger={
                                <Button className="w-full h-12 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 hover:text-black transition-all border border-gray-200 shadow-sm">
                                    Notify Me
                                </Button>
                            }
                        />
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="pt-16 pb-24 px-6 bg-white bg-[radial-gradient(#fecaca_1px,transparent_1px)] [background-size:20px_20px]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-[#a81b21] mb-6 tracking-tight">
                            How It Works
                        </h2>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-0 justify-between relative mt-10">
                        {[
                            { step: "1", title: "Login", desc: "Access the platform securely to save and manage your progress.", icon: <LogIn className="w-8 h-8" /> },
                            { step: "2", title: "Choose Tier", desc: "Select the valuation tier perfectly suited for your business needs.", icon: <BarChart className="w-8 h-8" /> },
                            { step: "3", title: "Enter Details", desc: "Provide basic company and financial data through our wizard.", icon: <FileEdit className="w-8 h-8" /> },
                            { step: "4", title: "Payment", desc: "Complete a secure transaction to unlock your valuation.", icon: <CreditCard className="w-8 h-8" /> },
                            { step: "5", title: "Get Report", desc: "Download your professional PDF report instantly.", icon: <Download className="w-8 h-8" /> },
                        ].map((item, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center text-center relative z-10 group">

                                {/* Curved Line (Only between items) - Placed before the circle to go behind it */}
                                {index < 4 && (
                                    <div className="hidden lg:block absolute top-[5rem] left-[50%] w-full -z-10 px-8 opacity-60">
                                        <svg viewBox="0 0 100 20" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                            <path
                                                d={index % 2 === 0 ? "M0,0 Q50,70 100,0" : "M0,0 Q50,-70 100,0"}
                                                fill="none"
                                                stroke="#a81b21"
                                                strokeWidth="1.2"
                                                strokeDasharray="4,6"
                                                vectorEffect="non-scaling-stroke"
                                            >
                                                <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
                                            </path>
                                        </svg>
                                    </div>
                                )}

                                {/* Main Circle */}
                                <div className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center mb-8 mx-auto transition-transform duration-300 hover:scale-105
                                    ${index === 0 ? 'bg-white shadow-[0_12px_40px_-10px_rgba(168,27,33,0.15)] border border-red-50' : 'bg-white border-[1.5px] border-dashed border-red-200'}
                                `}>
                                    {/* Number Badge */}
                                    <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-red-50 shadow-sm border border-red-100 flex items-center justify-center text-[10px] font-black text-brand-red z-20">
                                        {item.step}
                                    </div>

                                    {/* Icon Focus */}
                                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-brand-red">
                                        {item.icon}
                                    </div>
                                </div>

                                {/* Text content */}
                                <h3 className="text-[17px] font-bold text-gray-900 mb-3 tracking-tight">{item.title}</h3>
                                <p className="text-[13px] text-gray-500 leading-relaxed max-w-[180px] px-2">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 bg-gray-50 px-6">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Zap className="w-6 h-6 text-brand-red" />,
                            title: "Instant Algorithm",
                            desc: "Proprietary MSME valuation framework designed to provide consistent business valuations."
                        },
                        {
                            icon: <Shield className="w-6 h-6 text-brand-red" />,
                            title: "Professionally formatted",
                            desc: "Reports that suitable for discussions with lenders, investors and advisors."
                        },
                        {
                            icon: <Lock className="w-6 h-6 text-brand-red" />,
                            title: "DPDP Compliant",
                            desc: "Enterprise-grade security ensuring your financial data is private and encrypted."
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
                            whileHover={{
                                y: -12,
                                scale: 1.02,
                                boxShadow: "0 30px 60px -15px rgba(168, 27, 33, 0.15)",
                                borderColor: "#fecaca" // red-200
                            }}
                            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer transition-colors duration-300"
                        >
                            {/* Decorative background glow on hover */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-red-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0"></div>

                            <div className="relative z-10 w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-brand-red group-hover:border-transparent transition-all duration-300 shadow-sm">
                                {/* Cloned icon to allow color shifting without breaking the original mapped element */}
                                <div className="text-brand-red group-hover:text-white transition-colors duration-300 flex items-center justify-center">
                                    {feature.icon}
                                </div>
                            </div>
                            <h3 className="relative z-10 text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-red transition-colors duration-300">{feature.title}</h3>
                            <p className="relative z-10 text-[15px] text-gray-500 leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
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
                            Helping MSME owners understand, strengthen and value their businesses.
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
