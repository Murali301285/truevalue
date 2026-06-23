"use client"

import * as framerMotion from "framer-motion";
const motion = framerMotion.motion;
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
    return (
        <section className="pt-20 pb-16 px-6 text-center max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-brand-red text-xs font-bold uppercase tracking-wider mb-6 border border-red-100"
            >
                New: AI-Powered Analysis
            </motion.div>

            <motion.h1
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 1 },
                    visible: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.3
                        }
                    }
                }}
                className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight"
            >
                {/* Row 1 */}
                <span className="block mb-2">
                    <motion.span
                        variants={{
                            hidden: { opacity: 0, scale: 0.5 },
                            visible: { opacity: 1, scale: 1 }
                        }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="inline-block mr-3"
                    >
                        Your starting point
                    </motion.span>
                </span>

                {/* Row 2 */}
                <span className="block">
                    <motion.span
                        variants={{
                            hidden: { opacity: 0, scale: 0.5 },
                            visible: { opacity: 1, scale: 1 }
                        }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="inline-block mr-3"
                    >
                        for
                    </motion.span>
                    <span className="relative inline-block">
                        <motion.span
                            variants={{
                                hidden: { opacity: 0, scale: 0.5 },
                                visible: { opacity: 1, scale: 1 }
                            }}
                            transition={{ duration: 0.5, type: "spring" }}
                            className="relative z-10 inline-block"
                        >
                            Business Valuation
                        </motion.span>
                        <motion.span
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
                            className="absolute bottom-2 left-0 h-3 bg-red-100 -z-0 transform -rotate-1 rounded-sm"
                        />
                    </span>
                </span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
                The fastest way for Indian small businesses to get indicative valuations for loans, investments, or internal planning. Start with our Express Tier today.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
                <Link href="/login">
                    <Button
                        size="lg"
                        className="bg-brand-red hover:bg-[#8e161c] text-white h-14 px-8 rounded-full text-lg shadow-xl shadow-red-200 hover:shadow-2xl hover:shadow-red-200 transition-all transform hover:-translate-y-1"
                    >
                        Start Your Valuation <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </Link>
            </motion.div>
        </section>
    )
}
