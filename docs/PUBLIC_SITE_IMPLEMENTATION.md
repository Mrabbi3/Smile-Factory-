# Public Site Implementation

## Purpose

This document records the public website work implemented during the redesign and polish pass for The Smile Factory. It covers structure, design decisions, page behavior, reusable components, interaction changes, and the remaining limitations so the current state is clear at commit time.

## Scope of Work

The public-facing site under `src/app/(public)` was redesigned and standardized around a shared visual system and a tighter user journey.

Implemented scope:

- Consolidated the active Next.js app to the root workspace and continued work in the root `smile_factory` project.
- Reworked the public site to a unified red-led brand direction inspired by the supplied Stitch references.
- Standardized typography, spacing, surfaces, and call-to-action styling.
- Completed or rewrote the six main public pages: Home, About, Pricing, Parties, Gallery, and Contact.
- Added lightweight client-side interactions where the public experience benefits from local state.
- Replaced temporary or AI-style page photography with intentional empty photo frames while preserving layout.
- Added a simple route transition for public page navigation.

## Design System Implementation

The public site was aligned to a shared implementation of the design direction described in `design.md` and reflected in `tailwind.config.ts`.

Key implementation choices:

- Primary visual identity uses a strong red accent for major calls to action, badges, active states, and selected pricing bundles.
- Headline typography uses `Epilogue`; body and utility text use `Work Sans` through `next/font/google` in `src/app/layout.tsx`.
- Section backgrounds rely on layered neutrals, red glow fields, factory-style SVG patterns, and blueprint overlays instead of flat fills.
- Rounded surfaces and soft ambient shadows are used in place of dense border-heavy separation.
- Shared visual motifs include the factory pattern, blueprint gear pattern, glassy navigation treatment, and bold italic uppercase headlines.

## Public Route Structure

The public site now uses the `(public)` route group as its own presentation boundary.

Relevant files:

- `src/app/(public)/layout.tsx`
- `src/app/(public)/template.tsx`
- `src/components/public/navbar.tsx`
- `src/components/public/footer.tsx`

Behavior:

- The public layout wraps all marketing pages with the shared navbar, footer, and chatbot.
- The public route template applies a lightweight slide-and-fade page transition on navigation between public routes.
- The transition is CSS-driven, short in duration, and includes reduced-motion fallback for lower-power devices and accessibility.

## Home Page

Primary implementation file:

- `src/components/public/home-page-content.tsx`

Wrapper:

- `src/app/(public)/page.tsx`

Implemented changes:

- Moved the home page content into a client component so interactive sections could be implemented without forcing the entire app shell to be client-rendered.
- Updated the hero with brand-first messaging, stronger CTA hierarchy, and preserved logo branding.
- Wired hero actions to real destinations:
  - `Book a Party` routes to `/parties`
  - `View Pricing` routes to `/pricing`
- Reworked the feature grid to align with the new brand system and consistent spacing.
- Converted the token pricing section into an interactive selection UI using local React state.
- Leveled the pricing cards so their action areas align visually.
- Reworked the social section into framed placeholders for future real photos.
- Replaced the previous outbound review behavior with an in-page review area.

Review system details:

- Uses two local tabs: `reviews` and `form`.
- Stores user-submitted reviews in browser `localStorage` under `smile-factory-home-reviews`.
- Preserves hardcoded initial reviews and appends locally submitted reviews.
- No backend persistence was added for reviews during this pass.

## Pricing Page

Primary implementation file:

- `src/components/public/pricing-page-content.tsx`

Wrapper:

- `src/app/(public)/pricing/page.tsx`

Implemented changes:

- Moved pricing content into a dedicated client component to support card selection without adding unnecessary client state to unrelated routes.
- Restyled the pricing page to visually follow the Home page rather than behaving as a disconnected section.
- Added local bundle selection so clicking a token tier highlights the card in red rather than redirecting away.
- Linked supporting CTA actions to `/parties` and `/#reviews`.
- Preserved a strong visual hierarchy around the most popular token tier.
- Replaced promotional photos with framed placeholders for future real imagery.

## About Page

Primary implementation file:

- `src/app/(public)/about/page.tsx`

Implemented changes:

- Updated the page to the shared typography, spacing, and surface system.
- Refined the hero, story, and CTA sections to match the public brand direction.
- Strengthened CTA visibility with red-first treatment.
- Removed temporary page photography and kept the original image spaces as placeholders for future arcade photos.

