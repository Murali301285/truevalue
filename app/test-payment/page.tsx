import { CheckoutButton } from "@/components/payment/checkout-button";

export default function TestPaymentPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#a81b21] mb-2">Test Payment Integration</h1>
          <p className="text-gray-500">
            Click the button below to test the Razorpay flow using your test keys.
          </p>
        </div>

        <div className="bg-red-50 rounded-xl p-6 mb-8 border border-red-100">
          <h2 className="font-bold text-gray-900 mb-2">Express Valuation Tier</h2>
          <div className="flex justify-between text-gray-600 mb-4">
            <span>Base Price</span>
            <span>₹499.00</span>
          </div>
          <div className="border-t border-red-200 pt-4 flex justify-between font-extrabold text-gray-900 text-lg">
            <span>Total to Pay</span>
            <span>₹499.00</span>
          </div>
        </div>

        <CheckoutButton amount={499} planName="Express Valuation Tier" />
        
        <div className="mt-6 text-xs text-gray-400 text-center">
          Secured by Razorpay. Use test card details (e.g., 4111 1111 1111 1111) to simulate payment.
        </div>
      </div>
    </div>
  );
}
