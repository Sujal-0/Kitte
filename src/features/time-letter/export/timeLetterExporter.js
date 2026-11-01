/**
 * Time Letter & Time Capsule Universal 300 DPI Exporter
 * 
 * Supports:
 * 1. Borderless Archival Letterhead (300 DPI)
 * 2. DIY Foldable Airmail Envelope Craft Sheet (with cut lines ✂, score folds, and glue tabs)
 * 3. Pro Duplex Print (Envelope Front + Letterhead Back)
 */

import { DPI_SCALE, loadImage, wrapText, drawPaperGrain, mapFont } from '../../../core/print/canvasUtils';
import { drawCropMarks } from '../../../core/print/cropMarks';
import { 
  PAPER_THEMES, 
  ENVELOPE_THEMES, 
  ENVELOPE_BORDER_STYLES,
  ENVELOPE_BORDER_COLORS,
  ENVELOPE_FLAP_STYLES,
  ENVELOPE_DECORATION_OPTIONS,
  POSTAL_STAMPS, 
  DECORATIVE_ACCENTS, 
  LETTER_FONTS,
  MAX_LETTER_BODY_LINES,
  MAX_LETTER_BODY_CHARS,
  LETTER_CHARS_PER_LINE,
  cutLetterBodyToFit
} from '../tokens/timeLetterTokens';

/**
 * Resolve decoration asset by ID.
 */
function getDecorationAsset(id) {
  if (!id || id === 'none') return null;
  const dec = ENVELOPE_DECORATION_OPTIONS.find(d => d.id === id);
  if (dec && dec.src) return dec;
  const stamp = POSTAL_STAMPS.find(s => s.id === id);
  if (stamp) return stamp;
  const accent = DECORATIVE_ACCENTS.find(a => a.id === id);
  if (accent) return accent;
  return null;
}

/**
 * Draw a rounded rectangle path.
 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Procedural hand-drawn rounded rectangle fallback.
 * Simulates organic ink flow perturbations and dip-pen roughness.
 */
