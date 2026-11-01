/**
 * This & That (Stray Kids theme) Canvas 2D Exporter
 * Renders physical This & That ID card front and back with 1:1 pixel parity to React preview.
 */

import { loadImage, drawPaperGrain } from '../../../core/print/canvasUtils';
import { THIS_AND_THAT_TOKENS, generateDiamondPositions } from '../tokens/thisAndThatTokens';

const BARCODE_PATTERN = [
  3, 1, 1, 2, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 1, 2, 2, 1, 3, 1, 1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 3
];

/**
 * Draw 4 hazard stripes at corner
 */
function drawHazardStripes(ctx, startX, startY, isRight = false) {
  ctx.save();
  ctx.fillStyle = THIS_AND_THAT_TOKENS.colors.orange;
  const count = 4;
  const stripeW = 5;
  const stripeH = 26;
  const gap = 6;
  const skew = isRight ? 0.45 : -0.45;

  for (let i = 0; i < count; i++) {
    const x = isRight ? startX - i * (stripeW + gap) : startX + i * (stripeW + gap);
    ctx.save();
    ctx.translate(x, startY);
    ctx.transform(1, 0, skew, 1, 0, 0);
    ctx.fillRect(0, 0, stripeW, stripeH);
    ctx.restore();
  }
  ctx.restore();
}

/**
 * Draw single nested diamond icon
 */
function drawNestedDiamond(ctx, cx, cy, size = 14, cardBg = '#F3EEDA') {
  const half = size / 2;
  const innerHalf = half * 0.50;

  // Outer black diamond
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - half);
  ctx.lineTo(cx + half, cy);
  ctx.lineTo(cx, cy + half);
  ctx.lineTo(cx - half, cy);
  ctx.closePath();
  ctx.fillStyle = '#1A1A1A';
  ctx.fill();

  // Inner hollow diamond
  ctx.beginPath();
  ctx.moveTo(cx, cy - innerHalf);
  ctx.lineTo(cx + innerHalf, cy);
  ctx.lineTo(cx, cy + innerHalf);
  ctx.lineTo(cx - innerHalf, cy);
  ctx.closePath();
  ctx.fillStyle = cardBg;
  ctx.fill();
  ctx.restore();
}

/**
 * Draw diamond perimeter border on card back (Pixel-perfect matching React component)
 */
function drawDiamondPerimeter(ctx, w = 760, h = 480, cardBg = '#F3EEDA') {
  const positions = generateDiamondPositions(w, h);
  for (const pos of positions) {
    drawNestedDiamond(ctx, pos.x, pos.y, 14, cardBg);
  }
}

/**
 * Draw This & That Card Front
 */
