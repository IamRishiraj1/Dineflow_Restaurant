# DineFlow — Progress & Handoff Notes

**Read this file first if you're picking up this project in a new session.**
`TODO.md` has the full phase-by-phase roadmap; this file is the detailed
"what actually happened and why" companion — written so another Claude
session (or a human developer) can continue without re-deriving context.

---

## Important context: this was a MERGE session

The user had previously taken the Phase-2-complete zip I built and, instead
of testing it directly, ran a **separate, parallel session using Claude
Code** (evidenced by a `CLAUDE.md` file and `.git` history in what they
uploaded as `dineflow_v2.zip`). That parallel session:

- Started from the git history point *right after* the Unsplash image
  fixes — **before** my Phase 2 zip's changes were ever applied
- Built its own (smaller) version of Phase 2: only Categories + Foods API
  routes, no Orders or Settings API, and no admin route protection
- Then built real Phase 3 authentication: NextAuth.js with a Credentials
  provider, `lib/auth.ts`, `lib/session.ts` (a `requireAdmin()` helper —
  defined but not actually called anywhere yet), session types, a
  `SessionProvider` wrapper, and real `signIn()` wiring on the Login page
- Also fixed a real, separate bug: an invisible "Explore Menu" button
  caused by `clsx()` not resolving conflicting Tailwind classes — fixed by
  switching to `tailwind-merge`

So there were two divergent branches: **mine** (more complete — orders,
settings, all the async-loading bug fixes, the `categoryId` nullable
schema fix) and **v2** (real auth, but missing orders/settings entirely,
and missing my Phase 2 bug fixes).

**This session merged them**, using my codebase as the base (since it was
strictly more complete on the data layer) and porting v2's authentication
work into it — plus finishing what v2 had left incomplete (auth existed,
but nothing actually *enforced* it yet).

---

## What this merge session actually did

### Ported from v2 into the main codebase
- `lib/auth.ts` — NextAuth config, Credentials provider, JWT session
  strategy, role embedded in the token/session
- `lib/session.ts` — `requireAdmin()` helper (session + role check,
  returns a ready-to-return 401/403 `NextResponse` or the session)
- `types/next-auth.d.ts` — type augmentation so `session.user.id` and
  `session.user.role` are properly typed everywhere
- `components/providers/AuthSessionProvider.tsx` — thin wrapper around
  NextAuth's `SessionProvider`
- `app/api/auth/[...nextauth]/route.ts` — the NextAuth route handler
- Real Login page (calls `signIn("credentials", …)`)
- `tailwind-merge` dependency + the `cn()` utility fix + a new `slugify()`
  helper in `lib/utils.ts`

(Note: files copied from v2 had Windows CRLF line endings — normalized to
LF during the copy.)

### Built fresh, to actually close the security gaps
- **`app/api/register/route.ts`** — v2 had no registration endpoint at
  all; the Register page was still mock-only. Built this from scratch:
  validates input, checks for an existing email, hashes the password,
  creates a `CUSTOMER`-role user. Register page now calls it, then signs
  the new user in immediately.
- **`middleware.ts`** — v2 had no route-level protection for `/admin/*`
  at all (despite `requireAdmin()` existing, nothing called it). Built
  using `next-auth/middleware`'s `withAuth()` — redirects to `/login` if
  no session, redirects to `/` if logged in but not an `ADMIN`.
- **Added `requireAdmin()` calls to every mutating API route** — this is
  the big one. Before this session, every `POST`/`PATCH`/`DELETE` route
  across both branches had a comment saying "⚠️ not yet protected." Now
  they all actually call `requireAdmin()` first:
  - `app/api/categories/route.ts` (POST)
  - `app/api/categories/[id]/route.ts` (PATCH, DELETE)
  - `app/api/foods/route.ts` (POST)
  - `app/api/foods/[id]/route.ts` (PATCH, DELETE)
  - `app/api/orders/[id]/route.ts` (PATCH)
  - `app/api/settings/route.ts` (PATCH)
