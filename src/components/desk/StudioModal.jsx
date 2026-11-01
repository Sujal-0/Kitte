import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundFX } from '../../utils/audio';
import { NeuButton } from '../ui/NeuButton';
import { DecayCard } from '../ui/DecayCard';
import { VerticalDeskLines } from './VerticalDeskLines';
import { useIsMobile } from '../../hooks/useIsMobile';

export function StudioModal({ isOpen, onClose, studioInfo, onEnterStudio }) {
  const isMobile = useIsMobile(1024);

  const handleEnter = () => {
    if (!studioInfo) return;
    console.log(`Entering Studio: ${studioInfo.title}`);
    soundFX.playPop();
    onClose();
    if (onEnterStudio) onEnterStudio(studioInfo.title);
  };

  // Keyboard interaction: Enter to enter studio, Escape to close modal
  useEffect(() => {
    if (!isOpen || !studioInfo) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleEnter();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        soundFX.playClick();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, studioInfo, onClose, onEnterStudio]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      soundFX.playSnap();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const leftSideVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { delay: 0.1, duration: 0.3 } },
    exit: { x: -30, opacity: 0, transition: { duration: 0.2 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } },
    exit: { y: 20, opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && studioInfo && (
      <motion.div 
        key="studio-modal-overlay"
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 lg:p-12 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Global Squiggle SVG Filters */}
        <svg className="hidden absolute pointer-events-none w-0 h-0">
          <defs>
            <filter id="squiggle-0">
              <feTurbulence baseFrequency="0.02" numOctaves="3" result="noise" seed="0" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
            </filter>
            <filter id="squiggle-1">
              <feTurbulence baseFrequency="0.02" numOctaves="3" result="noise" seed="2" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
            </filter>
            <filter id="squiggle-2">
              <feTurbulence baseFrequency="0.02" numOctaves="3" result="noise" seed="4" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
            </filter>
          </defs>
        </svg>

        {/* ======================================================== */}
        {/* MOBILE STUDIO MODAL (< 1024px)                           */}
        {/* Single-page, zero-scroll, square preview, no cutoffs     */}
        {/* ======================================================== */}
        {isMobile ? (
          <motion.div 
            className="relative w-full max-w-[94vw] sm:max-w-md bg-[#F4F1EA] border-[4px] border-[#2D2D2D] shadow-[8px_8px_0px_#2D2D2D] flex flex-col justify-between p-3.5 sm:p-5 cursor-auto overflow-hidden select-none"
            initial={{ y: 30, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Header Bar: Title on left, Close button on right (Separated & perfectly spaced) */}
            <div className="flex items-center justify-between border-b-2 border-[#2D2D2D] pb-2 w-full">
              <h2 className="font-marker font-bold text-2xl sm:text-3xl text-[#2D2D2D] uppercase tracking-tight truncate handwritten-text pr-2">
                {studioInfo.title}
              </h2>
              <button 
                type="button"
                className="w-8 h-8 rounded-full bg-[#FFFCE8] border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] flex items-center justify-center font-marker text-xl text-[#2D2D2D] hover:text-red-600 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                  soundFX.playClick();
                }}
                aria-label="Close Studio Modal"
              >
                ✕
              </button>
            </div>

            {/* 2. Square Preview Box (Square area with perfectly fitted asset) */}
            <div className="flex items-center justify-center my-2 w-full">
              <div 
                className="w-36 h-36 sm:w-44 sm:h-44 aspect-square relative overflow-hidden bg-[#2D2D2D] p-2.5 flex items-center justify-center shrink-0"
                style={{
                  border: "3px solid #1A1A1A",
                  borderRadius: "16px",
                  boxShadow: "3px 3px 0px #1A1A1A"
                }}
              >
                <img 
                  src={studioInfo.imageSrc} 
                  alt={studioInfo.title} 
                  className="w-full h-full object-contain filter drop-shadow-md select-none pointer-events-none"
                />
              </div>
            </div>

            {/* 3. Description & Specs (Clean, compact, no clutter) */}
            <div className="w-full text-center space-y-0.5 my-1">
              <p className="font-mono text-[#2D2D2D]/70 text-[10px] sm:text-xs uppercase tracking-wider font-bold">
                ANALOG MEMORY LAB // SPECS
              </p>
              <p className="font-mono text-xs text-[#2D2D2D] line-clamp-2 leading-tight px-1">
                {studioInfo.description}
              </p>
            </div>

            {/* 4. Capabilities (Compact 2x2 Grid) */}
            <div className="w-full bg-[#FFFCE8] border-2 border-[#2D2D2D] p-2 my-1 shadow-[2px_2px_0px_#2D2D2D]">
              <div className="flex items-center justify-between border-b border-[#2D2D2D] pb-0.5 mb-1">
                <span className="font-marker font-bold text-xs uppercase tracking-wide handwritten-text">Capabilities</span>
                <span className="font-mono text-[9px] text-[#2D2D2D]/60 font-bold">300 DPI // LOCAL</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] sm:text-[11px] font-mono text-[#2D2D2D]">
                {studioInfo.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-1 truncate">
                    <span className="text-red-500 font-bold text-xs leading-none">✦</span>
                    <span className="truncate">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Bottom Action: ENTER STUDIO Button (Always 100% visible) */}
            <div className="w-full pt-1.5">
              <NeuButton 
                onClick={handleEnter}
                className="w-full py-2.5 sm:py-3 text-sm sm:text-base flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span className="font-mono font-bold tracking-wider">ENTER STUDIO</span>
                <img 
                  src="/assets/dottedUpArrow.svg" 
                  alt="Arrow" 
                  className="w-5 h-5 object-contain handwritten-text transition-transform duration-300 group-hover:translate-x-2 rotate-90"
                />
              </NeuButton>
            </div>
          </motion.div>
        ) : (
          /* ======================================================== */
          /* DESKTOP STUDIO MODAL (>= 1024px)                         */
          /* 100% Unchanged original 2-column grand desktop layout    */
          /* ======================================================== */
          <motion.div 
            className="relative w-full max-w-6xl h-[90vh] lg:h-[80vh] bg-[#F4F1EA] border-[6px] border-[#2D2D2D] shadow-[16px_16px_0px_#2D2D2D] flex flex-col lg:flex-row cursor-auto"
            initial={{ y: 50, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Hand-drawn Close Button */}
            <button 
              className="absolute top-4 right-4 lg:top-6 lg:right-6 z-10 w-12 h-12 flex items-center justify-center font-marker text-5xl text-[#2D2D2D] hover:scale-110 hover:text-red-600 transition-transform handwritten-text"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                soundFX.playClick();
              }}
            >
              X
            </button>

            {/* LEFT SIDE: Image Asset with Decay Animation */}
            <motion.div 
              variants={leftSideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full lg:w-1/2 h-1/3 lg:h-full p-6 lg:p-8 border-b-[6px] lg:border-b-0 lg:border-r-[6px] border-[#2D2D2D] flex flex-col items-center justify-center bg-[#FBF7F5] overflow-hidden relative"
            >
              
              <VerticalDeskLines />
              
              <h2 className="font-marker font-bold text-4xl lg:text-6xl text-[#2D2D2D] mb-4 uppercase tracking-tight text-center handwritten-text relative z-10">
                {studioInfo.title}
              </h2>
              <div 
                className="w-full h-full max-h-[400px] lg:max-h-[600px] relative overflow-hidden bg-[#2D2D2D] p-6 lg:p-10 flex items-center justify-center z-10"
                style={{
                  border: "4px solid #1A1A1A",
                  borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
                  boxShadow: "4px 4px 0px #1A1A1A"
                }}
              >
                <DecayCard 
                  image={studioInfo.imageSrc} 
                  baseFrequency={0.015}
                  numOctaves={5}
                  maxDisplacement={30}
                  movementBound={10}
                />
              </div>
            </motion.div>

            {/* RIGHT SIDE: Information, Highlighter, Twinkling text, Neo Button */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full lg:w-1/2 h-2/3 lg:h-full p-6 lg:p-12 flex flex-col justify-between bg-deskSurface overflow-hidden"
            >
              
              <motion.div variants={itemVariants} className="flex-1">
                <h3 className="font-marker text-4xl lg:text-5xl text-[#2D2D2D] mb-2 handwritten-text">
                  Analog Memory Lab
                </h3>
                <p className="font-mono text-[#2D2D2D]/80 text-xs mb-6 uppercase tracking-wider font-bold">
                  Production Specs & Features
                </p>
                <div className="space-y-4 font-mono text-sm lg:text-base text-[#2D2D2D]">
                  <p>
                    Welcome to the <span className="bg-transparent bg-[url('/assets/wobbly-highlight.svg')] bg-cover bg-no-repeat bg-center px-3 py-1 mx-1 text-[#2D2D2D] font-bold inline-block handwritten-text relative"><span className="absolute inset-0 bg-[#FFED4A] -z-10 -rotate-2" style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' }}></span>highly interactive</span> {studioInfo.title} studio.
                  </p>
                  <p>
                    {studioInfo.description}
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-6 flex flex-row items-end justify-between gap-4 w-full">
                <div className="flex-1">
                  <h4 className="font-marker font-bold text-xl mb-2 uppercase border-b-2 border-[#2D2D2D] inline-block handwritten-text">Capabilities</h4>
                  <ul className="list-none space-y-2 font-mono text-xs lg:text-sm">
                    {studioInfo.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="font-marker text-lg text-[#FFED4A] stroke-black handwritten-text" style={{ WebkitTextStroke: '1px #2D2D2D' }}>*</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="shrink-0 pb-1">
                  <NeuButton 
                    onClick={handleEnter}
                    className="px-6 py-2 text-base flex items-center gap-3 group"
                  >
                    <span>ENTER STUDIO</span>
                    <img 
                      src="/assets/dottedUpArrow.svg" 
                      alt="Arrow" 
                      className="w-6 h-6 object-contain handwritten-text transition-transform duration-300 group-hover:translate-x-3"
                    />
                  </NeuButton>
                </div>
              </motion.div>

            </motion.div>
          </motion.div>
        )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
