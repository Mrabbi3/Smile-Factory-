# Design System Document

## 1. Overview & Creative North Star: "The Joy Assembler"

This design system is not a mere collection of components; it is an industrial celebration of play. While typical arcade interfaces lean into dark, neon-soaked "gamer" aesthetics, we are pivoting toward **"The Joy Assembler"**—a Creative North Star that blends clean, high-end editorial layouts with the mechanical soul of a precision-engineered factory.

We break the "template" look by treating the UI as a living assembly line. Expect intentional asymmetry, where technical "Poppy Red" accents cut through sophisticated off-white surfaces. We utilize overlapping depth and monumental typography to create a sense of scale, making the digital experience feel as physical and high-energy as the arcade floor itself.

---

## 2. Colors

Our palette is anchored by the high-octane **Primary (#bb0100)**, a refined interpretation of "Poppy Red." It is balanced against a sophisticated neutral foundation to ensure the brand feels premium, not juvenile.

### Color Tokens
- **Primary:** #bb0100 (Poppy Red)
- **Primary Container:** #ff7763 (Light Poppy)
- **On Primary:** #ffefed (Off-white text on primary)
- **Secondary Container:** #ffc2c6 (Light Pink)
- **On Secondary Container:** #852233 (Dark Red text)
- **Surface:** #f6f6f6 (Base background)
- **Surface Container Low:** #f0f1f1 (Secondary sections)
- **Surface Container Lowest:** #ffffff (Elevated cards)
- **Surface Container High:** #e8e9e9 (Deep sections)
- **Surface Container Highest:** #dbdddd (Input backgrounds)
- **On Surface:** #2d2f2f (Premium dark text, never pure black)
- **Outline Variant:** #acadad (Ghost borders at 15% opacity)
- **Tertiary:** #7b40a2 (Purple accent for special chips)

### Surface Hierarchy & Nesting
To achieve editorial depth, we follow a strict **Tonal Layering** approach. The UI is a series of stacked sheets:
* **Base Layer:** Use `surface` (#f6f6f6) for the overall background.
* **Secondary Sections:** Use `surface-container-low` (#f0f1f1) to define large content areas.
* **Elevated Components:** Use `surface-container-lowest` (#ffffff) for cards or interactive modules to make them "pop" against the off-white base.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts or the white space defined in our Spacing Scale. If two areas need separation, change the `surface-container` tier.

### The "Glass & Gradient" Rule
Standard flat colors lack the "industrial gleam" we require.
* **Floating Elements:** Use Glassmorphism (semi-transparent `surface` colors with a 12px–20px backdrop-blur) for navigation bars or hovering modals.
* **Signature Textures:** Apply a subtle linear gradient from `primary` (#bb0100) to `primary-container` (#ff7763) on main CTAs to mimic the glossy finish of a high-end arcade machine.

---

## 3. Typography

The typographic system balances the mechanical grit of the factory with the clarity of modern editorial design.

### Font Stack
- **Headlines & Display (Epilogue):** Geometric, heavy-weight sans-serif for industrial voice
- **Body & Details (Work Sans):** Clean, legible sans-serif for technical manual clarity

### Sizing Scale
- **Display Large:** 3.5rem (56px) / Line-height: 0.9 / Letter-spacing: -0.02em
- **Display Medium:** 2.8rem (45px) / Line-height: 0.95 / Letter-spacing: -0.01em
- **Headline Large:** 2.2rem (35px) / Line-height: 1 / Letter-spacing: 0
- **Headline Medium:** 1.8rem (28px) / Line-height: 1.05 / Letter-spacing: 0.005em
- **Title Large:** 1.4rem (22px) / Font-weight: 700 / Line-height: 1.1
- **Title Medium:** 1.2rem (18px) / Font-weight: 700 / Line-height: 1.2
- **Title Small:** 1rem (16px) / Font-weight: 700 / Line-height: 1.3
- **Body Large:** 1.125rem (18px) / Font-weight: 400 / Line-height: 1.5
- **Body Medium:** 1rem (16px) / Font-weight: 400 / Line-height: 1.5
- **Body Small:** 0.875rem (14px) / Font-weight: 400 / Line-height: 1.5
- **Label Large:** 0.875rem (14px) / Font-weight: 700 / Line-height: 1.3 / Letter-spacing: 0.01em
- **Label Small:** 0.75rem (12px) / Font-weight: 700 / Line-height: 1.2 / Letter-spacing: 0.03em

### Hierarchy Note
Use high-contrast scaling. A `display-md` headline should sit confidently above a `body-md` description, using `primary` color for emphasis in the headline to draw the eye immediately.

---

## 4. Spacing Scale

Consistent spacing creates rhythm and breathing room throughout the interface.

- **Spacing 2:** 0.5rem (8px)
- **Spacing 3:** 0.75rem (12px)
- **Spacing 4:** 1rem (16px)
- **Spacing 6:** 1.5rem (24px)
- **Spacing 8:** 2rem (32px)
- **Spacing 12:** 3rem (48px)
- **Spacing 16:** 4rem (64px)
- **Spacing 20:** 5rem (80px)
- **Spacing 24:** 6rem (96px)

---

## 5. Elevation & Depth

We reject drop-shadow defaults. Depth is a product of light and layering.

* **The Layering Principle:** Stacking `surface-container-lowest` on top of `surface-container-high` creates a natural, soft lift. This mimics the way mechanical parts are layered in a factory.
* **Ambient Shadows:** When a true floating effect is required (e.g., for a "Win!" notification), use a shadow with a 32px blur, 4% opacity, and a tint derived from `on-surface` (#2d2f2f). This creates a sophisticated "ambient occlusion" rather than a dated "drop shadow."
  - CSS: `box-shadow: 0 8px 32px rgba(45, 47, 47, 0.04)`
* **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline-variant` (#acadad) at **15% opacity**. It should be felt, not seen.
  - CSS: `border: 1px solid rgba(172, 173, 173, 0.15)`
* **Industrial Patterning:** Incorporate subtle, low-opacity (2%) SVG patterns of gears or technical schematics in `surface-container-highest` areas to reinforce the "Smile Factory" aesthetic without cluttering the UI.

---

## 6. Components

### Buttons

#### Primary Button
- **Shape:** `rounded-full` (9999px)
- **Background:** Linear gradient from `primary` (#bb0100) to `primary-container` (#ff7763)
- **Text Color:** `on-primary` (#ffefed)
- **Font:** Work Sans, Label Large (14px, 700 weight, uppercase)
- **Padding:** 1rem (16px) horizontal, 0.75rem (12px) vertical
- **Icon:** Always include a clear, functional icon (gear, arrow, etc.)
- **Hover State:** Slight scale increase (105%) and increased glow effect
- **Shadow:** Ambient shadow from elevation rule

#### Secondary Button
- **Shape:** `rounded-lg` (12px)
- **Background:** `secondary-container` (#ffc2c6)
- **Text Color:** `on-secondary-container` (#852233)
- **Font:** Work Sans, Label Large (14px, 700 weight, uppercase)
- **Padding:** 0.875rem (14px) horizontal, 0.625rem (10px) vertical
- **Border:** None; define through color only
- **Hover State:** Background shift to a slightly darker tone

#### Tertiary Button (Ghost)
- **Shape:** `rounded-lg` (12px)
- **Background:** Transparent
- **Text Color:** `primary` (#bb0100)
- **Icon Color:** `primary` (#bb0100)
- **Font:** Work Sans, Label Large
- **Padding:** 0.5rem (8px) horizontal
- **Border:** Optional ghost border at 15% opacity
- **Hover State:** Slight background tint at `surface-container-low`

### Cards & Lists
* **Rule:** Forbid divider lines.
* **Base Style:** `surface-container-lowest` (#ffffff) background with `rounded-lg` (12px) corner radius
* **Internal Padding:** `spacing-6` (1.5rem) gutter
* **List Item Separation:** Use subtle background shift to `surface-container-low` on hover or between items
* **Shadow:** Use ambient shadow (0 8px 32px rgba(45, 47, 47, 0.04))

### Input Fields
* **Style:** `rounded-md` (12px). Background: `surface-container-highest` (#dbdddd).
* **Font:** Work Sans, Body Medium (16px)
* **Padding:** 0.75rem (12px) horizontal, 0.625rem (10px) vertical
* **States:** 
  - **Default:** Ghost border at 15% opacity
  - **Focus:** Background to `surface-container-lowest`, 2px solid `primary` border
  - **Error:** 2px solid `#d32f2f` (error red)
* **Placeholder Text:** `on-surface` at 50% opacity

### Specialized Component: The "Prize Gear" Chip
* A selection chip used for ticket counts or prize categories.
* **Shape:** `rounded-full`
* **Background:** `tertiary` color (#7b40a2) at 10% opacity
* **Text Color:** `on-tertiary` (derived from tertiary)
* **Icon:** Spinning gear (CSS animation on hover)
* **Padding:** 0.5rem (8px) horizontal, 0.375rem (6px) vertical
* **Animation:** `rotate-360` @ 2s linear on hover

### Badge / Label Chips
* **Shape:** `rounded-full`
* **Background:** `primary` at 15% opacity
* **Text Color:** `primary` (#bb0100)
* **Font:** Label Small (12px, 700 weight, uppercase)
* **Padding:** 0.375rem (6px) horizontal, 0.25rem (4px) vertical

---

## 7. Responsive Design

### Breakpoints
- **Mobile:** 0px – 640px (default)
- **Tablet:** 641px – 1024px (md)
- **Desktop:** 1025px+ (lg)

### Grid System
- **Base Grid:** 12-column layout on desktop, 6-column on tablet, 1-column on mobile
- **Container Max-Width:** 1440px (96rem)
- **Gutter:** `spacing-8` (32px) on desktop, `spacing-6` (24px) on tablet, `spacing-4` (16px) on mobile

---

## 8. Do's and Don'ts

### Do:
* **Do** use asymmetrical layouts. Let a header bleed off the left margin while body text is centered.
* **Do** use `rounded-full` for high-action items (Play, Win, Buy) and `rounded-lg` for structural containers.
* **Do** leverage the `primary-fixed` token for elements that must remain vibrant regardless of subtle background shifts.
* **Do** maintain consistent spacing using the Spacing Scale. Never use arbitrary pixel values.
* **Do** use Epilogue for all headlines and Work Sans for all body text and UI labels.
* **Do** prioritize glassmorphism and layering over flat design or drop shadows.

### Don't:
* **Don't** use black (#000000) for text. Use `on-surface` (#2d2f2f) to maintain a premium, editorial feel.
* **Don't** use 1px solid borders to separate sections. It breaks the "Joy Assembler" fluid depth.
* **Don't** crowd the interface. If a layout feels tight, increase spacing using the `spacing-12` (3rem) or `spacing-16` (4rem) tokens. In a factory, machines need room to breathe; so does your data.
* **Don't** use pure white (#ffffff) for backgrounds except in elevated card contexts. Use `surface` (#f6f6f6) for base layers.
* **Don't** use multiple gradient directions. Keep gradients simple: linear, left-to-right or top-to-bottom.
* **Don't** apply drop shadows without the ambient occlusion principle. Shadows should feel like natural light, not paint.

---

## 9. Implementation Notes

### Tailwind CSS Configuration
All color values, spacing, and rounded corners should be defined in `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#bb0100',
          container: '#ff7763',
        },
        surface: {
          DEFAULT: '#f6f6f6',
          container: {
            low: '#f0f1f1',
            lowest: '#ffffff',
            high: '#e8e9e9',
            highest: '#dbdddd',
          },
        },
        tertiary: '#7b40a2',
      },
      fontFamily: {
        epilogue: ['Epilogue', 'sans-serif'],
        'work-sans': ['Work Sans', 'sans-serif'],
      },
      spacing: {
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        6: '1.5rem',
        8: '2rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
}
```

### Font Implementation
Import fonts in the main layout or app CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@400;700;900&family=Work+Sans:wght@400;500;700&display=swap');
```

---

*This design system is a living framework. When in doubt, prioritize high-contrast readability and the tactile feel of industrial layering.*
