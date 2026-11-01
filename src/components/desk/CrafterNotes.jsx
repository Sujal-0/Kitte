import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundFX } from '../../utils/audio';
import { useUrlStateBool } from '../../hooks/useUrlState';

export function CrafterNotes() {
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

  return (
    <>
      <motion.div
        className="relative w-40 md:w-56 cursor-pointer select-none"
        onPointerDown={() => {
          setIsPressed(true);
          soundFX.playPop();
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

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            key="notes-modal-overlay"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 lg:p-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)} 
          >
            <motion.div 
              // Locked width, auto height so image dictates aspect ratio perfectly
              className="relative w-full max-w-[650px] inline-block"
              initial={{ y: 50, scale: 0.95, rotateZ: -1 }}
              animate={{ y: 0, scale: 1, rotateZ: 0 }}
              exit={{ y: 50, scale: 0.95, rotateZ: -1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()} 
            >
              <img 
                src="/assets/notesAbout_blank.webp" 
                alt="Notes Background"
                className="w-full h-auto drop-shadow-2xl pointer-events-none select-none z-10 block"
              />

              {/* VISIBLE CLOSE BUTTON - Moved much further inside to stay on the paper */}
              <button 
                className="absolute top-[18%] right-[15%] z-30 cursor-pointer font-marker text-4xl text-pencil hover:text-markerRed transition-transform hover:scale-110 active:scale-95"
                onClick={(e) => { e.stopPropagation(); soundFX.playPop(); setIsOpen(false); }}
                aria-label="Close Note"
              >
                X
              </button>

              {/* 
                TEXT OVERLAY & INTERACTION ZONE
                Increased left padding to 18% to align exactly with the ruled lines.
                Increased right/bottom padding to ensure text stays completely inside the torn edges.
              */}
              <div 
                className="absolute top-[28%] bottom-[20%] left-[18%] right-[18%] flex flex-col z-20 font-marker text-pencil cursor-pointer"
                style={{ transform: "rotate(-3deg)" }}
                onClick={handleNextPage}
                onWheel={handleWheel}
                onTouchStart={(e) => {
                  window.touchStartY = e.touches[0].clientY;
                }}
                onTouchEnd={(e) => {
                  if (!window.touchStartY) return;
                  const touchEndY = e.changedTouches[0].clientY;
                  const delta = window.touchStartY - touchEndY;
                  if (delta > 40) handleNextPage(e); // swipe up
                  else if (delta < -40) handlePrevPage(e); // swipe down
                  window.touchStartY = null;
                }}
              >
                
                <div className="flex-1 w-full h-full relative">
                  <AnimatePresence mode="wait">
                    {page === 0 && (
                      <motion.div 
                        key="page0"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-lg sm:text-xl md:text-2xl lg:text-3xl leading-snug flex flex-col gap-3"
                      >
                        <p>
                          <span className="bg-postitYellow px-2 -rotate-1 inline-block">Analog memory methodology.</span>
                        </p>
                        <p>
                          We are a digital fabrication studio obsessed with the physical workspace.
                        </p>
                      </motion.div>
                    )}
                    
                    {page === 1 && (
                      <motion.div 
                        key="page1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-lg sm:text-xl md:text-2xl lg:text-3xl leading-snug flex flex-col gap-3"
                      >
                        <p>
                          Users design, manipulate, and generate a production-level textile application blending neo-brutalism with manga aesthetics.
                        </p>
                      </motion.div>
                    )}

                    {page === 2 && (
                      <motion.div 
                        key="page2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-lg sm:text-xl md:text-2xl lg:text-3xl leading-snug flex flex-col gap-3"
                      >
                        <p>
                          Features five core studios generating tactile items like <span className="text-ballpointBlue">Bounty Posters</span> and <span className="text-ballpointBlue">Travel IDs</span>.
                        </p>
                        <div className="mt-3 pt-3 border-t-2 border-pencil/20 opacity-80 text-base md:text-lg">
                          <p>Local storage: ACTIVE // Desk UI: SECURE</p>
                          <p>Est. 2026 // By Sujal Singh</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Micro-interaction indicator - Moved safely inside the container */}
                <div className="absolute -bottom-[10%] right-[5%] animate-pulse text-pencil/50 text-xs sm:text-sm md:text-base font-bold tracking-widest pointer-events-none" style={{ transform: "rotate(-1deg)" }}>
                  ( swipe or tap )
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
