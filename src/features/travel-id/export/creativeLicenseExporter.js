/**
 * Creative License (Card Type 2) Canvas 2D Exporter
 */

import { CREATIVE_LICENSE_TOKENS } from '../tokens/creativeLicenseTokens';
import {
  loadImage,
  wrapText,
  wrapRightLines,
  drawPaperGrain,
  draw5PointStar,
  drawEmptyPortraitPlaceholder
} from '../../../core/print/canvasUtils';

export async function drawCreativeLicenseFront(ctx, state, w, h) {
  const T = CREATIVE_LICENSE_TOKENS;
  ctx.save();

  // Card base with rounded corners (r = 24)
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, T.card.radius);
  ctx.fillStyle = state.colorTheme || '#F5EEDB';
  ctx.fill();
  ctx.clip();

  // Noise overlay
  try {
    const noiseImg = await loadImage('/assets/noise.png');
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(noiseImg, 0, 0, w, h);
    ctx.restore();
  } catch {
    drawPaperGrain(ctx, w, h);
  }

  // Inset Dashed Border (inset 12px, r = 16)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(T.card.dashedInset, T.card.dashedInset, w - T.card.dashedInset * 2, h - T.card.dashedInset * 2, 16);
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.75)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Top 5 Blue Stars (px-12 = 48px to 712px, y = 28)
  const starXs = [48, 214, 380, 546, 712];
  const starY = 28;
  let blueStarImg = null;
  try {
    blueStarImg = await loadImage('/assets/star.svg');
  } catch {}

  starXs.forEach(sx => {
    ctx.save();
    if (blueStarImg) {
      ctx.drawImage(blueStarImg, sx - 8, starY - 8, 16, 16);
    } else {
      ctx.fillStyle = '#4B728D';
      draw5PointStar(ctx, sx, starY, 8, 3.5);
    }
    ctx.restore();
  });

  // Certified Stamp Watermark (Center-Left: x=400, y=218, w=208, h=208, rotate -12 deg, opacity 0.38)
  try {
    const certImg = await loadImage('/assets/certified-stamp.webp');
    const cStamp = T.watermarks.certifiedStamp;
    ctx.save();
    ctx.translate(cStamp.x, cStamp.y);
    ctx.rotate(cStamp.rotation * Math.PI / 180);
    ctx.globalAlpha = cStamp.opacity;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(certImg, -cStamp.size / 2, -cStamp.size / 2, cStamp.size, cStamp.size);
    ctx.restore();
  } catch {}

  // Prominent Star Sticker Watermark behind signature area (x=537, y=106, w=175, h=175, opacity 0.30)
  try {
    const starGraphic = await loadImage('/assets/star-sticker.webp');
    const sSticker = T.watermarks.starSticker;
    ctx.save();
    ctx.globalAlpha = sSticker.opacity;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(starGraphic, sSticker.x, sSticker.y, sSticker.size, sSticker.size);
    ctx.restore();
  } catch {}

  // LEFT COLUMN: Photo, Sticker Overlays, Barcode
  const { x: photoX, y: photoY, width: photoW, height: photoH, borderPadding: innerPhotoPad } = T.photo;

  // Polaroid white border around photo (5px)
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(photoX, photoY, photoW, photoH);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.lineWidth = 1;
  ctx.strokeRect(photoX, photoY, photoW, photoH);
  ctx.restore();

  const innerPX = photoX + innerPhotoPad;
  const innerPY = photoY + innerPhotoPad;
  const innerPW = photoW - innerPhotoPad * 2;
  const innerPH = photoH - innerPhotoPad * 2;

  const photoSrc = state.imageSrc || (state.isShowcase ? '/assets/luffyTravelID.webp' : null);
  if (photoSrc) {
    try {
      const userImg = await loadImage(photoSrc);
      ctx.save();
      ctx.beginPath();
      ctx.rect(innerPX, innerPY, innerPW, innerPH);
      ctx.clip();

      const imgRatio = userImg.width / userImg.height;
      const boxRatio = innerPW / innerPH;
      let baseW, baseH;
      if (imgRatio > boxRatio) {
        baseH = innerPH;
        baseW = innerPH * imgRatio;
      } else {
        baseW = innerPW;
        baseH = innerPW / imgRatio;
      }
      const imgScale = state.imageScale || 1;
      const finalW = baseW * imgScale;
      const finalH = baseH * imgScale;
      const offX = ((state.imageOffsetX || 0) / 100) * innerPW;
      const offY = ((state.imageOffsetY || 0) / 100) * innerPH;
      const centerX = innerPX + innerPW / 2 + offX;
      const centerY = innerPY + innerPH / 2 + offY;

      ctx.drawImage(userImg, centerX - finalW / 2, centerY - finalH / 2, finalW, finalH);
      ctx.restore();
    } catch {
      drawEmptyPortraitPlaceholder(ctx, innerPX, innerPY, innerPW, innerPH);
    }
  } else {
    drawEmptyPortraitPlaceholder(ctx, innerPX, innerPY, innerPW, innerPH);
  }

  // Overlapping Sticker Cluster at Bottom of Photo (Anchored at -bottom-8)
  const S = T.stickersFront;
  // 1. imig.webp (-6 deg, center x=48, y=272, w=68, h=95)
  try {
    const imigImg = await loadImage('/assets/imig.webp');
    ctx.save();
    ctx.translate(S.imig.x, S.imig.y);
    ctx.rotate(S.imig.rotation * Math.PI / 180);
    ctx.drawImage(imigImg, -S.imig.width / 2, -S.imig.height / 2, S.imig.width, S.imig.height);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-S.imig.width / 2, -S.imig.height / 2, S.imig.width, S.imig.height);
    ctx.restore();
  } catch {}

  // 2. no-sub.webp (3 deg, center x=110, y=289, w=76, h=76)
  try {
    const noSubImg = await loadImage('/assets/no-sub.webp');
    ctx.save();
    ctx.translate(S.noSub.x, S.noSub.y);
    ctx.rotate(S.noSub.rotation * Math.PI / 180);
    ctx.drawImage(noSubImg, -S.noSub.width / 2, -S.noSub.height / 2, S.noSub.width, S.noSub.height);
    ctx.restore();
  } catch {}

  // 3. Guaranteed Badge (rotate -2 deg, center x=166, y=283, w=100, h=24)
  ctx.save();
  ctx.translate(S.guaranteed.x, S.guaranteed.y);
  ctx.rotate(S.guaranteed.rotation * Math.PI / 180);
  ctx.fillStyle = '#1B5E3C';
  ctx.fillRect(-S.guaranteed.width / 2, -S.guaranteed.height / 2, S.guaranteed.width, S.guaranteed.height);
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-S.guaranteed.width / 2, -S.guaranteed.height / 2, S.guaranteed.width, S.guaranteed.height);
  ctx.font = 'bold 12px Impact, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GUARANTEED.', 0, 0);
  ctx.restore();

  // 4. omg.webp (8 deg, center x=188, y=306, w=82, h=58)
  try {
    const omgImg = await loadImage('/assets/omg.webp');
    ctx.save();
    ctx.translate(S.omg.x, S.omg.y);
    ctx.rotate(S.omg.rotation * Math.PI / 180);
    ctx.drawImage(omgImg, -S.omg.width / 2, -S.omg.height / 2, S.omg.width, S.omg.height);
    ctx.restore();
  } catch {}

  // Bottom Barcode (Contained strictly within left column: x=53 to 210, width ~157px, NO overlap with right column at x=256)
  const B = T.barcode;
  const BARCODE_BARS = [3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 1, 3, 1, 2, 4, 1, 2, 1, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 1, 3, 2];
  let curBX = B.x;
  ctx.save();
  ctx.fillStyle = '#1A1A1A';
  BARCODE_BARS.forEach((bw) => {
    const barWidth = bw * B.unitWidth;
    ctx.fillRect(curBX, B.y, barWidth, B.height);
    curBX += barWidth + B.gap;
  });
  ctx.restore();

  // Barcode text below bars (centered under left column at x=131.5)
  const licenseNum = (state.creativeNumber || state.idNumber || '0051').replace(/^TTC/, '').slice(-4).padStart(4, '0');
  const barcodeStr = state.barcodeText || `SR-VISUAL-${licenseNum}`;
  ctx.save();
  ctx.font = 'bold 10.5px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(barcodeStr, B.textCenterX, B.y + B.height + 5);
  ctx.restore();

  // RIGHT AREA
  const rightX = T.grid.x;
  const rightW = T.grid.width;
  const rightEdge = rightX + rightW; // 728

  // Header Title: CREATIVE LICENSE & # OF LICENSE
  ctx.save();
  ctx.font = '54px "creative", Impact, sans-serif';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('CREATIVE', rightX - 2, 104);

  ctx.font = '900 28px "JetBrains Mono", monospace';
  ctx.fillText('LICENSE', rightX, 139);

  ctx.font = '600 7.5px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.7)';
  wrapText(ctx, 'This creative license empowers you to design without limit and unlock the full potential of your imagination together, we shape a world of boundless artistic possibilities.', rightX, 152, 215, 9.5);
  ctx.restore();

  // #OF LICENSE & Red Digits
  ctx.save();
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.8)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText('#OF LICENSE', rightEdge, 70);

  const numSpaced = licenseNum.split('').join(' ');
  ctx.font = '900 28px "JetBrains Mono", monospace';
  ctx.fillStyle = '#C93B2B';
  ctx.fillText(numSpaced, rightEdge, 86);
  ctx.restore();

  // Information Grid Box (x = rightX, y = 176, w = rightW, h = 176)
  const gridY = T.grid.y;
  const gridH = T.grid.height;
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillRect(rightX, gridY, rightW, gridH);
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 2;
  ctx.strokeRect(rightX, gridY, rightW, gridH);

  // Row 1: Signature (h = 44)
  const r1H = 44;
  ctx.beginPath();
  ctx.moveTo(rightX, gridY + r1H);
  ctx.lineTo(rightEdge, gridY + r1H);
  ctx.stroke();

  ctx.font = 'bold 8px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.75)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('SIGNATURE OF AUTHORIZED CREATIVE', rightX + 10, gridY + 5);

  const isShowcase = !!state.isShowcase;
  const DEF = T.showcaseDefaults;

  const sigName = (!isShowcase && (state.issuedTo === DEF.name || state.issuedTo === 'Monkey D. Luffy'))
    ? ''
    : (state.issuedTo || (isShowcase ? DEF.name : ''));

  if (state.signatureImage) {
    try {
      const sigImg = await loadImage(state.signatureImage);
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      const sigRatio = sigImg.width / sigImg.height;
      let sW = 180;
      let sH = sW / sigRatio;
      if (sH > 28) {
        sH = 28;
        sW = sH * sigRatio;
      }
      ctx.drawImage(sigImg, rightX + 10, gridY + 14, sW, sH);
      ctx.restore();
    } catch {}
  } else if (sigName && sigName.trim()) {
    ctx.font = 'italic bold 28px "Patrick Hand", cursive';
    ctx.fillStyle = '#2B5490';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(sigName.trim(), rightX + 10, gridY + 36);
  }

  // Row 2: First Name (h = 42)
  const r2H = 42;
  const r2Y = gridY + r1H;
  ctx.beginPath();
  ctx.moveTo(rightX, r2Y + r2H);
  ctx.lineTo(rightEdge, r2Y + r2H);
  ctx.stroke();

  ctx.font = 'bold 8px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.75)';
  ctx.textBaseline = 'top';
  ctx.fillText('FIRST NAME', rightX + 10, r2Y + 6);

  if (sigName && sigName.trim()) {
    ctx.font = '900 16px "JetBrains Mono", monospace';
    ctx.fillStyle = '#1A1A1A';
    ctx.textBaseline = 'top';
    ctx.fillText(sigName.trim().toUpperCase(), rightX + 10, r2Y + 18);
  }

  // Row 3: Occupation (h = 42)
  const r3H = 42;
  const r3Y = r2Y + r2H;
  ctx.beginPath();
  ctx.moveTo(rightX, r3Y + r3H);
  ctx.lineTo(rightEdge, r3Y + r3H);
  ctx.stroke();

  ctx.font = 'bold 8px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.75)';
  ctx.textBaseline = 'top';
  ctx.fillText('OCCUPATION', rightX + 10, r3Y + 6);

  const occVal = (!isShowcase && (state.occupation === DEF.occupation || state.occupation === 'Pirate Captain'))
    ? ''
    : (state.occupation || (isShowcase ? DEF.occupation : ''));

  if (occVal && occVal.trim()) {
    ctx.font = '800 14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#1A1A1A';
    ctx.textBaseline = 'top';
    ctx.fillText(occVal.trim().toUpperCase(), rightX + 10, r3Y + 18);
  }

  // Row 4: D.O.B & Nationality (h = 48)
  const r4Y = r3Y + r3H;
  const halfW = rightW / 2;
  ctx.beginPath();
  ctx.moveTo(rightX + halfW, r4Y);
  ctx.lineTo(rightX + halfW, gridY + gridH);
  ctx.stroke();

  // D.O.B
  ctx.font = 'bold 8px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.75)';
  ctx.textBaseline = 'top';
  ctx.fillText('D.O.B', rightX + 10, r4Y + 6);

  const dobVal = (!isShowcase && state.dateOfBirth === DEF.dob)
    ? ''
    : (state.dateOfBirth || (isShowcase ? DEF.dob : ''));

  if (dobVal && dobVal.trim()) {
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#1A1A1A';
    ctx.textBaseline = 'top';
    ctx.fillText(dobVal.trim(), rightX + 10, r4Y + 18);
  }

  // Nationality
  ctx.font = 'bold 8px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.75)';
  ctx.textBaseline = 'top';
  ctx.fillText('NATIONALITY', rightX + halfW + 10, r4Y + 6);

  const natVal = (state.nationality && state.nationality.trim())
    ? state.nationality.trim()
    : (isShowcase ? DEF.nationality : '');

  if (natVal && natVal.trim()) {
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#1A1A1A';
    ctx.textBaseline = 'top';
    ctx.fillText(natVal.trim().toUpperCase(), rightX + halfW + 10, r4Y + 18);
  }
  ctx.restore();

  // VALID UNTIL IT DOESN'T & GRAPHIC USER badge
  ctx.save();
  ctx.font = '900 8.5px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('VALID', rightX + 4, 360);
  ctx.fillText('UNTIL', rightX + 4, 370);
  ctx.fillText("IT DOESN'T", rightX + 4, 380);

  const badgeVal = state.userBadge || 'GRAPHIC USER';
  ctx.font = '900 34px Impact, "Arial Black", sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(badgeVal.toUpperCase(), rightEdge, 388);
  ctx.restore();

  // Bottom Expertise Box (x = rightX, y = 405, w = rightW, h = 32 - NO OVERLAP WITH BARCODE)
  const expY = T.expertise.y;
  const expH = T.expertise.height;
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillRect(rightX, expY, rightW, expH);
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 2;
  ctx.strokeRect(rightX, expY, rightW, expH);

  ctx.font = 'bold 8.5px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.75)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('EXPERTISE', rightX + 10, expY + expH / 2);

  const expVal = (!isShowcase && state.expertise === DEF.expertise)
    ? ''
    : (state.expertise || (isShowcase ? DEF.expertise : ''));

  if (expVal && expVal.trim()) {
    ctx.font = '900 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#1A1A1A';
    ctx.fillText(expVal.trim().toUpperCase(), rightX + 90, expY + expH / 2);
  }
  ctx.restore();

  ctx.restore();
}

