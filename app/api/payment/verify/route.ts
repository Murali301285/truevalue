import { NextResponse } from "next/server";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import Razorpay from "razorpay";

const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, offerId, planName } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Find the order in the database
      const order = await prisma.paymentOrder.findUnique({
        where: { razorpayOrderId: razorpay_order_id },
      });

      if (order) {
        // Fetch payment details from Razorpay to get the payment method (e.g. netbanking, card)
        let paymentMethod = "unknown";
        try {
          const payment = await razorpay.payments.fetch(razorpay_payment_id);
          paymentMethod = payment.method || "unknown";
        } catch (fetchErr) {
          console.error("Failed to fetch payment method from Razorpay:", fetchErr);
        }

        // Update order status
        await prisma.paymentOrder.update({
          where: { razorpayOrderId: razorpay_order_id },
          data: { status: "paid" },
        });

        // Record the transaction
        await prisma.paymentTransaction.create({
          data: {
            orderId: order.id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            amount: order.amount,
            status: "success",
            paymentMethod: paymentMethod,
          },
        });

        // Record the Offer Claim if one was used
        if (offerId) {
            await prisma.offerClaim.create({
                data: {
                    offerId: offerId,
                    userEmail: order.userEmail || "unknown",
                    planName: planName || "Express",
                    orderId: order.id
                }
            });
        }
      }

      return NextResponse.json({ message: "Payment verified successfully", success: true }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Invalid signature", success: false }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
