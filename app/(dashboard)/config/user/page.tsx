"use client";

import { useEffect, useState } from "react";
import { PowerTable } from "@/components/ui/power-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UserForm } from "@/components/config/user-form";
import { getUsers, deleteUser, toggleUserStatus } from "@/app/actions/user";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function UserPage() {
    const { toast } = useToast();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const res = await getUsers();
        setData(res);
        setLoading(false);
    };

    const handleSuccess = () => {
        setIsOpen(false);
        setEditingUser(null);
        fetchData();
    };

    const handleEdit = (user: any) => {
        setEditingUser(user);
        setIsOpen(true);
    };

    const handleDelete = async (user: any) => {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            const res = await deleteUser(user.id);
            if (res.success) {
                toast({ title: "Deleted", description: "User removed successfully." });
                fetchData();
            } else {
                toast({ title: "Error", description: res.error, variant: "destructive" });
            }
        }
    };

    const handleToggleStatus = async (user: any) => {
        const res = await toggleUserStatus(user.id, user.isActive);
        if (res.success) {
            toast({ title: "Status Updated", description: `User is now ${!user.isActive ? 'Active' : 'Inactive'}` });
            fetchData();
        }
    };

    const columns = [
        { header: "Name", accessorKey: "name", className: "font-medium" },
        { header: "Email", accessorKey: "email" },
        {
            header: "Role",
            accessorKey: (item: any) => (
                <Badge variant="outline" className="font-mono text-xs">
                    {item.role}
                </Badge>
            )
        },
        {
            header: "Status",
            accessorKey: (item: any) => (
                <div onClick={(e) => { e.stopPropagation(); handleToggleStatus(item); }} className="cursor-pointer hover:opacity-80">
                    <Badge variant={item.isActive ? "default" : "destructive"} className={item.isActive ? "bg-emerald-600" : ""}>
                        {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                </div>
            )
        },
        {
            header: "Created",
            accessorKey: (item: any) => <span className="text-zinc-500 text-xs">{format(new Date(item.createdAt), 'MMM dd, yyyy')}</span>
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">User Management</h1>
                    <p className="text-zinc-500">Manage system access and roles.</p>
                </div>

                <Button onClick={() => setIsOpen(true)} className="bg-zinc-900 text-white hover:bg-zinc-800 gap-2">
                    <Plus className="w-4 h-4" /> Add User
                </Button>

                <UserForm
                    open={isOpen}
                    onOpenChange={(open) => { setIsOpen(open); if (!open) setEditingUser(null); }}
                    initialData={editingUser || undefined}
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
    );
}
