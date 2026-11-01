/**
 * Time Letter & Time Capsule Feature Tokens
 * Constants, dimensions, themes, sticker assets, fonts, and default state.
 */

// Delivery preset calculation helper
export function calculateDeliveryDate(preset, customDate = '') {
  if (preset === 'custom' && customDate) {
    try {
      let d;
      if (typeof customDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(customDate)) {
        const [y, m, day] = customDate.split('-').map(Number);
        d = new Date(y, m - 1, day);
      } else {
        d = new Date(customDate);
      }
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
      }
    } catch (_) {}
  }

  const now = new Date();
  const target = new Date(now);

  switch (preset) {
    case '6-months':
      target.setMonth(now.getMonth() + 6);
      break;
    case '1-year':
      target.setFullYear(now.getFullYear() + 1);
      break;
    case '2-years':
      target.setFullYear(now.getFullYear() + 2);
      break;
    case '3-years':
      target.setFullYear(now.getFullYear() + 3);
      break;
    case '5-years':
      target.setFullYear(now.getFullYear() + 5);
      break;
    case '10-years':
      target.setFullYear(now.getFullYear() + 10);
      break;
    default:
      target.setFullYear(now.getFullYear() + 1);
  }

  return target.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
}

export function formatCurrentDate() {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
}

// Postal Stamps (Top-right of Envelope & Letterhead)
export const POSTAL_STAMPS = [
  { id: 'cat-stamp', name: 'Postal Cat', src: '/assets/cat-stamp.webp' },
  { id: 'cmiygl-stamp', name: 'CMIYGL Star', src: '/assets/cmiygl-stamp.webp' },
  { id: 'igor-stamp', name: 'IGOR Stamp', src: '/assets/igor-stamp.webp' },
  { id: 'jollyRoger-stamp', name: 'Jolly Roger', src: '/assets/jollyRoger-stamp.webp' },
  { id: 'nami-stamp', name: 'Nami Stamp', src: '/assets/nami-stamp.webp' },
  { id: 'certified-stamp', name: 'Certified Seal', src: '/assets/certified-stamp.webp' }
];

// Decorative Assets & Cute Accents
export const DECORATIVE_ACCENTS = [
  { id: 'ribbon', name: 'Silk Ribbon Bow', src: '/assets/ribbon.webp' },
  { id: 'handDrawnHeart', name: 'Hand Drawn Heart', src: '/assets/handDrawnHeart.webp' },
  { id: 'zigzagHeart', name: 'Zigzag Heart', src: '/assets/zigzagHeart.webp' },
  { id: 'psily', name: 'P.S. I Love You', src: '/assets/psily.webp' },
  { id: 'flower', name: 'Sakura Botanical', src: '/assets/flower.webp' },
  { id: 'star-sticker', name: 'Golden Foil Star', src: '/assets/star-sticker.webp' },
  { id: 'heart-doodle', name: 'Heart Doodle', src: '/assets/heart-doodle.webp' }
];

// Stationery Paper Themes (Clean, authentic real-world stationery)
export const PAPER_THEMES = [
  {
    id: 'linen-ribbon',
    name: 'Ivory Linen',
    bgColor: '#FFFDF9',
    lineColor: 'rgba(26, 26, 26, 0.08)',
    borderColor: '#E5E0D8'
  },
  {
    id: 'parchment-wax',
    name: 'Aged Parchment',
    bgColor: '#FAF5EA',
    lineColor: 'rgba(140, 90, 43, 0.12)',
    borderColor: '#DFD5C2'
  },
  {
    id: 'classic-white',
    name: 'Cotton White',
    bgColor: '#FFFFFF',
    lineColor: 'rgba(37, 99, 235, 0.08)',
    borderColor: '#E2E8F0'
  },
  {
    id: 'blush-stationery',
    name: 'Soft Blush',
    bgColor: '#FDF2F4',
    lineColor: 'rgba(219, 39, 119, 0.08)',
    borderColor: '#FBCFE8'
  },
  {
    id: 'sage-stationery',
    name: 'Sage Botanical',
    bgColor: '#F2F6F0',
    lineColor: 'rgba(21, 128, 61, 0.08)',
    borderColor: '#DCFCE7'
  },
  {
    id: 'sky-stationery',
    name: 'Sky Blue',
    bgColor: '#F0F4F8',
    lineColor: 'rgba(29, 78, 216, 0.08)',
    borderColor: '#DBEAFE'
  }
];

