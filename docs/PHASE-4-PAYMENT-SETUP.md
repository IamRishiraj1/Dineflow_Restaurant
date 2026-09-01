# Phase 4 — Real Payments Setup (SSLCommerz)

This connects checkout to a real payment gateway: SSLCommerz, the most
widely used payment aggregator for Bangladeshi businesses. It bundles
cards, bKash, Nagad, Rocket, and bank transfer into a single hosted
checkout page — you don't build separate integrations for each.

**You'll be using their sandbox** — a free, instant test environment that
needs no business documents or approval. It behaves exactly like the real
thing (same API, same flow), just with fake money and test payment
methods. When you're ready to accept real payments later, you apply for a
live merchant account and swap two environment variables — nothing about
the code changes.

---

## 1. Create a free SSLCommerz sandbox account

1. Go to [developer.sslcommerz.com](https://developer.sslcommerz.com) →
   **Registration**.
2. Fill in the signup form (name, email, phone, a store name — anything
   is fine for sandbox, e.g. "DineFlow Test Store").
3. Verify your email if asked.
4. Log in to the sandbox dashboard.

## 2. Get your Store ID and Store Password

1. In the sandbox dashboard, look for **Store Information** or
   **My Stores** (SSLCommerz's dashboard layout changes occasionally —
   if it's not obvious, check the sidebar for "Integration" or
   "API/Credentials").
2. Copy the **Store ID** (usually looks like `testbox` followed by some
   characters, e.g. `dineflow_live_a1b2c3`).
3. Copy the **Store Password** (sometimes called "Store Passwd" or
   "API Password").

## 3. Add credentials to your environment files

Open both `.env` and `.env.local` and fill in:

```
SSLCOMMERZ_STORE_ID="paste-your-store-id-here"
SSLCOMMERZ_STORE_PASSWORD="paste-your-store-password-here"
SSLCOMMERZ_IS_LIVE="false"
```

Leave `SSLCOMMERZ_IS_LIVE` as `"false"` — this keeps every request
pointed at SSLCommerz's sandbox, not their live payment network. Don't
change this until you have a real, **approved** live merchant account
(a completely separate application process from the sandbox signup).

## 4. Apply the database change

The Order table has a new field (`paymentValId`) to store SSLCommerz's
transaction reference once a payment is confirmed:

```bash
npm run db:push
```

## 5. Run it and test a full payment

```bash
npm run dev
```

1. Add something to your cart, go to checkout.
2. Fill in the form, leave **Card / Mobile Banking** selected (the
   default), click **Continue to Payment**.
3. You should be redirected to SSLCommerz's sandbox payment page.
4. SSLCommerz's sandbox provides test credentials for each payment
   method right on that page — usually a test Visa/Mastercard number,
   or a test mobile banking number/PIN. Use whatever they display (it
   changes; look for a "Test Card" or "Sample Credentials" panel on
   their checkout page itself).
5. Complete the test payment.
6. You should be redirected back to your site's order confirmation page,
   showing the order as **paid**.

## 6. Also test what happens when a payment fails or is cancelled

1. Place another test order, get to SSLCommerz's payment page again.
2. This time, either close the tab / click their "Cancel" button, or
   deliberately enter an invalid test card to trigger a decline (check
   their sandbox docs for a "always declines" test card, if provided).
3. You should land on `/checkout/payment-failed` on your own site, with
   a **Try Payment Again** button that starts a fresh payment attempt for
   the same order.

## 7. Confirm the database updated correctly

```bash
npm run db:studio
```

Open the `Order` table, find your test orders, and confirm:
- The successful one has `paymentStatus: PAID` and a `paymentValId` filled in
- The failed/cancelled one has `paymentStatus: FAILED`

---

## Why there are three different callback URLs, plus a fourth webhook

If you look at `lib/sslcommerz.ts`, you'll see four different URLs
configured: `success_url`, `fail_url`, `cancel_url`, and `ipn_url`. This
is a deliberate, standard pattern for payment gateways, not
over-engineering:

- **success/fail/cancel** — SSLCommerz redirects the *customer's browser*
  here after payment, so they see the right confirmation/error page.
- **ipn** (Instant Payment Notification) — SSLCommerz calls this
  **server-to-server**, independent of the customer's browser. This is
  what makes the system reliable: if a customer's phone loses signal or
  they close the tab right after paying, the browser redirect might never
  happen — but the IPN webhook still will, so the order still gets marked
  paid correctly. The success-page redirect is for the customer's
  benefit; the IPN webhook is what your business can actually rely on.

Every one of these calls a second, separate "validate" request back to
SSLCommerz's servers before ever marking an order as paid — never trusting
the redirect or webhook data by itself. This matters: without that
extra check, anyone could fake a "payment successful" browser redirect to
your site without ever actually paying.

---

## Moving from sandbox to a real live account (do this later, not now)

When you have an actual restaurant client ready to accept real money:

1. Apply for a live SSLCommerz merchant account at the same site — this
   time it requires business registration documents (trade license, bank
   account details, etc.) and can take a few business days for approval.
2. Once approved, you'll get separate **live** Store ID and Store
   Password credentials (different from your sandbox ones).
3. Update `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`, and set
   `SSLCOMMERZ_IS_LIVE="true"` in your **production** environment
   variables (in Vercel's dashboard, not just locally).
4. Test carefully with a small real transaction before telling the client
   it's ready.

## ✅ Checkpoint

You now have real online payments working end-to-end in sandbox mode:
checkout → SSLCommerz's hosted page → server-to-server validation →
order marked paid → confirmation page. Cash on Delivery still works
exactly as before, untouched.

Let me know once you've completed a successful test payment and a
failed/cancelled one, and we'll update `TODO.md` and move to whatever's
next.
