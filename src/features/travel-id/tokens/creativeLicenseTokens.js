/**
 * Creative License Shared Design Tokens
 * 
 * Shared coordinate space and sizing constants used by both
 * React component and Canvas 2D exporter to guarantee 1:1 pixel parity.
 */

export const CREATIVE_LICENSE_TOKENS = {
  card: {
    width: 760,
    height: 480,
    radius: 24,
    dashedInset: 12,
  },
  photo: {
    x: 34,
    y: 66,
    width: 195,
    height: 225,
    borderPadding: 5,
  },
  barcode: {
    x: 53,
    y: 405,
    height: 34,
    unitWidth: 1.4,
    gap: 1.3,
    textCenterX: 131.5,
    bars: [3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 1, 3, 1, 2, 4, 1, 2, 1, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 1, 3, 2]
  },
  stickersFront: {
    imig: { x: 48, y: 272, width: 68, height: 95, rotation: -6 },
    noSub: { x: 110, y: 289, width: 76, height: 76, rotation: 3 },
    guaranteed: { x: 166, y: 283, width: 100, height: 24, rotation: -2 },
    omg: { x: 188, y: 306, width: 82, height: 58, rotation: 8 },
  },
  watermarks: {
    certifiedStamp: { x: 400, y: 218, size: 208, rotation: -12, opacity: 0.38 },
    starSticker: { x: 537, y: 106, size: 175, opacity: 0.30 },
  },
  grid: {
    x: 256,
    y: 176,
    width: 472,
    height: 176,
  },
  expertise: {
    x: 256,
    y: 405,
    width: 472,
    height: 32,
  },
  back: {
    detailsBox: { x: 382, y: 28, width: 350, height: 424 },
    starGraphic: { x: 146, y: 146, size: 220, rotation: -12, opacity: 0.30 },
    stickers: {
      itScrew: { x: 146, y: 78, width: 218, height: 60, rotation: -3 },
      stampOut: { x: 166, y: 144, width: 228, height: 65, rotation: 2 },
      sickSadWorld: { x: 148, y: 208, width: 212, height: 60, rotation: -2 },
      noSubOval: { x: 86, y: 268, width: 100, height: 40, rotation: 4 },
      starBurst: { x: 176, y: 268, size: 88, rotation: -6 },
      flower: { x: 248, y: 265, size: 60, rotation: 12 },
    },
    quote: { x: 38, y: 412, authorY: 428 },
  },
  showcaseDefaults: {
    name: 'MONKEY D. LUFFY',
    occupation: 'PIRATE CAPTAIN',
    dob: '05/05/1997',
    nationality: 'EAST BLUE',
    expertise: '3D ARTIST & VISUAL DESIGNER',
    skills: '3D Modeling, Digital Painting, Graphic Design, Photo Editing, Video Editing, Motion Graphics, Sculpting, Visual Design',
    software: 'Adobe Photoshop\nAdobe After Effects\nAdobe Premiere Pro\nAutodesk Maya\nBlender',
    phone: '+91 94960 33887',
    email: 'strawhat@kitte.studio',
    social: '@monkey_d_luffy',
    quote: 'Creativity takes courage.',
    author: 'Henri Matisse',
  }
};
