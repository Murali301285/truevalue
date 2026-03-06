"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, User, HelpCircle, Phone, Mail, ChevronDown, Send, MessageCircle } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function Header() {
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
            {/* Left side (Page Title placeholder or Breadcrumbs could go here) */}
            <div className="text-sm font-medium text-zinc-500">
                Welcome back, {user?.name || "User"}
            </div>

            {/* Right Side: User Menu */}
            <div className="flex items-center gap-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" className="hidden md:flex items-center gap-2 text-zinc-500 hover:text-brand-red hover:bg-red-50 transition-colors">
                            <HelpCircle className="w-4 h-4" />
                            <span>Support & Help</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                <HelpCircle className="w-6 h-6 text-brand-red" /> Support & Help center
                            </DialogTitle>
                            <DialogDescription>
                                Find answers to your questions or get in touch with our team.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid md:grid-cols-2 gap-8 py-6">
                            {/* FAQ Section */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-800 text-base">Frequently Asked Questions</h4>
                                {[
                                    { q: "What is each tier for?", a: "Instant is for quick estimates. Standard uses OCR for accuracy. Certified is for official use with analyst verification." },
                                    { q: "What documents do I need?", a: "For Standard/Certified, you need P&L statements (3 years) and balance sheets." },
                                    { q: "How long does it take?", a: "Instant reports are generated in seconds. Standard takes ~24 hours. Certified takes 2-3 business days." },
                                    { q: "Is my data secure?", a: "Yes, we use bank-grade encryption and do not share your data with third parties without consent." }
                                ].map((faq, i) => (
                                    <details key={i} className="group bg-zinc-50 border border-zinc-200 rounded-lg open:ring-1 open:ring-brand-red/20 transition-all cursor-pointer">
                                        <summary className="flex items-center justify-between p-4 font-medium text-gray-800 list-none select-none hover:bg-zinc-100/50 rounded-lg transition-colors">
                                            {faq.q}
                                            <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform duration-300" />
                                        </summary>
                                        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300">
                                            {faq.a}
                                        </div>
                                    </details>
                                ))}
                            </div>

                            {/* Contact Section */}
                            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 h-fit">
                                <h4 className="font-semibold text-gray-800 text-base mb-4">Still have questions?</h4>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white rounded-full border border-gray-200 shadow-sm">
                                            <Mail className="w-4 h-4 text-brand-red" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Email Support</p>
                                            <p className="text-xs text-gray-500">support@platform.com</p>
                                            <p className="text-[10px] text-gray-400">10 AM - 7 PM IST</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white rounded-full border border-gray-200 shadow-sm">
                                            <Phone className="w-4 h-4 text-brand-red" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Phone Support</p>
                                            <p className="text-xs text-gray-500">+91-9876543210</p>
                                            <p className="text-[10px] text-gray-400">11 AM - 6 PM IST</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-6 border-t border-zinc-200">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quick Query</p>
                                    <Input placeholder="Your Name" className="bg-white border-zinc-200 focus:border-brand-red focus:ring-brand-red/20" />
                                    <Input placeholder="Email Address" className="bg-white border-zinc-200 focus:border-brand-red focus:ring-brand-red/20" />
                                    <Textarea placeholder="How can we help?" className="min-h-[80px] bg-white border-zinc-200 focus:border-brand-red focus:ring-brand-red/20 resize-none" />
                                    <Button className="w-full bg-brand-red hover:bg-red-700 text-white font-medium">
                                        <Send className="w-3 h-3 mr-2" /> Send Message
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9 border border-zinc-200">
                                <AvatarImage src={user?.image || ""} alt={user?.name || "@user"} />
                                <AvatarFallback className="bg-red-50 text-brand-red font-bold">
                                    {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name || "Guest User"}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email || "No email"}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile" className="flex items-center cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
