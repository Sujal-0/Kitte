/**
 * Photo Booth Studio - Design Tokens & Configurations
 * Supports 2, 3, and 4 photo strips, 10 curated frame styles,
 * filter presets, and asset bindings.
 */

export const PHOTO_BOOTH_TOKENS = {
  strip: {
    width: 168, // Authentic vintage photobooth strip width
    // Mathematically exact heights based on photo count and bottom chin:
    heights: {
      2: 484,
      3: 697,
      4: 910,
    },
    heightsWithChin: {
      2: 484,
      3: 697,
      4: 910,
    },
    heightsWithoutChin: {
      2: 437,
      3: 650,
      4: 863,
    },
    // Authentic 3:4 Portrait Rectangle Photo Apertures (156px width x 208px height):
    slotHeights: {
      2: 208, // 156x208 = 3:4 portrait rectangle
      3: 208, // 156x208 = 3:4 portrait rectangle
      4: 208, // 156x208 = 3:4 portrait rectangle
    },
    slotWidth: 156,
    slotWidthAnime: 140,
    margins: {
      lateral: 6,
      top: 6,
      headerHeight: 20,
      chin: 40,
      gap: 5,
      bottomWithoutChin: 6,
    },
    radius: 4, // Real photobooth strips have squarish corners
  },

  // Showcase default data (Straw Hat Crew Cute Portraits)
  showcaseDefaults: {
    photoCount: 4,
    frameStyle: 'classic-clean', // Default pure clean frame with no stickers or doodles
    paperColor: '#FFFFFF',
    filter: 'none', // 'none' | 'bw-classic' | 'bw-noir' | 'vintage-warm' | 'cool-film'
    caption: 'KITTE PHOTOBOOTH',
    showDate: true,
    dateText: '14/10/2026',
    showBottomChin: true, // Toggle option to keep caption/date chin or remove for pure compact photo frames
    grainIntensity: 0.15,
    photos: [
      {
        id: 1,
        src: '/assets/luffyTravelID.webp',
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
      },
      {
        id: 2,
        src: '/assets/nami-cute.webp',
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
      },
      {
        id: 3,
        src: '/assets/sanji-cute.webp',
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
      },
      {
        id: 4,
        src: '/assets/zoro-cute.webp',
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
      },
    ],
  },

  // Color theme presets for the strip background (including curated Grays)
  colors: [
    { id: 'white', name: 'Studio White', hex: '#FFFFFF', textHex: '#1A1A1A' },
    { id: 'soft-silver', name: 'Soft Silver', hex: '#E5E7EB', textHex: '#1A1A1A' },
    { id: 'cool-gray', name: 'Cool Studio Gray', hex: '#D1D5DB', textHex: '#1A1A1A' },
    { id: 'slate-gray', name: 'Slate Gray', hex: '#94A3B8', textHex: '#1A1A1A' },
    { id: 'charcoal', name: 'Charcoal Noir', hex: '#374151', textHex: '#FFFFFF' },
    { id: 'cream', name: 'Vintage Cream', hex: '#FAF5E8', textHex: '#1A1A1A' },
    { id: 'black', name: 'Midnight Noir', hex: '#161616', textHex: '#FFFFFF' },
    { id: 'pink', name: 'Pastel Blush', hex: '#FCE4EC', textHex: '#1A1A1A' },
    { id: 'lavender', name: 'Soft Lilac', hex: '#EDE7F6', textHex: '#1A1A1A' },
    { id: 'matcha', name: 'Matcha Milk', hex: '#E8F5E9', textHex: '#1A1A1A' },
    { id: 'butter', name: 'Butter Yellow', hex: '#FFFDE7', textHex: '#1A1A1A' },
    { id: 'navy', name: 'Deep Navy', hex: '#0D1B2A', textHex: '#FFFFFF' },
  ],

  // Curated Frame Styles (Default clean + 10 curated themes)
  frameStyles: [
    {
      id: 'classic-clean',
      name: 'Classic Clean',
      subtitle: 'Pure rectangular frames',
      badge: 'DEFAULT',
      defaultColor: '#FFFFFF',
      iconAsset: null,
      description: 'Pure, timeless rectangular photo frames with clean black borders and zero stickers or doodles.',
    },
    {
      id: 'cat-photographer',
      name: 'Cat Photographer',
      subtitle: 'Cute DSLR cat & camera crew',
      badge: 'POPULAR',
      defaultColor: '#FFFFFF',
      iconAsset: '/assets/cat-dsrl.webp',
      description: 'Features the adorable DSLR camera cat with camera flash and film indicators.',
    },
    {
      id: 'classic-polaroid',
      name: 'Classic Polaroid',
      subtitle: 'Clean white beveled frames',
      badge: 'MINIMAL',
      defaultColor: '#FFFFFF',
      iconAsset: null,
      description: 'Clean Polaroid cardstock with subtle beveled borders and generous bottom chin.',
    },
    {
      id: 'minimalist-heart',
      name: 'Minimalist Heart',
      subtitle: 'Hand-drawn heart signature',
      badge: 'CHIC',
      defaultColor: '#FFFFFF',
      iconAsset: '/assets/heart-doodle.webp',
      description: 'Refined white strip with thin black aperture lines and hand-drawn heart signature.',
    },
    {
      id: 'y2k-scallop-doodles',
      name: 'Y2K Scallop & Doodles',
      subtitle: 'Cloud wavy apertures & chalk',
      badge: 'Y2K AESTHETIC',
      defaultColor: '#0D1B2A',
      iconAsset: '/assets/pcs.webp',
      description: 'Midnight cardstock with scalloped cloud apertures and white chalk stickers.',
    },
    {
      id: 'retro-polka-dots',
      name: 'Retro Polka Dots',
      subtitle: 'Crisp polka dot borders & flowers',
      badge: 'RETRO',
      defaultColor: '#161616',
      iconAsset: '/assets/flower.webp',
      description: 'High-contrast perimeter lined with crisp white polka dots and cute corner flowers.',
    },
    {
      id: 'star-chaser',
      name: 'Star Chaser',
      subtitle: 'Hand-drawn star lines & crayons',
      badge: 'DOODLE',
      defaultColor: '#FAF5E8',
      iconAsset: '/assets/star-line.webp',
      description: 'Cream cardstock with ink star-line dividers and crayon butterfly star doodles.',
    },
    {
      id: 'anime-cinema-tbc',
      name: 'Cinema Film (TBC)',
      subtitle: '35mm sprockets & "To Be Continued"',
      badge: 'ANIME',
      defaultColor: '#161616',
      iconAsset: '/assets/tbc.webp',
      description: 'Authentic 35mm film strip with side sprockets, frame numbers, and the iconic TBC stamp.',
    },
    {
      id: 'crayon-scrapbook',
      name: 'Crayon Scrapbook',
      subtitle: 'Spirals, hearts & scribbles',
      badge: 'CUTE',
      defaultColor: '#FFFDE7',
      iconAsset: '/assets/spiral.webp',
      description: 'Textured scrapbook strip with blue chalk spirals, crayon hearts, and washi-tape rules.',
    },
    {
      id: 'music-melody',
      name: 'Melody & Notes',
      subtitle: 'Scribbled heart music notes',
      badge: 'LO-FI',
      defaultColor: '#EDE7F6',
      iconAsset: '/assets/music-key.webp',
      description: 'Lo-fi aesthetic with expressive sketched heart notes floating along borders.',
    },
    {
      id: 'kawaii-dream',
      name: 'Kawaii Starburst',
      subtitle: 'Pastel dream & star sparkles',
      badge: 'SWEET',
      defaultColor: '#FCE4EC',
      iconAsset: '/assets/star-patt.webp',
      description: 'Soft pastel dream strip decorated with colorful crayon starbursts and sparkles.',
    },
  ],

  // Filter Presets
  filters: [
    {
      id: 'none',
      name: 'Normal',
      subtitle: 'True Color',
      cssFilter: 'none',
      canvasSettings: { grayscale: 0, contrast: 1, sepia: 0, brightness: 1, saturate: 1 },
    },
    {
      id: 'bw-classic',
      name: 'B&W Classic',
      subtitle: 'Balanced Monochrome',
      cssFilter: 'grayscale(100%) contrast(110%) brightness(102%)',
      canvasSettings: { grayscale: 1, contrast: 1.1, sepia: 0, brightness: 1.02, saturate: 0 },
    },
    {
      id: 'bw-noir',
      name: 'B&W Noir',
      subtitle: 'Moody High Contrast',
      cssFilter: 'grayscale(100%) contrast(145%) brightness(95%)',
      canvasSettings: { grayscale: 1, contrast: 1.45, sepia: 0, brightness: 0.95, saturate: 0 },
    },
    {
      id: 'vintage-warm',
      name: 'Vintage Warm',
      subtitle: '70s Gold Sepia',
      cssFilter: 'sepia(35%) contrast(108%) brightness(105%) saturate(115%)',
      canvasSettings: { grayscale: 0, contrast: 1.08, sepia: 0.35, brightness: 1.05, saturate: 1.15 },
    },
    {
      id: 'cool-film',
      name: 'Cool Film',
      subtitle: 'Muted Portra',
      cssFilter: 'contrast(102%) brightness(104%) saturate(85%) hue-rotate(10deg)',
      canvasSettings: { grayscale: 0, contrast: 1.02, sepia: 0.05, brightness: 1.04, saturate: 0.85 },
    },
  ],
};