## Parties Page

Primary implementation file:

- `src/app/(public)/parties/page.tsx`

Implemented changes:

- Rebuilt the page around the shared visual language and Stitch-inspired structure.
- Improved CTA behavior so the page supports a clearer booking journey.
- Updated package and add-on presentation for better visibility and stronger red emphasis.
- Added or refined in-page navigation behavior such as package-focused CTA targeting.
- Replaced party-related photos with preserved frames for future real-event photography.

## Gallery Page

Primary implementation file:

- `src/app/(public)/gallery/page.tsx`

Implemented changes:

- Reworked the gallery into clear content sections for arcade action, birthday moments, prize highlights, and social content.
- Preserved the original visual rhythm and frame proportions while removing all temporary images.
- Converted the page to frame-based placeholders so the gallery can be populated later with real Smile Factory photography without reworking the layout.

## Contact Page

Primary implementation file:

- `src/app/(public)/contact/page.tsx`

Implemented changes:

- Reworked the contact page into the shared public design system.
- Preserved the contact form and business information layout.
- Replaced the temporary location/map imagery with a framed placeholder to maintain the existing section balance.

## Reusable Public Components Added or Refined

### Home page client container

- File: `src/components/public/home-page-content.tsx`
- Purpose: centralizes home-page-only interactivity, including token selection and the local review workflow.

### Pricing page client container

- File: `src/components/public/pricing-page-content.tsx`
- Purpose: centralizes pricing-page-only selection state and visual highlighting.

### Photo frame placeholder

- File: `src/components/public/photo-frame-placeholder.tsx`
- Purpose: preserves image layout space without shipping temporary photography.

Behavior:

- Accepts a frame title and optional helper note.
- Renders a neutral framed block with a dashed circular marker and replacement guidance.
- Used across About, Parties, Gallery, Contact, and Pricing.

## Animation Implementation

Files:

- `src/app/(public)/template.tsx`
- `src/app/globals.css`

Implemented behavior:

- Public route changes now animate with a short horizontal slide and fade.
- The animation is intentionally simple and CSS-only for low runtime cost.
- Reduced-motion users do not receive the animation.

Design intent:

- Add polish between public pages without introducing a heavy animation library or noticeable device cost.

## Image Strategy Change

The original temporary visual direction used generated imagery in several places. That was intentionally replaced.

Final implemented strategy:

- Keep the Smile Factory logo in the navbar, footer, and hero where branding is required.
- Remove temporary page photography from the public marketing pages.
- Preserve the original image slots as empty framed placeholders.
- Use those frames as planned insertion points for real arcade, prize, party, and floor photography later.

Remaining logo images intentionally preserved:

- `src/components/public/navbar.tsx`
- `src/components/public/footer.tsx`
- `src/components/public/home-page-content.tsx`

## Stitch Reference Assets Added

The workspace also contains reference assets and exported data used to guide the redesign. These are not runtime app code.

Examples:

- `staging/stitch/...`
- `stitch-get-project.json`
- `stitch-home-screen.json`
- `stitch-list-screens.json`
- `stitch-tools.json`

These files were used as design reference material for structure, layout direction, and visual matching during the public-site rewrite.

## Validation Performed

During implementation, editor diagnostics were used to validate the modified public page files and new public components.

Validated areas included:

- Placeholder frame imports and usage
- Client component boundaries
- Public route template file
- Public page compile diagnostics after the photo-frame conversion

Note:

- CSS diagnostics in `src/app/globals.css` may still show unknown Tailwind directives in generic tooling because the file uses Tailwind v4 syntax. That is a tooling interpretation issue, not a new regression introduced by the public route animation styles.

## Known Limitations and Follow-Ups

- Review submissions on the home page are local-only and do not persist to a database.
- Placeholder photo frames are ready for replacement, but real image asset loading and content management are not part of this pass.
- The route transition is intentionally one-directional and simple; it does not calculate navigation direction.
- Interactive token selection is present for UX feedback but is not connected to checkout or kiosk flows.
- Some older session memory notes reference pre-redesign layouts; this document reflects the current implemented state.

## Commit Summary

At a high level, this implementation delivers a unified public marketing site with:

- a consistent design system,
- stronger CTA paths,
- lighter client-side interactivity where useful,
- preserved photo layout slots without placeholder imagery,
- and lightweight route transitions between the main public pages.