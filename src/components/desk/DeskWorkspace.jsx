import React, { useState } from 'react';
import { KitteLogo } from '../ui/KitteLogo';
import { DeskRuler } from './DeskRuler';
import { ContactPhone } from './ContactPhone';
import { CrafterNotes } from './CrafterNotes';
import { TornReceipt } from './TornReceipt';
import { CuttingMat } from './CuttingMat';
import { InteractiveDeskLines } from './InteractiveDeskLines';
import { StudioModal } from './StudioModal';
import { useSessionState } from '../../hooks/useSessionState';

export function DeskWorkspace({ onEnterStudio }) {
  const [activeStudio, setActiveStudio] = useSessionState('activeStudioModal', null);

  return (
    <>
      <StudioModal 
        isOpen={!!activeStudio} 
        onClose={() => setActiveStudio(null)} 
        studioInfo={activeStudio} 
        onEnterStudio={onEnterStudio}
      />
      
      {/* Floor Layer (#fbf7f5 from body background) */}
      <main className="relative w-screen h-screen overflow-hidden text-pencil select-none flex">
        
        {/* Sketchy Hand-drawn Grid Floor Pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]">
          <svg width="100%" height="100%">
            <pattern id="sketchy-floor-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              {/* Vertical wobbly line */}
              <path d="M 60 0 Q 57 30 60 60" stroke="#2D2D2D" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Horizontal wobbly line */}
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
            
            {/* 3D Manga Border: Thick on the tilted cut, normal elsewhere (WITH SKETCHY FILTER) */}
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
                {/* Normal border for the whole desk */}
                <polygon 
                  points="15,0 100,0 100,90 95,100 0,100 0,30" 
                  stroke="#2D2D2D" 
                  strokeWidth="3" 
                  fill="none" 
                  vectorEffect="non-scaling-stroke" 
                />
                {/* Extra thick border ONLY on the top-left isometric cut */}
                <line 
                  x1="15" y1="0" x2="0" y2="30" 
                  stroke="#2D2D2D" 
                  strokeWidth="24" 
                  strokeLinecap="square"
                  vectorEffect="non-scaling-stroke" 
                />
                {/* Extra thick border ONLY on the bottom-right isometric cut */}
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
                
                {/* Notes: Top Left (Moved away from border) */}
                <div className="absolute top-20 left-12 lg:left-16 z-10">
                  <CrafterNotes />
                </div>
                
                {/* Phone: Middle Right (Zigzag) */}
                <div className="absolute top-56 right-8 lg:right-12 z-20">
                  <ContactPhone />
                </div>
                
                {/* Receipt: Bottom Left */}
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
    </>
  );
}
