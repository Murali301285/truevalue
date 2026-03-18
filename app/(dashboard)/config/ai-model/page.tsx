"use client"

import { useEffect, useState } from "react"
import { PowerTable } from "@/components/ui/power-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getAiModels, deleteAiModel, toggleAiModelStatus } from "@/app/actions/ai-model"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { AiModelForm } from "@/components/config/ai-model-form"

export default function AiModelConfigPage() {
    const { toast } = useToast()
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [editingModel, setEditingModel] = useState<any | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        const res = await getAiModels()
        setData(res)
        setLoading(false)
    }

    const handleSuccess = () => {
        setIsOpen(false)
        setEditingModel(null)
        fetchData()
    }

    const handleEdit = (model: any) => {
        setEditingModel(model)
        setIsOpen(true)
    }

    const handleDelete = async (model: any) => {
        if (confirm(`Are you sure you want to delete ${model.name}?`)) {
            const res = await deleteAiModel(model.id)
            if (res.success) {
                toast({ title: "Deleted", description: "Model removed successfully." })
                fetchData()
            } else {
                toast({ title: "Error", description: res.error, variant: "destructive" })
            }
        }
    }

    const handleToggleStatus = async (item: any) => {
        const res = await toggleAiModelStatus(item.id, item.isActive)
        if (res.success) {
            toast({ title: "Status Updated", description: `Model is now ${!item.isActive ? 'Active' : 'Inactive'}` })
            fetchData()
        }
    }

    // Function to mask the API key
    const maskKey = (key: string) => {
        if (!key) return "-";
        if (key.length <= 8) return "********";
        return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
    }

    const columns = [
        { header: "Model Name", accessorKey: "name", className: "font-semibold text-zinc-800" },
        {
            header: "API Key",
            accessorKey: (item: any) => <span className="font-mono text-zinc-400 text-xs">{maskKey(item.apiKey)}</span>
        },
        {
            header: "Used For",
            accessorKey: "usedFor"
        },
        {
            header: "Validity",
            accessorKey: (item: any) => item.validity ? <span className="text-zinc-600 text-xs">{format(new Date(item.validity), 'MMM dd, yyyy')}</span> : <span className="text-zinc-400 text-xs">-</span>
        },
        {
            header: "Remarks",
            accessorKey: (item: any) => <span className="text-zinc-500 text-xs truncate max-w-[150px] block" title={item.remarks}>{item.remarks || "-"}</span>
        },
        {
            header: "Status",
            accessorKey: (item: any) => (
                <div onClick={(e) => { e.stopPropagation(); handleToggleStatus(item); }} className="cursor-pointer hover:opacity-80">
                    <Badge variant={item.isActive ? "default" : "secondary"} className={item.isActive ? "bg-emerald-600 hover:bg-emerald-700" : "bg-zinc-200 text-zinc-500 hover:bg-zinc-300"}>
                        {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                </div>
            )
        },
        {
            header: "Created",
            accessorKey: (item: any) => <span className="text-zinc-500 text-xs">{format(new Date(item.createdAt), 'MMM dd, yyyy')}</span>
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">AI Model Config</h1>
                    <p className="text-zinc-500">Manage AI model keys and parameters.</p>
                </div>

                <Button onClick={() => setIsOpen(true)} className="bg-zinc-900 text-white hover:bg-zinc-800 gap-2">
                    <Plus className="w-4 h-4" /> Add Model
                </Button>

                <AiModelForm
                    open={isOpen}
                    onOpenChange={(open) => { setIsOpen(open); if (!open) setEditingModel(null); }}
                    initialData={editingModel || undefined}
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
