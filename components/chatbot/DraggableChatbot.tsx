"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { MessageCircle, X, Maximize2, Minimize2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DraggableChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    
    // Shared motion values for position
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const constraintsRef = useRef(null);

    // Chat state
    const [messages, setMessages] = useState<{role: 'user'|'bot', content: string}[]>([
        { role: 'bot', content: 'Hello! How can I help you today?' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Snap back on resize
        const handleResize = () => {
            x.set(0);
            y.set(0);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [x, y]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const toggleMaximize = () => {
        if (!isMaximized) {
            x.set(0);
            y.set(0);
        }
        setIsMaximized(!isMaximized);
    };

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;
        
        setMessages(prev => [...prev, { role: 'user', content: inputValue }]);
        setInputValue("");
        
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'bot', content: 'Thank you for your message. This chatbot is currently under implementation, but we have noted your request!' }]);
        }, 1000);
    };

    return (
        <div ref={constraintsRef} className="fixed inset-0 z-[100] pointer-events-none">
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        drag
                        dragConstraints={constraintsRef}
                        dragElastic={0.1}
                        dragMomentum={false}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        style={{ x, y, position: 'absolute' }}
                        className="bottom-6 right-6 pointer-events-auto"
                    >
                        <Button 
                            onClick={() => setIsOpen(true)}
                            className="h-14 w-14 rounded-full bg-brand-red hover:bg-red-700 shadow-xl shadow-red-900/20 text-white flex items-center justify-center transition-transform hover:scale-110 cursor-grab active:cursor-grabbing"
                        >
                            <MessageCircle className="h-6 w-6" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        drag={!isMaximized}
                        dragConstraints={constraintsRef}
                        dragElastic={0.1}
                        dragMomentum={false}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={
                            isMaximized 
                            ? { opacity: 1, scale: 1, width: "100%", height: "100%", bottom: 0, right: 0, borderRadius: 0 } 
                            : { opacity: 1, scale: 1, width: 380, height: 600, bottom: 24, right: 24, borderRadius: 16 }
                        }
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        style={isMaximized ? { position: 'absolute', x: 0, y: 0 } : { x, y, position: 'absolute' }}
                        className={`bg-white shadow-2xl border border-zinc-200 flex flex-col overflow-hidden pointer-events-auto ${isMaximized ? 'fixed inset-0 z-[100]' : ''}`}
                    >
                        {/* Header */}
                        <div className="bg-brand-red p-3 text-white flex flex-col cursor-grab active:cursor-grabbing relative">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5" />
                                    <h3 className="font-semibold">Support Desk</h3>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={toggleMaximize}>
                                        {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            <span className="text-[11px] text-red-100 uppercase tracking-wider font-semibold opacity-90 px-1">
                                ⚠ This Chatbot is under implementation
                            </span>
                        </div>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-4 bg-zinc-50 flex flex-col gap-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-xl p-3 text-sm shadow-sm ${msg.role === 'user' ? 'bg-brand-red text-white rounded-br-none' : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-none'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-zinc-200">
                            <form onSubmit={handleSend} className="flex items-center gap-2">
                                <Input 
                                    placeholder="Type your message here..." 
                                    className="flex-1 h-10 bg-zinc-50"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                />
                                <Button type="submit" size="icon" className="h-10 w-10 bg-brand-red hover:bg-red-700 text-white shrink-0">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
