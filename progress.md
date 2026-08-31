# DineFlow — Progress & Handoff Notes

**Read this file first if you're picking up this project in a new session.**
It explains exactly what's done, what's half-done, what's untested, and
what to do next — written so another Claude session (or a human developer)
can continue without re-deriving context from scratch.

Also read `TODO.md` for the full phase-by-phase roadmap — this file is the
detailed "state of the code right now" companion to that checklist.

---

## Where things stand (big picture)

| Phase | Status |
|---|---|
| 1 — Database (Supabase + Prisma schema + seed) | ✅ Done, confirmed working by user |
| Live deployment on Vercel | ✅ Done, confirmed working by user |
| Broken mock image URLs | ✅ Fixed, confirmed working by user |
| 2 — Connect app to real database (API routes + context rewrite) | 🟡 **Code complete, NOT yet tested by the user** |
| 3 — Real authentication | ⬜ Not started |
| 4–10 | ⬜ Not started |

**The most important thing to know:** Phase 2's code is fully written but
has never actually been run against a live database. I (the AI) have no
network access in my sandbox, so everything below was written carefully
and manually verified (brace/paren balance, cross-checked every import
against its export, checked Prisma enum types match), but it has not been
compiled or executed. **The very next step is for the user to actually run
it and report back what breaks**, if anything.

---

## What Phase 2 actually did

Rewrote the app from "mock data in React Context + localStorage" to "real
data in Postgres via Prisma, accessed through Next.js API routes."

### New files
- `lib/serializers.ts` — converts between Prisma's UPPERCASE enums
  (`OrderStatus.PLACED`) and the frontend's lowercase string types
  (`"placed"`) that the UI was already built around. This is the
  translation layer at the API boundary.
- `lib/validation.ts` — Zod schemas validating every API route's request
  body.
- `lib/api-helpers.ts` — `withErrorHandling()` wrapper + `apiError()` /
  `apiValidationError()` helpers used by every route for consistent error
  responses.
- `app/api/categories/route.ts` + `[id]/route.ts` — full CRUD
- `app/api/foods/route.ts` + `[id]/route.ts` — full CRUD
- `app/api/orders/route.ts` + `[id]/route.ts` — list/create, get/update-status
- `app/api/settings/route.ts` — get/update the single restaurant settings row

### Rewritten files
- `context/CatalogContext.tsx` — now fetches from `/api/foods` +
  `/api/categories` on mount instead of reading localStorage. All CRUD
  functions (`addFood`, `updateFood`, etc.) are now `async` and hit the
  API. Exposes `isLoading` and `error`.
- `context/OrderContext.tsx` — same pattern for orders. Also added
  `fetchOrder(id)` — fetches a single order directly (used by pages
  reached via a fresh URL load, not just in-app navigation).
- `app/(customer)/checkout/page.tsx` — `placeOrder()` is now awaited;
  added a `submitError` state shown inline if the order fails to save.
  Also now guards on `catalogLoading` before showing the "cart empty"
  state (see "Bugs I found and fixed" below).
- `app/(customer)/cart/page.tsx` — same `catalogLoading` guard fix.
- `app/(customer)/order-confirmation/[id]/page.tsx` — rewritten to use
  `fetchOrder()` with a proper three-state loading pattern
  (`undefined` = loading, `null` = not found, `Order` = loaded) instead of
  a synchronous lookup that would have 404'd incorrectly during loading.
