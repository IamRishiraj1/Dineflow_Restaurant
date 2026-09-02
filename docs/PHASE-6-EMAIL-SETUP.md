# Phase 6 — Email Notifications (Resend)

This adds three automatic emails:
1. **Order confirmation** → to the customer, the moment an order is genuinely confirmed (immediately for Cash on Delivery; once SSLCommerz validates payment for online orders)
2. **Order status updates** → to the customer, whenever an admin moves the order to Confirmed / Preparing / Ready / Completed / Cancelled
3. **New order alert** → to the restaurant's own inbox, same timing as the customer confirmation email

Resend was chosen because it has a genuinely simple free tier and a clean API — no SMTP configuration needed.

---

## 1. Create a free Resend account

1. Go to [resend.com](https://resend.com) → sign up (free tier: 3,000 emails/month, 100/day — plenty for testing and even a small live restaurant).
2. Verify your email if asked.

## 2. Get your API key

1. In the Resend dashboard, go to **API Keys**.
2. Click **Create API Key**, give it any name (e.g. "DineFlow"), leave permissions at the default (Full Access is fine for now).
3. Copy the key — it's only shown once. If you lose it, just create a new one.

## 3. Add it to your environment files

Open `.env` and `.env.local`, add:

```
RESEND_API_KEY="re_your_actual_key_here"
RESEND_FROM_EMAIL="DineFlow <onboarding@resend.dev>"
```

Leave `RESEND_FROM_EMAIL` exactly as shown for now — see the important limitation below before changing it.

---

## ⚠️ Important: the sandbox sender can only email YOU

Until you verify your own domain with Resend (a separate, optional step — see below), the `onboarding@resend.dev` sender address can **only successfully send to the email address you signed up to Resend with.** This is a Resend safety restriction to prevent spam from unverified accounts, not a bug in this project.

**What this means for testing:**
- To test the **customer confirmation email**, place a test order using *your own* email address (the same one your Resend account is registered under) as the checkout email.
- To test the **restaurant alert email**, go to `/admin/settings` and set the restaurant's email to that same address too, before placing your test order.
- Testing with any *other* email address will silently fail — Resend will reject it, and (since `sendEmailSafely()` in `lib/email.ts` deliberately swallows email errors so they can never break checkout) you won't see an error on your site, only in your terminal's server logs and in Resend's own dashboard under **Logs**.

## 4. Run it and test

```bash
npm run dev
```

1. Go to `/admin/settings`, set the restaurant email to your own (Resend-registered) email, save.
2. Place a test order using Cash on Delivery, with your own email as the customer email.
3. Check your inbox — you should get **two** emails: the order confirmation, and (since you set the restaurant email to the same address) the new-order alert.
4. In `/admin/orders`, change that order's status a couple of times (e.g. to Preparing, then Ready).
5. Check your inbox again — you should get a status-update email for each change.
6. Also test an **online** order (SSLCommerz) start to finish, if you've done Phase 4's setup — confirm the confirmation/alert emails arrive only *after* completing the sandbox payment, not immediately at checkout.

## 5. Check Resend's own logs

In the Resend dashboard → **Logs**, you should see every send attempt, including any that failed and why — useful for confirming things are actually working, or diagnosing why an email you expected never arrived.

---

## Removing the "only sends to yourself" limit (optional, for later)

To send real emails to real customers (not just your own inbox), you need to verify a domain with Resend:

1. In the Resend dashboard → **Domains** → **Add Domain**.
2. Enter a domain you own (e.g. `dineflow.com`, or whatever domain the real restaurant client ends up using).
3. Resend gives you a few DNS records (usually TXT and CNAME/MX records) to add at your domain registrar.
4. Once DNS propagates (can take a few minutes to a few hours) and Resend verifies it, update `RESEND_FROM_EMAIL` to use an address on that domain, e.g.:
   ```
   RESEND_FROM_EMAIL="DineFlow <orders@dineflow.com>"
   ```
5. From that point on, emails can go to any address, not just your own.

This step only matters once there's a real domain to verify — not needed to finish testing Phase 6 itself.

## ✅ Checkpoint

Order confirmations, status updates, and restaurant alerts are all sending for real. Let me know once you've received all three types of email in your test, and we'll update `TODO.md` and move to whatever's next.
