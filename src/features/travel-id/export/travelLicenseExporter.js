/**
 * Travel License (Card Type 1) Canvas 2D Exporter
 * Renders physical Travel License front and back sides matching TravelIDCard.jsx
 */

import { loadImage, draw5PointStar, drawPaperGrain, wrapCenteredLines } from '../../../core/print/canvasUtils';

export async function drawIDStarBorder(ctx, w = 760, h = 480) {
  const starBoxW = 700;
  const starBoxH = 420;
  const offX = (w - starBoxW) / 2; // 30
  const offY = (h - starBoxH) / 2; // 30
  const hCount = 15;
  const vCount = 9;
  const starPositions = [];

  for (let i = 0; i < hCount; i++) {
    starPositions.push({ x: offX + (starBoxW / (hCount - 1)) * i, y: offY });
  }
  for (let i = 0; i < hCount; i++) {
    starPositions.push({ x: offX + (starBoxW / (hCount - 1)) * i, y: offY + starBoxH });
  }
  for (let i = 1; i < vCount - 1; i++) {
    starPositions.push({ x: offX, y: offY + (starBoxH / (vCount - 1)) * i });
  }
  for (let i = 1; i < vCount - 1; i++) {
    starPositions.push({ x: offX + starBoxW, y: offY + (starBoxH / (vCount - 1)) * i });
  }

  let starImg = null;
  try {
    starImg = await loadImage('/assets/star.svg');
  } catch {
    // fallback
  }

  starPositions.forEach(pos => {
    if (starImg) {
      ctx.drawImage(starImg, pos.x - 10, pos.y - 10, 20, 20);
    } else {
      draw5PointStar(ctx, pos.x, pos.y, 10, 4.2);
    }
  });
}

