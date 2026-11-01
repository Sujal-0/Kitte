import React from 'react';
import { motion } from 'framer-motion';
import { PHOTO_BOOTH_TOKENS } from '../../../features/photobooth/tokens/photoBoothTokens';

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

export function PhotoBoothStrip({ 
  state, 
  activeSlotIndex, 
  onSelectSlot, 
  id = 'photobooth-strip-front' 
}) {
  const photoCount = state?.photoCount || 4;
  const frameStyleId = state?.frameStyle || 'classic-clean';
  const paperColor = state?.paperColor || '#FFFFFF';
  const filterId = state?.filter || 'none';
  const caption = state?.caption || 'KITTE PHOTOBOOTH';
  const dateText = state?.dateText || '14/10/2026';
  const showDate = state?.showDate !== false;
  const showBottomChin = state?.showBottomChin !== false;

  const currentFilter = PHOTO_BOOTH_TOKENS.filters.find(f => f.id === filterId) || PHOTO_BOOTH_TOKENS.filters[0];
  const photos = state?.photos || PHOTO_BOOTH_TOKENS.showcaseDefaults.photos;
  const activePhotos = photos.slice(0, photoCount);

  // Exact 3:4 portrait dimensions from tokens
  const stripW = PHOTO_BOOTH_TOKENS.strip.width || 168;
  const stripH = showBottomChin 
    ? (PHOTO_BOOTH_TOKENS.strip.heightsWithChin[photoCount] || 910)
    : (PHOTO_BOOTH_TOKENS.strip.heightsWithoutChin[photoCount] || 863);
  const slotH = PHOTO_BOOTH_TOKENS.strip.slotHeights[photoCount] || 208;
  const slotW = PHOTO_BOOTH_TOKENS.strip.slotWidth || 156;

  // Dark background frame & paper color detection
  const isDarkPaper = isDarkPaperColor(paperColor);
  const isDarkTheme = ['y2k-scallop-doodles', 'retro-polka-dots', 'anime-cinema-tbc'].includes(frameStyleId);
  const isDark = isDarkPaper || isDarkTheme;
  const primaryTextColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const secondaryTextColor = isDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(26, 26, 26, 0.65)';
  const stickerInvertClass = isDark ? 'invert brightness-200' : '';

  return (
    <div
      id={id}
      className="relative select-none rounded-[4px] overflow-hidden border-2 border-[#1A1A1A] shadow-[5px_5px_0px_rgba(0,0,0,0.45)] transition-all flex flex-col items-center"
      style={{
        width: `${stripW}px`,
        height: `${stripH}px`,
        backgroundColor: paperColor,
        paddingTop: '6px',
        paddingBottom: showBottomChin ? '0px' : '6px',
      }}
    >
      {/* Paper Grain Texture */}
      <div 
        className="absolute inset-0 opacity-15 mix-blend-multiply pointer-events-none z-30" 
        style={{ backgroundImage: 'url("/assets/noise.png")', backgroundRepeat: 'repeat' }} 
      />

      {/* =========================================================================
          PERIMETER BORDER ACCENTS (Subtle dots/sprockets on extreme lateral borders)
          ========================================================================= */}
      
      {/* RETRO POLKA DOTS: Side columns */}
      {frameStyleId === 'retro-polka-dots' && (
        <>
          <div className="absolute left-0.5 top-2 bottom-2 w-1 flex flex-col justify-between pointer-events-none z-20">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={`dot-l-${i}`} className="w-1 h-1 rounded-full bg-white opacity-80" />
            ))}
          </div>
          <div className="absolute right-0.5 top-2 bottom-2 w-1 flex flex-col justify-between pointer-events-none z-20">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={`dot-r-${i}`} className="w-1 h-1 rounded-full bg-white opacity-80" />
            ))}
          </div>
        </>
      )}

      {/* ANIME CINEMA 35MM: Sprocket columns */}
      {frameStyleId === 'anime-cinema-tbc' && (
        <>
          <div className="absolute left-0.5 top-2 bottom-2 w-1 flex flex-col justify-around pointer-events-none z-20 opacity-80">
            {Array.from({ length: photoCount * 6 }).map((_, i) => (
              <div key={`sprocket-l-${i}`} className="w-1 h-1.5 bg-white rounded-[0.5px]" />
            ))}
          </div>
          <div className="absolute right-0.5 top-2 bottom-2 w-1 flex flex-col justify-around pointer-events-none z-20 opacity-80">
            {Array.from({ length: photoCount * 6 }).map((_, i) => (
              <div key={`sprocket-r-${i}`} className="w-1 h-1.5 bg-white rounded-[0.5px]" />
            ))}
          </div>
        </>
      )}

      {/* =========================================================================
          PHOTO APERTURES STACK (3:4 PORTRAIT RECTANGULAR INDIVIDUAL FRAMES)
          ========================================================================= */}
      <div 
        className="relative z-20 flex flex-col items-center shrink-0"
        style={{
          width: `${slotW}px`,
          gap: '5px',
        }}
      >
        {activePhotos.map((slot, index) => {
          const isSelected = activeSlotIndex === index;
          const slotImg = slot?.src;
          const scale = slot?.scale || 1;
          const offsetX = slot?.offsetX || 0;
          const offsetY = slot?.offsetY || 0;
          const rotation = slot?.rotation || 0;

          return (
            <div 
              key={`slot-${slot.id || index}`}
              onClick={() => onSelectSlot && onSelectSlot(index)}
              className="relative flex flex-col items-center justify-center cursor-pointer group shrink-0"
              style={{
                width: `${slotW}px`,
                height: `${slotH}px`,
              }}
            >
              {/* Photo Box Container (Individual Photo Frame) */}
              <div 
                className={`relative w-full h-full overflow-hidden transition-all ${
                  isSelected ? 'ring-1.5 ring-[#FFEB3B] ring-offset-1 ring-offset-black' : ''
                } ${
                  frameStyleId === 'classic-clean'
                    ? 'rounded-none border-[2px] border-[#1A1A1A] shadow-xs'
                    : frameStyleId === 'y2k-scallop-doodles' 
                    ? 'rounded-[8px] border-[2px] border-white shadow-[0_2px_6px_rgba(0,0,0,0.3)]' 
                    : frameStyleId === 'retro-polka-dots'
                    ? 'rounded-none border-[2px] border-white shadow-xs'
                    : frameStyleId === 'anime-cinema-tbc'
                    ? 'rounded-[1px] border-[1.5px] border-white/80 shadow-inner'
                    : frameStyleId === 'classic-polaroid'
                    ? 'rounded-none border-[1.5px] border-[#1A1A1A] shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]'
                    : frameStyleId === 'minimalist-heart'
                    ? 'rounded-none border-[1.5px] border-[#1A1A1A] shadow-inner'
                    : frameStyleId === 'kawaii-dream'
                    ? 'rounded-[3px] border-[2px] border-[#F48FB1] shadow-[inset_0_1px_3px_rgba(233,30,99,0.15)]'
                    : 'rounded-[1.5px] border-[1.5px] border-[#1A1A1A] shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]'
                }`}
                style={{
                  backgroundColor: slotImg ? '#FFFFFF' : '#F4F1EA',
                }}
              >
                {slotImg ? (
                  <motion.img
                    src={slotImg}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover transition-transform origin-center"
                    style={{
                      transform: `translate(${offsetX}%, ${offsetY}%) scale(${scale}) rotate(${rotation}deg)`,
                      filter: currentFilter.cssFilter,
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-[#737373]">
                    <svg className="w-5 h-5 mb-0.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="font-mono text-[7.5px] font-bold uppercase tracking-wider">
                      PHOTO #{index + 1}
                    </span>
                  </div>
                )}

                {/* Classic Polaroid Mounting Corners */}
                {frameStyleId === 'classic-polaroid' && (
                  <>
                    <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-[2.5px] border-l-[2.5px] border-[#1A1A1A] pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-[2.5px] border-r-[2.5px] border-[#1A1A1A] pointer-events-none" />
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-[2.5px] border-r-[2.5px] border-[#1A1A1A] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-[2.5px] border-l-[2.5px] border-[#1A1A1A] pointer-events-none" />
                  </>
                )}

                {/* Cat Photographer Reticles */}
                {frameStyleId === 'cat-photographer' && (
                  <>
                    <div className="absolute top-1 left-1 font-mono text-[7px] text-[#E65100] font-black leading-none pointer-events-none opacity-90">
                      ⌜
                    </div>
                    <div className="absolute top-1 right-1 font-mono text-[7px] text-[#E65100] font-black leading-none pointer-events-none opacity-90">
                      ⌝
                    </div>
                    <div className="absolute bottom-1 left-1 font-mono text-[7px] text-[#E65100] font-black leading-none pointer-events-none opacity-90">
                      ⌞
                    </div>
                    <div className="absolute bottom-1 right-1 font-mono text-[7px] text-[#E65100] font-black leading-none pointer-events-none opacity-90">
                      ⌟
                    </div>
                  </>
                )}

                {/* Anime Cinema Frame Mark */}
                {frameStyleId === 'anime-cinema-tbc' && (
                  <div className="absolute top-1 right-1 font-mono text-[6px] font-black text-[#FFA726] pointer-events-none bg-black/60 px-1 py-0.5 rounded-[1px]">
                    2{index + 4} ▶
                  </div>
                )}
              </div>

              {/* ===============================================================
                  INDIVIDUAL PHOTO FRAME ACCENTS (Neatly framing each photo)
                  =============================================================== */}
              
              {/* --- CAT PHOTOGRAPHER STYLE --- */}
              {frameStyleId === 'cat-photographer' && (
                <>
                  {index === 0 && (
                    <div className="absolute top-1 right-1.5 pointer-events-none z-30 font-mono text-[6.5px] font-black text-[#E65100] flex items-center gap-0.5 bg-black/75 px-1 py-0.5 rounded-[1px]">
                      <span className="w-1 h-1 rounded-full bg-[#E65100] animate-pulse inline-block" />
                      REC
                    </div>
                  )}
                  {index === 1 && (
                    <div className="absolute -left-1 bottom-1 pointer-events-none z-30 w-4 h-4 opacity-95 drop-shadow-sm rotate-12">
                      <img src="/assets/spiral.webp" alt="Spiral" className="w-full h-full object-contain" />
                    </div>
                  )}
                  {index === 2 && (
                    <div className="absolute -right-1 bottom-1 pointer-events-none z-30 w-4 h-4 opacity-95 drop-shadow-sm -rotate-12">
                      <img src="/assets/star-patt.webp" alt="Star" className="w-full h-full object-contain" />
                    </div>
                  )}
                </>
              )}

              {/* --- MINIMALIST HEART STYLE --- */}
              {frameStyleId === 'minimalist-heart' && index === 0 && (
                <div className="absolute top-1 right-1 pointer-events-none z-30 text-[10px]" style={{ color: secondaryTextColor }}>
                  ♡
                </div>
              )}

              {/* --- Y2K SCALLOP DOODLES --- */}
              {frameStyleId === 'y2k-scallop-doodles' && (
                <>
                  {index === 0 && (
                    <div className="absolute top-1 left-1.5 pointer-events-none z-30 font-mono text-[7.5px] font-black text-[#64FFDA] drop-shadow-sm">
                      ✦ ✧
                    </div>
                  )}
                  {index === 1 && (
                    <div className="absolute top-1 right-1.5 pointer-events-none z-30 font-mono text-[7px] font-black text-[#64FFDA]">
                      ? +
                    </div>
                  )}
                </>
              )}

              {/* --- STAR CHASER STYLE --- */}
              {frameStyleId === 'star-chaser' && (
                <>
                  {index === 1 && (
                    <div className={`absolute -left-1 bottom-1 pointer-events-none z-30 w-4 h-4 opacity-90 drop-shadow-xs rotate-12 ${stickerInvertClass}`}>
                      <img src="/assets/star-patt.webp" alt="Star" className="w-full h-full object-contain" />
                    </div>
                  )}
                  {index < photoCount - 1 && (
                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 pointer-events-none z-30 w-20 opacity-90 ${stickerInvertClass}`}>
                      <img src="/assets/star-line.webp" alt="Star Line" className="w-full h-1.5 object-contain" />
                    </div>
                  )}
                </>
              )}

              {/* --- CRAYON SCRAPBOOK STYLE --- */}
              {frameStyleId === 'crayon-scrapbook' && (
                <>
                  {index === 0 && (
                    <>
                      <div className="absolute top-0.5 left-0.5 w-3.5 h-1.5 bg-[#FFD166]/90 -rotate-20 border border-black/20 pointer-events-none z-30 shadow-xs" />
                      <div className="absolute top-0.5 right-0.5 w-3.5 h-1.5 bg-[#06D6A0]/90 rotate-20 border border-black/20 pointer-events-none z-30 shadow-xs" />
                    </>
                  )}
                  {index === 1 && (
                    <div className={`absolute -right-1 bottom-1 pointer-events-none z-30 w-3.5 h-3.5 opacity-95 rotate-12 ${stickerInvertClass}`}>
                      <img src="/assets/spiral.webp" alt="Spiral" className="w-full h-full object-contain" />
                    </div>
                  )}
                  {index === 2 && (
                    <div className={`absolute -left-1 bottom-1 pointer-events-none z-30 w-3.5 h-3.5 opacity-90 -rotate-12 ${stickerInvertClass}`}>
                      <img src="/assets/heart-doodle.webp" alt="Heart" className="w-full h-full object-contain" />
                    </div>
                  )}
                </>
              )}

              {/* --- MUSIC MELODY STYLE --- */}
              {frameStyleId === 'music-melody' && (
                <>
                  {index === 0 && (
                    <div className="absolute top-1 right-1 pointer-events-none z-30 text-[8px] font-mono" style={{ color: secondaryTextColor }}>
                      ♫ SIDE A
                    </div>
                  )}
                  {index === 1 && (
                    <div className={`absolute -right-1 bottom-1 pointer-events-none z-30 w-3.5 h-3.5 rotate-12 opacity-90 ${stickerInvertClass}`}>
                      <img src="/assets/music-key.webp" alt="Music" className="w-full h-full object-contain" />
                    </div>
                  )}
                </>
              )}

              {/* --- KAWAII DREAM STYLE --- */}
              {frameStyleId === 'kawaii-dream' && (
                <>
                  {index === 0 && (
                    <div className="absolute top-1 right-1 pointer-events-none z-30 w-3.5 h-3.5 rotate-12">
                      <img src="/assets/flower.webp" alt="Flower" className="w-full h-full object-contain" />
                    </div>
                  )}
                  {index === 1 && (
                    <div className="absolute -left-1 bottom-1 pointer-events-none z-30 w-3.5 h-3.5 -rotate-12">
                      <img src="/assets/star-patt.webp" alt="Star" className="w-full h-full object-contain" />
                    </div>
                  )}
                </>
              )}

            </div>
          );
        })}
      </div>

      {/* =========================================================================
          BOTTOM CHIN (Branding, Date & Signature Theme Sticker - 42px height)
          Only rendered when showBottomChin === true!
          ========================================================================= */}
      {showBottomChin && (
        <div 
          className="relative z-20 flex items-center justify-between shrink-0 mt-auto px-0.5"
          style={{
            width: `${slotW}px`,
            height: '42px',
          }}
        >
          {/* 0. Classic Clean Frame (Pure Typography, Zero Stickers) */}
          {frameStyleId === 'classic-clean' && (
            <div className="w-full flex flex-col items-center justify-center text-center">
              <span className="font-mono text-[9px] font-black tracking-widest uppercase truncate max-w-[145px] block" style={{ color: primaryTextColor }}>
                {caption}
              </span>
              {showDate && (
                <span className="font-mono text-[7px] font-bold mt-0.5 block" style={{ color: secondaryTextColor }}>
                  {dateText}
                </span>
              )}
            </div>
          )}

          {/* 1. Cat Photographer: DSLR Black Cat */}
          {frameStyleId === 'cat-photographer' && (
            <div className="w-full flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-1 flex flex-col text-left">
                <span className="font-marker text-[11px] leading-tight tracking-wider truncate block" style={{ color: primaryTextColor }}>
                  {caption}
                </span>
                {showDate && (
                  <span className="font-mono text-[7px] font-bold mt-0.5 truncate block" style={{ color: secondaryTextColor }}>
                    {dateText}
                  </span>
                )}
              </div>
              <div className={`w-8 h-8 -rotate-4 shrink-0 flex items-center justify-center drop-shadow-sm ${isDark ? 'invert brightness-175' : ''}`}>
                <img src="/assets/cat-dsrl.webp" alt="Cat DSLR" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* 2. Classic Polaroid Studio Frame */}
          {frameStyleId === 'classic-polaroid' && (
            <div className="w-full flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-1 flex flex-col text-left">
                <span className="font-marker text-[10px] tracking-wider uppercase truncate block" style={{ color: primaryTextColor }}>
                  {caption}
                </span>
                {showDate && (
                  <span className="font-mono text-[7px] font-semibold mt-0.5 truncate block" style={{ color: secondaryTextColor }}>
                    {dateText}
                  </span>
                )}
              </div>
              <div className={`w-8 h-8 opacity-90 rotate-6 shrink-0 flex items-center justify-center ${isDark ? 'invert brightness-150' : ''}`}>
                <img src="/assets/certified-stamp.webp" alt="Studio Stamp" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* 3. Minimalist Heart Frame */}
          {frameStyleId === 'minimalist-heart' && (
            <div className="w-full flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-1 flex flex-col text-left">
                <span className="font-mono text-[9.5px] font-black tracking-widest uppercase truncate block" style={{ color: primaryTextColor }}>
                  {caption}
                </span>
                {showDate && (
                  <span className="font-mono text-[7px] font-bold mt-0.5 truncate block" style={{ color: secondaryTextColor }}>
                    {dateText}
                  </span>
                )}
              </div>
              <div className={`w-7 h-7 opacity-95 shrink-0 flex items-center justify-center ${stickerInvertClass}`}>
                <img src="/assets/heart-doodle.webp" alt="Heart" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* 4. Y2K Scallop Doodles Frame */}
          {frameStyleId === 'y2k-scallop-doodles' && (
            <div className="w-full flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-1 flex flex-col text-left">
                <span className="font-['adamHandwriting'] text-[11px] tracking-wider truncate block" style={{ color: primaryTextColor }}>
                  {caption}
                </span>
                {showDate && (
                  <span className="font-mono text-[7px] font-bold truncate block" style={{ color: secondaryTextColor }}>
                    {dateText}
                  </span>
                )}
              </div>
              <div className={`w-8 h-6 opacity-95 shrink-0 flex items-center justify-center ${isDark ? 'invert brightness-200' : ''}`}>
                <img src="/assets/pcs.webp" alt="Doodles" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* 5. Retro Polka Dots with Flower Accent */}
          {frameStyleId === 'retro-polka-dots' && (
            <div className="w-full flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-1 flex flex-col text-left">
                <span className="font-mono text-[9.5px] font-black tracking-widest uppercase truncate block" style={{ color: primaryTextColor }}>
                  {caption}
                </span>
                {showDate && (
                  <span className="font-mono text-[7px] font-bold mt-0.5 truncate block" style={{ color: secondaryTextColor }}>
                    {dateText}
                  </span>
                )}
              </div>
              <div className={`w-7 h-7 rotate-12 shrink-0 flex items-center justify-center ${isDark ? 'invert brightness-200' : ''}`}>
                <img src="/assets/flower.webp" alt="Flower" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* 6. Anime Cinema TBC: "To Be Continued" Stamp */}
          {frameStyleId === 'anime-cinema-tbc' && (
            <div className="w-full flex flex-col items-center gap-0.5">
              <div className={`w-28 h-4 -rotate-1 drop-shadow-sm ${isDark ? 'invert brightness-200' : ''}`}>
                <img src="/assets/tbc.webp" alt="To Be Continued" className="w-full h-full object-contain" />
              </div>
              <div className="flex justify-between w-full px-1 text-[6.5px] font-mono" style={{ color: secondaryTextColor }}>
                <span className="truncate max-w-[80px]">{caption}</span>
                {showDate && <span>{dateText}</span>}
              </div>
            </div>
          )}

          {/* 7. Star Chaser Frame */}
          {frameStyleId === 'star-chaser' && (
            <div className="w-full flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-1 flex flex-col text-left">
                <span className="font-marker text-[11px] tracking-wide truncate block" style={{ color: primaryTextColor }}>
                  {caption}
                </span>
                {showDate && (
                  <span className="font-mono text-[7px] font-bold mt-0.5 truncate block" style={{ color: secondaryTextColor }}>
                    {dateText}
                  </span>
                )}
              </div>
              <div className={`w-7 h-7 -rotate-6 shrink-0 flex items-center justify-center ${stickerInvertClass}`}>
                <img src="/assets/star-patt.webp" alt="Star Pattern" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* 8. Crayon Scrapbook Frame */}
          {frameStyleId === 'crayon-scrapbook' && (
            <div className="w-full flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-1 flex flex-col text-left">
                <span className="font-['adamHandwriting'] text-[11px] font-bold truncate block" style={{ color: primaryTextColor }}>
                  {caption}
                </span>
                {showDate && (
                  <span className="font-mono text-[7px] font-bold truncate block" style={{ color: secondaryTextColor }}>
                    {dateText}
                  </span>
                )}
              </div>
              <div className={`w-7 h-7 rotate-6 shrink-0 flex items-center justify-center ${stickerInvertClass}`}>
                <img src="/assets/heart-doodle.webp" alt="Heart" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* 9. Music Melody Frame */}
          {frameStyleId === 'music-melody' && (
            <div className="w-full flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-1 flex flex-col text-left">
                <span className="font-mono text-[9.5px] font-black tracking-widest truncate block" style={{ color: primaryTextColor }}>
                  ♫ {caption}
                </span>
                {showDate && (
                  <span className="font-mono text-[7px] font-bold mt-0.5 truncate block" style={{ color: secondaryTextColor }}>
                    {dateText}
                  </span>
                )}
              </div>
              <div className={`w-7 h-7 -rotate-3 shrink-0 flex items-center justify-center ${stickerInvertClass}`}>
                <img src="/assets/music-key.webp" alt="Music Notes" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* 10. Kawaii Dream Frame */}
          {frameStyleId === 'kawaii-dream' && (
            <div className="w-full flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-1 flex flex-col text-left">
                <span className="font-marker text-[11px] tracking-wide truncate block" style={{ color: isDark ? '#FF80AB' : '#E91E63' }}>
                  {caption}
                </span>
                {showDate && (
                  <span className="font-mono text-[7px] font-bold mt-0.5 truncate block" style={{ color: secondaryTextColor }}>
                    {dateText}
                  </span>
                )}
              </div>
              <div className={`w-7 h-7 rotate-12 shrink-0 flex items-center justify-center ${stickerInvertClass}`}>
                <img src="/assets/flower.webp" alt="Flower" className="w-full h-full object-contain" />
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
