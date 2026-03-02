# Design System: Dark SaaS Prospecting Flow
**Project ID:** 18171248685377189422

## 1. Visual Theme & Atmosphere
The mood is "Premium, High-end Tech, and Mysterious." It feels like a cutting-edge software tool designed for elite professionals. We rely on a deep, almost total black background contrasted with sharp, luminous accents. Space should feel airy but structured. We embrace "glassmorphism"—translucent layers that convey depth without relying entirely on traditional drop shadows.

## 2. Color Palette & Roles
*   **Abyss Void (#09090B):** The foundational background color. Used for the entire app canvas to create an infinite, borderless feel.
*   **Starlight White (#FAFAFA):** Used for primary typography, icons, and hero messaging to ensure high contrast and readability against the dark void.
*   **Muted Ghost (#A1A1AA):** Used for secondary text, metadata, and placeholders.
*   **Electric Violet (#8B5CF6):** The primary brand/accent color. Used for primary calls-to-action (buttons), active states, and glowing hover effects.
*   **Obsidian Layer (#18181A):** Used for card backgrounds, inputs, and isolated interactive sections to separate them slightly from the pure black background.
*   **Frost Glass Border (#FFFFFF with 10% opacity):** Used purely for refined 1px strokes around glass panels and inputs.

## 3. Typography Rules
*   **Primary Font:** Inter or equivalent modern, clean geometric sans-serif (e.g., Roboto/Outfit).
*   **Headings (H1/H2):** High font-weight (Bold/Semibold), tight letter-spacing (`tracking-tight`), purely white (#FAFAFA).
*   **Body & Utility:** Regular weight, slightly relaxed line-height for readability, rendered in Muted Ghost (#A1A1AA).

## 4. Component Stylings
*   **Buttons:** Subtly rounded corners (8px / `rounded-md` to `rounded-lg`). Primary buttons should be Electric Violet with a very faint drop shadow to create an "inner glow" effect. Text must be bold.
*   **Cards/Containers:** Glass-like appearance. Background should be Obsidian Layer or mostly transparent gradients (`bg-white/5`). Corners must be generously rounded (12px to 16px / `rounded-xl`). Borders are essential: use a 1px Frost Glass Border.
*   **Inputs/Forms:** Deep dark fields (`bg-transparent` or Obsidian Layer) surrounded by a 1px Frost Glass Border. On focus, the border transitions smoothly to Electric Violet to guide the user's eye.

## 5. Layout Principles
*   **Whitespace:** Extremely generous. Sections should breathe. Margins and padding should be large (e.g., `p-6` or `p-8` for standard cards, `gap-6` for internal flex layouts).
*   **Focus / Alignment:** Content should generally be center-aligned for single-purpose flows (like a prospecting form) to draw maximum attention to the primary action.
*   **Depth:** Rather than simple CSS shadows (`shadow-md`), depth is created by layering slightly lighter transparent colors over the pure black background and using blurry lighting effects behind crucial components.
