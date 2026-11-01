import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundFX } from '../../utils/audio';
import { NeuButton } from '../ui/NeuButton';
import { DecayCard } from '../ui/DecayCard';
import { VerticalDeskLines } from './VerticalDeskLines';

export function StudioModal({ isOpen, onClose, studioInfo, onEnterStudio }) {
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 lg:p-12 cursor-pointer"
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

          {/* Modal Container: Thick Neo Brutalist - Perfectly sized on Mobile and Desktop */}
          <motion.div 
            className="relative w-full max-w-sm sm:max-w-md lg:max-w-5xl xl:max-w-6xl h-auto max-h-[94dvh] lg:h-[80vh] bg-[#F4F1EA] border-[4px] lg:border-[6px] border-[#2D2D2D] shadow-[8px_8px_0px_#2D2D2D] lg:shadow-[16px_16px_0px_#2D2D2D] flex flex-col lg:flex-row cursor-auto overflow-hidden select-none"
            initial={{ y: 50, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Hand-drawn Close Button - Positioned cleanly with dedicated clearance */}
            <button 
              className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-5 lg:right-5 z-30 w-8 h-8 lg:w-12 lg:h-12 flex items-center justify-center font-marker text-3xl sm:text-4xl lg:text-5xl text-[#2D2D2D] hover:scale-110 hover:text-red-600 transition-transform handwritten-text cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                soundFX.playClick();
              }}
              aria-label="Close Studio Modal"
            >
              X
            </button>

            {/* LEFT SIDE: Image Asset with Decay Animation */}
            <motion.div 
              variants={leftSideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full lg:w-1/2 lg:h-full p-3 sm:p-4 lg:p-6 xl:p-8 border-b-[4px] lg:border-b-0 lg:border-r-[6px] border-[#2D2D2D] flex flex-col items-center justify-center bg-[#FBF7F5] overflow-hidden relative shrink-0 lg:shrink"
            >
              <VerticalDeskLines />
              
              {/* Studio Title: Scaled responsibly on mobile with pr-9 so it never overlaps the X button */}
              <h2 className="font-marker font-bold text-2xl sm:text-3xl lg:text-5xl xl:text-6xl text-[#2D2D2D] mb-1.5 sm:mb-2 lg:mb-4 uppercase tracking-tight text-center handwritten-text relative z-10 pr-9 lg:pr-0 pl-1 lg:pl-0 shrink-0">
                {studioInfo.title}
              </h2>

              {/* Square Preview Area on Mobile, Flex-fit Box on Desktop (Never overflows bottom) */}
              <div 
                className="aspect-square w-28 h-28 sm:w-36 sm:h-36 lg:w-full lg:flex-1 lg:min-h-0 lg:max-h-[420px] xl:max-h-[480px] lg:aspect-auto relative overflow-hidden bg-[#2D2D2D] p-1.5 sm:p-2 lg:p-6 xl:p-8 flex items-center justify-center z-10 shrink-0 lg:shrink"
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
              className="w-full lg:w-1/2 lg:h-full p-3 sm:p-5 lg:p-8 xl:p-10 pr-5 sm:pr-6 lg:pr-10 xl:pr-12 flex flex-col justify-between bg-deskSurface overflow-hidden"
            >
              <motion.div variants={itemVariants} className="flex-1">
                <h3 className="font-marker text-xl sm:text-2xl lg:text-5xl text-[#2D2D2D] mb-0.5 sm:mb-1 lg:mb-2 handwritten-text">
                  Analog Memory Lab
                </h3>
                <p className="font-mono text-[#2D2D2D]/80 text-[9px] sm:text-[10px] lg:text-xs mb-1.5 sm:mb-3 lg:mb-6 uppercase tracking-wider font-bold">
                  Production Specs & Features
                </p>
                <div className="space-y-1 sm:space-y-2 lg:space-y-4 font-mono text-xs sm:text-sm lg:text-base text-[#2D2D2D]">
                  <p className="leading-snug">
                    Welcome to the <span className="bg-transparent bg-[url('/assets/wobbly-highlight.svg')] bg-cover bg-no-repeat bg-center px-1.5 sm:px-2 lg:px-3 py-0.5 lg:py-1 mx-0.5 sm:mx-1 text-[#2D2D2D] font-bold inline-block handwritten-text relative"><span className="absolute inset-0 bg-[#FFED4A] -z-10 -rotate-2" style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' }}></span>highly interactive</span> {studioInfo.title} studio.
                  </p>
                  <p className="leading-snug line-clamp-2 sm:line-clamp-none">
                    {studioInfo.description}
                  </p>
                </div>
              </motion.div>

              {/* Bottom Row: Capabilities & Enter Button - Always completely visible with clean right gap */}
              <motion.div variants={itemVariants} className="mt-2 sm:mt-4 lg:mt-6 flex flex-row items-end justify-between gap-3 sm:gap-4 w-full pr-1 sm:pr-2 lg:pr-3">
                <div className="flex-1">
                  <h4 className="font-marker font-bold text-xs sm:text-base lg:text-xl mb-1 lg:mb-2 uppercase border-b-2 border-[#2D2D2D] inline-block handwritten-text">Capabilities</h4>
                  <ul className="list-none space-y-0.5 sm:space-y-1 lg:space-y-2 font-mono text-[9px] sm:text-xs lg:text-sm">
                    {studioInfo.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-1.5 sm:gap-2 truncate">
                        <span className="font-marker text-xs sm:text-sm lg:text-lg text-[#FFED4A] stroke-black handwritten-text" style={{ WebkitTextStroke: '1px #2D2D2D' }}>*</span>
                        <span className="truncate">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="shrink-0 pb-1 mr-2 sm:mr-3 lg:mr-4">
                  <NeuButton 
                    onClick={handleEnter}
                    className="px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 text-xs sm:text-sm lg:text-base flex items-center gap-1.5 sm:gap-2 lg:gap-3 group cursor-pointer"
                  >
                    <span className="font-mono font-bold tracking-wider">ENTER STUDIO</span>
                    <img 
                      src="/assets/dottedUpArrow.svg" 
                      alt="Arrow" 
                      className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 object-contain handwritten-text transition-transform duration-300 group-hover:translate-x-2"
                    />
                  </NeuButton>
                </div>
              </motion.div>

            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
