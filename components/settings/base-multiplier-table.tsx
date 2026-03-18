"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { upsertBaseMultiplier } from "@/app/actions/base-multiplier";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, ArrowUpDown, Search } from "lucide-react";

type RowData = {
    industryId: string;
    industryName: string;
    revFrom: number;
    revTo: number;
    ebitdaFrom: number;
    ebitdaTo: number;
};

export function BaseMultiplierTable({ initialData }: { initialData: RowData[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    const filteredAndSortedData = useMemo(() => {
        let result = initialData;

        if (searchQuery) {
            result = result.filter(item => 
                item.industryName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        result = [...result].sort((a, b) => {
            const comparison = a.industryName.localeCompare(b.industryName);
            return sortDirection === "asc" ? comparison : -comparison;
        });

        return result;
    }, [initialData, searchQuery, sortDirection]);

    const toggleSort = () => {
        setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center px-4 pt-4 sm:pt-0">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        type="text"
                        placeholder="Search sectors..."
                        className="pl-9 bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto rounded-md border border-t-0 rounded-t-none sm:border-t sm:rounded-t-md">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-gray-900 w-16 text-center">Sl No.</th>
                            <th className="px-4 py-3 font-semibold text-gray-900 w-64">
                                <Button variant="ghost" className="h-8 px-2 text-xs font-semibold -ml-2 uppercase flex items-center gap-1 hover:bg-gray-200" onClick={toggleSort}>
                                    Sector
                                    <ArrowUpDown className="h-3 w-3" />
                                </Button>
                            </th>
                            <th className="px-4 py-3 font-semibold text-gray-900">Revenue Multiple (From - To)</th>
                            <th className="px-4 py-3 font-semibold text-gray-900">EBITDA Multiple (From - To)</th>
                            <th className="px-4 py-3 font-semibold text-gray-900 w-24 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredAndSortedData.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                    {searchQuery ? "No sectors matching your search." : "No active sectors found. Please add sectors in the Industry configuration."}
                                </td>
                            </tr>
                        ) : (
                            filteredAndSortedData.map((row, index) => (
                                <TableRow key={row.industryId} slNo={index + 1} data={row} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TableRow({ slNo, data }: { slNo: number; data: RowData }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    // Local state for edits
    const [revFrom, setRevFrom] = useState(data.revFrom.toString());
    const [revTo, setRevTo] = useState(data.revTo.toString());
    const [ebitdaFrom, setEbitdaFrom] = useState(data.ebitdaFrom.toString());
    const [ebitdaTo, setEbitdaTo] = useState(data.ebitdaTo.toString());

    // Check if current state differs from initial data to highlight changes or enable save
    const isChanged = 
        revFrom !== data.revFrom.toString() ||
        revTo !== data.revTo.toString() ||
        ebitdaFrom !== data.ebitdaFrom.toString() ||
        ebitdaTo !== data.ebitdaTo.toString();

    const handleSave = async () => {
        // Validation
        const rFrom = parseFloat(revFrom) || 0;
        const rTo = parseFloat(revTo) || 0;
        const eFrom = parseFloat(ebitdaFrom) || 0;
        const eTo = parseFloat(ebitdaTo) || 0;

        if (rFrom > rTo) {
            toast({ variant: "destructive", title: "Validation Error", description: "Revenue 'From' cannot be greater than 'To'." });
            return;
        }
        if (eFrom > eTo) {
            toast({ variant: "destructive", title: "Validation Error", description: "EBITDA 'From' cannot be greater than 'To'." });
            return;
        }

        setIsLoading(true);
        try {
            const result = await upsertBaseMultiplier({
                industryId: data.industryId,
                revFrom: rFrom,
                revTo: rTo,
                ebitdaFrom: eFrom,
                ebitdaTo: eTo
            });

            if (result.success) {
                toast({ title: "Saved", description: `${data.industryName} multipliers updated.` });
                // We could update 'data' prop reference here or rely on server revalidation.
                // Revalidation will refresh the page data.
            } else {
                toast({ variant: "destructive", title: "Error", description: result.error });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <tr className={`hover:bg-gray-50/50 transition-colors ${isChanged ? 'bg-amber-50/30' : ''}`}>
            <td className="px-4 py-3 font-medium text-gray-900 text-center">
                {slNo}
            </td>
            <td className="px-4 py-3 font-medium text-gray-900 border-r border-gray-100">
                {data.industryName}
            </td>
            <td className="px-4 py-3 border-r border-gray-100">
                <div className="flex items-center gap-2 max-w-[200px]">
                    <div className="relative">
                        <Input 
                            type="number" 
                            step="0.1" 
                            value={revFrom} 
                            onChange={(e) => setRevFrom(e.target.value)} 
                            className="h-8 text-sm pr-6 w-20"
                            placeholder="0.0"
                        />
                        <span className="absolute right-2 top-1.5 text-xs text-gray-400 font-medium select-none pointer-events-none">X</span>
                    </div>
                    <span className="text-gray-400 font-medium">-</span>
                    <div className="relative">
                        <Input 
                            type="number" 
                            step="0.1" 
                            value={revTo} 
                            onChange={(e) => setRevTo(e.target.value)} 
                            className="h-8 text-sm pr-6 w-20"
                            placeholder="0.0"
                        />
                        <span className="absolute right-2 top-1.5 text-xs text-gray-400 font-medium select-none pointer-events-none">X</span>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 border-r border-gray-100">
                <div className="flex items-center gap-2 max-w-[200px]">
                    <div className="relative">
                        <Input 
                            type="number" 
                            step="0.1" 
                            value={ebitdaFrom} 
                            onChange={(e) => setEbitdaFrom(e.target.value)} 
                            className="h-8 text-sm pr-6 w-20"
                            placeholder="0.0"
                        />
                        <span className="absolute right-2 top-1.5 text-xs text-gray-400 font-medium select-none pointer-events-none">X</span>
                    </div>
                    <span className="text-gray-400 font-medium">-</span>
                    <div className="relative">
                        <Input 
                            type="number" 
                            step="0.1" 
                            value={ebitdaTo} 
                            onChange={(e) => setEbitdaTo(e.target.value)} 
                            className="h-8 text-sm pr-6 w-20"
                            placeholder="0.0"
                        />
                        <span className="absolute right-2 top-1.5 text-xs text-gray-400 font-medium select-none pointer-events-none">X</span>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 text-center">
                <Button 
                    size="sm" 
                    variant={isChanged ? "default" : "secondary"}
                    className={isChanged ? "bg-brand-red hover:bg-red-700 text-white" : ""}
                    onClick={handleSave}
                    disabled={isLoading || (!isChanged && Number(revFrom) !== 0)} // Allow saving if it was 0 (never saved), else disable if no changes
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </Button>
            </td>
        </tr>
    );
}
