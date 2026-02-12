import Link from "next/link";
import { LayoutDashboard, PlusCircle, Users, FileBarChart, Settings, LogOut, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen overflow-hidden bg-zinc-50 text-zinc-900 font-sans flex">
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto hover-scrollbar p-6 md:p-8 max-w-7xl mx-auto w-full">
                    {children}

                    {/* Mobile/Footer fallback for small screens (Optional) */}
                </main>

                {/* Global Footer (Sticky at bottom of main view if content is short, or scrolls) */}
                <footer className="border-t border-zinc-200 bg-white p-4 text-center text-[10px] text-zinc-400">
                    <span className="text-zinc-900 font-bold">MyValue</span> Copyright <span className="text-brand-red">2026</span>
                </footer>
            </div>
        </div>
    );
}
