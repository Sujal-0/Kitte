/**
 * Photo Booth Studio - Modular 300 DPI Exporter
 * Renders high-resolution twin photostrips for Fold & Glue / Cut,
 * or single photostrip with crop marks.
 * 1:1 Pixel Parity with PhotoBoothStrip DOM component.
 */

import { DPI_SCALE, loadImage, drawPaperGrain } from '../../../core/print/canvasUtils';
import { drawCropMarks } from '../../../core/print/cropMarks';
import { PHOTO_BOOTH_TOKENS } from '../tokens/photoBoothTokens';

// Dynamic luminance calculation for paper backgrounds
export function isDarkPaperColor(hexColor) {
  if (!hexColor || typeof hexColor !== 'string') return false;
  let clean = hexColor.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) return false;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
  const luma = (r * 299 + g * 587 + b * 114) / 1000;
  return luma < 145;
}

/**
 * Draw a single photostrip onto canvas context
 */
export async function drawPhotoBoothStrip(ctx, state, w, h) {
  const photoCount = state?.photoCount || 4;
  const frameStyleId = state?.frameStyle || 'cat-photographer';
  const paperColor = state?.paperColor || '#FFFFFF';
  const filterId = state?.filter || 'none';
  const caption = state?.caption || 'KITTE PHOTOBOOTH';
  const dateText = state?.dateText || '14/10/2026';
  const showDate = state?.showDate !== false;
  const showBottomChin = state?.showBottomChin !== false;

  const currentFilter = PHOTO_BOOTH_TOKENS.filters.find(f => f.id === filterId) || PHOTO_BOOTH_TOKENS.filters[0];
  const photos = state?.photos || PHOTO_BOOTH_TOKENS.showcaseDefaults.photos;
  const activePhotos = photos.slice(0, photoCount);

  // Dark background frame & paper color detection
  const isDarkPaper = isDarkPaperColor(paperColor);
  const isDarkTheme = ['y2k-scallop-doodles', 'retro-polka-dots', 'anime-cinema-tbc'].includes(frameStyleId);
  const isDark = isDarkPaper || isDarkTheme;
  const primaryTextColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const secondaryTextColor = isDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(26, 26, 26, 0.65)';

  ctx.save();

  // 1. Strip Base with crisp real-photo edges (rounded-[4px])
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 4);
  ctx.fillStyle = paperColor;
  ctx.fill();
  ctx.clip();

  // 2. Paper Grain / Noise
  try {
    const noiseImg = await loadImage('/assets/noise.png');
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(noiseImg, 0, 0, w, h);
    ctx.restore();
  } catch {
    drawPaperGrain(ctx, w, h);
  }

  // 3. RETRO POLKA DOTS BORDER (Perimeter Running along Compact Left & Right Margins)
  if (frameStyleId === 'retro-polka-dots') {
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    const dotSpacing = 16;
    const dotRadius = 1.25;

    for (let y = 10; y < h - 10; y += dotSpacing) {
      ctx.beginPath();
      ctx.arc(3.5, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w - 3.5, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 4. 35MM FILM CINEMA SPROCKETS (Left & Right Full Height)
  if (frameStyleId === 'anime-cinema-tbc') {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    const spCount = photoCount * 6;
    const spGap = (h - 16) / spCount;
    for (let i = 0; i < spCount; i++) {
      const spY = 8 + i * spGap;
      ctx.fillRect(3.5, spY, 5, 6);
      ctx.fillRect(w - 8.5, spY, 5, 6);
    }
    ctx.restore();
  }

  // 5. TOP HEADER ACCENTS (Compact 14px area)
  ctx.save();
  if (frameStyleId === 'cat-photographer') {
    ctx.fillStyle = '#E65100';
    ctx.beginPath();
    ctx.arc(14, 10, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '900 7.5px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText('REC', 19, 10);

    ctx.textAlign = 'right';
    ctx.fillStyle = secondaryTextColor;
    ctx.fillText(`00:0${photoCount}`, w - 12, 10);
  } else if (frameStyleId === 'classic-polaroid') {
    ctx.font = '900 7px "JetBrains Mono", monospace';
    ctx.fillStyle = secondaryTextColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('— PHOTO STUDIO • 1974 —', w / 2, 10);
  } else if (frameStyleId === 'minimalist-heart') {
    ctx.font = 'bold 9.5px "adamHandwriting", cursive';
    ctx.fillStyle = secondaryTextColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('cherish moments', 12, 10);

    ctx.textAlign = 'right';
    ctx.font = '9px serif';
    ctx.fillText('♡', w - 12, 10);
  } else if (frameStyleId === 'y2k-scallop-doodles') {
    ctx.font = 'bold 8.5px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64FFDA';
    ctx.textBaseline = 'middle';
    ctx.fillText('? +', 12, 10);
    ctx.textAlign = 'center';
    ctx.font = 'bold 10.5px "adamHandwriting", cursive';
    ctx.fillStyle = primaryTextColor;
    ctx.fillText('photobooth!', w / 2, 10);
    ctx.textAlign = 'right';
    ctx.font = 'bold 8.5px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64FFDA';
    ctx.fillText('✦ ✧', w - 12, 10);
  } else if (frameStyleId === 'retro-polka-dots') {
    ctx.font = '900 7px "JetBrains Mono", monospace';
    ctx.fillStyle = primaryTextColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✿ STUDIO NOIR ✿', w / 2, 10);
  } else if (frameStyleId === 'star-chaser') {
    try {
      const starLineImg = await loadImage('/assets/star-line.webp');
      ctx.drawImage(starLineImg, (w - 95) / 2, 5, 95, 10);
    } catch {}
  } else if (frameStyleId === 'anime-cinema-tbc') {
    ctx.font = '900 7px "JetBrains Mono", monospace';
    ctx.fillStyle = '#FFA726';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★ KODAK FILM 400 ★', w / 2, 10);
  } else if (frameStyleId === 'crayon-scrapbook') {
    ctx.font = 'bold 9.5px "adamHandwriting", cursive';
    ctx.fillStyle = '#38A3A5';
    ctx.textBaseline = 'middle';
    ctx.fillText('memo: happy days', 12, 10);
    try {
      const spiralImg = await loadImage('/assets/spiral.webp');
      ctx.drawImage(spiralImg, w - 22, 5, 11, 11);
    } catch {}
  } else if (frameStyleId === 'music-melody') {
    ctx.font = '900 7px "JetBrains Mono", monospace';
    ctx.fillStyle = secondaryTextColor;
    ctx.textBaseline = 'middle';
    ctx.fillText('♫ SIDE A', 12, 10);
    ctx.textAlign = 'right';
    ctx.font = '6.5px "JetBrains Mono", monospace';
    ctx.fillText('01:23 / 03:45', w - 12, 10);
  } else if (frameStyleId === 'kawaii-dream') {
    ctx.font = 'bold 9.5px "adamHandwriting", cursive';
    ctx.fillStyle = '#E91E63';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✧･ﾟ:* sweet memories *:･ﾟ✧', w / 2, 10);
  }
  ctx.restore();

  // 6. PHOTO APERTURES EXACT 3:4 PORTRAIT RECTANGULAR CALCULATION
  const topPad = 8;
  const slotGap = 5;
  const slotH = PHOTO_BOOTH_TOKENS.strip.slotHeights[photoCount] || 208;
  const slotW = PHOTO_BOOTH_TOKENS.strip.slotWidth || 156;
  const slotX = (w - slotW) / 2;

  for (let i = 0; i < photoCount; i++) {
    const slot = activePhotos[i];
    const sY = topPad + i * (slotH + slotGap);

    ctx.save();

    // 6a. Aperture Border & Clipping Path (Individual 3:4 Portrait Rectangle Frames)
    if (frameStyleId === 'classic-clean') {
      ctx.beginPath();
      ctx.rect(slotX, sY, slotW, slotH);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#1A1A1A';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.clip();
    } else if (frameStyleId === 'y2k-scallop-doodles') {
      ctx.beginPath();
      ctx.roundRect(slotX, sY, slotW, slotH, 8);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.clip();
    } else if (frameStyleId === 'retro-polka-dots') {
      ctx.beginPath();
      ctx.rect(slotX, sY, slotW, slotH);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.clip();
    } else if (frameStyleId === 'anime-cinema-tbc') {
      ctx.beginPath();
      ctx.roundRect(slotX, sY, slotW, slotH, 1);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.clip();
    } else if (frameStyleId === 'classic-polaroid' || frameStyleId === 'minimalist-heart') {
      ctx.beginPath();
      ctx.rect(slotX, sY, slotW, slotH);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#1A1A1A';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.clip();
    } else if (frameStyleId === 'kawaii-dream') {
      ctx.beginPath();
      ctx.roundRect(slotX, sY, slotW, slotH, 3);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#F48FB1';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.clip();
    } else {
      ctx.beginPath();
      ctx.roundRect(slotX, sY, slotW, slotH, 1.5);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = isDarkFrame ? 'rgba(255, 255, 255, 0.85)' : '#1A1A1A';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.clip();
    }

    // 6b. Photo Rendering with Pan, Zoom, Rotation, and Filter
    if (slot && slot.src) {
      try {
        const photoImg = await loadImage(slot.src);
        ctx.save();

        if (currentFilter.cssFilter && currentFilter.cssFilter !== 'none') {
          ctx.filter = currentFilter.cssFilter;
        }

        const imgRatio = photoImg.width / photoImg.height;
        const boxRatio = slotW / slotH;
        let baseW, baseH;
        if (imgRatio > boxRatio) {
          // Cover height, expand width to fill frame completely
          baseH = slotH;
          baseW = slotH * imgRatio;
        } else {
          // Cover width, expand height to fill frame completely
          baseW = slotW;
          baseH = slotW / imgRatio;
        }

        const scale = slot.scale || 1;
        const finalW = baseW * scale;
        const finalH = baseH * scale;
        const offX = ((slot.offsetX || 0) / 100) * slotW;
        const offY = ((slot.offsetY || 0) / 100) * slotH;
        const centerX = slotX + slotW / 2 + offX;
        const centerY = sY + slotH / 2 + offY;

        ctx.translate(centerX, centerY);
        if (slot.rotation) {
          ctx.rotate((slot.rotation * Math.PI) / 180);
        }
        ctx.drawImage(photoImg, -finalW / 2, -finalH / 2, finalW, finalH);
        ctx.restore();
      } catch {
        ctx.fillStyle = '#E5E0D8';
        ctx.fillRect(slotX, sY, slotW, slotH);
      }
    } else {
      ctx.fillStyle = '#E5E0D8';
      ctx.fillRect(slotX, sY, slotW, slotH);
    }

    // Classic Polaroid Mounting Corners
    if (frameStyleId === 'classic-polaroid') {
      ctx.save();
      ctx.fillStyle = '#1A1A1A';
      ctx.beginPath();
      ctx.moveTo(slotX, sY);
      ctx.lineTo(slotX + 7, sY);
      ctx.lineTo(slotX, sY + 7);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(slotX + slotW, sY + slotH);
      ctx.lineTo(slotX + slotW - 7, sY + slotH);
      ctx.lineTo(slotX + slotW, sY + slotH - 7);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();

    // 6c. Wrap-Around Style-Specific Decorations (Corners, Dividers, Margin stickers)
    ctx.save();

    // --- Cat Photographer ---
    if (frameStyleId === 'cat-photographer') {
      if (i === 0) {
        ctx.font = 'bold 6px "JetBrains Mono", monospace';
        ctx.fillStyle = '#E65100';
        ctx.textAlign = 'right';
        ctx.fillText('ISO 400 • 1/250s', slotX + slotW - 2, sY - 1);
      }
      if (i === 1) {
        try {
          const spiralImg = await loadImage('/assets/spiral.webp');
          ctx.drawImage(spiralImg, slotX - 4, sY + 2, 13, 13);
        } catch {}
      }
      if (i === 0 && photoCount > 1) {
        try {
          const starLineImg = await loadImage('/assets/star-line.webp');
          ctx.drawImage(starLineImg, (w - 70) / 2, sY + slotH + 1, 70, 5);
        } catch {}
      }
      if (i === 1 && photoCount > 2) {
        try {
          const starLineImg = await loadImage('/assets/star-line.webp');
          ctx.drawImage(starLineImg, (w - 70) / 2, sY + slotH + 1, 70, 5);
        } catch {}
      }
      if (i === 2) {
        try {
          const spiralImg = await loadImage('/assets/spiral.webp');
          ctx.drawImage(spiralImg, slotX + slotW - 9, sY + 2, 12, 12);
        } catch {}
      }
    }

    // --- Classic Polaroid Studio ---
    if (frameStyleId === 'classic-polaroid') {
      ctx.save();
      ctx.font = 'bold 6px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(26, 26, 26, 0.65)';
      ctx.translate(slotX - 3.5, sY + slotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(`0${i + 1}`, 0, 0);
      ctx.restore();

      if (i < photoCount - 1) {
        ctx.font = '5.5px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(26, 26, 26, 0.45)';
        ctx.textAlign = 'center';
        ctx.fillText('• • • • •', w / 2, sY + slotH + 4);
      }
    }

    // --- Minimalist Heart (Reference Image 1) ---
    if (frameStyleId === 'minimalist-heart') {
      if (i === 0) {
        try {
          const heartImg = await loadImage('/assets/heart-doodle.webp');
          ctx.drawImage(heartImg, slotX + slotW - 12, sY - 4, 13, 13);
        } catch {}
      }
      if (i === 1) {
        try {
          const heartImg = await loadImage('/assets/heart-doodle.webp');
          ctx.drawImage(heartImg, slotX - 4, sY + 4, 14, 14);
        } catch {}
      }
      if (i === 2) {
        try {
          const heartImg = await loadImage('/assets/heart-doodle.webp');
          ctx.drawImage(heartImg, slotX + slotW - 10, sY + 4, 13, 13);
        } catch {}
      }
      if (i < photoCount - 1) {
        ctx.font = 'bold 6px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(26, 26, 26, 0.6)';
        ctx.textAlign = 'center';
        ctx.fillText('- ♡ -', w / 2, sY + slotH + 4.5);
      }
    }

    // --- Y2K Scallop & Chalk Doodles (Reference Image 4) ---
    if (frameStyleId === 'y2k-scallop-doodles') {
      if (i === 0) {
        ctx.font = 'bold 10px "adamHandwriting", cursive';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('?', slotX + 2, sY - 2);
        ctx.font = 'bold 8.5px "JetBrains Mono", monospace';
        ctx.fillStyle = '#64FFDA';
        ctx.textAlign = 'right';
        ctx.fillText('✦ ✧', slotX + slotW - 2, sY - 2);
      }
      if (i === 0 && photoCount > 1) {
        ctx.font = 'bold 8px "adamHandwriting", cursive';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.fillText('☼', slotX + 4, sY + slotH + 4.5);
        ctx.textAlign = 'right';
        ctx.fillText('~ 〰', slotX + slotW - 4, sY + slotH + 4.5);
      }
      if (i === 1) {
        ctx.font = 'bold 12px "adamHandwriting", cursive';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('♡', slotX - 4, sY + slotH / 2);
        try {
          const pcsImg = await loadImage('/assets/pcs.webp');
          ctx.save();
          ctx.filter = 'invert(100%) brightness(200%)';
          ctx.drawImage(pcsImg, slotX + slotW - 14, sY + 4, 16, 10);
          ctx.restore();
        } catch {}
      }
      if (i === 1 && photoCount > 2) {
        ctx.font = 'bold 8px "adamHandwriting", cursive';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.fillText('xoxo', slotX + 4, sY + slotH + 4.5);
        ctx.textAlign = 'right';
        ctx.fillText('♛', slotX + slotW - 4, sY + slotH + 4.5);
      }
      if (i === 2) {
        ctx.font = 'bold 8px "JetBrains Mono", monospace';
        ctx.fillStyle = '#64FFDA';
        ctx.textAlign = 'left';
        ctx.fillText('✦', slotX + 3, sY + slotH + 4.5);
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'right';
        ctx.fillText('!!', slotX + slotW - 3, sY + slotH + 4.5);
      }
    }

    // --- Retro Polka Dots (Reference Image 5) ---
    if (frameStyleId === 'retro-polka-dots') {
      if (i === 0) {
        try {
          const flImg = await loadImage('/assets/flower.webp');
          ctx.save();
          ctx.filter = 'invert(100%) brightness(200%)';
          ctx.drawImage(flImg, slotX + slotW - 12, sY - 4, 14, 14);
          ctx.restore();
        } catch {}
      }
      if (i === 1) {
        try {
          const flImg = await loadImage('/assets/flower.webp');
          ctx.save();
          ctx.filter = 'invert(100%) brightness(200%)';
          ctx.drawImage(flImg, slotX - 4, sY + 3, 13, 13);
          ctx.restore();
        } catch {}
      }
      if (i === 2) {
        try {
          const flImg = await loadImage('/assets/flower.webp');
          ctx.save();
          ctx.filter = 'invert(100%) brightness(200%)';
          ctx.drawImage(flImg, slotX + slotW - 9, sY + 3, 13, 13);
          ctx.restore();
        } catch {}
      }
      if (i < photoCount - 1) {
        ctx.font = '6.5px serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText('• ✿ •', w / 2, sY + slotH + 4.5);
      }
    }

    // --- Star Chaser ---
    if (frameStyleId === 'star-chaser') {
      if (i === 0) {
        try {
          const starPatt = await loadImage('/assets/star-patt.webp');
          ctx.drawImage(starPatt, slotX - 4, sY - 4, 14, 14);
        } catch {}
      }
      if (i === 1) {
        try {
          const starPatt = await loadImage('/assets/star-patt.webp');
          ctx.drawImage(starPatt, slotX + slotW - 10, sY + 3, 13, 13);
        } catch {}
      }
      if (i === 2) {
        try {
          const starPatt = await loadImage('/assets/star-patt.webp');
          ctx.drawImage(starPatt, slotX - 4, sY + 3, 13, 13);
        } catch {}
      }
      if (i < photoCount - 1) {
        try {
          const starLineImg = await loadImage('/assets/star-line.webp');
          ctx.drawImage(starLineImg, (w - 75) / 2, sY + slotH + 1, 75, 4.5);
        } catch {}
      }
    }

    // --- Anime Cinema 35mm ---
    if (frameStyleId === 'anime-cinema-tbc') {
      ctx.save();
      ctx.font = '900 6px "JetBrains Mono", monospace';
      ctx.fillStyle = '#FFA726';
      ctx.translate(slotX - 4, sY + slotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(`2${i + 4} ▶`, 0, 0);
      ctx.restore();

      ctx.save();
      ctx.font = 'bold 5px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.translate(slotX + slotW + 4, sY + slotH / 2);
      ctx.rotate(Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText('400', 0, 0);
      ctx.restore();
    }

    // --- Crayon Scrapbook ---
    if (frameStyleId === 'crayon-scrapbook') {
      if (i === 0) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 209, 102, 0.85)';
        ctx.fillRect(slotX - 1, sY - 2, 11, 4);
        ctx.fillStyle = 'rgba(6, 214, 160, 0.85)';
        ctx.fillRect(slotX + slotW - 10, sY - 2, 11, 4);
        ctx.restore();
      }
      if (i === 1) {
        try {
          const spiralImg = await loadImage('/assets/spiral.webp');
          ctx.drawImage(spiralImg, slotX + slotW - 9, sY + 3, 12, 12);
        } catch {}
        try {
          const heartImg = await loadImage('/assets/heart-doodle.webp');
          ctx.drawImage(heartImg, slotX - 4, sY + 3, 12, 12);
        } catch {}
      }
      if (i === 2) {
        try {
          const spiralImg = await loadImage('/assets/spiral.webp');
          ctx.drawImage(spiralImg, slotX - 4, sY + 3, 12, 12);
        } catch {}
      }
      if (i < photoCount - 1) {
        ctx.font = 'bold 7.5px "adamHandwriting", cursive';
        ctx.fillStyle = '#38A3A5';
        ctx.textAlign = 'center';
        ctx.fillText('- - ✎ - -', w / 2, sY + slotH + 4.5);
      }
    }

    // --- Music Melody ---
    if (frameStyleId === 'music-melody') {
      if (i === 0) {
        try {
          const musicImg = await loadImage('/assets/music-key.webp');
          ctx.drawImage(musicImg, slotX - 4, sY - 4, 13, 13);
        } catch {}
      }
      if (i === 1) {
        try {
          const musicImg = await loadImage('/assets/music-key.webp');
          ctx.drawImage(musicImg, slotX + slotW - 9, sY + 3, 13, 13);
        } catch {}
      }
      if (i === 2) {
        try {
          const musicImg = await loadImage('/assets/music-key.webp');
          ctx.drawImage(musicImg, slotX - 4, sY + 3, 12, 12);
        } catch {}
      }
      if (i < photoCount - 1) {
        ctx.font = 'bold 6.5px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(26, 26, 26, 0.6)';
        ctx.textAlign = 'center';
        ctx.fillText('♩ ♪ ♫ ♬', w / 2, sY + slotH + 4);
      }
    }

    // --- Kawaii Dream ---
    if (frameStyleId === 'kawaii-dream') {
      if (i === 0) {
        try {
          const flImg = await loadImage('/assets/flower.webp');
          ctx.drawImage(flImg, slotX + slotW - 10, sY - 4, 13, 13);
        } catch {}
      }
      if (i === 1) {
        try {
          const starPatt = await loadImage('/assets/star-patt.webp');
          ctx.drawImage(starPatt, slotX - 4, sY + 3, 13, 13);
        } catch {}
      }
      if (i === 2) {
        try {
          const flImg = await loadImage('/assets/flower.webp');
          ctx.drawImage(flImg, slotX + slotW - 9, sY + 3, 13, 13);
        } catch {}
      }
      if (i < photoCount - 1) {
        ctx.font = 'bold 7.5px "adamHandwriting", cursive';
        ctx.fillStyle = '#E91E63';
        ctx.textAlign = 'center';
        ctx.fillText('✧ · ♡ · ✧', w / 2, sY + slotH + 4.5);
      }
    }

    ctx.restore();
  }

  // 7. BOTTOM CHIN RENDERING (Compact 42px Height Area, Only if showBottomChin === true)
  if (showBottomChin) {
    const chinY = h - 42;
    ctx.save();

    if (frameStyleId === 'classic-clean') {
      ctx.font = '900 9px "JetBrains Mono", monospace';
      ctx.fillStyle = primaryTextColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(caption, w / 2, chinY + (showDate ? 16 : 21));

      if (showDate) {
        ctx.font = 'bold 7px "JetBrains Mono", monospace';
        ctx.fillStyle = secondaryTextColor;
        ctx.fillText(dateText, w / 2, chinY + 28);
      }
    } else if (frameStyleId === 'cat-photographer') {
      ctx.font = 'bold 11px "Permanent Marker", cursive';
      ctx.fillStyle = primaryTextColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(caption, 10, chinY + 8);

      if (showDate) {
        ctx.font = 'bold 7px "JetBrains Mono", monospace';
        ctx.fillStyle = secondaryTextColor;
        ctx.fillText(dateText, 10, chinY + 23);
      }

      try {
        const catImg = await loadImage('/assets/cat-dsrl.webp');
        ctx.save();
        ctx.translate(w - 26, chinY + 20);
        ctx.rotate(-4 * Math.PI / 180);
        if (isDark) {
          ctx.filter = 'invert(100%) brightness(175%)';
        }
        ctx.drawImage(catImg, -18, -18, 36, 36);
        ctx.restore();
      } catch {}

    } else if (frameStyleId === 'classic-polaroid') {
      ctx.font = 'bold 10px "Permanent Marker", cursive';
      ctx.fillStyle = primaryTextColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(caption, 10, chinY + 8);

      if (showDate) {
        ctx.font = 'bold 7px "JetBrains Mono", monospace';
        ctx.fillStyle = secondaryTextColor;
        ctx.fillText(dateText, 10, chinY + 23);
      }

      try {
        const stampImg = await loadImage('/assets/certified-stamp.webp');
        ctx.save();
        ctx.translate(w - 24, chinY + 18);
        ctx.rotate(6 * Math.PI / 180);
        if (isDark) {
          ctx.filter = 'invert(100%) brightness(150%)';
        }
        ctx.drawImage(stampImg, -13, -13, 26, 26);
        ctx.restore();
      } catch {}

    } else if (frameStyleId === 'minimalist-heart') {
      ctx.font = '900 9.5px "JetBrains Mono", monospace';
      ctx.fillStyle = primaryTextColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(caption, 10, chinY + 8);

      if (showDate) {
        ctx.font = 'bold 7px "JetBrains Mono", monospace';
        ctx.fillStyle = secondaryTextColor;
        ctx.fillText(dateText, 10, chinY + 22);
      }

      try {
        const heartImg = await loadImage('/assets/heart-doodle.webp');
        ctx.save();
        if (isDark) {
          ctx.filter = 'invert(100%) brightness(200%)';
        }
        ctx.drawImage(heartImg, w - 32, chinY + 6, 24, 24);
        ctx.restore();
      } catch {}

    } else if (frameStyleId === 'y2k-scallop-doodles') {
      ctx.font = 'bold 11px "adamHandwriting", cursive';
      ctx.fillStyle = primaryTextColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(caption, 10, chinY + 8);

      if (showDate) {
        ctx.font = 'bold 7px "JetBrains Mono", monospace';
        ctx.fillStyle = secondaryTextColor;
        ctx.fillText(dateText, 10, chinY + 23);
      }

      try {
        const pcsImg = await loadImage('/assets/pcs.webp');
        ctx.save();
        if (isDark) {
          ctx.filter = 'invert(100%) brightness(200%)';
        }
        ctx.drawImage(pcsImg, w - 36, chinY + 9, 28, 18);
        ctx.restore();
      } catch {}

    } else if (frameStyleId === 'retro-polka-dots') {
      ctx.font = '900 9.5px "JetBrains Mono", monospace';
      ctx.fillStyle = primaryTextColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(caption, 10, chinY + 8);

      if (showDate) {
        ctx.font = 'bold 7px "JetBrains Mono", monospace';
        ctx.fillStyle = secondaryTextColor;
        ctx.fillText(dateText, 10, chinY + 22);
      }

      try {
        const flowerImg = await loadImage('/assets/flower.webp');
        ctx.save();
        if (isDark) {
          ctx.filter = 'invert(100%) brightness(200%)';
        }
        ctx.translate(w - 24, chinY + 18);
        ctx.rotate(12 * Math.PI / 180);
        ctx.drawImage(flowerImg, -12, -12, 24, 24);
        ctx.restore();
      } catch {}

    } else if (frameStyleId === 'anime-cinema-tbc') {
      try {
        const tbcImg = await loadImage('/assets/tbc.webp');
        ctx.save();
        ctx.translate(w / 2, chinY + 11);
        ctx.rotate(-1 * Math.PI / 180);
        if (isDark) {
          ctx.filter = 'invert(100%) brightness(200%)';
        }
        ctx.drawImage(tbcImg, -55, -9, 110, 18);
        ctx.restore();
      } catch {}

      ctx.font = 'bold 6.5px "JetBrains Mono", monospace';
      ctx.fillStyle = secondaryTextColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(caption, 14, chinY + 28);

      if (showDate) {
        ctx.textAlign = 'right';
        ctx.fillText(dateText, w - 14, chinY + 28);
      }

    } else if (frameStyleId === 'star-chaser') {
      ctx.font = 'bold 10px "Permanent Marker", cursive';
      ctx.fillStyle = primaryTextColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(caption, 10, chinY + 8);

      if (showDate) {
        ctx.font = 'bold 7px "JetBrains Mono", monospace';
        ctx.fillStyle = secondaryTextColor;
        ctx.fillText(dateText, 10, chinY + 23);
      }

      try {
        const starPattImg = await loadImage('/assets/star-patt.webp');
        ctx.save();
        if (isDark) {
          ctx.filter = 'invert(100%) brightness(200%)';
        }
        ctx.drawImage(starPattImg, w - 32, chinY + 5, 25, 25);
        ctx.restore();
      } catch {}

    } else if (frameStyleId === 'crayon-scrapbook') {
      ctx.font = 'bold 11px "adamHandwriting", cursive';
      ctx.fillStyle = primaryTextColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(caption, 10, chinY + 8);

      if (showDate) {
        ctx.font = 'bold 7px "JetBrains Mono", monospace';
        ctx.fillStyle = secondaryTextColor;
        ctx.fillText(dateText, 10, chinY + 23);
      }

      try {
        const heartDoodleImg = await loadImage('/assets/heart-doodle.webp');
        ctx.save();
        if (isDark) {
          ctx.filter = 'invert(100%) brightness(200%)';
        }
        ctx.drawImage(heartDoodleImg, w - 32, chinY + 6, 24, 24);
        ctx.restore();
      } catch {}

    } else if (frameStyleId === 'music-melody') {
      ctx.font = '900 9px "JetBrains Mono", monospace';
      ctx.fillStyle = primaryTextColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`♫ ${caption}`, 10, chinY + 8);

      if (showDate) {
        ctx.font = 'bold 7px "JetBrains Mono", monospace';
        ctx.fillStyle = secondaryTextColor;
        ctx.fillText(dateText, 10, chinY + 23);
      }

      try {
        const musicImg = await loadImage('/assets/music-key.webp');
        ctx.save();
        if (isDark) {
          ctx.filter = 'invert(100%) brightness(200%)';
        }
        ctx.drawImage(musicImg, w - 32, chinY + 6, 24, 24);
        ctx.restore();
      } catch {}

    } else if (frameStyleId === 'kawaii-dream') {
      ctx.font = 'bold 10px "Permanent Marker", cursive';
      ctx.fillStyle = isDark ? '#FF80AB' : '#E91E63';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(caption, 10, chinY + 8);

      if (showDate) {
        ctx.font = 'bold 7px "JetBrains Mono", monospace';
        ctx.fillStyle = secondaryTextColor;
        ctx.fillText(dateText, 10, chinY + 23);
      }

      try {
        const flowerImg = await loadImage('/assets/flower.webp');
        ctx.save();
        if (isDark) {
          ctx.filter = 'invert(100%) brightness(200%)';
        }
        ctx.drawImage(flowerImg, w - 32, chinY + 6, 24, 24);
        ctx.restore();
      } catch {}

    } else {
      ctx.font = 'bold 10px "Permanent Marker", cursive';
      ctx.fillStyle = primaryTextColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(caption, w / 2, chinY + 9);

      if (showDate) {
        ctx.font = 'bold 7px "JetBrains Mono", monospace';
        ctx.fillStyle = secondaryTextColor;
        ctx.fillText(dateText, w / 2, chinY + 24);
      }
    }

    ctx.restore();
  } else {
    // Pure photo frames without chin (clean bottom margin, no overlapping stickers)
    ctx.save();
    ctx.restore();
  }

  // 8. Outer Strip Border (rounded-[4px] border-[2.5px] border-[#1A1A1A])
  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 4);
  ctx.stroke();

  ctx.restore();
}

/**
 * Universal Photo Booth Export Generator
 * Produces a high-resolution 300 DPI single photostrip with precision crop marks.
 */
export async function renderPhotoBoothExport(state, mode = 'single', includeBleed = false) {
  const photoCount = state?.photoCount || 4;
  const showBottomChin = state?.showBottomChin !== false;
  const w = PHOTO_BOOTH_TOKENS.strip.width || 168;
  const h = showBottomChin 
    ? (PHOTO_BOOTH_TOKENS.strip.heightsWithChin[photoCount] || 910)
    : (PHOTO_BOOTH_TOKENS.strip.heightsWithoutChin[photoCount] || 863);
  const scale = DPI_SCALE;
  const margin = includeBleed ? 35 : 0;

  // Single Photostrip canvas (exact photostrip size when includeBleed is false, or with trim margins when true)
  const canvasW = (w + margin * 2) * scale;
  const canvasH = (h + margin * 2) * scale;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');

  if (includeBleed) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.save();
    ctx.translate(margin * scale, margin * scale);
    ctx.scale(scale, scale);
    await drawPhotoBoothStrip(ctx, state, w, h);
    ctx.restore();
    drawCropMarks(ctx, margin * scale, margin * scale, w * scale, h * scale, scale);
  } else {
    // Exact 1:1 photostrip (zero white margins, exact photostrip product matching reference)
    ctx.save();
    ctx.scale(scale, scale);
    await drawPhotoBoothStrip(ctx, state, w, h);
    ctx.restore();
  }

  return {
    type: 'single',
    canvas,
    unitW: w,
    unitH: h,
  };
}