// Envelope Paper Color Themes
export const ENVELOPE_THEMES = [
  {
    id: 'linen-cream',
    name: 'Ivory Linen',
    bg: '#FBF8F1',
    innerBg: '#F3EEDB',
    accent: '#B91C1C'
  },
  {
    id: 'vintage-kraft',
    name: 'Vintage Kraft',
    bg: '#EBDCC9',
    innerBg: '#DFCEB7',
    accent: '#78350F'
  },
  {
    id: 'cotton-white',
    name: 'Pure Cotton',
    bg: '#FFFFFF',
    innerBg: '#F4F4F5',
    accent: '#B91C1C'
  },
  {
    id: 'blush-rose',
    name: 'Blush Rose',
    bg: '#FCE7F3',
    innerBg: '#FBCFE8',
    accent: '#DB2777'
  },
  {
    id: 'slate-postal',
    name: 'Slate Postal',
    bg: '#E2E8F0',
    innerBg: '#CBD5E1',
    accent: '#1E293B'
  },
  {
    id: 'sage-botanical',
    name: 'Sage Herb',
    bg: '#E3EADF',
    innerBg: '#D1DDD0',
    accent: '#15803D'
  }
];

// Envelope Border Style Variations (Organic Hand-Drawn & Artisan)
export const ENVELOPE_BORDER_STYLES = [
  { id: 'handdrawn-single', name: 'Hand-Drawn Line', desc: 'Organic dip-pen ink line' },
  { id: 'crimson-double-stitch', name: 'Crimson Double-Stitch', desc: 'Artisan double stitch border' },
  { id: 'airmail-vintage', name: 'Vintage Airmail', desc: 'Classic red & blue chevron border' },
  { id: 'clean-fine', name: 'Minimalist Mono', desc: 'Clean architectural mono line' },
  { id: 'stitched-dashed', name: 'Stitched Pencil', desc: 'Dashed artisan stitch line' },
  { id: 'none', name: 'No Border', desc: 'Raw textured paper' }
];

// Envelope Border Color Palette
export const ENVELOPE_BORDER_COLORS = [
  { id: 'crimson', name: 'Crimson Red', hex: '#B91C1C' },
  { id: 'terracotta', name: 'Terracotta', hex: '#C2410C' },
  { id: 'navy', name: 'Vintage Navy', hex: '#1D4ED8' },
  { id: 'walnut', name: 'Walnut Sepia', hex: '#78350F' },
  { id: 'forest', name: 'Forest Green', hex: '#15803D' },
  { id: 'rose', name: 'Dusty Rose', hex: '#DB2777' },
  { id: 'charcoal', name: 'Charcoal Ink', hex: '#262626' }
];

// Envelope Flap Outline Options
export const ENVELOPE_FLAP_STYLES = [
  { id: 'triangular', name: 'Pointed Flap', desc: 'V-flap meeting at center seal' },
  { id: 'curved', name: 'Soft Curved Flap', desc: 'Gentle arching flap line' },
  { id: 'none', name: 'Clean (No Flap)', desc: 'Smooth envelope face' }
];

