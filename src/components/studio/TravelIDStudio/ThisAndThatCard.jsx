
import React, { useState } from 'react';
import { THIS_AND_THAT_TOKENS, generateDiamondPositions } from '../../../features/travel-id/tokens/thisAndThatTokens';

// Real production barcode pattern matching other card types
const BARCODE_PATTERN = [
  3, 1, 1, 2, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 1, 2, 2, 1, 3, 1, 1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 3
];

// Shared pixel-perfect diamond coordinates
const DIAMOND_POSITIONS = generateDiamondPositions();

/**
 * Top-Corner Orange Hazard Stripes
 */
function HazardStripes({ isRight }) {
  return (
    <div className={`absolute top-2.5 ${isRight ? 'right-2.5' : 'left-2.5'} pointer-events-none flex gap-1.5 overflow-hidden`}>
      {[0, 1, 2, 3].map(i => (
        <div 
          key={i} 
          className="w-1.5 h-7 bg-[#E65100] transform"
          style={{ transform: isRight ? 'skewX(25deg)' : 'skewX(-25deg)' }}
        />
      ))}
    </div>
  );
}

/**
 * Nested Diamond Border Icon for Back Side
 */
function DiamondIcon({ cardBg }) {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0 text-[#1A1A1A]">
      <path d="M8,1 L15,8 L8,15 L1,8 Z" fill="currentColor" />
      <path d="M8,4.5 L11.5,8 L8,11.5 L4.5,8 Z" fill={cardBg} />
    </svg>
  );
}

/**
 * Perimeter Diamond Border for Back Side (Pixel-perfect corner alignment)
 */
function DiamondPerimeter({ cardBg }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {DIAMOND_POSITIONS.map((pos, i) => (
        <div
          key={`${pos.edge}-${pos.index}-${i}`}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
        >
          <DiamondIcon cardBg={cardBg} />
        </div>
      ))}
    </div>
  );
}