export async function drawThisAndThatFront(ctx, state, w = 760, h = 480) {
  ctx.save();

  const cardBg = state.colorTheme || THIS_AND_THAT_TOKENS.card.defaultBg;

  // 1. Card Base with rounded corners
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, THIS_AND_THAT_TOKENS.card.radius);
  ctx.fillStyle = cardBg;
  ctx.fill();
  ctx.clip();

  // 2. Paper Grain / Noise
  try {
    const noiseImg = await loadImage('/assets/noise.png');
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(noiseImg, 0, 0, w, h);
    ctx.restore();
  } catch {
    drawPaperGrain(ctx, w, h);
  }

  // 3. Card Outer Border (3px solid #1A1A1A)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(1.5, 1.5, w - 3, h - 3, THIS_AND_THAT_TOKENS.card.radius);
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 4. Corner Orange Hazard Stripes
  drawHazardStripes(ctx, 22, 14, false); // top-left
  drawHazardStripes(ctx, w - 22, 14, true); // top-right

  // 5. Top-Left SKZ Emblem Asset (User requested skz.webp instead of blue pill)
  try {
    const skzTopLeft = await loadImage('/assets/skz.webp');
    ctx.save();
    ctx.translate(88, 38);
    ctx.rotate(-4 * Math.PI / 180);
    ctx.globalAlpha = 0.90;
    ctx.globalCompositeOperation = 'multiply';
    const sW = 48;
    const sH = sW * (skzTopLeft.height / skzTopLeft.width);
    ctx.drawImage(skzTopLeft, -sW / 2, -sH / 2, sW, sH);
    ctx.restore();
  } catch {
    // fallback
  }

  // 6. Vertical Dashed Divider
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.45)';
  ctx.lineWidth = 2;
  ctx.moveTo(288, 38);
  ctx.lineTo(288, 442);
  ctx.stroke();
  ctx.restore();

  // 7. Left Column: Photo Box + GAP + Orange Bar + Real Barcode UI
  const photoX = 48;
  const photoY = 64;
  const photoW = 224;
  const photoH = 235;

  // Photo Outer Frame with complete 4px border
  ctx.save();
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(photoX - 4, photoY - 4, photoW + 8, photoH + 8);
  ctx.restore();

  if (state.imageSrc) {
    try {
      const userImg = await loadImage(state.imageSrc);
      ctx.save();
      ctx.beginPath();
      ctx.rect(photoX, photoY, photoW, photoH);
      ctx.clip();

      const imgRatio = userImg.width / userImg.height;
      const boxRatio = photoW / photoH;
      let baseW, baseH;
      if (imgRatio > boxRatio) {
        baseH = photoH;
        baseW = photoH * imgRatio;
      } else {
        baseW = photoW;
        baseH = photoW / imgRatio;
      }

      const imgScale = state.imageScale || 1;
      const finalW = baseW * imgScale;
      const finalH = baseH * imgScale;
      const offX = ((state.imageOffsetX || 0) / 100) * photoW;
      const offY = ((state.imageOffsetY || 0) / 100) * photoH;
      const centerX = photoX + photoW / 2 + offX;
      const centerY = photoY + photoH / 2 + offY;

      ctx.drawImage(userImg, centerX - finalW / 2, centerY - finalH / 2, finalW, finalH);
      ctx.restore();
    } catch {
      ctx.save();
      ctx.fillStyle = '#E5E0D8';
      ctx.fillRect(photoX, photoY, photoW, photoH);
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#737373';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SUBMIT PHOTO', photoX + photoW / 2, photoY + photoH / 2);
      ctx.restore();
    }
  } else {
    ctx.save();
    ctx.fillStyle = '#E5E0D8';
    ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#737373';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SUBMIT PHOTO', photoX + photoW / 2, photoY + photoH / 2);
    ctx.restore();
  }

  // GAP (10px) between Photo Box and Orange Bar
  const barY = photoY + photoH + 10;
  const barH = 28;

  // Solid Orange Bar ("STRAY KIDS")
  ctx.save();
  ctx.fillStyle = THIS_AND_THAT_TOKENS.colors.orange;
  ctx.fillRect(photoX, barY, photoW, barH);
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 2;
  ctx.strokeRect(photoX, barY, photoW, barH);

  ctx.font = 'bold 16px "creative", Impact, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('STRAY KIDS', photoX + photoW / 2, barY + barH / 2 + 1);
  ctx.restore();

  // Real Barcode UI & Teal diagonal slashes (Positioned at bottom of left column matching UI)
  const bcY = 406;
  const totalBcW = 172;
  const sumBars = BARCODE_PATTERN.reduce((a, b) => a + b, 0);
  const numGaps = BARCODE_PATTERN.length - 1;
  const barGap = Math.max(1, (totalBcW - sumBars) / numGaps);

  ctx.save();
  ctx.fillStyle = '#1A1A1A';
  let curBx = photoX;
  BARCODE_PATTERN.forEach((bw) => {
    ctx.fillRect(curBx, bcY, bw, 36);
    curBx += bw + barGap;
  });

  // Teal hashes next to barcode
  ctx.font = '900 16px "JetBrains Mono", monospace';
  ctx.fillStyle = THIS_AND_THAT_TOKENS.colors.teal;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('///', photoX + photoW - 24, bcY + 18);
  ctx.restore();

  // 8. Right Column: Stray Kids Watermark Stamp
  try {
    const skzStampImg = await loadImage('/assets/straykids.webp');
    ctx.save();
    ctx.translate(560, 240);
    ctx.rotate(-7 * Math.PI / 180);
    ctx.globalAlpha = 0.18;
    ctx.globalCompositeOperation = 'multiply';
    const stampW = 280;
    const stampH = stampW * (skzStampImg.height / skzStampImg.width);
    ctx.drawImage(skzStampImg, -stampW / 2, -stampH / 2, stampW, stampH);
    ctx.restore();
  } catch {
    // ignore
  }

  // 9. Header: "THIS & THAT" with Adam Ampersand & Equal Sizing
  const headX = 325;
  const headY = 76;

  ctx.save();
  // "THIS" (matching visual height to "THAT", 48px)
  ctx.font = '900 48px Impact, "Arial Black", sans-serif';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('THIS', headX, headY);

  const thisW = ctx.measureText('THIS').width;

  // "&" circled with sketchy adamHandwriting font
  const circleCX = headX + thisW + 24;
  const circleCY = headY - 15;
  ctx.beginPath();
  ctx.arc(circleCX, circleCY, 16, 0, Math.PI * 2);
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.font = '24px "adamHandwriting", "Patrick Hand", cursive';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('&', circleCX, circleCY);

  // "THAT" in creative font (matching visual height 48px)
  ctx.save();
  ctx.translate(circleCX + 24, headY);
  ctx.rotate(-1 * Math.PI / 180);
  ctx.font = 'bold 48px "creative", Impact, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('THAT', 0, 0);
  ctx.restore();

  // Subtitle: "IDENTIFICATION DOCUMENT" (Explicitly left-aligned under THIS with letter-spacing)
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  if ('letterSpacing' in ctx) {
    ctx.letterSpacing = '2.6px';
  }
  ctx.fillStyle = THIS_AND_THAT_TOKENS.colors.orange;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('IDENTIFICATION DOCUMENT', headX, headY + 14);
  if ('letterSpacing' in ctx) {
    ctx.letterSpacing = '0px';
  }

  // Teal Horizontal Line + hashes
  ctx.beginPath();
  ctx.moveTo(headX, headY + 36);
  ctx.lineTo(headX + 355, headY + 36);
  ctx.strokeStyle = THIS_AND_THAT_TOKENS.colors.teal;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = '900 12px "JetBrains Mono", monospace';
  ctx.fillStyle = THIS_AND_THAT_TOKENS.colors.teal;
  ctx.textBaseline = 'middle';
  ctx.fillText('//', headX + 365, headY + 36);
  ctx.restore();

  // 10. Form Fields
  const defaults = THIS_AND_THAT_TOKENS.showcaseDefaults;
  const nameVal = state.issuedTo || defaults.name;
  const occupancyVal = state.occupancy || defaults.occupancy;
  const dateVal = state.dateOfIssue || defaults.dateOfIssue;
  const idNumVal = state.idNumber || defaults.idNumber;

  // NAME
  ctx.save();
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'left';
  ctx.fillText('NAME', headX, 155);

  // Name Box
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 2;
  ctx.strokeRect(headX, 163, 380, 40);

  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.fillText(nameVal, headX + 12, 189);

  // OCCUPANCY
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.75)';
  ctx.fillText('OCCUPANCY', headX, 226);

  ctx.font = '900 16px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.fillText(occupancyVal, headX, 246);

  // DATE OF ISSUE
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.75)';
  ctx.fillText('DATE OF ISSUE', headX, 280);

  ctx.font = '900 16px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.fillText(dateVal, headX, 300);
  ctx.restore();

  // 11. Top Dashed Border above Bottom Barcode Value UI (Moved up at y=372 to clear cat asset)
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.40)';
  ctx.lineWidth = 2;
  ctx.moveTo(headX, 372);
  ctx.lineTo(headX + 380, 372);
  ctx.stroke();
  ctx.restore();

  // 12. Bottom Barcode Value Details & Assets
  // Orange dash
  ctx.save();
  ctx.fillStyle = THIS_AND_THAT_TOKENS.colors.orange;
  ctx.fillRect(headX, 426, 30, 8);

  // 7 teal slashes
  ctx.font = '900 13px "JetBrains Mono", monospace';
  ctx.fillStyle = THIS_AND_THAT_TOKENS.colors.teal;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('///////', headX + 38, 430);

  // Barcode Code SKZ-080726
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.fillText(idNumVal, headX + 115, 430);
  ctx.restore();

  // Bottom-Right Assets: skz.webp and cat-bottomRight.webp
  try {
    const skzLogo = await loadImage('/assets/skz.webp');
    ctx.save();
    ctx.translate(585, 424);
    ctx.rotate(-6 * Math.PI / 180);
    ctx.globalAlpha = 0.85;
    ctx.globalCompositeOperation = 'multiply';
    const skzW = 52;
    const skzH = skzW * (skzLogo.height / skzLogo.width);
    ctx.drawImage(skzLogo, -skzW / 2, -skzH / 2, skzW, skzH);
    ctx.restore();
  } catch {
    // ignore
  }

  try {
    const catImg = await loadImage('/assets/cat-bottomRight.webp');
    ctx.save();
    ctx.translate(668, 422);
    ctx.rotate(3 * Math.PI / 180);
    const catW = 74;
    const catH = catW * (catImg.height / catImg.width);
    ctx.drawImage(catImg, -catW / 2, -catH / 2, catW, catH);
    ctx.restore();
  } catch {
    // ignore
  }

  ctx.restore();
}

