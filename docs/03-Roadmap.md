# Implementation Roadmap

## Phase 1: Foundation & Scaffold (COMPLETED)
1. [x] Initialize Vite React project with pure JavaScript (`.jsx`).
2. [x] Install core dependencies (`framer-motion`, `roughjs`, `lucide-react`, `tailwind-merge`, `clsx`).
3. [x] Configure `tailwind.config.js` with the Kitte design tokens (wobbly radii, hard shadows, brand colors, custom font families).
4. [x] Set up the routing shell and global CSS (hiding default cursors for the custom cursor).

## Phase 2: Building the 3D Manga Desk (COMPLETED)
1. [x] Construct the **Floor & Desk Layers**: Implement the top-left tilt illusion and exposed floor grid. Added dual-thickness SVG border logic and isometric cuts.
2. [x] Build the **Custom Cursor & Click Burst Engine**: Implement global event listener for mouse movement and starburst clicks.
3. [x] Build the **30/70 Divider**: Create the hand-drawn Ruler SVG component that physically separates the layout.
4. [x] Construct the **Left Taped Zone (30%) Modals**:
   - [x] `CrafterNotes.jsx` ("About Kitte Studio" with scroll debouncing).
   - [x] `TornReceipt.jsx` ("Privacy Policy" with custom hand-drawn 'X' buttons).

## Phase 3: Zero-Gravity Physics & Cutting Mat (COMPLETED)
1. [x] Build `CuttingMat.jsx`: A procedural grid background using SVG for hand-drawn, imperfect lines and angles.
2. [x] Build `FloatingArtifact.jsx`: The wrapper component that applies Lissajous drift math and hover/press interactions using `framer-motion`.
3. [x] Placed 5 static placeholder cards for the studios.
4. [x] Optimized CPU/GPU lag by refactoring noise filters and physics arrays.

## Phase 4: Developing the 5 Creative Studios (100% COMPLETED)
1. [x] **Studio Modal Framework**: Built unified Neo-Brutalist / Sketch modal. Implemented 50/50 split, `decay-card` interactions, `handwritten-text` SVG line boil filters, wobbly highlighters, and staggered framer-motion exit/entry transitions. Keyboard navigation (`Enter` to enter, `Escape` to close).
2. [x] **Studio 1: Memory Ticket Stub**: Museum/cinema admission ticket with dual-sided preview, SVG perforated tear stubs, vector barcode generation, stamp overlays, and 300 DPI duplex print export.
3. [x] **Studio 2: Anime Bounty Poster**: Authentic One Piece Wanted Poster generator with AgnusDei multi-layered vintage parchment & vellum texture engine, photo panning/zoom, auto-compressing single-line typography, Berries currency formatter, and 300 DPI borderless / A4 print sheet exports.
4. [x] **Studio 3: Sketch Photo Booth**: Multi-frame vertical photostrip generator with camera capture/upload, vintage arcade filters, 1:1 scale layout, and 300 DPI borderless exports.
5. [x] **Studio 4: CMIYGL Travel ID**: Passport photo cropper, CR80/Creative/This&That templates, fluid HTML5 Canvas signature pad, dual-sided 3D preview, and auto-borderless PVC & dual PNG print exports.
6. [x] **Studio 5: FutureMe Time Capsule Letter**:
   - FutureMe digital delivery clock (6 Months, 1 Year, 3 Years, 5 Years, or Custom Date Picker) with destination email.
   - Dual-view interactive workbench: Stationery Letterhead ⇄ 3D Airmail Envelope with front/back flap flipping.
   - Rich tactile crafter aesthetics: Adam Handwriting, Typewriter Monospace, and Classic Caslon typography.
   - Cute decorative assets & seals: Silk Ribbon Bow (`/assets/ribbon.webp`), Hand Drawn Heart (`/assets/handDrawnHeart.webp`), Zigzag Heart (`/assets/zigzagHeart.webp`), P.S. I Love You (`/assets/psily.webp`), and Kitte Crest Wax Seal.
   - 300 DPI high-resolution export pipeline (Borderless Archival Letterhead, A4 Print Sheet with corner cut marks, and Letter & Envelope Dual Pack).

## Phase 5: 300 DPI Universal Print & Export Pipeline (COMPLETED)
1. [x] **Universal Print Engine**: Modular architecture (`src/core/print/`, `src/features/{domain}/export/`).
2. [x] **300 DPI DPI_SCALE (4x)**: Headless canvas scaling rendering crisp, physical-grade typography and textures.
3. [x] **Universal Export Overlay (Export Lab)**: Dual print modes (Borderless Exact Scale vs. A4 Print Sheets with corner trim marks).
4. [x] **High-Res Lossless Formats**: Auto-borderless single & duplex PDFs via `jsPDF` and ultra-crisp PNG outputs with zero white letterboxing.
5. [x] **Print & Craft Guide**: Interactive paper weight suggestions (GSM), finishing techniques, and printer settings.

## Phase 6: FutureMe Cloud Scheduling & Digital Delivery Architecture (COMPLETED)
1. [x] **Automated Cloud Scheduling Engine**:
   - Short-term ($\le$ 30 days) native scheduled delivery via Resend API `scheduled_at`.
   - Multi-year (> 30 days to 10 years) persistent cloud storage via Supabase PostgreSQL.
   - Immediate archival vault certificate emails sent to senders on scheduling.
2. [x] **Daily Automated Cron Dispatcher**:
   - Built `scripts/dispatch-due-letters.mjs` running daily sweeps.
   - Built GitHub Actions workflow `.github/workflows/daily-futureme-dispatcher.yml` running daily at 00:00 UTC.
