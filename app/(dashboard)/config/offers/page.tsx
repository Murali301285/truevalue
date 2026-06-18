import { getOfferCodes } from "@/app/actions/offers";
import { getPricingPlans } from "@/app/actions/pricing";
import { OffersClient } from "@/components/offers/offers-client";

export const metadata = {
    title: 'Offer Codes | RealSME Admin',
};

export default async function OffersPage() {
    const offers = await getOfferCodes();
    const pricingPlans = await getPricingPlans();

    return (
        <div className="container mx-auto py-8 px-4 sm:px-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Promotional Offers</h1>
                <p className="text-gray-500">Create and manage discount codes for your valuation reports.</p>
            </div>

            <OffersClient initialOffers={offers} pricingPlans={pricingPlans} />
        </div>
    );
}
