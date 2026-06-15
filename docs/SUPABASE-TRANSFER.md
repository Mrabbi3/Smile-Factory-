# Moving Supabase from a personal account to the Smile Factory business account

**Short answer: yes — this can be done with zero code changes and ~no downtime.**
Supabase has a built-in **Project Transfer** that moves a project from one
organization to another *without recreating it*. Because the project keeps the
same project ref (`tatstgyphzkambjacbvl`), everything the app depends on stays
identical:

- Same API URL (`NEXT_PUBLIC_SUPABASE_URL`)
- Same anon/service keys (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, etc.)
- Same JWT secret → **logged-in customers stay logged in**
- Same schema, RLS policies, data, storage buckets

So **no `.env` changes, no Vercel env changes, no redeploy** are required. This
is the safe path and the one to use.

---

## Recommended path — Project Transfer (non-destructive)

1. **Create the business organization** in Supabase
   (Dashboard → top-left org switcher → *New organization*). Put it on the
   **Pro plan** if the project is currently Pro, so no paid features are lost in
   the move (see caveats below).
2. **Add the business owner** (and yourself) as members of the new org with the
   **Owner** role.
3. Clear the transfer blockers on the current project (see *Pre-requirements*).
4. Go to the project's **General settings**
   (Dashboard → Project → *Settings → General*) → **Transfer project**.
5. Pick the **business org** as the target and confirm.
6. Done. The app keeps running against the same URL/keys.

### Pre-requirements (Supabase enforces these)

- You must be the **Owner of the source organization** (your personal one).
- You must be at least a **member of the target** (business) org.
- **No active GitHub integration** connection on the project — disconnect it
  first if one exists (this is Supabase's GitHub/branching integration, *not*
  your Vercel→GitHub deploy, which is unaffected).
- **No project-scoped roles** pointing at the project (Team/Enterprise only).
- **No log drains** configured.

### Caveats to watch

- Moving from a **paid plan to the Free plan** can cause a **1–2 minute
  downtime** and may disable paid features. Moving **paid → paid** is
  effectively zero downtime. → If the business org will be Free, weigh that;
  otherwise **upgrade the target org to Pro before transferring**.
- Free orgs are limited to **2 free projects** — make room first if relevant.
- A transfer **cannot change the project's region**. (Not needed here.)
- Usage billed before the transfer lands on the personal org's final invoice;
  usage after lands on the business org.

---

## Fallback path — Restore to a new project (only if transfer is blocked)

Use this **only** if a transfer blocker can't be cleared. This **does** change
the URL and keys, so it requires an env update + redeploy and a short cutover.

1. In the business org, create a **new project** (same region).
2. Migrate schema + data (Supabase Dashboard has a *Restore to a new project*
   flow, or use the CLI):
   ```bash
   supabase db dump --project-ref tatstgyphzkambjacbvl --schema-only > schema.sql
   supabase db dump --project-ref tatstgyphzkambjacbvl --data-only   > data.sql
   psql "$NEW_PROJECT_DB_URL" -f schema.sql
   psql "$NEW_PROJECT_DB_URL" -f data.sql
   ```
3. **Re-upload Storage objects** (prize/machine images live in the `media`
   bucket) — the CLI `supabase storage cp` helps here.
4. To avoid logging every customer out, **reuse the original project's JWT
   secret** in the new project (Auth settings). Different JWT secret = all
   existing sessions invalidated.
5. Update `NEXT_PUBLIC_SUPABASE_URL` and the keys in `.env.local` **and** in
   Vercel, then redeploy.

---

## Bottom line

Prefer the **Project Transfer**. It's the option that does *not* break the
backend or require touching the deployed app — keys, URL, and sessions are all
preserved. Keep the personal account around until you've confirmed the business
org shows the project and the live site still works.

> Sources: [Supabase — Project Transfers](https://supabase.com/docs/guides/platform/project-transfer) ·
> [Supabase — Migrating within Supabase](https://supabase.com/docs/guides/platform/migrating-within-supabase)
