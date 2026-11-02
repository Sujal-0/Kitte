import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  POSTAL_STAMPS, 
  ENVELOPE_THEMES, 
  ENVELOPE_DECORATION_OPTIONS, 
  LETTER_FONTS 
} from '../../../features/time-letter/tokens/timeLetterTokens';
import { isLetterLocked } from '../../../features/time-letter/utils/timeLetterShare';
import { TimeLetterCard } from './TimeLetterCard';
import { soundFX } from '../../../utils/audio';

function getDecorationAsset(id) {
  if (!id || id === 'none') return null;
  const dec = ENVELOPE_DECORATION_OPTIONS.find(d => d.id === id);
  if (dec && dec.src) return dec;
  const stamp = POSTAL_STAMPS.find(s => s.id === id);
  if (stamp) return stamp;
  return null;
}

export function TimeLetterInteractiveEnvelope({ 
  state, 
  isShowcase, 
  onStartCustomizing, 
  onToggleOpen 
}) {
  const isOpen = !!state.isOpen;
  const isLocked = isShowcase ? false : isLetterLocked(state);
  const currentTheme = ENVELOPE_THEMES.find(t => t.id === state.envelopeTheme || t.bg === state.envelopeTheme) || ENVELOPE_THEMES[0];
  const activeStamp = POSTAL_STAMPS.find(s => s.id === state.envelopeStamp) || POSTAL_STAMPS[0];
  const fontMeta = LETTER_FONTS.find(f => f.id === state.fontStyle) || LETTER_FONTS[0];

  const borderColor = state.envelopeBorderColor || '#B91C1C';
  const borderStyle = state.envelopeBorderStyle || 'handdrawn-single';
  const flapStyle = state.envelopeFlapStyle || 'triangular';
  const envelopeRadius = state.envelopeBorderRadius !== undefined ? Number(state.envelopeBorderRadius) : 16;

  const topLeftAsset = getDecorationAsset(state.envelopeTopLeft);
  const centerSealAsset = getDecorationAsset(state.envelopeCenterSeal !== undefined ? state.envelopeCenterSeal : 'ribbon');
  const bottomLeftAsset = getDecorationAsset(state.envelopeBottomLeft);
  const bottomRightAsset = getDecorationAsset(state.envelopeBottomRight);

  const handleClick = (e) => {
    e.stopPropagation();
    if (isShowcase) {
      soundFX.playPop();
      onStartCustomizing();
      return;
    }
    soundFX.playPop();
    onToggleOpen();
  };

  return (
    <div 
      className="relative flex items-center justify-center cursor-pointer select-none touch-manipulation"
      onClick={handleClick}
      style={{ perspective: '1400px' }}
    >
      {/* Outer Envelope Motion Wrapper */}
      <motion.div 
        className="relative w-[580px] h-[380px]"
        animate={{ y: isOpen ? 85 : 0 }}
        transition={{ type: "spring", stiffness: 75, damping: 16 }}
      >
        {/* ========================================================
            LAYER 1: ENVELOPE BACK WALL & INTERIOR CAVITY
           ======================================================== */}
        <div 
          className="absolute inset-0 overflow-hidden shadow-md border-2 border-[#1A1A1A]/30"
          style={{ 
            backgroundColor: currentTheme.innerBg || '#EFE8D6',
            borderRadius: `${envelopeRadius}px`
          }}
        >
          {/* Subtle paper grain texture inside cavity */}
          <div 
            className="absolute inset-0 opacity-[0.08] mix-blend-multiply pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#1A1A1A 1px, transparent 0)',
              backgroundSize: '6px 6px'
            }}
          />
          {/* Interior depth shadow */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/10 pointer-events-none" />
        </div>

        {/* ========================================================
            LAYER 2: SLIDING LETTERHEAD (Increased Height by 20% = 432px)
            (Animates IN FRONT when opened with z-index 50)
           ======================================================== */}
        <motion.div 
          className="absolute left-[15px] top-[10px] w-[550px] h-[432px] origin-bottom cursor-pointer"
          animate={{ 
            y: isOpen ? -230 : 0,
            scale: isOpen ? 1.0 : 0.96,
            zIndex: isOpen ? 50 : 15,
            opacity: isOpen ? 1 : 0.85,
            clipPath: isOpen ? 'inset(0px 0px 0px 0px)' : 'inset(0px 0px 85px 0px)'
          }}
          transition={{ 
            type: "spring", 
            stiffness: 80, 
            damping: 16,
            zIndex: { delay: isOpen ? 0.15 : 0 },
            clipPath: { duration: 0.3 }
          }}
          onClick={(e) => {
            if (isOpen) {
              e.stopPropagation();
              handleClick(e);
            }
          }}
        >
          {/* The Actual Letterhead Sheet (Fully elevated in front of envelope when open!) */}
          <div className={`w-full h-full rounded-xs overflow-hidden transition-shadow duration-300 ${
            isOpen ? 'shadow-[0px_24px_50px_rgba(0,0,0,0.38)]' : 'shadow-none'
          }`}>
            <TimeLetterCard state={state} isShowcase={isShowcase} />
          </div>
        </motion.div>

        {/* ========================================================
            LAYER 3: ENVELOPE FRONT BODY & POCKET
            (Matches entire envelope color & paper texture)
           ======================================================== */}
        <div 
          className="absolute inset-0 z-25 pointer-events-none overflow-hidden shadow-sm"
          style={{ 
            backgroundColor: currentTheme.bg,
            borderRadius: `${envelopeRadius}px`
          }}
        >
          {/* Paper Grain: Identical to the entire envelope */}
          <div 
            className="absolute inset-0 opacity-[0.06] mix-blend-multiply"
            style={{
              backgroundImage: 'radial-gradient(#1A1A1A 1px, transparent 0)',
              backgroundSize: '6px 6px'
            }}
          />

          {/* Lower pocket diagonal fold creases */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 580 380">
            <path 
              d="M 6 358 L 290 185 L 574 358" 
              fill="none" 
              stroke={borderColor} 
              strokeWidth="1.2" 
              strokeOpacity="0.35" 
              strokeDasharray="4 4" 
            />
          </svg>

          {/* Top-Right: Postage Stamp + Postmark Cancellation Cachet
              (Cleanly placed at top-[98px] right-6 so the entire stamp and wavy cancellation lines
              are 100% visible and NEVER cut off by the flap!) */}
          {activeStamp && activeStamp.id !== 'none' && (
            <div className="absolute top-[98px] right-6 z-35 flex items-center">
              {/* Stamp Card */}
              <div className="w-14 h-18 bg-white border border-dashed border-[#1A1A1A]/80 p-0.5 flex flex-col items-center justify-between shadow-xs rotate-2">
                <div className="w-full h-12 bg-[#FBF8F1] flex items-center justify-center overflow-hidden">
                  <img src={activeStamp.src} alt={activeStamp.name} className="w-full h-full object-contain" />
                </div>
                <div className="w-full flex justify-between items-center px-0.5 pt-0.5 border-t border-[#1A1A1A]/20">
                  <span className="font-mono text-[7px] font-bold">KITTE</span>
                  <span className="font-mono text-[7px] font-bold" style={{ color: borderColor }}>AIR</span>
                </div>
              </div>

              {/* Postmark cancellation cachet (Positioned safely to left of stamp) */}
              <div className="absolute -left-14 top-2 flex flex-col gap-1 opacity-75 -rotate-6 pointer-events-none">
                <svg width="60" height="22" viewBox="0 0 60 22" fill="none">
                  <path d="M0 4 Q 8 0 15 4 T 30 4 T 45 4 T 60 4" stroke="#1A1A1A" strokeWidth="1.2" fill="none" />
                  <path d="M0 11 Q 8 7 15 11 T 30 11 T 45 11 T 60 11" stroke="#1A1A1A" strokeWidth="1.2" fill="none" />
                  <path d="M0 18 Q 8 14 15 18 T 30 18 T 45 18 T 60 18" stroke="#1A1A1A" strokeWidth="1.2" fill="none" />
                </svg>
                <div className="font-mono text-[7px] font-bold tracking-widest uppercase text-center -mt-1 text-[#1A1A1A]/70">
                  {state.sendDate || 'OCT 2026'}
                </div>
              </div>
            </div>
          )}

          {/* Top-Left Slot */}
          {topLeftAsset && (
            <div className="absolute top-[98px] left-6 z-35">
              <img src={topLeftAsset.src} alt={topLeftAsset.name} className="w-11 h-11 object-contain drop-shadow-xs -rotate-3" />
            </div>
          )}

          {/* Bottom-Left Slot */}
          {bottomLeftAsset && (
            <div className="absolute bottom-5 left-6 z-35">
              <img src={bottomLeftAsset.src} alt={bottomLeftAsset.name} className="w-11 h-11 object-contain drop-shadow-xs rotate-6" />
            </div>
          )}

          {/* Bottom-Right Slot */}
          {bottomRightAsset && (
            <div className="absolute bottom-5 right-6 z-35">
              <img src={bottomRightAsset.src} alt={bottomRightAsset.name} className="w-11 h-11 object-contain drop-shadow-xs -rotate-6" />
            </div>
          )}

          {/* Center: Recipient Name (Comfortably placed below flap apex 185px) */}
          <div className="absolute inset-x-0 top-[215px] flex flex-col items-center justify-center text-center px-10">
            {(state.recipient || isShowcase) ? (
              <span className={`${fontMeta.fontClass} text-4xl font-bold tracking-wider text-[#1A1A1A] select-text drop-shadow-xs leading-tight transition-opacity duration-300`}>
                {state.recipient ? state.recipient : (state.letterMode === 'someone-special' ? 'Someone Special' : 'Future Me')}
              </span>
            ) : null}
            {state.recipientEmail ? (
              <span className="font-mono text-xs text-[#1A1A1A]/60 mt-1 font-medium tracking-wide transition-opacity duration-300">
                {state.recipientEmail}
              </span>
            ) : null}
          </div>

          {/* Bottom Area: Notice Text */}
          <div className="absolute bottom-5 left-0 right-0 flex flex-col items-center justify-center">
            {state.letterMode === 'someone-special' ? (
              (state.envelopeNoticeText || isShowcase) ? (
                <span className={`${fontMeta.fontClass} text-lg font-bold tracking-wider text-[#1A1A1A] select-text drop-shadow-xs transition-opacity duration-300`}>
                  {state.envelopeNoticeText ? state.envelopeNoticeText : 'A special letter for you'}
                </span>
              ) : null
            ) : (
              (state.envelopeNoticeText || (isLocked && state.deliveryDate)) ? (
                <span className={`${fontMeta.fontClass} text-lg font-bold tracking-wider text-[#1A1A1A] select-text drop-shadow-xs transition-opacity duration-300`}>
                  {state.envelopeNoticeText 
                    ? `${state.envelopeNoticeText} ${state.deliveryDate || ''}`
                    : `Don't open before ${state.deliveryDate}`}
                </span>
              ) : null
            )}
            {state.location ? (
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#1A1A1A]/40 mt-0.5 transition-opacity duration-300">
                • {state.location} •
              </span>
            ) : null}
          </div>
        </div>

        {/* ========================================================
            LAYER 4: ENVELOPE TOP TRIANGULAR FLAP & SEAL
            (Matches entire envelope color perfectly! Folds upward 180° when opened!)
           ======================================================== */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-[190px] z-30 origin-top pointer-events-none"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ 
            rotateX: isOpen ? -180 : 0,
            opacity: isOpen ? 0.35 : 1
          }}
          transition={{ duration: 0.6, ease: [0.35, 0, 0.15, 1] }}
        >
          {/* Triangular Flap Body - Starts at exact side corner tangents (6,22) and (574,22) */}
          <svg className="w-full h-full overflow-visible" viewBox="0 0 580 190">
            {/* Flap Body filled with identical currentTheme.bg */}
            <path 
              d={flapStyle === 'curved' 
                ? (envelopeRadius > 0 
                    ? `M 6 ${6 + envelopeRadius} A ${envelopeRadius} ${envelopeRadius} 0 0 1 ${6 + envelopeRadius} 6 L ${574 - envelopeRadius} 6 A ${envelopeRadius} ${envelopeRadius} 0 0 1 574 ${6 + envelopeRadius} Q 290 205 6 ${6 + envelopeRadius} Z` 
                    : "M 6 6 L 574 6 Q 290 205 6 6 Z")
                : (envelopeRadius > 0 
                    ? `M 6 ${6 + envelopeRadius} A ${envelopeRadius} ${envelopeRadius} 0 0 1 ${6 + envelopeRadius} 6 L ${574 - envelopeRadius} 6 A ${envelopeRadius} ${envelopeRadius} 0 0 1 574 ${6 + envelopeRadius} L 290 185 Z` 
                    : "M 6 6 L 574 6 L 290 185 Z")}
              fill={currentTheme.bg}
              stroke="none"
            />

            {/* Matching Hand-Drawn Flap Border Line */}
            {borderStyle !== 'none' && flapStyle !== 'none' && (
              <path 
                d={flapStyle === 'curved' 
                  ? (envelopeRadius > 0 ? `M 6 ${6 + envelopeRadius} Q 290 205 574 ${6 + envelopeRadius}` : "M 6 6 Q 290 205 574 6")
                  : (envelopeRadius > 0 ? `M 6 ${6 + envelopeRadius} L 290 185 L 574 ${6 + envelopeRadius}` : "M 6 6 L 290 185 L 574 6")}
                fill="none"
                stroke={borderColor}
                strokeWidth={borderStyle === 'clean-fine' ? '1.8' : '2.6'}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={borderStyle === 'stitched-dashed' ? '8 6' : undefined}
                filter={borderStyle === 'handdrawn-single' ? 'url(#handdrawn-jitter)' : undefined}
              />
            )}
          </svg>

          {/* Paper texture overlay on flap */}
          <div 
            className="absolute inset-0 opacity-[0.06] mix-blend-multiply pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#1A1A1A 1px, transparent 0)',
              backgroundSize: '6px 6px'
            }}
          />

          {/* Center Closure Seal (Ribbon Bow / Wax Seal at apex 290, 185) */}
          {centerSealAsset && flapStyle !== 'none' && (
            <motion.div 
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: '290px', top: '185px' }}
              animate={{ 
                scale: isOpen ? 0.8 : 1,
                opacity: isOpen ? 0.2 : 1
              }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src={centerSealAsset.src} 
                alt={centerSealAsset.name} 
                className="w-14 h-14 object-contain drop-shadow-md" 
              />
            </motion.div>
          )}
        </motion.div>

        {/* ========================================================
            LAYER 5: UNIFIED OUTER PERIMETER BORDER (Z-35 OVERLAY)
            (Rendered on top so the top border is NEVER half-covered by the flap fill,
             guaranteeing uniform thickness on all 4 sides!)
           ======================================================== */}
        <div 
          className="absolute inset-0 z-35 pointer-events-none overflow-hidden"
          style={{ borderRadius: `${envelopeRadius}px` }}
        >
          <svg className="w-full h-full" viewBox="0 0 580 380">
            <defs>
              <filter id="handdrawn-jitter" x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" result="noise" seed="4" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>

            {/* Hand-drawn single stroke - Uniform on ALL 4 sides */}
            {borderStyle === 'handdrawn-single' && (
              <rect 
                x="6" y="6" width="568" height="368" rx={envelopeRadius} ry={envelopeRadius}
                fill="none" 
                stroke={borderColor} 
                strokeWidth="2.6" 
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#handdrawn-jitter)"
              />
            )}

            {/* Stitched dashed line */}
            {borderStyle === 'stitched-dashed' && (
              <rect 
                x="6" y="6" width="568" height="368" rx={envelopeRadius} ry={envelopeRadius}
                fill="none" 
                stroke={borderColor} 
                strokeWidth="2.2" 
                strokeDasharray="8 6"
                strokeLinecap="round"
              />
            )}

            {/* Clean fine line */}
            {borderStyle === 'clean-fine' && (
              <rect 
                x="6" y="6" width="568" height="368" rx={envelopeRadius} ry={envelopeRadius}
                fill="none" 
                stroke={borderColor} 
                strokeWidth="1.8" 
              />
            )}
          </svg>
        </div>

      </motion.div>
    </div>
  );
}
