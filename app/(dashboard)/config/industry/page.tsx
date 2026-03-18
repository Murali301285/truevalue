"use client"

import { useEffect, useState } from "react"
import { PowerTable } from "@/components/ui/power-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getIndustries, deleteIndustry, toggleIndustryStatus } from "@/app/actions/industry"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { IndustryForm } from "@/components/config/industry-form"

export default function IndustryPage() {
    const { toast } = useToast()
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [editingIndustry, setEditingIndustry] = useState<any | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        const res = await getIndustries()
        setData(res)
        setLoading(false)
    }

    const handleSuccess = () => {
        setIsOpen(false)
        setEditingIndustry(null)
        fetchData()
    }

    const handleEdit = (industry: any) => {
        setEditingIndustry(industry)
        setIsOpen(true)
    }

    const handleDelete = async (industry: any) => {
        if (confirm(`Are you sure you want to delete ${industry.name}?`)) {
            const res = await deleteIndustry(industry.id)
            if (res.success) {
                toast({ title: "Deleted", description: "Industry removed successfully." })
                fetchData()
            } else {
                toast({ title: "Error", description: res.error, variant: "destructive" })
            }
        }
    }

    const handleToggleStatus = async (item: any) => {
        const res = await toggleIndustryStatus(item.id, item.status)
        if (res.success) {
            toast({ title: "Status Updated", description: `Industry is now ${!item.status ? 'Active' : 'Inactive'}` })
            fetchData()
        }
    }

    const columns = [
        { header: "Industry", accessorKey: "name", className: "font-semibold text-zinc-800" },
        { header: "Remarks", accessorKey: "remarks", className: "text-zinc-500 text-sm" },
        {
            header: "Status",
            accessorKey: (item: any) => (
                <div onClick={(e) => { e.stopPropagation(); handleToggleStatus(item); }} className="cursor-pointer hover:opacity-80">
                    <Badge variant={item.status ? "default" : "secondary"} className={item.status ? "bg-emerald-600 hover:bg-emerald-700" : "bg-zinc-200 text-zinc-500 hover:bg-zinc-300"}>
                        {item.status ? "Active" : "Inactive"}
                    </Badge>
                </div>
            )
        },
        {
            header: "Created On",
            accessorKey: (item: any) => <span className="text-zinc-500 text-xs">{format(new Date(item.createdAt), 'MMM dd, yyyy')}</span>
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Industry Config</h1>
                    <p className="text-zinc-500">Manage industry sectors and active status.</p>
                </div>

                <Button onClick={() => setIsOpen(true)} className="bg-zinc-900 text-white hover:bg-zinc-800 gap-2">
                    <Plus className="w-4 h-4" /> Add Industry
                </Button>

                <IndustryForm
                    open={isOpen}
                    onOpenChange={(open) => { setIsOpen(open); if (!open) setEditingIndustry(null); }}
                    initialData={editingIndustry || undefined}
                    onSuccess={handleSuccess}
                />
            </div>

            <PowerTable
                data={data}
                columns={columns}
                searchKey="name"
                onEdit={handleEdit}
                onDelete={handleDelete}
                actionColumn={true}
            />
        </div>
    )
}
