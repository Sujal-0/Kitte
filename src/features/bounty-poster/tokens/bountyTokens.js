/**
 * One Piece Wanted Bounty Poster Tokens & Layout Specifications
 * 100% Authentic to Eiichiro Oda's One Piece Manga & Anime Lore
 */

export const BOUNTY_POSTER_TOKENS = {
  // Proportions matching authentic Wanted Poster (approx 1:1.47 ratio)
  width: 408,
  height: 600,

  // Header "WANTED" (Libre Caslon Text, bold, vertically stretched, balanced gaps on all sides)
  header: {
    top: 18,
    fontSize: 64,
    scaleX: 0.93,
    scaleY: 1.54,
    letterSpacing: '0.12em',
  },

  // Photo Frame (Central portrait area, proportioned to anime reference)
  photoFrame: {
    x: 46,
    y: 110,
    w: 316,
    h: 238,
    borderWidth: 2.5,
  },

  // "DEAD OR ALIVE" Banner (Libre Caslon Text, bold, fits photo frame width 316px edge-to-edge)
  deadOrAlive: {
    top: 360,
    height: 26,
    fontSize: 22,
    letterSpacing: '0.24em',
    font: 'Libre Caslon Text',
  },

  // 4 S-like structure flourishes (Row 1: s_like_struc, Row 2: s_streched covering bottom left text)
  sFlourishes: {
    row1: {
      src: '/assets/s_like_struc.webp',
      w: 24,
      h: 48,
      leftX: 12,
      rightX: 12,
      topY: 348,
    },
    row2: {
      src: '/assets/s_streched.webp',
      w: 28,
      h: 180,
      leftX: 10,
      rightX: 10,
      topY: 398,
    },
  },

  // Pirate Name (OnePieceFont, bold, 80% size of header WANTED, never shrinks size, compresses horizontally)
  name: {
    top: 394,
    height: 64,
    fontSize: 51, // 80% of Header WANTED (64px * 0.8 = 51.2px)
    scaleY: 1.55,
    left: 46,
    width: 316,
    font: 'OnePieceFont',
  },

  // Bounty Berries Row (Fixed font size, never shrinks size, compresses horizontally)
  bounty: {
    top: 472,
    height: 38,
    left: 46,
    width: 316,
    berryIcon: { w: 22, h: 32 },
    fontSize: 28,
    font: 'adamHandwriting',
  },

  // Footer: World Gov disclaimer & MARINE (Lifted bottom by +8px to 30px, larger font, symmetric gaps from S structures)
  disclaimer: {
    left: 46, // Pushed rightward: 16px clean gap from left S-flourish asset (x=18 to x=30)
    bottom: 33, // Lifted up from bottom edge (+8px)
    width: 205, // Strictly bounded width to maintain guaranteed separate gap before MARINE
    fontSize: 5.6, // Increased font size for higher visibility
    lineHeight: 9.0, // Generous line spacing between lines
    letterSpacing: '0.035em', // Clean letter spacing for words/letters
    wordSpacing: '0.12em', // Word spacing
    lines: [
      'KONO SAKUHIN HA FICTION DETHUNODE JITSUZAISURU JINBUTSU DANTAI',
      'SONOTA NO SOSHIKI TO DOITSU NO MEISHOU GA GEKICHU NI TOUJYOU',
      'SHITATOSHITEMO JITSUZAI NA MONOTOHA ISSAI MUKANKEIDETH.',
    ],
  },
  marine: {
    right: 46, // Pushed leftward: exact same 16px clean gap from right S-flourish asset (ends at 30px from right)
    bottom: 33, // Lifted up to align with disclaimer (+8px)
    fontSize: 21,
    scaleX: 1.0,
    scaleY: 1.45,
    letterSpacing: '0.05em',
  },

  colors: {
    parchment: '#f2dfb8',
    parchmentDark: '#e3cba0',
    ink: '#1c1008',
  },
};

/**
 * Authentic Vellum Paper Micro-Grain Noise Texture Tile (50x50 seamless PNG)
 * Reference: AgnusDei Old Parchment v2.2 (data URL for instant rendering & 300 DPI export)
 */
export const VELLUM_GRAIN_TEXTURE = 
  'data:image/png;base64,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';

export const MAX_NAME_LENGTH = 32;
export const MAX_BOUNTY_DIGITS = 18;

/**
 * Sanitize Pirate Name input
 * Clamps to 32 characters max (best production level limit), uppercase, allows Japanese middle dot
 */
export function sanitizePirateName(val) {
  if (!val) return '';
  const cleaned = String(val).toUpperCase().replace(/[^A-Z0-9\s·.\-']/g, '');
  return cleaned.slice(0, MAX_NAME_LENGTH);
}

/**
 * Sizing & spacing for Pirate Name
 * 80% of Header WANTED text (51px), never shrinks in size, compresses horizontally to fit in one line.
 */
export function getNameStyle(_rawName = '') {
  return {
    fontSize: 51, // Exactly 80% of WANTED (64 * 0.8 = 51.2)
    letterSpacing: '0.06em',
    canvasSpacing: 3.2,
    scaleY: 1.55,
  };
}

/**
 * Sizing & spacing for Bounty Digits
 * Fixed font size (28px), never shrinks in size, compresses horizontally to fit in one line.
 */
export function getBountyStyle(_bountyText = '') {
  return {
    fontSize: 28, // Fixed size - never shrinks
    letterSpacing: '0.14em',
    canvasSpacing: 3.8,
  };
}

export const DEFAULT_BOUNTY_STATE = {
  name: 'MONKEY·D·LUFFY',
  bounty: '3,000,000,000',
  imageSrc: '/assets/luffyTravelID.webp',
  imageScale: 1.0,
  imageOffsetX: 0,
  imageOffsetY: 0,
  showPaperCreases: true,
};

/**
 * Format & Validate Bounty Input:
 * - If numbers: Clamped to maximum 18 digits, formatted with standard commas
 * - If alphabets/text (e.g. "UNKNOWN", "ONLY ALIVE"): Allowed up to 20 characters
 */
export function formatBountyInput(val) {
  if (!val) return '';
  const str = String(val);
  const hasLetters = /[A-Za-z]/.test(str);
  const digitsOnly = str.replace(/[^0-9]/g, '');

  if (!hasLetters && digitsOnly.length > 0) {
    // Numeric bounty: Clamp strictly to MAX 18 digits
    const clamped = digitsOnly.slice(0, MAX_BOUNTY_DIGITS);
    return clamped.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Alphabetic / text bounty (e.g. "DEAD ONLY", "ONLY ALIVE", "UNKNOWN")
  return str.toUpperCase().replace(/[^A-Z0-9\s\-',]/g, '').slice(0, 20);
}

// Backward compatible alias
export const formatBountyNumber = formatBountyInput;

/**
 * Format bounty for poster display:
 * - Numbers: Formatted with gaps after commas and trailing hyphen e.g. "3, 000, 000, 000-"
 * - Text/Alphabets: Formatted in uppercase without trailing hyphen e.g. "UNKNOWN"
 */
export function formatBountyNumberWithGaps(val) {
  if (!val) return '0-';
  const str = String(val).trim();
  const hasLetters = /[A-Za-z]/.test(str);

  if (!hasLetters) {
    const cleanDigits = str.replace(/[^0-9]/g, '');
    if (!cleanDigits) return '0-';
    const clamped = cleanDigits.slice(0, MAX_BOUNTY_DIGITS);
    const formatted = clamped.replace(/\B(?=(\d{3})+(?!\d))/g, ', ');
    return `${formatted}-`;
  }

  return str.toUpperCase();
}

