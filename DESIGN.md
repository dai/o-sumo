# Design System Document: The Sacred Interval (Ma)
 
## 1. Overview & Creative North Star: "The Digital Washi"
This design system is not merely a portal; it is a digital dojo. The Creative North Star is **"The Digital Washi"**—a philosophy that treats the screen as a tactile, organic medium. We move away from the rigid, boxed-in layouts of traditional web design toward a concept of *Ma* (negative space). 
 
By utilizing intentional asymmetry, extreme typographic contrast, and tonal layering, we create an experience that feels as much like an editorial art book as it does a functional tool. The goal is to evoke the weight of Sumo tradition and the lightness of Zen practice.
 
## 2. Colors: The Ink and Gold Palette
The palette is a disciplined triad of Ink, Paper, and Gold. We avoid the "default" digital feel by using nuanced off-whites and charcoal-infused blacks.
 
### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background provides all the definition required. This maintains the "Zen" fluidity of the layout.
 
### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—stacked sheets of fine paper. 
- **Base:** `surface` (#faf9f6) acts as our primary paper texture.
- **Elevation:** Use `surface-container-lowest` (#ffffff) for floating cards to create a "bleached" highlight effect.
- **Recession:** Use `surface-container-high` (#e9e8e5) for utility sidebars or recessed content areas.
 
### The "Glass & Gold" Rule
To add a premium edge, use Glassmorphism for floating navigation elements. Use a semi-transparent `surface` color with a `backdrop-filter: blur(20px)`. Main CTAs should utilize a subtle linear gradient from `secondary` (#735c00) to `secondary_container` (#fed65b) to simulate the way light hits gold leaf.
 
---
 
## 3. Typography: The Modern Mincho
The typographic system relies on the tension between the ceremonial `notoSerif` and the functional `plusJakartaSans`.
 
- **Display & Headlines (notoSerif):** These are your "brush strokes." Use `display-lg` (3.5rem) with generous letter-spacing to anchor pages. The serif reflects the elegance of Japanese calligraphy (Mincho style).
- **Body & Labels (plusJakartaSans):** This is your "modern architecture." The sans-serif provides a clean, neutral counter-balance to the expressive headings.
- **Hierarchy as Identity:** Use extreme scale—pairing a massive `display-md` headline with a tiny, all-caps `label-md` sub-header—to create an editorial, high-end look.
 
---
 
## 4. Elevation & Depth: Tonal Layering
Traditional shadows and borders are too "noisy" for a Zen aesthetic. Depth is achieved through light and layering.
 
- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural lift that mimics paper resting on a wooden table.
- **Ambient Shadows:** If a floating element (like a modal) is required, use a shadow with a 60px blur at 4% opacity, using the `on_surface` color as the tint. It should be felt, not seen.
- **The "Ghost Border" Fallback:** If accessibility requires a container edge, use the `outline_variant` (#d0c5af) at **15% opacity**. This creates a "watermark" effect rather than a hard line.
- **Glassmorphism:** Use semi-transparent surface tokens to allow the "Ink" of the background content to bleed through softly, ensuring the layout feels integrated.
 
---
 
## 5. Components
 
### Buttons: The Signature Mark
*   **Primary:** Solid `primary` (#5f5e5e) with `on_primary` (#ffffff) text. **0px border radius.** The sharp corners represent the precision of the ring.
*   **Secondary (The Gold Touch):** A text-only button using `secondary` (#735c00) with a 2px underline that expands on hover.
*   **Tertiary:** `outline_variant` ghost buttons with 0px radius.
 
### Cards & Lists: The Fragmented Grid
*   **Cards:** No borders. Use `surface-container-low` as a background. Instead of a grid of identical boxes, vary the vertical padding to create an asymmetrical, rhythmic flow.
*   **Lists:** **Forbid the use of divider lines.** Use vertical whitespace (32px or 48px) from the spacing scale to separate list items. Use a `surface-variant` hover state to provide interaction feedback.
 
### Input Fields: The Calligraphy Line
*   **Text Inputs:** A single bottom border using `outline` (#7f7663). No box enclosure. Labels use `label-md` and sit 8px above the line.
*   **Error State:** Use `error` (#ba1a1a) for the bottom line only, with a small error icon.
 
### Specialized Component: The "Dohyo" Data Visualization
*   For Sumo statistics, use circular "Dohyo" charts. These should use `secondary` (Gold) for the data line and `primary_container` for the background, emphasizing the circular geometry of the Sumo ring.
 
---
 
## 6. Do's and Don'ts
 
### Do:
*   **Do** embrace asymmetry. Center-aligning everything is the enemy of high-end design.
*   **Do** use "washi" textures (grainy noise overlays at 2-3% opacity) on large `surface` areas to add tactile depth.
*   **Do** prioritize the "Ma." If a screen feels crowded, remove an element rather than shrinking it.
 
### Don't:
*   **Don't** use rounded corners. Everything in this system is defined by the sharp, intentional cuts of a blade (0px radius).
*   **Don't** use pure black (#000000). Use `on_background` (#1a1c1a) to maintain a soft, "ink-on-paper" look.
*   **Don't** use standard shadows. If you can see the shadow clearly, it is too heavy. Decrease opacity.