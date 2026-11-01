# Master Design System & System Architecture

## 1. Brand Identity & Themes
*   **Project Name:** Kitte (切手)
*   **Subtitle:** The Tactile Paper Laboratory
*   **Design Ethos:** Warm minimalism fused with tactile neo-brutalism. Uncoordinated paper fibers, weathered newsprint, crisp geometric cutting grids, physical washi tape, and zero-gravity physics.
*   **Visual Signatures:** No straight lines. Everything must have a wobbly, hand-drawn manga aesthetic. Hard offset shadows only (no blur).

## 2. Locked Color Palette
### Backgrounds
*   **Floor Surface:** `#DCD3C6` (Slightly darker tone to create depth)
*   **Desk Surface:** `#F5EFEB` (Warm Raw Birch Desk)
*   **Cutting Mat:** `#ECE5D8` (Warm Cream Studio Mat Grid)
*   **Mat Grid Lines:** `#D8D0BE` (Light Mat) / `#364B3E` (Dark Mat)

### Paper Stocks & Tapes
*   **Uncoated Cardstock:** `#FDFBF7` (Natural Cotton Off-White)
*   **Aged Newsprint:** `#F2ECE1` (Warm Wood-Pulp Manila)
*   **Thermal Receipt:** `#F7F5EE` (Crinkled Thin Ledger)
*   **Washi Tape Base:** `#E4D4B0` (Semi-translucent Kraft Gum)

### Inks & Accents
*   **Ink Black (Primary):** `#141414` (Dense Letterpress Carbon)
*   **Ink Carbon (Body):** `#2D2D2D` (Pencil Graphite)
*   **Correction Red:** `#FF4D4D` (Felt Marker Accent)
*   **Ballpoint Blue:** `#2D5DA1` (Blue Ballpoint Stamp Ink)
*   **Post-It Yellow:** `#FFF9C4` (Highlighter Manila Accent)

## 3. Typography Pairings
| Role | Primary Font Family | Fallback Stack |
| :--- | :--- | :--- |
| **Hero Editorial & Headlines** | `Instrument Serif` / `Fraunces` | `'Georgia', serif` |
| **Technical & Monospaced** | `JetBrains Mono` / `Space Mono` | `'Courier New', monospace` |
| **Interface & UI Controls** | `Clash Display` / `Plus Jakarta Sans` | `'Inter', sans-serif` |
| **Hand-Lettering & Markers** | `adamHandwriting` (Local woff2) | `cursive` |
| **Body Handwriting** | `Patrick Hand` (wght 400) | `cursive` |
| **Bounty Header Wood-Block** | `Rye` / `Sancreek` | `'Impact', serif` |

## 4. Styling Non-Negotiables
### Wobbly Borders
Rigid geometric borders are strictly prohibited. All containers, buttons, and badges must use irregular border radii.
*   **CSS Example:** `border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;`
*   *Implemented via Tailwind config extension as `rounded-wobbly`.*

### Hard Offset Shadows
Soft, blurred drop-shadows are rejected. Use solid offsets to produce a physical, cut-paper collage appearance.
*   **Standard Lift:** `box-shadow: 4px 4px 0px #2D2D2D;`
*   **Elevated Hover Lift:** `box-shadow: 8px 8px 0px #2D2D2D;`

### Textures & Filters
*   **Paper Textures:** SVG radial-gradients used to inject subtle dot patterns (like drafting paper) across the mat.
*   **Torn Edges:** `<feTurbulence>` and `<feDisplacementMap>` WebGL/SVG filters to render torn paper fibers around utility notes.

## 5. Layout Architecture: 3D Manga Desk
The layout consists of a Top-Down 2D layout skewed visually to simulate 3D.
1.  **Exposed Floor (Left):** Gives grounding to the desk layer. Logo placement.
2.  **The Desk (Top Layer):** Tilted slightly from top-left.
3.  **Taped Utilities (Left 30%):** Static, anchored by tape. Josh Kern style phone, About note, Legal receipt.
4.  **The Divider Ruler:** A hand-drawn measuring ruler acts as the literal visual separator between the 30% static zone and 70% active zone.
5.  **Cutting Mat (Right 70%):** Dynamic canvas with 5 zero-gravity floating studio objects.

## 6. Interaction & Motion Rules
*   **Custom Cursor:** A large, stylized cursor replacing the system default.
*   **Click Burst Micro-Interaction:** A snappy, 4-5 line "starburst" (Walmart logo style) SVG draws instantly at the `(x, y)` coordinate of any click event.
*   **Lissajous Float:** `framer-motion` applies `x: sin(t), y: cos(t)` math for smooth, non-repeating organic drift to the 5 studio items.
*   **Hover State Lift:** On hover, objects lift along the Z-axis (`translateY(-12px)`, `scale(1.05)`). Shadow expands (`10px 10px 0px #2D2D2D`).
*   **Scroll-Float Parallax (Josh Kern Style):** Scrolling via touchpad or touch gestures scatters the 5 studio artifacts into 3-4 pre-defined organic floating layout variations across the mat. Once scrolling stops, they gracefully reorganize and spring back into their primary anchors.

## 7. Tech Stack Overview
*   **Framework:** React 19 (Pure JavaScript `.jsx`, NO TypeScript)
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS v4 + Tailwind Merge + clsx
*   **Animation:** Framer Motion (Layout FLIPs, physics)
*   **Canvas & Graphics:** Rough.js (Manga lines), Fabric.js (Photo manipulation)
*   **Export Engine:** html-to-image, jspdf / pdf-lib
