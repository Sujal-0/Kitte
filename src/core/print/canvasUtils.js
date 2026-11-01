/**
 * Universal Canvas 2D Utilities for Print & Graphics
 */

export const DPI_SCALE = 4; // 4x scale = ~300 DPI output

/**
 * Image loader cache
 */
const imageCache = new Map();

export function loadImage(src) {
  if (!src) return Promise.reject(new Error('No image src'));
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src));

  return new Promise((resolve, reject) => {
    const img = new Image();
    if (typeof src === 'string' && !src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Map Tailwind / Project font classes to Canvas font family strings
 */
export function mapFont(fontClass) {
  switch (fontClass) {
    case 'font-sans':
    case 'sans':
    case 'font-inter':
    case 'inter':
      return '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    case 'font-serif':
    case 'serif':
    case 'font-playfair':
    case 'playfair':
      return '"Playfair Display", Georgia, "Times New Roman", serif';
    case 'font-impact':
    case 'impact':
      return 'Impact, "Arial Black", sans-serif';
    case 'font-marker':
    case 'marker':
      return '"adamHandwriting", "Permanent Marker", "Caveat", cursive, sans-serif';
    case 'font-courier':
    case 'courier':
    case 'courierPrime':
    case 'font-courierPrime':
      return '"Courier Prime", "Courier New", monospace';
    case 'font-specialElite':
    case 'specialElite':
      return '"Special Elite", cursive, monospace';
    case 'font-caveat':
    case 'caveat':
      return '"Caveat", cursive';
    case 'font-times':
    case 'times':
      return '"Times New Roman", "Libre Caslon Text", serif';
    case 'font-caslon':
    case 'caslon':
      return '"Libre Caslon Text", Georgia, serif';
    case 'font-onepiece':
    case 'onepiece':
      return '"OnePieceFont", "Libre Caslon Text", serif';
    case 'font-wanted':
    case 'vertiky':
    case 'wanted':
      return '"Vertiky", "Playfair Display", Georgia, serif';
    case 'font-mono':
    case 'mono':
    default:
      return '"JetBrains Mono", monospace';
  }
}

/**
 * Ensure Google Fonts and custom fonts are loaded in document before rendering
 */
export async function ensureFontsLoaded() {
  if (typeof document === 'undefined' || !document.fonts) return;

  const fontFamilies = [
    'JetBrains Mono',
    'Inter',
    'Playfair Display',
    'Permanent Marker',
    'creative',
    'adamHandwriting',
    'Patrick Hand',
    'Vertiky',
    'OnePieceFont',
    'Libre Caslon Text',
    'Courier Prime',
    'Special Elite',
    'Caveat'
  ];

  const loads = fontFamilies.map(fam => {
    return document.fonts.load(`16px "${fam}"`).catch(() => {});
  });

  await Promise.all(loads);
  await document.fonts.ready;
}

/**
 * Wrap text cleanly within a maximum width.
 */
export function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  if (!text) return;
  const paragraphs = text.split('\n');
  let curY = y;

  paragraphs.forEach(para => {
    const words = para.split(' ');
    let line = '';

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        ctx.fillText(line, x, curY);
        line = word;
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, x, curY);
      curY += lineHeight;
    }
  });
}

/**
 * Word wrap helper for centered text
 */
export function wrapCenteredLines(ctx, text, centerX, startY, maxWidth, lineHeight) {
  if (!text) return startY;
  const words = text.split(' ');
  let line = '';
  let curY = startY;
  ctx.textAlign = 'center';

  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, centerX, curY);
      line = word;
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, centerX, curY);
    curY += lineHeight;
  }
  return curY;
}

/**
 * Word wrap helper for right-aligned text
 */
export function wrapRightLines(ctx, text, rightX, startY, maxWidth, lineHeight) {
  if (!text) return startY;
  const words = text.split(' ');
  let line = '';
  let curY = startY;
  ctx.textAlign = 'right';

  for (let word of words) {
    while (ctx.measureText(word).width > maxWidth) {
      let sub = '';
      for (let i = 0; i < word.length; i++) {
        if (ctx.measureText(sub + word[i]).width > maxWidth) {
          break;
        }
        sub += word[i];
      }
      if (!sub) sub = word[0];
      if (line) {
        ctx.fillText(line, rightX, curY);
        curY += lineHeight;
        line = '';
      }
      ctx.fillText(sub, rightX, curY);
      curY += lineHeight;
      word = word.slice(sub.length);
    }

    const testLine = line + (line ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, rightX, curY);
      line = word;
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, rightX, curY);
    curY += lineHeight;
  }
  return curY;
}

/**
 * Draw 5-pointed star
 */
export function draw5PointStar(ctx, cx, cy, outerR = 10, innerR = 4.2) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Procedural paper grain for authentic vintage physical feel
 */