/**
 * Draw This & That Card Back (Canvas 2D is 100% unmirrored)
 */
export async function drawThisAndThatBack(ctx, state, w = 760, h = 480) {
  ctx.save();

  const cardBg = state.colorTheme || THIS_AND_THAT_TOKENS.card.defaultBg;

  // 1. Card Base with rounded corners
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, THIS_AND_THAT_TOKENS.card.radius);
  ctx.fillStyle = cardBg;
  ctx.fill();
  ctx.clip();

  // 2. Paper Grain / Noise
  try {
    const noiseImg = await loadImage('/assets/noise.png');
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(noiseImg, 0, 0, w, h);
    ctx.restore();
  } catch {
    drawPaperGrain(ctx, w, h);
  }

  // 3. Card Outer Border (3px solid #1A1A1A)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(1.5, 1.5, w - 3, h - 3, THIS_AND_THAT_TOKENS.card.radius);
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 4. Perimeter Diamond Border
  drawDiamondPerimeter(ctx, w, h, cardBg);

  // 5. Center Huge Tilted Watermark: "THIS & THAT" with Sketchy Adam Ampersand
  ctx.save();
  ctx.translate(380, 240);
  ctx.rotate(-14 * Math.PI / 180);
  ctx.globalAlpha = 0.40;

  ctx.font = '900 74px Impact, "Arial Black", sans-serif';
  ctx.fillStyle = THIS_AND_THAT_TOKENS.colors.tanWatermark;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('THIS', -180, 0);

  const tW = ctx.measureText('THIS').width;
  const cX = -180 + tW + 36;
  const cY = -24;

  ctx.beginPath();
  ctx.arc(cX, cY, 26, 0, Math.PI * 2);
  ctx.strokeStyle = THIS_AND_THAT_TOKENS.colors.tanWatermark;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.font = '36px "adamHandwriting", "Patrick Hand", cursive';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('&', cX, cY);

  ctx.font = 'bold 74px "creative", Impact, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('THAT', cX + 40, 0);
  ctx.restore();

  // 6. Top Section
  // Top-Left: IDENTITY CARD / STRAY KIDS
  ctx.save();
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('IDENTITY CARD', 58, 52);

  ctx.font = 'bold 24px "creative", Impact, sans-serif';
  ctx.fillText('STRAY KIDS', 58, 70);

  // Top-Right: Certification Paragraph
  const certLines = [
    'This is to certify that the person',
    'named and described above is',
    'declared to be one and only mine.'
  ];
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  let certY = 52;
  certLines.forEach(line => {
    ctx.fillText(line, 702, certY);
    certY += 18;
  });
  ctx.restore();

  // 7. Middle straykids.webp watermark (Shifted further to right side behind text)
  try {
    const strayImg = await loadImage('/assets/straykids.webp');
    ctx.save();
    ctx.translate(585, 145);
    ctx.rotate(-4 * Math.PI / 180);
    ctx.globalAlpha = 0.20;
    ctx.globalCompositeOperation = 'multiply';
    const sW = 230;
    const sH = sW * (strayImg.height / strayImg.width);
    ctx.drawImage(strayImg, -sW / 2, -sH / 2, sW, sH);
    ctx.restore();
  } catch {
    // ignore
  }

  // 8. 4 Dotted Ruled Lines across the bottom half
  const lineYs = [225, 275, 325, 375];
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([2, 4]);
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.70)';
  ctx.lineWidth = 1.5;
  lineYs.forEach(ly => {
    ctx.moveTo(58, ly);
    ctx.lineTo(702, ly);
  });
  ctx.stroke();

  // Handwritten note on line 2 if available (rendered in adamHandwriting)
  const noteText = state.note || (state.isShowcase ? THIS_AND_THAT_TOKENS.showcaseDefaults.note : '');
  if (noteText) {
    ctx.font = 'bold 20px "adamHandwriting", "Patrick Hand", cursive';
    ctx.fillStyle = '#1A1A1A';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(noteText, 66, 268);
  }
  ctx.restore();

  // 9. Bottom Assets: SKZ Stamp (left) & Guitar Cat (right)
  try {
    const skzStamp = await loadImage('/assets/skz.webp');
    ctx.save();
    ctx.translate(95, 412);
    ctx.rotate(-6 * Math.PI / 180);
    ctx.globalAlpha = 0.85;
    ctx.globalCompositeOperation = 'multiply';
    const sW = 68;
    const sH = sW * (skzStamp.height / skzStamp.width);
    ctx.drawImage(skzStamp, -sW / 2, -sH / 2, sW, sH);
    ctx.restore();
  } catch {
    // ignore
  }

  try {
    const catBack = await loadImage('/assets/cat-bottomRight.webp');
    ctx.save();
    ctx.translate(662, 412);
    ctx.rotate(4 * Math.PI / 180);
    const cW = 82;
    const cH = cW * (catBack.height / catBack.width);
    ctx.drawImage(catBack, -cW / 2, -cH / 2, cW, cH);
    ctx.restore();
  } catch {
    // ignore
  }

  ctx.restore();
}
