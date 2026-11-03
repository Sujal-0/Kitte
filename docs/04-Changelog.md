# Kitte Changelog

## v0.1.0 - Desk Foundation & Physics Update

### Added
- **Interactive Desk Lines:** Built procedural wave lines rendering `KITTE` across the entire screen, with a tactile wood-grain wobble and reactive physics.
- **Left Zone Layout Completed:** Fully built `CrafterNotes.jsx`, `ContactPhone.jsx` (with cracked iOS glass texture), and `TornReceipt.jsx`.
- **KitteLogo Physics:** Converted the Logo into a raw PNG container driven completely by Framer Motion. Features include zero-gravity lissajous floating, corner tilt on hover, press-to-desk 4px translation with collapsing shadow, local click bursts underneath the image, and a procedural SVG Postal Cancellation Mark fading out on click release.
- **Washi Tape System:** Built a `WashiTape.jsx` utility overlay component for pinning left-zone elements.

### Changed / Optimized
- **Cursor Performance:** Rewrote `CustomCursor.jsx` to mutate the DOM `style.transform` directly, completely avoiding React state reconciliation and fixing a massive UI stutter/lag issue.
- **Desk Lines Performance:** Reduced point density and combined canvas stroke calls in `InteractiveDeskLines.jsx` yielding a 10x performance boost.
- **Desk Borders:** Adjusted `DeskWorkspace.jsx` to trace a normal 3px border along the desk edges, but an exaggerated 24px thick border exclusively on the tilted top-left cut for a deeper 3D illusion.
- **PostCSS:** Re-ordered `@import` directives in `index.css` to fix build warnings.

## v0.2.0 - Interactive Studio UI & Modals

### Added
- **Studio Modal Framework:** Built the unified `StudioModal.jsx` utilizing a Neo-Brutalist split layout (50/50) with staggered enter/exit framer-motion transitions.
- **DecayCard Physics:** Integrated a highly interactive `DecayCard.jsx` module using GSAP displacement map filtering (`<feTurbulence>`), allowing studio image assets to organically boil and distort on mouse movement. Corrected `preserveAspectRatio` to prevent asset clipping.
- **Vertical Desk Lines Background:** Created `VerticalDeskLines.jsx` to serve as a custom animated background texture for the left panel of the Studio Modal.
- **Squiggle Vision / Ink Scribble Filters:** Replaced heavy CSS animations with highly performant `<filter id="squiggle">` configurations. Applied this physical line boil to typography, arrows, and borders globally using the `.handwritten-text` class.
- **Hover Micro-Animations:** Added directional translation to the `dottedUpArrow.svg` inside the Neo-Brutalist "ENTER STUDIO" button.

### Fixed
- **AnimatePresence Exit Bug:** Diagnosed and injected proper `key` properties into the orchestrating `<AnimatePresence>` tags across **all four active modals** (Studio, Crafter Notes, Phone, Receipt). Exit transitions, scaling, and drop animations are now flawlessly triggering before DOM unmounting.

## v0.2.1 - Cinematic Transitions & State Persistence

### Added
- **Cinematic Studio Transition:** Implemented a full-screen "Shoji Bi-Parting Split" transition (`StudioPageTransition.jsx`) using `useAnimate` from Framer Motion. Features include warm parchment panels, opposing kinetic ink line wipe effects, and a bold center crest badge (`切手`).
- **Global Cursor & Physics:** Migrated `CustomCursor.jsx` and `ClickBurstEngine.jsx` to the top-level `App.jsx` to ensure cursor styles and click interactions persist seamlessly when transitioning from the Desk to the Studio workspaces.
- **URL & Local Persistence:** Created two robust, zero-dependency custom hooks to persist application state across manual browser reloads:
  - `useUrlState.js`: Bidirectionally syncs simple states (Desk vs Studio view, active modals) with the browser's URL History API (`window.location.search`).
  - `useSessionState.js`: Safely stringifies and persists complex objects (e.g., active studio data) into `sessionStorage`.

### Fixed
- **React StrictMode Animation Loop:** Resolved a critical bug where `useAnimate` froze or looped unexpectedly upon unmounting by replacing `useRef` with a local scope `isCancelled` closure token.
- **Transition UI Bleed:** Resolved an issue where underlying UI flashed through the transition by enforcing `opacity: 1` instantly upon mount and decoupling the `onComplete` callback from the parent render cycle.

## v0.3.0 - Creative Studios & Universal Print Architecture

