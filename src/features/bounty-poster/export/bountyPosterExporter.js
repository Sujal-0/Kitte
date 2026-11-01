/**
 * Production High-Resolution 300 DPI Bounty Poster Exporter
 * Procedurally renders authentic One Piece Wanted Poster matching BountyPosterCard.jsx 1:1.
 * Typography:
 *   - "WANTED", "DEAD OR ALIVE", "MARINE", Disclaimer: Libre Caslon Text
 *   - Pirate Name: OnePieceFont (vertically stretched)
 *   - Bounty Digits: Vertiky (centered with berries.webp)
 * Assets:
 *   - berries.webp for Berries symbol
 *   - s_like_struc.webp for 4 symmetrical S filigree flourishes
 */

import { DPI_SCALE, loadImage, ensureFontsLoaded } from '../../../core/print/canvasUtils';
import { drawCropMarks } from '../../../core/print/cropMarks';
import { 
  BOUNTY_POSTER_TOKENS, 
  formatBountyNumberWithGaps,
  getNameStyle,
  getBountyStyle,
  VELLUM_GRAIN_TEXTURE,
} from '../tokens/bountyTokens';

const {
  width: BASE_W,
  height: BASE_H,
  header: HEADER,
  photoFrame: FRAME,
  deadOrAlive: DEAD_OR_ALIVE,
  disclaimer: DISCLAIMER,
  marine: MARINE,
  sFlourishes: S_FLOURISHES,
  name: NAME_TOKENS,
  bounty: BOUNTY_TOKENS,
} = BOUNTY_POSTER_TOKENS;

/**
 * Draw spaced text on Canvas 2D with exact character positioning and optional stroke
 */
function drawSpacedText(ctx, text, x, y, spacing, align = 'center', stroke = false) {
  ctx.textAlign = 'left';
  const chars = text.split('');
  const charWidths = chars.map((c) => ctx.measureText(c).width);
  const totalWidth = charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * spacing;
  let startX = align === 'center' ? x - totalWidth / 2 : align === 'right' ? x - totalWidth : x;
  chars.forEach((c, idx) => {
    if (stroke) ctx.strokeText(c, startX, y);
    ctx.fillText(c, startX, y);
    startX += charWidths[idx] + spacing;
  });
}

/**
 * Draw Procedural Front Side: Authentic One Piece Wanted Poster (1:1 parity with card UI)
 */
