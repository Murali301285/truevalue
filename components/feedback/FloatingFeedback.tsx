"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function FloatingFeedback() {
    const [fields, setFields] = useState<any[]>([]);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return; // Only fetch when opened, or fetch once
        if (fields.length > 0) return;

        fetch("/api/feedback/config")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setFields(data.filter(f => f.isActive));
                }
            })
            .catch(err => console.error("Failed to load feedback config", err));
    }, [isOpen]);

    const handleFieldChange = (id: string, value: any) => {
        setResponses(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = { ...responses };
            // Auto-fill sliders with 5 if not touched
            fields.forEach(f => {
                if (f.type === "SLIDER" && payload[f.id] === undefined) {
                    payload[f.id] = 5;
                }
            });

            await fetch("/api/feedback/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ responses: payload })
            });
            setIsSubmitted(true);
        } catch (error) {
            console.error("Submission failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button 
                    className="fixed right-0 top-1/2 -translate-y-1/2 rotate-90 origin-bottom-right bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg rounded-t-lg rounded-b-none px-4 h-10 border-t border-l border-r border-zinc-700 z-50 flex items-center gap-2 tracking-wide font-medium"
                    style={{ transform: 'rotate(-90deg) translateX(50%) translateY(100%)', transformOrigin: 'bottom right' }}
                >
                    <MessageSquare className="w-4 h-4" /> Platform Feedback
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] z-[101] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>Share Your Feedback</SheetTitle>
                    <SheetDescription>
                        Help us improve your experience. Your feedback is directly sent to our administration team.
                    </SheetDescription>
                </SheetHeader>

                {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900">Thank You!</h3>
                        <p className="text-zinc-500 text-sm">Your feedback has been successfully submitted.</p>
                        <Button variant="outline" className="mt-6" onClick={() => { setIsSubmitted(false); setResponses({}); }}>Submit Another</Button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {fields.map(field => (
                            <div key={field.id} className="space-y-4">
                                <label className="text-sm font-semibold text-zinc-800">{field.label}</label>
                                
                                {field.type === "SLIDER" && (
                                    <div className="space-y-2">
                                        <Slider 
                                            defaultValue={[5]} 
                                            max={10} 
                                            min={1} 
                                            step={1}
                                            onValueChange={(val) => handleFieldChange(field.id, val[0])}
                                        />
                                        <div className="flex justify-between text-xs font-medium text-zinc-400">
                                            <span>1 (Poor)</span>
                                            <span className="text-brand-red font-bold text-sm bg-red-50 px-2 py-0.5 rounded">{responses[field.id] || 5}</span>
                                            <span>10 (Excellent)</span>
                                        </div>
                                    </div>
                                )}

                                {field.type === "TEXT" && (
                                    <Textarea 
                                        placeholder="Type your comments here..."
                                        className="resize-none h-24"
                                        value={responses[field.id] || ""}
                                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}
                        
                        <div className="pt-4 border-t border-zinc-100">
                            <Button 
                                className="w-full bg-[#a81b21] hover:bg-[#8e161c] text-white font-bold h-12"
                                disabled={isSubmitting || fields.length === 0}
                                onClick={handleSubmit}
                            >
                                {isSubmitting ? "Submitting..." : (
                                    <>Submit Feedback <Send className="w-4 h-4 ml-2" /></>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