export function drawPaperGrain(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(26, 26, 26, 0.02)';
  for (let i = 0; i < 400; i++) {
    const gx = Math.random() * w;
    const gy = Math.random() * h;
    const gr = Math.random() * 1.5;
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Placeholder when no portrait photo is uploaded
 */
export function drawEmptyPortraitPlaceholder(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#E5E0D8';
  ctx.fillRect(x, y, w, h);
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#737373';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('UPLOAD PORTRAIT', x + w / 2, y + h / 2);
  ctx.restore();
}

/**
 * Convert SVG elliptical arc to Canvas 2D arc / bezier curves
 */
export function svgArcToCanvas(ctx, x1, y1, rx, ry, phi, fA, fS, x2, y2) {
  if (rx === 0 || ry === 0) {
    ctx.lineTo(x2, y2);
    return;
  }
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  const phiRad = (phi * Math.PI) / 180;
  const cosPhi = Math.cos(phiRad);
  const sinPhi = Math.sin(phiRad);

  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = cosPhi * dx + sinPhi * dy;
  const y1p = -sinPhi * dx + cosPhi * dy;

  let lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }

  const sign = fA === fS ? -1 : 1;
  const sq = ((rx * rx * ry * ry) - (rx * rx * y1p * y1p) - (ry * ry * x1p * x1p)) /
             ((rx * rx * y1p * y1p) + (ry * ry * x1p * x1p));
  const coef = sign * Math.sqrt(Math.max(0, sq));
  const cxp = coef * ((rx * y1p) / ry);
  const cyp = coef * (-(ry * x1p) / rx);

  const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;

  const theta1 = Math.atan2((y1p - cyp) / ry, (x1p - cxp) / rx);
  let dTheta = Math.atan2((-y1p - cyp) / ry, (-x1p - cxp) / rx) - theta1;

  if (fS === 0 && dTheta > 0) dTheta -= 2 * Math.PI;
  if (fS === 1 && dTheta < 0) dTheta += 2 * Math.PI;

  const segments = Math.ceil(Math.abs(dTheta) / (Math.PI / 2));
  const delta = dTheta / segments;
  const t = (8 / 3) * Math.sin(delta / 4) * Math.sin(delta / 4) / Math.sin(delta / 2);

  let currentAngle = theta1;
  for (let s = 0; s < segments; s++) {
    const nextAngle = currentAngle + delta;
    const cos1 = Math.cos(currentAngle);
    const sin1 = Math.sin(currentAngle);
    const cos2 = Math.cos(nextAngle);
    const sin2 = Math.sin(nextAngle);

    const cp1x = cosPhi * rx * (cos1 - t * sin1) - sinPhi * ry * (sin1 + t * cos1) + cx;
    const cp1y = sinPhi * rx * (cos1 - t * sin1) + cosPhi * ry * (sin1 + t * cos1) + cy;
    const cp2x = cosPhi * rx * (cos2 + t * sin2) - sinPhi * ry * (sin2 - t * cos2) + cx;
    const cp2y = sinPhi * rx * (cos2 + t * sin2) + cosPhi * ry * (sin2 - t * cos2) + cy;
    const endX = cosPhi * rx * cos2 - sinPhi * ry * sin2 + cx;
    const endY = sinPhi * rx * cos2 + cosPhi * ry * sin2 + cy;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    currentAngle = nextAngle;
  }
}

/**
 * Parse an SVG path string into Canvas 2D commands.
 */
export function drawSVGPath(ctx, pathStr, mirrorW = 0) {
  const tokens = pathStr.trim().replace(/,/g, ' ').split(/\s+/);
  let i = 0;
  let cx = 0, cy = 0;

  const getX = (val) => mirrorW > 0 ? (mirrorW - val) : val;

  ctx.beginPath();

  while (i < tokens.length) {
    const cmd = tokens[i];

    if (cmd === 'M') {
      const rawX = parseFloat(tokens[i + 1]);
      cy = parseFloat(tokens[i + 2]);
      cx = getX(rawX);
      ctx.moveTo(cx, cy);
      i += 3;
    } else if (cmd === 'L') {
      const rawX = parseFloat(tokens[i + 1]);
      cy = parseFloat(tokens[i + 2]);
      cx = getX(rawX);
      ctx.lineTo(cx, cy);
      i += 3;
    } else if (cmd === 'A') {
      const rx = parseFloat(tokens[i + 1]);
      const ry = parseFloat(tokens[i + 2]);
      const largeArc = parseInt(tokens[i + 4]);
      let sweep = parseInt(tokens[i + 5]);
      if (mirrorW > 0) sweep = sweep === 1 ? 0 : 1;
      const rawEx = parseFloat(tokens[i + 6]);
      const ey = parseFloat(tokens[i + 7]);
      const ex = getX(rawEx);

      svgArcToCanvas(ctx, cx, cy, rx, ry, parseFloat(tokens[i + 3]), largeArc, sweep, ex, ey);
      cx = ex;
      cy = ey;
      i += 8;
    } else if (cmd === 'Z') {
      ctx.closePath();
      i += 1;
    } else {
      i++;
    }
  }
}
