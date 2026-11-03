import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { soundFX } from '../../utils/audio';
import { useUrlStateBool } from '../../hooks/useUrlState';
import { triggerBurst } from '../ui/ClickBurstEngine';

export function CrafterNotes({ className = "w-40 md:w-56" }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isOpen, setIsOpen] = useUrlStateBool('notes', false);
  const [page, setPage] = useState(0);

  // Debounce ref for smooth wheel scrolling
  const lastScroll = useRef(0);

  const handleOpen = () => {
    setIsPressed(false);
    setIsOpen(true);
    setPage(0);
    soundFX.playSnap();
  };

  const handleNextPage = (e) => {
    if (e) e.stopPropagation();
    soundFX.playPop();
    if (page < 2) {
      setPage(page + 1);
    } else {
      setPage(0);
    }
  };

  const handlePrevPage = (e) => {
    if (e) e.stopPropagation();
    soundFX.playPop();
    setPage(p => p > 0 ? p - 1 : 2);
  };

  const handleWheel = (e) => {
    const now = Date.now();
    // Trackpads fire wheel events continuously. 1500ms cooldown prevents skipping pages.
    if (now - lastScroll.current < 1500) return; 
    lastScroll.current = now;

    if (e.deltaY > 20) handleNextPage(e);
    else if (e.deltaY < -20) handlePrevPage(e);
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="notes-modal-overlay"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 sm:p-6 cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)} 
        >
          <motion.div 
            className="relative flex items-center justify-center cursor-auto select-none"
            style={{
              width: 'min(90vw, 640px, calc(80vh * 578 / 432))',
              height: 'min(calc(90vw * 432 / 578), calc(640px * 432 / 578), 80vh)',
              aspectRatio: '578 / 432'
            }}
            initial={{ y: 30, scale: 0.95, rotateZ: -1 }}
            animate={{ y: 0, scale: 1, rotateZ: 0 }}
            exit={{ y: 30, scale: 0.95, rotateZ: -1 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()} 
          >
            <img 
              src="/assets/notesAbout_blank.webp" 
              alt="Notes Background"
              className="w-full h-full object-contain drop-shadow-2xl pointer-events-none select-none z-10 block"
            />

            {/* Close Button */}
            <button 
              className="absolute top-[16%] right-[14%] z-30 cursor-pointer font-marker text-2xl sm:text-3xl text-pencil hover:text-markerRed transition-transform hover:scale-110 active:scale-95"
              onClick={(e) => { e.stopPropagation(); soundFX.playPop(); setIsOpen(false); }}
              aria-label="Close Note"
            >
              X
            </button>

            {/* Text Overlay & Interaction Zone */}
            <div 
              className="absolute top-[27%] bottom-[18%] left-[17%] right-[17%] flex flex-col justify-between z-20 font-marker text-pencil cursor-pointer"
              style={{ transform: "rotate(-2.8deg)" }}
              onClick={handleNextPage}
              onWheel={handleWheel}
              onTouchStart={(e) => {
                window.touchStartY = e.touches[0].clientY;
              }}
              onTouchEnd={(e) => {
                if (!window.touchStartY) return;
                const touchEndY = e.changedTouches[0].clientY;
                const delta = window.touchStartY - touchEndY;
                if (delta > 35) handleNextPage(e);
                else if (delta < -35) handlePrevPage(e);
                window.touchStartY = null;
              }}
            >
              <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {page === 0 && (
                    <motion.div 
                      key="page0"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                      className="text-xs sm:text-base md:text-xl lg:text-2xl leading-snug flex flex-col gap-1.5 sm:gap-2.5"
                    >
                      <p>
                        <span className="bg-postitYellow px-1.5 py-0.5 -rotate-1 inline-block">Analog memory methodology.</span>
                      </p>
                      <p>
                        We are a digital fabrication studio obsessed with the physical workspace.
                      </p>
                    </motion.div>
                  )}
                  
                  {page === 1 && (
                    <motion.div 
                      key="page1"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                      className="text-xs sm:text-base md:text-xl lg:text-2xl leading-snug flex flex-col gap-1.5 sm:gap-2.5"
                    >
                      <p>
                        Users design, manipulate, and generate a production-level textile application blending neo-brutalism with manga aesthetics.
                      </p>
                    </motion.div>
                  )}

                  {page === 2 && (
                    <motion.div 
                      key="page2"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                      className="text-xs sm:text-base md:text-xl lg:text-2xl leading-snug flex flex-col gap-1.5 sm:gap-2"
                    >
                      <p>
                        Features five core studios generating tactile items like <span className="text-ballpointBlue">Bounty Posters</span> and <span className="text-ballpointBlue">Travel IDs</span>.
                      </p>
                      <div className="mt-1 pt-1 sm:mt-1.5 sm:pt-1.5 border-t border-pencil/20 text-[9px] sm:text-xs md:text-sm flex flex-col gap-0.5">
                        <p className="opacity-80">Local storage: ACTIVE // Desk UI: SECURE</p>
                        <p className="opacity-80">Est. 2026 // By Sujal Singh</p>
                        <div className="flex items-center gap-2 pt-1 font-marker text-[10px] sm:text-xs md:text-sm uppercase tracking-wide">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              soundFX.playPop();
                              setIsOpen(false);
                              window.dispatchEvent(new CustomEvent('OPEN_LEGAL', { detail: { tab: 'privacy' } }));
                            }}
                            className="underline hover:text-markerRed cursor-pointer transition-colors"
                          >
                            Privacy Policy
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              soundFX.playPop();
                              setIsOpen(false);
                              window.dispatchEvent(new CustomEvent('OPEN_LEGAL', { detail: { tab: 'terms' } }));
                            }}
                            className="underline hover:text-markerRed cursor-pointer transition-colors"
                          >
                            Terms &amp; Conditions
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Micro-interaction indicator */}
              <div className="text-right text-pencil/75 text-[9px] sm:text-xs md:text-sm font-bold tracking-widest pointer-events-none pb-1">
                ( swipe or tap )
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.div
        className={`relative ${className} cursor-pointer select-none`}
        onPointerDown={(e) => {
          setIsPressed(true);
          soundFX.playPop();
          if (e?.clientX && e?.clientY) triggerBurst(e.clientX, e.clientY);
        }}
        onPointerUp={handleOpen}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        style={{ opacity: isOpen ? 0 : 1 }}
        animate={{
          filter: isPressed
            ? "drop-shadow(0px 0px 0px #2D2D2D)"
            : isHovered
            ? "drop-shadow(8px 8px 0px #2D2D2D)"
            : "drop-shadow(4px 4px 0px #2D2D2D)",
          x: isPressed ? 3 : 0,
          y: isPressed ? 3 : 0,
          rotateZ: -2,
          scale: isHovered && !isPressed ? 1.05 : 1
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <img 
          src="/assets/notesAbout.webp" 
          alt="Crafter Notes" 
          className="w-full h-auto pointer-events-none" 
        />
      </motion.div>

      {typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent}
    </>
  );
}