export async function drawCreativeLicenseBack(ctx, state, w, h) {
  const T = CREATIVE_LICENSE_TOKENS;
  const B = T.back;
  const DEF = T.showcaseDefaults;
  const isBackShowcase = !!state.isShowcase;

  ctx.save();

  // Card base with rounded corners (r = 24)
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, T.card.radius);
  ctx.fillStyle = state.colorTheme || '#F5EEDB';
  ctx.fill();
  ctx.clip();

  // Noise overlay
  try {
    const noiseImg = await loadImage('/assets/noise.png');
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(noiseImg, 0, 0, w, h);
    ctx.restore();
  } catch {
    drawPaperGrain(ctx, w, h);
  }

  // Inset Dashed Border (inset 12px, r = 16)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(T.card.dashedInset, T.card.dashedInset, w - T.card.dashedInset * 2, h - T.card.dashedInset * 2, 16);
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.75)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // LEFT AREA: Star Sticker Graphic + Sticker Bomb + Quote
  // Background Star Graphic
  try {
    const starGraphic = await loadImage('/assets/star-sticker.webp');
    const sg = B.starGraphic;
    ctx.save();
    ctx.translate(sg.x, sg.y);
    ctx.rotate(sg.rotation * Math.PI / 180);
    ctx.globalAlpha = sg.opacity;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(starGraphic, -sg.size / 2, -sg.size / 2, sg.size, sg.size);
    ctx.restore();
  } catch {}

  // Stickers from creative-back.webp
  try {
    const backStickersImg = await loadImage('/assets/creative-back.webp');
    const bImgW = backStickersImg.width;
    const bImgH = backStickersImg.height;

    // 1. IT Screw Sticker (yellow)
    const it = B.stickers.itScrew;
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.rotation * Math.PI / 180);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-it.width / 2, -it.height / 2, it.width, it.height);
    ctx.save();
    ctx.beginPath();
    ctx.rect(-it.width / 2, -it.height / 2, it.width, it.height);
    ctx.clip();
    const sy1 = bImgH * 0.35;
    const sh1 = bImgH * 0.28;
    ctx.drawImage(backStickersImg, 0, sy1, bImgW, sh1, -it.width / 2, -it.height / 2, it.width, it.height);
    ctx.restore();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-it.width / 2, -it.height / 2, it.width, it.height);
    ctx.restore();

    // 2. STAMP OUT EVERYBODY! (red)
    const st = B.stickers.stampOut;
    ctx.save();
    ctx.translate(st.x, st.y);
    ctx.rotate(st.rotation * Math.PI / 180);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-st.width / 2, -st.height / 2, st.width, st.height);
    ctx.save();
    ctx.beginPath();
    ctx.rect(-st.width / 2, -st.height / 2, st.width, st.height);
    ctx.clip();
    const sy2 = bImgH * 0.02;
    const sh2 = bImgH * 0.30;
    ctx.drawImage(backStickersImg, 0, sy2, bImgW, sh2, -st.width / 2, -st.height / 2, st.width, st.height);
    ctx.restore();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-st.width / 2, -st.height / 2, st.width, st.height);
    ctx.restore();

    // 3. SICK, SAD WORLD (blue)
    const ss = B.stickers.sickSadWorld;
    ctx.save();
    ctx.translate(ss.x, ss.y);
    ctx.rotate(ss.rotation * Math.PI / 180);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-ss.width / 2, -ss.height / 2, ss.width, ss.height);
    ctx.save();
    ctx.beginPath();
    ctx.rect(-ss.width / 2, -ss.height / 2, ss.width, ss.height);
    ctx.clip();
    const sy3 = bImgH * 0.68;
    const sh3 = bImgH * 0.30;
    ctx.drawImage(backStickersImg, 0, sy3, bImgW, sh3, -ss.width / 2, -ss.height / 2, ss.width, ss.height);
    ctx.restore();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-ss.width / 2, -ss.height / 2, ss.width, ss.height);
    ctx.restore();
  } catch {}

  // Bottom row stickers: NO SUBSTITUTE oval + star-sticker + star-grafitti
  const nso = B.stickers.noSubOval;
  ctx.save();
  ctx.translate(nso.x, nso.y);
  ctx.rotate(nso.rotation * Math.PI / 180);
  ctx.beginPath();
  ctx.ellipse(0, 0, nso.width / 2, nso.height / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#FCD835';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.font = 'bold 11px Impact, sans-serif';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NO SUBSTITUTE', 0, 0);
  ctx.restore();

  // star-sticker.webp
  try {
    const starStickerImg = await loadImage('/assets/star-sticker.webp');
    const sb = B.stickers.starBurst;
    ctx.save();
    ctx.translate(sb.x, sb.y);
    ctx.rotate(sb.rotation * Math.PI / 180);
    ctx.drawImage(starStickerImg, -sb.size / 2, -sb.size / 2, sb.size, sb.size);
    ctx.restore();
  } catch {}

  // star-grafitti.webp
  try {
    const starGrafittiImg = await loadImage('/assets/star-grafitti.webp');
    const fl = B.stickers.flower;
    ctx.save();
    ctx.translate(fl.x, fl.y);
    ctx.rotate(fl.rotation * Math.PI / 180);
    ctx.drawImage(starGrafittiImg, -fl.size / 2, -fl.size / 2, fl.size, fl.size);
    ctx.restore();
  } catch {}

  // Bottom Quote
  const quoteVal = (!isBackShowcase && state.quoteText === DEF.quote)
    ? ''
    : (state.quoteText || (isBackShowcase ? DEF.quote : ''));

  const authorVal = (!isBackShowcase && state.quoteAuthor === DEF.author)
    ? ''
    : (state.quoteAuthor || (isBackShowcase ? DEF.author : ''));

  if (quoteVal && quoteVal.trim()) {
    ctx.save();
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#1A1A1A';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(quoteVal.trim(), B.quote.x, B.quote.y);

    if (authorVal && authorVal.trim()) {
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(26, 26, 26, 0.75)';
      ctx.fillText(`- ${authorVal.trim()}`, B.quote.x, B.quote.authorY);
    }
    ctx.restore();
  }

  // RIGHT AREA: Bordered Details Box (Skills, Software, Contact)
  const { x: boxX, y: boxY, width: boxW, height: boxH } = B.detailsBox;
  const textRight = boxX + boxW - 20;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 2;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // Clip content inside details box so text can never spill across boundaries
  ctx.save();
  ctx.beginPath();
  ctx.rect(boxX + 2, boxY + 2, boxW - 4, boxH - 4);
  ctx.clip();

  // Section 1: Skills
  ctx.font = '900 10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.7)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText('SKILLS', textRight, boxY + 20);

  const skillsVal = (!isBackShowcase && state.skills === DEF.skills)
    ? ''
    : (state.skills || (isBackShowcase ? DEF.skills : ''));

  if (skillsVal && skillsVal.trim()) {
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#1A1A1A';
    wrapRightLines(ctx, skillsVal.trim(), textRight, boxY + 36, 310, 16);
  }

  // Section 2: Software
  ctx.font = '900 10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.7)';
  ctx.fillText('SOFTWARE', textRight, boxY + 165);

  const softwareVal = (!isBackShowcase && state.software === DEF.software)
    ? ''
    : (state.software || (isBackShowcase ? DEF.software : ''));

  if (softwareVal && softwareVal.trim()) {
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#1A1A1A';
    const softLines = softwareVal.trim().split('\n');
    let sY = boxY + 181;
    softLines.forEach(line => {
      if (line.trim()) {
        sY = wrapRightLines(ctx, line.trim(), textRight, sY, 310, 16);
      }
    });
  }

  // Section 3: Contact
  ctx.font = '900 10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(26, 26, 26, 0.7)';
  ctx.fillText('CONTACT', textRight, boxY + 310);

  const phoneVal = (!isBackShowcase && state.contactPhone === DEF.phone)
    ? ''
    : (state.contactPhone || (isBackShowcase ? DEF.phone : ''));

  const emailVal = (!isBackShowcase && state.contactEmail === DEF.email)
    ? ''
    : (state.contactEmail || (isBackShowcase ? DEF.email : ''));

  const socialVal = (!isBackShowcase && state.contactSocial === DEF.social)
    ? ''
    : (state.contactSocial || (isBackShowcase ? DEF.social : ''));

  ctx.font = '600 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1A1A1A';
  let cY = boxY + 328;
  if (phoneVal && phoneVal.trim()) {
    ctx.fillText(`PH: ${phoneVal.trim()}`, textRight, cY);
    cY += 18;
  }
  if (emailVal && emailVal.trim()) {
    ctx.fillText(`Gmail: ${emailVal.trim()}`, textRight, cY);
    cY += 18;
  }
  if (socialVal && socialVal.trim()) {
    ctx.fillText(`INS: ${socialVal.trim()}`, textRight, cY);
    cY += 18;
  }
  ctx.restore();
  ctx.restore();
  ctx.restore();
}
