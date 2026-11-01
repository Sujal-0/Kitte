import React from 'react';
import { FloatingArtifact } from './FloatingArtifact';
import { WashiTape } from './WashiTape';

export function CuttingMat({ onOpenStudio }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none p-4 md:p-8 lg:p-12 overflow-hidden">
      
      {/* The Cutting Mat SVG Base - Reduced scale by 10% to prevent vertical cutoff */}
      <div className="relative w-full h-full max-w-6xl scale-100 md:scale-110">
        
        {/* Shadow drastically reduced to feel physically closer to the desk */}
        <img 
          src="/assets/cutting-mat.svg" 
          alt="Cutting Mat Base" 
          className="w-full h-full object-contain drop-shadow-[4px_4px_0px_rgba(45,45,45,0.8)]"
          style={{ transform: "rotate(-1deg)" }} 
        />
        
        {/* Container for Artifacts */}
        <div className="absolute inset-0 z-10 pointer-events-auto">
          
          {/* STATIC ARTIFACTS (Taped down, do not float) */}
          {/* Joy Boy - Reduced size by 10% */}
          <div className="absolute top-[8%] left-[45%] w-10 sm:w-14 md:w-16 lg:w-20 -rotate-3 z-0 pointer-events-none drop-shadow-sm select-none">
            <img src="/assets/joyBoy.webp" alt="Joy Boy Archive" className="w-full h-auto" />
            <WashiTape className="absolute -top-2 left-1/2 -translate-x-1/2 rotate-2 w-6 md:w-8 h-3 md:h-4" />
          </div>

          {/* Time - Positioned just above Time Letter */}
          <div className="absolute top-[58%] left-[18%] w-10 sm:w-14 md:w-16 lg:w-20 rotate-6 z-0 pointer-events-none drop-shadow-sm select-none">
            <img src="/assets/time.webp" alt="Time Archive" className="w-full h-auto" />
            <WashiTape className="absolute -top-1 left-1/2 -translate-x-1/2 -rotate-3 w-6 md:w-8 h-3 md:h-4" />
          </div>

          {/* FLOATING ARTIFACTS */}

          {/* Top Left: Travel ID */}
          <FloatingArtifact 
            src="/assets/travelID.webp"
            alt="Travel ID Generator"
            headline="TRAVEL ID"
            baseX="10%"
            baseY="15%"
            baseRotate={-5}
            config={{ a: 1.2, b: 2.1, A: 15, B: 25, delta: 0 }}
            className="w-24 sm:w-32 md:w-40 lg:w-48"
            onOpenStudio={onOpenStudio}
          />

          {/* Top Right: Photo Booth */}
          <FloatingArtifact 
            src="/assets/photoBooth.webp"
            alt="Photo Booth Studio"
            headline="PHOTO BOOTH"
            baseX="65%"
            baseY="10%"
            baseRotate={4}
            config={{ a: 1.5, b: 1.8, A: 20, B: 15, delta: Math.PI / 3 }}
            className="w-24 sm:w-32 md:w-44 lg:w-52"
            onOpenStudio={onOpenStudio}
          />

          {/* Center: Bounty Poster (Size Reduced by ~30%) */}
          <FloatingArtifact 
            src="/assets/bountyPoster.webp"
            alt="Bounty Poster Generator"
            headline="BOUNTY POSTER"
            baseX="35%"
            baseY="35%"
            baseRotate={-2}
            config={{ a: 0.8, b: 1.1, A: 10, B: 10, delta: Math.PI }}
            className="w-20 sm:w-28 md:w-32 lg:w-40"
            onOpenStudio={onOpenStudio}
          />

          {/* Bottom Left: Time Letter */}
          <FloatingArtifact 
            src="/assets/timeLetter.webp"
            alt="Time Letter Archive"
            headline="TIME CAPSULE"
            baseX="15%"
            baseY="65%"
            baseRotate={6}
            config={{ a: 2.1, b: 1.4, A: 18, B: 22, delta: Math.PI / 4 }}
            className="w-24 sm:w-32 md:w-40 lg:w-48"
            onOpenStudio={onOpenStudio}
          />

          {/* Bottom Right: Ticket Stub (Size Reduced further) */}
          <FloatingArtifact 
            src="/assets/memoryTicketStub.webp"
            alt="Memory Ticket Maker"
            headline="TICKET STUB"
            baseX="70%"
            baseY="60%"
            baseRotate={-7}
            config={{ a: 1.7, b: 2.3, A: 12, B: 20, delta: Math.PI / 2 }}
            className="w-12 sm:w-16 md:w-20 lg:w-24"
            onOpenStudio={onOpenStudio}
          />

        </div>
      </div>
    </div>
  );
}
