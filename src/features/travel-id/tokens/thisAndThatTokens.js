/**
 * This & That (Stray Kids theme) Shared Design Tokens
 * Used identically by both React component and Canvas 2D exporter.
 */

export const THIS_AND_THAT_TOKENS = {
  card: {
    width: 760,
    height: 480,
    radius: 20,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    defaultBg: '#F3EEDA',
  },
  colors: {
    orange: '#E65100',
    orangeBright: '#F05A28',
    teal: '#38A3A5',
    tealDark: '#22577A',
    dark: '#1A1A1A',
    tanWatermark: '#E29A64',
  },
  cornerStripes: {
    topLeft: { x: 22, y: 20, count: 4, width: 4.5, spacing: 6, angle: -45 },
    topRight: { x: 698, y: 20, count: 4, width: 4.5, spacing: 6, angle: 45 },
  },
  topLeftBadge: {
    x: 84,
    y: 42,
    width: 76,
    height: 28,
  },
  photo: {
    x: 48,
    y: 72,
    width: 224,
    height: 280,
    borderWidth: 4,
    orangeBarHeight: 28,
  },
  barcode: {
    x: 48,
    y: 396,
    width: 172,
    height: 40,
    tealHashesX: 228,
    tealHashesY: 412,
  },
  divider: {
    x: 295,
    y1: 45,
    y2: 440,
  },
  header: {
    x: 325,
    y: 45,
    thisSize: 46,
    circleDiameter: 34,
    thatSize: 56,
    subtitleY: 122,
    tealLineY: 142,
  },
  fields: {
    nameBox: { x: 325, y: 162, width: 385, height: 44 },
    occupancy: { x: 325, y: 230 },
    dateOfIssue: { x: 325, y: 298 },
  },
  frontWatermark: {
    x: 520,
    y: 300,
    width: 260,
    rotation: -10,
    opacity: 0.16,
  },
  bottomRight: {
    orangeBarX: 325,
    orangeBarY: 432,
    tealHashesX: 435,
    tealHashesY: 432,
    codeX: 520,
    codeY: 434,
    cat: { x: 635, y: 348, width: 95, height: 105, rotation: 3 },
    skzStamp: { x: 570, y: 350, width: 72, height: 72, rotation: -6 },
  },
  back: {
    diamonds: {
      boxW: 704,
      boxH: 424,
      size: 14,
      hCount: 19,
      vCount: 11,
    },
    header: {
      identityX: 58,
      identityY: 52,
      strayKidsX: 58,
      strayKidsY: 78,
    },
    certText: {
      x: 390,
      y: 52,
      width: 320,
    },
    watermark: {
      centerX: 380,
      centerY: 275,
      rotation: -15,
      opacity: 0.40,
    },
    ruledLines: {
      x1: 58,
      x2: 702,
      lines: [225, 275, 325, 375],
    },
    assets: {
      cat: { x: 625, y: 335, width: 98, height: 108, rotation: 4 },
      skz: { x: 68, y: 335, width: 85, height: 85, rotation: -8 },
      straykidsWatermark: { x: 420, y: 155, width: 190, rotation: -6, opacity: 0.25 },
    },
  },
  showcaseDefaults: {
    name: 'HWANG HYUNJIN',
    occupancy: 'STAY',
    dateOfIssue: '08/07/2026',
    idNumber: 'SKZ-080726',
    certText: 'This is to certify that the person\nnamed and described above is\ndeclared to be one and only mine.',
    note: 'Always by your side, everywhere all around the world.',
    catAsset: '/assets/cat-bottomRight.webp',
    skzAsset: '/assets/skz.webp',
    strayKidsAsset: '/assets/straykids.webp',
  },
};

/**
 * Generate exact pixel coordinates for the back diamond perimeter.
 * Guarantees exactly 1 diamond placed at each of the 4 rounded corners,
 * with perfectly uniform spacing along all four edges.
 */
export function generateDiamondPositions(
  w = THIS_AND_THAT_TOKENS.card.width,
  h = THIS_AND_THAT_TOKENS.card.height,
  boxW = THIS_AND_THAT_TOKENS.back.diamonds.boxW,
  boxH = THIS_AND_THAT_TOKENS.back.diamonds.boxH,
  hCount = THIS_AND_THAT_TOKENS.back.diamonds.hCount,
  vCount = THIS_AND_THAT_TOKENS.back.diamonds.vCount
) {
  const offX = (w - boxW) / 2;
  const offY = (h - boxH) / 2;
  const positions = [];

  // Top edge (from top-left corner index 0 to top-right corner index hCount-1)
  for (let i = 0; i < hCount; i++) {
    positions.push({
      x: offX + (boxW / (hCount - 1)) * i,
      y: offY,
      edge: 'top',
      index: i,
    });
  }

  // Bottom edge (from bottom-left corner index 0 to bottom-right corner index hCount-1)
  for (let i = 0; i < hCount; i++) {
    positions.push({
      x: offX + (boxW / (hCount - 1)) * i,
      y: offY + boxH,
      edge: 'bottom',
      index: i,
    });
  }

  // Left edge (excluding the 2 corners)
  for (let j = 1; j < vCount - 1; j++) {
    positions.push({
      x: offX,
      y: offY + (boxH / (vCount - 1)) * j,
      edge: 'left',
      index: j,
    });
  }

  // Right edge (excluding the 2 corners)
  for (let j = 1; j < vCount - 1; j++) {
    positions.push({
      x: offX + boxW,
      y: offY + (boxH / (vCount - 1)) * j,
      edge: 'right',
      index: j,
    });
  }

  return positions;
}
