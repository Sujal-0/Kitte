# Kitte (切手) — Tactile Analog Memory Laboratory

> **Kitte (切手)** — the Japanese word for postage stamp — is a tactile neo-brutalist web application designed for crafting physical-grade paper keepsakes, collectible cards, photostrips, wanted posters, and scheduled time-capsule letters.

Built with a manga-inspired hand-drawn aesthetic, wobbly ink edges, physical desk physics, and a headless **300 DPI print-ready export engine**.

---

## 🎨 Creative Studios

Kitte features 5 standalone creative studios accessible from the physical cutting mat:

### 1. 🎟️ Memory Ticket Stub Studio
* **Concept:** Vintage museum, concert, and cinema admission tickets.
* **Features:** Duplex (front & back) preview, custom event typography, dynamic barcode renderer, procedural SVG perforated tear lines, and 300 DPI duplex print export.

### 2. 🏴‍☠️ Anime Bounty Poster Studio
* **Concept:** Authentic One Piece vintage wanted posters.
* **Features:** 4-layer vintage vellum parchment texture engine, interactive photo pan & zoom, auto-compressing single-line typography, Berries currency formatter, procedural S-filigree corner flourishes, and 300 DPI borderless / A4 print sheets.

### 3. 📸 Analog Sketch Photo Booth Studio
* **Concept:** Vintage 1-bit vertical arcade photostrips.
* **Features:** Live camera capture with flash countdown timer or multi-image upload, 2 to 4 frame dynamic strip selection, retro dither and halftone sketch filters, and 300 DPI 1:1 photostrip export.

### 4. 🪪 Tyler CMIYGL Travel ID Studio
* **Concept:** Mid-century pastel travel licenses & credentials.
* **Features:** Passport photo cropper, CR80 Standard, Creative License, and This & That card templates, dual-sided 3D flipping, fluid HTML5 bezier signature pad, and borderless PVC PDF export.

### 5. ✉️ FutureMe Time Capsule Letter Studio
* **Concept:** Letters written to your future self with scheduled cloud email delivery.
* **Features:**
  * **Interactive Workbench:** Toggle between archival paper letterhead and 3D wax-sealed foldable airmail envelope with tactile unsealing physics.
  * **Short-Term Delivery ($\le$ 30 Days):** Automated cloud delivery via Resend's native scheduling (`scheduled_at`).
  * **Multi-Year Archival (> 30 Days to 10 Years):** Cloud database persistence via Supabase PostgreSQL, paired with daily automated cron dispatching.
  * **Instant Vault Confirmation:** Sender receives an archival certificate email confirming their letter is vaulted.
  * **Recipient Web Unsealing:** Interactive recipient share link with wax-seal pop animation, folding flap physics, and letter extraction.
  * **Craft Keepsakes Asset Pack:** Automatically generates 3 attached 300 DPI PDFs:
    1. `Archival_Letterhead_300DPI.pdf` (Archival paper letterhead)
    2. `Foldable_Envelope_CraftSheet.pdf` (2-page printable origami craft net)
    3. `Stamps_and_Wax_Seals_Sheet.pdf` (Stickers and seals sheet)
  * **Authentic Stationery Email Design:** Clean paper envelope with micro-dots, triangular flap crease, tied silk ribbon bow, authentic Kitte postal cat stamp with wavy postmark cancellation lines, notebook ruled lines, and handwritten typography.

---

## 🛠️ Architecture & Tech Stack

* **Framework:** React 19 + Vite (Fast HMR)
* **Styling & Neobrutalism:** Tailwind CSS v4, rough-edged SVG displacement filters, tactile shadows (`#1A1A1A`), custom wobbly borders.
* **Motion & Physics:** Framer Motion (Lissajous zero-gravity drift, 3D tilt, spring animations, Shoji bi-parting screen transitions).
* **Print Engine:** Headless Canvas pipeline scaling web views up to **300 DPI** via `jsPDF` for physical printing.
* **Audio:** Web Audio API sound effects (pops, snaps, clicks, and paper crinkles).
* **Email Engine:** Hybrid email dispatching — Gmail SMTP (`nodemailer`) via `kitte.archive@gmail.com` for unrestricted worldwide delivery, with Resend API fallback.
* **Database:** Supabase Cloud PostgreSQL with Row Level Security (RLS) for persistent multi-year letters.
* **Serverless Backend:** Vercel Serverless Functions (`/api/futureme/schedule`, `/api/futureme/dispatch-due`, `/api/contact`, `/api/cron/dispatch-due-letters`).
* **Automation:** Daily GitHub Actions workflow (`daily-futureme-dispatcher.yml`) and Vercel Cron (`vercel.json`) running daily sweeps.
* **Analytics:** Privacy-first `@vercel/analytics` (zero cookie tracking).

