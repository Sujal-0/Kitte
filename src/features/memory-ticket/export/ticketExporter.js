/**
* Memory Ticket Canvas 2D Exporter
* Renders physical Ticket Stub front and back sides matching MemoryTicketStudio
*/

import { getTicketPath, getPerforationLine } from '../../../components/studio/MemoryTicketStudio/TicketShapes';
import { DPI_SCALE, loadImage, mapFont, wrapText, drawSVGPath } from '../../../core/print/canvasUtils';
import { drawCropMarks } from '../../../core/print/cropMarks';

const BARCODE_PATTERN = [3, 1, 1, 2, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 1, 2, 2, 1, 3, 1, 1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 3];

/**
 * Draw the photo frame with exact UI proportions and inner image padding.
 */
export async function drawPhotoFrame(ctx, state, frameX, frameY, frameW, frameH, bodyFont) {
  // 1. Outer Polaroid / card frame box
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(frameX, frameY, frameW, frameH);
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 2;
  ctx.strokeRect(frameX, frameY, frameW, frameH);

  // 2. Inner padding (matching style={{ padding: `${state.imagePadding}px` }} inside border-2)
  const pad = state.imagePadding !== undefined ? state.imagePadding : 8;
  const borderInset = 2;
  const boxX = frameX + borderInset + pad;
  const boxY = frameY + borderInset + pad;
  const boxW = Math.max(1, frameW - (borderInset + pad) * 2);
  const boxH = Math.max(1, frameH - (borderInset + pad) * 2);

  if (state.imageSrc) {
    try {
      const img = await loadImage(state.imageSrc);

      ctx.save();
      ctx.beginPath();
      ctx.rect(boxX, boxY, boxW, boxH);
      ctx.clip();

      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;
      const imgRatio = naturalW / naturalH;
      const boxRatio = boxW / boxH;
      const fitMode = state.imageFit || 'cover';

      let renderedW, renderedH;
      if (fitMode === 'contain') {
        if (imgRatio > boxRatio) {
          renderedW = boxW;
          renderedH = boxW / imgRatio;
        } else {
          renderedH = boxH;
          renderedW = boxH * imgRatio;
        }
      } else {
        // cover
        if (imgRatio > boxRatio) {
          renderedH = boxH;
          renderedW = boxH * imgRatio;
        } else {
          renderedW = boxW;
          renderedH = boxW / imgRatio;
        }
      }

      const scale = state.imageScale || 1;
      const dw = renderedW * scale;
      const dh = renderedH * scale;

      const tx = ((state.imageOffsetX || 0) / 100) * boxW;
      const ty = ((state.imageOffsetY || 0) / 100) * boxH;

      const centerX = boxX + boxW / 2 + tx * scale;
      const centerY = boxY + boxH / 2 + ty * scale;

      const dx = centerX - dw / 2;
      const dy = centerY - dh / 2;

      ctx.filter = 'contrast(1.25) saturate(0.5) sepia(0.2)';
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.filter = 'none';
      ctx.restore();
    } catch {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(boxX, boxY, boxW, boxH);
    }
  } else {
    // Empty state placeholder
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = 'rgba(26, 26, 26, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.setLineDash([]);
    ctx.font = `bold 16px ${bodyFont}`;
    ctx.fillStyle = 'rgba(26, 26, 26, 0.5)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SUBMIT PHOTO', boxX + boxW / 2, boxY + boxH / 2);
  }
}

/**
 * Draw Location and Date matching UI placement.
 */
export function drawLocationDate(ctx, state, x, y, width, bodyFont) {
  // LOCATION (left)
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.45)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('LOCATION', x, y);

  ctx.font = `bold 18px ${bodyFont}`;
  ctx.fillStyle = '#1A1A1A';
  ctx.fillText(state.location || '...', x, y + 14);

  // DATE (right)
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.45)';
  ctx.textAlign = 'right';
  ctx.fillText('DATE', x + width, y);

  ctx.font = `16px ${bodyFont}`;
  ctx.fillStyle = '#1A1A1A';
  ctx.fillText(state.date || '...', x + width, y + 14);
}

