/**
 * Travel ID Studio Export Router
 * Dispatches between Travel License and Creative License card exporters
 * Produces Fold & Glue (1-page) or Duplex (2-page) canvases with crop marks.
 */

import { DPI_SCALE } from '../../../core/print/canvasUtils';
import { drawCropMarks } from '../../../core/print/cropMarks';
import { drawTravelIDFront, drawTravelIDBack } from './travelLicenseExporter';
import { drawCreativeLicenseFront, drawCreativeLicenseBack } from './creativeLicenseExporter';
import { drawThisAndThatFront, drawThisAndThatBack } from './thisAndThatExporter';

export async function renderTravelIDExport(state, mode = 'fold-glue', includeBleed = true) {
  const w = 760;
  const h = 480;
  const scale = DPI_SCALE;
  const margin = includeBleed ? 35 : 12;
  const gap = 30;

  let drawFront = drawTravelIDFront;
  let drawBack = drawTravelIDBack;

  if (state.cardType === 'Creative License') {
    drawFront = drawCreativeLicenseFront;
    drawBack = drawCreativeLicenseBack;
  } else if (state.cardType === 'This & That') {
    drawFront = drawThisAndThatFront;
    drawBack = drawThisAndThatBack;
  }

  if (mode === 'duplex') {
    // Exact zero-margin card bounds when includeBleed is false, or 35px margin with crop marks when true
    const cardMargin = includeBleed ? 35 : 0;
    const cardCanvasW = (w + cardMargin * 2) * scale;
    const cardCanvasH = (h + cardMargin * 2) * scale;

    // Page 1: Front (100% transparent canvas outside rounded card corners)
    const frontCanvas = document.createElement('canvas');
    frontCanvas.width = cardCanvasW;
    frontCanvas.height = cardCanvasH;
    const fCtx = frontCanvas.getContext('2d');
    fCtx.save();
    if (cardMargin > 0) {
      fCtx.translate(cardMargin * scale, cardMargin * scale);
    }
    fCtx.scale(scale, scale);
    await drawFront(fCtx, state, w, h);
    fCtx.restore();
    if (includeBleed && cardMargin > 0) {
      drawCropMarks(fCtx, cardMargin * scale, cardMargin * scale, w * scale, h * scale, scale);
    }

    // Page 2: Back (100% transparent canvas outside rounded card corners)
    const backCanvas = document.createElement('canvas');
    backCanvas.width = cardCanvasW;
    backCanvas.height = cardCanvasH;
    const bCtx = backCanvas.getContext('2d');
    bCtx.save();
    if (cardMargin > 0) {
      bCtx.translate(cardMargin * scale, cardMargin * scale);
    }
    bCtx.scale(scale, scale);
    await drawBack(bCtx, state, w, h);
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
  await drawFront(ctx, state, w, h);
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
  await drawBack(ctx, state, w, h);
  ctx.restore();

  // 4. Crop marks
  if (includeBleed) {
    drawCropMarks(ctx, margin * scale, margin * scale, w * scale, h * scale, scale);
    drawCropMarks(ctx, (margin + w + gap) * scale, margin * scale, w * scale, h * scale, scale);
  }

  return { type: 'fold-glue', canvas, unitW: w, unitH: h };
}