---

## 🔒 Production Security & Performance

* **Zero Frontend Secrets:** All API keys, SMTP credentials, and Supabase service role keys reside strictly in serverless environment variables. Client bundles are 100% clean.
* **Asset Preloading & Zero Layout Shift:** First-visit entrance transition (`StudioPageTransition`) preloads all fonts via `document.fonts.ready` and critical graphics before opening doors, caching the state in `localStorage`.
* **Contextual Craft Loaders (`CraftLoader.jsx`):** Animated Japanese kanji loaders (`印刷中`, `現像中`, `封印中`) with dynamic status updates during 300 DPI PDF generation, image development, and vaulting.
* **Spam & Bot Defense:** Invisible honeypot traps (`website_hp`) and timestamp velocity checks across all forms.
* **Compliance & Legal:** In-universe Privacy Policy and Terms of Service (`LegalModal.jsx`), Cookie Consent banner (`CookieConsentBanner.jsx`), and zero-telemetry policy.
* **Hardened Security Headers:** HSTS, X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, Referrer-Policy, and Permissions-Policy in `vercel.json`.
* **Complete Favicon & PWA Suite:** 16x16, 32x32, 180x180, 192x192, 512x512, ICO, and `site.webmanifest`.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* npm, pnpm, or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Sujal-0/Kitte.git
cd Kitte

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration
Create a `.env` file in the root directory (see `.env.example`):
```env
# Gmail SMTP for production email delivery (sends to any recipient, 0 restrictions)
GMAIL_USER=kitte.archive@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Resend API Key (optional fallback)
RESEND_API_KEY=re_your_resend_api_key

# Supabase Cloud Database (for multi-year time letters)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Database Setup
To activate multi-year persistence:
1. Create a free project at [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [`supabase_schema.sql`](./supabase_schema.sql).
4. Add your project URL and keys to `.env`.

---

## 🌐 Deploying to Vercel

1. **Push to GitHub:** Ensure your latest commits are pushed to your GitHub repository.
2. **Import into Vercel:**
   * Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   * Import your `Kitte` repository.
   * Framework Preset: **Vite** (auto-detected).
   * Root Directory: `./`
3. **Configure Environment Variables in Vercel:**
   Under **Project Settings > Environment Variables**, add:
   * `GMAIL_USER` = `kitte.archive@gmail.com`
   * `GMAIL_APP_PASSWORD` = `uphc xxij ojom xtqw` *(or your 16-character App Password)*
   * `RESEND_API_KEY` = *(your Resend key, optional)*
   * `SUPABASE_URL` = `https://your-project.supabase.co`
   * `SUPABASE_ANON_KEY` = `your_supabase_anon_key`
   * `SUPABASE_SERVICE_ROLE_KEY` = `your_supabase_service_role_key`
   * `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   * `VITE_SUPABASE_ANON_KEY` = `your_supabase_anon_key`
4. **Deploy:** Click **"Deploy"**. Vercel will build the frontend and configure the serverless API routes (`/api/*`) and cron job automatically.

---

## ⚙️ GitHub Actions Daily Dispatcher Setup

For automated daily dispatch of due time-capsule letters:
1. Navigate to your GitHub repository: **Settings > Secrets and variables > Actions**.
2. Under **Repository secrets**, click **New repository secret** and add:
   * `GMAIL_USER`
   * `GMAIL_APP_PASSWORD`
   * `RESEND_API_KEY` *(optional)*
   * `SUPABASE_URL`
   * `SUPABASE_SERVICE_ROLE_KEY`
3. The workflow in `.github/workflows/daily-futureme-dispatcher.yml` will automatically run every day at 00:00 UTC.

---

## 📦 Project Scripts

* `npm run dev`: Starts local Vite dev server with proxy middleware for email and cron routes.
* `npm run build`: Bundles production-optimized static assets in `dist/`.
* `npm run preview`: Previews the production build locally.
* `node scripts/dispatch-due-letters.mjs`: Manually triggers the due letters dispatcher sweep.

---

## 📄 License & Credits

Created with love by **Sujal Singh**:
* **Instagram:** [@\_sujal_singh01](https://www.instagram.com/_sujal_singh01/)
* **LinkedIn:** [sujalsingh01](https://www.linkedin.com/in/sujalsingh01)
* **GitHub:** [Sujal-0](https://github.com/Sujal-0)
