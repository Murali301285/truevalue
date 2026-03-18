"use client"

import { motion } from "framer-motion"

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    desc: string;
    index: number;
}

export function FeatureCard({ icon, title, desc, index }: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover="hover"
            variants={{
                hover: {
                    y: -5,
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)"
                }
            }}
            className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm transition-colors"
        >
            <motion.div
                variants={{
                    hover: {
                        scale: 1.1,
                        rotate: 5,
                        backgroundColor: "#fee2e2", // red-100
                    }
                }}
                className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6"
            >
                {icon}
            </motion.div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-500 leading-relaxed">{desc}</p>
        </motion.div>
    )
}
