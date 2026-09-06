import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSSLCommerzPayment, paymentAmountMatches } from "@/lib/sslcommerz";
import { serializeOrder } from "@/lib/serializers";
import { sendOrderConfirmationEmail, sendNewOrderAlertEmail } from "@/lib/email";
import { defaultRestaurantSettings } from "@/data/restaurant";
import { sslcommerzCallbackSchema } from "@/lib/validation";

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
    const parsed = sslcommerzCallbackSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      console.error("SSLCommerz success handler: malformed callback", parsed.error.flatten());
      return NextResponse.redirect(`${appUrl}/menu`, 303);
    }

    const { value_a: orderId, val_id: valId } = parsed.data;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.redirect(`${appUrl}/menu`, 303);
    }

    if (valId && order.paymentStatus !== "PAID") {
      const validation = await validateSSLCommerzPayment(valId);

      if (validation.isValid && !paymentAmountMatches(validation, order.total)) {
        console.error(
          `SSLCommerz amount mismatch on order ${orderId}: expected ৳${order.total}, ` +
            `SSLCommerz confirmed ৳${validation.amount} (val_id ${valId}). Payment NOT marked as paid.`
        );
      } else if (validation.isValid) {
        const updated = await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "PAID", paymentValId: valId },
          include: { items: true },
        });

        // Same "genuinely confirmed" timing as the Cash on Delivery path
        // in app/api/orders/route.ts — these fire here, for the FIRST
        // time this order is validated as paid, never at order creation.
        // Awaited so it completes before the redirect response is sent,
        // but sendEmailSafely() never throws, so this can't break the
        // redirect even if Resend is down or misconfigured.
        const settings = await prisma.restaurantSettings.findUnique({ where: { id: "singleton" } });
        const serialized = serializeOrder(updated);
        await Promise.all([
          sendOrderConfirmationEmail(serialized),
          sendNewOrderAlertEmail(serialized, settings?.email || defaultRestaurantSettings.email),
        ]);
      }
    }

    return NextResponse.redirect(`${appUrl}/order-confirmation/${orderId}`, 303);
  } catch (err) {
    console.error("SSLCommerz success handler error:", err);
    return NextResponse.redirect(`${appUrl}/menu`, 303);
  }
}
