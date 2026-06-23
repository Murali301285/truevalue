"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function FeedbackConfigPage() {
    const [fields, setFields] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetch("/api/feedback/config")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setFields(data.sort((a, b) => a.order - b.order));
                }
                setIsLoading(false);
            })
            .catch(e => {
                console.error(e);
                setIsLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/feedback/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fields })
            });
            const data = await res.json();
            if (data.success) {
                toast({ title: "Config Saved", description: "Chatbot feedback fields updated successfully." });
            } else {
                toast({ title: "Error", description: data.error || "Failed to save config.", variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const addField = () => {
        setFields([...fields, { id: Date.now().toString(), label: "New Question", type: "SLIDER", isActive: true }]);
    };

    const removeField = (index: number) => {
        const newFields = [...fields];
        newFields.splice(index, 1);
        setFields(newFields);
    };

    const updateField = (index: number, key: string, value: any) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], [key]: value };
        setFields(newFields);
    };

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Feedback Configuration</h1>
                    <p className="text-sm text-gray-500 mt-1">Add, remove, or re-order questions shown in the user feedback.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 space-y-6">
                {fields.map((field, index) => (
                    <div key={field.id || index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                        <div className="w-full sm:w-1/2">
                            <label className="text-xs font-semibold text-zinc-500 mb-1 block">Question Label</label>
                            <Input 
                                value={field.label} 
                                onChange={(e) => updateField(index, "label", e.target.value)}
                            />
                        </div>
                        
                        <div className="w-full sm:w-1/4">
                            <label className="text-xs font-semibold text-zinc-500 mb-1 block">Input Type</label>
                            <Select value={field.type} onValueChange={(val) => updateField(index, "type", val)}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SLIDER">Slider (1-10)</SelectItem>
                                    <SelectItem value="TEXT">Text Box</SelectItem>
                                    <SelectItem value="CHECKBOX">Checkbox</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-4 mt-5">
                            <div className="flex items-center gap-2">
                                <Switch 
                                    checked={field.isActive} 
                                    onCheckedChange={(checked) => updateField(index, "isActive", checked)}
                                />
                                <span className="text-sm font-medium text-zinc-600">{field.isActive ? "Active" : "Hidden"}</span>
                            </div>

                            <Button variant="ghost" size="icon" onClick={() => removeField(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                    <Button variant="outline" onClick={addField} className="border-dashed border-zinc-300">
                        <Plus className="w-4 h-4 mr-2" /> Add Question
                    </Button>

                    <Button onClick={handleSave} disabled={isSaving} className="bg-[#a81b21] hover:bg-[#8e161c] text-white">
                        {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Configuration</>}
                    </Button>
                </div>
            </div>
        </div>
    );
}
