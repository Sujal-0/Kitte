import React from 'react';
import { 
  POSTAL_STAMPS, 
  ENVELOPE_THEMES, 
  ENVELOPE_DECORATION_OPTIONS, 
  LETTER_FONTS 
} from '../../../features/time-letter/tokens/timeLetterTokens';

function getDecorationAsset(id) {
  if (!id || id === 'none') return null;
  const dec = ENVELOPE_DECORATION_OPTIONS.find(d => d.id === id);
  if (dec && dec.src) return dec;
  const stamp = POSTAL_STAMPS.find(s => s.id === id);
  if (stamp) return stamp;
  return null;
}

export function TimeEnvelopeCard({ state, isShowcase }) {
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

  return (
    <div 
      className="relative w-[580px] h-[380px] flex flex-col transition-colors select-none overflow-hidden shadow-sm"
      style={{ 
        backgroundColor: currentTheme.bg,
        color: '#1A1A1A',
        borderRadius: `${envelopeRadius}px`
      }}
    >
      {/* Subtle Paper Grain & Fiber Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.06] mix-blend-multiply pointer-events-none z-10"
        style={{
          backgroundImage: 'radial-gradient(#1A1A1A 1px, transparent 0)',
          backgroundSize: '6px 6px'
        }}
      />

      {/* SVG Flap & Fold Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-15" viewBox="0 0 580 380">
        <defs>
          <filter id="envelope-card-handdrawn" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" result="noise" seed="4" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* Hand-Drawn Envelope Flap Line (Meeting at Center Seal apex 290, 185) */}
        {flapStyle === 'triangular' && (
          <path 
            d={envelopeRadius > 0 ? `M 6 ${6 + envelopeRadius} L 290 185 L 574 ${6 + envelopeRadius}` : "M 6 6 L 290 185 L 574 6"} 
            fill="none" 
            stroke={borderColor} 
            strokeWidth={borderStyle === 'clean-fine' ? '1.8' : '2.6'} 
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={borderStyle === 'handdrawn-single' ? 'url(#envelope-card-handdrawn)' : undefined}
          />
        )}

        {flapStyle === 'curved' && (
          <path 
            d={envelopeRadius > 0 ? `M 6 ${6 + envelopeRadius} Q 290 205 574 ${6 + envelopeRadius}` : "M 6 6 Q 290 205 574 6"} 
            fill="none" 
            stroke={borderColor} 
            strokeWidth={borderStyle === 'clean-fine' ? '1.8' : '2.6'} 
            strokeLinecap="round"
            filter={borderStyle === 'handdrawn-single' ? 'url(#envelope-card-handdrawn)' : undefined}
          />
        )}

        {/* Lower pocket diagonal fold creases */}
        <path 
          d="M 6 358 L 290 185 L 574 358" 
          fill="none" 
          stroke={borderColor} 
          strokeWidth="1.2" 
          strokeOpacity="0.35" 
          strokeDasharray="4 4" 
        />
      </svg>

      {/* Top-Right: Postage Stamp + Postmark Cancellation Cachet */}
      {activeStamp && activeStamp.id !== 'none' && (
        <div className="absolute top-[98px] right-6 z-25 flex items-center">
          {/* Postal Stamp */}
          <div className="w-14 h-18 bg-white border border-dashed border-[#1A1A1A]/80 p-0.5 flex flex-col items-center justify-between shadow-xs rotate-2">
            <div className="w-full h-12 bg-[#FBF8F1] flex items-center justify-center overflow-hidden">
              <img src={activeStamp.src} alt={activeStamp.name} className="w-full h-full object-contain" />
            </div>
            <div className="w-full flex justify-between items-center px-0.5 pt-0.5 border-t border-[#1A1A1A]/20">
              <span className="font-mono text-[7px] font-bold">KITTE</span>
              <span className="font-mono text-[7px] font-bold" style={{ color: borderColor }}>AIR</span>
            </div>
          </div>

          {/* Wavy Postmark Cancellation Lines */}
          <div className="absolute -left-14 top-2 flex flex-col gap-1 pointer-events-none opacity-75 -rotate-6">
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
        <div className="absolute top-[98px] left-6 z-25">
          <img src={topLeftAsset.src} alt={topLeftAsset.name} className="w-11 h-11 object-contain drop-shadow-xs -rotate-3" />
        </div>
      )}

      {/* Bottom-Left Slot */}
      {bottomLeftAsset && (
        <div className="absolute bottom-5 left-6 z-25">
          <img src={bottomLeftAsset.src} alt={bottomLeftAsset.name} className="w-11 h-11 object-contain drop-shadow-xs rotate-6" />
        </div>
      )}

      {/* Bottom-Right Slot */}
      {bottomRightAsset && (
        <div className="absolute bottom-5 right-6 z-25">
          <img src={bottomRightAsset.src} alt={bottomRightAsset.name} className="w-11 h-11 object-contain drop-shadow-xs -rotate-6" />
        </div>
      )}

      {/* Center: Recipient Name */}
      <div className="absolute inset-x-0 top-[215px] z-25 flex flex-col items-center justify-center text-center px-10">
        {(state.recipient || isShowcase) ? (
          <span className={`${fontMeta.fontClass} text-4xl font-bold tracking-wider text-[#1A1A1A] select-text drop-shadow-xs leading-tight transition-opacity duration-300 truncate max-w-[480px]`}>
            {state.recipient ? state.recipient : (state.letterMode === 'someone-special' ? 'Someone Special' : 'Future Me')}
          </span>
        ) : null}
        {state.recipientEmail ? (
          <span className="font-mono text-xs text-[#1A1A1A]/60 mt-1 font-medium tracking-wide transition-opacity duration-300 truncate max-w-[360px]">
            {state.recipientEmail}
          </span>
        ) : null}
      </div>

      {/* Center Closure Seal (Ribbon Bow / Wax Seal) */}
      {centerSealAsset && flapStyle !== 'none' && (
        <div className="absolute left-1/2 top-[185px] -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <img 
            src={centerSealAsset.src} 
            alt={centerSealAsset.name} 
            className="w-14 h-14 object-contain drop-shadow-md" 
          />
        </div>
      )}

      {/* Bottom Area: Notice Text */}
      <div className="absolute bottom-5 left-0 right-0 z-25 flex flex-col items-center justify-center">
        {state.letterMode === 'someone-special' ? (
          (state.envelopeNoticeText || isShowcase) ? (
            <span className={`${fontMeta.fontClass} text-lg font-bold tracking-wider text-[#1A1A1A] select-text drop-shadow-xs transition-opacity duration-300 truncate max-w-[480px] px-6 text-center`}>
              {state.envelopeNoticeText ? state.envelopeNoticeText : 'A special letter for you'}
            </span>
          ) : null
        ) : (
          (!state.isWebShare && (state.envelopeNoticeText || state.deliveryDate || isShowcase)) ? (
            <span className={`${fontMeta.fontClass} text-lg font-bold tracking-wider text-[#1A1A1A] select-text drop-shadow-xs transition-opacity duration-300 truncate max-w-[480px] px-6 text-center`}>
              {state.envelopeNoticeText 
                ? `${state.envelopeNoticeText} ${state.deliveryDate || ''}`
                : (isShowcase 
                    ? `Don't open before ${state.deliveryDate || 'OCT 26, 2027'}` 
                    : (state.deliveryDate ? `Don't open before ${state.deliveryDate}` : ''))}
            </span>
          ) : null
        )}
        {state.location ? (
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#1A1A1A]/40 mt-0.5 transition-opacity duration-300">
            • {state.location} •
          </span>
        ) : null}
      </div>

      {/* Perimeter Hand-Drawn Borders (Z-35 Overlay: Uniform 2.6px thickness on all 4 sides) */}
      <div 
        className="absolute inset-0 z-35 pointer-events-none overflow-hidden"
        style={{ borderRadius: `${envelopeRadius}px` }}
      >
        <svg className="w-full h-full" viewBox="0 0 580 380">
          <defs>
            <pattern id="airmail-stripes-border" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect x="0" y="0" width="8" height="24" fill="#B91C1C" />
              <rect x="8" y="0" width="4" height="24" fill="#FFFFFF" />
              <rect x="12" y="0" width="8" height="24" fill="#1D4ED8" />
              <rect x="20" y="0" width="4" height="24" fill="#FFFFFF" />
            </pattern>
          </defs>

          {borderStyle === 'handdrawn-single' && (
            <rect 
              x="6" y="6" width="568" height="368" rx={envelopeRadius} ry={envelopeRadius}
              fill="none" 
              stroke={borderColor} 
              strokeWidth="2.6" 
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#envelope-card-handdrawn)"
            />
          )}

          {(borderStyle === 'crimson-double-stitch' || borderStyle === 'double-stitch') && (
            <>
              <rect 
                x="6" y="6" width="568" height="368" rx={envelopeRadius} ry={envelopeRadius}
                fill="none" 
                stroke={borderColor || '#B91C1C'} 
                strokeWidth="1.6" 
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
              <rect 
                x="11" y="11" width="558" height="358" rx={Math.max(0, envelopeRadius - 4)} ry={Math.max(0, envelopeRadius - 4)}
                fill="none" 
                stroke={borderColor || '#B91C1C'} 
                strokeWidth="1.6" 
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
            </>
          )}

          {(borderStyle === 'airmail-vintage' || borderStyle === 'airmail') && (
            <>
              <rect 
                x="4" y="4" width="572" height="372" rx={envelopeRadius} ry={envelopeRadius}
                fill="none" 
                stroke="url(#airmail-stripes-border)" 
                strokeWidth="8" 
              />
              <rect 
                x="8" y="8" width="564" height="364" rx={Math.max(0, envelopeRadius - 2)} ry={Math.max(0, envelopeRadius - 2)}
                fill="none" 
                stroke="rgba(26, 26, 26, 0.2)" 
                strokeWidth="1" 
              />
            </>
          )}

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

          {(borderStyle === 'clean-fine' || borderStyle === 'minimalist-mono') && (
            <rect 
              x="6" y="6" width="568" height="368" rx={envelopeRadius} ry={envelopeRadius}
              fill="none" 
              stroke={borderColor} 
              strokeWidth="1.8" 
            />
          )}
        </svg>
      </div>

    </div>
  );
}
