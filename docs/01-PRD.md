# Product Requirements Document (PRD): Kitte (切手)

## 1. Project Overview & Vision
**Kitte (切手)** — the Japanese word for postage stamp — is a production-level, tactile web and mobile application. It acts as an interactive analog memory laboratory where users can design, manipulate, and generate physical-grade paper artifacts. 

The core philosophy blends **tactile neo-brutalism** with **manga-style hand-drawn aesthetics**. Instead of a standard digital UI, the interface is a physical-feeling crafter's desk featuring zero-gravity floating objects, wobbly edges, and hyper-detailed sketch styling.

---

## 2. Global UI/UX & Layout Architecture

### 2.1 The 3D Manga-Style Desk Environment
The main viewport breaks away from flat web design to simulate a physical workspace with a subtle 3D illusion:
*   **Top-Left Tilt:** The entire desk surface is subtly tilted from the top-left, creating an isometric or forced-perspective 3D illusion.
*   **Exposed Floor:** On the far left, the desk edge ends, exposing the "floor" below in a contrasting color/texture to reinforce the 3D depth.
*   **Hand-Drawn Detailing:** Every element, line, and border uses a sketchy, manga-style hand-drawn aesthetic (leveraging SVG displacement and Rough.js). No perfectly straight lines exist.
*   **Logo Placement:** The Kitte logo sits anchored in the top-left corner of the desk or floor area.

### 2.2 The 30/70 Spatial Split
The desk is divided into two distinct zones, physically separated by an interactive, hand-drawn **Ruler Object**:
*   **Left Zone (30% - The Taped Utilities):** Fixed, stationary items taped to the desk. Includes the "Crafter's Notes" (About), "Torn Receipt" (Legal), and a cracked, interactive Josh Kern-style smartphone for the contact form.
*   **Right Zone (70% - The Cutting Mat):** A self-healing cutting mat where the 5 main studio artifacts float in zero-gravity.

### 2.3 Micro-Interactions & Custom Cursors
*   **Large Custom Cursor:** A prominent, stylized custom cursor that reacts to hover states (expanding or morphing when hovering over interactive artifacts).
*   **Click Burst Animation:** Inspired by Josh Kern's portfolio, every click triggers a snappy, hand-drawn "starburst" (Walmart-style lines) micro-interaction at the pointer coordinates.
*   **Scroll-Float Parallax:** When scrolling (touchpad or mobile), the floating artifacts dynamically scatter into 3-4 different float variations across the screen, mimicking the interactive scroll from Josh Kern's site, before returning to their home slots when scrolling stops.

---

## 3. Core Features: The 5 Creative Studios

Each studio acts as a standalone mini-app accessible from the main cutting mat.

### 3.1 Memory Ticket Stub
*   **Concept:** A museum/cinema admission ticket.
*   **Features:** High-res photo upload, custom event typography, dynamic vector barcode generator, and an SVG mask to create perforated tear lines.

### 3.2 One Piece Anime Bounty Poster
*   **Concept:** A weathered, wood-block wanted poster.
*   **Features:** Interactive drag/pan/zoom for the uploaded portrait. A specialized image filter pipeline (Grayscale -> High-Pass Edge -> Sepia -> Halftone) to convert normal photos into anime sketches. Auto-formatting Berry (B) currency parser.

### 3.3 Analog Sketch Photo Booth
*   **Concept:** A vintage vertical photo strip.
*   **Features:** Live camera capture with a 3-second flash countdown or multi-image upload. Dynamic frame selection (2 to 4 frames). Filters include high-contrast B&W, 1970s warm color, and a 1-bit Floyd-Steinberg dither sketch.

### 3.4 Tyler CMIYGL Travel ID License
*   **Concept:** Mid-century pastel travel credential.
*   **Features:** Passport photo cropper, pastel color palette toggles, embossed stamps, and a fluid HTML5 Canvas signature pad for users to sign their ID.

### 3.5 FutureMe Time Capsule Letter
*   **Concept:** A sealed airmail letter written to your future self with scheduled cloud email delivery.
*   **Features:**
    *   **Tactile Workbench:** Toggle between archival paper letterhead and 3D wax-sealed foldable airmail envelope with interactive unsealing physics.
    *   **Scheduled Cloud Delivery:** Hybrid dispatch engine utilizing native Resend cloud scheduling ($\le$ 30 days) and Supabase PostgreSQL persistence (> 30 days to 10 years).
    *   **Daily Automated Dispatch:** Daily GitHub Actions cron worker (`daily-futureme-dispatcher.yml`) running at 00:00 UTC to automatically dispatch due letters with attachments.
    *   **Immediate Vault Confirmation:** Senders receive an archival certificate confirmation email upon scheduling.
    *   **Recipient Web Unsealing:** Interactive recipient share link with wax-seal pop animation, folding flap physics, and letter extraction.
    *   **Craft Keepsakes Asset Pack:** Generates 3 attached 300 DPI high-resolution PDFs (Letterhead, Origami Envelope net, and Stamps & Seals sheet).
    *   **Authentic Stationery Email Design:** Paper texture, micro-dots, triangular flap crease, tied silk ribbon bow, authentic Kitte postal cat stamp with wavy postmark cancellation lines, notebook ruled lines, and handwritten typography.

---

## 4. Technical & Export Requirements

### 4.1 Zero-Gravity Physics
*   Floating artifacts use continuous, non-synchronous Lissajous equations (`framer-motion`) to drift organically.
*   On hover, cards elevate, dynamic hard-shadows decouple and expand, and a side-info badge slides out.

### 4.2 High-DPI Real-World Print Engine
*   **Zero Telemetry / Local Processing:** Image manipulation happens securely in the browser via Canvas.
*   **Print Engine:** An offscreen rendering pipeline scales the 72 DPI web canvas up to **300 DPI** for physical printing.
*   **Export Options:** Lossless PNG and CMYK-ready PDF exports including optional 0.125" bleed margins and corner crop marks.

### 4.3 Mobile-First Conversion (Phase 5)
*   **Mobile Viewport:** The 30% side panel collapses into a bottom "Taped Craft Dock". The 70% cutting mat converts into a touch-friendly horizontal swipe deck.
*   **Capacitor Ready:** The architecture must support easy packaging via Capacitor for future native iOS/Android builds, hooking into native camera and haptic APIs.