export async function drawBountyPosterFront(ctx, state, w = BASE_W, h = BASE_H) {
  ctx.save();

  // 1. Parchment Base Background (#f2dfb8)
  ctx.fillStyle = '#f2dfb8';
  ctx.fillRect(0, 0, w, h);

  // 2. Authentic Parchment Texture, Vellum Grain & Vintage Fold Creases (Ref: AgnusDei Pen NWPbOxL)
  if (state.showPaperCreases !== false) {
    // 2A. Vellum Micro-Grain Noise Pattern (Base64 data URL)
    try {
      const vellumImg = await loadImage(VELLUM_GRAIN_TEXTURE);
      const vPattern = ctx.createPattern(vellumImg, 'repeat');
      if (vPattern) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = vPattern;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }
    } catch (e) {
      console.warn('Vellum grain pattern load error:', e);
    }

    // 2B. Authentic Multi-Angle Fold Creases (Conic Gradient)
    // NOTE: CSS conic-gradient 'from 0deg' starts at 12 o'clock (top).
    // Canvas 2D createConicGradient(startAngle) has 0 at 3 o'clock (right).
    // To match CSS 1:1, startAngle MUST be -Math.PI / 2 (-90 deg)!
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.70;
    if (typeof ctx.createConicGradient === 'function') {
      const conic = ctx.createConicGradient(-Math.PI / 2, w / 2, h / 2);
      conic.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
      conic.addColorStop(0.02, 'rgba(255, 255, 255, 0)');
      conic.addColorStop(0.24, 'rgba(255, 255, 255, 0)');
      conic.addColorStop(0.25, 'rgba(255, 255, 255, 0.14)');
      conic.addColorStop(0.2501, 'rgba(67, 50, 33, 0.12)');
      conic.addColorStop(0.27, 'rgba(0, 0, 0, 0)');
      conic.addColorStop(0.48, 'rgba(0, 0, 0, 0)');
      conic.addColorStop(0.50, 'rgba(150, 100, 50, 0.18)');
      conic.addColorStop(0.5001, 'rgba(255, 255, 255, 0.14)');
      conic.addColorStop(0.52, 'rgba(255, 255, 255, 0)');
      conic.addColorStop(0.73, 'rgba(255, 255, 255, 0)');
      conic.addColorStop(0.75, 'rgba(150, 100, 50, 0.18)');
      conic.addColorStop(0.7501, 'rgba(255, 255, 255, 0.22)');
      conic.addColorStop(0.78, 'rgba(255, 255, 255, 0)');
      conic.addColorStop(0.97, 'rgba(255, 255, 255, 0)');
      conic.addColorStop(1.0, 'rgba(150, 100, 50, 0.18)');
      ctx.fillStyle = conic;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();

    // 2C. Horizontal & Vertical Quarter-Fold Creases
    // Dark crease lines (multiply)
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.40;
    // Horizontal dark crease line
    ctx.fillStyle = 'rgba(90, 45, 10, 0.45)';
    ctx.fillRect(0, h / 2 - 0.5, w, 1.5);
    // Vertical dark crease line
    ctx.fillStyle = 'rgba(90, 45, 10, 0.45)';
    ctx.fillRect(w / 2 - 0.5, 0, 1.5, h);
    ctx.restore();

    // Highlights for the folds (source-over, screen effect)
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(0, h / 2 - 2.0, w, 1.0);
    ctx.fillRect(w / 2 - 2.0, 0, 1.0, h);
    ctx.restore();

    // 2D. Deep Edge Inset Tanning (1:1 equivalent to CSS: inset 0 0 65px rgba(143, 89, 34, 0.48), inset 0 0 115px rgba(95, 45, 10, 0.38))
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';

    // Left Edge Inset Tanning
    const gradLeft = ctx.createLinearGradient(0, 0, 85, 0);
    gradLeft.addColorStop(0, 'rgba(95, 45, 10, 0.48)');
    gradLeft.addColorStop(0.45, 'rgba(143, 89, 34, 0.28)');
    gradLeft.addColorStop(0.80, 'rgba(143, 89, 34, 0.10)');
    gradLeft.addColorStop(1, 'rgba(143, 89, 34, 0)');
    ctx.fillStyle = gradLeft;
    ctx.fillRect(0, 0, 85, h);

    // Right Edge Inset Tanning
    const gradRight = ctx.createLinearGradient(w, 0, w - 85, 0);
    gradRight.addColorStop(0, 'rgba(95, 45, 10, 0.48)');
    gradRight.addColorStop(0.45, 'rgba(143, 89, 34, 0.28)');
    gradRight.addColorStop(0.80, 'rgba(143, 89, 34, 0.10)');
    gradRight.addColorStop(1, 'rgba(143, 89, 34, 0)');
    ctx.fillStyle = gradRight;
    ctx.fillRect(w - 85, 0, 85, h);

    // Top Edge Inset Tanning
    const gradTop = ctx.createLinearGradient(0, 0, 0, 95);
    gradTop.addColorStop(0, 'rgba(95, 45, 10, 0.48)');
    gradTop.addColorStop(0.45, 'rgba(143, 89, 34, 0.28)');
    gradTop.addColorStop(0.80, 'rgba(143, 89, 34, 0.10)');
    gradTop.addColorStop(1, 'rgba(143, 89, 34, 0)');
    ctx.fillStyle = gradTop;
    ctx.fillRect(0, 0, w, 95);

    // Bottom Edge Inset Tanning
    const gradBottom = ctx.createLinearGradient(0, h, 0, h - 95);
    gradBottom.addColorStop(0, 'rgba(95, 45, 10, 0.48)');
    gradBottom.addColorStop(0.45, 'rgba(143, 89, 34, 0.28)');
    gradBottom.addColorStop(0.80, 'rgba(143, 89, 34, 0.10)');
    gradBottom.addColorStop(1, 'rgba(143, 89, 34, 0)');
    ctx.fillStyle = gradBottom;
    ctx.fillRect(0, h - 95, w, 95);

    // Four Corner Radial Burns
    const cornerRadius = 130;
    const corners = [
      [0, 0],
      [w, 0],
      [0, h],
      [w, h],
    ];
    for (const [cx, cy] of corners) {
      const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cornerRadius);
      cGrad.addColorStop(0, 'rgba(95, 45, 10, 0.35)');
      cGrad.addColorStop(0.5, 'rgba(143, 89, 34, 0.18)');
      cGrad.addColorStop(1, 'rgba(143, 89, 34, 0)');
      ctx.fillStyle = cGrad;
      ctx.fillRect(cx === 0 ? 0 : w - cornerRadius, cy === 0 ? 0 : h - cornerRadius, cornerRadius, cornerRadius);
    }

    // 2E. Center Radial Vignette (Layer 4 from UI: radial-gradient(ellipse at center, transparent 40%, rgba(143, 89, 34, 0.25) 70%, rgba(95, 45, 10, 0.55) 100%))
    ctx.globalAlpha = 0.60;
    const centerVignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.70);
    centerVignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    centerVignette.addColorStop(0.40, 'rgba(0, 0, 0, 0)');
    centerVignette.addColorStop(0.70, 'rgba(143, 89, 34, 0.25)');
    centerVignette.addColorStop(1.0, 'rgba(95, 45, 10, 0.55)');
    ctx.fillStyle = centerVignette;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }

  // 2. Header: "WANTED" (Libre Caslon Text, Extra Bold 900, 0.12em Letter Spacing, Vertically Stretched)
  ctx.save();
  ctx.translate(w / 2, HEADER.top);
  ctx.scale(HEADER.scaleX, HEADER.scaleY);
  ctx.font = `900 ${HEADER.fontSize}px "Libre Caslon Text", Georgia, serif`;
  ctx.fillStyle = '#1c1008';
  ctx.strokeStyle = '#1c1008';
  ctx.lineWidth = 1.1; // Matches WebkitTextStroke: '1.1px #1c1008'
  ctx.textBaseline = 'top';
  drawSpacedText(ctx, 'WANTED', 0, 0, 5.8, 'center', true);
  ctx.restore();

  // 3. Photo Frame Box & Image
  const px = FRAME.x;
  const py = FRAME.y;
  const pw = FRAME.w;
  const ph = FRAME.h;

  ctx.save();
  ctx.fillStyle = '#faeed8';
  ctx.fillRect(px, py, pw, ph);

  if (state.imageSrc) {
    try {
      const img = await loadImage(state.imageSrc);

      ctx.save();
      ctx.beginPath();
      ctx.rect(px, py, pw, ph);
      ctx.clip();

      const scale = state.imageScale || 1;
      const panX = ((state.imageOffsetX || 0) / 100) * pw;
      const panY = ((state.imageOffsetY || 0) / 100) * ph;

      const scaleFactor = Math.max(pw / img.width, ph / img.height) * scale;
      const drawW = img.width * scaleFactor;
      const drawH = img.height * scaleFactor;
      const drawX = px + (pw - drawW) / 2 + panX;
      const drawY = py + (ph - drawH) / 2 + panY;

      // Multiply blend allows parchment warmth to bleed through photo
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    } catch (err) {
      console.warn('Failed to render poster portrait:', err);
    }
  } else {
    // Blank Photo Box
    ctx.save();
    ctx.strokeStyle = 'rgba(28, 16, 8, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8);
    ctx.restore();
  }

  // Photo Frame Border
  ctx.strokeStyle = '#1c1008';
  ctx.lineWidth = FRAME.borderWidth || 2.5;
  ctx.strokeRect(px, py, pw, ph);
  ctx.restore();

  // 4. Middle Banner: "DEAD OR ALIVE" (Styled as: D E A D    O R    A L I V E, spans 316px edge-to-edge)
  ctx.save();
  const doaFontSize = DEAD_OR_ALIVE.fontSize || 22;
  ctx.font = `bold ${doaFontSize}px "Libre Caslon Text", Georgia, serif`;
  ctx.fillStyle = '#1c1008';
  ctx.textBaseline = 'middle';

  const wordLetterSpacing = 3.6;
  const doaCenterY = DEAD_OR_ALIVE.top + DEAD_OR_ALIVE.height / 2;

  const getWordWidth = (word) => {
    const wordChars = word.split('');
    const charW = wordChars.map((c) => ctx.measureText(c).width);
    return charW.reduce((a, b) => a + b, 0) + (wordChars.length - 1) * wordLetterSpacing;
  };

  const deadW = getWordWidth('DEAD');
  const orW = getWordWidth('OR');
  const aliveW = getWordWidth('ALIVE');

  const remainingSpace = FRAME.w - (deadW + orW + aliveW);
  const wordGap = remainingSpace / 2;

  drawSpacedText(ctx, 'DEAD', FRAME.x, doaCenterY, wordLetterSpacing, 'left');
  const orX = FRAME.x + deadW + wordGap;
  drawSpacedText(ctx, 'OR', orX, doaCenterY, wordLetterSpacing, 'left');
  const aliveX = FRAME.x + FRAME.w - aliveW;
  drawSpacedText(ctx, 'ALIVE', aliveX, doaCenterY, wordLetterSpacing, 'left');
  ctx.restore();

  // 5. Footer (Drawn first so Row 2 S-flourish overlays the disclaimer on bottom left)
  // Disclaimer: 3 lines with visible font size, letter-spaced letters, line spacing, and guaranteed separate gap before MARINE
  ctx.save();
  ctx.font = `bold ${DISCLAIMER.fontSize}px "Libre Caslon Text", Georgia, serif`;
  ctx.fillStyle = '#1c1008';
  ctx.strokeStyle = '#1c1008';
  ctx.lineWidth = 0.2;
  ctx.textBaseline = 'bottom';
  const disclaimerBottom = BASE_H - DISCLAIMER.bottom;
  const disclaimerSpacing = 0.20; // Matches letterSpacing 0.04em

  let maxLineW = 0;
  DISCLAIMER.lines.forEach((line) => {
    const chars = line.split('');
    const charW = chars.map((c) => ctx.measureText(c).width);
    const lineW = charW.reduce((a, b) => a + b, 0) + (chars.length - 1) * disclaimerSpacing;
    if (lineW > maxLineW) maxLineW = lineW;
  });

  const discScaleX = maxLineW > (DISCLAIMER.width || 205) ? (DISCLAIMER.width || 205) / maxLineW : 1.0;

  ctx.save();
  ctx.translate(DISCLAIMER.left, 0);
  ctx.scale(discScaleX, 1.0);
  DISCLAIMER.lines.forEach((line, idx) => {
    const lineY = disclaimerBottom - (DISCLAIMER.lines.length - 1 - idx) * DISCLAIMER.lineHeight;
    drawSpacedText(ctx, line, 0, lineY, disclaimerSpacing, 'left');
  });
  ctx.restore();
  ctx.restore();

  // MARINE (Placed on bottom right with dedicated separate gap from paragraph)
  ctx.save();
  const marineBottom = BASE_H - MARINE.bottom;
  ctx.translate(w - MARINE.right, marineBottom);
  ctx.scale(MARINE.scaleX || 1.0, MARINE.scaleY || 1.45);
  ctx.font = `900 ${MARINE.fontSize}px "Libre Caslon Text", Georgia, serif`;
  ctx.fillStyle = '#1c1008';
  ctx.strokeStyle = '#1c1008';
  ctx.lineWidth = 0.6;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  drawSpacedText(ctx, 'MARINE', 0, 0, 1.2, 'right');
  ctx.restore();

  // 6. Four S-Flourishes (Row 1: s_like_struc, Row 2: s_streched beside bottom disclaimer)
  try {
    const sImg1 = await loadImage(S_FLOURISHES.row1.src);
    const sImg2 = await loadImage(S_FLOURISHES.row2.src);

    // Row 1 Left (s_like_struc)
    ctx.drawImage(sImg1, S_FLOURISHES.row1.leftX, S_FLOURISHES.row1.topY, S_FLOURISHES.row1.w, S_FLOURISHES.row1.h);
    // Row 2 Left (s_streched)
    ctx.drawImage(sImg2, S_FLOURISHES.row2.leftX, S_FLOURISHES.row2.topY, S_FLOURISHES.row2.w, S_FLOURISHES.row2.h);

    // Row 1 & Row 2 Right (Mirrored)
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(sImg1, S_FLOURISHES.row1.rightX, S_FLOURISHES.row1.topY, S_FLOURISHES.row1.w, S_FLOURISHES.row1.h);
    ctx.drawImage(sImg2, S_FLOURISHES.row2.rightX, S_FLOURISHES.row2.topY, S_FLOURISHES.row2.w, S_FLOURISHES.row2.h);
    ctx.restore();
  } catch (err) {
    console.warn('Could not load S flourish assets:', err);
  }

  // 7. Pirate Name (OnePieceFont, Heavy Bold, 80% Size of Header WANTED, Horizontal Compression Only, Centered)
  const rawName = (state.name || 'ANONYMOUS').toUpperCase();
  const nameStyle = getNameStyle(rawName);

  ctx.save();
  const nameCenterX = NAME_TOKENS.left + NAME_TOKENS.width / 2;
  const nameCenterY = NAME_TOKENS.top + NAME_TOKENS.height / 2;
  ctx.translate(nameCenterX, nameCenterY);

  ctx.font = `bold ${nameStyle.fontSize}px "OnePieceFont", "Libre Caslon Text", serif`;
  const nameChars = rawName.split('');
  const nameWidths = nameChars.map((c) => ctx.measureText(c).width);
  const totalGlyphW = nameWidths.reduce((a, b) => a + b, 0);
  const totalNameW = totalGlyphW + (nameChars.length - 1) * nameStyle.canvasSpacing;

  let finalScaleX = 1.0;
  if (totalNameW > FRAME.w) {
    finalScaleX = FRAME.w / totalNameW;
  }

  ctx.scale(finalScaleX, nameStyle.scaleY);
  ctx.fillStyle = '#1c1008';
  ctx.textBaseline = 'middle';
  drawSpacedText(ctx, rawName, 0, 0, nameStyle.canvasSpacing, 'center');
  ctx.restore();

  // 8. Bounty Berries Row (Centered in 316px photo frame area, never shrinks size, compresses horizontally)
  ctx.save();
  const berryW = BOUNTY_TOKENS.berryIcon.w;
  const berryH = BOUNTY_TOKENS.berryIcon.h;
  const gap = 8;
  const bountyText = formatBountyNumberWithGaps(state.bounty);
  const bountyStyle = getBountyStyle(bountyText);

  ctx.font = `normal ${bountyStyle.fontSize}px "adamHandwriting", cursive`;
  const bChars = bountyText.split('');
  const bWidths = bChars.map((c) => ctx.measureText(c).width);
  const bTotalGlyphW = bWidths.reduce((a, b) => a + b, 0);
  const textW = bTotalGlyphW + (bChars.length - 1) * bountyStyle.canvasSpacing;
  const totalBountyRowW = berryW + gap + textW;

  let bScaleX = 1.0;
  if (totalBountyRowW > FRAME.w) {
    bScaleX = FRAME.w / totalBountyRowW;
  }

  const bountyCenterX = BOUNTY_TOKENS.left + BOUNTY_TOKENS.width / 2;
  const centerY = BOUNTY_TOKENS.top + BOUNTY_TOKENS.height / 2;

  ctx.translate(bountyCenterX, centerY);
  ctx.scale(bScaleX, 1.0);

  const rowStartX = -totalBountyRowW / 2;

  try {
    const berryImg = await loadImage('/assets/berries.webp');
    ctx.drawImage(berryImg, rowStartX, -berryH / 2, berryW, berryH);
  } catch {
    ctx.font = '24px "Libre Caslon Text", Georgia, serif';
    ctx.fillStyle = '#1c1008';
    ctx.fillText('฿', rowStartX, 0);
  }

  ctx.font = `normal ${bountyStyle.fontSize}px "adamHandwriting", cursive`;
  ctx.fillStyle = '#1c1008';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  drawSpacedText(ctx, bountyText, rowStartX + berryW + gap, 0, bountyStyle.canvasSpacing, 'left');
  ctx.restore();

  ctx.restore();
}

