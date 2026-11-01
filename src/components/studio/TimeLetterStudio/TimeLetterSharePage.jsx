import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { TimeLetterInteractiveEnvelope } from './TimeLetterInteractiveEnvelope';
import { InteractiveDeskLines } from '../../desk/InteractiveDeskLines';
import { parseLetterShareFromUrl, isLetterLocked } from '../../../features/time-letter/utils/timeLetterShare';
import { DEFAULT_TIME_LETTER_STATE } from '../../../features/time-letter/tokens/timeLetterTokens';
import { soundFX } from '../../../utils/audio';

export function TimeLetterSharePage() {
  const [letterState] = useState(() => {
    const parsed = parseLetterShareFromUrl();
    if (parsed) {
      return { ...DEFAULT_TIME_LETTER_STATE, ...parsed, isOpen: false };
    }
    return { ...DEFAULT_TIME_LETTER_STATE, isOpen: false };
  });

  const [isOpen, setIsOpen] = useState(false);
  const [showLockedToast, setShowLockedToast] = useState(false);

  // Sync open state
  const activeState = { ...letterState, isOpen };
  const isLocked = isLetterLocked(activeState);

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
    if (isLocked) {
      soundFX.playSnap();
      setShowLockedToast(true);
      setTimeout(() => setShowLockedToast(false), 3500);
      return;
    }
    soundFX.playPop();
    setIsOpen(prev => !prev);
  };

  const handleCreateYourOwn = () => {
    soundFX.playPop();
    window.location.href = window.location.origin + window.location.pathname + '?view=studio&studioId=TimeCapsule';
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#F4F1EA] overflow-hidden relative select-none">
      {/* Minimal Recipient Top Bar */}
      <header className="h-14 border-b-2 border-[#1A1A1A] bg-[#FAF7EE] flex items-center justify-between px-6 z-40 shrink-0">
        <div>
          <h1 className="font-marker text-xl tracking-wider text-[#1A1A1A] handwritten-text leading-none">
            KITTE ARCHIVAL TIME LETTER
          </h1>
          <span className="font-mono text-[9px] font-bold text-[#1A1A1A]/70 uppercase tracking-widest block mt-0.5">
            {activeState.letterMode === 'someone-special'
              ? `TO: ${activeState.recipient || 'SOMEONE SPECIAL'} • FROM: ${activeState.author || 'ANONYMOUS'}`
              : `A LETTER FOR YOUR FUTURE SELF • ORIGIN: ${activeState.location || 'KYOTO, JAPAN'}`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCreateYourOwn}
            className="bg-[#1A1A1A] text-[#FFEB3B] font-mono text-xs font-bold uppercase px-4 py-2 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] hover:bg-[#2A2A2A] transition-all cursor-pointer"
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
        className="relative flex-1 bg-[#F4F1EA] overflow-hidden flex items-center justify-center"
      >
        {/* Desk Background & Interactive Lines */}
        <div className="absolute inset-0 z-0 bg-deskSurface">
          <InteractiveDeskLines />
        </div>

        {/* Cutting Mat Container */}
        <div 
          className="relative w-[92%] h-[92%] max-w-[1300px] border-[6px] border-[#1A1A1A] shadow-[12px_12px_0px_rgba(0,0,0,0.5)] bg-[#2a3c24] flex items-center justify-center overflow-hidden z-10"
        >
          {/* Cutting Mat Surface Pattern */}
          <img 
            src="/assets/cutting-mat.svg" 
            alt="Cutting Mat" 
            className="absolute inset-0 w-full h-full object-cover object-left-bottom opacity-80 pointer-events-none" 
          />

          {/* Interactive Envelope with Opening Animation & Sliding Letterhead */}
          <div className="relative z-30">
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
                onStartCustomizing={handleCreateYourOwn}
                onToggleOpen={handleToggle}
              />
            </motion.div>
          </div>

          {/* Top-Right Minimal Handwritten Action Hint */}
          <div 
            onClick={handleToggle}
            className="absolute top-8 right-8 z-40 cursor-pointer flex items-center gap-2 opacity-85 hover:opacity-100 transition-opacity"
          >
            <span className="font-marker text-xl md:text-2xl text-[#F4F1EA] uppercase tracking-wider handwritten-text hover:text-[#FFEB3B]">
              {isLocked 
                ? `SEALED UNTIL ${activeState.deliveryDate}`
                : isOpen 
                  ? 'CLICK TO TUCK IN & SEAL' 
                  : 'CLICK TO UNSEAL & OPEN LETTER'}
            </span>
            <img 
              src="/assets/dottedUpArrow.svg" 
              alt="Action arrow" 
              className={`w-7 h-7 brightness-0 invert transition-transform handwritten-text ${isLocked ? 'rotate-90' : isOpen ? 'rotate-0' : 'rotate-180'}`} 
            />
          </div>

          {/* Locked Toast Notification (if clicked while locked) */}
          <AnimatePresence>
            {showLockedToast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-12 bg-[#B91C1C] text-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#FFFFFF] px-5 py-3 font-mono text-xs font-bold tracking-wide z-50 flex items-center gap-2.5 max-w-lg text-center"
              >
                <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>
                  TIME CAPSULE VAULT LOCKED: This letter is sealed until {activeState.deliveryDate}!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
