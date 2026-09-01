/**
 * SSLCommerz integration (Session API v4).
 *
 * ⚠️ IMPORTANT HONESTY NOTE FOR WHOEVER TESTS THIS: this was written from
 * training knowledge of SSLCommerz's documented API contract, in a sandbox
 * with no internet access to verify it against their live docs. Payment
 * gateway APIs are exactly the kind of thing that can have subtle version
 * drift. Before testing with real sandbox credentials, cross-check the
 * request/response field names below against
 * https://developer.sslcommerz.com/doc/v4/ — if anything doesn't match,
 * that's this file being wrong, not your setup.
 *
 * Flow:
 *  1. initiateSSLCommerzPayment() — called server-side right after an order
 *     is created with paymentMethod "card". Posts order + customer details
 *     to SSLCommerz's Session API, gets back a GatewayPageURL, which the
 *     browser is then redirected to (SSLCommerz's own hosted payment page —
 *     we never see or touch card numbers ourselves).
 *  2. Customer pays on SSLCommerz's page.
 *  3. SSLCommerz calls our IPN URL server-to-server (reliable, not
 *     dependent on the customer's browser making it back to us) AND
 *     redirects the customer's browser to our success/fail/cancel URLs
 *     (for the visible confirmation page — NOT trusted as payment proof by
 *     itself, since a browser redirect can be interrupted or spoofed).
 *  4. Both the IPN handler and the success-redirect handler call
 *     validateSSLCommerzPayment() with the val_id SSLCommerz gave them,
 *     which asks SSLCommerz server-to-server "is this actually valid?"
 *     before we ever mark an order as paid. This is the step that
 *     actually matters for security — never trust val_id/status fields
 *     from a redirect or webhook body without this server-to-server check.
 */

const IS_LIVE = process.env.SSLCOMMERZ_IS_LIVE === "true";
const BASE_URL = IS_LIVE ? "https://securepay.sslcommerz.com" : "https://sandbox.sslcommerz.com";
const STORE_ID = process.env.SSLCOMMERZ_STORE_ID ?? "";
const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD ?? "";

export interface InitiatePaymentInput {
  orderId: string; // internal cuid — passed through as SSLCommerz's value_a so every callback can look the order up reliably, independent of tran_id
  tranId: string; // unique per PAYMENT ATTEMPT, not per order — see note below
  amount: number; // in BDT, whole taka (matches how this app stores money)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string; // SSLCommerz requires SOME address even for pickup orders
  itemCount: number;
}
// Why tranId and orderId are separate: SSLCommerz requires tran_id to be
// unique per payment SESSION, but a customer might retry payment on the
// same order (e.g. their card was declined the first time). Reusing the
// order's own orderNumber as tran_id would break on retry. So the caller
// (see app/api/payments/sslcommerz/init/route.ts) generates a fresh
// tranId for every attempt, while orderId (passed through as SSLCommerz's
// `value_a` field) stays constant — every callback route below reads
// value_a, not tran_id, to find the order in our database.

export interface InitiatePaymentResult {
  success: true;
  gatewayUrl: string;
}
export interface InitiatePaymentError {
  success: false;
  error: string;
}

export async function initiateSSLCommerzPayment(
  input: InitiatePaymentInput
): Promise<InitiatePaymentResult | InitiatePaymentError> {
  if (!STORE_ID || !STORE_PASSWORD) {
    return {
      success: false,
      error:
        "Payment gateway isn't configured yet. Set SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD.",
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const params = new URLSearchParams({
    store_id: STORE_ID,
    store_passwd: STORE_PASSWORD,
    total_amount: String(input.amount),
    currency: "BDT",
    tran_id: input.tranId,
    success_url: `${appUrl}/api/payments/sslcommerz/success`,
    fail_url: `${appUrl}/api/payments/sslcommerz/fail`,
    cancel_url: `${appUrl}/api/payments/sslcommerz/cancel`,
    ipn_url: `${appUrl}/api/payments/sslcommerz/ipn`,
    shipping_method: "NO",
    product_name: "DineFlow order",
    product_category: "Food",
    product_profile: "general",
    cus_name: input.customerName,
    cus_email: input.customerEmail,
    cus_add1: input.customerAddress || "N/A",
    cus_city: "Dhaka",
    cus_postcode: "1200",
    cus_country: "Bangladesh",
    cus_phone: input.customerPhone,
    num_of_item: String(input.itemCount),
    // Passed straight to SSLCommerz's dashboard so their support can find
    // this transaction by our own order id too, not just tran_id.
    value_a: input.orderId,
  });

  try {
    const res = await fetch(`${BASE_URL}/gwprocess/v4/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await res.json();

    if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
      return {
        success: false,
        error: data.failedreason || "SSLCommerz didn't return a payment page. Please try again.",
      };
    }

    return { success: true, gatewayUrl: data.GatewayPageURL };
  } catch {
    return { success: false, error: "Couldn't reach the payment gateway. Please try again." };
  }
}

export interface ValidationResult {
  isValid: boolean;
  tranId?: string;
  amount?: number;
  cardType?: string;
}

/**
 * Server-to-server check with SSLCommerz — this is the ONLY thing that
 * should ever cause an order to be marked as paid. Never trust the status
 * field from an IPN body or a success-redirect's query params directly.
 */
export async function validateSSLCommerzPayment(valId: string): Promise<ValidationResult> {
  if (!STORE_ID || !STORE_PASSWORD || !valId) {
    return { isValid: false };
  }

  const params = new URLSearchParams({
    val_id: valId,
    store_id: STORE_ID,
    store_passwd: STORE_PASSWORD,
    format: "json",
  });

  try {
    const res = await fetch(`${BASE_URL}/validator/api/validationserverAPI.php?${params.toString()}`);
    const data = await res.json();

    const isValid = data.status === "VALID" || data.status === "VALIDATED";
    return {
      isValid,
      tranId: data.tran_id,
      amount: data.amount ? Number(data.amount) : undefined,
      cardType: data.card_type,
    };
  } catch {
    return { isValid: false };
  }
}
