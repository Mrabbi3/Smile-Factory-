# Smile Factory — Roadmap (deferred work that needs your hands)

This file captures everything from `Bugs.pdf` that I can't safely complete from
inside the codebase alone. Each section explains what to do, why it's deferred,
and what to expect.

> **Sources:** [Bugs.pdf](../Bugs.pdf) · [GitHub repo](https://github.com/Mrabbi3/Smile-Factory-)

---

## 1. Apply migration `00015_access_keys_and_role_promotion.sql`

**What I changed (already on this branch):**

The "site alerts won't post" bug was actually a role-permission bug — staff
entered the access key, but their `profiles.role` stayed as `customer`, so every
RLS policy that requires `role IN ('owner','manager','employee')` rejected
their inserts. The fix lives in three files:

- `supabase/migrations/00015_access_keys_and_role_promotion.sql` — new
  `access_keys` table, `verify_access_key(p_key)` RPC, and a one-shot
  `bootstrap_owner_if_no_keys(p_key)` for the very first owner.
- `src/app/admin/login/actions.ts` — calls the RPC, falls back to
  `ADMIN_ACCESS_KEY` env only when no owner key has been set yet.
- `src/app/admin/settings/page.tsx` — owner-only UI to add / rotate /
  deactivate / delete keys.

**What you need to do (one time):**

1. Open Supabase → SQL editor for project `tatstgyphzkambjacbvl`.
2. Paste the contents of `supabase/migrations/00015_access_keys_and_role_promotion.sql`
   and run it.
3. Sign in to the customer site with the email you want as owner
   (mrifat205@gmail.com is fine).
4. Go to `/admin/login`, enter the value of `ADMIN_ACCESS_KEY` from
   `.env.local`. The bootstrap RPC fires once: it seeds that key as the first
   owner key and promotes your profile to `owner`.
5. Go to `/admin/settings` → "Staff & Owner Access Keys" and create a separate
   `employee` key for your counter staff. Optionally rotate the owner key.

After step 4, the `ADMIN_ACCESS_KEY` env fallback becomes inert — only DB-stored
keys work. You can rotate keys without redeploying.

---

## 2. Move Supabase project to an organization account

**Goal (Bugs.pdf, "Important stuffs"):** project off your personal Supabase, onto
an org account so the business owns it.

**Walkthrough:**

1. Create a Supabase **Organization** (Dashboard → "New organization", pick
   *Free* or *Pro* depending on traffic).
2. In the personal project (`tatstgyphzkambjacbvl`), go to
   *Settings → General → "Transfer project"*. Pick the new org as destination.
3. Confirm the email Supabase sends. Transfer is **non-destructive** — keys,
   schema, RLS, data, and the project ref all stay the same.
4. Update Vercel env vars only if you also rotated keys (you don't have to).
5. Add the rest of your team as members of the new organization with the
   correct roles (Developer / Read-only).

**Plan B — full export/import (use only if transfer fails):**

```bash
# Dump schema + data from current project
supabase db dump --project-ref tatstgyphzkambjacbvl --data-only > data.sql
supabase db dump --project-ref tatstgyphzkambjacbvl --schema-only > schema.sql
# Apply to new project
psql "$NEW_PROJECT_URL" -f schema.sql
psql "$NEW_PROJECT_URL" -f data.sql
```

Storage objects must be re-uploaded separately — easiest is the Supabase
Storage CLI: `supabase storage cp`.

---

## 3. Move domain from Squarespace to Vercel

**Goal:** point the live domain at the Vercel deployment, dropping Squarespace
hosting cost.

**Steps (DNS-only transfer, ~10 min):**

1. In Vercel project settings → *Domains* → "Add" → enter the domain.
2. Vercel shows two records:
   - `A` record `@` → `76.76.21.21`, **or**
   - `CNAME` record `www` → `cname.vercel-dns.com`
3. Log into Squarespace → *Settings → Domains → DNS settings*.
4. Replace existing A/CNAME records with the Vercel ones above.
5. Wait for DNS propagation (Vercel auto-issues a Let's Encrypt cert).
6. Flip the apex/`www` redirect in Vercel to your preference.

**Optional — actually transfer the registrar:** If you also want to stop paying
Squarespace for registration, request a **transfer authorization code** in
Squarespace, then start a domain transfer in Vercel (Vercel Domains) or any
registrar. This is separate from the DNS step and takes 5–7 days.

---

## 4. Backups / Plan B (Google Drive backup pipeline)

**Goal:** if Supabase is lost or corrupted, restore from a recent dump.

**Lightweight (recommended) — daily DB dump → Google Drive:**

1. Generate a Google service account key with Drive scope.
2. Add a GitHub Action (or Vercel Cron) that runs nightly:
   ```yaml
   - run: npx supabase db dump --db-url "$SUPABASE_DB_URL" > dump.sql
   - run: gzip dump.sql
   - run: |
       curl -X POST -F "metadata={'name':'sfms-$(date +%F).sql.gz'};type=application/json" \
            -F "file=@dump.sql.gz;type=application/gzip" \
            -H "Authorization: Bearer $GOOGLE_TOKEN" \
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart"
   ```
3. Drive folder ID + service account email become two repo secrets.

**Heavier (pro) alternative:** Supabase has built-in PITR (point-in-time
recovery) on the Pro plan — no Drive needed.

---

## 5. Live Facebook + Instagram feed

**Status:** Footer/contact already link to:
- https://www.facebook.com/TheSmileFactory/
- https://www.instagram.com/brigantinesmilefactory/

**To embed the live feed (deferred — requires Meta verification):**

1. Apply for a **Meta App** at <https://developers.facebook.com/> and request
   the `pages_read_engagement` and `instagram_basic` permissions (review
   takes 5–15 days).
2. Generate a **long-lived Page Access Token** for `TheSmileFactory`.
3. Hit `https://graph.facebook.com/v19.0/{page-id}/posts?fields=message,full_picture,created_time` and store the latest 5–10 in `cached_social_posts` (new
   table). Refresh hourly via cron.
4. Render in `src/components/public/reviews-section.tsx` next to the reviews
   carousel (the TODO marker is already there).

Until Meta approves the app, keep the static FB/IG link buttons in the footer.

---

## 6. Google Reviews automatic sync

**Status:** API route exists at `src/app/api/reviews/sync-google/route.ts` and
the `cached_google_reviews` table is wired into the public reviews section.

**To turn it on:**

1. Create a Google Cloud project, enable **Places API**, generate an API key
   restricted to your domain.
2. Find your business's Place ID:
   <https://developers.google.com/maps/documentation/places/web-service/place-id>
3. Add to `.env.local` (and Vercel env):
   ```
   GOOGLE_PLACES_API_KEY=...
   GOOGLE_PLACE_ID_SMILE_FACTORY=ChIJ...
   ```
4. Add a Vercel cron in `vercel.json` to hit `/api/reviews/sync-google`
   nightly:
   ```json
   { "crons": [{ "path": "/api/reviews/sync-google", "schedule": "0 6 * * *" }] }
   ```

---

## 7. Smaller follow-ups (not blocking)

- **Walkthrough / system tour** — easiest path is `react-joyride` or
  `intro.js`. Add a "Help → Take the tour" button in the admin top bar that
  triggers a multi-step overlay. Roadmap item; not in this PR.
- **Email coupons to a specific customer** — coupon assignment table is
  already in `00011_coupons_assignments.sql`. To actually email the coupon,
  call `/api/email/send` from the admin coupon page after insert. Re-use the
  `RESEND_API_KEY` already in env.
- **Camera-button QR scan on staff iPad** — `QrScannerButton` exists in
  `src/components/admin/qr-scanner.tsx`. Confirm Safari on iPadOS prompts for
  camera permission (it does on iPadOS 17+ if the page is HTTPS).
