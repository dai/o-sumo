# Design System Strategy: The Ronin’s Edge
 
## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Dojo."** 
 
This system is an intentional collision between the ancient, ritualistic world of Sumo and a high-performance, cyberpunk future. We are moving away from the "standard portal" look to create a space that feels like a sacred digital arena. The aesthetic relies on the tension between **heavyweight traditionalism** (calligraphy, sharp angles, monumental scale) and **synthetic agility** (neon light-trails, glass interfaces, and monospaced data).
 
To break the "template" look, we employ **Kinetic Asymmetry**. Layouts should never feel perfectly mirrored. Large-scale calligraphy should bleed off the canvas behind modular, data-heavy monospaced cards, creating a sense of depth where history and the future overlap.
 
---
 
## 2. Colors & Surface Philosophy
The palette is rooted in the depth of a midnight sky, punctuated by the high-frequency energy of a neon metropolis.
 
*   **Primary (`#c1c6d9` / `#111319`):** Metallic Silver and Midnight Blue. These represent the "Dohyō" (the ring) and the gravity of the sport.
*   **Secondary & Tertiary (`#e6feff` / `#ecb1ff`):** Electric Teal and Neon Purple. Use these sparingly as "light-source" accents—representing the energy of the crowd and the digital broadcast.
 
### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for structural sectioning. Boundaries must be defined through **Background Shifts**. For example, a `surface-container-low` section should sit against a `surface` background to define its territory. We define space through mass, not outlines.
 
### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers:
1.  **Base Layer (`surface-dim` / `#111319`):** The foundation, often featuring a faint, large-scale *Seigaiha* (wave) pattern in a slightly lighter tint.
2.  **The Nested Mat (`surface-container` tiers):** Use `surface-container-low` for large content areas and `surface-container-high` for interactive modules.
3.  **The "Glass & Gradient" Rule:** Main CTAs or active wrestler profiles should use a linear gradient transitioning from `primary` to `primary-container`. This adds a "metallic" soul to the interface.
 
---
 
## 3. Typography: The Dual-Era Scale
The typography is a dialogue between two eras. We use **Noto Serif** (Calligraphic weight) for human, traditional elements and **Space Grotesk** (Monospaced feel) for technical, data-driven elements.
 
*   **Display & Headline (Noto Serif):** Used for wrestler names, tournament titles, and ritual headings. These should be set with generous tracking or tight, aggressive kerning depending on the context to mimic ink-brush strokes.
*   **Title & Body (Space Grotesk):** Used for statistics, rankings, and portal navigation. This provides the "futuristic" contrast, making the data feel like a high-tech telemetry feed.
*   **Labels (Space Grotesk):** All labels must be uppercase with `0.05em` letter spacing to emphasize the "monospaced" technical aesthetic.
 
---
 
## 4. Elevation & Depth
In this system, depth is "Atmospheric" rather than "Physical."
 
*   **The Layering Principle:** Stack `surface-container-lowest` cards on `surface-container-low` sections. The shift in hex code is enough to create a sense of "lift" without visual clutter.
*   **Ambient Shadows:** We avoid black shadows. If a card needs to float (e.g., a modal), use a wide, diffused shadow (40px-60px blur) using a low-opacity version of the `tertiary` (Purple) or `secondary` (Teal) color. This mimics the glow of a neon sign against a dark alley.
*   **The "Neon Border" Fallback:** While we forbid standard borders, **Neon Borders** are allowed for "active" states. This is an `outline-variant` or `secondary` token at 40% opacity with a 2px outer glow (drop-shadow) of the same color.
*   **Glassmorphism:** Apply `backdrop-blur: 12px` to `surface-container` elements. Use the *Asanoha* (hemp leaf) pattern as a masked background image at 5% opacity *inside* the glass container to create an etched-glass effect.
 
---
 
## 5. Components
 
### Buttons
*   **Primary:** Sharp 0px corners. Background is a gradient of `secondary` to `secondary-fixed-dim`. Text is `on-secondary` (dark teal) in Space Grotesk Bold.
*   **Secondary (Glass):** Semi-transparent background with a `secondary` ghost-border (20% opacity).
 
### Cards (The Modular Unit)
*   **Rule:** Forbid divider lines. Use vertical white space from our spacing scale or a shift to `surface-container-highest` for the card header.
*   **Pattern Integration:** Every card should feature a subtle Japanese pattern watermark in the bottom-right corner, appearing only on hover.
 
### Inputs & Selection
*   **Input Fields:** No bottom line. Use a `surface-container-highest` block with 0px roundedness. The cursor and focus state should be a neon `secondary` (Teal) flicker.
*   **Chips:** Use `tertiary-container` for status chips (e.g., "Live Match"). They should feel like glowing LED indicators.
 
### Additional Portal Components
*   **The Rank Ledger:** A vertical list of wrestlers where the background color subtly shifts from `surface-container-lowest` (at the bottom) to `surface-bright` (for the Yokozuna at the top).
*   **The "Spirit" Gauge:** A custom progress bar using a `secondary` (Teal) neon glow to represent a wrestler's win-streak momentum.
 
---
 
## 6. Do’s and Don’ts
 
### Do:
*   **Embrace 0px Radii:** Every element must have sharp, clinical corners. This reflects the "sharp edge" of a katana and the precision of the sport.
*   **Use Intentional Asymmetry:** If a dashboard has three columns, make one significantly wider or offset the vertical alignment.
*   **Layer Text over Patterns:** Allow the "traditional" serif display text to overlap with "futuristic" glass containers to create depth.
 
### Don’t:
*   **Don't use Rounded Corners:** No exceptions. Any radius above 0px breaks the "Ronin’s Edge" aesthetic.
*   **Don't use Grey Shadows:** Shadows must be tinted with the system’s neon accents to maintain the "Midnight" atmosphere.
*   **Don't Over-illuminate:** If everything is neon, nothing is. Use the neon accents only for critical data points, active states, or primary CTAs. Keep the majority of the UI in the "Midnight" spectrum.
 
---
 
**Director’s Final Note:** 
Junior designers often fear "empty" dark space. In this system, the dark space (`surface`) is your most powerful tool. It represents the silence before the match. Use the neon and the glass to pierce that silence only where the user's attention is required.