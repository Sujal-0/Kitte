import React from 'react';
import { NeuButton } from '../ui/NeuButton';
import { soundFX } from '../../utils/audio';

export function UniversalStudioHeader({ 
  title, 
  description, 
  onBack,
  onReset,
  onExport,
  isExportReady = true,
  canReset = true
}) {
  return (
    <>
      {/* 1. DESKTOP HEADER (lg and up) - 100% UNCHANGED */}
      <header className="hidden lg:flex w-full h-24 border-b-4 border-[#1A1A1A] bg-[#F4F1EA] items-center justify-between px-8 shrink-0 z-20">
        
        {/* Left: Back Button & Title */}
        <div className="flex items-center gap-8">
          <NeuButton 
            onClick={onBack}
            className="px-6 py-2 text-base flex items-center gap-3 group"
          >
            <img 
              src="/assets/dottedUpArrow.svg" 
              alt="Back" 
              className="w-6 h-6 object-contain -rotate-180 handwritten-text transition-transform duration-300 group-hover:-translate-x-3"
            />
            <span>RETURN TO DESK</span>
          </NeuButton>

          <h1 className="font-marker text-5xl uppercase tracking-tighter text-[#1A1A1A] handwritten-text" style={{ WebkitTextStroke: '1px #1A1A1A' }}>
            {title}
          </h1>
        </div>

        {/* Right: Typewriter Description */}
        <div className="max-w-sm text-right">
          <p className="font-mono text-sm uppercase tracking-widest text-[#1A1A1A]/80 leading-tight">
            {description}
          </p>
        </div>

      </header>

      {/* 2. MOBILE HEADER (< lg) - Compact & Neo-brutalist with right actions */}
      <header className="flex lg:hidden w-full h-auto min-h-[58px] py-2 px-3 border-b-3 border-[#1A1A1A] bg-[#F4F1EA] items-center justify-between gap-2.5 shrink-0 z-30 select-none">
        
        {/* Left: Return to desk (dottedUpArrow only) + Heading & Description underneath */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <NeuButton 
            onClick={onBack}
            className="p-2 shrink-0 flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            aria-label="Return to Desk"
          >
            <img 
              src="/assets/dottedUpArrow.svg" 
              alt="Back" 
              className="w-5 h-5 object-contain -rotate-180 handwritten-text"
            />
          </NeuButton>

          <div className="flex flex-col justify-center min-w-0 pr-1">
            <h1 className="font-marker text-lg sm:text-xl uppercase tracking-tight text-[#1A1A1A] handwritten-text truncate leading-none">
              {title}
            </h1>
            {description && (
              <p className="font-mono text-[9px] sm:text-[10px] text-[#1A1A1A]/70 uppercase tracking-wider truncate leading-tight mt-1 max-w-[190px] sm:max-w-xs">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Reset and Export Buttons matching Control Panel UI & hover behavior */}
        <div className="flex items-center gap-2 shrink-0">
          {onReset && (
            <button
              type="button"
              onClick={() => {
                soundFX.playPop();
                onReset();
              }}
              disabled={!canReset}
              className="px-2.5 sm:px-3 py-1 font-marker font-bold text-xs sm:text-sm uppercase tracking-wider text-[#1A1A1A] bg-[#F4F1EA] border-[2.5px] border-[#1A1A1A] border-b-[4px] hover:bg-[#e51717] hover:text-white active:border-b-[2px] active:translate-y-[2px] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#F4F1EA] disabled:hover:text-[#1A1A1A] handwritten-text select-none"
            >
              RESET
            </button>
          )}

          {onExport && (
            <button
              type="button"
              onClick={() => {
                if (!isExportReady) return;
                soundFX.playSnap();
                onExport();
              }}
              disabled={!isExportReady}
              className={`px-3 sm:px-3.5 py-1 font-marker text-xs sm:text-sm uppercase tracking-widest border-[2.5px] border-[#1A1A1A] transition-all handwritten-text select-none ${
                isExportReady
                  ? 'bg-[#1A1A1A] text-[#FFEB3B] hover:bg-[#2A2A2A] border-b-[4px] active:border-b-[2px] active:translate-y-[2px] cursor-pointer'
                  : 'bg-neutral-300 text-neutral-500 opacity-60 border-b-[2.5px] cursor-not-allowed'
              }`}
            >
              EXPORT
            </button>
          )}
        </div>

      </header>
    </>
  );
}
