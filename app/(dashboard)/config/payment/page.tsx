"use client"

import { useEffect, useState } from "react"
import { PowerTable } from "@/components/ui/power-table"
import { Button } from "@/components/ui/button"
import { Plus, Link as LinkIcon, FileText } from "lucide-react"
import { getPaymentConfigs, deletePaymentConfig, togglePaymentConfigStatus } from "@/app/actions/payment-config"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { PaymentConfigForm } from "@/components/config/payment-config-form"

export default function PaymentConfigPage() {
    const { toast } = useToast()
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [editingConfig, setEditingConfig] = useState<any | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        const res = await getPaymentConfigs()
        setData(res)
        setLoading(false)
    }

    const handleSuccess = () => {
        setIsOpen(false)
        setEditingConfig(null)
        fetchData()
    }

    const handleEdit = (config: any) => {
        setEditingConfig(config)
        setIsOpen(true)
    }

    const handleDelete = async (config: any) => {
        if (confirm(`Are you sure you want to delete ${config.provider}?`)) {
            const res = await deletePaymentConfig(config.id)
            if (res.success) {
                toast({ title: "Deleted", description: "Configuration removed successfully." })
                fetchData()
            } else {
                toast({ title: "Error", description: res.error, variant: "destructive" })
            }
        }
    }

    const handleToggleStatus = async (item: any) => {
        const res = await togglePaymentConfigStatus(item.id, item.isActive)
        if (res.success) {
            toast({ title: "Status Updated", description: `Configuration is now ${!item.isActive ? 'Active' : 'Inactive'}` })
            fetchData()
        }
    }

    const columns = [
        { header: "Provider", accessorKey: "provider", className: "font-semibold text-zinc-800" },
        {
            header: "API Key",
            accessorKey: (item: any) => <span className="font-mono text-zinc-500">{item.apiKey.substring(0, 8)}...</span>
        },
        {
            header: "Validity",
            accessorKey: (item: any) => item.validity ? <span className="text-zinc-600 text-xs">{format(new Date(item.validity), 'MMM dd, yyyy')}</span> : <span className="text-zinc-400 text-xs">-</span>
        },
        {
            header: "Documents",
            accessorKey: (item: any) => (
                <div className="flex gap-1">
                    {Array.isArray(item.documents) && item.documents.length > 0 ? (
                        item.documents.map((doc: string, idx: number) => (
                            <a key={idx} href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800" title={doc}>
                                <FileText className="w-4 h-4" />
                            </a>
                        ))
                    ) : (
                        <span className="text-zinc-400 text-xs italic">None</span>
                    )}
                </div>
            )
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
            header: "Created On",
            accessorKey: (item: any) => <span className="text-zinc-500 text-xs">{format(new Date(item.createdAt), 'MMM dd, yyyy')}</span>
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Payment Gateways</h1>
                    <p className="text-zinc-500">Configure payment providers and upload credentials.</p>
                </div>

                <Button onClick={() => setIsOpen(true)} className="bg-zinc-900 text-white hover:bg-zinc-800 gap-2">
                    <Plus className="w-4 h-4" /> Add Gateway
                </Button>

                <PaymentConfigForm
                    open={isOpen}
                    onOpenChange={(open) => { setIsOpen(open); if (!open) setEditingConfig(null); }}
                    initialData={editingConfig || undefined}
                    onSuccess={handleSuccess}
                />
            </div>

            <PowerTable
                data={data}
                columns={columns}
                searchKey="provider"
                onEdit={handleEdit}
                onDelete={handleDelete}
                actionColumn={true}
            />
        </div>
    )
}