3. [x] **Recipient Web Letter Experience (`TimeLetterSharePage.jsx`)**:
   - URL encoding/decoding (`?view=letter&letter=...`).
   - Interactive wax-seal pop sound and animation, folding flap opening, and letter sliding physics.
   - Clean minimal cutting mat without debug banners or dimension markers.
   - Auto-unseal token handling (`&src=email`) to unlock letters upon delivery.
4. [x] **Multi-Asset 300 DPI PDF Generation**:
   - Generated and attached 3 high-resolution A4 PDFs (`Archival_Letterhead_300DPI.pdf`, `Foldable_Envelope_CraftSheet.pdf`, `Stamps_and_Wax_Seals_Sheet.pdf`).
5. [x] **Authentic Stationery Email Design**:
   - Replaced generic elements with authentic Kitte paper envelope (micro-dots, triangular flap crease, tied silk ribbon bow knot, and Kitte cat postal stamp with wavy cancellation lines).
   - Letterhead with red dashed stitched border, notebook ruled lines, stationery dot grid, and handwritten typography.
   - Creator social links in footer (Instagram, LinkedIn, GitHub).

## Phase 7: Mobile Responsiveness, Legal Architecture & UI Polish (COMPLETED)
1. [x] **Crafter Legal & Compliance System (`LegalModal.jsx`)**:
   - Built unified archival paper modal with tab switcher between Privacy Policy and Terms & Conditions.
   - Exact CrafterNotes styling: Manila aged paper, Courier Prime typography, zero tape clutter, mobile-friendly touch gestures (swipe and tap).
   - Deep-linkable via direct URL parameters (`?view=privacy`, `?view=terms`) and accessible from Desk, CrafterNotes, and TornReceipt.
2. [x] **Neobrutalist Cookie Consent Banner (`CookieConsentBanner.jsx`)**:
   - Styled with paper card texture, subtle interactive lines, and authentic `cookieSvg.svg`.
   - Neo-brutalist buttons (`Got it!`, `Privacy Policy`) and hand-drawn close button `X`.
   - Context-aware display: strictly confined to Desk Workspace; automatically hides when entering any Studio or Modal.
3. [x] **Open Web & Share Link Decoupling**:
   - Removed time capsule locks and "DO NOT OPEN BEFORE" warnings from public web letters (`?view=letter&letter=...`).
   - Web letters open instantly upon sharing so recipients can read the letter freely as an open keepsake.

## Phase 8: Production & Industry Readiness (COMPLETED)
1. [x] **Zero Secrets on Frontend (Critical Security Architecture)**:
   - Completely offloaded all API keys (Resend, Gmail SMTP, Supabase Service Role) to serverless backend endpoints (`api/futureme/schedule.js`, `api/futureme/dispatch-due.js`, `api/contact.js`).
   - Client bundle is 100% clean of sensitive keys.
2. [x] **Gmail SMTP & Resend Hybrid Email Engine**:
   - Production Gmail SMTP (`nodemailer`) via `kitte.archive@gmail.com` with App Password authentication.
   - Sends to any recipient worldwide with 0 sandbox restrictions.
   - Graceful fallback to Resend API.
3. [x] **Spam & Abuse Protection**:
   - Honeypot form trap (`website_hp`) across contact forms and email modals.
   - Client-side and server-side submission velocity checks (< 900ms human delta).
   - Strict email regex and payload size validations.
4. [x] **Complete Multi-Size Favicon System & Web Manifest**:
   - Generated full suite of crisp browser and PWA icons (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`).
   - Integrated `site.webmanifest` with `#FAF8F3` theme and standalone display.
5. [x] **SEO, Open Graph, Twitter Cards & AI LLM Discovery**:
   - Complete `<meta>` tags in `index.html` for social previews (`kitte-og.png`).
   - `public/robots.txt`, `public/sitemap.xml`, and `public/llms.txt` for search engines and AI assistants.
6. [x] **Enterprise Security Headers & Immutable Caching (`vercel.json`)**:
   - HSTS (`Strict-Transport-Security`).
   - `X-Content-Type-Options: nosniff`.
   - `X-Frame-Options: SAMEORIGIN`.
   - `Referrer-Policy: strict-origin-when-cross-origin`.
   - `Permissions-Policy: camera=(self), microphone=(), geolocation=()`.
   - Long-term immutable caching for `/assets/*` (`max-age=31536000`).
7. [x] **One-Time Entrance Intro with Zero-Layout-Shift Asset Preloader**:
   - First-time visitors experience the bi-parting Japanese Shoji doors and center ink crest (`切手`).
   - Awaits `document.fonts.ready` and critical desk images via `assetPreloader.js`.
   - State persisted in `localStorage.getItem('kitte_first_visit_completed')` with 0ms delay on subsequent reloads.
   - Direct letter shares bypass intro.
8. [x] **Contextual Japanese Craft Loaders (`CraftLoader.jsx`)**:
   - Dedicated craft loader with rotating dashed stamp perforations and animated kanji (`印刷中`, `現像中`, `封印中`).
   - Dynamic contextual status messages for 300 DPI PDF generation, PNG image development, and time capsule vaulting.
9. [x] **Privacy-First Vercel Analytics**:
   - Embedded `@vercel/analytics` in root layout for real-time traffic monitoring without tracking cookies.

## Phase 9: Deployment & Launch
1. [x] Configure production Vercel project with serverless API rewrites and daily cron sweep.
2. [x] Configure GitHub Repository Secrets (`GMAIL_USER`, `GMAIL_APP_PASSWORD`, `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) for automated daily cron dispatches.
3. [x] Production build and verification complete. Ready for live Vercel deployment.
