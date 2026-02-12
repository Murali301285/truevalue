"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { bulkImportTransactions } from "@/app/actions/cash-flow"
import * as XLSX from "xlsx"
import { Loader2, Upload, AlertCircle, CheckCircle2 } from "lucide-react"

export function ExcelImport({ onSuccess }: { onSuccess: () => void }) {
    const { toast } = useToast()
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<any[]>([])
    const [uploading, setUploading] = useState(false)
    const [errors, setErrors] = useState<any[]>([])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            parseFile(selected);
        }
    }

    const parseFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

            // Map keys loosely to support variations (case insensitive)
            const mappedData = jsonData.map((row: any) => {
                const newRow: any = {};
                Object.keys(row).forEach(key => {
                    const k = key.toLowerCase().trim();
                    if (k.includes("date")) newRow.date = row[key];
                    else if (k.includes("amount")) newRow.amount = row[key];
                    else if (k.includes("company")) newRow.companyName = row[key];
                    else if (k.includes("type")) newRow.type = row[key];
                    else if (k.includes("category")) newRow.category = row[key];
                    else if (k.includes("desc")) newRow.description = row[key];
                });
                return newRow;
            });

            setPreview(mappedData.slice(0, 5)); // Show first 5
        };
        reader.readAsArrayBuffer(file);
    }

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setErrors([]);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            // Re-Map for full process
            const mappedData = jsonData.map((row: any) => {
                const newRow: any = {};
                Object.keys(row).forEach(key => {
                    const k = key.toLowerCase().trim();
                    if (k.includes("date")) newRow.date = row[key];
                    else if (k.includes("amount")) newRow.amount = row[key];
                    else if (k.includes("company")) newRow.companyName = row[key];
                    else if (k.includes("type")) newRow.type = row[key];
                    else if (k.includes("category")) newRow.category = row[key];
                    else if (k.includes("desc")) newRow.description = row[key];
                });
                return newRow;
            });

            const res = await bulkImportTransactions(mappedData);
            setUploading(false);

            if (res.success) {
                toast({ title: "Import Successful", description: `${res.count} transactions added.` });
                if (res.errors) {
                    setErrors(res.errors);
                    toast({ title: "Partial Warning", description: `${res.errors.length} rows failed. See details.`, variant: "destructive" });
                } else {
                    onSuccess();
                }
            } else {
                toast({ title: "Import Failed", description: res.message, variant: "destructive" });
            }
        };
        reader.readAsArrayBuffer(file);
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Upload Spreadsheet</Label>
                <div className="border-2 border-dashed border-zinc-200 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-zinc-50/50">
                    <Input
                        type="file"
                        accept=".xlsx,.csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                    />
                    <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                        <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                        <span className="text-sm font-medium text-zinc-900">
                            {file ? file.name : "Click to select file"}
                        </span>
                        <span className="text-xs text-zinc-500 mt-1">
                            Columns needed: Date, Company, Type (Inflow/Outflow), Amount, Category, Description
                        </span>
                    </Label>
                </div>
            </div>

            {preview.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-xs text-zinc-500 uppercase font-bold">Preview (First 5 rows)</Label>
                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader className="bg-zinc-50">
                                <TableRow>
                                    <TableHead className="text-xs">Date</TableHead>
                                    <TableHead className="text-xs">Company</TableHead>
                                    <TableHead className="text-xs">Type</TableHead>
                                    <TableHead className="text-xs text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {preview.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="text-xs font-mono">{row.date}</TableCell>
                                        <TableCell className="text-xs">{row.companyName}</TableCell>
                                        <TableCell className="text-xs">{row.type}</TableCell>
                                        <TableCell className="text-xs text-right font-mono">{row.amount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {errors.length > 0 && (
                <div className="bg-red-50 p-4 rounded-md space-y-2 max-h-40 overflow-y-auto">
                    <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                        <AlertCircle className="w-4 h-4" />
                        Import Errors ({errors.length})
                    </div>
                    {errors.map((err, i) => (
                        <div key={i} className="text-xs text-red-600">
                            Row {JSON.stringify(err.row)}: {err.error}
                        </div>
                    ))}
                </div>
            )}

            <Button onClick={handleUpload} disabled={!file || uploading} className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Confirm Import
            </Button>
        </div>
    )
}
