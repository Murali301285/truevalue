"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, Plus, Pencil, Trash2, Power } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import * as XLSX from 'xlsx';

interface PowerTableProps<T> {
    data: T[];
    columns: { header: string; accessorKey: keyof T | ((item: T) => React.ReactNode); className?: string }[];
    searchKey: keyof T;
    onAdd?: () => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onToggleActive?: (item: T) => void;
    actionColumn?: boolean;
}

export function PowerTable<T extends { id: string }>({
    data,
    columns,
    searchKey,
    onAdd,
    onEdit,
    onDelete,
    onToggleActive,
    actionColumn = true
}: PowerTableProps<T>) {
    const [searchTerm, setSearchTerm] = React.useState("")
    const [pageSize, setPageSize] = React.useState(10)
    const [currentPage, setCurrentPage] = React.useState(1)

    // Filter
    const filteredData = React.useMemo(() => {
        return data.filter(item => {
            const val = item[searchKey];
            if (typeof val === 'string') {
                return val.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return true;
        })
    }, [data, searchTerm, searchKey])

    // Pagination
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = pageSize === -1
        ? filteredData
        : filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, "export.xlsx");
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:w-[300px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-white"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport} className="bg-white">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    {onAdd && (
                        <Button size="sm" onClick={onAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-md border border-zinc-200 overflow-x-auto shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50">
                        <TableRow>
                            <TableHead className="w-[50px]">Sl.No</TableHead>
                            {columns.map((col, idx) => (
                                <TableHead key={idx} className={col.className}>{col.header}</TableHead>
                            ))}
                            {actionColumn && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + (actionColumn ? 1 : 0)} className="h-24 text-center text-zinc-500">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((item, index) => (
                                <TableRow key={item.id} className="hover:bg-zinc-50/50">
                                    <TableCell className="font-medium text-zinc-500">
                                        {(currentPage - 1) * pageSize + index + 1}
                                    </TableCell>
                                    {columns.map((col, idx) => (
                                        <TableCell key={idx} className={col.className}>
                                            {typeof col.accessorKey === 'function'
                                                ? col.accessorKey(item)
                                                : (item[col.accessorKey] as React.ReactNode)}
                                        </TableCell>
                                    ))}
                                    {actionColumn && (
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {onEdit && (
                                                    <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="h-8 w-8 text-zinc-500 hover:text-blue-600">
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                {onDelete && (
                                                    <Button variant="ghost" size="icon" onClick={() => onDelete(item)} className="h-8 w-8 text-zinc-500 hover:text-red-600">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                {onToggleActive && (
                                                    <Button variant="ghost" size="icon" onClick={() => onToggleActive(item)} className="h-8 w-8 text-zinc-400 hover:text-emerald-600">
                                                        <Power className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500">Rows per page</span>
                    <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder="10" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="-1">All</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500">
                        Page {currentPage} of {totalPages || 1}
                    </span>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>Next</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