// Envelope Slot Decoration Assets (Available for Top-Left, Center Seal, Bottom-Left, Bottom-Right)
export const ENVELOPE_DECORATION_OPTIONS = [
  { id: 'none', name: 'None / Empty', src: null },
  { id: 'ribbon', name: 'Silk Ribbon Bow', src: '/assets/ribbon.webp' },
  { id: 'handDrawnHeart', name: 'Hand Drawn Heart', src: '/assets/handDrawnHeart.webp' },
  { id: 'zigzagHeart', name: 'Zigzag Heart', src: '/assets/zigzagHeart.webp' },
  { id: 'psily', name: 'P.S. I Love You', src: '/assets/psily.webp' },
  { id: 'flower', name: 'Sakura Botanical', src: '/assets/flower.webp' },
  { id: 'star-sticker', name: 'Golden Foil Star', src: '/assets/star-sticker.webp' },
  { id: 'heart-doodle', name: 'Heart Doodle', src: '/assets/heart-doodle.webp' },
  { id: 'cat-stamp', name: 'Postal Cat Stamp', src: '/assets/cat-stamp.webp' },
  { id: 'cmiygl-stamp', name: 'CMIYGL Stamp', src: '/assets/cmiygl-stamp.webp' },
  { id: 'kitte-logo', name: 'Kitte Crest Emblem', src: '/kitteLogo.png' },
  { id: 'certified-stamp', name: 'Certified Seal', src: '/assets/certified-stamp.webp' }
];

// Requested Typography Options
export const LETTER_FONTS = [
  {
    id: 'caveat',
    name: 'Caveat',
    sub: 'Handwritten Script',
    fontClass: 'font-caveat',
    cssFont: '"Caveat", cursive'
  },
  {
    id: 'courierPrime',
    name: 'Courier Prime',
    sub: 'Vintage Typewriter',
    fontClass: 'font-courierPrime',
    cssFont: '"Courier Prime", "Courier New", monospace'
  },
  {
    id: 'specialElite',
    name: 'Special Elite',
    sub: 'Distressed Typewriter',
    fontClass: 'font-specialElite',
    cssFont: '"Special Elite", cursive, monospace'
  },
  {
    id: 'marker',
    name: 'Adam Handwriting',
    sub: 'Signature Marker',
    fontClass: 'font-marker',
    cssFont: '"adamHandwriting", cursive, sans-serif'
  },
  {
    id: 'times',
    name: 'Times New Roman',
    sub: 'Classic Serif',
    fontClass: 'font-times',
    cssFont: '"Times New Roman", "Libre Caslon Text", serif'
  }
];

// Delivery Presets
export const DELIVERY_PRESETS = [
  { id: '6-months', label: '6 Months' },
  { id: '1-year', label: '1 Year' },
  { id: '2-years', label: '2 Years' },
  { id: '3-years', label: '3 Years' },
  { id: '5-years', label: '5 Years' },
  { id: '10-years', label: '10 Years' },
  { id: 'custom', label: 'Custom' }
];

// Content Size & Line Constraints for Generous & Compact Letterhead Layout
export const MAX_LETTER_BODY_LINES = 13;
export const MAX_LETTER_BODY_CHARS = 1000;
export const LETTER_CHARS_PER_LINE = 68;

/**
 * Accurately estimates visual wrapped lines for letter body across stationery width (~68 chars per line).
 */
export function getLetterEstimatedLines(text, charsPerLine = LETTER_CHARS_PER_LINE) {
  if (!text) return 0;
  const paragraphs = String(text).split('\n');
  let totalLines = 0;
  for (const p of paragraphs) {
    if (p.trim() === '') {
      totalLines += 1;
      continue;
    }
    const words = p.split(/\s+/).filter(Boolean);
    let lineLen = 0;
    let pLines = 1;
    for (const w of words) {
      const added = lineLen === 0 ? w.length : w.length + 1;
      if (lineLen + added > charsPerLine && lineLen > 0) {
        pLines++;
        lineLen = w.length;
      } else {
        lineLen += added;
      }
    }
    totalLines += pLines;
  }
  return totalLines;
}

/**
 * Automatically cuts exceeded letter body to fit the compact Letter UI and canvas.
 * Preserves words and paragraph structure within the max line and character budget.
 */
