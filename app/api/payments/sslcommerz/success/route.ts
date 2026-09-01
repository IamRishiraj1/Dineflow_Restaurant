import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSSLCommerzPayment } from "@/lib/sslcommerz";

// POST /api/payments/sslcommerz/success
// SSLCommerz redirects the customer's BROWSER here (via an auto-submitting
// form on their end) right after a successful payment. We validate
// server-to-server here too (not just trusting this redirect happened —
// see the big comment in lib/sslcommerz.ts) so the confirmation page shows
// "paid" immediately, without waiting on the IPN webhook, which normally
// arrives around the same time but isn't guaranteed to win the race.
export async function POST(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const formData = await req.formData();
    const valId = formData.get("val_id")?.toString();
    const orderId = formData.get("value_a")?.toString();

    if (!orderId) {
      return NextResponse.redirect(`${appUrl}/menu`, 303);
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.redirect(`${appUrl}/menu`, 303);
    }

    if (valId && order.paymentStatus !== "PAID") {
      const validation = await validateSSLCommerzPayment(valId);
      if (validation.isValid) {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "PAID", paymentValId: valId },
        });
      }
    }

    return NextResponse.redirect(`${appUrl}/order-confirmation/${orderId}`, 303);
  } catch (err) {
    console.error("SSLCommerz success handler error:", err);
    return NextResponse.redirect(`${appUrl}/menu`, 303);
  }
}
