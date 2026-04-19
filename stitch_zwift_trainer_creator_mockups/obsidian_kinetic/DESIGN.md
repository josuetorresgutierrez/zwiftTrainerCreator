# Obsidian Kinetic Design System

### 1. Overview & Creative North Star
**Creative North Star: The Industrial Precisionist**

Obsidian Kinetic is a design system forged in the aesthetic of elite performance telemetry and brutalist industrialism. It rejects the "softness" of modern SaaS interfaces in favor of raw, high-contrast utility. The system is defined by sharp 90-degree angles, aggressive typography, and a "HUD" (Heads-Up Display) philosophy. It breaks traditional grid templates through intentional asymmetry, such as heavy left-hand accent borders and mono-spaced technical metadata overlapping editorial-grade headlines.

### 2. Colors
The palette is rooted in a "Deep Space" neutral base, utilizing `#0e0e0e` for the core environment to ensure maximum focus on data.

- **The Primary Catalyst:** Vibrant Orange (`#FF915D`) is used sparingly but aggressively for high-priority actions, data highlights, and "active" states.
- **The "No-Line" Rule:** Sectioning is achieved through shifts in surface containers (e.g., `#131313` vs `#1a1919`) rather than 1px borders. Where boundaries are needed for structural intensity, use heavy 2px or 4px solid bars on one side only (typically top or left).
- **Surface Hierarchy:**
  - `surface`: The base canvas.
  - `surface_container_low`: Primary card background.
  - `surface_container_highest`: Active/Hover states and navigation active indicators.
- **The "Glass & Gradient" Rule:** Use high-contrast gradients (Primary to Primary-Dim) for hero buttons to simulate backlit hardware switches. Floating navigation should utilize a `backdrop-blur-md` with 50% opacity to maintain environmental awareness.

### 3. Typography
The system employs a dual-personality typeface strategy: **Space Grotesk** for high-impact, wide-tracked technical headers and **Inter** for precision body data.

- **Display & Headlines:** Utilize Space Grotesk in Weight 900 with `tracking-tighter` and `uppercase` styling.
- **Technical Labels:** Small caps/uppercase labels (10px - 12px) with `tracking-widest` (0.2em) for that "instrument panel" feel.
- **The Scale (Ground Truth):**
  - **Hero Header:** 3.75rem - 4.5rem (Editorial Impact)
  - **Sub-headers:** 1.5rem / 1.25rem
  - **Body Text:** 0.875rem
  - **Technical Meta:** 9px - 10px (Monospaced or High-tracking Inter)

### 4. Elevation & Depth
Elevation is not achieved through shadows, but through **Tonal Layering** and **Luminescent Accents**.

- **The Layering Principle:** Stacking happens in steps from `#0e0e0e` (Deepest) to `#262626` (Highest). 
- **Ambient Shadows:** Standard shadows are prohibited. In their place, use a "Glow" effect (`shadow-[0_0_8px_rgba(255,145,93,0.5)]`) exclusively for progress indicators and active sensors.
- **The "Ghost Border" Fallback:** If a divider is mandatory for accessibility, use `outline_variant` at 20% opacity.
- **Zero Roundedness:** All elements must maintain a `0px` border radius to reinforce the industrial, hardware-inspired aesthetic.

### 5. Components
- **Buttons:** Large, blocky, and gradient-filled. No rounded corners. Must include an icon (Arrow/Bolt) to signify kinetic energy.
- **KPI Cards:** Fixed heights (e.g., 48rem/192px). Should feature a "Status Bar" at the top (2px primary color for active, 2px zinc-700 for inactive).
- **Data Visualizations:** Low-fidelity, block-based bar charts. Avoid smooth curves; use stepped increments to represent digital resolution.
- **Sidebar:** High-contrast, vertically oriented with a 4px left-border active indicator. Use uppercase Space Grotesk for nav items.
- **Navigation Shells:** Use `zinc-900/50` with blur for top bars to ensure the content "bleeds" through the UI.

### 6. Do's and Don'ts
- **DO:** Use large amounts of negative space between major sections, but high density within data cards.
- **DO:** Use "Selection" colors that invert the primary palette (`bg-primary` text-on-primary).
- **DON'T:** Use rounded corners (Radius > 0). It breaks the precisionist theme.
- **DON'T:** Use subtle pastel colors. Every color must be intentional and high-chroma or neutral.
- **DO:** Use "Status Strings" (e.g., `STATUS: OPTIMAL // V 2.0.4`) as decorative but functional metadata in corners of containers.