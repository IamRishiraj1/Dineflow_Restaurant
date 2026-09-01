import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/payments/sslcommerz/fail
// SSLCommerz sends the browser here when a payment attempt genuinely
// failed (declined card, etc.) — as opposed to /cancel, where the
// customer backed out themselves. Marks the order's payment as failed and
// sends the customer to a page that explains what happened and offers to
// retry, rather than leaving them stranded on SSLCommerz's site.
export async function POST(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const formData = await req.formData();
    const orderId = formData.get("value_a")?.toString();

    if (!orderId) {
      return NextResponse.redirect(`${appUrl}/checkout`, 303);
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order && order.paymentStatus !== "PAID") {
      await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: "FAILED" } });
    }

    return NextResponse.redirect(`${appUrl}/checkout/payment-failed?order=${orderId}&reason=fail`, 303);
  } catch (err) {
    console.error("SSLCommerz fail handler error:", err);
    return NextResponse.redirect(`${appUrl}/checkout`, 303);
  }
}