- `app/(customer)/track-order/[id]/page.tsx` — same pattern, **plus**
  polls `/api/orders/[id]` every 8 seconds, so an admin's status update
  shows up on the customer's tracking page without a manual refresh. This
  matters now that admin and customer could be on different
  devices/browsers (with the old localStorage version, they were
  necessarily in the same browser, so this wasn't needed).
- `app/(customer)/my-orders/page.tsx` — uses the real `isLoading` from
  `OrderContext` instead of a fake `setTimeout`.
- `app/(customer)/menu/[id]/page.tsx` (food details) — added an
  `isLoading` guard before `notFound()` fires, same reasoning as above.
- `components/customer/MenuBrowser.tsx` — added a skeleton grid while
  `isLoading`, instead of briefly showing "0 dishes found."
- `components/customer/FoodCard.tsx` — category name lookup switched from
  the static `data/categories.ts` import to live `useCatalog()` data.
- `app/(customer)/page.tsx` (homepage) — rewritten as an async Server
  Component that queries Prisma **directly** (not through the API routes —
  that's the correct/faster pattern for a Next.js Server Component).
  Shows a helpful empty-state message if no categories/popular foods exist
  yet instead of just rendering nothing.
- `app/admin/foods/page.tsx`, `app/admin/categories/page.tsx`,
  `app/admin/orders/page.tsx`, `app/admin/page.tsx` (dashboard),
  `app/admin/payments/page.tsx` — all updated with `isLoading` skeletons,
  `error` banners, and `async`/`try-catch` handlers around every mutation
  (add/edit/delete/toggle/status-change), each showing a toast on success
  *or* failure.
- `components/admin/FoodFormModal.tsx` + `CategoryFormModal.tsx` — the
  `onSubmit` prop is now `Promise<void>`. The modal awaits it, shows a
  "Saving…" state, keeps the modal open with an inline error if the save
  fails (previously it optimistically closed immediately).
- `app/admin/settings/page.tsx` — now fetches from `GET /api/settings` on
  mount and saves via `PATCH /api/settings`, instead of pure local state.

### Schema change (⚠️ requires action — see below)
`prisma/schema.prisma`: `Food.categoryId` changed from required to
optional (`String?`), with `onDelete: SetNull` on the relation. This fixes
a real bug the old schema had: deleting a category that still had foods
assigned to it would have failed with a foreign-key constraint error at
the database level, contradicting what the admin UI already promised
("foods will remain but lose their category label"). `lib/serializers.ts`
was updated to coalesce a null `categoryId` to `""` for the frontend.

---

## Bugs I found and fixed while building this (worth knowing about)

1. **The FK constraint issue above** — schema fix, described above.
2. **Cart/checkout "empty" flash**: `CartContext`'s resolved `items` depend
   on `CatalogContext.foods` (to turn `{foodId, quantity}` into a full
   `CartLine`). Since foods now load asynchronously instead of being
   available instantly, there was a real bug where `/cart` and `/checkout`
   would briefly render "your cart is empty" on a fresh page load — even
   with real items in localStorage — because the catalog hadn't finished
   fetching yet. Fixed by having both pages also check
   `useCatalog().isLoading` before deciding whether to show the empty
   state.
3. **Order pages 404-on-load bug**: same root cause — `order-confirmation`
   and `track-order` used to do a synchronous `getOrder(id)` lookup and
   call `notFound()` immediately if not found. Since orders now load
   async, a fresh page load would have 404'd valid orders. Fixed with the
   three-state loading pattern described above.

---

## ⚠️ Action required before this can be tested

**1. Push the schema change to the database:**
```bash
npm run db:push
```
This is a real, if minor, schema migration (`Food.categoryId` nullable).
Supabase's Table Editor should show the column now allows NULL after this
runs.

**2. Run it locally and actually click through it:**
```bash
npm run dev
```
Test in this order:
- Visit `/menu` — foods and category tabs should load (from Postgres, via
  the API route, not instantly from a static import — there should be a
  brief loading skeleton first).
- Visit `/admin/foods` — try adding a food, editing one, deleting one,
  toggling availability. Refresh the page after each — changes should
  persist (this is the actual point of Phase 2).
- Visit `/admin/categories` — same CRUD test.
- Place a full order through checkout as a customer, confirm it redirects
  to `/order-confirmation/[id]` and shows real data.
- Visit `/track-order/[id]` for that order.
- In `/admin/orders`, change that order's status. Go back to the tracking
  page (or open it in a different browser) — within ~8 seconds it should
  update automatically (this is the new polling behavior).
- Visit `/admin/settings`, change something, save, refresh — confirm it
  persisted.

**3. Report back exactly what happens** — especially any red error text
in the browser console or the terminal running `npm run dev`. Since none
of this has been executed yet, there's a real chance of a small bug (a
typo, a subtly wrong Prisma query, a type mismatch TypeScript didn't
catch) — that's expected and normal for a first test pass, not a sign
anything is fundamentally wrong.

**4. Only after local testing passes**, push to GitHub and let Vercel
redeploy:
```bash
git add .
git commit -m "Phase 2: connect app to real database"
git push
```

---

## Known gaps / things deliberately left unfinished

- **No authentication yet.** Every API route that writes data (`POST`,
  `PATCH`, `DELETE` on foods/categories/orders/settings) has a comment
  starting with `⚠️ Not yet protected by authentication`. Right now,
  anyone who finds these endpoints (e.g. via browser dev tools) could call
  them directly. This is expected and tracked — it's exactly what Phase 3
  fixes. Don't treat this as a Phase 2 bug.
- **`GET /api/orders` returns every order with no filtering.** Same
  reasoning — needs to be scoped to the logged-in customer once auth
  exists. Also tracked as a Phase 3/8 item in `TODO.md`.
- **Admin can't mark a food as "Popular" or "Featured" from the UI.**
  `FoodFormModal` never exposed these two fields (this predates Phase 2 —
  it was also missing in the original mock-data version). The homepage's
  "Popular Dishes" section reads `isPopular: true` foods, so right now
  only the originally-seeded foods will ever show there until this is
  fixed. Not blocking, but worth doing soon — probably a quick addition of
  two checkboxes to `FoodFormModal`.
- **The admin dashboard's 7-day revenue/order charts still use the static
  mock series from `data/analytics.ts`**, not real order history — there
  isn't yet enough real order history to make a real chart meaningful.
  The stat *cards* above the chart (Today's Revenue, Today's Orders,
  Pending, Completed) DO use real data. A proper "real analytics query"
  is a good future enhancement once the site has real traffic.
- **`data/payments.ts`** (`mockTransactions`, `getPaymentSummary`) is no
  longer imported anywhere — the admin Payments page now derives
  transactions directly from real orders. The file is harmless to leave
  as-is, or can be deleted later during cleanup.

---

## If you're a new Claude session picking this up

1. Read `TODO.md` for the full roadmap and what phase to work on next.
2. Read this file (`progress.md`) for the detailed "what actually happened
   in Phase 2" context above.
3. **Ask the user whether they've run the "Action required" steps above
   and what happened** — don't assume Phase 2 works. If they hit errors,
   debug from their exact error message rather than guessing.
4. Once Phase 2 is confirmed working end-to-end, Phase 3 (authentication)
   is next. The groundwork is already in place: `package.json` already has
   `next-auth`, `@next-auth/prisma-adapter`, and `bcryptjs` installed, and
   `prisma/schema.prisma` already has the `User`/`Account`/`Session`/
   `VerificationToken` models NextAuth's Prisma adapter expects. Phase 3
   is mostly about writing `app/api/auth/[...nextauth]/route.ts`, a
   `middleware.ts` to protect `/admin/*`, and wiring the existing
   Login/Register UI to actually call it.
5. The user is a self-described complete beginner developer — continue
   the pattern already established in this conversation: very explicit,
   numbered, copy-pasteable step-by-step instructions for anything they
   need to do outside the code itself (creating accounts, running
   commands, checking dashboards).
