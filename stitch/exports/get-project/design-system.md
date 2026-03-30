# Design System Document

## 1. Overview & Creative North Star
### Creative North Star: "The High-Octane Playground"
This design system moves beyond the cluttered, chaotic aesthetic of traditional arcades to create a "High-Octane Playground." It is a premium, editorial-inspired digital experience that balances the raw energy of family entertainment with a sophisticated, structured layout. 

We break the "template" look by using **Kinetic Asymmetry**. Instead of rigid grids, we utilize overlapping containers, large-scale typography that breaks container boundaries, and a layered surface strategy. The goal is to make the user feel the excitement of a high-end arcade—vibrant, poppy, and fast-paced—while maintaining a professional, easy-to-navigate flow that parents and planners expect.

---

## 2. Colors
Our palette is anchored by the high-energy primary red, supported by electric yellows and deep blues to create a "Neon-Daylight" vibe.

*   **Primary (`#bc0100`):** The engine of the brand. Used for high-impact brand moments and primary actions.
*   **Secondary (`#705d00`) & Tertiary (`#006386`):** Our "Arcade Accents." These provide visual variety and are used to distinguish different entertainment zones (e.g., Gaming vs. Parties).
*   **Neutral Tones:** We use a refined spectrum of off-whites and warm greys (`surface` to `surface-container-highest`) to keep the "vibrant" colors from becoming overwhelming.

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning. We define boundaries through **Color-Block Partitioning**. Sections must be differentiated by shifting from `surface` to `surface-container-low` or `surface-container-high`. This creates a clean, modern look that feels architectural rather than "boxed in."

### Surface Hierarchy & Nesting
Treat the UI as a physical space. An inner card (`surface-container-lowest`) should sit atop a section background (`surface-container-low`), creating a natural, subtle lift. This nesting strategy replaces the need for heavy outlines.

### The "Glass & Gradient" Rule
To add a "signature" feel, floating navigation or overlay modals must utilize **Glassmorphism**. Use semi-transparent surface colors with a `backdrop-blur` (e.g., 20px). For primary CTAs, apply a subtle linear gradient from `primary` to `primary_container` to give buttons a tactile, "lit-from-within" arcade button glow.

---

## 3. Typography
We pair the expressive **Epilogue** with the functional **Plus Jakarta Sans** and the technical **Space Grotesk** to create a multi-layered editorial hierarchy.

*   **Display & Headline (Epilogue):** These are our "Voice" fonts. Used at large scales (`display-lg` at 3.5rem) to capture the "poppy" arcade energy. Use tight letter-spacing and occasional italics to imply movement.
*   **Title & Body (Plus Jakarta Sans):** Our "Information" font. It is clean, modern, and highly legible, ensuring that pricing and package details are easy to digest.
*   **Labels (Space Grotesk):** Our "Utility" font. The monospaced-leaning terminals of Space Grotesk reference digital arcade scoreboards, perfect for tags, chips, and small metadata.

---

## 4. Elevation & Depth
Depth in this system is a result of **Tonal Layering**, not structural scaffolding.

*   **The Layering Principle:** Avoid shadows where background shifts can do the work. A `surface-container-lowest` element on a `surface` background provides enough contrast to imply a 3D relationship.
*   **Ambient Shadows:** If an element must float (like a "Book Now" FAB), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(46, 46, 46, 0.06)`. The shadow is never black; it is a desaturated tint of the `on-surface` color.
*   **The "Ghost Border":** For high-density data areas where separation is required, use the `outline-variant` token at 15% opacity. It should be felt, not seen.
*   **Signature Roundedness:** We use a generous `DEFAULT` radius of `1rem` and `xl` of `3rem` to maintain a friendly, "family-oriented" softness across all high-energy components.

---

## 5. Components

### Buttons
*   **Primary:** Rounded-full, `primary` background with a subtle "inner-glow" gradient. Haptic feedback on hover (slight scale-up 1.02x).
*   **Secondary:** `secondary_container` background with `on_secondary_container` text. High contrast, low "weight."
*   **Tertiary:** No background. Bold `primary` text with an `outline-variant` ghost border that appears only on hover.

### Cards & Lists
*   **Forbid Divider Lines:** Use `spacing-8` or `spacing-12` to create "Gutter Separation" between list items. 
*   **The "Hero Card":** Use `surface-container-highest` with a `xl` (3rem) corner radius on one corner to create an asymmetrical, custom feel.

### Input Fields
*   **Styling:** Large `spacing-4` padding with `md` (1.5rem) rounded corners. Use `surface-container-high` as the fill color. The label should use `label-md` (Space Grotesk) to give a tech-forward feel.

### Additional Signature Components
*   **"Prize Chips":** Actionable selection chips using `tertiary_fixed` colors to denote special categories like "Tickets" or "Tokens."
*   **The "Live Feed" Glass Card:** A semi-transparent container with a heavy blur used for social media tickers or "Current High Scores," letting the vibrant background imagery bleed through.

---

## 6. Do's and Don'ts

### Do
*   **DO** lean into asymmetry. Overlap a `display-lg` headline across a photograph and a color block.
*   **DO** use the `rounded-xl` (3rem) radius for major section containers to maintain the "Modern Family" vibe.
*   **DO** use `primary` red for emphasis, but balance it with plenty of `surface` (off-white) whitespace to ensure the design feels "High-End" and not "Budget."

### Don't
*   **DON'T** use 1px solid black or grey borders. This immediately kills the premium editorial feel.
*   **DON'T** use standard drop shadows (e.g., `0 2px 4px`). They look dated and "out-of-the-box."
*   **DON'T** clutter the UI with icons. Let the bold typography and color shifts guide the user's eye.
*   **DON'T** use sharp corners. Every element should feel safe and approachable, consistent with a family entertainment center.
