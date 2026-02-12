'use client';

import { CompanyHealthData } from "@/types/dashboard";
import { CompanyCard } from "./company-card";

type DashboardGridProps = {
    companies: CompanyHealthData[];
};

export function DashboardGrid({ companies }: DashboardGridProps) {
    // Logic to sort "Red" (Low Index) companies to the top
    const sortedCompanies = [...companies].sort((a, b) => a.realSmeIndex - b.realSmeIndex);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-min pb-20">
            {sortedCompanies.map((company) => (
                <CompanyCard key={company.id} company={company} />
            ))}
        </div>
    );
}
