# PR: Customer corrections — June 2026 (Madison Condurso email)

Implements the "Corrections to Mainstream Back End" list from the client.
Branch: `feat/customer-corrections-jun2026` → base `feat/sfms-implementation-plan-v3`.

## ⚠️ Run these migrations before/at deploy (in order)

These features need DB changes. Run in the Supabase SQL editor in numeric order:

- `supabase/migrations/00019_machines_description_image_delete.sql`
  — adds `machines.description`, `machines.image_url`, and a DELETE policy for managers/owners.
- `supabase/migrations/00020_token_transactions_edit_delete.sql`
  — adds UPDATE + DELETE policies on `token_transactions` for managers/owners.
- `supabase/migrations/00021_storage_media_bucket.sql`
  — creates the public `media` storage bucket + policies for prize/machine images.

All three are idempotent (safe to re-run). The frontend compiles without them,
but the new buttons will error at runtime until they're applied.

## Fixed

- **Prize Inventory — edit price.** New **Edit** dialog on each prize: name,
  description, **ticket cost (price)**, category, reorder threshold, active, and
  picture. (Stock keeps its existing quick-edit button.)
- **Remove the token percentage add.** Token pricing is now flat **3 tokens per
  $1** (`$20 = 60`, was 66 "10% savings"). Removed the "+6 Bonus Tokens" /
  "savings" labels from the live home and pricing pages. Seasonal deals (e.g.
  "$100 gets $10 free") are meant to run through **coupons** so they can be
  toggled on/off — no code change needed to switch a deal on/off.
- **Machines — edit description + delete.** New **Edit** dialog (incl. a
  description field) and a **Delete** action (with confirm) for machines no
  longer inventoried.
- **Email requests — view full message.** The inquiries inbox previously never
  showed the message body. Added a **View** dialog with the full message,
  sender, topic, timestamp, a "Reply by email" link, and auto-marks new
  inquiries as read.
- **Party Bookings — view full message.** Added a **View** dialog showing the
  full `special requests` message plus contact email, guest counts, deposit, and
  totals.

## Added

- **Prize Inventory — picture per product.** Upload/replace/remove an image;
  shown on the prize card (and already surfaced on the customer prizes page).
- **Machines — picture slotted.** Same upload control; shown on the machine card.
- **Delete / edit token purchases after processing.** Token transaction log now
  has per-row **Edit** (amount, tokens, payment type) and **Delete** (with
  confirm); revenue stats refresh automatically. Owner/manager only.

## Implementation notes

- Images upload to a single public Supabase Storage bucket `media`
  (`media/prizes/…`, `media/machines/…`) via a shared
  `ImageUploadField` component and `src/lib/storage.ts` helper. Public read so
  `<img src>` works without signed URLs; uploads restricted to staff by RLS.
- Permissions reuse the existing SECURITY DEFINER helpers
  (`is_staff()`, `is_manager_or_owner()`) from migration `00016`.
- Typecheck passes (`tsc --noEmit`, exit 0). No dependencies added.

See `docs/SUPABASE-TRANSFER.md` for moving the project from the personal
Supabase account to the business account (separate from this PR).
