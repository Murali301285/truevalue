import { getValuation } from "@/app/actions/valuation";
import { formatCurrency } from "@/lib/logic";
import { notFound } from "next/navigation";
import { ReportControls } from "@/components/valuation/report-controls";

// Dynamic metadata to format page title for PDF filename (companyname_date)
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const valuation = await getValuation(id);
    if (!valuation) return { title: "Valuation Report" };
    
    const d = new Date(valuation.createdAt);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-IN', { month: 'short' });
    const year = d.getFullYear();
    
    return {
        title: `${valuation.companyName}_${day}-${month}-${year}`
    };
}

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
        addressLine1,
        city,
        state,
        pincode,
        pan,
        gstNo,
        cin,
        revenue,
        ebitda,
        totalAssets,
        totalLiabilities,
        numberOfEmployees,
        yearsInOperation,
        estimatedValue,
        createdAt,
        id: valuationRef
    } = valuation;

    // Check if location or statutory tables should render
    const hasAddress = addressLine1 || city || state || pincode;
    const hasStatutory = pan || gstNo || cin;

    return (
        <div className="min-h-screen bg-zinc-50 py-12 px-4 print:py-0 print:px-0">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

                body {
                    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                    background-color: #fafafa;
                }

                .no-print {
                    display: flex;
                }

                .report-card {
                    max-width: 850px;
                    margin: 0 auto;
                    border: 1px solid #e4e4e7;
                    border-radius: 16px;
                    padding: 40px;
                    background-color: #ffffff;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                }

                .valuation-box {
                    background: linear-gradient(135deg, #f9fafb 0%, #f4f4f5 100%);
                    border: 2px dashed #e4e4e7;
                    border-radius: 12px;
                    padding: 32px;
                    text-align: center;
                    margin-bottom: 32px;
                }

                .section-header {
                    font-size: 16px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #09090b;
                    border-bottom: 2px solid #f4f4f5;
                    padding-bottom: 8px;
                    margin-bottom: 16px;
                    margin-top: 24px;
                }

                .table-row {
                    border-bottom: 1px solid #f4f4f5;
                }

                .table-row:last-child {
                    border-bottom: none;
                }

                .label-cell {
                    text-align: left;
                    color: #71717a;
                    font-size: 14px;
                    font-weight: 500;
                    padding: 8px 0;
                    width: 45%;
                }

                .value-cell {
                    text-align: right;
                    color: #09090b;
                    font-size: 14px;
                    font-weight: 700; /* Bold Value */
                    padding: 8px 0;
                    width: 55%;
                }

                .mono {
                    font-family: 'JetBrains Mono', monospace;
                }

                @media print {
                    .no-print, .print\\:hidden, [class*="print:hidden"] {
                        display: none !important;
                    }
                    body {
                        background-color: #ffffff !important;
                        color: #000000 !important;
                    }
                    .report-card {
                        border: none !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        max-width: 100% !important;
                    }
                    .valuation-box {
                        border: 2px solid #000000 !important;
                        background: #f9fafb !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            ` }} />

            {/* Print Controls - Hidden when printing */}
            <div className="no-print">
                <ReportControls />
            </div>

            {/* Report Content */}
            <div className="report-card print:border-none print:shadow-none print:p-0">

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-zinc-100 pb-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">Valuation Report</h1>
                        <p className="text-zinc-400 font-mono text-xs mt-1">Ref: {valuationRef.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-brand-red font-black text-2xl tracking-tight">MyValue</div>
                        <p className="text-zinc-500 font-semibold text-xs mt-1">
                            {new Date(createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                {/* Executive Summary */}
                <div className="mb-10">
                    <div className="valuation-box">
                        <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Estimated Enterprise Value</h2>
                        <div className="text-5xl font-black text-zinc-950 font-mono tracking-tight my-2">
                            {formatCurrency(Number(estimatedValue))}
                        </div>
                        <p className="text-zinc-400 text-xs max-w-md mx-auto mt-4 leading-relaxed">
                            *This valuation is an estimate based on provided financial data and industry benchmarks. It does not constitute a certified audit.
                        </p>
                    </div>
                </div>

                {/* Grid for Business Profile and Financial Snapshot */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    
                    {/* Left Column: Business Profile */}
                    <div>
                        <h3 className="section-header">Business Profile</h3>
                        <table className="w-full border-collapse">
                            <tbody>
                                <tr className="table-row">
                                    <td className="label-cell">Company Name</td>
                                    <td className="value-cell">{companyName}</td>
                                </tr>
                                <tr className="table-row">
                                    <td className="label-cell">Industry</td>
                                    <td className="value-cell">{industry}</td>
                                </tr>
                                <tr className="table-row">
                                    <td className="label-cell">Structure</td>
                                    <td className="value-cell">{legalStructure}</td>
                                </tr>
                                {yearsInOperation > 0 && (
                                    <tr className="table-row">
                                        <td className="label-cell">Age of Business</td>
                                        <td className="value-cell">{yearsInOperation} Years</td>
                                    </tr>
                                )}
                                {numberOfEmployees > 0 && (
                                    <tr className="table-row">
                                        <td className="label-cell">Employees</td>
                                        <td className="value-cell">{numberOfEmployees}</td>
                                    </tr>
                                )}
                                {incorporationDate && (
                                    <tr className="table-row">
                                        <td className="label-cell">Incorporated</td>
                                        <td className="value-cell">
                                            {new Date(incorporationDate).getFullYear()}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Location Details (Dynamic Skip) */}
                        {hasAddress && (
                            <>
                                <h3 className="section-header">Location Details</h3>
                                <table className="w-full border-collapse">
                                    <tbody>
                                        {addressLine1 && (
                                            <tr className="table-row">
                                                <td className="label-cell">Address</td>
                                                <td className="value-cell">{addressLine1}</td>
                                            </tr>
                                        )}
                                        {(city || state) && (
                                            <tr className="table-row">
                                                <td className="label-cell">City, State</td>
                                                <td className="value-cell">
                                                    {[city, state].filter(Boolean).join(", ")}
                                                </td>
                                            </tr>
                                        )}
                                        {pincode && (
                                            <tr className="table-row">
                                                <td className="label-cell">Pincode</td>
                                                <td className="value-cell">{pincode}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {/* Statutory Details (Dynamic Skip) */}
                        {hasStatutory && (
                            <>
                                <h3 className="section-header">Statutory Details</h3>
                                <table className="w-full border-collapse">
                                    <tbody>
                                        {pan && (
                                            <tr className="table-row">
                                                <td className="label-cell">PAN</td>
                                                <td className="value-cell mono uppercase">{pan}</td>
                                            </tr>
                                        )}
                                        {gstNo && (
                                            <tr className="table-row">
                                                <td className="label-cell">GSTIN</td>
                                                <td className="value-cell mono uppercase">{gstNo}</td>
                                            </tr>
                                        )}
                                        {cin && (
                                            <tr className="table-row">
                                                <td className="label-cell">CIN</td>
                                                <td className="value-cell mono uppercase">{cin}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>

                    {/* Right Column: Financial Snapshot */}
                    <div>
                        <h3 className="section-header">Financial Snapshot</h3>
                        <table className="w-full border-collapse">
                            <tbody>
                                <tr className="table-row">
                                    <td className="label-cell">Annual Revenue</td>
                                    <td className="value-cell mono">{formatCurrency(Number(revenue))}</td>
                                </tr>
                                <tr className="table-row">
                                    <td className="label-cell">EBITDA</td>
                                    <td className="value-cell mono">{formatCurrency(Number(ebitda))}</td>
                                </tr>
                                <tr className="table-row">
                                    <td className="label-cell">Total Assets</td>
                                    <td className="value-cell mono">{formatCurrency(Number(totalAssets))}</td>
                                </tr>
                                <tr className="table-row">
                                    <td className="label-cell">Total Liabilities</td>
                                    <td className="value-cell mono">{formatCurrency(Number(totalLiabilities))}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-8 border-t-2 border-zinc-100 flex justify-between items-end text-xs text-zinc-400 font-medium print:text-[10px] mt-12">
                    <div>
                        <p>Generated by MyValue Valuation Engine</p>
                        <p className="text-zinc-300">www.myvalue.in</p>
                    </div>
                    <div className="text-right">
                        <p className="text-zinc-500 font-bold">Strictly Confidential</p>
                        <p>Page 1 of 1</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
