import React from 'react';
import { 
  PAPER_THEMES, 
  LETTER_FONTS, 
  DECORATIVE_ACCENTS, 
  POSTAL_STAMPS, 
  ENVELOPE_DECORATION_OPTIONS, 
  DEFAULT_TIME_LETTER_STATE,
  MAX_LETTER_BODY_LINES,
  MAX_LETTER_BODY_CHARS,
  LETTER_CHARS_PER_LINE,
  cutLetterBodyToFit
} from '../../../features/time-letter/tokens/timeLetterTokens';

function getDecorationAsset(id) {
  if (!id || id === 'none') return null;
  const dec = ENVELOPE_DECORATION_OPTIONS.find(d => d.id === id);
  if (dec && dec.src) return dec;
  const stamp = POSTAL_STAMPS.find(s => s.id === id);
  if (stamp) return stamp;
  const accent = DECORATIVE_ACCENTS.find(a => a.id === id);
  if (accent) return accent;
  return null;
}

export function TimeLetterCard({ state, isShowcase }) {
  const paperThemeId = state.letterPaperTheme || state.paperTheme;
  const currentTheme = PAPER_THEMES.find(t => t.id === paperThemeId || t.bgColor === paperThemeId) || PAPER_THEMES[0];
  const currentFont = LETTER_FONTS.find(f => f.id === state.fontStyle) || LETTER_FONTS[0];

  const borderColor = state.letterBorderColor || '#B91C1C';
  const borderStyle = state.letterBorderStyle || 'handdrawn-single';
  const letterRadius = state.letterBorderRadius !== undefined ? Number(state.letterBorderRadius) : 8;
  const innerRadius = Math.max(0, letterRadius - 2);

  const letterStampId = state.letterStamp !== undefined ? state.letterStamp : 'cat-stamp';
  const activeStamp = (letterStampId && letterStampId !== 'none') ? POSTAL_STAMPS.find(s => s.id === letterStampId) : null;

  const letterSealAsset = getDecorationAsset(state.letterCenterSeal || state.letterTopLeft || 'ribbon');
  const letterBottomAsset = getDecorationAsset(state.letterBottomLeft || 'handDrawnHeart');

  const maxLines = (state.salutation && state.salutation.trim()) 
    ? MAX_LETTER_BODY_LINES 
    : MAX_LETTER_BODY_LINES + 1;

  const rawBody = (state.letterBody !== undefined && state.letterBody !== null && state.letterBody !== '') 
    ? state.letterBody 
    : (isShowcase ? DEFAULT_TIME_LETTER_STATE.letterBody : '');

  // Automatically cut exceeded part on preview so UI remains compact and perfectly proportioned
  const displayBody = cutLetterBodyToFit(rawBody, maxLines, MAX_LETTER_BODY_CHARS, LETTER_CHARS_PER_LINE);

  return (
    <div 
      className="relative w-[550px] h-[432px] flex flex-col px-6 pt-3 pb-3 transition-colors select-none overflow-hidden shrink-0"
      style={{ 
        backgroundColor: currentTheme.bgColor,
        color: '#1A1A1A',
        borderRadius: `${letterRadius}px`
      }}
    >
      {/* SVG Hand-Drawn Perimeter Border for Letter */}
      {borderStyle !== 'none' && (
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-20" 
          viewBox="0 0 550 432"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="letter-handdrawn" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" result="noise" seed="5" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>

          {borderStyle === 'handdrawn-single' && (
            <rect 
              x="8" y="8" width="534" height="416" rx={innerRadius} ry={innerRadius}
              fill="none" 
              stroke={borderColor} 
              strokeWidth="2.4" 
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#letter-handdrawn)"
            />
          )}

          {borderStyle === 'stitched-dashed' && (
            <rect 
              x="8" y="8" width="534" height="416" rx={innerRadius} ry={innerRadius}
              fill="none" 
              stroke={borderColor} 
              strokeWidth="2.0" 
              strokeDasharray="8 6"
              strokeLinecap="round"
            />
          )}

          {borderStyle === 'clean-fine' && (
            <rect 
              x="8" y="8" width="534" height="416" rx={innerRadius} ry={innerRadius}
              fill="none" 
              stroke={borderColor} 
              strokeWidth="1.6" 
            />
          )}
        </svg>
      )}

      {/* Ruled Writing Lines (Spanning full generous height) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-80 z-0"
        style={{
          backgroundImage: `repeating-linear-gradient(transparent, transparent 20px, ${currentTheme.lineColor} 21px)`,
          backgroundPosition: '0 52px'
        }}
      />

      {/* Subtle Paper Grain Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-multiply z-0"
        style={{
          backgroundImage: 'radial-gradient(#1A1A1A 1px, transparent 0)',
          backgroundSize: '8px 8px'
        }}
      />

      {/* Top Header: Clean Date Line + Stamp + Seal */}
      <header className="relative z-10 flex items-center justify-between pb-1 mb-1 border-b border-[#1A1A1A]/10 h-[34px] shrink-0">
        <div className="flex items-center gap-2">
          {letterSealAsset && (
            <img 
              src={letterSealAsset.src} 
              alt={letterSealAsset.name} 
              className="w-8.5 h-auto object-contain -rotate-6 drop-shadow-xs" 
            />
          )}
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#1A1A1A]/50">
            {state.letterMode === 'someone-special' ? 'A SPECIAL LETTER' : 'A LETTER TO MY FUTURE SELF'}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={`${currentFont.fontClass} text-xs font-bold text-[#1A1A1A]/80 tracking-wide`}>
            {state.sendDate || 'OCT 26, 2026'}
          </span>
          {state.location ? (
            <span className="font-mono text-[9px] text-[#1A1A1A]/50">
              • {state.location}
            </span>
          ) : null}

          {/* Letter Postage Stamp (Configurable in Letter Tab!) */}
          {activeStamp && (
            <div className="flex items-center ml-1">
              <div className="w-8 h-9.5 bg-white border border-dashed border-[#1A1A1A] p-0.5 flex flex-col items-center justify-between shadow-xs rotate-2 shrink-0">
                <img src={activeStamp.src} alt={activeStamp.name} className="w-full h-6.5 object-contain" />
                <span className="font-mono text-[6px] font-bold" style={{ color: borderColor }}>KITTE</span>
              </div>
              <div className="flex flex-col gap-0.5 -ml-1 opacity-70 pointer-events-none -rotate-6">
                <svg width="20" height="10" viewBox="0 0 24 12" fill="none">
                  <path d="M0 2 Q 4 0 8 2 T 16 2 T 24 2" stroke="#1A1A1A" strokeWidth="1" />
                  <path d="M0 6 Q 4 4 8 6 T 16 6 T 24 6" stroke="#1A1A1A" strokeWidth="1" />
                  <path d="M0 10 Q 4 8 8 10 T 16 10 T 24 10" stroke="#1A1A1A" strokeWidth="1" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Letter Content Section (Full-height writing space) */}
      <main className="relative z-10 flex-1 flex flex-col justify-between overflow-hidden">
        <div className="flex flex-col overflow-hidden">
          
          {/* Salutation */}
          {(state.salutation || isShowcase) ? (
            <div className={`${currentFont.fontClass} text-[20px] font-bold text-[#1A1A1A] leading-[21px] h-[21px] mb-0.5 transition-opacity duration-300 truncate max-w-full shrink-0`}>
              {state.salutation ? state.salutation : (isShowcase ? 'Dear Future Me,' : '')}
            </div>
          ) : null}

          {/* Letter Body */}
          {(displayBody || isShowcase) ? (
            <div 
              className={`${currentFont.fontClass} text-[14px] leading-[21px] text-[#1A1A1A] whitespace-pre-line tracking-normal overflow-hidden transition-opacity duration-300`}
              style={{ 
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {displayBody}
            </div>
          ) : null}
        </div>

        {/* Footer: Sign-off & Author Signature */}
        <footer className="pt-1.5 border-t border-[#1A1A1A]/10 flex items-end justify-between relative mt-auto shrink-0 h-[48px]">
          <div className="flex flex-col">
            {(state.signOff || isShowcase) ? (
              <span className={`${currentFont.fontClass} text-xs italic text-[#1A1A1A]/70 transition-opacity duration-300 truncate max-w-[240px]`}>
                {state.signOff ? state.signOff : (isShowcase ? 'With love & patience,' : '')}
              </span>
            ) : null}
            <div className="flex items-center gap-2 mt-0.5">
              {(state.author || isShowcase) ? (
                <span className={`${currentFont.fontClass} text-lg font-bold text-[#1A1A1A] transition-opacity duration-300 truncate max-w-[200px]`}>
                  {state.author ? state.author : (isShowcase ? 'Past You' : '')}
                </span>
              ) : null}
              {letterBottomAsset && (
                <img 
                  src={letterBottomAsset.src} 
                  alt={letterBottomAsset.name} 
                  className="w-4.5 h-4.5 object-contain -rotate-6 inline-block drop-shadow-xs" 
                />
              )}
            </div>
          </div>

          {/* Bottom Right: Decorative Accents */}
          {state.letterBottomRight && (
            <div className="flex items-center gap-2">
              <img 
                src={getDecorationAsset(state.letterBottomRight)?.src} 
                alt="Accent" 
                className="w-7 h-7 object-contain rotate-6 drop-shadow-xs" 
              />
            </div>
          )}
        </footer>
      </main>
    </div>
  );
}
