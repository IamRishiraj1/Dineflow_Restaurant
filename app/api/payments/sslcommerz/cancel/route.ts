import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sslcommerzCallbackSchema } from "@/lib/validation";

// POST /api/payments/sslcommerz/cancel
// SSLCommerz sends the browser here when the customer backs out of the
// payment page themselves (as opposed to /fail, where the payment attempt
// itself was rejected). Same handling as /fail either way — our
// PaymentStatus enum doesn't distinguish "cancelled" from "failed", and
// the customer-facing outcome (order not paid, can retry) is the same.
export async function POST(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const formData = await req.formData();
    const parsed = sslcommerzCallbackSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      console.error("SSLCommerz cancel handler: malformed callback", parsed.error.flatten());
      return NextResponse.redirect(`${appUrl}/checkout`, 303);
    }

    const orderId = parsed.data.value_a;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order && order.paymentStatus !== "PAID") {
      await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: "FAILED" } });
    }

    return NextResponse.redirect(`${appUrl}/checkout/payment-failed?order=${orderId}&reason=cancel`, 303);
  } catch (err) {
    console.error("SSLCommerz cancel handler error:", err);
    return NextResponse.redirect(`${appUrl}/checkout`, 303);
  }
}
