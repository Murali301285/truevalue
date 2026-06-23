"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function FeedbackModal() {
    const [fields, setFields] = useState<any[]>([]);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return; // Only fetch when opened
        if (fields.length > 0) return;

        fetch("/api/feedback/config")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setFields(data.filter(f => f.isActive));
                }
            })
            .catch(err => console.error("Failed to load feedback config", err));
    }, [isOpen, fields.length]);

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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-brand-red text-brand-red hover:bg-red-50 font-medium">
                    <MessageSquare className="w-4 h-4" /> Submit Your Feedback
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Share Your Feedback</DialogTitle>
                    <DialogDescription>
                        Help us improve your experience. Your feedback is highly valued and sent directly to our team.
                    </DialogDescription>
                </DialogHeader>

                {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900">Thank You!</h3>
                        <p className="text-zinc-500 text-sm">Your feedback has been successfully submitted.</p>
                        <Button variant="outline" className="mt-6" onClick={() => { setIsSubmitted(false); setResponses({}); }}>Submit Another</Button>
                    </div>
                ) : (
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
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
                        
                        <div className="pt-4 mt-4 border-t border-zinc-100">
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
            </DialogContent>
        </Dialog>
    );
}