### Added
- **Studio 1: Memory Ticket Stub:** Built admission ticket generator with live front/back preview, custom barcode renderer, SVG perforated ticket stub tear lines, stamp picker, and 300 DPI duplex print export.
- **Studio 3: Sketch Photo Booth:** Built 1-bit / retro vintage arcade photostrip studio with live WebRTC camera capture, flash countdown timer, 2-to-4 frame strip selection, and borderless 1:1 photostrip export.
- **Studio 4: CMIYGL Travel ID:** Built full physical-grade travel license studio. Supports CR80 Standard, Creative License, and This & That card templates with dual-sided 3D flipping, fluid HTML5 bezier signature pad, photo pan/zoom, and 2-page borderless PVC PDF export.
- **Modular Print Architecture (Approach B):** Refactored monolith exporter into domain packages (`core/print/`, `features/{studio}/export/`, `features/{studio}/tokens/`).
- **IndexedDB Persistence (`useIDBState.js`):** Implemented high-capacity browser persistence for studio drafts and large uploaded images, overcoming `sessionStorage` 5MB quota limitations.

## v0.4.0 - Anime Bounty Poster Studio & Export Polish

### Added
- **Studio 2: Anime Bounty Poster:**
  - Authentic One Piece Wanted Poster generator with accurate manga typography (`Libre Caslon Text`, `OnePieceFont`, `adamHandwriting`).
  - AgnusDei-inspired 4-layer vintage vellum parchment engine: seamless micro-grain noise tile, authentic multi-angle conic paper fold creases, horizontal/vertical quarter-fold creases, and deep edge inset tanning.
  - Interactive photo panning, zooming, and multiply blending.
  - Auto-compressing single-line pirate name and bounty currency engine (size never shrinks; space compresses seamlessly to fit 1 line).
  - Procedural S-filigree corner flourishes (`s_like_struc`, `s_streched`) and Marine dossier alignment.
- **Universal Export Lab Overhaul:**
  - Minimal, high-contrast print mode selection: **Exact Poster (Borderless / 300 DPI)** vs. **A4 Print Sheet (With Corner Cut Marks)**.
  - Eliminated redundant checkboxes and cluttered button subtext for a clean neo-brutalist export modal.
  - Pixel-perfect parity between canvas UI and downloadable PNG/PDF files with zero white margins and no unwanted border strokes.
- **Studio Keyboard Navigation:**
  - Added global `Enter ↵` and `Escape` keyboard shortcuts to studio reset confirmation modals across all studios.
  - Added `Enter` and `Escape` shortcuts to the central `StudioModal.jsx` for instant keyboard studio entry.
- **Cinematic Exit Transition Optimization:**
  - Resolved exit animation stutter by deferring React component unmounting until after the Japanese logo crest (`切手`) completes its reveal and exit wipe.
  - Replaced CPU spring calculations with GPU-accelerated `easeOutExpo` (`[0.16, 1, 0.3, 1]`) and `will-change` layer promotion, ensuring 60/120 FPS buttery smooth transitions.

## v0.5.0 - FutureMe Time Capsule Studio & Archival Craft Pipeline

