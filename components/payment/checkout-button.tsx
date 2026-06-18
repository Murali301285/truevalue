"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CheckoutButtonProps {
  amount: number;
  planName: string;
}

export function CheckoutButton({ amount, planName }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // 1. Create order on our backend
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, userEmail: "test@example.com" }),
      });
      
      const order = await res.json();

      if (order.error) {
        alert("Failed to create order. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Load Razorpay script dynamically
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      
      script.onload = () => {
        // 3. Initialize Razorpay Checkout
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Frontend Key ID
          amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
          currency: order.currency,
          name: "MyValue Valuation",
          description: `Payment for ${planName}`,
          order_id: order.id,
          handler: async function (response: any) {
            // 4. Verify payment signature on our backend
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: amount,
              }),
            });
            
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              alert(`Payment Successful! Transaction ID: ${response.razorpay_payment_id}`);
              // You can redirect the user here using router.push('/dashboard')
            } else {
              alert("Payment verification failed!");
            }
          },
          prefill: {
            name: "Test User",
            email: "test@example.com",
            contact: "9999999999",
          },
          theme: {
            color: "#a81b21", // Match the Brand red
          },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on('payment.failed', function (response: any){
            alert("Payment Failed: " + response.error.description);
        });
        
        paymentObject.open();
      };
      
      script.onerror = () => {
        alert("Failed to load Razorpay SDK");
      }

      document.body.appendChild(script);
    } catch (error) {
      console.error("Payment initiation error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={loading} 
      className="bg-brand-red hover:bg-[#8e161c] text-white w-full h-12 font-bold rounded-xl shadow-lg"
    >
      {loading ? "Processing..." : `Pay ₹${amount}`}
    </Button>
  );
}
