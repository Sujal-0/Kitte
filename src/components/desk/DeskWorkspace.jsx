import React from 'react';
import { KitteLogo } from '../ui/KitteLogo';
import { DeskRuler } from './DeskRuler';
import { ContactPhone } from './ContactPhone';
import { CrafterNotes } from './CrafterNotes';
import { TornReceipt } from './TornReceipt';
import { CuttingMat } from './CuttingMat';
import { InteractiveDeskLines } from './InteractiveDeskLines';
import { StudioModal } from './StudioModal';
import { MobileCraftDock } from './MobileCraftDock';
import { useSessionState } from '../../hooks/useSessionState';
import { useIsMobile } from '../../hooks/useIsMobile';
import { soundFX } from '../../utils/audio';
import { triggerBurst } from '../ui/ClickBurstEngine';

export function DeskWorkspace({ onEnterStudio }) {
  const [activeStudio, setActiveStudio] = useSessionState('activeStudioModal', null);
  const [mobileMode, setMobileMode] = useSessionState('kitteMobileDeskMode', 'swipe');
  const isMobile = useIsMobile(1024);

  const handleModeSwitch = (mode, e) => {
    soundFX.playPop();
    if (e?.clientX) triggerBurst(e.clientX, e.clientY);
    setMobileMode(mode);
  };

  return (
    <>
      <StudioModal 
        isOpen={!!activeStudio} 
        onClose={() => setActiveStudio(null)} 
        studioInfo={activeStudio} 
        onEnterStudio={onEnterStudio}
      />
      
      {/* ======================================================== */}
      {/* MOBILE VIEWPORT (< 1024px)                                */}
      {/* Clean Desk Surface with 100% Interactive Lines matching Desktop */}
      {/* ======================================================== */}
      {isMobile ? (
        <main className="relative w-screen h-[100dvh] overflow-hidden text-pencil select-none flex flex-col justify-between bg-deskSurface">
          {/* Authentic Interactive Desk Lines (100% Opacity, matching Desktop) */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <InteractiveDeskLines />
          </div>

          {/* Top Bar: Logo on Left, Neo-Brutalist Toggle on Right */}
          <header className="relative z-30 pt-3 px-3 sm:px-4 flex items-center justify-between pointer-events-auto">
            <div className="scale-85 sm:scale-90 origin-top-left">
              <KitteLogo />
            </div>

            {/* Neo-Brutalist Mode Toggle (Sharp, High-Contrast & Visible) */}
            <div className="flex items-center bg-[#FFFCE8] border-[2.5px] border-[#2D2D2D] shadow-[3px_3px_0px_#2D2D2D] overflow-hidden">
              <button
                type="button"
                onClick={(e) => handleModeSwitch('swipe', e)}
                className={`px-2.5 sm:px-3 py-1 font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer select-none ${
                  mobileMode === 'swipe'
                    ? 'bg-[#2D2D2D] text-[#FFFFFF]'
                    : 'bg-transparent text-[#2D2D2D] hover:bg-[#2D2D2D]/10'
                }`}
              >
                ✦ SWIPE
              </button>
              <button
                type="button"
                onClick={(e) => handleModeSwitch('all-in-one', e)}
                className={`px-2.5 sm:px-3 py-1 font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all border-l-[2.5px] border-[#2D2D2D] cursor-pointer select-none ${
                  mobileMode === 'all-in-one'
                    ? 'bg-[#2D2D2D] text-[#FFFFFF]'
                    : 'bg-transparent text-[#2D2D2D] hover:bg-[#2D2D2D]/10'
                }`}
              >
                ☷ ALL-IN-ONE
              </button>
            </div>
          </header>

          {/* Center: The Interactive Cutting Mat Workspace (Maximized height) */}
          <section className="relative flex-1 w-full min-h-0 flex items-center justify-center px-1 sm:px-2 z-20">
            <CuttingMat 
              onOpenStudio={setActiveStudio} 
              mobileMode={mobileMode}
              onToggleMode={setMobileMode}
            />
          </section>

          {/* Bottom Dock: Taped Craft Artifacts (Notes, Receipt, Phone), comfortably lifted above home bar */}
          <footer className="relative z-30 w-full pb-4 sm:pb-6 pointer-events-auto shrink-0 mb-1">
            <MobileCraftDock />
          </footer>
        </main>
      ) : (
        /* ======================================================== */
        /* DESKTOP VIEWPORT (>= 1024px)                             */
        /* 100% Unchanged Desktop 3D Isometric Desk Layout          */
        /* ======================================================== */
        <main className="relative w-screen h-screen overflow-hidden text-pencil select-none flex">
          {/* Sketchy Hand-drawn Grid Floor Pattern */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]">
            <svg width="100%" height="100%">
              <pattern id="sketchy-floor-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 Q 57 30 60 60" stroke="#2D2D2D" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M 0 60 Q 30 57 60 60" stroke="#2D2D2D" strokeWidth="3" fill="none" strokeLinecap="round" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#sketchy-floor-grid)" />
            </svg>
          </div>

          {/* Logo placed on the exposed floor (Top Left) */}
          <div className="absolute top-4 left-4 z-20">
            <KitteLogo />
          </div>

          {/* 3D Desk Wrapper with Drop Shadow */}
          <div 
            className="absolute inset-0 z-10"
            style={{ 
              filter: 'drop-shadow(-20px 20px 0px #2D2D2D)'
            }}
          >
            {/* Desk Surface Layer */}
            <div 
              className="absolute inset-0 bg-deskSurface overflow-hidden"
              style={{ 
                clipPath: 'polygon(15% 0%, 100% 0%, 100% 90%, 95% 100%, 0% 100%, 0% 30%)', 
              }}
            >
              {/* Interactive Lines Background */}
              <InteractiveDeskLines />
              
              {/* 3D Manga Border: Thick on the tilted cut, normal elsewhere */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none" 
                preserveAspectRatio="none" 
                viewBox="0 0 100 100" 
                style={{ zIndex: 11 }}
              >
                <defs>
                  <filter id="sketchy-border" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                </defs>
                
                <g filter="url(#sketchy-border)">
                  <polygon 
                    points="15,0 100,0 100,90 95,100 0,100 0,30" 
                    stroke="#2D2D2D" 
                    strokeWidth="3" 
                    fill="none" 
                    vectorEffect="non-scaling-stroke" 
                  />
                  <line 
                    x1="15" y1="0" x2="0" y2="30" 
                    stroke="#2D2D2D" 
                    strokeWidth="24" 
                    strokeLinecap="square"
                    vectorEffect="non-scaling-stroke" 
                  />
                  <line 
                    x1="100" y1="90" x2="95" y2="100" 
                    stroke="#2D2D2D" 
                    strokeWidth="24" 
                    strokeLinecap="square"
                    vectorEffect="non-scaling-stroke" 
                  />
                </g>
              </svg>
              
              <div className="relative w-full h-full flex p-4 lg:p-6 gap-2 lg:gap-6 pt-16 lg:pt-6 z-20">
                {/* Left 30% Stationary Zone - Zigzag Layout */}
                <aside className="relative w-full lg:w-[28%] xl:w-[26%] h-full z-30">
                  <div className="absolute top-20 left-12 lg:left-16 z-10">
                    <CrafterNotes />
                  </div>
                  
                  <div className="absolute top-56 right-8 lg:right-12 z-20">
                    <ContactPhone />
                  </div>
                  
                  <div className="absolute top-[460px] left-6 lg:left-10 z-10">
                    <TornReceipt />
                  </div>
                </aside>

                {/* The Physical Divider */}
                <DeskRuler />

                {/* Right 70% Active Zone */}
                <section className="relative flex-1 h-full flex flex-col min-h-0">
                  <CuttingMat onOpenStudio={setActiveStudio} />
                </section>
              </div>
            </div>
          </div>
        </main>
      )}
    </>
  );
}
