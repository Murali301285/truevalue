"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { getOfferClaims } from "@/app/actions/offers"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"

interface ClaimsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    offerId: string
}

export function ClaimsModal({ open, onOpenChange, offerId }: ClaimsModalProps) {
    const [claims, setClaims] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (open && offerId) {
            setLoading(true)
            getOfferClaims(offerId).then(data => {
                setClaims(data)
                setLoading(false)
            })
        }
    }, [open, offerId])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Offer Claim Details</DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto mt-4">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                                <tr>
                                    <th className="px-4 py-3">Sl No</th>
                                    <th className="px-4 py-3">User Email</th>
                                    <th className="px-4 py-3">Plan Claimed</th>
                                    <th className="px-4 py-3">Claimed On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {claims.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500 italic">
                                            No claims found for this offer code.
                                        </td>
                                    </tr>
                                ) : claims.map((claim, index) => (
                                    <tr key={claim.id} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{claim.userEmail}</td>
                                        <td className="px-4 py-3 text-gray-600">{claim.planName}</td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                            {format(new Date(claim.claimedOn), "dd MMM yyyy HH:mm")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
