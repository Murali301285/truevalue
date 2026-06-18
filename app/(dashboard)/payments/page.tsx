import { getPaymentHistory } from "@/app/actions/payments";
import { PaymentHistoryTable } from "@/components/payments/payment-history-table";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
    const session = await auth();
    
    if (!session) {
        redirect("/login");
    }

    const isAdmin = (session.user as any).role === "ADMIN";
    const historyRes = await getPaymentHistory();
    const transactions = historyRes.data || [];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-1">
                    Payment History
                </h1>
                <p className="text-zinc-500">
                    {isAdmin 
                        ? "Audit log of all platform transactions and refunds." 
                        : "Review your past valuation payments and receipts."}
                </p>
            </div>

            {historyRes.error ? (
                <div className="p-4 text-brand-red bg-red-50 rounded-lg">
                    {historyRes.error}
                </div>
            ) : (
                <PaymentHistoryTable transactions={transactions} isAdmin={isAdmin} />
            )}
        </div>
    );
}