export async function drawTravelIDFront(ctx, state, w, h) {
  ctx.save();

  // Card base with rounded corners (r = 20)
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 20);
  ctx.fillStyle = state.colorTheme || '#F5EEDB';
  ctx.fill();
  ctx.clip(); // clip contents to rounded card

  // Noise overlay
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

  // Star Border (exact match to StarBorder in TravelIDCard.jsx)
  await drawIDStarBorder(ctx, w, h);

  // --- LEFT: Photo Box ---
  // In UI: px-10 pt-11, left container w-[45%], pl-3
  // 40 + 12 = 52px left. Width: 294px, Height: 368px (aspect 4/5)
  const frameX = 52;
  const frameY = 48;
  const frameW = 294;
  const frameH = 368;

  // White Photo Card / Polaroid Border
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 4;
  ctx.fillRect(frameX, frameY, frameW, frameH);
  ctx.restore();

  // Inner Photo
  const innerPad = 4;
  const innerX = frameX + innerPad;
  const innerY = frameY + innerPad;
  const innerW = frameW - innerPad * 2;
  const innerH = frameH - innerPad * 2;

  if (state.imageSrc) {
    try {
      const userImg = await loadImage(state.imageSrc);
      ctx.save();
      ctx.beginPath();
      ctx.rect(innerX, innerY, innerW, innerH);
      ctx.clip();

      const imgRatio = userImg.width / userImg.height;
      const boxRatio = innerW / innerH;
      let baseW, baseH;
      if (imgRatio > boxRatio) {
        baseH = innerH;
        baseW = innerH * imgRatio;
      } else {
        baseW = innerW;
        baseH = innerW / imgRatio;
      }
      const imgScale = state.imageScale || 1;
      const finalW = baseW * imgScale;
      const finalH = baseH * imgScale;
      const offX = ((state.imageOffsetX || 0) / 100) * innerW;
      const offY = ((state.imageOffsetY || 0) / 100) * innerH;
      const centerX = innerX + innerW / 2 + offX;
      const centerY = innerY + innerH / 2 + offY;

      ctx.drawImage(userImg, centerX - finalW / 2, centerY - finalH / 2, finalW, finalH);
      ctx.restore();
    } catch {
      ctx.save();
      ctx.fillStyle = '#E5E5E5';
      ctx.fillRect(innerX, innerY, innerW, innerH);
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.fillStyle = '#A3A3A3';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('NO PHOTO', innerX + innerW / 2, innerY + innerH / 2);
      ctx.restore();
    }
  } else {
    ctx.save();
    ctx.fillStyle = '#E5E5E5';
    ctx.fillRect(innerX, innerY, innerW, innerH);
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#A3A3A3';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NO PHOTO', innerX + innerW / 2, innerY + innerH / 2);
    ctx.restore();
  }

  // Caption under photo (matches UI exactly: font-mono text-[9px] uppercase tracking-widest text-[#1A1A1A]/80)
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.8)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('PHOTOGRAPH OF AUTHORIZED TRAVELER', frameX + 4, frameY + frameH + 8);

  // --- RIGHT: ID Details ---
  const colLeft = 370;
  const colRight = 712;
  const colCenterX = Math.round((colLeft + colRight) / 2); // ~541

  // Top Header (Centered)
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('PERMANENT LICENSE OF TRAVEL', colCenterX, 50);

  ctx.font = '900 20px "JetBrains Mono", monospace';
  ctx.fillText('NO. ' + (state.idNumber || 'TTC6252021'), colCenterX, 68);

  // 4 Form Fields (Exact UI spacing: h-7 = 28px + gap-2 = 8px -> 36px per row)
  const fields = [
    { label: 'Issued to', val: state.issuedTo || '' },
    { label: 'Date of birth', val: state.dateOfBirth || '' },
    { label: 'Place of issue', val: state.placeOfIssue || '' },
    { label: 'Date of issue', val: state.dateOfIssue || '' }
  ];
  let rowY = 122;

  fields.forEach(f => {
    // 1. Label
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#1A1A1A';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(f.label, colLeft, rowY);

    const labelW = ctx.measureText(f.label).width;
    const inputStart = colLeft + labelW + 6;

    // 2. Dotted underline across the field
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = 'rgba(26, 26, 26, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.moveTo(inputStart, rowY + 1);
    ctx.lineTo(colRight, rowY + 1);
    ctx.stroke();
    ctx.restore();

    // 3. User typed text: EXACT adamHandwriting font
    if (f.val) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(inputStart, rowY - 26, colRight - inputStart, 30);
      ctx.clip();

      ctx.font = '24px "adamHandwriting", "Patrick Hand", cursive';
      ctx.fillStyle = '#1A1A1A';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(f.val, inputStart + 4, rowY - 2);
      ctx.restore();
    }

    rowY += 36;
  });

  // Blue Stamp Overlay ("CALL ME IF YOU GET LOST")
  if (state.showBlueStamp) {
    try {
      const stampImg = await loadImage('/assets/cmiygl-stamp.webp');
      ctx.save();
      ctx.translate(colCenterX, 290);
      ctx.rotate(-6 * Math.PI / 180);
      ctx.globalAlpha = 0.8;
      ctx.globalCompositeOperation = 'multiply';
      const stampW = 224;
      const stampH = stampW * (stampImg.height / stampImg.width);
      ctx.drawImage(stampImg, -stampW / 2, -stampH / 2, stampW, stampH);
      ctx.restore();
    } catch {
      // ignore
    }
  }

  // Legal Certifications (Exact UI matching: centered, neat line wrapping)
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('LICENSE OF TRAVEL', colCenterX, 262);

  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.9)';
  wrapCenteredLines(ctx, 'This is to Certify that the person named and described above is permitted to travel and explore freely unless detained by law.', colCenterX, 276, 330, 13);

  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.fillText('IMPORTANT', colCenterX, 312);

  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.9)';
  wrapCenteredLines(ctx, 'The holder of this license wrote, composed, and arranged all songs within the attached record, unless stated otherwise.', colCenterX, 326, 330, 13);

  // Signature Area (Exact UI matching: centered w-64, neat signature line and caption)
  const sigLineY = 412;
  const sigW = 256;
  const sigLeft = colCenterX - sigW / 2;
  const sigRight = colCenterX + sigW / 2;

  // Signature Artwork or Handwritten Name (adamHandwriting)
  if (state.signatureImage) {
    try {
      const sigImg = await loadImage(state.signatureImage);
      ctx.save();
      ctx.translate(colCenterX, sigLineY - 20);
      ctx.rotate(-2 * Math.PI / 180);
      ctx.globalAlpha = 0.9;
      ctx.globalCompositeOperation = 'multiply';
      const maxSigW = 220;
      const maxSigH = 44;
      const sigRatio = sigImg.width / sigImg.height;
      let drawSigW = maxSigW;
      let drawSigH = drawSigW / sigRatio;
      if (drawSigH > maxSigH) {
        drawSigH = maxSigH;
        drawSigW = drawSigH * sigRatio;
      }
      ctx.drawImage(sigImg, -drawSigW / 2, -drawSigH / 2, drawSigW, drawSigH);
      ctx.restore();
    } catch {
      // ignore
    }
  } else if (state.issuedTo) {
    ctx.save();
    ctx.translate(colCenterX, sigLineY - 4);
    ctx.rotate(-2 * Math.PI / 180);
    ctx.font = '30px "adamHandwriting", "Patrick Hand", cursive';
    ctx.fillStyle = '#1A1A1A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(state.issuedTo, 0, 0);
    ctx.restore();
  }

  // Dotted Signature Line
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.moveTo(sigLeft, sigLineY);
  ctx.lineTo(sigRight, sigLineY);
  ctx.stroke();
  ctx.restore();

  // Caption under signature line
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.7)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('SIGNATURE OF AUTHORIZED TRAVELER', colCenterX, sigLineY + 6);

  ctx.restore();
}

