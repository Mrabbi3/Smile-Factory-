```markdown
# Design System Document

## 1. Overview & Creative North Star: "The Joy Assembler"

This design system is not a mere collection of components; it is an industrial celebration of play. While typical arcade interfaces lean into dark, neon-soaked "gamer" aesthetics, we are pivoting toward **"The Joy Assembler"**—a Creative North Star that blends clean, high-end editorial layouts with the mechanical soul of a precision-engineered factory.

We break the "template" look by treating the UI as a living assembly line. Expect intentional asymmetry, where technical "Poppy Red" accents cut through sophisticated off-white surfaces. We utilize overlapping depth and monumental typography to create a sense of scale, making the digital experience feel as physical and high-energy as the arcade floor itself.

---

## 2. Colors

Our palette is anchored by the high-octane **Primary (#bb0100)**, a refined interpretation of "Poppy Red." It is balanced against a sophisticated neutral foundation to ensure the brand feels premium, not juvenile.

### Surface Hierarchy & Nesting
To achieve editorial depth, we follow a strict **Tonal Layering** approach. The UI is a series of stacked sheets:
*   **Base Layer:** Use `surface` (#f6f6f6) for the overall background.
*   **Secondary Sections:** Use `surface-container-low` (#f0f1f1) to define large content areas.
*   **Elevated Components:** Use `surface-container-lowest` (#ffffff) for cards or interactive modules to make them "pop" against the off-white base.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts or the white space defined in our Spacing Scale. If two areas need separation, change the `surface-container` tier.

### The "Glass & Gradient" Rule
Standard flat colors lack the "industrial gleam" we require. 
*   **Floating Elements:** Use Glassmorphism (semi-transparent `surface` colors with a 12px–20px backdrop-blur) for navigation bars or hovering modals.
*   **Signature Textures:** Apply a subtle linear gradient from `primary` (#bb0100) to `primary-container` (#ff7763) on main CTAs to mimic the glossy finish of a high-end arcade machine.

---

## 3. Typography

The typographic system balances the mechanical grit of the factory with the clarity of modern editorial design.

*   **Display & Headlines (Epilogue):** This is our "Industrial Voice." Epilogue’s slightly geometric, heavy-weight sans-serif structure provides a high-readability, high-impact header. Use `display-lg` (3.5rem) for hero sections to create an authoritative brand presence.
*   **Body & Titles (Work Sans):** Our "Technical Manual." Work Sans is optimized for legibility. Its clean, open apertures ensure that even at `body-sm` (0.75rem), information like game rules or prize descriptions remains crystal clear.
*   **Hierarchy Note:** Use high-contrast scaling. A `display-md` headline should sit confidently above a `body-md` description, using `primary` color for emphasis in the headline to draw the eye immediately.

---

## 4. Elevation & Depth

We reject drop-shadow defaults. Depth is a product of light and layering.

*   **The Layering Principle:** Stacking `surface-container-lowest` on top of `surface-container-high` creates a natural, soft lift. This mimics the way mechanical parts are layered in a factory.
*   **Ambient Shadows:** When a true floating effect is required (e.g., for a "Win!" notification), use a shadow with a 32px blur, 4% opacity, and a tint derived from `on-surface` (#2d2f2f). This creates a sophisticated "ambient occlusion" rather than a dated "drop shadow."
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline-variant` (#acadad) at **15% opacity**. It should be felt, not seen.
*   **Industrial Patterning:** Incorporate subtle, low-opacity (2%) SVG patterns of gears or technical schematics in `surface-container-highest` areas to reinforce the "Smile Factory" aesthetic without cluttering the UI.

---

## 5. Components

### Buttons
*   **Primary:** `rounded-full`, Background: `primary` (#bb0100) to `primary-container` gradient. Text: `on-primary` (#ffefed). Always include a clear, functional icon (e.g., a gear or arrow).
*   **Secondary:** `rounded-lg`, Background: `secondary-container` (#ffc2c6). Text: `on-secondary-container` (#852233).
*   **Tertiary:** Ghost style. No background. Use `title-sm` with a `primary` color icon.

### Cards & Lists
*   **Rule:** Forbid divider lines.
*   **Style:** Use `surface-container-lowest` with a `lg` (2rem) corner radius. Use `spacing-6` (1.5rem) as the internal padding gutter. Separate list items using a subtle background shift to `surface-container-low` on hover.

### Input Fields
*   **Style:** `rounded-md` (1.5rem). Background: `surface-container-highest` (#dbdddd).
*   **States:** On focus, the border-less field should transition its background to `surface-container-lowest` and gain a 2px "Ghost Border" in `primary`.

### Specialized Component: The "Prize Gear" Chip
*   A selection chip used for ticket counts or prize categories. Features a small spinning gear icon (animation-trigger on hover) and uses the `tertiary` (#7b40a2) color tokens to stand out from the primary brand red.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts. Let a header bleed off the left margin while body text is centered.
*   **Do** use `rounded-full` for high-action items (Play, Win, Buy) and `rounded-lg` for structural containers.
*   **Do** leverage the `primary-fixed` token for elements that must remain vibrant regardless of subtle background shifts.

### Don't:
*   **Don't** use black (#000000) for text. Use `on-surface` (#2d2f2f) to maintain a premium, editorial feel.
*   **Don't** use 1px solid borders to separate sections. It breaks the "Joy Assembler" fluid depth.
*   **Don't** crowd the interface. If a layout feels tight, increase spacing using the `spacing-12` (3rem) or `spacing-16` (4rem) tokens. In a factory, machines need room to breathe; so does your data.

---

*This design system is a living framework. When in doubt, prioritize high-contrast readability and the tactile feel of industrial layering.*```