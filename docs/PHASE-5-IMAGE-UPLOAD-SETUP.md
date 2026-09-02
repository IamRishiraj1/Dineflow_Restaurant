# Phase 5 — Real Image Uploads (Supabase Storage)

This replaces "paste an image URL" with a real upload button in the admin
Food/Category forms. Photos are stored in Supabase Storage — the same
Supabase project you already set up for the database, so no new account
is needed this time.

---

## 1. Create the storage bucket

1. Go to your [Supabase dashboard](https://supabase.com/dashboard) →
   open your DineFlow project.
2. In the left sidebar, click **Storage**.
3. Click **New bucket**.
4. Name it exactly: `food-images` (the code expects this exact name —
   see `lib/supabase-admin.ts`).
5. Toggle **Public bucket** to **ON**. This is important — it's what lets
   uploaded photos actually display on your website without every visitor
   needing to be logged in. (Uploading is still admin-only — that's
   enforced by the API route, not by the bucket being public. Public here
   just means "anyone can *view* an image once it's uploaded," which is
   exactly what you want for photos customers are supposed to see.)
6. Click **Create bucket**.

## 2. Confirm your environment variables

You should already have these from Phase 1 — no new values needed:

```
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

If you're not sure, check `.env.local` — both should already be filled
in from the original database setup.

## 3. Run it and test an upload

```bash
npm run dev
```

1. Go to `/admin/foods` → **Add New Food** (or edit an existing one).
2. Click the dashed square next to "Food photo."
3. Pick a photo from your computer (try a large one — a full-size phone
   photo is a good test, since that's exactly the case the automatic
   compression is meant to handle).
4. You should see a brief "Uploading…" state, then the square fills in
   with a preview of your photo.
5. Save the food, then check `/menu` — your real uploaded photo should
   show up on the card.

## 4. Verify in Supabase

Back in the Supabase dashboard → **Storage** → **food-images**, you
should see your uploaded file listed (named something like
`img-abc123-xyz.jpg`).

---

## What's happening behind the scenes

- **Compression happens in your browser**, before the file is even sent
  to your server — using the browser's built-in Canvas API, not a paid
  service or extra dependency. A large photo gets resized to a sensible
  maximum (1600px on the longer side) and re-compressed as JPEG, so a
  12MB phone photo typically becomes a few hundred KB before upload.
- **The upload itself is admin-only**, enforced server-side (not just
  hidden in the UI) — the same `requireAdmin()` pattern used everywhere
  else in the admin API.
- **You can still paste a raw image URL** if you'd rather use a stock
  photo — click "Or paste an image URL instead" under the upload button.
  Both paths end up filling the same field, so nothing about how foods
  store their image changed — this only changed *how* an admin gets an
  image URL into that field.

## ✅ Checkpoint

Real photo uploads are now working, end to end: browser compression →
admin-only upload API → Supabase Storage → public URL → shown on the
live menu. Let me know once you've uploaded a real photo and confirmed it
displays correctly, and we'll move to whatever's next.
