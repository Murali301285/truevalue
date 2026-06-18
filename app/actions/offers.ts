"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Admin Actions
export async function getOfferCodes() {
    try {
        const offers = await prisma.offerCode.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { claims: true }
                }
            }
        });
        
        return offers.map(o => ({
            ...o,
            offerValue: o.offerValue.toNumber(),
            claimsCount: o._count.claims
        }));
    } catch (error) {
        console.error("Error fetching offer codes:", error);
        return [];
    }
}

export async function createOfferCode(data: {
    code: string;
    offerValue: number;
    type: string;
    validTill: Date;
    frequency: string;
    applicablePlans: string[];
}) {
    try {
        await prisma.offerCode.create({
            data: {
                code: data.code.toUpperCase().trim(),
                offerValue: data.offerValue,
                type: data.type,
                validTill: data.validTill,
                frequency: data.frequency,
                applicablePlans: data.applicablePlans,
                isActive: true
            }
        });

        revalidatePath("/config/offers");
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, error: "Offer code already exists." };
        console.error("Error creating offer code:", error);
        return { success: false, error: "Failed to create offer code." };
    }
}

export async function updateOfferCode(id: string, data: {
    code: string;
    offerValue: number;
    type: string;
    validTill: Date;
    frequency: string;
    applicablePlans: string[];
}) {
    try {
        await prisma.offerCode.update({
            where: { id },
            data: {
                code: data.code.toUpperCase().trim(),
                offerValue: data.offerValue,
                type: data.type,
                validTill: data.validTill,
                frequency: data.frequency,
                applicablePlans: data.applicablePlans,
            }
        });

        revalidatePath("/config/offers");
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, error: "Offer code already exists." };
        console.error("Error updating offer code:", error);
        return { success: false, error: "Failed to update offer code." };
    }
}

export async function deleteOfferCode(id: string) {
    try {
        await prisma.offerCode.delete({
            where: { id }
        });

        revalidatePath("/config/offers");
        return { success: true };
    } catch (error) {
        console.error("Error deleting offer code:", error);
        return { success: false, error: "Failed to delete offer code." };
    }
}

export async function toggleOfferStatus(id: string, currentStatus: boolean) {
    try {
        await prisma.offerCode.update({
            where: { id },
            data: { isActive: !currentStatus }
        });

        revalidatePath("/config/offers");
        return { success: true };
    } catch (error) {
        console.error("Error toggling status:", error);
        return { success: false, error: "Failed to update status." };
    }
}

export async function getOfferClaims(offerId: string) {
    try {
        const claims = await prisma.offerClaim.findMany({
            where: { offerId },
            orderBy: { claimedOn: 'desc' }
        });
        return claims;
    } catch (error) {
        console.error("Error fetching claims:", error);
        return [];
    }
}

// Client Actions (Checkout)
export async function validateOfferCode(code: string, userEmail: string, planName: string, originalAmount: number) {
    try {
        const cleanCode = code.toUpperCase().trim();
        
        const offer = await prisma.offerCode.findUnique({
            where: { code: cleanCode }
        });

        if (!offer) {
            return { valid: false, error: "Invalid offer code." };
        }

        if (!offer.isActive) {
            return { valid: false, error: "This offer code is no longer active." };
        }

        if (new Date() > offer.validTill) {
            return { valid: false, error: "This offer code has expired." };
        }

        if (offer.applicablePlans.length > 0 && !offer.applicablePlans.includes("ALL") && !offer.applicablePlans.includes(planName)) {
            return { valid: false, error: "This offer code is not applicable to the selected plan." };
        }

        if (offer.frequency === "onetime") {
            const previousClaim = await prisma.offerClaim.findFirst({
                where: {
                    offerId: offer.id,
                    userEmail: userEmail
                }
            });

            if (previousClaim) {
                return { valid: false, error: "You have already used this offer code." };
            }
        }

        // Calculate Discount
        const offerValueNum = offer.offerValue.toNumber();
        let discountAmount = 0;

        if (offer.type === "percentage") {
            discountAmount = originalAmount * (offerValueNum / 100);
        } else {
            discountAmount = offerValueNum;
        }

        // Cap discount at original amount
        if (discountAmount > originalAmount) {
            discountAmount = originalAmount;
        }

        const finalAmount = originalAmount - discountAmount;

        return {
            valid: true,
            discountAmount,
            finalAmount,
            offerId: offer.id
        };

    } catch (error) {
        console.error("Error validating offer code:", error);
        return { valid: false, error: "Failed to validate offer code." };
    }
}