/**
 * Universal Single-Sided Bounty Poster Export
 * Generates high-res 300 DPI canvas for 1-page A4 / A3 poster print and single PNG.
 */
export async function renderBountyPosterExport(state, mode = 'single', includeBleed = false) {
  await ensureFontsLoaded();

  const w = BASE_W; // 408
  const h = BASE_H; // 600
  const scale = DPI_SCALE; // 4x for 300 DPI high-resolution (1632 x 2400)

  const isA4Sheet = mode === 'a4-sheet' || (includeBleed === true && mode !== 'borderless');
  const margin = isA4Sheet ? 25 : 0;
  const canvasW = (w + margin * 2) * scale;
  const canvasH = (h + margin * 2) * scale;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');

  if (margin > 0) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  ctx.save();
  if (margin > 0) ctx.translate(margin * scale, margin * scale);
  ctx.scale(scale, scale);
  await drawBountyPosterFront(ctx, state, w, h);
  ctx.restore();

  if (isA4Sheet && margin > 0) {
    drawCropMarks(ctx, margin * scale, margin * scale, w * scale, h * scale, scale);
  }

  return {
    type: isA4Sheet ? 'a4-sheet' : 'single',
    canvas,
    combinedCanvas: canvas,
    unitW: w,
    unitH: h,
    includeBleed: isA4Sheet,
  };
}