- **`GET /api/orders` now requires an ADMIN session.** Added a separate
  `GET /api/orders?mine=true` path that requires *any* logged-in session
  and returns only that user's own orders (via `Order.userId`).
- **`POST /api/orders`** now reads the session server-side (via
  `getServerSession`) and links the order to the logged-in user if there
  is one — never trusts a client-supplied user id. Still works for guests
  with no account (deliberately — see "Known gaps" below).
- **Navbar and AdminHeader are now session-aware** — real logged-in
  name, a logout button, an "Admin" link (only shown to admins) instead
  of a static "Login" link / hardcoded "Restaurant Admin" text.

### A real integration bug I found and fixed mid-merge
`OrderContext` (from my earlier Phase 2 work) auto-fetched **all** orders
on mount, for every page in the app — because `OrderProvider` wraps the
entire app at the root layout, including the public storefront. Once
`GET /api/orders` started requiring an admin session, this meant **every
anonymous visitor to the homepage would trigger a failing 401 request**
in the background.

Fixed by removing the automatic fetch entirely. `OrderContext` now
exposes `loadAll()` (admin — fetches everything) and `loadMine()`
(customer — fetches only their own orders) as functions the *consuming
page* calls explicitly in its own `useEffect`:
- `app/admin/page.tsx`, `app/admin/orders/page.tsx`,
  `app/admin/payments/page.tsx` → call `loadAll()` on mount
- `app/(customer)/my-orders/page.tsx` → calls `loadMine()` on mount, and
  now requires login (shows a "Log in to see your orders" prompt via
  `useSession()` if not authenticated, instead of an empty list)
- Checkout, order-confirmation, track-order were already fine — they
  don't depend on the bulk list (`placeOrder` and `fetchOrder` are
  independent, targeted requests)

---

## ⚠️ Action required before this can be tested

**1. Install the new dependencies:**
```bash
npm install
```
(New: `next-auth`, `@next-auth/prisma-adapter`, `bcryptjs`, `tailwind-merge`
— some may already be present from earlier `package.json` edits, but
`npm install` will reconcile everything against `package-lock.json`.)