export function ThisAndThatCard({ idState, activeSide, isShowcase }) {
  const [failedImage, setFailedImage] = useState(false);
  const defaults = THIS_AND_THAT_TOKENS.showcaseDefaults;

  // Luffy or Stray Kids showcase image fallback
  const imageSrc = idState?.imageSrc !== undefined && idState?.imageSrc !== null
    ? idState.imageSrc
    : (isShowcase ? '/assets/luffyTravelID.webp' : null);

  const scale = idState?.imageScale || 1;
  const offsetX = idState?.imageOffsetX || 0;
  const offsetY = idState?.imageOffsetY || 0;

  const cardBg = idState?.colorTheme || THIS_AND_THAT_TOKENS.card.defaultBg;

  // Values fade to empty once user starts customizing
  const nameVal = idState?.issuedTo ?? (isShowcase ? defaults.name : '');
  const occupancyVal = idState?.occupancy ?? (isShowcase ? defaults.occupancy : '');
  const dateVal = idState?.dateOfIssue ?? (isShowcase ? defaults.dateOfIssue : '');
  const idNumberVal = idState?.idNumber ?? (isShowcase ? defaults.idNumber : '');
  const certTextVal = idState?.certText ?? defaults.certText;
  const noteVal = idState?.note ?? (isShowcase ? defaults.note : '');

  return (
    <div 
      className="relative flex items-center justify-center select-none"
      style={{ 
        width: '760px', 
        height: '480px',
        transformStyle: 'preserve-3d' 
      }}
    >
      {/* =========================================================================
          FRONT SIDE (This & That Identity Card)
          ========================================================================= */}
      <div 
        id="thisandthat-id-front"
        className="absolute inset-0 rounded-[20px] shadow-2xl overflow-hidden border-[3px] border-[#1A1A1A] transition-opacity duration-300"
        style={{ 
          backgroundColor: cardBg,
          opacity: activeSide === 'front' ? 1 : 0,
          pointerEvents: activeSide === 'front' ? 'auto' : 'none',
          zIndex: activeSide === 'front' ? 10 : 0
        }}
      >
        {/* Paper Grain & Noise Texture */}
        <div 
          className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none" 
          style={{ backgroundImage: 'url("/assets/noise.png")', backgroundRepeat: 'repeat' }} 
        />

        {/* Corner Orange Hazard Stripes */}
        <HazardStripes isRight={false} />
        <HazardStripes isRight={true} />

        {/* Top-Left SKZ Emblem Asset */}
        <div className="absolute top-3.5 left-15 z-20 w-12 h-12 pointer-events-none mix-blend-multiply opacity-90 drop-shadow-sm">
          <img src="/assets/skz.webp" alt="SKZ Logo" className="w-full h-full object-contain" />
        </div>

        {/* Center Vertical Dashed Divider Line */}
        <div className="absolute top-10 bottom-10 left-[288px] border-r-2 border-dashed border-[#1A1A1A]/40 pointer-events-none" />

        {/* Main Card Body */}
        <div className="relative w-full h-full p-8 flex z-10">
          
          {/* =====================================================================
              LEFT COLUMN: Photo, GAP, Orange Bar, Real Barcode & Teal Hashes
              ===================================================================== */}
          <div className="w-[236px] h-full flex flex-col justify-between pt-4 shrink-0">
            
            {/* Top Photo Block */}
            <div className="w-[224px] flex flex-col">
              {/* Photo Box with complete black border */}
              <div className="w-full h-[235px] bg-neutral-900 border-4 border-[#1A1A1A] rounded-xs overflow-hidden relative shadow-md">
                {imageSrc && !failedImage ? (
                  <img 
                    src={imageSrc} 
                    alt="Portrait" 
                    onError={() => setFailedImage(true)}
                    className="w-full h-full object-cover"
                    style={{ 
                      transform: `translate(${offsetX}%, ${offsetY}%) scale(${scale})`,
                      transformOrigin: 'center center'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#E5E0D8] text-[#737373]">
                    <svg className="w-8 h-8 mb-1 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest">SUBMIT PHOTO</span>
                  </div>
                )}
              </div>

              {/* GAP BETWEEN PHOTO AND STRAY KIDS BAR */}
              <div className="h-2.5" />

              {/* Solid Orange Bar ("STRAY KIDS" with gap) */}
              <div className="w-full h-7 bg-[#E65100] border-2 border-[#1A1A1A] rounded-xs flex items-center justify-center shadow-xs">
                <span className="font-creative text-white text-base tracking-widest uppercase">
                  STRAY KIDS
                </span>
              </div>
            </div>

            {/* Real Barcode UI & Teal diagonal slashes */}
            <div className="flex items-center gap-2 w-[224px] justify-between pb-1">
              <div className="flex h-9 flex-1 justify-between items-end overflow-hidden">
                {BARCODE_PATTERN.map((bw, i) => (
                  <div 
                    key={i} 
                    className="bg-[#1A1A1A] h-full" 
                    style={{ width: `${bw * 1.15}px` }} 
                  />
                ))}
              </div>
              <span className="text-[#38A3A5] font-mono font-black text-sm tracking-tight select-none pl-1">
                ///
              </span>
            </div>
          </div>

          {/* =====================================================================
              RIGHT COLUMN: Header, Form Fields, Watermarks, Bottom Border Barcode Value
              ===================================================================== */}
          <div className="flex-1 pl-10 flex flex-col justify-between relative">
            
            {/* Background Stamp: straykids.webp */}
            <div className="absolute right-6 top-28 pointer-events-none opacity-20 mix-blend-multiply -rotate-6 z-0">
              <img 
                src="/assets/straykids.webp" 
                alt="Stray Kids Stamp" 
                className="w-72 object-contain"
              />
            </div>

            {/* Top Header Block: Balanced Equal Sizing */}
            <div className="pt-2 z-10">
              {/* THIS & THAT with Sketchy Adam Ampersand */}
              <div className="flex items-center gap-2">
                {/* THIS in bold display font */}
                <span className="font-impact text-[48px] text-[#1A1A1A] tracking-normal leading-none uppercase">
                  THIS
                </span>
                
                {/* & in sketchy adamHandwriting font */}
                <span className="w-8 h-8 rounded-full border-2 border-[#1A1A1A] flex items-center justify-center font-['adamHandwriting'] text-2xl leading-none text-[#1A1A1A] pt-0.5">
                  &
                </span>
                
                {/* THAT in creative font (matching visual size 48px) */}
                <span className="font-creative text-[48px] text-[#1A1A1A] leading-none -rotate-1 tracking-tight">
                  THAT
                </span>
              </div>

              {/* Subtitle */}
              <p className="font-mono font-bold text-xs uppercase tracking-[0.24em] text-[#E65100] mt-1.5">
                IDENTIFICATION DOCUMENT
              </p>

              {/* Teal Accent Line with Hashes */}
              <div className="flex items-center gap-2 mt-2 max-w-[390px]">
                <div className="flex-1 h-[2px] bg-[#38A3A5]" />
                <span className="text-[#38A3A5] font-mono font-black text-xs tracking-tighter">//</span>
              </div>
            </div>

            {/* Form Fields Section */}
            <div className="flex flex-col gap-3.5 z-10 my-auto">
              {/* NAME Field */}
              <div>
                <label className="font-mono font-bold text-[11px] uppercase tracking-wider text-[#1A1A1A] block mb-1">
                  NAME
                </label>
                <div className="w-[380px] h-[40px] border-2 border-[#1A1A1A] bg-transparent rounded-sm px-3 flex items-center shadow-xs">
                  <span className="font-mono font-bold text-lg text-[#1A1A1A] uppercase tracking-wider truncate">
                    {nameVal}
                  </span>
                </div>
              </div>

              {/* OCCUPANCY */}
              <div>
                <label className="font-mono font-bold text-[10px] uppercase tracking-wider text-[#1A1A1A]/75 block">
                  OCCUPANCY
                </label>
                <span className="font-mono font-black text-base text-[#1A1A1A] tracking-wider uppercase block">
                  {occupancyVal}
                </span>
              </div>

              {/* DATE OF ISSUE */}
              <div>
                <label className="font-mono font-bold text-[10px] uppercase tracking-wider text-[#1A1A1A]/75 block">
                  DATE OF ISSUE
                </label>
                <span className="font-mono font-bold text-base text-[#1A1A1A] tracking-widest block">
                  {dateVal}
                </span>
              </div>
            </div>

            {/* Bottom Barcode Value UI with Top Dashed Border (Pushed up away from cat) */}
            <div className="w-full z-10">
              <div className="w-full border-t-2 border-dashed border-[#1A1A1A]/40 mb-3" />
              <div className="flex items-center justify-between w-full">
              {/* Left Side: Orange dash, 7 teal slashes, and Barcode Code */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-2 bg-[#E65100] rounded-xs" />
                <span className="text-[#38A3A5] font-mono font-black text-xs tracking-widest select-none">
                  ///////
                </span>
                <span className="font-mono font-bold text-xs text-[#1A1A1A] tracking-widest uppercase">
                  {idNumberVal}
                </span>
              </div>

              {/* Right Side: SKZ Emblem Stamp + Electric Guitar Cat Asset */}
              <div className="flex items-center gap-1.5 pr-1">
                {/* skz.webp Stamp */}
                <div className="w-13 h-13 opacity-85 mix-blend-multiply transform -rotate-6">
                  <img 
                    src="/assets/skz.webp" 
                    alt="SKZ" 
                    className="w-full h-full object-contain" 
                  />
                </div>

                {/* cat-bottomRight.webp */}
                <div className="w-16 h-18 transform rotate-3 drop-shadow-sm">
                  <img 
                    src="/assets/cat-bottomRight.webp" 
                    alt="Cat" 
                    className="w-full h-full object-contain" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* =========================================================================
          BACK SIDE (Fixed: rotateY(180deg) so it is 100% unmirrored on flip!)
          ========================================================================= */}
      <div 
        id="thisandthat-id-back"
        className="absolute inset-0 rounded-[20px] shadow-2xl overflow-hidden border-[3px] border-[#1A1A1A] transition-opacity duration-300"
        style={{ 
          backgroundColor: cardBg,
          transform: 'rotateY(180deg)',
          opacity: activeSide === 'back' ? 1 : 0,
          pointerEvents: activeSide === 'back' ? 'auto' : 'none',
          zIndex: activeSide === 'back' ? 10 : 0
        }}
      >
        {/* Paper Grain */}
        <div 
          className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none" 
          style={{ backgroundImage: 'url("/assets/noise.png")', backgroundRepeat: 'repeat' }} 
        />

        {/* Perimeter Diamond Border */}
        <DiamondPerimeter cardBg={cardBg} />

        {/* Center Huge Tilted "THIS & THAT" Watermark with Sketchy Adam Ampersand */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -rotate-[14deg] select-none z-0">
          <div className="flex items-center gap-3.5 text-[#E29A64]/40">
            <span className="font-impact text-[74px] tracking-normal leading-none uppercase">
              THIS
            </span>
            <span className="w-14 h-14 rounded-full border-4 border-current flex items-center justify-center font-['adamHandwriting'] text-4xl leading-none pt-1">
              &
            </span>
            <span className="font-creative text-[74px] leading-none">
              THAT
            </span>
          </div>
        </div>

        {/* Back Content Area */}
        <div className="relative w-full h-full p-10 flex flex-col justify-between z-10">
          
          {/* Top Section */}
          <div className="flex justify-between items-start pt-2 px-3">
            {/* Top-Left: IDENTITY CARD / STRAY KIDS */}
            <div>
              <p className="font-mono font-bold text-xs uppercase tracking-widest text-[#1A1A1A]">
                IDENTITY CARD
              </p>
              <h2 className="font-creative text-2xl uppercase tracking-wider text-[#1A1A1A] mt-0.5">
                STRAY KIDS
              </h2>
            </div>

            {/* Top-Right: Certification Text */}
            <div className="max-w-[340px] text-right">
              <p className="font-mono text-xs text-[#1A1A1A]/90 leading-relaxed font-medium">
                {certTextVal}
              </p>
            </div>
          </div>

          {/* Middle: straykids.webp watermark badge (Shifted more to the right) */}
          <div className="absolute right-14 top-16 pointer-events-none opacity-20 mix-blend-multiply -rotate-4 z-0">
            <img 
              src="/assets/straykids.webp" 
              alt="Watermark" 
              className="w-56 object-contain"
            />
          </div>

          {/* Dotted Writing Lines with Handwritten Note */}
          <div className="flex-1 flex flex-col justify-center px-4 relative mt-2">
            {[0, 1, 2, 3].map(lineIdx => (
              <div 
                key={lineIdx} 
                className="w-full border-b-2 border-dotted border-[#1A1A1A]/70 my-3 relative h-6"
              >
                {lineIdx === 1 && noteVal && (
                  <span className="absolute -top-3 left-2 font-['adamHandwriting'] text-xl font-bold text-[#1A1A1A] tracking-wider">
                    {noteVal}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Row: SKZ Logo Stamp (left) & Guitar Cat (right) */}
          <div className="flex justify-between items-end px-3 pb-1">
            {/* Bottom-Left SKZ Stamp */}
            <div className="w-16 h-16 opacity-85 mix-blend-multiply transform -rotate-6">
              <img 
                src="/assets/skz.webp" 
                alt="SKZ" 
                className="w-full h-full object-contain" 
              />
            </div>

            {/* Bottom-Right Cat Asset */}
            <div className="w-18 h-20 transform rotate-4 drop-shadow-sm">
              <img 
                src="/assets/cat-bottomRight.webp" 
                alt="Cat" 
                className="w-full h-full object-contain" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
