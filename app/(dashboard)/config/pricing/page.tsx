"use client"

import { useEffect, useState } from "react"
import { PowerTable } from "@/components/ui/power-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getPricingPlans, deletePricingPlan, togglePricingPlanStatus } from "@/app/actions/pricing"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { PricingForm } from "@/components/config/pricing-form"

export default function PricingPage() {
    const { toast } = useToast()
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState<any | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        const res = await getPricingPlans()
        setData(res)
        setLoading(false)
    }

    const handleSuccess = () => {
        setIsOpen(false)
        setEditingPlan(null)
        fetchData()
    }

    const handleEdit = (plan: any) => {
        setEditingPlan(plan)
        setIsOpen(true)
    }

    const handleDelete = async (plan: any) => {
        if (confirm(`Are you sure you want to delete ${plan.name}?`)) {
            const res = await deletePricingPlan(plan.id)
            if (res.success) {
                toast({ title: "Deleted", description: "Plan removed successfully." })
                fetchData()
            } else {
                toast({ title: "Error", description: res.error, variant: "destructive" })
            }
        }
    }

    const handleToggleStatus = async (item: any) => {
        const res = await togglePricingPlanStatus(item.id, item.isActive)
        if (res.success) {
            toast({ title: "Status Updated", description: `Plan is now ${!item.isActive ? 'Active' : 'Inactive'}` })
            fetchData()
        }
    }

    const columns = [
        { header: "Plan Name", accessorKey: "name", className: "font-semibold text-zinc-800" },
        {
            header: "Price",
            accessorKey: (item: any) => <span className="font-mono">{item.currency} {item.price.toFixed(2)}</span>
        },
        {
            header: "Features",
            accessorKey: (item: any) => (
                <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">
                    {Array.isArray(item.features) ? item.features.length : 0} Features
                </span>
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
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Pricing Config</h1>
                    <p className="text-zinc-500">Manage subscription plans and features.</p>
                </div>

                <Button onClick={() => setIsOpen(true)} className="bg-zinc-900 text-white hover:bg-zinc-800 gap-2">
                    <Plus className="w-4 h-4" /> Add Plan
                </Button>

                <PricingForm
                    open={isOpen}
                    onOpenChange={(open) => { setIsOpen(open); if (!open) setEditingPlan(null); }}
                    initialData={editingPlan || undefined}
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