**2. Confirm your `.env.local` / `.env` already have these** (they should,
from Phase 1 setup — nothing new needed here since middleware/NextAuth
reuse `NEXTAUTH_SECRET` and `NEXTAUTH_URL`):
```
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

**3. Run it locally:**
```bash
npm run dev
```

**4. Test in this order:**
- Visit `/admin` **while logged out** → should redirect to `/login`
  (this proves `middleware.ts` works)
- Go to `/register`, create a real account → should auto-log-in and
  redirect home; Navbar should now show your name instead of "Login"
- Log out (Navbar → logout icon), then log back in via `/login` with
  the same credentials → should work
- Log in as the seeded admin:
  ```
  email:    admin@dineflow.example
  password: ChangeMe123!
  ```
  → should reach `/admin` successfully, and the header should show
  "Admin" (or whatever name is on that seeded user) instead of "Restaurant
  Admin"
- **As the admin**, add/edit/delete a food and a category — confirm these
  still work now that the routes require `requireAdmin()`
- **Log out**, then try calling one of the admin API routes directly
  (e.g. open browser dev tools → Network, or just try
  `fetch('/api/foods', {method:'POST', ...})` from the console) → should
  get a 401, proving the API-level protection works independently of the
  page-level middleware
- As a **logged-in customer** (not admin), place an order, then visit
  `/my-orders` → the order should appear
- **Log out and place an order as a guest** (no account) → checkout
  should still work (this is intentional), and the confirmation/tracking
  links should still work even though there's no "My Orders" entry for it

**5. Report back exactly what happens**, especially any red console
errors. This merge touched a lot of interconnected files and has not been
run yet — a small bug on first test is normal, not alarming.

**6. Once local testing passes**, push to GitHub and change the seeded
admin password before this goes anywhere near real users:
```bash
git add .
git commit -m "Phase 3: real authentication, merged with Phase 2 orders/settings work"
git push
```

---

## Known gaps / deliberately left unfinished

- **Guest checkout orders aren't linked to any account.** This is
  intentional — requiring login just to order food adds friction most
  restaurant sites avoid. A guest can still track their one order via the
  direct confirmation/tracking link, but won't see it in an order
  *history* unless they register. A good future polish item: a banner on
  the confirmation page suggesting guests create an account.
- **Order-lookup-by-number is somewhat guessable.** `GET /api/orders/[id]`
  is deliberately open (no login required) so guests can view their own
  order — but the order *number* is just a random 5-digit code. Documented
  in the route file itself as a Phase 8 hardening item (e.g. require the
  customer's email as a second factor when looking up by number,
  specifically — not needed for the internal cuid id, which is
  effectively unguessable).
- **No password reset flow.** The Login page still has a non-functional
  "Forgot password?" button. Not scoped into Phase 3 — would need an email
  provider (Phase 6 territory) to send reset links.
- **Admin still can't mark a food as "Popular"/"Featured" from the UI** —
  this gap predates both branches and wasn't touched in this merge.
- **The seeded admin password (`ChangeMe123!`) is still the seeded admin
  password.** Change it for real before any real user touches this site.
- **`supabase/` CLI folder and `.git` history from the v2 upload were not
  merged** — only the application code was ported. If the user wants
  Supabase CLI tooling (local Supabase dev environment, migrations via
  the Supabase CLI rather than Prisma) that's a separate, deliberate
  decision to make later, not something silently carried over.

---

## If you're a new Claude session picking this up

1. Read `TODO.md` for the full roadmap.
2. Read this file for the "how we got here" context above.
3. **Ask the user whether they've run the "Action required" steps and what
   happened** — don't assume this merge works end-to-end. Debug from their
   exact error rather than guessing.
4. If they mention using Claude Code or another tool in parallel again,
   **ask to see the resulting code/zip before assuming anything about its
   state** — as this session demonstrates, parallel work can diverge in
   non-obvious ways (missing routes, unenforced auth helpers, etc.) that
   only show up on close inspection, not from commit messages alone.
5. Once Phase 3 is confirmed working end-to-end, Phase 4 (real payments)
   is next per `TODO.md` — SSLCommerz is the recommended gateway for a
   Bangladesh-based restaurant, but that requires a merchant account the
   user needs to register for externally first (can take a few business
   days), so it's worth raising that lead time early if they want to move
   toward it.
6. The user is a self-described complete beginner developer — keep using
   very explicit, numbered, copy-pasteable instructions for anything they
   need to do outside the code itself.

---

## Addendum: post-merge polish (same session, before any test feedback)

After the merge above, and **before the user had reported back any test
results**, I did a full diff of every remaining file between my codebase
and the v2 upload to make sure nothing else was missed. Findings:

- `README.md`, `.eslintrc.json`, `tsconfig.json`, `prisma/seed.ts`,
  `.env.example`, `components/admin/Sidebar.tsx`, `tailwind.config.ts` —
  all identical between the two branches, nothing to merge.
- `app/admin/foods/page.tsx` — v2's version was actually *behind* mine
  (no loading skeletons, no per-row toggle-loading state, and its
  `FoodFormModal` doesn't await the save the way mine does). Confirmed my
  version should stay as-is; no changes pulled from v2 here.
- `next.config.js` — v2 had changed the image `remotePatterns` from a
  fixed Unsplash-only list to a hostname wildcard (`**`). This is a real
  fix for a real usability gap (the admin Food/Category forms accept any
  pasted image URL, but Next's image optimizer rejects any domain not
  explicitly whitelisted) — ported this over, with a comment explaining
  it's an intentional, temporary loosening until Phase 5 (real uploads)
  removes the need for admins to paste arbitrary URLs at all.

Also closed a previously-documented known gap while I had the file open:
**`FoodFormModal` now has "Show in Popular Dishes" and "Feature on
homepage" checkboxes** (wired to `isPopular`/`isFeatured`, which the
`Food` type and database already supported — only the UI was missing).
This means new foods added via the admin panel can now actually appear in
the homepage's "Popular Dishes" section, which previously only showed the
originally-seeded foods.

**None of this addendum work has been tested either** — it's all still
pending the user's first real test pass through the "Action required"
checklist above.

---

## Session 3: test results confirmed + live-update fixes (all untested changes below)

**Great news:** the user ran the full Phase 3 test checklist from Session
2 (admin redirect-when-logged-out, register, admin login + CRUD, customer
order + My Orders, guest checkout) and **all of it passed.** Phase 3 is
now confirmed working end-to-end, not just "code complete."

Two real gaps the user found through actual use:

1. **Admin dashboard/orders page didn't show new orders without a manual
   refresh.** Root cause: `OrderContext.loadAll()` was only ever called
   once, in each admin page's own mount effect — nothing kept it fresh
   afterward.

   **Fixed** by moving polling into `app/admin/layout.tsx` (which wraps
   every `/admin/*` page and — unlike individual page components —
   does NOT remount when navigating between admin pages, so a single
   10-second interval there stays alive across the whole admin session).
   It also now diffs the incoming order list against a `useRef`-tracked
   set of already-seen order ids and fires a toast ("New order received:
   DF-XXXXX") for genuinely new ones — carefully built so the *first*
   load (every order that already existed) never triggers a toast flood,
   only orders that appear in a *later* poll do.

   Also wired `AdminHeader`'s notification bell to real data — it now
   lists actual orders needing attention (status placed/confirmed, or a
   failed payment) instead of three hardcoded fake lines, and the red
   dot only shows when there's something to see.

   **⚠️ I made and caught a real mistake here worth knowing about:** my
   first edit to `AdminHeader.tsx` used `str_replace` with an `old_str`
   that only matched through the *opening* of the notification dropdown
   section, but the `new_str` I supplied was a complete, self-closing
   component (including the profile menu and closing tags). The tool
   applied it correctly, but the result was a file with the profile
   section and closing tags duplicated — the *original* profile section
   was still there too, right after. Balance-checked, caught it
   immediately (brace count was off by one), and fixed by truncating the
   file back to the single correct copy. **Full file inspected via
   `view` afterward to confirm it's correct** — but genuinely re-verify
   this file compiles cleanly as part of your first test pass, since it's
   the one file this session where a mechanical editing mistake actually
   happened (even though it was caught and fixed).

2. **No notifications reach the customer when their order status
   changes**, unless they happen to have the tracking page open (which
   already polls and updates live — that part already worked). Real
   "reach them anywhere" notifications need an email provider — this is
   Phase 6 work, not something fixable with a quick patch. Added detail
   to `TODO.md` Phase 6 distinguishing what's now done (admin in-app
   live updates) from what still needs an external service (customer
   email notifications) — **the user has not yet been asked whether they
   want to start Phase 6 now**; that's the natural next conversational
   step once GitHub is sorted out (see below).

### GitHub state — flagged by the user, not yet resolved as of writing this

The user's **GitHub repo currently reflects the old `dineflow_v2.zip`
state** (pushed by their separate Claude Code session). Their **local
working directory has the newer merged code** (this session's zip,
already tested and passing). These have diverged. I was about to write
careful step-by-step git instructions for reconciling this — accounting
for the real possibility that a plain `git push` gets rejected as
non-fast-forward (since GitHub has commits the local repo doesn't), in
which case the safe resolution for a solo developer who wants their
tested local state to win is `git push --force` (with the risk of that
command clearly explained, not just the command itself).

**If you're picking this up and the user hasn't yet pushed:** that's the
very next thing to help with. Have them run `git status` and
`git remote -v` first to confirm what they're working with before
touching anything.


