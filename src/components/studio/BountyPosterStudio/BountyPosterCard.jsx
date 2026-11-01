import React, { useRef, useLayoutEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BOUNTY_POSTER_TOKENS, 
  formatBountyNumberWithGaps,
  getNameStyle,
  getBountyStyle,
  VELLUM_GRAIN_TEXTURE,
} from '../../../features/bounty-poster/tokens/bountyTokens';

export function BountyPosterCard({ state, isShowcase: _isShowcase }) {
  const {
    name = '',
    bounty = '3,000,000,000',
    imageSrc = null,
    imageScale = 1.0,
    imageOffsetX = 0,
    imageOffsetY = 0,
    showPaperCreases = true,
  } = state || {};

  const {
    width: W,
    height: H,
    header,
    photoFrame,
    deadOrAlive,
    sFlourishes,
    name: nameTokens,
    bounty: bountyTokens,
    disclaimer,
    marine,
  } = BOUNTY_POSTER_TOKENS;

  // Single-line auto-shrink / expand sizing for pirate name
  const rawName = (name || '').toUpperCase();
  const nameStyle = getNameStyle(rawName);
  const nameTextRef = useRef(null);
  const [nameScaleX, setNameScaleX] = useState(1);

  useLayoutEffect(() => {
    if (nameTextRef.current) {
      const sw = nameTextRef.current.scrollWidth;
      if (sw > photoFrame.w) {
        setNameScaleX(photoFrame.w / sw);
      } else {
        setNameScaleX(1);
      }
    } else {
      setNameScaleX(1);
    }
  }, [rawName, photoFrame.w]);

  // Single-line horizontal compression for bounty amount (size never shrinks)
  const bountyText = formatBountyNumberWithGaps(bounty);
  const bountyStyle = getBountyStyle(bountyText);
  const bountyRowRef = useRef(null);
  const [bountyScaleX, setBountyScaleX] = useState(1);

  useLayoutEffect(() => {
    if (bountyRowRef.current) {
      const rw = bountyRowRef.current.scrollWidth;
      if (rw > photoFrame.w) {
        setBountyScaleX(photoFrame.w / rw);
      } else {
        setBountyScaleX(1);
      }
    }
  }, [bountyText, photoFrame.w]);

  // Guaranteed width constraint for disclaimer to ensure separate gap before MARINE
  const disclaimerRef = useRef(null);
  const [disclaimerScaleX, setDisclaimerScaleX] = useState(1);

  useLayoutEffect(() => {
    if (disclaimerRef.current) {
      const sw = disclaimerRef.current.scrollWidth;
      const maxW = disclaimer.width || 205;
      if (sw > maxW) {
        setDisclaimerScaleX(maxW / sw);
      } else {
        setDisclaimerScaleX(1);
      }
    }
  }, [disclaimer.width, disclaimer.fontSize, disclaimer.letterSpacing, disclaimer.wordSpacing]);

  return (
    <div 
      className="relative select-none overflow-hidden rounded-[3px] transition-all"
      style={{ 
        width: `${W}px`, 
        height: `${H}px`,
        backgroundColor: '#f2dfb8',
        boxShadow: showPaperCreases 
          ? '0 12px 35px rgba(0, 0, 0, 0.45), inset 0 0 65px rgba(143, 89, 34, 0.48), inset 0 0 115px rgba(95, 45, 10, 0.38)'
          : '0 12px 35px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* Authentic Vintage Parchment Texture & Grain (Ref: AgnusDei Pen NWPbOxL) */}
      {showPaperCreases && (
        <>
          {/* Layer 1: Vellum Micro-Grain Noise Pattern */}
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-35"
            style={{ 
              backgroundImage: `url("${VELLUM_GRAIN_TEXTURE}")`, 
              backgroundRepeat: 'repeat',
            }} 
          />

          {/* Layer 2: Authentic Multi-Angle Paper Creases & Folds (Conic Gradient) */}
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-70"
            style={{
              background: `conic-gradient(
                from 0deg at 50% 50%,
                rgba(255, 255, 255, 0.22),
                rgba(255, 255, 255, 0) 2% 24%,
                rgba(255, 255, 255, 0.14) 25%,
                rgba(67, 50, 33, 0.12) 0,
                rgba(0, 0, 0, 0) 27% 48%,
                rgba(150, 100, 50, 0.18) 50%,
                rgba(255, 255, 255, 0.14) 0,
                rgba(255, 255, 255, 0) 52% 73%,
                rgba(150, 100, 50, 0.18) 75%,
                rgba(255, 255, 255, 0.22) 0,
                rgba(255, 255, 255, 0) 78% 97%,
                rgba(150, 100, 50, 0.18)
              )`,
            }}
          />

          {/* Layer 3: Central Quarter-Fold Creases (Horizontal & Vertical Fold Lines) */}
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-40"
            style={{
              background: `
                linear-gradient(to bottom, transparent calc(50% - 1.5px), rgba(255, 255, 255, 0.25) calc(50% - 0.75px), rgba(90, 45, 10, 0.28) calc(50% + 0.75px), transparent calc(50% + 1.5px)),
                linear-gradient(to right, transparent calc(50% - 1.5px), rgba(255, 255, 255, 0.25) calc(50% - 0.75px), rgba(90, 45, 10, 0.28) calc(50% + 0.75px), transparent calc(50% + 1.5px))
              `,
            }}
          />

          {/* Layer 4: Deep Aged Parchment Tanning Vignette */}
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-60"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(143, 89, 34, 0.25) 70%, rgba(95, 45, 10, 0.55) 100%)',
            }}
          />
        </>
      )}

      {/* 1. Header: "WANTED" (Libre Caslon Text, Extra Bold, 0.12em Letter Spacing, Vertically Stretched) */}
      <div 
        className="absolute left-0 right-0 text-center font-wanted-header font-black uppercase text-[#1c1008] select-none pointer-events-none"
        style={{
          top: `${header.top}px`,
          fontSize: `${header.fontSize}px`,
          lineHeight: '1',
          letterSpacing: header.letterSpacing,
          transform: `scale(${header.scaleX}, ${header.scaleY})`,
          transformOrigin: 'top center',
          WebkitTextStroke: '1.1px #1c1008',
          textShadow: '0.6px 0.6px 0px rgba(0,0,0,0.22)',
        }}
      >
        WANTED
      </div>

      {/* 2. Photo Box / Portrait Frame */}
      <div 
        className="absolute overflow-hidden bg-[#faeed8] border-[2.5px] border-[#1c1008]"
        style={{
          left: `${photoFrame.x}px`,
          top: `${photoFrame.y}px`,
          width: `${photoFrame.w}px`,
          height: `${photoFrame.h}px`,
        }}
      >
        <AnimatePresence mode="wait">
          {imageSrc ? (
            <motion.img 
              key={imageSrc}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              src={imageSrc}
              alt="Pirate Portrait"
              className="w-full h-full object-cover origin-center transition-transform"
              style={{
                transform: `scale(${imageScale}) translate(${imageOffsetX}%, ${imageOffsetY}%)`,
                mixBlendMode: 'multiply',
              }}
            />
          ) : (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-[#1c1008]/30 bg-[#f7ecd5]/80"
            >
              <svg className="w-8 h-8 text-[#1c1008]/40 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1c1008]/50">
                SUBMIT PHOTO
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Middle Banner: "DEAD OR ALIVE" (Styled as: D E A D    O R    A L I V E, spans 316px edge-to-edge) */}
      <div 
        className="absolute flex items-center justify-between font-wanted-header font-bold uppercase text-[#1c1008] select-none pointer-events-none"
        style={{
          left: `${photoFrame.x}px`,
          width: `${photoFrame.w}px`,
          top: `${deadOrAlive.top}px`,
          height: `${deadOrAlive.height}px`,
          fontSize: `${deadOrAlive.fontSize}px`,
          lineHeight: '1',
        }}
      >
        <span style={{ letterSpacing: deadOrAlive.letterSpacing }}>DEAD</span>
        <span style={{ letterSpacing: deadOrAlive.letterSpacing }}>OR</span>
        <span style={{ letterSpacing: deadOrAlive.letterSpacing, marginRight: `-${deadOrAlive.letterSpacing}` }}>ALIVE</span>
      </div>

      {/* 4. Four S-Flourishes (Row 1: s_like_struc, Row 2: s_streched covering bottom left text) */}
      {/* Row 1 Left (s_like_struc) */}
      <img 
        src={sFlourishes.row1.src} 
        alt=""
        className="absolute pointer-events-none select-none"
        style={{
          left: `${sFlourishes.row1.leftX}px`,
          top: `${sFlourishes.row1.topY}px`,
          width: `${sFlourishes.row1.w}px`,
          height: `${sFlourishes.row1.h}px`,
          objectFit: 'contain',
          filter: 'brightness(0.12) sepia(1)',
        }}
      />
      {/* Row 1 Right (s_like_struc Mirrored) */}
      <img 
        src={sFlourishes.row1.src} 
        alt=""
        className="absolute pointer-events-none select-none scale-x-[-1]"
        style={{
          right: `${sFlourishes.row1.rightX}px`,
          top: `${sFlourishes.row1.topY}px`,
          width: `${sFlourishes.row1.w}px`,
          height: `${sFlourishes.row1.h}px`,
          objectFit: 'contain',
          filter: 'brightness(0.12) sepia(1)',
        }}
      />

      {/* Row 2 Left (s_streched extending to bottom corner over disclaimer text) */}
      <img 
        src={sFlourishes.row2.src} 
        alt=""
        className="absolute pointer-events-none select-none z-10"
        style={{
          left: `${sFlourishes.row2.leftX}px`,
          top: `${sFlourishes.row2.topY}px`,
          width: `${sFlourishes.row2.w}px`,
          height: `${sFlourishes.row2.h}px`,
          objectFit: 'fill',
          filter: 'brightness(0.12) sepia(1)',
        }}
      />
      {/* Row 2 Right (s_streched Mirrored extending to bottom corner beside MARINE) */}
      <img 
        src={sFlourishes.row2.src} 
        alt=""
        className="absolute pointer-events-none select-none scale-x-[-1] z-10"
        style={{
          right: `${sFlourishes.row2.rightX}px`,
          top: `${sFlourishes.row2.topY}px`,
          width: `${sFlourishes.row2.w}px`,
          height: `${sFlourishes.row2.h}px`,
          objectFit: 'fill',
          filter: 'brightness(0.12) sepia(1)',
        }}
      />

      {/* 5. Pirate Name (OnePieceFont, Heavy Bold, 80% Size of Header WANTED, Horizontal Compression Only) */}
      <div 
        className="absolute flex items-center justify-center uppercase font-pirate-name text-[#1c1008] font-black pointer-events-none select-none"
        style={{
          left: `${nameTokens.left}px`,
          width: `${nameTokens.width}px`,
          top: `${nameTokens.top}px`,
          height: `${nameTokens.height}px`,
        }}
      >
        {rawName ? (
          <div className="w-full flex items-center justify-center overflow-visible">
            <span
              ref={nameTextRef}
              className="inline-block whitespace-nowrap shrink-0 min-w-max"
              style={{
                fontSize: `${nameStyle.fontSize}px`,
                letterSpacing: nameStyle.letterSpacing,
                lineHeight: '1',
                transform: `scale(${nameScaleX}, ${nameStyle.scaleY})`,
                transformOrigin: 'center center',
                WebkitTextStroke: '0.9px #1c1008',
                textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.18)',
              }}
            >
              {rawName}
            </span>
          </div>
        ) : (
          <span className="text-[#1c1008]/30 font-wanted-header text-sm tracking-widest font-normal">
            ENTER PIRATE NAME
          </span>
        )}
      </div>

      {/* 6. Bounty Amount Row (Centered in 316px photo frame area, never shrinks size, compresses horizontally) */}
      <div 
        className="absolute flex items-center justify-center select-none pointer-events-none"
        style={{
          left: `${bountyTokens.left}px`,
          width: `${bountyTokens.width}px`,
          top: `${bountyTokens.top}px`,
          height: `${bountyTokens.height}px`,
        }}
      >
        <div 
          ref={bountyRowRef}
          className="flex items-center justify-center gap-2 max-w-full shrink-0"
          style={{
            transform: `scale(${bountyScaleX}, 1)`,
            transformOrigin: 'center center',
          }}
        >
          {/* Authentic Berries Symbol Asset */}
          <img 
            src="/assets/berries.webp" 
            alt="Berries" 
            className="pointer-events-none select-none shrink-0"
            style={{
              width: `${bountyTokens.berryIcon.w}px`,
              height: `${bountyTokens.berryIcon.h}px`,
              objectFit: 'contain',
              filter: 'brightness(0.12) sepia(1)',
            }}
          />

          {/* Bounty Digits in Marker Font (adamHandwriting) */}
          <span 
            className="font-marker font-normal text-[#1c1008] select-none inline-block whitespace-nowrap"
            style={{
              fontSize: `${bountyStyle.fontSize}px`,
              letterSpacing: bountyStyle.letterSpacing,
              lineHeight: '1',
            }}
          >
            {bountyText}
          </span>
        </div>
      </div>

      {/* 7. Footer: World Government Disclaimer (Positioned independently on bottom left, letter spaced & line spaced) */}
      <div 
        ref={disclaimerRef}
        className="absolute font-wanted-header font-bold uppercase text-[#1c1008] select-none pointer-events-none"
        style={{
          left: `${disclaimer.left}px`,
          bottom: `${disclaimer.bottom}px`,
          maxWidth: `${disclaimer.width}px`,
          fontSize: `${disclaimer.fontSize}px`,
          lineHeight: `${disclaimer.lineHeight}px`,
          letterSpacing: disclaimer.letterSpacing,
          wordSpacing: disclaimer.wordSpacing,
          transform: `scale(${disclaimerScaleX}, 1)`,
          transformOrigin: 'left bottom',
          WebkitTextStroke: '0.2px #1c1008',
        }}
      >
        {disclaimer.lines.map((l, i) => (
          <div key={i} className="whitespace-nowrap">
            {l}
          </div>
        ))}
      </div>

      {/* 8. Footer: MARINE (Positioned independently on bottom right with dedicated separate gap from paragraph) */}
      <div 
        className="absolute font-wanted-header font-black uppercase text-[#1c1008] select-none pointer-events-none"
        style={{
          right: `${marine.right}px`,
          bottom: `${marine.bottom}px`,
          fontSize: `${marine.fontSize}px`,
          lineHeight: '1',
          letterSpacing: marine.letterSpacing,
          transform: `scale(${marine.scaleX}, ${marine.scaleY})`,
          transformOrigin: 'bottom right',
          WebkitTextStroke: '0.7px #1c1008',
        }}
      >
        MARINE
      </div>

    </div>
  );
}
