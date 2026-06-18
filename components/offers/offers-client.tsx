"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus, Check, X, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OfferForm } from "./offer-form";
import { ClaimsModal } from "./claims-modal";
import { toggleOfferStatus, deleteOfferCode } from "@/app/actions/offers";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function OffersClient({ initialOffers, pricingPlans }: { initialOffers: any[], pricingPlans: any[] }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isClaimsOpen, setIsClaimsOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<any>(null);
    const [selectedOfferForClaims, setSelectedOfferForClaims] = useState<string | null>(null);

    const { toast } = useToast();
    const router = useRouter();

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const res = await toggleOfferStatus(id, currentStatus);
        if (res.success) {
            toast({ title: "Success", description: "Status updated successfully." });
            router.refresh();
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this offer code?")) return;
        
        const res = await deleteOfferCode(id);
        if (res.success) {
            toast({ title: "Success", description: "Offer code deleted." });
            router.refresh();
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
    };

    const handleSuccess = () => {
        setIsFormOpen(false);
        router.refresh();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Button 
                    onClick={() => { setSelectedOffer(null); setIsFormOpen(true); }}
                    className="bg-brand-red hover:bg-[#8e161c]"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Offer Code
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Value</th>
                                <th className="px-6 py-4">Valid Till</th>
                                <th className="px-6 py-4">Frequency</th>
                                <th className="px-6 py-4">Claims</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {initialOffers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 italic">
                                        No offer codes configured yet.
                                    </td>
                                </tr>
                            ) : initialOffers.map((offer) => (
                                <tr key={offer.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-mono font-bold text-gray-900">
                                        {offer.code}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {offer.type === 'percentage' ? `${offer.offerValue}% OFF` : `₹${offer.offerValue} OFF`}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                        {format(new Date(offer.validTill), "dd MMM yyyy")}
                                    </td>
                                    <td className="px-6 py-4 capitalize text-gray-600">
                                        {offer.frequency === 'onetime' ? 'One Time/User' : 'Multiple'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">{offer.claimsCount}</span>
                                            {offer.claimsCount > 0 && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-6 px-2 text-xs text-brand-red hover:text-brand-red hover:bg-brand-red/10"
                                                    onClick={() => {
                                                        setSelectedOfferForClaims(offer.id);
                                                        setIsClaimsOpen(true);
                                                    }}
                                                >
                                                    <Eye className="w-3 h-3 mr-1" /> View
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge 
                                            variant="outline" 
                                            className={offer.isActive 
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                                : "bg-gray-100 text-gray-500 border-gray-200"}
                                        >
                                            {offer.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleToggleStatus(offer.id, offer.isActive)}
                                            className={offer.isActive ? "text-orange-600 hover:text-orange-700" : "text-emerald-600 hover:text-emerald-700"}
                                            title={offer.isActive ? "Mark Inactive" : "Mark Active"}
                                        >
                                            {offer.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleDelete(offer.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            title="Delete Offer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isFormOpen && (
                <OfferForm 
                    open={isFormOpen} 
                    onOpenChange={setIsFormOpen} 
                    onSuccess={handleSuccess}
                    pricingPlans={pricingPlans}
                />
            )}

            {isClaimsOpen && selectedOfferForClaims && (
                <ClaimsModal 
                    open={isClaimsOpen} 
                    onOpenChange={setIsClaimsOpen} 
                    offerId={selectedOfferForClaims} 
                />
            )}
        </div>
    );
}