/**
 * Draw evenly distributed barcode matching CSS flex w-[90%] justify-between.
 */
export function drawBarcode(ctx, leftX, topY, totalW, barH) {
  const sumBars = BARCODE_PATTERN.reduce((a, b) => a + b, 0); // 56
  const numGaps = BARCODE_PATTERN.length - 1; // 30
  const gap = Math.max(1, (totalW - sumBars) / numGaps);

  let curX = leftX;
  ctx.fillStyle = '#1A1A1A';
  BARCODE_PATTERN.forEach((bw) => {
    ctx.fillRect(curX, topY, bw, barH);
    curX += bw + gap;
  });
}

/**
 * Draw Front Stub (Admit One, barcode, barcode number) matching UI.
 */
export function drawFrontStub(ctx, state, cx, cy, bodyFont, isHoriz) {
  ctx.save();
  ctx.translate(cx, cy);
  if (isHoriz) ctx.rotate(-Math.PI / 2);

  const barcodeW = isHoriz ? 180 : 225;
  const barcodeH = isHoriz ? 28 : 32;

  // "ADMIT ONE" with top & bottom border lines (matching UI border-y border-black/20)
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.6)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ADMIT ONE', 0, -28);

  const labelW = ctx.measureText('ADMIT ONE').width + 12;
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-labelW / 2, -35);
  ctx.lineTo(labelW / 2, -35);
  ctx.moveTo(-labelW / 2, -21);
  ctx.lineTo(labelW / 2, -21);
  ctx.stroke();

  // Full-width barcode
  drawBarcode(ctx, -barcodeW / 2, -barcodeH / 2 - 2, barcodeW, barcodeH);

  // Barcode Number
  ctx.font = `bold 28px ${bodyFont}`;
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.barcodeValue ? state.barcodeValue.split('-')[1] : '0000', 0, 30);

  ctx.restore();
}

/**
 * Draw Back Stub (Barcode and barcode value) matching UI.
 */
export function drawBackStub(ctx, state, cx, cy, isHoriz) {
  ctx.save();
  ctx.translate(cx, cy);
  if (isHoriz) ctx.rotate(-Math.PI / 2);

  const barcodeW = isHoriz ? 180 : 225;
  const barcodeH = isHoriz ? 42 : 46;

  // Full-width barcode
  drawBarcode(ctx, -barcodeW / 2, -barcodeH / 2 - 8, barcodeW, barcodeH);

  // Barcode value
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(state.barcodeValue || 'KITTE-0000', 0, 20);

  ctx.restore();
}

/**
 * Draw the front side of a Memory Ticket (ZERO SHADOW, pure artifact).
 */
