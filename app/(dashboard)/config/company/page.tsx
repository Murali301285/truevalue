"use client"

import { useState, useEffect } from "react"
import { PowerTable } from "@/components/ui/power-table"
import { CompanyForm } from "@/components/config/company-form"
import { getCompanies, deleteCompany } from "@/app/actions/company"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function CompanyConfigPage() {
    const { toast } = useToast()
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const res = await getCompanies();
        setData(res);
        setLoading(false);
    }

    const handleAdd = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    }

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setIsFormOpen(true);
    }

    const handleDelete = async (item: any) => {
        if (confirm(`Are you sure you want to delete ${item.name}?`)) {
            const res = await deleteCompany(item.id);
            if (res.success) {
                toast({ title: "Deleted", description: "Company deleted successfully." });
                fetchData();
            } else {
                toast({ title: "Error", description: "Could not delete company.", variant: "destructive" });
            }
        }
    }

    const columns = [
        {
            header: "Company",
            accessorKey: (item: any) => (
                <div className="flex items-center gap-3">
                    {item.logoUrl ? (
                        <img src={item.logoUrl} className="w-8 h-8 rounded border object-contain" alt="" />
                    ) : (
                        <div className="w-8 h-8 rounded bg-zinc-100 flex items-center justify-center font-bold text-zinc-500 text-xs">
                            {item.name.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <div className="font-bold text-sm">{item.name}</div>
                        <div className="text-xs text-zinc-500">{item.code}</div>
                    </div>
                </div>
            )
        },
        { header: "Industry", accessorKey: "industry", className: "hidden sm:table-cell" },
        { header: "GST No", accessorKey: "gstNo", className: "hidden md:table-cell" },
        { header: "Started On", accessorKey: (item: any) => item.startedOn ? new Date(item.startedOn).toLocaleDateString() : "-", className: "hidden md:table-cell text-zinc-500" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Company Master</h1>
                    <p className="text-zinc-500">Manage your portfolio companies.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-300" /></div>
            ) : (
                <PowerTable
                    data={data}
                    columns={columns}
                    searchKey="name"
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <CompanyForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={editingItem}
                onSuccess={fetchData}
            />
        </div>
    );
}