### Added
- **Studio 5: FutureMe Time Capsule Studio:**
  - **Future Delivery Clock (FutureMe Flow):** Delivery presets (`6 Months`, `1 Year`, `3 Years`, `5 Years`, or Custom Date Picker) calculating future unlock target dates, paired with destination email and sender origin city.
  - **Dual-View Interactive Workbench:** Seamlessly toggle between **Stationery Letterhead** and **3D Folded Airmail Envelope** with cutting mat dimension tags (`W: 520px / 560px`, `H: 720px / 380px`, `300 DPI`).
  - **Showcase Parity with Travel ID Studio:** Identical floating `"Click to make your own"` banner (`bg-[#1A1A1A] text-[#F4F1EA] px-4 py-2 border-2 border-white -rotate-2 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]`) and click-to-customize workflow.
  - **Rich Tactile Crafter Typography:** Dynamic font switching between `adamHandwriting` (handwritten marker), `Courier New` (typewriter monospace), and `Libre Caslon Text` (classic archival serif).
  - **Paper & Envelope Themes:** Three curated stationery styles (Linen & Ribbon, Vintage Airmail, Tea Parchment) and three envelope palettes (Airmail Kraft, Blush Rose, Slate Postal) with diagonal chevron airmail borders.
  - **Decorative Assets & Envelope Flap Seals:** Full integration of newly added assets:
    - Silk Ribbon Bow (`/assets/ribbon.webp`)
    - Hand Drawn Heart doodle (`/assets/handDrawnHeart.webp`)
    - Zigzag Heart doodle (`/assets/zigzagHeart.webp`)
    - P.S. I Love You stamp (`/assets/psily.webp`)
    - Embossed Kitte Crest Wax Seal (`/kitteLogo.png`)
    - Classic postal stamps and stickers (`cat-stamp.webp`, `certified-stamp.webp`, `flower.webp`, `star-sticker.webp`).
  - **Interactive 3D Envelope:** Front view with postal stamp, wavy cancellation postmarks, typewriter recipient block, and prominent red `"DO NOT OPEN BEFORE [Date]"` rubber stamp. Back view with triangular flap fold and chosen wax seal or ribbon bow.
  - **Universal 300 DPI Print & Export Engine:**
    - Option 1: **Archival Letter (300 DPI Borderless)** — single-page high-resolution archival letterhead with zero outer white margin.
    - Option 2: **A4 Print Sheet (With Corner Cut Marks)** — centered on A4 with precision scissors trim marks.
    - Option 3: **Letter & Envelope Pack (Pro Duplex)** — 2-page PDF and separate Letterhead + Folded Envelope PNGs.
  - **Strict No-Emoji Design:** Exclusively uses SVGs and vector icons across all tabs, buttons, badges, and warning states.
  - **Universal Reset Confirmation Modal:** Keyboard shortcut listeners supporting `Enter ↵` to confirm and `Escape` to cancel.

## v0.6.0 - FutureMe Cloud Scheduling, Supabase Vault & Authentic Email Overhaul

### Added
- **Automated Cloud Email Scheduling (Resend API):**
  - Direct integration with Resend API for transactional and scheduled email delivery.
  - Native short-term scheduling ($\le$ 30 days) utilizing Resend's `scheduled_at` cloud infrastructure.
  - Automatic base64 PDF attachment encoding and transmission with each scheduled dispatch.
- **Supabase PostgreSQL Cloud Vault:**
  - Production database schema (`supabase_schema.sql`) for persistent archival of multi-year letters (> 30 days, 6 months, 1 year, 3 years, 5 years, 10 years).
  - Row Level Security (RLS) policies allowing secure client insertions and serverless updates.
  - Dual-layer database adapter (`dbAdapter.js`) with automatic cloud synchronization and local cache fallback.
- **Daily Automated Cron Dispatcher:**
  - Node.js dispatch sweep runner (`scripts/dispatch-due-letters.mjs`) querying due letters where `target_timestamp <= now()`.
  - GitHub Actions workflow (`.github/workflows/daily-futureme-dispatcher.yml`) running daily sweeps at 00:00 UTC.
- **Interactive Recipient Web Letter Page (`TimeLetterSharePage.jsx`):**
  - Live share URL generation (`?view=letter&letter=...`).
  - Interactive tactile wax-seal unsealing animation, folding flap opening, and letter sliding physics.
  - Full tilt parallax on mouse movement and pinch/wheel zoom controls on the cutting mat.
  - Automatic unseal token handling (`&src=email`) ensuring letters delivered to inboxes open without artificial lock states.
  - Minimal aesthetic: Clean header with only title and "Make Your Own ↗", zero debug banners, and no unwanted dimension markers.
- **Authentic Stationery Email Redesign (`futureMeEmailTemplate.js`):**
  - **Paper Envelope:** Recreated the physical Kitte envelope in HTML/CSS with warm cream paper, micro-dots grid, red perimeter border (`#B91C1C`), and triangular flap creases meeting at an authentic tied Silk Ribbon Bow knot (removed solid red center circle).
  - **Kitte Cat Postal Stamp:** Authentic perforated stamp with black cat silhouette, pink cheeks, music note, `KITTE` & `AIR` labels, and 3 wavy postmark cancellation lines with delivery date.
  - **Notebook Ruled Letterhead:** Parchment letterhead with dual-layer dot grid, 24px horizontal ruled notebook lines, red stitched dashed border, tied ribbon bow accent, and author signature accompanied by a crimson red heart doodle (`❤️`).
  - **Typography:** Imported Google Fonts (`Patrick Hand`, `Caveat`, `Courier Prime`, `Playfair Display`) with exact 24px line-height alignment to ruled notebook lines.
  - **Creator Social Footer:** Neo-brutalist buttons linking to Sujal Singh's Instagram, LinkedIn, and GitHub.
