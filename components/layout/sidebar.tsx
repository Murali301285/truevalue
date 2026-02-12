"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import {
    LayoutDashboard,
    Home,
    Wallet,
    CalendarDays,
    FileBarChart,
    Settings,
    Users,
    Building2,
    ChevronLeft,
    ChevronRight,
    Calculator
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const { data: session } = useSession();
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const [isConfigOpen, setIsConfigOpen] = React.useState(true)

    return (
        <div className={cn("relative border-r bg-white h-full flex flex-col transition-all duration-300", isCollapsed ? "w-16" : "w-64", className)}>

            {/* Brand Header */}
            <div className="h-16 flex items-center px-4 border-b border-zinc-100 overflow-hidden whitespace-nowrap">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <div className="w-8 h-8 min-w-[32px] bg-brand-red rounded-lg flex items-center justify-center text-white font-black text-sm">
                        M
                    </div>
                    {!isCollapsed && (
                        <span className="text-zinc-900 transition-opacity duration-300">
                            My<span className="text-brand-red">Value</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Collapse Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-zinc-200 bg-white shadow-sm z-10 text-zinc-400 hover:text-zinc-900"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">

                <NavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Home" collapsed={isCollapsed} active={pathname === "/dashboard"} />
                <NavLink href="/calendar" icon={<CalendarDays className="w-4 h-4" />} label="Calendar" collapsed={isCollapsed} active={pathname === "/calendar"} />
                <NavLink href="/reports" icon={<FileBarChart className="w-4 h-4" />} label="Reports" collapsed={isCollapsed} active={pathname === "/reports"} />

                {/* Configuration Group - Admin Only */}
                {(!isCollapsed && (session?.user as any)?.role === 'ADMIN') ? (
                    <Collapsible open={isConfigOpen} onOpenChange={setIsConfigOpen} className="mt-6">
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between hover:bg-zinc-50 px-3 h-9 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                                <span>Configuration</span>
                                {isConfigOpen ? <ChevronRight className="h-3 w-3 rotate-90 transition-transform" /> : <ChevronRight className="h-3 w-3 transition-transform" />}
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1 pl-2">
                            <NavLink href="/config/user" icon={<Users className="w-4 h-4" />} label="Users" collapsed={false} active={pathname.includes("/config/user")} />
                            <NavLink href="/config/industry" icon={<Building2 className="w-4 h-4" />} label="Industry / Sector" collapsed={false} active={pathname.includes("/config/industry")} />
                            <NavLink href="/config/pricing" icon={<Wallet className="w-4 h-4" />} label="Pricing" collapsed={false} active={pathname.includes("/config/pricing")} />
                            <NavLink href="/config/payment" icon={<Wallet className="w-4 h-4" />} label="Payment" collapsed={false} active={pathname.includes("/config/payment")} />
                            <NavLink href="/config/ai-model" icon={<Calculator className="w-4 h-4" />} label="AI Model" collapsed={false} active={pathname.includes("/config/ai-model")} />
                        </CollapsibleContent>
                    </Collapsible>
                ) : (
                    <div className="mt-4 pt-4 border-t border-zinc-100 space-y-1">
                        <NavLink href="/config/company" icon={<Building2 className="w-4 h-4" />} label="Company" collapsed={true} active={pathname.includes("/config/company")} />
                        {/* <NavLink href="/config/customer" icon={<Users className="w-4 h-4" />} label="Customer" collapsed={true} active={pathname.includes("/config/customer")} /> */}
                        <NavLink href="/config/user" icon={<Users className="w-4 h-4" />} label="User" collapsed={true} active={pathname.includes("/config/user")} />
                        <NavLink href="/settings/index-config" icon={<Calculator className="w-4 h-4" />} label="Score" collapsed={true} active={pathname.includes("/settings/index-config")} />
                    </div>
                )}
            </div>

            {/* Footer Copyright (Only visible when expanded) */}

        </div>
    )
}

function NavLink({ href, icon, label, collapsed, active }: { href: string; icon: React.ReactNode; label: string; collapsed: boolean; active?: boolean }) {
    if (collapsed) {
        return (
            <Link
                href={href}
                className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-md transition-colors",
                    active ? "bg-red-50 text-brand-red" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                )}
                title={label}
            >
                {icon}
            </Link>
        )
    }

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active ? "bg-red-50 text-brand-red" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            )}
        >
            {icon}
            <span>{label}</span>
        </Link>
    )
}
