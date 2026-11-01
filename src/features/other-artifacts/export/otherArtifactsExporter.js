/**
 * Exporters for Vintage Photo Booth Strip, Bounty Poster, and Time Capsule Letter.
 */

import { DPI_SCALE, loadImage, wrapText } from '../../../core/print/canvasUtils';
import { drawCropMarks } from '../../../core/print/cropMarks';

/* ==========================================================================
   PRODUCT: PHOTO BOOTH (VINTAGE 4-SHOT STRIP)
   ========================================================================== */
export async function renderPhotoBoothExport(state, mode = 'fold-glue', includeBleed = true) {
  const w = 240;
  const h = 760;
  const scale = DPI_SCALE;
  const margin = 50;

  const canvas = document.createElement('canvas');
  canvas.width = (w + margin * 2) * scale;
  canvas.height = (h + margin * 2) * scale;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(margin * scale, margin * scale);
  ctx.scale(scale, scale);

  // Photo strip base
  ctx.fillStyle = '#FDFDFD';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, w, h);

  // 4 frames
  const fW = w - 28;
  const fH = 150;
  let curY = 16;

  let loadedImg = null;
  if (state.imageSrc) {
    try {
      loadedImg = await loadImage(state.imageSrc);
    } catch {
      // ignore
    }
  }

  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = '#E5E5E5';
    ctx.fillRect(14, curY, fW, fH);
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(14, curY, fW, fH);

    if (loadedImg) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(14, curY, fW, fH);
      ctx.clip();
      // Subtle progressive zoom/crop per frame for authentic photo booth aesthetic
      const z = 1 + i * 0.08;
      const dw = fW * z;
      const dh = fH * z;
      const dx = 14 + (fW - dw) / 2;
      const dy = curY + (fH - dh) / 2;
      ctx.filter = 'contrast(1.2) grayscale(0.2)';
      ctx.drawImage(loadedImg, dx, dy, dw, dh);
      ctx.filter = 'none';
      ctx.restore();
    }
    curY += fH + 14;
  }

  // Footer label
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  ctx.fillText('★ KITTE PHOTO BOOTH ★', w / 2, h - 45);
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.fillText(state.date || 'OCT 02, 2026 // #99321', w / 2, h - 28);

  ctx.restore();

  if (includeBleed) {
    drawCropMarks(ctx, margin * scale, margin * scale, w * scale, h * scale, scale);
  }

  return { type: 'photo-booth', canvas, unitW: w, unitH: h };
}

/* ==========================================================================
   PRODUCT: BOUNTY POSTER (MANGA WANTED POSTER)
   ========================================================================== */
export async function renderBountyPosterExport(state, mode = 'fold-glue', includeBleed = true) {
  const w = 480;
  const h = 680;
  const scale = DPI_SCALE;
  const margin = 50;

  const canvas = document.createElement('canvas');
  canvas.width = (w + margin * 2) * scale;
  canvas.height = (h + margin * 2) * scale;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(margin * scale, margin * scale);
  ctx.scale(scale, scale);

  // Parchment base
  ctx.fillStyle = '#F4E8C1';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, w, h);

  // Inner border
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(8, 8, w - 16, h - 16);

  // WANTED Banner
  ctx.font = 'bold 58px "Playfair Display", Georgia, serif';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  ctx.fillText('WANTED', w / 2, 75);

  // Photo Frame
  const pW = w - 60;
  const pH = 290;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(30, 95, pW, pH);
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 95, pW, pH);

  if (state.imageSrc) {
    try {
      const img = await loadImage(state.imageSrc);
      ctx.save();
      ctx.beginPath();
      ctx.rect(30, 95, pW, pH);
      ctx.clip();
      ctx.filter = 'contrast(1.3) sepia(0.25) grayscale(0.3)';
      ctx.drawImage(img, 30, 95, pW, pH);
      ctx.filter = 'none';
      ctx.restore();
    } catch {
      // ignore
    }
  }

  // DEAD OR ALIVE
  ctx.font = 'bold 24px "Playfair Display", Georgia, serif';
  ctx.fillStyle = '#1A1A1A';
  ctx.fillText('DEAD OR ALIVE', w / 2, 425);

  // Character Name
  ctx.font = 'bold 42px Impact, "Arial Black", sans-serif';
  ctx.fillText((state.signature || state.name || 'ANONYMOUS').toUpperCase(), w / 2, 480);

  // Bounty
  ctx.font = 'bold 32px "JetBrains Mono", monospace';
  ctx.fillText(state.bounty || '฿ 1,500,000,000 -', w / 2, 535);

  // Marine Emblem / Disclaimer
  ctx.font = '8px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.7)';
  ctx.fillText('MARINE HEADQUARTERS // PUBLISHED BY ORDER OF WORLD GOVERNMENT', w / 2, h - 25);

  ctx.restore();

  if (includeBleed) {
    drawCropMarks(ctx, margin * scale, margin * scale, w * scale, h * scale, scale);
  }

  return { type: 'bounty-poster', canvas, unitW: w, unitH: h };
}

/* ==========================================================================
   PRODUCT: TIME CAPSULE (TIME LETTER)
   ========================================================================== */
export async function renderTimeLetterExport(state, mode = 'fold-glue', includeBleed = true) {
  const w = 480;
  const h = 680;
  const scale = DPI_SCALE;
  const margin = 50;

  const canvas = document.createElement('canvas');
  canvas.width = (w + margin * 2) * scale;
  canvas.height = (h + margin * 2) * scale;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(margin * scale, margin * scale);
  ctx.scale(scale, scale);

  // Archival stationary base
  ctx.fillStyle = '#FAF7EE';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, w, h);

  // Header
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  ctx.fillText('★ KITTE ARCHIVAL TIME CAPSULE ★', w / 2, 40);

  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.6)';
  ctx.fillText('RECORDED: ' + (state.date || 'OCT 02, 2026') + ' // ' + (state.location || 'KYOTO, JAPAN'), w / 2, 58);

  // Ruled writing lines
  let lY = 95;
  while (lY < h - 90) {
    ctx.beginPath();
    ctx.moveTo(35, lY);
    ctx.lineTo(w - 35, lY);
    ctx.strokeStyle = 'rgba(26, 26, 26, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
    lY += 28;
  }

  // Letter content
  ctx.font = '17px "Permanent Marker", cursive, sans-serif';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'left';
  wrapText(ctx, state.note || 'To my future self: remember the steps taken, the quiet mornings, and the promises made today...', 40, 118, w - 80, 28);

  // Wax Seal Badge
  const sealX = w - 75;
  const sealY = h - 60;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 32, 0, Math.PI * 2);
  ctx.fillStyle = '#A32828';
  ctx.fill();
  ctx.strokeStyle = '#6E1B1B';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.font = 'bold 24px "Playfair Display", serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('切手', sealX, sealY);

  // Signature
  ctx.font = 'bold 20px "Permanent Marker", cursive';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(state.signature || 'Anonymous', 45, h - 45);

  ctx.restore();

  if (includeBleed) {
    drawCropMarks(ctx, margin * scale, margin * scale, w * scale, h * scale, scale);
  }

  return { type: 'time-letter', canvas, unitW: w, unitH: h };
}