export function cutLetterBodyToFit(text, maxLines = MAX_LETTER_BODY_LINES, maxChars = MAX_LETTER_BODY_CHARS, charsPerLine = LETTER_CHARS_PER_LINE) {
  if (!text) return '';
  let str = String(text);
  
  // 1. Cap raw characters
  if (str.length > maxChars) {
    str = str.slice(0, maxChars);
  }

  // If already within limits, return untouched (preserves spaces, typing state)
  if (getLetterEstimatedLines(str, charsPerLine) <= maxLines) {
    return str;
  }

  // 2. If it exceeds maxLines, trim paragraphs / lines from the end until it fits
  const paragraphs = str.split('\n');
  while (paragraphs.length > 0 && getLetterEstimatedLines(paragraphs.join('\n'), charsPerLine) > maxLines) {
    const lastIdx = paragraphs.length - 1;
    const lastP = paragraphs[lastIdx];
    
    // If the last paragraph is empty, just pop it
    if (!lastP || lastP.trim() === '') {
      paragraphs.pop();
      continue;
    }

    // Try trimming the last word from the last paragraph
    const words = lastP.split(' ');
    if (words.length > 1) {
      words.pop();
      paragraphs[lastIdx] = words.join(' ');
    } else {
      // If only one word remains in the paragraph, pop the paragraph
      paragraphs.pop();
    }
  }

  return paragraphs.join('\n');
}

// Default Showcase Time Letter State
export const DEFAULT_TIME_LETTER_STATE = {
  letterMode: 'future-self', // 'future-self' | 'someone-special'
  isOpen: false, // false = sealed envelope, true = open flap & letter pulled out
  activeSide: 'front', // 'front' = Envelope, 'back' = Letter
  recipient: 'Future Me',
  recipientEmail: 'future.me@kitte.studio',
  deliveryPreset: '1-year',
  customDate: '',
  sendDate: formatCurrentDate(),
  deliveryDate: calculateDeliveryDate('1-year'),
  location: 'KYOTO, JAPAN',
  salutation: 'Dear Future Me,',
  letterBody: 'I hope when you open this, the studio you dreamed of building is alive and thriving.\n\nRemember the quiet late nights, the joy of turning blank paper into tactile keepsakes, and the promise never to stop creating with your hands.\n\nDid we finish all the craft projects? Are you still smiling when a fresh print rolls off the press? Stay curious, stay gentle, and take care of the people you love.\n\nP.S. Keep making things that bring wonder to ordinary days.',
  signOff: 'With love & patience,',
  author: 'Past You',
  paperTheme: 'parchment-wax',
  fontStyle: 'caveat', // Default to authentic handwritten script
  
  // Letter Styling (Full separate customization)
  letterPaperTheme: 'parchment-wax',
  letterBorderStyle: 'handdrawn-single',
  letterBorderColor: '#B91C1C',
  letterBorderRadius: 8,
  letterStamp: 'cat-stamp',
  letterCenterSeal: 'ribbon',
  letterTopLeft: 'ribbon',
  letterBottomLeft: 'handDrawnHeart',
  letterBottomRight: null,

  // Envelope Styling (Full separate customization)
  envelopeTheme: 'linen-cream',
  envelopeBorderStyle: 'handdrawn-single', // Hand-drawn red pencil border
  envelopeBorderColor: '#B91C1C',
  envelopeBorderRadius: 16,
  envelopeFlapStyle: 'triangular', // Pointed flap line
  envelopeNoticeText: "Don't open before", // Clean handwritten notice
  envelopeStamp: 'cat-stamp', // Top-right stamp + cancellation
  envelopeTopLeft: null, // Top-left slot
  envelopeCenterSeal: 'ribbon', // Center seal (Ribbon Bow like reference 2!)
  envelopeBottomLeft: null, // Bottom-left slot
  envelopeBottomRight: null // Bottom-right slot
};

