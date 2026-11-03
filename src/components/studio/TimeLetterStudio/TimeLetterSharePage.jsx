import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { TimeLetterInteractiveEnvelope } from './TimeLetterInteractiveEnvelope';
import { InteractiveDeskLines } from '../../desk/InteractiveDeskLines';
import { parseLetterShareFromUrl } from '../../../features/time-letter/utils/timeLetterShare';
import { DEFAULT_TIME_LETTER_STATE } from '../../../features/time-letter/tokens/timeLetterTokens';
import { soundFX } from '../../../utils/audio';

export function TimeLetterSharePage() {
  const [letterState] = useState(() => {
    const parsed = parseLetterShareFromUrl();
    if (parsed) {
      return { ...DEFAULT_TIME_LETTER_STATE, ...parsed, isWebShare: true, isOpen: true };
    }
    return { ...DEFAULT_TIME_LETTER_STATE, isWebShare: true, isOpen: true };
  });

  const [isOpen, setIsOpen] = useState(true);

  // Sync open state - Web letter share links are 100% open and unrestricted
  const activeState = { ...letterState, isWebShare: true, isOpen };

  const sectionRef = useRef(null);

  // Tilt tracking on mouse move
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-300, 300], [8, -8]);
  const rotateYBase = useTransform(x, [-300, 300], [-8, 8]);

  // Zoom State with Spring
  const zoomTarget = useMotionValue(1.0);
  const zoom = useSpring(zoomTarget, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const handleNativeWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY;
      const currentZoom = zoomTarget.get();
      let newZoom = currentZoom - (delta > 0 ? 0.05 : -0.05);
      if (e.ctrlKey) {
        newZoom = currentZoom - (delta * 0.01);
      }
      zoomTarget.set(Math.min(Math.max(0.65, newZoom), 2.0));
    };

    const section = sectionRef.current;
    if (section) {
      section.addEventListener('wheel', handleNativeWheel, { passive: false });
    }
    return () => {
      if (section) section.removeEventListener('wheel', handleNativeWheel);
    };
  }, [zoomTarget]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleToggle = () => {
    soundFX.playPop();
    setIsOpen(prev => !prev);
  };

  const handleCreateYourOwn = () => {
    soundFX.playPop();
    window.location.href = window.location.origin + window.location.pathname + '?view=studio&studioId=TimeCapsule';
  };

  return (
    <div className="w-screen h-[100dvh] flex flex-col bg-[#F4F1EA] overflow-hidden relative select-none">
      {/* Minimal Recipient Top Bar */}
      <header className="min-h-12 sm:h-14 py-2 border-b-2 border-[#1A1A1A] bg-[#FAF7EE] flex items-center justify-between px-3 sm:px-6 z-40 shrink-0 gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="font-marker text-sm sm:text-xl tracking-wider text-[#1A1A1A] handwritten-text leading-tight truncate">
            KITTE ARCHIVAL TIME LETTER
          </h1>
          <span className="font-mono text-[8px] sm:text-[9px] font-bold text-[#1A1A1A]/70 uppercase tracking-widest block mt-0.5 truncate">
            {activeState.letterMode === 'someone-special'
              ? `TO: ${activeState.recipient || 'SOMEONE SPECIAL'} • FROM: ${activeState.author || 'ANONYMOUS'}`
              : `A LETTER FOR YOUR FUTURE SELF • ORIGIN: ${activeState.location || 'KYOTO, JAPAN'}`}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCreateYourOwn}
            className="bg-[#1A1A1A] text-[#FFEB3B] font-mono text-[10px] sm:text-xs font-bold uppercase px-2.5 sm:px-4 py-1.5 sm:py-2 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] hover:bg-[#2A2A2A] transition-all cursor-pointer whitespace-nowrap"
          >
            Make Your Own ↗
          </button>
        </div>
      </header>

      {/* Main Recipient Canvas with Cutting Mat & Interactive Lines */}
      <main 
        ref={sectionRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex-1 bg-[#F4F1EA] overflow-hidden flex items-center justify-center p-2 sm:p-4"
      >
        {/* Desk Background & Interactive Lines */}
        <div className="absolute inset-0 z-0 bg-deskSurface">
          <InteractiveDeskLines />
        </div>

        {/* Cutting Mat Container */}
        <div 
          className="relative w-full h-full max-w-[1300px] border-[3px] sm:border-[6px] border-[#1A1A1A] shadow-[4px_4px_0px_rgba(0,0,0,0.5)] sm:shadow-[12px_12px_0px_rgba(0,0,0,0.5)] bg-[#2a3c24] flex items-center justify-center overflow-hidden z-10"
        >
          {/* Cutting Mat Surface Pattern */}
          <img 
            src="/assets/cutting-mat.svg" 
            alt="Cutting Mat" 
            className="absolute inset-0 w-full h-full object-cover object-left-bottom opacity-80 pointer-events-none" 
          />

          {/* Interactive Envelope with Opening Animation & Sliding Letterhead */}
          <div className="relative z-30 scale-[0.48] xs:scale-[0.56] sm:scale-[0.76] md:scale-90 lg:scale-100 origin-center transition-transform touch-manipulation">
            <motion.div
              style={{ 
                rotateX, 
                rotateY: rotateYBase, 
                scale: zoom 
              }}
            >
              <TimeLetterInteractiveEnvelope 
                state={activeState} 
                isShowcase={false} 
                isWebShare={true}
                onStartCustomizing={handleCreateYourOwn}
                onToggleOpen={handleToggle}
              />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
