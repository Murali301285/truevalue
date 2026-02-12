"use client"

import { useState, useEffect } from "react"
import { PowerTable } from "@/components/ui/power-table"
import { CustomerForm } from "@/components/config/customer-form"
import { deleteCustomer, getCustomers } from "@/app/actions/customer"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Phone, Building2 } from "lucide-react"

interface CustomerPageClientProps {
    initialData: any[];
    companies: any[];
}

export default function CustomerPageClient({ initialData, companies }: CustomerPageClientProps) {
    const { toast } = useToast()
    const [data, setData] = useState<any[]>(initialData)
    const [loading, setLoading] = useState(false) // Initial data is passed from server
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)

    const refreshData = async () => {
        // We can re-fetch or use router.refresh(). 
        // For PowerTable state consistency, manually fetching is often smoother.
        const res = await getCustomers();
        setData(res);
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
            const res = await deleteCustomer(item.id);
            if (res.success) {
                toast({ title: "Deleted", description: "Customer deleted successfully." });
                refreshData();
            } else {
                toast({ title: "Error", description: "Could not delete customer.", variant: "destructive" });
            }
        }
    }

    const columns = [
        {
            header: "Customer Name",
            accessorKey: (item: any) => (
                <div>
                    <div className="font-bold text-sm">{item.name}</div>
                    <div className="text-xs text-zinc-500">{item.area || "No Area"}</div>
                </div>
            )
        },
        {
            header: "Primary Contact",
            accessorKey: (item: any) => {
                const contact = item.contacts?.[0];
                if (!contact) return <span className="text-zinc-400 text-xs">-</span>;
                return (
                    <div className="flex flex-col text-xs">
                        <span className="font-medium">{contact.name}</span>
                        <div className="flex items-center gap-1 text-zinc-500">
                            <Phone className="w-3 h-3" /> {contact.phone}
                        </div>
                    </div>
                )
            }
        },
        {
            header: "Operations",
            accessorKey: (item: any) => (
                <div className="flex flex-wrap gap-1">
                    {item.companies?.length > 0 ? (
                        item.companies.slice(0, 2).map((c: any) => (
                            <span key={c.id} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                                {c.name}
                            </span>
                        ))
                    ) : <span className="text-zinc-400 text-xs">-</span>}
                    {item.companies?.length > 2 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-600">
                            +{item.companies.length - 2} more
                        </span>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customer Master</h1>
                    <p className="text-zinc-500">Manage customers and their linked operations.</p>
                </div>
            </div>

            <PowerTable
                data={data}
                columns={columns}
                searchKey="name"
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <CustomerForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={editingItem}
                companies={companies}
                onSuccess={refreshData}
            />
        </div>
    );
}
