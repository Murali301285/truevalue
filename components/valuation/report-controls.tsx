"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import Link from "next/link";

export function ReportControls() {
    return (
        <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden print-controls">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .print-controls, .print\\:hidden, [class*="print:hidden"] {
                        display: none !important;
                    }
                }
            `}} />
            <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900">
                &larr; Back to Dashboard
            </Link>
            <Button onClick={() => window.print()} className="bg-zinc-900 text-white gap-2">
                <Printer className="w-4 h-4" /> Print / Save as PDF
            </Button>
        </div>
    );
}