function drawProceduralWobblyBorder(ctx, x, y, w, h, r, color, style) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (style === 'clean-fine') {
    ctx.lineWidth = 1.6;
    roundRect(ctx, x, y, w, h, r);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (style === 'stitched-dashed') {
    ctx.lineWidth = 2.0;
    ctx.setLineDash([8, 6]);
    roundRect(ctx, x, y, w, h, r);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // 'handdrawn-single'
  ctx.lineWidth = 2.4;
  const segments = [];
  const step = 8;

  // Top edge (x + r to x + w - r)
  for (let px = x + r; px <= x + w - r; px += step) {
    const jitter = Math.sin(px * 0.12) * 1.1 + Math.sin(px * 0.31) * 0.6;
    segments.push({ x: px, y: y + jitter });
  }

  // Top-right corner
  for (let a = -Math.PI / 2; a <= 0; a += Math.PI / 8) {
    const cx = x + w - r;
    const cy = y + r;
    const rJitter = r + Math.sin(a * 3) * 0.8;
    segments.push({ x: cx + Math.cos(a) * rJitter, y: cy + Math.sin(a) * rJitter });
  }

  // Right edge (y + r to y + h - r)
  for (let py = y + r; py <= y + h - r; py += step) {
    const jitter = Math.sin(py * 0.14) * 1.1 + Math.sin(py * 0.28) * 0.6;
    segments.push({ x: x + w + jitter, y: py });
  }

  // Bottom-right corner
  for (let a = 0; a <= Math.PI / 2; a += Math.PI / 8) {
    const cx = x + w - r;
    const cy = y + h - r;
    const rJitter = r + Math.sin(a * 3) * 0.8;
    segments.push({ x: cx + Math.cos(a) * rJitter, y: cy + Math.sin(a) * rJitter });
  }

  // Bottom edge (x + w - r down to x + r)
  for (let px = x + w - r; px >= x + r; px -= step) {
    const jitter = Math.sin(px * 0.11) * 1.1 + Math.sin(px * 0.33) * 0.6;
    segments.push({ x: px, y: y + h + jitter });
  }

  // Bottom-left corner
  for (let a = Math.PI / 2; a <= Math.PI; a += Math.PI / 8) {
    const cx = x + r;
    const cy = y + h - r;
    const rJitter = r + Math.sin(a * 3) * 0.8;
    segments.push({ x: cx + Math.cos(a) * rJitter, y: cy + Math.sin(a) * rJitter });
  }

  // Left edge (y + h - r down to y + r)
  for (let py = y + h - r; py >= y + r; py -= step) {
    const jitter = Math.sin(py * 0.13) * 1.1 + Math.sin(py * 0.29) * 0.6;
    segments.push({ x: x + jitter, y: py });
  }

  // Top-left corner
  for (let a = Math.PI; a <= (3 * Math.PI) / 2; a += Math.PI / 8) {
    const cx = x + r;
    const cy = y + r;
    const rJitter = r + Math.sin(a * 3) * 0.8;
    segments.push({ x: cx + Math.cos(a) * rJitter, y: cy + Math.sin(a) * rJitter });
  }

  if (segments.length > 0) {
    ctx.beginPath();
    ctx.moveTo(segments[0].x, segments[0].y);
    for (let i = 1; i < segments.length; i++) {
      ctx.lineTo(segments[i].x, segments[i].y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw classic vintage international airmail border (alternating red & blue chevrons).
 */
function drawAirmailBorder(ctx, x, y, bw, bh, rx = 0) {
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x, y, bw, bh, rx);
  ctx.clip();

  const stripeW = 12;
  const ribbonThick = 8;
  const red = '#B91C1C';
  const blue = '#1D4ED8';

  function drawTrack(tx, ty, tw, th) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(tx, ty, tw, th);
    ctx.clip();
    const count = Math.ceil((tw + th) / stripeW) + 2;
    for (let i = -count; i <= count * 2; i++) {
      const sx = tx + i * stripeW;
      ctx.fillStyle = (Math.abs(i) % 2 === 0) ? red : blue;
      ctx.beginPath();
      ctx.moveTo(sx, ty);
      ctx.lineTo(sx + stripeW * 0.75, ty);
      ctx.lineTo(sx + stripeW * 0.75 - th, ty + th);
      ctx.lineTo(sx - th, ty + th);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // 4 perimeter strips
  drawTrack(x, y, bw, ribbonThick);
  drawTrack(x, y + bh - ribbonThick, bw, ribbonThick);
  drawTrack(x, y, ribbonThick, bh);
  drawTrack(x + bw - ribbonThick, y, ribbonThick, bh);

  // Inner border rule
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + ribbonThick, y + ribbonThick, bw - ribbonThick * 2, bh - ribbonThick * 2);

  ctx.restore();
}

/**
 * Draw professional hairline corner registration marks (circle with crosshair).
 */
function drawRegistrationMarks(ctx, x, y, r = 7) {
  ctx.save();
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.45)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - r - 4, y); ctx.lineTo(x + r + 4, y);
  ctx.moveTo(x, y - r - 4); ctx.lineTo(x, y + r + 4);
  ctx.stroke();
  ctx.restore();
}

/**
 * Renders the exact SVG hand-drawn wobbly filter as used in TimeLetterCard / TimeEnvelopeCard.
 */
async function drawHandDrawnSVGBorder(ctx, w, h, x, y, bw, bh, rx, borderColor, borderStyle, seed = 5) {
  if (borderStyle === 'none') return;

  // 1. Airmail Vintage (Classic alternating red & blue angled chevrons)
  if (borderStyle === 'airmail-vintage' || borderStyle === 'airmail') {
    drawAirmailBorder(ctx, x, y, bw, bh, rx);
    return;
  }

  // 2. Crimson Double-Stitch (Two concentric dashed stitch lines)
  if (borderStyle === 'crimson-double-stitch' || borderStyle === 'double-stitch') {
    ctx.save();
    ctx.strokeStyle = borderColor || '#B91C1C';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([6, 4]);
    ctx.lineCap = 'round';
    roundRect(ctx, x, y, bw, bh, rx);
    ctx.stroke();
    roundRect(ctx, x + 5, y + 5, bw - 10, bh - 10, Math.max(0, rx - 4));
    ctx.stroke();
    ctx.restore();
    return;
  }

  // 3. Stitched Dashed
  if (borderStyle === 'stitched-dashed') {
    ctx.save();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2.0;
    ctx.setLineDash([8, 6]);
    ctx.lineCap = 'round';
    roundRect(ctx, x, y, bw, bh, rx);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // 4. Clean Fine / Minimalist Mono
  if (borderStyle === 'clean-fine' || borderStyle === 'minimalist-mono') {
    ctx.save();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.6;
    roundRect(ctx, x, y, bw, bh, rx);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // 5. Default: Organic Hand-Drawn Single Line (with SVG turbulence filter)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <filter id="handdrawn-filter" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" result="noise" seed="${seed}" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
    <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="${rx}" ry="${rx}" fill="none" stroke="${borderColor}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" filter="url(#handdrawn-filter)" />
  </svg>`;

  try {
    const img = await loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    ctx.drawImage(img, 0, 0, w, h);
  } catch (_) {
    drawProceduralWobblyBorder(ctx, x, y, bw, bh, rx, borderColor, borderStyle);
  }
}

/**
 * Draw hand-drawn organic perimeter border (Matching Reference 2 & 3).
 */
async function drawHandDrawnBorder(ctx, style, color, w, h, radius = 16) {
  if (style === 'none') return;

  const inset = 6;
  const bw = w - inset * 2;
  const bh = h - inset * 2;

  await drawHandDrawnSVGBorder(ctx, w, h, inset, inset, bw, bh, radius, color, style, 4);
}

/**
 * Draw hand-drawn envelope flap contour meeting at center seal.
 */
async function drawFlapContour(ctx, flapStyle, color, w, h, radius = 16) {
  if (flapStyle === 'none') return;

  const startY = 6 + (radius > 0 ? radius : 0);
  const pathD = flapStyle === 'curved' 
    ? `M 6 ${startY} Q ${w / 2} 205 ${w - 6} ${startY}`
    : `M 6 ${startY} L ${w / 2} 185 L ${w - 6} ${startY}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <filter id="flap-handdrawn" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" result="noise" seed="4" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
    <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" filter="url(#flap-handdrawn)" />
  </svg>`;

  try {
    const img = await loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    ctx.drawImage(img, 0, 0, w, h);
  } catch (_) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (flapStyle === 'curved') {
      ctx.moveTo(6, startY);
      ctx.quadraticCurveTo(w / 2, 205, w - 6, startY);
    } else {
      ctx.moveTo(6, startY);
      ctx.lineTo(w / 2, 185);
      ctx.lineTo(w - 6, startY);
    }
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Draw subtle corner crop/cut marks on envelope.
 */
function drawEnvelopeCornerCutMarks(ctx, x, y, w, h, len = 14) {
  ctx.save();
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.4)';
  ctx.lineWidth = 1.2;

  // Top-Left
  ctx.beginPath();
  ctx.moveTo(x - len, y); ctx.lineTo(x - 4, y);
  ctx.moveTo(x, y - len); ctx.lineTo(x, y - 4);

  // Top-Right
  ctx.moveTo(x + w + 4, y); ctx.lineTo(x + w + len, y);
  ctx.moveTo(x + w, y - len); ctx.lineTo(x + w, y - 4);

  // Bottom-Left
  ctx.moveTo(x - len, y + h); ctx.lineTo(x - 4, y + h);
  ctx.moveTo(x, y + h + 4); ctx.lineTo(x, y + h + len);

  // Bottom-Right
  ctx.moveTo(x + w + 4, y + h); ctx.lineTo(x + w + len, y + h);
  ctx.moveTo(x + w, y + h + 4); ctx.lineTo(x + w, y + h + len);
  ctx.stroke();

  // Subtle scissors icon at top-left
  ctx.font = '10px monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.35)';
  ctx.fillText('✂', x - len, y - 6);

  ctx.restore();
}

/**
 * Render the high-resolution letterhead canvas (550x432 base units at 300 DPI).
 * 100% Pixel-Perfect Match with TimeLetterCard UI:
 * - Exact paper background color from selected theme
 * - Authentic 28px ruled writing lines with 80% opacity
 * - Subtle 8px dot-grid paper grain overlay
 * - Hand-drawn wobbly dip-pen perimeter border with custom radius
 * - Silk ribbon bow / seal on top-left + "A LETTER TO MY FUTURE SELF"
 * - Authentic postage stamp + postmark cancellation wavy lines on top-right
 * - Salutation, multiline body aligned to ruled lines, sign-off, author, and hand-drawn heart!
 */
export async function renderLetterheadCanvas(state) {
  const w = 550;
  const h = 432;
  const scale = DPI_SCALE;

  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.scale(scale, scale);

  const paperThemeId = state?.letterPaperTheme || state?.paperTheme;
  const currentTheme = PAPER_THEMES.find(t => t.id === paperThemeId || t.bgColor === paperThemeId) || PAPER_THEMES[0];
  const fontMeta = LETTER_FONTS.find(f => f.id === state?.fontStyle) || LETTER_FONTS[0];
  const fontFam = mapFont(state?.fontStyle || 'caveat');

  const borderColor = state?.letterBorderColor || '#B91C1C';
  const borderStyle = state?.letterBorderStyle || 'handdrawn-single';
  const letterRadius = state?.letterBorderRadius !== undefined ? Number(state?.letterBorderRadius) : 8;
  const innerRadius = Math.max(0, letterRadius - 2);

  const letterStampId = state?.letterStamp !== undefined ? state?.letterStamp : 'cat-stamp';
  const activeStamp = (letterStampId && letterStampId !== 'none') ? POSTAL_STAMPS.find(s => s.id === letterStampId) : null;

  const letterSealAsset = getDecorationAsset(state?.letterCenterSeal || state?.letterTopLeft || 'ribbon');
  const letterBottomAsset = getDecorationAsset(state?.letterBottomLeft || 'handDrawnHeart');
  const letterBottomRightAsset = getDecorationAsset(state?.letterBottomRight);

  // 1. Base Paper Background (Silhouette matches TimeLetterCard borderRadius)
  if (letterRadius > 0) {
    roundRect(ctx, 0, 0, w, h, letterRadius);
    ctx.clip();
  }
  ctx.fillStyle = currentTheme.bgColor;
  ctx.fillRect(0, 0, w, h);

  // 2. Ruled writing lines (Matching TimeLetterCard: repeating every 21px from y=73, spanning full card behind footer)
  ctx.save();
  ctx.strokeStyle = currentTheme.lineColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.8;
  for (let ly = 73; ly <= 416; ly += 21) {
    ctx.beginPath();
    ctx.moveTo(8, ly);
    ctx.lineTo(w - 8, ly);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Authentic Paper Grain & Stipple Overlay (Matching TimeLetterCard: 8px grid radial dots + organic fibers)
  ctx.save();
  ctx.fillStyle = 'rgba(26, 26, 26, 0.05)';
  for (let gx = 4; gx < w; gx += 8) {
    for (let gy = 4; gy < h; gy += 8) {
      ctx.beginPath();
      ctx.arc(gx, gy, 0.75, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  drawPaperGrain(ctx, w, h);
  ctx.restore();

  // 4. Perimeter Border (Exact SVG filter handdrawn-single, stitched-dashed, or clean-fine)
  if (borderStyle !== 'none') {
    await drawHandDrawnSVGBorder(ctx, w, h, 8, 8, 534, 416, innerRadius, borderColor, borderStyle, 5);
  }

  // 5. Header: Separator Line + Seal/Ribbon + Title + Date/Location + Postage Stamp + Postmark Waves
  // Top Header Divider Line (at y = 50 matching UI)
  ctx.save();
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, 50);
  ctx.lineTo(w - 24, 50);
  ctx.stroke();
  ctx.restore();

  // Top-Left Seal Asset (Silk Ribbon Bow)
  let headerTitleX = 24;
  if (letterSealAsset && letterSealAsset.src) {
    try {
      const sealImg = await loadImage(letterSealAsset.src);
      ctx.save();
      ctx.translate(24 + 18, 14 + 14);
      ctx.rotate((-6 * Math.PI) / 180);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 1;
      const aspect = sealImg.height / sealImg.width || 0.8;
      const sealW = 34;
      const sealH = sealW * aspect;
      ctx.drawImage(sealImg, -sealW / 2, -sealH / 2, sealW, sealH);
      ctx.restore();
      headerTitleX = 24 + 34 + 8; // ~66px
    } catch (_) {}
  }

  // Header Title: "A LETTER TO MY FUTURE SELF" or "A SPECIAL LETTER"
  ctx.save();
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.5)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const headerTitle = state?.letterMode === 'someone-special' ? 'A SPECIAL LETTER' : 'A LETTER TO MY FUTURE SELF';
  ctx.fillText(headerTitle, headerTitleX, 32);
  ctx.restore();

  // Top-Right Stamp + Postmark Waves
  let dateRightX = w - 24;
  if (activeStamp && activeStamp.src) {
    try {
      const stampImg = await loadImage(activeStamp.src);
      const stampX = 468;
      const stampY = 8;
      const stampW = 32;
      const stampH = 38;

      ctx.save();
      ctx.translate(stampX + stampW / 2, stampY + stampH / 2);
      ctx.rotate((2 * Math.PI) / 180);

      // White stamp card background
      ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-stampW / 2, -stampH / 2, stampW, stampH);
      ctx.shadowColor = 'transparent';

      // Stamp dashed outline
      ctx.strokeStyle = '#1A1A1A';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(-stampW / 2, -stampH / 2, stampW, stampH);
      ctx.setLineDash([]);

      // Stamp picture
      ctx.drawImage(stampImg, -stampW / 2 + 2, -stampH / 2 + 2, stampW - 4, 26);

      // "KITTE" in borderColor at bottom of stamp
      ctx.font = 'bold 6px "JetBrains Mono", monospace';
      ctx.fillStyle = borderColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('KITTE', 0, stampH / 2 - 4);

      ctx.restore();

      // Postmark cancellation wavy lines (-rotate-6, -ml-1)
      ctx.save();
      ctx.translate(stampX + stampW + 1, stampY + 18);
      ctx.rotate((-6 * Math.PI) / 180);
      ctx.strokeStyle = 'rgba(26, 26, 26, 0.7)';
      ctx.lineWidth = 1;

      // 3 waves
      for (let wi = 0; wi < 3; wi++) {
        const wy = wi * 4;
        ctx.beginPath();
        ctx.moveTo(0, wy + 2);
        ctx.quadraticCurveTo(4, wy, 8, wy + 2);
        ctx.quadraticCurveTo(12, wy + 4, 16, wy + 2);
        ctx.quadraticCurveTo(20, wy, 24, wy + 2);
        ctx.stroke();
      }
      ctx.restore();

      dateRightX = stampX - 8;
    } catch (_) {}
  }

  // Date and optional location next to stamp
  ctx.save();
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  if (state?.location) {
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(26, 26, 26, 0.5)';
    const locText = `• ${state.location}`;
    ctx.fillText(locText, dateRightX, 32);
    const locW = ctx.measureText(locText).width;

    ctx.font = `bold 12px ${fontFam}`;
    ctx.fillStyle = 'rgba(26, 26, 26, 0.8)';
    ctx.fillText(state.sendDate || 'OCT 26, 2026', dateRightX - locW - 6, 32);
  } else {
    ctx.font = `bold 12px ${fontFam}`;
    ctx.fillStyle = 'rgba(26, 26, 26, 0.8)';
    ctx.fillText(state?.sendDate || 'OCT 26, 2026', dateRightX, 32);
  }
  ctx.restore();

  const maxLines = (state?.salutation && state.salutation.trim()) 
    ? MAX_LETTER_BODY_LINES 
    : MAX_LETTER_BODY_LINES + 1;

  // 6. Salutation (baseline aligns on first ruled line slot at y=71)
  let currentY = 71;
  if (state?.salutation) {
    ctx.save();
    ctx.font = `bold 20px ${fontFam}`;
    ctx.fillStyle = '#1A1A1A';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(state.salutation, 24, currentY);
    ctx.restore();
    currentY = 92;
  }

  // 7. Letter Body (Wrapped cleanly on 21px ruled line slots, strictly max maxLines lines)
  const effectiveBody = cutLetterBodyToFit(state?.letterBody || '', maxLines, MAX_LETTER_BODY_CHARS, LETTER_CHARS_PER_LINE);
  if (effectiveBody) {
    ctx.save();
    ctx.font = `14px ${fontFam}`;
    ctx.fillStyle = '#1A1A1A';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    const maxBodyW = w - 48; // 502px
    const paragraphs = String(effectiveBody).split('\n');
    let lineCount = 0;

    for (const paragraph of paragraphs) {
      if (lineCount >= maxLines) break;
      if (paragraph.trim() === '') {
        currentY += 21;
        lineCount++;
        continue;
      }

      const words = paragraph.split(' ');
      let currentLine = '';

      for (let n = 0; n < words.length; n++) {
        if (lineCount >= maxLines) break;
        const testLine = currentLine ? `${currentLine} ${words[n]}` : words[n];
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxBodyW && currentLine) {
          ctx.fillText(currentLine, 24, currentY);
          currentLine = words[n];
          currentY += 21;
          lineCount++;
        } else if (ctx.measureText(words[n]).width > maxBodyW) {
          // Break overly long words character by character
          let sub = '';
          for (let i = 0; i < words[n].length; i++) {
            if (lineCount >= maxLines) break;
            if (ctx.measureText(currentLine + sub + words[n][i]).width > maxBodyW) {
              ctx.fillText(currentLine + sub, 24, currentY);
              currentLine = '';
              sub = words[n][i];
              currentY += 21;
              lineCount++;
            } else {
              sub += words[n][i];
            }
          }
          currentLine = sub;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine && lineCount < maxLines) {
        ctx.fillText(currentLine, 24, currentY);
        currentY += 21;
        lineCount++;
      }
    }
    ctx.restore();
  }

  // 8. Footer: Divider line + Sign-off + Author Signature + Heart Icon + Bottom Right Accent
  // Footer divider line (at y = 372 matching TimeLetterCard)
  ctx.save();
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, 372);
  ctx.lineTo(w - 24, 372);
  ctx.stroke();
  ctx.restore();

  // Sign-off (baseline at y = 390)
  if (state?.signOff) {
    ctx.save();
    ctx.font = `italic 12px ${fontFam}`;
    ctx.fillStyle = 'rgba(26, 26, 26, 0.7)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(state.signOff, 24, 390);
    ctx.restore();
  }

  // Author Signature (baseline at y = 412)
  let authorWidth = 0;
  if (state?.author) {
    ctx.save();
    ctx.font = `bold 18px ${fontFam}`;
    ctx.fillStyle = '#1A1A1A';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(state.author, 24, 412);
    authorWidth = ctx.measureText(state.author).width;
    ctx.restore();
  }

  // Hand Drawn Heart Icon right next to author name (centered at y = 405)
  if (letterBottomAsset && letterBottomAsset.src) {
    try {
      const heartImg = await loadImage(letterBottomAsset.src);
      const hx = 24 + authorWidth + 8;
      const hy = 405;
      ctx.save();
      ctx.translate(hx + 9, hy);
      ctx.rotate((-6 * Math.PI) / 180);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetY = 1;
      ctx.drawImage(heartImg, -9, -9, 18, 18);
      ctx.restore();
    } catch (_) {}
  }

  // Bottom Right Accent
  if (letterBottomRightAsset && letterBottomRightAsset.src) {
    try {
      const rightImg = await loadImage(letterBottomRightAsset.src);
      ctx.save();
      ctx.translate(w - 24 - 14, 400);
      ctx.rotate((6 * Math.PI) / 180);
      ctx.drawImage(rightImg, -14, -14, 28, 28);
      ctx.restore();
    } catch (_) {}
  }

  ctx.restore();
  return { canvas, unitW: w, unitH: h };
}

/**
 * Render the folded envelope canvas (580x390 base units at 300 DPI).
 * Redesigned to match Reference 2 & 3:
 * - Clean hand-drawn perimeter border with customizable colors
 * - Contoured flap line meeting at center seal
 * - NO UI boxes, pure handwritten text directly on textured paper
 * - Corner cut marks (crop marks) for DIY precision trimming
 */
export async function renderFoldedEnvelopeCanvas(state, includeBleed = false) {
  const w = 580;
  const h = 380;
  const scale = DPI_SCALE;

  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.scale(scale, scale);

  const envelopeRadius = state.envelopeBorderRadius !== undefined ? Number(state.envelopeBorderRadius) : 16;
  const currentTheme = ENVELOPE_THEMES.find(t => t.id === state.envelopeTheme) || ENVELOPE_THEMES[0];
  const activeStamp = POSTAL_STAMPS.find(s => s.id === state.envelopeStamp) || POSTAL_STAMPS[0];
  const fontFam = mapFont(state.fontStyle || 'caveat');

  const borderColor = state.envelopeBorderColor || '#B91C1C';
  const borderStyle = state.envelopeBorderStyle || 'handdrawn-single';
  const flapStyle = state.envelopeFlapStyle || 'triangular';

  // 1. Envelope base background
  ctx.fillStyle = currentTheme.bg;
  roundRect(ctx, 0, 0, w, h, envelopeRadius);
  ctx.fill();

  // 2. Paper grain texture
  drawPaperGrain(ctx, 0, 0, w, h, 0.05);

  // 3. Hand-drawn perimeter border (Matching Reference 2 & 3)
  await drawHandDrawnBorder(ctx, borderStyle, borderColor, w, h, envelopeRadius);

  // 4. Hand-drawn flap fold contour
  await drawFlapContour(ctx, flapStyle, borderColor, w, h, envelopeRadius);

  // 5. Corner DIY Cut Marks (Crop Marks) - only if bleed / craft requested
  if (includeBleed) {
    drawEnvelopeCornerCutMarks(ctx, 20, 20, w - 40, h - 40);
  }

  // 6. Top-Right: Postage Stamp + Wavy Postmark Lines (Kitte Airmail Cachet)
  const stampX = w - 85;
  const stampY = 22;
  const stampW = 56;
  const stampH = 72;

  try {
    const stampImg = await loadImage(activeStamp.src);
    ctx.save();
    ctx.translate(stampX + stampW / 2, stampY + stampH / 2);
    ctx.rotate(0.03);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-stampW / 2, -stampH / 2, stampW, stampH);
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-stampW / 2, -stampH / 2, stampW, stampH);
    ctx.drawImage(stampImg, -stampW / 2 + 4, -stampH / 2 + 4, stampW - 8, stampH - 18);

    ctx.font = 'bold 7px "JetBrains Mono", monospace';
    ctx.fillStyle = '#1A1A1A';
    ctx.textAlign = 'left';
    ctx.fillText('KITTE', -stampW / 2 + 4, stampH / 2 - 4);
    ctx.fillStyle = borderColor;
    ctx.textAlign = 'right';
    ctx.fillText('AIR', stampW / 2 - 4, stampH / 2 - 4);
    ctx.restore();

    // Wavy postmark cancellation lines
    ctx.save();
    ctx.strokeStyle = 'rgba(26, 26, 26, 0.7)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) {
      const yOffset = stampY + 20 + i * 9;
      ctx.beginPath();
      ctx.moveTo(stampX - 55, yOffset);
      ctx.bezierCurveTo(stampX - 40, yOffset - 4, stampX - 25, yOffset + 4, stampX - 10, yOffset);
      ctx.bezierCurveTo(stampX + 5, yOffset - 4, stampX + 20, yOffset + 4, stampX + 35, yOffset);
      ctx.stroke();
    }
    ctx.font = 'bold 7px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(26, 26, 26, 0.75)';
    ctx.textAlign = 'center';
    ctx.fillText(state.sendDate || 'OCT 2026', stampX - 25, stampY + 54);
    ctx.restore();
  } catch (_) {}

  // 7. Corner slots: Top-Left, Bottom-Left, Bottom-Right
  const topLeftAsset = getDecorationAsset(state.envelopeTopLeft);
  if (topLeftAsset) {
    try {
      const tlImg = await loadImage(topLeftAsset.src);
      ctx.save();
      ctx.translate(28 + 22, 24 + 22);
      ctx.rotate(-0.05);
      ctx.drawImage(tlImg, -22, -22, 44, 44);
      ctx.restore();
    } catch (_) {}
  }

  const bottomLeftAsset = getDecorationAsset(state.envelopeBottomLeft);
  if (bottomLeftAsset) {
    try {
      const blImg = await loadImage(bottomLeftAsset.src);
      ctx.save();
      ctx.translate(28 + 22, h - 68 + 22);
      ctx.rotate(0.08);
      ctx.drawImage(blImg, -22, -22, 44, 44);
      ctx.restore();
    } catch (_) {}
  }

  const bottomRightAsset = getDecorationAsset(state.envelopeBottomRight);
  if (bottomRightAsset) {
    try {
      const brImg = await loadImage(bottomRightAsset.src);
      ctx.save();
      ctx.translate(w - 72 + 22, h - 68 + 22);
      ctx.rotate(-0.08);
      ctx.drawImage(brImg, -22, -22, 44, 44);
      ctx.restore();
    } catch (_) {}
  }

  // 8. Center Flap Seal (Ribbon Bow / Heart / Botanical at flap junction)
  const centerSealId = state.envelopeCenterSeal !== undefined ? state.envelopeCenterSeal : 'ribbon';
  const centerSealAsset = getDecorationAsset(centerSealId);
  if (centerSealAsset && flapStyle !== 'none') {
    try {
      const sealImg = await loadImage(centerSealAsset.src);
      const sealSize = 58;
      ctx.drawImage(sealImg, w / 2 - sealSize / 2, 185 - sealSize / 2, sealSize, sealSize);
    } catch (_) {}
  }

  // 9. Center: Pure Handwritten Recipient Text (NO BOXES, NO BORDERS)
  ctx.save();
  ctx.font = `bold 38px ${fontFam}`;
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  const recipientY = flapStyle !== 'none' ? 245 : 195;
  ctx.fillText(state.recipient || 'Future Me', w / 2, recipientY);

  if (state.recipientEmail) {
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(26, 26, 26, 0.65)';
    ctx.fillText(state.recipientEmail, w / 2, recipientY + 24);
  }
  ctx.restore();

  // 10. Bottom Area: Pure Handwritten "Don't open before [Date]" (Matching Reference 2)
  ctx.save();
  ctx.font = `bold 20px ${fontFam}`;
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  const noticeLabel = state.envelopeNoticeText || "Don't open before";
  const noticeDate = state.deliveryDate || 'OCT 25, 2027';
  ctx.fillText(`${noticeLabel} ${noticeDate}`, w / 2, h - 35);

  if (state.location) {
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(26, 26, 26, 0.45)';
    ctx.fillText(`• ${state.location.toUpperCase()} •`, w / 2, h - 20);
  }
  ctx.restore();

  ctx.restore();
  return { canvas, unitW: w, unitH: h };
}

/**
 * Renders the authentic stationery dot pattern overlay (matching TimeEnvelopeCard UI).
 */
function drawEnvelopeDotPattern(ctx, x, y, w, h) {
  try {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 6;
    pCanvas.height = 6;
    const pctx = pCanvas.getContext('2d');
    pctx.fillStyle = 'rgba(26, 26, 26, 0.06)';
    pctx.beginPath();
    pctx.arc(3, 3, 0.7, 0, Math.PI * 2);
    pctx.fill();
    const pattern = ctx.createPattern(pCanvas, 'repeat');
    ctx.save();
    ctx.fillStyle = pattern;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  } catch (_) {
    // Fallback if pattern creation fails
    ctx.save();
    ctx.fillStyle = 'rgba(26, 26, 26, 0.05)';
    for (let px = x; px <= x + w; px += 8) {
      for (let py = y; py <= y + h; py += 8) {
        ctx.fillRect(px, py, 1, 1);
      }
    }
    ctx.restore();
  }
}

/**
 * PAGE 1: Clean High-Capacity DIY Envelope Net (For Real Physical Crafting & Letter Insertion)
 * - Complete clean stationery paper net filled with user-selected paper color and dot pattern.
 * - ZERO pre-printed borders (no red border), ZERO recipient text, ZERO notice text, ZERO inner text.
 * - ZERO header taking up space at the top.
 * - Maximum capacity: 155.8mm x 115.2mm front face with 86mm deep pocket, effortlessly fitting folded letterhead.
 * - Seam-aligned circular "AFFIX WAX SEAL HERE" attachment guide at apex of top flap.
 * - Subtle dashed stamp placement guide at top-right for cut-out stamps.
 * - Corner registration & crop marks for clean trimming.
 */
export async function renderCleanEnvelopeNetCanvas(state) {
  const sheetW = 620;
  const sheetH = 877;
  const scale = DPI_SCALE;

  const canvas = document.createElement('canvas');
  canvas.width = sheetW * scale;
  canvas.height = sheetH * scale;
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.scale(scale, scale);

  // 1. Crisp white paper sheet
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, sheetW, sheetH);

  // 2. Hairline corner registration marks & crop marks (for precision scissors / craft knife trimming)
  drawRegistrationMarks(ctx, 22, 22, 7);
  drawRegistrationMarks(ctx, sheetW - 22, 22, 7);
  drawRegistrationMarks(ctx, 22, sheetH - 22, 7);
  drawRegistrationMarks(ctx, sheetW - 22, sheetH - 22, 7);
  drawCropMarks(ctx, 22, 22, sheetW - 44, sheetH - 44, 1);

  // 3. High-Capacity Symmetrical Baronial Net Geometry
  // Front Face: 155.8mm x 115.2mm (460px x 340px base units at 300 DPI scale)
  // Perfectly sized so standard letterhead (folded in half twice or in thirds) slips inside effortlessly!
  const faceW = 460;
  const faceH = 340;
  const faceX = (sheetW - faceW) / 2; // 80px (leaves 27px margin with glue tabs)
  const faceY = 246;

  // Flaps geometry
  const topFlapH = 175;     // 59.3mm triangular flap height (apex tip at y = 71)
  const bottomFlapH = 205;  // 69.4mm deep pocket flap height (bottom edge at y = 791)
  const glueTabW = 54;      // 18.3mm left/right tapered glue tabs

  const currentTheme = ENVELOPE_THEMES.find(t => t.id === state.envelopeTheme || t.bg === state.envelopeTheme) || ENVELOPE_THEMES[0];
  const flapStyle = state.envelopeFlapStyle || 'triangular';

  // 4. Fill envelope net with user-selected paper color and authentic dot pattern matching UI
  ctx.save();
  ctx.beginPath();
  // Start at top-left corner of front face
  ctx.moveTo(faceX, faceY);

  // Top triangular flap
  if (flapStyle === 'curved') {
    ctx.quadraticCurveTo(sheetW / 2, faceY - topFlapH, faceX + faceW, faceY);
  } else {
    ctx.lineTo(sheetW / 2, faceY - topFlapH);
    ctx.lineTo(faceX + faceW, faceY);
  }

  // Right side glue tab (tapered top & bottom with bevel notches)
  ctx.lineTo(faceX + faceW, faceY + 14);
  ctx.lineTo(faceX + faceW + glueTabW, faceY + 50);
  ctx.lineTo(faceX + faceW + glueTabW, faceY + faceH - 50);
  ctx.lineTo(faceX + faceW, faceY + faceH - 14);
  ctx.lineTo(faceX + faceW, faceY + faceH);

  // Bottom pocket panel (slightly tapered side edges for smooth internal folding)
  ctx.lineTo(faceX + faceW - 16, faceY + faceH + bottomFlapH);
  ctx.lineTo(faceX + 16, faceY + faceH + bottomFlapH);
  ctx.lineTo(faceX, faceY + faceH);

  // Left side glue tab (tapered top & bottom with bevel notches)
  ctx.lineTo(faceX, faceY + faceH - 14);
  ctx.lineTo(faceX - glueTabW, faceY + faceH - 50);
  ctx.lineTo(faceX - glueTabW, faceY + 50);
  ctx.lineTo(faceX, faceY + 14);
  ctx.closePath();

  // Solid fill with user-selected theme color
  ctx.fillStyle = currentTheme.bg;
  ctx.fill();

  // Clip to net and apply authentic dot grid pattern + paper grain overlay
  ctx.save();
  ctx.clip();
  drawEnvelopeDotPattern(ctx, faceX - glueTabW, faceY - topFlapH, faceW + glueTabW * 2, faceH + topFlapH + bottomFlapH);
  drawPaperGrain(ctx, faceX - glueTabW, faceY - topFlapH, faceW + glueTabW * 2, faceH + topFlapH + bottomFlapH, 0.04);
  ctx.restore();
  ctx.restore();

  // 5. Glue Tabs Diagonal Hatching (Zero text on net for 100% unmarked DIY product)
  ctx.save();
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.14)';
  ctx.lineWidth = 1;
  // Left Glue Tab hatching
  for (let gy = faceY + 50; gy < faceY + faceH - 50; gy += 15) {
    ctx.beginPath();
    ctx.moveTo(faceX - glueTabW, gy);
    ctx.lineTo(faceX, gy + 15);
    ctx.stroke();
  }
  // Right Glue Tab hatching
  for (let gy = faceY + 50; gy < faceY + faceH - 50; gy += 15) {
    ctx.beginPath();
    ctx.moveTo(faceX + faceW, gy);
    ctx.lineTo(faceX + faceW + glueTabW, gy + 15);
    ctx.stroke();
  }
  ctx.restore();

  // 6. Dashed Score / Fold Creases (Fine hairline dashed lines, ZERO text on flaps)
  ctx.save();
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.32)';
  ctx.lineWidth = 0.8;
  ctx.setLineDash([3, 4]);

  // Top crease
  ctx.beginPath();
  ctx.moveTo(faceX, faceY);
  ctx.lineTo(faceX + faceW, faceY);
  ctx.stroke();

  // Bottom crease
  ctx.beginPath();
  ctx.moveTo(faceX, faceY + faceH);
  ctx.lineTo(faceX + faceW, faceY + faceH);
  ctx.stroke();

  // Left crease
  ctx.beginPath();
  ctx.moveTo(faceX, faceY);
  ctx.lineTo(faceX, faceY + faceH);
  ctx.stroke();

  // Right crease
  ctx.beginPath();
  ctx.moveTo(faceX + faceW, faceY);
  ctx.lineTo(faceX + faceW, faceY + faceH);
  ctx.stroke();
  ctx.restore();

  // 7. Solid Outer Cut Perimeter
  ctx.save();
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(faceX, faceY);
  if (flapStyle === 'curved') {
    ctx.quadraticCurveTo(sheetW / 2, faceY - topFlapH, faceX + faceW, faceY);
  } else {
    ctx.lineTo(sheetW / 2, faceY - topFlapH);
    ctx.lineTo(faceX + faceW, faceY);
  }
  ctx.lineTo(faceX + faceW, faceY + 14);
  ctx.lineTo(faceX + faceW + glueTabW, faceY + 50);
  ctx.lineTo(faceX + faceW + glueTabW, faceY + faceH - 50);
  ctx.lineTo(faceX + faceW, faceY + faceH - 14);
  ctx.lineTo(faceX + faceW, faceY + faceH);
  ctx.lineTo(faceX + faceW - 16, faceY + faceH + bottomFlapH);
  ctx.lineTo(faceX + 16, faceY + faceH + bottomFlapH);
  ctx.lineTo(faceX, faceY + faceH);
  ctx.lineTo(faceX, faceY + faceH - 14);
  ctx.lineTo(faceX - glueTabW, faceY + faceH - 50);
  ctx.lineTo(faceX - glueTabW, faceY + 50);
  ctx.lineTo(faceX, faceY + 14);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // 8. Trimming & Scoring Alignment Guides (Positioned OUTSIDE in the white scrap margin)
  // When the user cuts along the solid line, ALL margin text and marks are discarded!
  // The resulting physical folded envelope has ZERO visible text, guidelines, or boxes!
  ctx.save();
  ctx.font = 'bold 7px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.45)';

  // Top scrap margin notice (falls off with scrap paper when cut)
  ctx.textAlign = 'center';
  ctx.fillText('✂ CUT ALONG SOLID OUTER LINES • ALL MARGIN TEXT TRIMS OFF WITH SCRAP • FINISHED ENVELOPE IS 100% CLEAN & UNMARKED', sheetW / 2, 28);

  // Left margin score indicators (in scrap area)
  ctx.textAlign = 'left';
  ctx.fillText('SCORE ──►', 8, faceY + 2);
  ctx.fillText('SCORE ──►', 8, faceY + faceH + 2);
  ctx.fillText('✂ CUT', 8, faceY + faceH / 2);

  // Right margin score indicators (in scrap area)
  ctx.textAlign = 'right';
  ctx.fillText('◄── SCORE', sheetW - 8, faceY + 2);
  ctx.fillText('◄── SCORE', sheetW - 8, faceY + faceH + 2);
  ctx.fillText('CUT ✂', sheetW - 8, faceY + faceH / 2);

  // Bottom scrap margin notice (falls off with scrap paper when cut)
  ctx.textAlign = 'center';
  ctx.fillText('▲ ✂ CUT ALONG SOLID BOTTOM EDGE • DISCARD ALL OUTER SCRAP PAPER ▲', sheetW / 2, faceY + faceH + bottomFlapH + 20);
  ctx.restore();

  ctx.restore();
  return { canvas, unitW: sheetW, unitH: sheetH };
}

/**
 * PAGE 2: Dedicated 6-Step Diagrammatic Assembly & Crafting Companion Guide
 * - Beautiful full-page guide with visual vector step illustrations.
 * - Clear instructions on cutting, scoring, backward folding, pouch gluing, letter insertion, and wax sealing.
 * - Materials & specifications recommendations for authentic physical results.
 */
export async function renderEnvelopeAssemblyGuideCanvas(state) {
  const sheetW = 620;
  const sheetH = 877;
  const scale = DPI_SCALE;

  const canvas = document.createElement('canvas');
  canvas.width = sheetW * scale;
  canvas.height = sheetH * scale;
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.scale(scale, scale);

  // 1. Warm archival paper background
  ctx.fillStyle = '#FAF7EE';
  ctx.fillRect(0, 0, sheetW, sheetH);

  // Hairline corner registration marks & crop marks
  drawRegistrationMarks(ctx, 22, 22, 7);
  drawRegistrationMarks(ctx, sheetW - 22, 22, 7);
  drawRegistrationMarks(ctx, 22, sheetH - 22, 7);
  drawRegistrationMarks(ctx, sheetW - 22, sheetH - 22, 7);
  drawCropMarks(ctx, 22, 22, sheetW - 44, sheetH - 44, 1);

  // 2. Header banner
  ctx.save();
  ctx.translate(sheetW / 2, 38);

  ctx.font = 'bold 8.5px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.65)';
  ctx.textAlign = 'center';
  ctx.fillText('KITTE TIME CAPSULE • ARCHIVAL CRAFT COMPANION • PAGE 2/2', 0, 0);

  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.fillText('DIY ENVELOPE ASSEMBLY & CRAFT GUIDE', 0, 18);

  ctx.font = '8px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.7)';
  ctx.fillText('Step-by-step instructions to cut, score, fold, glue, and finish your keepsake envelope', 0, 31);

  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-275, 40);
  ctx.lineTo(275, 40);
  ctx.stroke();
  ctx.restore();

  // 3. 6 Large Diagrammatic Step Cards (2 rows x 3 columns grid)
  const startY = 88;
  const cardW = 176;
  const cardH = 264;
  const gapX = 18;
  const gapY = 16;
  const startX = (sheetW - (cardW * 3 + gapX * 2)) / 2; // 28px

  const stepDetails = [
    {
      num: '1',
      title: '1. CUT OUT NET',
      desc: 'Use precision craft shears or a craft knife with a metal ruler to cut out the net along all outer solid lines ✂. All outer margin guides trim away with scrap paper.'
    },
    {
      num: '2',
      title: '2. SCORE CREASES',
      desc: 'Align a metal ruler along the 4 fine dashed crease lines. Lightly score with a bone folder or dry ballpoint pen for clean, razor-sharp folds.'
    },
    {
      num: '3',
      title: '3. FOLD SIDE TABS',
      desc: 'Fold both left and right hatched glue tabs firmly BACKWARD along the vertical crease lines away from the front face.'
    },
    {
      num: '4',
      title: '4. GLUE POUCH',
      desc: 'Apply craft glue or double-sided tape to the hatched side tabs. Fold the bottom pocket UP over the tabs and press firmly to form the pouch.'
    },
    {
      num: '5',
      title: '5. INSERT LETTER',
      desc: 'Fold your archival letterhead in half or in thirds. Gently slide your letter inside the finished keepsake pouch. Both front and back remain pristine and clean.'
    },
    {
      num: '6',
      title: '6. SEAL & PERSONALIZE',
      desc: 'Fold top flap down. Handwrite your recipient or note on the clean front face, and optionally seal the flap with a wax seal, ribbon, or craft glue.'
    }
  ];

  for (let idx = 0; idx < 6; idx++) {
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);
    const step = stepDetails[idx];

    ctx.save();
    // Card background
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 1.4;
    roundRect(ctx, x, y, cardW, cardH, 4);
    ctx.fill();
    ctx.stroke();

    // Card Header Bar
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.moveTo(x, y + 4);
    ctx.arcTo(x, y, x + 4, y, 4);
    ctx.lineTo(x + cardW - 4, y);
    ctx.arcTo(x + cardW, y, x + cardW, y + 4, 4);
    ctx.lineTo(x + cardW, y + 26);
    ctx.lineTo(x, y + 26);
    ctx.closePath();
    ctx.fill();

    // Step Number Badge (Pill)
    ctx.fillStyle = '#FFEB3B';
    roundRect(ctx, x + 8, y + 5, 18, 16, 3);
    ctx.fill();
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#1A1A1A';
    ctx.textAlign = 'center';
    ctx.fillText(step.num, x + 17, y + 17);

    // Title
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText(step.title, x + 32, y + 17);

    // Diagram illustration box
    const diagCenterX = x + cardW / 2;
    const diagCenterY = y + 104;

    ctx.save();
    ctx.translate(diagCenterX, diagCenterY);

    if (idx === 0) {
      // Step 1: Net contour with cutting shears
      ctx.strokeStyle = '#1A1A1A';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-24, -12);
      ctx.lineTo(0, -32);
      ctx.lineTo(24, -12);
      ctx.lineTo(36, -6);
      ctx.lineTo(36, 24);
      ctx.lineTo(24, 30);
      ctx.lineTo(20, 52);
      ctx.lineTo(-20, 52);
      ctx.lineTo(-24, 30);
      ctx.lineTo(-36, 24);
      ctx.lineTo(-36, -6);
      ctx.closePath();
      ctx.stroke();

      // Scissors illustration cutting along the perimeter
      ctx.font = '22px monospace';
      ctx.fillStyle = '#B91C1C';
      ctx.textAlign = 'center';
      ctx.fillText('✂', 18, -18);
    } else if (idx === 1) {
      // Step 2: Front panel with dashed fold creases and scoring stylus
      ctx.strokeStyle = '#1A1A1A';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(-32, -22, 64, 44);

      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = '#B91C1C';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(-24, -15, 48, 30);
      ctx.setLineDash([]);

      // Stylus / bone folder tool
      ctx.strokeStyle = '#1A1A1A';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-36, 24);
      ctx.lineTo(-18, 6);
      ctx.stroke();
      ctx.fillStyle = '#FFEB3B';
      ctx.beginPath();
      ctx.arc(-18, 6, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (idx === 2) {
      // Step 3: Central face with side wings folding backward
      ctx.strokeStyle = '#1A1A1A';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(-24, -20, 48, 40);

      // Side tabs
      ctx.fillStyle = 'rgba(26,26,26,0.08)';
      ctx.fillRect(-38, -14, 14, 28);
      ctx.strokeRect(-38, -14, 14, 28);
      ctx.fillRect(24, -14, 14, 28);
      ctx.strokeRect(24, -14, 14, 28);

      // Fold backward arrows
      ctx.strokeStyle = '#B91C1C';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(-28, 0, 9, 0, Math.PI * 1.5, true);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(28, 0, 9, 0, Math.PI * 1.5, false);
      ctx.stroke();
    } else if (idx === 3) {
      // Step 4: Bottom pocket folding UP with glue dots
      ctx.strokeStyle = '#1A1A1A';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(-28, -24, 56, 48);

      // Upward fold arrow
      ctx.strokeStyle = '#B91C1C';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, 24);
      ctx.lineTo(0, 0);
      ctx.lineTo(-6, 6);
      ctx.moveTo(0, 0);
      ctx.lineTo(6, 6);
      ctx.stroke();

      // Glue dots on tabs
      ctx.fillStyle = '#1D4ED8';
      ctx.beginPath();
      ctx.arc(-20, 6, 3.5, 0, Math.PI * 2);
      ctx.arc(20, 6, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (idx === 4) {
      // Step 5: Finished pouch with folded letterhead slipping inside
      ctx.strokeStyle = '#1A1A1A';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-30, -8);
      ctx.lineTo(-30, 24);
      ctx.lineTo(30, 24);
      ctx.lineTo(30, -8);
      ctx.stroke();

      // Letter sliding inside
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-22, -32, 44, 34);
      ctx.strokeRect(-22, -32, 44, 34);

      // Text lines on mini letter
      ctx.strokeStyle = 'rgba(26,26,26,0.3)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-16, -24); ctx.lineTo(10, -24);
      ctx.moveTo(-16, -16); ctx.lineTo(16, -16);
      ctx.moveTo(-16, -8); ctx.lineTo(12, -8);
      ctx.stroke();

      // Down arrow
      ctx.strokeStyle = '#B91C1C';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(0, -38); ctx.lineTo(0, -18);
      ctx.lineTo(-5, -23);
      ctx.moveTo(0, -18); ctx.lineTo(5, -23);
      ctx.stroke();
    } else if (idx === 5) {
      // Step 6: Closed envelope with wax seal over apex seam and stamp
      ctx.strokeStyle = '#1A1A1A';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(-32, -18, 64, 40);

      // Top flap folded down to center
      ctx.beginPath();
      ctx.moveTo(-32, -18);
      ctx.lineTo(0, 4);
      ctx.lineTo(32, -18);
      ctx.stroke();

      // Circular wax seal over seam
      ctx.fillStyle = '#B91C1C';
      ctx.beginPath();
      ctx.arc(0, 4, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7F1D1D';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Mini stamp at top right
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(16, -14, 11, 14);
      ctx.strokeStyle = '#1D4ED8';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(16, -14, 11, 14);
    }
    ctx.restore();

    // Step description text
    ctx.font = '7.5px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(26, 26, 26, 0.85)';
    ctx.textAlign = 'left';
    wrapText(ctx, step.desc, x + 12, y + 195, cardW - 24, 12);

    ctx.restore();
  }

  // 4. Bottom Section: Pro Crafting Specifications & Materials
  const specY = startY + cardH * 2 + gapY * 2 + 6; // ~648px
  const specH = 142;

  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 1.4;
  roundRect(ctx, startX, specY, sheetW - startX * 2, specH, 4);
  ctx.fill();
  ctx.stroke();

  // Header of specs box
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.moveTo(startX, specY + 4);
  ctx.arcTo(startX, specY, startX + 4, specY, 4);
  ctx.lineTo(sheetW - startX - 4, specY);
  ctx.arcTo(sheetW - startX, specY, sheetW - startX, specY + 4, 4);
  ctx.lineTo(sheetW - startX, specY + 22);
  ctx.lineTo(startX, specY + 22);
  ctx.closePath();
  ctx.fill();

  ctx.font = 'bold 8.5px "JetBrains Mono", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('PRO CRAFTING SPECIFICATIONS & MATERIALS CHECKLIST', sheetW / 2, specY + 15);

  const colWidth = (sheetW - startX * 2) / 3;

  const specs = [
    {
      title: '1. RECOMMENDED PAPER',
      p1: '• 160–240 GSM cardstock, linen, or heavyweight parchment.',
      p2: '• Prevents light transparency and gives authentic firm postal hand-feel.'
    },
    {
      title: '2. SCORING & CREASING',
      p1: '• Always score dashed fold lines along a metal ruler before folding.',
      p2: '• An empty ballpoint pen or bone folder creates razor-sharp creases.'
    },
    {
      title: '3. ADHESIVES & FINISH',
      p1: '• Apply acid-free craft glue or double-sided craft tape to side wings.',
      p2: '• Personalize the clean front face, and seal flap with craft glue, wax, or ribbon.'
    }
  ];

  for (let sIdx = 0; sIdx < 3; sIdx++) {
    const sX = startX + sIdx * colWidth;
    const item = specs[sIdx];

    if (sIdx > 0) {
      ctx.strokeStyle = 'rgba(26, 26, 26, 0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sX, specY + 22);
      ctx.lineTo(sX, specY + specH);
      ctx.stroke();
    }

    ctx.font = 'bold 8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#1A1A1A';
    ctx.textAlign = 'left';
    ctx.fillText(item.title, sX + 12, specY + 40);

    ctx.font = '7px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(26, 26, 26, 0.75)';
    wrapText(ctx, item.p1, sX + 12, specY + 56, colWidth - 24, 12);
    wrapText(ctx, item.p2, sX + 12, specY + 94, colWidth - 24, 12);
  }

  ctx.restore();

  // 5. Sheet Footer
  ctx.save();
  ctx.font = 'bold 7.5px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.6)';
  ctx.textAlign = 'center';
  ctx.fillText('KITTE ARCHIVAL CRAFTS • PRINT AT 100% SCALE (DO NOT FIT TO PAGE) • 300 DPI HIGH RESOLUTION', sheetW / 2, sheetH - 24);
  ctx.restore();

  ctx.restore();
  return { canvas, unitW: sheetW, unitH: sheetH };
}

/**
 * Backwards compatible export wrapper for DIY Envelope Craft Sheet
 */
export async function renderEnvelopeCraftSheetCanvas(state) {
  return await renderCleanEnvelopeNetCanvas(state);
}

/**
 * Shape-Aware Cut Contour Helpers for DIY Stamps & Seals Sheet
 * Accurately extracts the true silhouette boundaries of image assets (ribbon bows,
 * hearts, flower clusters, cat mascots, stars, seals), offsets them by an exact
 * cutting margin, and traces a smooth vector dashed cut line.
 */

// Extract true alpha boundary contour of any loaded image asset with a uniform margin
function getAssetCutContour(img, drawW, drawH, margin = 8) {
  if (!img) return null;
  const pad = Math.ceil(margin + 12);
  const offW = Math.round(drawW + pad * 2);
  const offH = Math.round(drawH + pad * 2);

  const off = document.createElement('canvas');
  off.width = offW;
  off.height = offH;
  const octx = off.getContext('2d', { willReadFrequently: true });

  // 1. Dilate alpha mask radially around a circle of radius = margin
  const steps = 16;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const ox = pad + Math.cos(a) * margin;
    const oy = pad + Math.sin(a) * margin;
    octx.drawImage(img, ox, oy, drawW, drawH);
  }

  // Multi-element sticker bridging pass:
  // For assets with clustered or floating decorative elements (such as cat-stamp or flower cluster),
  // apply a bridge dilation pass to fuse elements into a single cohesive cut sticker silhouette
  const bridgeR = margin + 3;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const ox = pad + Math.cos(a) * bridgeR;
    const oy = pad + Math.sin(a) * bridgeR;
    octx.drawImage(img, ox, oy, drawW, drawH);
  }

  // Draw core image at center
  octx.drawImage(img, pad, pad, drawW, drawH);

  // 2. Read alpha data
  const imgData = octx.getImageData(0, 0, offW, offH);
  const data = imgData.data;

  const isSolid = (x, y) => {
    if (x < 0 || x >= offW || y < 0 || y >= offH) return false;
    return data[(y * offW + x) * 4 + 3] > 25;
  };

  // 3. Find solid pixels and extract the primary boundary contour
  const dx = [0, 1, 1, 1, 0, -1, -1, -1];
  const dy = [-1, -1, 0, 1, 1, 1, 0, -1];
  const maxSteps = offW * offH;

  const traceBoundary = (sX, sY) => {
    const pts = [];
    let curX = sX;
    let curY = sY;
    let checkDir = 7;
    let count = 0;
    do {
      pts.push({ x: curX - pad, y: curY - pad });
      let found = false;
      for (let i = 0; i < 8; i++) {
        const dir = (checkDir + i) % 8;
        const nx = curX + dx[dir];
        const ny = curY + dy[dir];
        if (isSolid(nx, ny)) {
          curX = nx;
          curY = ny;
          checkDir = (dir + 5) % 8;
          found = true;
          break;
        }
      }
      if (!found) break;
      count++;
    } while ((curX !== sX || curY !== sY) && count < maxSteps);
    return pts;
  };

  // Find the largest exterior contour by scanning top-to-bottom
  let bestContour = null;
  const visited = new Uint8Array(offW * offH);

  for (let y = 0; y < offH; y += 2) {
    for (let x = 0; x < offW; x += 2) {
      const idx = y * offW + x;
      if (visited[idx]) continue;
      if (isSolid(x, y)) {
        const pts = traceBoundary(x, y);
        for (const p of pts) {
          const vx = Math.round(p.x + pad);
          const vy = Math.round(p.y + pad);
          if (vx >= 0 && vx < offW && vy >= 0 && vy < offH) {
            visited[vy * offW + vx] = 1;
          }
        }
        if (!bestContour || pts.length > bestContour.length) {
          bestContour = pts;
        }
        if (pts.length > 60) break;
      }
    }
    if (bestContour && bestContour.length > 60) break;
  }

  const raw = bestContour;
  if (!raw || raw.length < 8) return null;

  // 4. Smooth contour points using windowed moving average and quadratic spline
  const targetCount = Math.min(120, Math.max(36, Math.floor(raw.length / 2.5)));
  const step = Math.max(1, Math.floor(raw.length / targetCount));
  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  const n = raw.length;
  const smoothed = [];

  for (let i = 0; i < n; i += step) {
    let sumX = 0, sumY = 0, c = 0;
    for (let j = -half; j <= half; j++) {
      const idx = (i + j + n) % n;
      sumX += raw[idx].x;
      sumY += raw[idx].y;
      c++;
    }
    smoothed.push({ x: sumX / c, y: sumY / c });
  }

  return smoothed;
}

// Draw a smooth dashed vector cut contour around an asset with bottom label
function drawCutContour(ctx, points, targetX, targetY, label, bottomY, labelX) {
  ctx.save();
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.65)';
  ctx.lineWidth = 1.3;
  ctx.setLineDash([4, 3]);

  if (points && points.length > 3) {
    ctx.beginPath();
    ctx.moveTo((points[0].x + points[points.length - 1].x) / 2 + targetX, (points[0].y + points[points.length - 1].y) / 2 + targetY);
    for (let i = 0; i < points.length; i++) {
      const p0 = points[i];
      const p1 = points[(i + 1) % points.length];
      const midX = (p0.x + p1.x) / 2 + targetX;
      const midY = (p0.y + p1.y) / 2 + targetY;
      ctx.quadraticCurveTo(p0.x + targetX, p0.y + targetY, midX, midY);
    }
    ctx.closePath();
    ctx.stroke();
  }

  if (label) {
    ctx.font = 'bold 7.5px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(26, 26, 26, 0.7)';
    ctx.textAlign = 'center';
    const lx = labelX !== undefined ? labelX : targetX;
    ctx.fillText(`✂ ${label}`, lx, bottomY);
  }
  ctx.restore();
}

// Draw asset image and its exact shape-aware dashed cut contour with uniform margin
async function drawAssetWithContour(ctx, asset, cx, cy, size, label, margin = 8) {
  if (!asset || !asset.src) return;
  try {
    const img = await loadImage(asset.src);
    const aspect = (img.naturalHeight && img.naturalWidth) ? (img.naturalHeight / img.naturalWidth) : 1;
    let drawW = size;
    let drawH = size * aspect;
    if (drawH > size * 1.25) {
      drawH = size * 1.25;
      drawW = drawH / aspect;
    }

    const drawX = cx - drawW / 2;
    const drawY = cy - drawH / 2;

    // 1. Draw image asset
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // 2. Extract shape-aware silhouette cut contour
    const contour = getAssetCutContour(img, drawW, drawH, margin);
    const bottomLabelY = drawY + drawH + margin + 14;

    // 3. Render contour or clean rounded fallback
    if (contour && contour.length > 3) {
      drawCutContour(ctx, contour, drawX, drawY, label, bottomLabelY, cx);
    } else {
      ctx.save();
      ctx.strokeStyle = 'rgba(26, 26, 26, 0.65)';
      ctx.lineWidth = 1.3;
      ctx.setLineDash([4, 3]);
      roundRect(ctx, drawX - margin, drawY - margin, drawW + margin * 2, drawH + margin * 2, 6);
      ctx.stroke();
      ctx.font = 'bold 7.5px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(26, 26, 26, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText(`✂ ${label}`, cx, bottomLabelY);
      ctx.restore();
    }
  } catch (err) {
    console.warn('drawAssetWithContour error:', err);
  }
}

// Draw an authentic perforated postage stamp with scalloped punch notches along all 4 edges
async function drawPerforatedStamp(ctx, x, y, w, h, stampAsset, borderColor, label = 'Cut Stamp') {
  // 1. Outer dashed cut guide with rounded corners and comfortable 9px margin
  const margin = 9;
  ctx.save();
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.65)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 3]);
  roundRect(ctx, x - margin, y - margin, w + margin * 2, h + margin * 2, 5);
  ctx.stroke();
  ctx.font = 'bold 7.5px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.7)';
  ctx.textAlign = 'center';
  ctx.fillText(`✂ ${label}`, x + w / 2, y + h + margin + 14);
  ctx.restore();

  // 2. White stamp card body
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y, w, h);

  // 3. Realistic stamp perforation scalloped punch marks
  ctx.fillStyle = '#FAF7EE'; // Sheet card bg
  const perfR = 1.8;
  // Top edge perforations
  for (let px = x + 4; px < x + w - 3; px += 6) {
    ctx.beginPath();
    ctx.arc(px, y, perfR, 0, Math.PI);
    ctx.fill();
  }
  // Bottom edge perforations
  for (let px = x + 4; px < x + w - 3; px += 6) {
    ctx.beginPath();
    ctx.arc(px, y + h, perfR, Math.PI, 0);
    ctx.fill();
  }
  // Left edge perforations
  for (let py = y + 4; py < y + h - 3; py += 6) {
    ctx.beginPath();
    ctx.arc(x, py, perfR, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
  }
  // Right edge perforations
  for (let py = y + 4; py < y + h - 3; py += 6) {
    ctx.beginPath();
    ctx.arc(x + w, py, perfR, Math.PI / 2, -Math.PI / 2);
    ctx.fill();
  }

  // Inner stamp frame
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
  ctx.setLineDash([]);

  // Stamp image
  try {
    const img = await loadImage(stampAsset.src);
    ctx.drawImage(img, x + 8, y + 8, w - 16, h - 26);
  } catch (_) {}

  // Stamp footer line
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.2)';
  ctx.beginPath();
  ctx.moveTo(x + 4, y + h - 16);
  ctx.lineTo(x + w - 4, y + h - 16);
  ctx.stroke();

  ctx.font = 'bold 7px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'left';
  ctx.fillText('KITTE', x + 6, y + h - 6);
  ctx.fillStyle = borderColor;
  ctx.textAlign = 'right';
  ctx.fillText('AIR', x + w - 6, y + h - 6);
  ctx.restore();
}

// Draw an authentic circular airmail postmark / postal cachet seal badge
function drawPostalCachetSeal(ctx, cx, cy, dateStr, label = 'Cut Postal Cachet') {
  const r = 36;
  const margin = 8;

  // 1. Dashed circular cut guide with margin
  ctx.save();
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.65)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.arc(cx, cy, r + margin, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = 'bold 7px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.65)';
  ctx.textAlign = 'center';
  ctx.fillText(`✂ ${label}`, cx, cy + r + margin + 14);
  ctx.restore();

  // 2. Cachet body (ivory paper circle)
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Outer ring
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 6, 0, Math.PI * 2);
  ctx.stroke();

  // Header & Footer text
  ctx.font = 'bold 6.5px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  ctx.fillText('★ KITTE AIR MAIL ★', cx, cy - 18);
  ctx.fillText('ARCHIVAL POST', cx, cy + 22);

  // Center cancellation waves
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 1.2;
  for (let i = -1; i <= 1; i++) {
    const wy = cy - 2 + i * 6;
    ctx.beginPath();
    ctx.moveTo(cx - 20, wy);
    ctx.bezierCurveTo(cx - 10, wy - 3, cx - 5, wy + 3, cx, wy);
    ctx.bezierCurveTo(cx + 5, wy - 3, cx + 10, wy + 3, cx + 20, wy);
    ctx.stroke();
  }

  // Date banner
  ctx.fillStyle = '#FFEB3B';
  ctx.fillRect(cx - 24, cy - 6, 48, 12);
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - 24, cy - 6, 48, 12);

  ctx.font = 'bold 6.5px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  ctx.fillText(dateStr || 'OCT 2026', cx, cy + 2.5);

  ctx.restore();
}

// Draw an authentic 8-lobe organic molten sealing wax seal
function drawArtisanWaxSeal(ctx, cx, cy, r = 32, color = '#991B1B', monogram = 'K', label = 'Cut Wax Seal') {
  const margin = 8;
  const lobes = 8;

  // 1. Dashed molten contour cut mark
  ctx.save();
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.65)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  for (let a = 0; a <= Math.PI * 2; a += 0.05) {
    const wave = Math.sin(a * lobes) * 3 + Math.cos(a * 5) * 2;
    const rad = r + margin + wave;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  ctx.font = 'bold 7px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.65)';
  ctx.textAlign = 'center';
  ctx.fillText(`✂ ${label}`, cx, cy + r + margin + 14);
  ctx.restore();

  // 2. Molten organic wax body
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let a = 0; a <= Math.PI * 2; a += 0.05) {
    const wave = Math.sin(a * lobes) * 2.8 + Math.cos(a * 5) * 1.8;
    const rad = r + wave;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Wax 3D rim highlight & shadow
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inner seal matrix impression
  const innerR = r * 0.68;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.stroke();

  // Inner beaded ring
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    const bx = cx + Math.cos(a) * (innerR - 4);
    const by = cy + Math.sin(a) * (innerR - 4);
    ctx.beginPath();
    ctx.arc(bx, by, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Monogram / Emblem
  ctx.font = 'bold 16px "Times New Roman", serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(monogram, cx, cy);
  ctx.restore();
}

// Draw a vintage airmail label with chamfered cut corners and matching cut margin
function drawNotchedAirmailLabel(ctx, x, y, w, h, text, subtext, color = '#1A1A1A', bg = '#FFFFFF') {
  const notch = 6;
  const margin = 7;

  // 1. Outer dashed cut guide with matching chamfered corner notches
  ctx.save();
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.65)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 3]);
  const cutNotch = notch + 2;
  ctx.beginPath();
  ctx.moveTo(x - margin + cutNotch, y - margin);
  ctx.lineTo(x + w + margin - cutNotch, y - margin);
  ctx.lineTo(x + w + margin, y - margin + cutNotch);
  ctx.lineTo(x + w + margin, y + h + margin - cutNotch);
  ctx.lineTo(x + w + margin - cutNotch, y + h + margin);
  ctx.lineTo(x - margin + cutNotch, y + h + margin);
  ctx.lineTo(x - margin, y + h + margin - cutNotch);
  ctx.lineTo(x - margin, y - margin + cutNotch);
  ctx.closePath();
  ctx.stroke();

  ctx.font = 'bold 7px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.65)';
  ctx.textAlign = 'center';
  ctx.fillText('✂ Cut Airmail Label', x + w / 2, y + h + margin + 14);
  ctx.restore();

  // 2. Label body with chamfered corners
  ctx.save();
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(x + notch, y);
  ctx.lineTo(x + w - notch, y);
  ctx.lineTo(x + w, y + notch);
  ctx.lineTo(x + w, y + h - notch);
  ctx.lineTo(x + w - notch, y + h);
  ctx.lineTo(x + notch, y + h);
  ctx.lineTo(x, y + h - notch);
  ctx.lineTo(x, y + notch);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Text
  ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, x + w / 2, y + h / 2 - 2);
  if (subtext) {
    ctx.font = '7.5px "JetBrains Mono", monospace';
    ctx.fillText(subtext, x + w / 2, y + h / 2 + 10);
  }
  ctx.restore();
}

/**
 * Render 300 DPI A4 DIY Cut & Glue Stamps & Seals Sheet.
 * Features accurate asset-shaped cut marks (hearts, bow loops & tails, flower petals, wax seals, stamps, cat mascot).
 */
export async function renderStampsAndDecorSheetCanvas(state) {
  const sheetW = 794;
  const sheetH = 1123;
  const scale = DPI_SCALE; // 3.125 for 300 DPI

  const canvas = document.createElement('canvas');
  canvas.width = sheetW * scale;
  canvas.height = sheetH * scale;
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.scale(scale, scale);

  // 1. Sheet background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, sheetW, sheetH);

  ctx.fillStyle = '#FAF7EE';
  ctx.fillRect(24, 24, sheetW - 48, sheetH - 48);
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(24, 24, sheetW - 48, sheetH - 48);

  // 2. Header
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  ctx.fillText('KITTE TIME CAPSULE • DIY CUT & GLUE ACCESSORIES SHEET • 300 DPI', sheetW / 2, 54);

  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.75)';
  ctx.fillText('PRINT ON CARDSTOCK OR STICKER PAPER • CUT ALONG ACCURATE SHAPE LINES ✂ • AFFIX WITH GLUE OR WAX', sheetW / 2, 72);

  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 84);
  ctx.lineTo(sheetW - 40, 84);
  ctx.stroke();

  // --- SECTION 1: USER'S SELECTED ACCESSORIES (PRIMARY KEEPSAKE PIECES) ---
  ctx.textAlign = 'left';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.fillText('1. YOUR SELECTED ACCESSORIES (PRIMARY KEEPSAKE PIECES)', 45, 114);

  const activeStamp = POSTAL_STAMPS.find(s => s.id === state.envelopeStamp) || POSTAL_STAMPS[0];
  const centerSeal = getDecorationAsset(state.envelopeCenterSeal !== undefined ? state.envelopeCenterSeal : 'ribbon');
  const topLeft = getDecorationAsset(state.envelopeTopLeft);
  const bottomLeft = getDecorationAsset(state.envelopeBottomLeft);
  const bottomRight = getDecorationAsset(state.envelopeBottomRight);
  const borderColor = state.envelopeBorderColor || '#B91C1C';

  // 1A. Selected Postage Stamp with Scalloped Perforations & Rounded Margin
  await drawPerforatedStamp(ctx, 52, 134, 72, 95, activeStamp, borderColor, 'Cut Selected Stamp');

  // 1B. Official Postal Cachet / Postmark Seal Badge with Circular Cut Mark
  drawPostalCachetSeal(ctx, 185, 178, state.sendDate || 'OCT 2026', 'Cut Postal Cachet');

  // 1C. User's Selected Center Seal with Exact Shape-Aware Silhouette Cut Contour
  if (centerSeal && centerSeal.src) {
    await drawAssetWithContour(ctx, centerSeal, 310, 178, 70, centerSeal.name || 'Center Seal', 8);
  }

  // 1D, 1E, 1F. Curated & Selected Accents across Section 1 row (Balanced & Full)
  const keepsakePicks = [
    topLeft,
    bottomLeft,
    bottomRight,
    DECORATIVE_ACCENTS.find(a => a.id === 'handDrawnHeart'),
    POSTAL_STAMPS.find(s => s.id === 'cat-stamp'),
    DECORATIVE_ACCENTS.find(a => a.id === 'flower')
  ].filter(Boolean);

  // Filter out duplicates of centerSeal or activeStamp to ensure fresh variety
  const uniqueKeepsakes = [];
  for (const item of keepsakePicks) {
    if (item.id !== centerSeal?.id && item.id !== activeStamp?.id && !uniqueKeepsakes.some(u => u.id === item.id)) {
      uniqueKeepsakes.push(item);
    }
  }

  const slotXs = [435, 560, 685];
  for (let sIdx = 0; sIdx < 3 && sIdx < uniqueKeepsakes.length; sIdx++) {
    const kItem = uniqueKeepsakes[sIdx];
    await drawAssetWithContour(ctx, kItem, slotXs[sIdx], 178, 68, kItem.name, 8);
  }

  // --- SECTION 2: ADDITIONAL ARTISAN POSTAL STAMPS (SPARES) ---
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'left';
  ctx.fillText('2. BONUS VINTAGE AIRMAIL STAMPS (PRINTED WITH PERFORATED MARKS)', 45, 298);

  const otherStamps = POSTAL_STAMPS.filter(s => s.id !== activeStamp.id).slice(0, 5);
  // Evenly center 5 stamps across the 794pt width
  const stampXs = [48, 205, 362, 519, 676];
  for (let i = 0; i < otherStamps.length; i++) {
    const s = otherStamps[i];
    await drawPerforatedStamp(ctx, stampXs[i], 318, 76, 98, s, borderColor, s.name);
  }

  // --- SECTION 3: WAX SEALS, ACCENTS & CAT MASCOT (ACCURATE SHAPES) ---
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'left';
  ctx.fillText('3. ARTISAN WAX SEALS, HEARTS, RIBBONS & CAT MASCOT', 45, 482);

  // 6 artisan pieces distributed evenly across width [86 to 711] at cy = 545
  // 3A. Silk Ribbon Bow (exact bow loops, knot, and wavy cascading tails silhouette)
  const ribbonAsset = DECORATIVE_ACCENTS.find(a => a.id === 'ribbon');
  if (ribbonAsset) {
    await drawAssetWithContour(ctx, ribbonAsset, 86, 545, 72, 'Silk Bow', 8);
  }

  // 3B. Crimson Heart (exact organic tilted heart lobes and tip silhouette)
  const heartAsset = DECORATIVE_ACCENTS.find(a => a.id === 'handDrawnHeart');
  if (heartAsset) {
    await drawAssetWithContour(ctx, heartAsset, 211, 545, 68, 'Crimson Heart', 8);
  }

  // 3C. Sketch Heart (exact textured diagonal crayon sketch silhouette)
  const zzAsset = DECORATIVE_ACCENTS.find(a => a.id === 'zigzagHeart');
  if (zzAsset) {
    await drawAssetWithContour(ctx, zzAsset, 336, 545, 68, 'Sketch Heart', 8);
  }

  // 3D. Sakura Petal Cluster (exact 4-flower cluster cloud silhouette enclosing all 4 flowers)
  const flowerAsset = DECORATIVE_ACCENTS.find(a => a.id === 'botanical' || a.id === 'flower');
  if (flowerAsset) {
    await drawAssetWithContour(ctx, flowerAsset, 461, 545, 68, 'Sakura Petals', 8);
  }

  // 3E. Kitte Cat Mascot (exact cat mascot with headphones, music notes, bow, heart & star)
  const catStampAsset = POSTAL_STAMPS.find(s => s.id === 'cat-stamp');
  if (catStampAsset) {
    await drawAssetWithContour(ctx, catStampAsset, 586, 545, 74, 'Kitte Cat Mascot', 8);
  }

  // 3F. Artisan Molten Wax Seal (exact 8-lobe molten wax perimeter with monogram 'K')
  drawArtisanWaxSeal(ctx, 711, 545, 32, '#991B1B', 'K', 'Crimson Wax Seal');

  // --- SECTION 4: AIRMAIL LABELS WITH CHAMFERED NOTCHED CORNERS ---
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'left';
  ctx.fillText('4. VINTAGE AIRMAIL LABELS & ARCHIVAL CERTIFICATE POSTS', 45, 650);

  const deliveryNotice = state.deliveryDate ? `DO NOT OPEN BEFORE ${state.deliveryDate}` : "DON'T OPEN FOR 10 YEARS";
  // Row 1
  drawNotchedAirmailLabel(ctx, 45, 672, 218, 44, 'AIR MAIL / PAR AVION', 'INTERNATIONAL AIR POST', '#B91C1C', '#FFFFFF');
  drawNotchedAirmailLabel(ctx, 288, 672, 218, 44, 'TIME CAPSULE ARCHIVE', deliveryNotice, '#1A1A1A', '#FFF9C4');
  drawNotchedAirmailLabel(ctx, 531, 672, 218, 44, 'SPECIAL DELIVERY', 'HANDLE WITH PATIENCE', '#15803D', '#FFFFFF');

  // Row 2
  drawNotchedAirmailLabel(ctx, 45, 750, 218, 44, 'CONFIDENTIAL & SEALED', 'FOR RECIPIENT EYES ONLY', '#1D4ED8', '#FFFFFF');
  drawNotchedAirmailLabel(ctx, 288, 750, 218, 44, 'GENUINE AIRMAIL POST', 'OFFICIAL ARCHIVAL SEAL', '#78350F', '#FAF5EA');
  drawNotchedAirmailLabel(ctx, 531, 750, 218, 44, 'FRAGILE MEMORIES', 'PRESERVED FOR THE FUTURE', '#DB2777', '#FCE7F3');

  // --- SECTION 5: STEP-BY-STEP ASSEMBLY GUIDE ---
  ctx.save();
  ctx.translate(sheetW / 2, sheetH - 95);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-350, -35, 700, 70);
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-350, -35, 700, 70);

  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  ctx.fillText('REAL WORLD DIY KEEPSAKE ASSEMBLY GUIDE:', 0, -16);

  ctx.font = '8.5px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.85)';
  ctx.fillText('1. Print on heavy cardstock, sticker sheet, or matte photo paper at 100% scale.', 0, 2);
  ctx.fillText('2. Use precision craft scissors to cut along the accurate dashed shape outlines around stickers & stamps.', 0, 15);
  ctx.fillText('3. Apply glue stick or double-sided tape, and press firmly onto your assembled envelope!', 0, 28);
  ctx.restore();

  // Crop marks on sheet corners
  drawCropMarks(ctx, 24, 24, sheetW - 48, sheetH - 48, 1);

  ctx.restore();
  return { canvas, unitW: sheetW, unitH: sheetH };
}

/**
 * Universal Time Letter Exporter Dispatcher
 */
export async function renderTimeLetterExport(state, mode = 'borderless', includeBleed = true) {
  // 1. Pro Duplex Mode: Returns both Envelope Front & Letterhead Back for 2-page PDF / dual PNGs
  if (mode === 'duplex') {
    const envelope = await renderFoldedEnvelopeCanvas(state);
    const letter = await renderLetterheadCanvas(state);
    return {
      type: 'duplex',
      frontCanvas: envelope.canvas,
      backCanvas: letter.canvas,
      unitW: envelope.unitW,
      unitH: envelope.unitH
    };
  }

  // 2. DIY Foldable Envelope Craft Sheet (2-Page Craft Package: Page 1 Clean Net, Page 2 Assembly Guide)
  if (mode === 'fold-glue' || mode === 'envelope-craft' || state?.printMode === 'fold-glue') {
    const net = await renderCleanEnvelopeNetCanvas(state);
    const guide = await renderEnvelopeAssemblyGuideCanvas(state);
    return {
      type: 'duplex',
      frontCanvas: net.canvas,
      backCanvas: guide.canvas,
      canvas: net.canvas,
      unitW: net.unitW,
      unitH: net.unitH,
      includeBleed: true
    };
  }

  // 3. DIY Stamps & Seals Cut-Out Sheet (A4 Sheet with accurate asset-shaped cut marks)
  if (mode === 'stamps-decor' || mode === 'diy-stickers' || mode === 'diy-decorations' || state?.printMode === 'stamps-decor') {
    const sheet = await renderStampsAndDecorSheetCanvas(state);
    return {
      type: 'stamps-sheet',
      canvas: sheet.canvas,
      unitW: sheet.unitW,
      unitH: sheet.unitH,
      includeBleed: true
    };
  }

  // 4. Default: Archival Letterhead Print (Pure letter, zero white borders, zero cut marks!)
  // If the user requested envelope specifically and mode is NOT borderless:
  if (state?.exportSide === 'front' && mode !== 'borderless' && !state?.printMode) {
    const envelope = await renderFoldedEnvelopeCanvas(state, includeBleed);
    return {
      type: 'borderless',
      canvas: envelope.canvas,
      unitW: envelope.unitW,
      unitH: envelope.unitH,
      includeBleed: false
    };
  }

  // ALWAYS default to Archival Letterhead Canvas for "Letter Print"
  const letter = await renderLetterheadCanvas(state);
  return {
    type: 'borderless',
    canvas: letter.canvas,
    unitW: letter.unitW,
    unitH: letter.unitH,
    includeBleed: false
  };
}