export async function drawTicketFront(ctx, state, w, h, isHoriz, strokeW) {
  const pathData = getTicketPath(state.shape, w, h, isHoriz, strokeW);
  const perf = getPerforationLine(state.shape, w, h, isHoriz, strokeW);
  const split = isHoriz ? w * 0.75 : h * 0.75;
  const bodyFont = mapFont(state.fontFamily);

  // 1. Draw paper base (NO SHADOW)
  drawSVGPath(ctx, pathData);
  ctx.fillStyle = state.color || '#ffffff';
  ctx.fill();

  if (strokeW > 0) {
    drawSVGPath(ctx, pathData);
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = strokeW;
    ctx.stroke();
  }

  // 2. Clip to ticket shape for inner content
  ctx.save();
  drawSVGPath(ctx, pathData);
  ctx.clip();

  // 3. Perforation line
  ctx.beginPath();
  ctx.moveTo(perf.x1, perf.y1);
  ctx.lineTo(perf.x2, perf.y2);
  ctx.setLineDash(state.shape === 'cinema' ? [4, 8] : [8, 8]);
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.setLineDash([]);

  // 4. FRONT BODY LAYOUT
  if (isHoriz) {
    // HORIZONTAL (w = 500, h = 250, split = 375)
    const padTop = 18;
    const padLeft = 18;

    const frameW = 320;
    const frameH = 168;
    const frameX = padLeft;
    const frameY = padTop;

    // Draw Photo Box Frame
    await drawPhotoFrame(ctx, state, frameX, frameY, frameW, frameH, bodyFont);

    // Location & Date Bar
    const detailY = frameY + frameH + 8;
    drawLocationDate(ctx, state, frameX, detailY, frameW, bodyFont);

    // FRONT STUB (Horizontal, Rotated)
    const stubW = w - split; // 125
    const stubCX = split + stubW / 2; // 437.5
    const stubCY = h / 2; // 125
    drawFrontStub(ctx, state, stubCX, stubCY, bodyFont, true);
  } else {
    // VERTICAL (w = 250, h = 500, split = 375)
    const padTop = 18;
    const padSide = 18;
    const frameX = padSide;
    const frameY = padTop;
    const frameW = w - padSide * 2; // 214
    const frameH = 256; // Exact UI height

    // Draw Photo Box Frame
    await drawPhotoFrame(ctx, state, frameX, frameY, frameW, frameH, bodyFont);

    // Location & Date Bar
    const detailY = frameY + frameH + 8; // 282
    drawLocationDate(ctx, state, frameX, detailY, frameW, bodyFont);

    // FRONT STUB (Vertical, Upright, centered in stub area)
    const stubCY = 432;
    drawFrontStub(ctx, state, w / 2, stubCY, bodyFont, false);
  }

  ctx.restore(); // restore clip
}

/**
 * Draw the back side of a Memory Ticket (ZERO SHADOW, 100% UPRIGHT TEXT).
 * When in Fold & Glue mode, the ticket shape is horizontally mirrored (mirrorW = w)
 * so that when folded along the vertical crease, cuts and teeth align 100%.
 */
