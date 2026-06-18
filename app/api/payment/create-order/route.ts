import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { validateOfferCode } from "@/app/actions/offers";

const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { amount: initialAmount, currency = "INR", receipt = "receipt", userEmail: clientEmail, offerId } = await req.json();
    
    // Securely override client-provided email with actual session email
    const userEmail = session?.user?.email || clientEmail || "anonymous";

    let amount = initialAmount;
    
    // Secure re-validation of amount
    const plan = await prisma.pricingPlan.findFirst({ where: { name: "Express" } });
    if (plan) {
        const basePrice = Math.round(Number(plan.price));
        let discountAmount = 0;
        
        if (offerId) {
            const offer = await prisma.offerCode.findUnique({ where: { id: offerId } });
            if (offer) {
                const validation = await validateOfferCode(offer.code, userEmail, "Express", basePrice);
                if (validation.valid && validation.discountAmount !== undefined) {
                    discountAmount = Math.round(validation.discountAmount);
                }
            }
        }

        const priceAfterDiscount = Math.max(0, basePrice - discountAmount);
        const taxPercentage = plan.taxPercentage !== null && plan.taxPercentage !== undefined ? Number(plan.taxPercentage) : 18;
        const taxAmount = Math.round(priceAfterDiscount * (taxPercentage / 100));
        
        const otherChargesArray = Array.isArray(plan.otherCharges) ? plan.otherCharges : [];
        const otherChargesTotal = Math.round(otherChargesArray.reduce((sum: number, c: any) => sum + Number(c.amount), 0));

        amount = priceAfterDiscount + taxAmount + otherChargesTotal;
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency,
      receipt,
      payment_capture: 1, // auto capture
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return NextResponse.json({ error: "Razorpay order creation failed" }, { status: 500 });
    }

    // Save order details to Database
    await prisma.paymentOrder.create({
      data: {
        razorpayOrderId: order.id,
        amount: amount,
        currency: order.currency,
        status: "created",
        receipt: order.receipt,
        userEmail: userEmail || "anonymous",
      },
    });

    return NextResponse.json(order, { status: 200 });
  } catch (error: any) {
    console.error("Order Creation Error:", error);
    return NextResponse.json(
      { error: "Error creating order", details: error.message },
      { status: 500 }
    );
  }
}