- **Minimal Post-Sending Confirmation Modal (`TimeLetterEmailModal.jsx`):**
  - Replaced technical developer debug boxes with an authentic wax-seal checkmark card.
  - Clean summary of recipient email, delivery date, one-click "Copy Secret Link" button, and "Back to Studio" primary action.

## v0.7.0 - Production Security, Legal Architecture & Industry Readiness

### Added
- **Zero Frontend Secrets (Production Architecture):**
  - Completely migrated all sensitive operations (email dispatching, vault queries) to serverless API functions (`/api/futureme/schedule`, `/api/futureme/dispatch-due`, `/api/contact`).
  - Purged all API keys, credentials, and Supabase service role keys from frontend client bundles.
- **Gmail SMTP (`nodemailer`) Production Email System:**
  - Integrated official `kitte.archive@gmail.com` with App Password authentication.
  - Allows instant dispatching of confirmation certificates and scheduled letters to any recipient email worldwide without domain-lock or sandbox restrictions.
  - Implemented automatic fallback to Resend API.
- **Archival Legal Modal (`LegalModal.jsx`):**
  - Designed with authentic Manila cardstock texture, Courier Prime monospaced typography, and neobrutalist stamp badges.
  - Dual tabs for **Privacy Policy** (Zero-tracker policy, local storage usage, Time Capsule vault lifecycle) and **Terms & Conditions** (user IP ownership, archival disclaimer).
  - Mobile-responsive swipe and tap interactions matching CrafterNotes design.
  - Direct deep-linking via `?view=privacy` and `?view=terms`.
- **Neobrutalist Cookie Consent Banner (`CookieConsentBanner.jsx`):**
  - Neobrutalist paper card featuring the custom `cookieSvg.svg` vector illustration and hand-drawn `X` close button.
  - Automatically restricted to the Desk Workspace, hiding upon entering any Studio or artifact modal.
  - Remembers user choice in `localStorage`.
- **Anti-Spam & Bot Defense:**
  - Integrated invisible honeypot trap inputs (`website_hp`) across all contact and scheduling forms.
  - Client-side and server-side submission velocity checks (< 900ms human delta) blocking automated scrapers.
- **Production Headers & Caching (`vercel.json`):**
  - Strict-Transport-Security (HSTS), X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, Referrer-Policy, and Permissions-Policy.
  - 1-year immutable caching (`max-age=31536000`) for all static assets.
- **SEO, Social Previews & Machine Discovery:**
  - Rich Open Graph & Twitter Cards with 1200x630px social preview (`/assets/kitte-og.png`).
  - Configured `robots.txt`, `sitemap.xml`, and `/llms.txt` for search engines and AI assistants.

## v0.8.0 - Japanese Craft Preloader, Entrance Transition & Favicon System

### Added
- **First-Visit Entrance Intro with Asset Preloading:**
  - Full-screen Japanese Shoji doors and rotating ink crest (`切手`) play exclusively on the user's first visit.
  - State persisted via `localStorage.getItem('kitte_first_visit_completed')` ensuring 0ms delay on subsequent reloads or return visits.
  - Integrated `assetPreloader.js` awaiting `document.fonts.ready` and all 11 critical desk graphics before opening doors, eliminating font flicker and layout shift.
  - Direct letter share links (`?view=letter`) bypass intro for instant viewing.
- **Dedicated Japanese Craft Loader (`CraftLoader.jsx`):**
  - Neobrutalist loader featuring rotating dashed stamp perforations, bold Japanese kanji (`印刷中`, `現像中`, `封印中`), and animated progress indicator.
  - Dynamic cycling status messages tailored to each scenario:
    - PDF Export: Archival craft sheet formatting, cutting guides, bleed calibration.
    - PNG Export: High-res graphics rendering, paper texture inking, halftone sharpening.
    - Time Vaulting: Time capsule sealing, 300 DPI PDF origami net attachments generation, cryptographic lock.
- **Complete Favicon & PWA System:**
  - Built automated Puppeteer icon generation script (`scripts/generate-favicons.mjs`) generating the full spec from `kitte_favicon.png`.
  - Multi-size outputs: `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` (180x180), `android-chrome-192x192.png`, and `android-chrome-512x512.png`.
  - Integrated `site.webmanifest` with `#FAF8F3` theme.
- **Web Letter Share Decoupling:**
  - Decoupled public shared letters from time capsule lock countdowns so recipients can read shared letters immediately as open digital keepsakes.


