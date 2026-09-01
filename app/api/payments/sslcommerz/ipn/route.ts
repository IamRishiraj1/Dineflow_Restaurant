import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSSLCommerzPayment } from "@/lib/sslcommerz";

// POST /api/payments/sslcommerz/ipn
// SSLCommerz calls this server-to-server (not through the customer's
// browser) whenever a payment's status changes. This is the authoritative
// source of truth for "did the payment actually go through" — unlike the
// success/fail/cancel redirects below, which happen in the customer's
// browser and could in theory be interrupted, spoofed, or never arrive at
// all (e.g. customer closes the tab right after paying). This route is
// the safety net that makes sure the order still gets marked paid even if
// that happens.
//
// Always responds 200 — SSLCommerz will retry this webhook on non-200
// responses, and we don't want retries for something like "order not
// found in our DB yet" turning into a flood. Log and move on instead.
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const valId = formData.get("val_id")?.toString();
    const orderId = formData.get("value_a")?.toString(); // set by us in lib/sslcommerz.ts

    if (!valId || !orderId) {
      console.error("SSLCommerz IPN missing val_id or value_a", Object.fromEntries(formData));
      return NextResponse.json({ received: true });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      console.error("SSLCommerz IPN referenced an unknown order id:", orderId);
      return NextResponse.json({ received: true });
    }

    // Already processed (e.g. the success-redirect handler got there
    // first) — nothing more to do, and definitely don't double-process.
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ received: true });
    }

    const validation = await validateSSLCommerzPayment(valId);

    await prisma.order.update({
      where: { id: orderId },
      data: validation.isValid
        ? { paymentStatus: "PAID", paymentValId: valId }
        : { paymentStatus: "FAILED" },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("SSLCommerz IPN handler error:", err);
    // Still 200 — see comment above on why we don't want SSLCommerz retrying this.
    return NextResponse.json({ received: true });
  }
}
