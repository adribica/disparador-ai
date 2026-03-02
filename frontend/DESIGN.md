# Design System: Apple-Inspired Minimalist Light Theme
**Project ID:** 18171248685377189422

## 1. Visual Theme & Atmosphere
The mood is "Premium, Clean, Minimalist, and High-End Corporate." It feels like stepping into an Apple Store or using a high-fidelity productivity tool created by Apple. We rely on a predominantly pure white and light gray background contrasted with sharp, deep black typography. Space should feel exceptionally airy and perfectly balanced. We avoid heavy gradients and instead use ultra-refined subtle shadows (soft dropshadows) to convey depth.

## 2. Color Palette & Roles
*   **Snow White (#FFFFFF):** The foundational background color. Used for the entire app canvas to create an infinite, crisp, clean feel.
*   **Jet Black (#1D1D1F):** Used for primary typography, icons, and hero messaging to ensure absolute legibility and a premium stance. Very slightly softer than #000000.
*   **Silver Cloud (#F5F5F7):** Used for secondary backgrounds, cards, and input fields to separate them slightly from the pure white background without being aggressive.
*   **Graphite Gray (#86868B):** Used for secondary text, metadata, and subtle UI elements.
*   **System Blue (#0066CC):** The primary brand/accent color. Used sparingly for primary calls-to-action (buttons), links, and active states to guide the eye flawlessly.
*   **Subtle Border (#E5E5EA):** Used for extremely light 1px borders to define structure where empty space isn't enough.

## 3. Typography Rules
*   **Primary Font:** San Francisco (SF Pro) or equivalent clean geometric neo-grotesque sans-serif (e.g., Inter/Roboto).
*   **Headings (H1/H2):** High font-weight (Bold/Semibold), tight letter-spacing (`tracking-tight`), rendered in Jet Black.
*   **Body & Utility:** Regular weight, comfortable line-height for perfect readability, rendered in Graphite Gray or Jet Black depending on importance.

## 4. Component Stylings
*   **Buttons:** Generously rounded corners (pill-shaped or `rounded-full`). Primary buttons should be System Blue with white text. No heavy shadows; rely on crisp contrast.
*   **Cards/Containers:** Crisp appearance. Background should be Snow White or Silver Cloud. Corners must be generously rounded (16px to 24px / `rounded-2xl`). Borders are usually omitted in favor of very soft, large-spread drop shadows (e.g., `box-shadow: 0 4px 24px rgba(0,0,0,0.04)`), or a simple 1px Subtle Border if flat.
*   **Inputs/Forms:** Clean fields with Silver Cloud backgrounds (`bg-[#F5F5F7]`). Minimal to no borders until focused, where a subtle System Blue ring appears.

## 5. Layout Principles
*   **Whitespace:** "Extensive negative space." Let the content breathe heavily. Margins and padding should be huge (e.g., `p-8` or `p-12` for standard cards).
*   **Focus / Alignment:** Content should be perfectly aligned, often center-aligned for hero sections and robustly left-aligned for data.
*   **Depth:** Depth is created by very soft, elevated shadows beneath white cards sitting on top of a very light gray canvas, mimicking physical layers of high-quality paper.
