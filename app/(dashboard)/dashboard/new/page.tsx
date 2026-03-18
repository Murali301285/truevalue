import { prisma } from "@/lib/db";
import { SimplifiedWizardContainer } from "@/components/valuation/simplified-wizard/wizard-container";

export default async function NewValuationPage() {
    const rawIndustries = await prisma.industry.findMany({
        where: { status: true },
        include: { baseMultiplier: true },
        orderBy: { name: "asc" }
    });

    // Serialize Decimal objects to plain numbers for the Client Component
    const industries = rawIndustries.map(ind => ({
        ...ind,
        baseMultiplier: ind.baseMultiplier ? {
            ...ind.baseMultiplier,
            revMultipleFrom: Number(ind.baseMultiplier.revMultipleFrom),
            revMultipleTo: Number(ind.baseMultiplier.revMultipleTo),
            ebitdaMultipleFrom: Number(ind.baseMultiplier.ebitdaMultipleFrom),
            ebitdaMultipleTo: Number(ind.baseMultiplier.ebitdaMultipleTo),
        } : null
    }));

    return <SimplifiedWizardContainer industries={industries} />;
}
