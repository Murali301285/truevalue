import { HomeFilters } from "@/components/home/filters";
import { PortfolioTable } from "@/components/home/portfolio-table";
import { RunwayChart } from "@/components/home/average-runway-chart";

export default function HomePage() {
    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* Premium Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-1">
                    SBM Portfolio Dashboard <span className="text-zinc-300 mx-2">|</span> <span className="font-normal text-emerald-600">January 2026</span>
                </h1>
                <p className="text-zinc-500">Executive overview of portfolio performance and liquidity.</p>
            </div>

            {/* Controls */}
            <HomeFilters />

            {/* Data Section */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Primary Table */}
                <PortfolioTable />

                {/* Charts Grid */}
                <RunwayChart />
            </div>
        </div>
    );
}