export async function drawTravelIDBack(ctx, state, w, h) {
  ctx.save();

  // Card base with rounded corners (r = 20)
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 20);
  ctx.fillStyle = state.colorTheme || '#F5EEDB';
  ctx.fill();
  ctx.clip();

  // Noise overlay
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

  // Star Border
  await drawIDStarBorder(ctx, w, h);

  // Header: matching p-12 (48px)
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('TRAVEL STAMPS: 2011 - PRESENT DAY', 48, 48);

  const stamps = state.stamps || [];

  // Helper to draw a stamp centered at (cx, cy) with exact dimensions and rotation
  const drawCenteredStamp = (img, cx, cy, stampW, stampH, rotDeg, alpha = 1.0) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((rotDeg * Math.PI) / 180);
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(img, -stampW / 2, -stampH / 2, stampW, stampH);
    ctx.restore();
  };

  // 1. IGOR Stamp: top-4 left-0 w-64 -rotate-3
  // Center: (176, 155), Width: 256, Height: 86.2, Rotation: -3 deg
  if (stamps.includes('igor')) {
    try {
      const igorImg = await loadImage('/assets/igor-stamp.webp');
      const igorW = 256;
      const igorH = igorW * (igorImg.height / igorImg.width);
      drawCenteredStamp(igorImg, 176, 155, igorW, igorH, -3);
    } catch {
      // ignore
    }
  }

  // 2. Cat Stamp: top-2 right-12 w-32 rotate-6
  // Center: (600, 196), Width: 128, Height: 172.1, Rotation: 6 deg
  if (stamps.includes('cat')) {
    try {
      const catImg = await loadImage('/assets/cat-stamp.webp');
      const catW = 128;
      const catH = catW * (catImg.height / catImg.width);
      drawCenteredStamp(catImg, 600, 196, catW, catH, 6);
    } catch {
      // ignore
    }
  }

  // 3. Nami Stamp: bottom-6 left-8 w-48 -rotate-6
  // Extends down to bottom border area touching bottom stars
  // Center: (176, 331), Width: 192, Height: 264.7, Rotation: -6 deg
  if (stamps.includes('nami')) {
    try {
      const namiImg = await loadImage('/assets/nami-stamp.webp');
      const namiW = 192;
      const namiH = namiW * (namiImg.height / namiImg.width);
      drawCenteredStamp(namiImg, 176, 331, namiW, namiH, -6);
    } catch {
      // ignore
    }
  }

  // 4. Jolly Roger Stamp: bottom-6 right-6 w-40 rotate-12
  // Extends down to bottom border area touching bottom stars
  // Center: (608, 383), Width: 160, Height: 160, Rotation: 12 deg
  if (stamps.includes('jollyRoger')) {
    try {
      const jrImg = await loadImage('/assets/jollyRoger-stamp.webp');
      const jrW = 160;
      const jrH = 160;
      drawCenteredStamp(jrImg, 608, 383, jrW, jrH, 12);
    } catch {
      // ignore
    }
  }

  // 5. CMIYGL Blue Stamp: top-1/2 left-1/2 -translate-x-[45%] -translate-y-[45%] w-80 -rotate-[4deg]
  // Center: (396, 302.4), Width: 320, Height: 146, Rotation: -4 deg
  if (stamps.includes('cmiygl')) {
    try {
      const cmiyglImg = await loadImage('/assets/cmiygl-stamp.webp');
      const cW = 320;
      const cH = cW * (cmiyglImg.height / cmiyglImg.width);
      drawCenteredStamp(cmiyglImg, 396, 302.4, cW, cH, -4);
    } catch {
      // ignore
    }
  }

  ctx.restore();
}
