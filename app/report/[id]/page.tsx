import { getValuation } from "@/app/actions/valuation";
import { formatCurrency, formatIndianNumber } from "@/lib/logic";

import { notFound } from "next/navigation";
import { ReportControls } from "@/components/valuation/report-controls";

export default async function ValuationReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const valuation = await getValuation(id);

    if (!valuation) {
        notFound();
    }

    const {
        companyName,
        industry,
        legalStructure,
        incorporationDate,
        city,
        state,
        revenue,
        ebitda,
        totalAssets,
        totalLiabilities,
        estimatedValue,
        createdAt,
        id: valuationRef
    } = valuation;

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans p-8 md:p-12 print:p-0">
            {/* Print Controls - Hidden when printing */}
            <ReportControls />

            {/* Report Content */}
            <div className="max-w-4xl mx-auto border border-zinc-200 shadow-sm print:shadow-none print:border-none rounded-xl p-10 bg-white">

                {/* Header */}
                <div className="flex justify-between items-start border-b border-zinc-100 pb-8 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">Valuation Report</h1>
                        <p className="text-zinc-500 text-sm mt-1">Ref: {valuationRef.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-brand-red font-bold text-xl">MyValue</div>
                        <p className="text-zinc-400 text-xs mt-1">{new Date(createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                    </div>
                </div>

                {/* Executive Summary */}
                <div className="mb-12">
                    <div className="bg-zinc-50 rounded-lg p-8 text-center border border-zinc-100">
                        <h2 className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-3">Estimated Enterprise Value</h2>
                        <div className="text-5xl font-extrabold text-zinc-900 mb-2">
                            {formatCurrency(Number(estimatedValue))}
                        </div>
                        <p className="text-zinc-400 text-xs max-w-md mx-auto mt-4">
                            *This valuation is an estimate based on provided financial data and industry benchmarks. It does not constitute a certified audit.
                        </p>
                    </div>
                </div>

                {/* Company Details */}
                <div className="grid grid-cols-2 gap-8 mb-12">
                    <div>
                        <h3 className="text-zinc-900 font-semibold mb-4 border-b border-zinc-100 pb-2">Business Profile</h3>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Company Name</dt>
                                <dd className="font-medium text-zinc-900">{companyName}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Industry</dt>
                                <dd className="font-medium text-zinc-900">{industry}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Structure</dt>
                                <dd className="font-medium text-zinc-900">{legalStructure}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Incorporated</dt>
                                <dd className="font-medium text-zinc-900">
                                    {incorporationDate ? new Date(incorporationDate).getFullYear() : '-'}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Location</dt>
                                <dd className="font-medium text-zinc-900">{city}, {state}</dd>
                            </div>
                        </dl>
                    </div>

                    <div>
                        <h3 className="text-zinc-900 font-semibold mb-4 border-b border-zinc-100 pb-2">Financial Snapshot</h3>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Annual Revenue</dt>
                                <dd className="font-mono font-medium text-zinc-900">{formatCurrency(Number(revenue))}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">EBITDA</dt>
                                <dd className="font-mono font-medium text-zinc-900">{formatCurrency(Number(ebitda))}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Total Assets</dt>
                                <dd className="font-mono font-medium text-zinc-900">{formatCurrency(Number(totalAssets))}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Total Liabilities</dt>
                                <dd className="font-mono font-medium text-zinc-900">{formatCurrency(Number(totalLiabilities))}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-8 border-t border-zinc-100 flex justify-between items-end text-xs text-zinc-400 print:text-[10px]">
                    <div>
                        <p>Generated by MyValue Valuation Engine</p>
                        <p>www.myvalue.in</p>
                    </div>
                    <div className="text-right">
                        <p>Strictly Confidential</p>
                        <p>Page 1 of 1</p>
                    </div>
                </div>
            </div>

            <script dangerouslySetInnerHTML={{
                __html: `
                function printReport() {
                    window.print();
                }
            `}} />
        </div>
    );
}