export async function drawTicketBack(ctx, state, w, h, isHoriz, strokeW, isFoldGlue = true) {
  const pathData = getTicketPath(state.shape, w, h, isHoriz, strokeW);
  const perf = getPerforationLine(state.shape, w, h, isHoriz, strokeW);
  const split = isHoriz ? w * 0.75 : h * 0.75;
  const bodyFont = mapFont(state.fontFamily);

  // In Fold & Glue mode, always mirror the path across W so cuts match when folded
  const mirrorW = isFoldGlue ? w : (isHoriz ? w : 0);

  // 1. Draw paper base (NO SHADOW)
  drawSVGPath(ctx, pathData, mirrorW);
  ctx.fillStyle = state.color || '#ffffff';
  ctx.fill();

  if (strokeW > 0) {
    drawSVGPath(ctx, pathData, mirrorW);
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = strokeW;
    ctx.stroke();
  }

  // 2. Clip to ticket shape
  ctx.save();
  drawSVGPath(ctx, pathData, mirrorW);
  ctx.clip();

  // 3. Perforation line
  ctx.beginPath();
  if (isHoriz) {
    const perfX = isFoldGlue ? (w - split) : split;
    ctx.moveTo(perfX, perf.y1);
    ctx.lineTo(perfX, perf.y2);
  } else {
    ctx.moveTo(perf.x1, perf.y1);
    ctx.lineTo(perf.x2, perf.y2);
  }
  ctx.setLineDash(state.shape === 'cinema' ? [4, 8] : [8, 8]);
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.setLineDash([]);

  // 4. BACK BODY & STUB
  if (isHoriz) {
    // HORIZONTAL (w = 500, h = 250)
    const stubW = w - split; // 125
    const bodyX = isFoldGlue ? (stubW + 18) : 18;
    const bodyW = split - 36; // 339
    const bodyY = 18;
    const bodyH = h - 36;

    // Watermark
    if (state.showLogo) {
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.font = `bold 100px ${bodyFont}`;
      ctx.fillStyle = '#1A1A1A';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.translate(bodyX + bodyW / 2, bodyY + bodyH / 2);
      ctx.rotate(-0.15);
      ctx.fillText('切手', 0, 0);
      ctx.restore();
    }

    // Memory Note Header
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(26, 26, 26, 0.45)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('MEMORY NOTE', bodyX, bodyY);

    ctx.beginPath();
    ctx.moveTo(bodyX, bodyY + 14);
    ctx.lineTo(bodyX + bodyW, bodyY + 14);
    ctx.strokeStyle = 'rgba(26, 26, 26, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Note text
    ctx.font = `14px ${bodyFont}`;
    ctx.fillStyle = '#1A1A1A';
    wrapText(ctx, state.note || 'No notes left behind...', bodyX, bodyY + 24, bodyW, 20);

    // Signature
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(26, 26, 26, 0.45)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('AUTHORISED BY', bodyX + bodyW, bodyY + bodyH - 24);

    ctx.font = `bold 22px ${bodyFont}`;
    ctx.fillStyle = '#1A1A1A';
    ctx.fillText(state.signature || 'Anonymous', bodyX + bodyW, bodyY + bodyH);

    // Back Stub
    const stubCX = isFoldGlue ? (stubW / 2) : (split + stubW / 2);
    const stubCY = h / 2;
    drawBackStub(ctx, state, stubCX, stubCY, true);
  } else {
    // VERTICAL (w = 250, h = 500, split = 375)
    const padTop = 18;
    const padSide = 18;
    const bodyX = padSide;
    const bodyY = padTop;
    const bodyW = w - padSide * 2; // 214

    // Watermark
    if (state.showLogo) {
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.font = `bold 120px ${bodyFont}`;
      ctx.fillStyle = '#1A1A1A';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.translate(w / 2, split / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('切手', 0, 0);
      ctx.restore();
    }

    // Memory Note Header
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(26, 26, 26, 0.45)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('MEMORY NOTE', bodyX, bodyY);

    ctx.beginPath();
    ctx.moveTo(bodyX, bodyY + 14);
    ctx.lineTo(bodyX + bodyW, bodyY + 14);
    ctx.strokeStyle = 'rgba(26, 26, 26, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Note text
    ctx.font = `14px ${bodyFont}`;
    ctx.fillStyle = '#1A1A1A';
    wrapText(ctx, state.note || 'No notes left behind...', bodyX, bodyY + 24, bodyW, 20);

    // Signature (well above perforation line at 375)
    const sigY = split - 16;
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(26, 26, 26, 0.45)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('AUTHORISED BY', bodyX + bodyW, sigY - 26);

    ctx.font = `bold 22px ${bodyFont}`;
    ctx.fillStyle = '#1A1A1A';
    ctx.fillText(state.signature || 'Anonymous', bodyX + bodyW, sigY);

    // Back Stub (below perforation line at 375)
    const stubCY = 432;
    drawBackStub(ctx, state, w / 2, stubCY, false);
  }

  ctx.restore(); // restore clip
}

/**
 * Render complete Memory Ticket canvas for export.
 */
export async function renderTicketExport(state, mode = 'fold-glue', includeBleed = true) {
  const isHoriz = state.layout === 'horizontal';
  const w = isHoriz ? 500 : 250;
  const h = isHoriz ? 250 : 500;
  const scale = DPI_SCALE;
  const margin = includeBleed ? 35 : 12;
  const gap = 24;

  let strokeW = 0;
  if (state.border === 'thick') strokeW = 6;
  if (state.border === 'thin') strokeW = 2;

  if (mode === 'duplex') {
    // Exact zero-margin ticket bounds when includeBleed is false, or 35px margin with crop marks when true
    const cardMargin = includeBleed ? 35 : 0;
    const cardCanvasW = (w + cardMargin * 2) * scale;
    const cardCanvasH = (h + cardMargin * 2) * scale;

    // Page 1: Front (100% transparent canvas outside ticket shape)
    const frontCanvas = document.createElement('canvas');
    frontCanvas.width = cardCanvasW;
    frontCanvas.height = cardCanvasH;
    const fCtx = frontCanvas.getContext('2d');
    fCtx.save();
    if (cardMargin > 0) {
      fCtx.translate(cardMargin * scale, cardMargin * scale);
    }
    fCtx.scale(scale, scale);
    await drawTicketFront(fCtx, state, w, h, isHoriz, strokeW);
    fCtx.restore();
    if (includeBleed && cardMargin > 0) {
      drawCropMarks(fCtx, cardMargin * scale, cardMargin * scale, w * scale, h * scale, scale);
    }

    // Page 2: Back (100% transparent canvas outside ticket shape)
    const backCanvas = document.createElement('canvas');
    backCanvas.width = cardCanvasW;
    backCanvas.height = cardCanvasH;
    const bCtx = backCanvas.getContext('2d');
    bCtx.save();
    if (cardMargin > 0) {
      bCtx.translate(cardMargin * scale, cardMargin * scale);
    }
    bCtx.scale(scale, scale);
    await drawTicketBack(bCtx, state, w, h, isHoriz, strokeW, false);
    bCtx.restore();
    if (includeBleed && cardMargin > 0) {
      drawCropMarks(bCtx, cardMargin * scale, cardMargin * scale, w * scale, h * scale, scale);
    }

    // Combined Canvas for PNG preview (tight duo gap, transparent background)
    const combGap = includeBleed ? 20 : 12;
    const combCanvas = document.createElement('canvas');
    combCanvas.width = cardCanvasW * 2 + combGap * scale;
    combCanvas.height = cardCanvasH;
    const cCtx = combCanvas.getContext('2d');
    cCtx.drawImage(frontCanvas, 0, 0);
    cCtx.drawImage(backCanvas, cardCanvasW + combGap * scale, 0);

    return {
      type: 'duplex',
      frontCanvas,
      backCanvas,
      combinedCanvas: combCanvas,
      canvas: combCanvas,
      unitW: w,
      unitH: h,
      includeBleed,
    };
  }

  // mode === 'fold-glue'
  // Place Front and Back side-by-side with a center fold crease (transparent outer canvas)
  const canvasW = (w * 2 + gap + margin * 2) * scale;
  const canvasH = (h + margin * 2) * scale;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');

  // 1. Draw Front side on the left
  ctx.save();
  ctx.translate(margin * scale, margin * scale);
  ctx.scale(scale, scale);
  await drawTicketFront(ctx, state, w, h, isHoriz, strokeW);
  ctx.restore();

  // 2. Draw Fold Line in the center
  const foldX = (margin + w + gap / 2) * scale;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(foldX, margin * scale * 0.4);
  ctx.lineTo(foldX, (margin + h) * scale + margin * scale * 0.6);
  ctx.setLineDash([12 * scale, 8 * scale]);
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.4)';
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();
  ctx.setLineDash([]);

  // "FOLD HERE" label
  ctx.translate(foldX, margin * scale * 0.25);
  ctx.font = `bold ${9 * scale}px "JetBrains Mono", monospace`;
  ctx.fillStyle = 'rgba(26, 26, 26, 0.55)';
  ctx.textAlign = 'center';
  ctx.fillText('FOLD HERE', 0, 0);
  ctx.restore();

  // 3. Draw Back side on the right
  ctx.save();
  ctx.translate((margin + w + gap) * scale, margin * scale);
  ctx.scale(scale, scale);
  await drawTicketBack(ctx, state, w, h, isHoriz, strokeW, true);
  ctx.restore();

  // 4. Crop marks
  if (includeBleed) {
    drawCropMarks(ctx, margin * scale, margin * scale, w * scale, h * scale, scale);
    drawCropMarks(ctx, (margin + w + gap) * scale, margin * scale, w * scale, h * scale, scale);
  }

  return {
    type: 'fold-glue',
    canvas,
    unitW: w,
    unitH: h,
  };
}
