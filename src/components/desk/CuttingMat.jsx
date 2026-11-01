import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingArtifact } from './FloatingArtifact';
import { WashiTape } from './WashiTape';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSessionState } from '../../hooks/useSessionState';
import { soundFX } from '../../utils/audio';
import { triggerBurst } from '../ui/ClickBurstEngine';

const STUDIOS = [
  {
    id: 'bounty',
    title: 'BOUNTY POSTER',
    src: '/assets/bountyPoster.webp',
    alt: 'Bounty Poster Generator',
    description: 'An interactive studio to generate physical-grade analog memory artifacts.',
    features: [
      'High DPI (300) Output',
      'Zero Telemetry & Local Processing',
      'Custom Image Filtering Pipeline',
      'CMYK / PDF Print Support'
    ],
    // Desktop coordinates
    desktop: {
      baseX: '35%',
      baseY: '35%',
      baseRotate: -2,
      config: { a: 0.8, b: 1.1, A: 10, B: 10, delta: Math.PI },
      className: 'w-20 sm:w-28 md:w-32 lg:w-40'
    },
    // Mobile All-in-one coordinates
    allInOne: {
      style: { top: '38%', left: '50%', transform: 'translate(-50%, -50%)' },
      baseRotate: -2,
      config: { a: 0.8, b: 1.1, A: 6, B: 8, delta: Math.PI },
      className: 'w-20 sm:w-24'
    }
  },
  {
    id: 'travel',
    title: 'TRAVEL ID',
    src: '/assets/travelID.webp',
    alt: 'Travel ID Generator',
    description: 'An interactive studio to generate physical-grade analog memory artifacts.',
    features: [
      'High DPI (300) Output',
      'Zero Telemetry & Local Processing',
      'Custom Image Filtering Pipeline',
      'CMYK / PDF Print Support'
    ],
    desktop: {
      baseX: '10%',
      baseY: '15%',
      baseRotate: -5,
      config: { a: 1.2, b: 2.1, A: 15, B: 25, delta: 0 },
      className: 'w-24 sm:w-32 md:w-40 lg:w-48'
    },
    allInOne: {
      style: { top: '10%', left: '8%' },
      baseRotate: -5,
      config: { a: 1.2, b: 1.8, A: 8, B: 12, delta: 0 },
      className: 'w-24 sm:w-28'
    }
  },
  {
    id: 'photo',
    title: 'PHOTO BOOTH',
    src: '/assets/photoBooth.webp',
    alt: 'Photo Booth Studio',
    description: 'An interactive studio to generate physical-grade analog memory artifacts.',
    features: [
      'High DPI (300) Output',
      'Zero Telemetry & Local Processing',
      'Custom Image Filtering Pipeline',
      'CMYK / PDF Print Support'
    ],
    desktop: {
      baseX: '65%',
      baseY: '10%',
      baseRotate: 4,
      config: { a: 1.5, b: 1.8, A: 20, B: 15, delta: Math.PI / 3 },
      className: 'w-24 sm:w-32 md:w-44 lg:w-52'
    },
    allInOne: {
      style: { top: '8%', right: '8%' },
      baseRotate: 4,
      config: { a: 1.4, b: 1.6, A: 10, B: 8, delta: Math.PI / 3 },
      className: 'w-24 sm:w-28'
    }
  },
  {
    id: 'time',
    title: 'TIME CAPSULE',
    src: '/assets/timeLetter.webp',
    alt: 'Time Letter Archive',
    description: 'An interactive studio to generate physical-grade analog memory artifacts.',
    features: [
      'High DPI (300) Output',
      'Zero Telemetry & Local Processing',
      'Custom Image Filtering Pipeline',
      'CMYK / PDF Print Support'
    ],
    desktop: {
      baseX: '15%',
      baseY: '65%',
      baseRotate: 6,
      config: { a: 2.1, b: 1.4, A: 18, B: 22, delta: Math.PI / 4 },
      className: 'w-24 sm:w-32 md:w-40 lg:w-48'
    },
    allInOne: {
      style: { bottom: '12%', left: '8%' },
      baseRotate: 6,
      config: { a: 1.8, b: 1.3, A: 8, B: 10, delta: Math.PI / 4 },
      className: 'w-24 sm:w-28'
    }
  },
  {
    id: 'ticket',
    title: 'TICKET STUB',
    src: '/assets/memoryTicketStub.webp',
    alt: 'Memory Ticket Maker',
    description: 'An interactive studio to generate physical-grade analog memory artifacts.',
    features: [
      'High DPI (300) Output',
      'Zero Telemetry & Local Processing',
      'Custom Image Filtering Pipeline',
      'CMYK / PDF Print Support'
    ],
    desktop: {
      baseX: '70%',
      baseY: '60%',
      baseRotate: -7,
      config: { a: 1.7, b: 2.3, A: 12, B: 20, delta: Math.PI / 2 },
      className: 'w-12 sm:w-16 md:w-20 lg:w-24'
    },
    allInOne: {
      style: { bottom: '14%', right: '10%' },
      baseRotate: -7,
      config: { a: 1.5, b: 2.0, A: 7, B: 9, delta: Math.PI / 2 },
      className: 'w-16 sm:w-20'
    }
  }
];

export function CuttingMat({ onOpenStudio }) {
  const isMobile = useIsMobile(1024);
  const [mobileMode, setMobileMode] = useSessionState('kitteMobileDeskMode', 'swipe');
  const [currentIndex, setCurrentIndex] = useState(0);
  const isDraggingRef = useRef(false);

  const prevIndex = (currentIndex - 1 + STUDIOS.length) % STUDIOS.length;
  const nextIndex = (currentIndex + 1) % STUDIOS.length;

  const handlePrev = (e) => {
    if (e?.stopPropagation) e.stopPropagation();
    soundFX.playPop();
    if (e?.clientX && e?.clientY) {
      triggerBurst(e.clientX, e.clientY);
    } else {
      triggerBurst(window.innerWidth * 0.3, window.innerHeight * 0.45);
    }
    setCurrentIndex(prevIndex);
  };

  const handleNext = (e) => {
    if (e?.stopPropagation) e.stopPropagation();
    soundFX.playPop();
    if (e?.clientX && e?.clientY) {
      triggerBurst(e.clientX, e.clientY);
    } else {
      triggerBurst(window.innerWidth * 0.7, window.innerHeight * 0.45);
    }
    setCurrentIndex(nextIndex);
  };

  const handleOpenStudio = (studio, e) => {
    if (isDraggingRef.current) return;
    if (e?.stopPropagation) e.stopPropagation();
    soundFX.playSnap();
    if (e?.clientX && e?.clientY) {
      triggerBurst(e.clientX, e.clientY);
    }
    if (onOpenStudio) {
      onOpenStudio({
        title: studio.title,
        imageSrc: studio.src,
        description: studio.description,
        features: studio.features
      });
    }
  };

  const handleToggleMode = (mode, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    soundFX.playPop();
    if (e?.clientX && e?.clientY) triggerBurst(e.clientX, e.clientY);
    setMobileMode(mode);
  };

  // ==========================================
  // DESKTOP LAYOUT (Screen >= 1024px)
  // Preserves 100% of original desktop experience
  // ==========================================
  if (!isMobile) {
    return (
      <div className="relative w-full h-full flex items-center justify-center pointer-events-none p-4 md:p-8 lg:p-12 overflow-hidden">
        {/* The Cutting Mat SVG Base */}
        <div className="relative w-full h-full max-w-6xl scale-100 md:scale-110">
          <img 
            src="/assets/cutting-mat.svg" 
            alt="Cutting Mat Base" 
            className="w-full h-full object-contain drop-shadow-[4px_4px_0px_rgba(45,45,45,0.8)]"
            style={{ transform: "rotate(-1deg)" }} 
          />
          
          {/* Container for Artifacts */}
          <div className="absolute inset-0 z-10 pointer-events-auto">
            {/* Joy Boy - Static */}
            <div className="absolute top-[8%] left-[45%] w-10 sm:w-14 md:w-16 lg:w-20 -rotate-3 z-0 pointer-events-none drop-shadow-sm select-none">
              <img src="/assets/joyBoy.webp" alt="Joy Boy Archive" className="w-full h-auto" />
              <WashiTape className="absolute -top-2 left-1/2 -translate-x-1/2 rotate-2 w-6 md:w-8 h-3 md:h-4" />
            </div>

            {/* Time - Static */}
            <div className="absolute top-[58%] left-[18%] w-10 sm:w-14 md:w-16 lg:w-20 rotate-6 z-0 pointer-events-none drop-shadow-sm select-none">
              <img src="/assets/time.webp" alt="Time Archive" className="w-full h-auto" />
              <WashiTape className="absolute -top-1 left-1/2 -translate-x-1/2 -rotate-3 w-6 md:w-8 h-3 md:h-4" />
            </div>

            {/* FLOATING ARTIFACTS */}
            {STUDIOS.map((s) => (
              <FloatingArtifact 
                key={s.id}
                src={s.src}
                alt={s.alt}
                headline={s.title}
                baseX={s.desktop.baseX}
                baseY={s.desktop.baseY}
                baseRotate={s.desktop.baseRotate}
                config={s.desktop.config}
                className={s.desktop.className}
                onOpenStudio={onOpenStudio}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MOBILE RESPONSIVE LAYOUT (Screen < 1024px)
  // Dual Mode: Swipe Deck vs All-in-One Overview
  // ==========================================
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between pointer-events-none px-3 py-2 overflow-hidden">
      
      {/* Top Controls: Tactile Dual-Mode Switcher Pill */}
      <div className="relative z-40 pointer-events-auto flex items-center justify-center my-1 select-none">
        <div className="flex items-center gap-1 bg-[#F4F1EA] border-2 border-[#2D2D2D] p-1 shadow-[2px_2px_0px_#2D2D2D] rounded-sm">
          <button
            type="button"
            onClick={(e) => handleToggleMode('swipe', e)}
            className={`px-3 py-1 font-marker text-xs uppercase tracking-wider transition-all relative ${
              mobileMode === 'swipe' ? 'text-[#FBF7F5]' : 'text-[#2D2D2D] opacity-75'
            }`}
          >
            {mobileMode === 'swipe' && (
              <motion.div 
                layoutId="matModePill"
                className="absolute inset-0 bg-[#2D2D2D] -z-10 rounded-[2px]"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            ✦ SWIPE DECK
          </button>
          
          <button
            type="button"
            onClick={(e) => handleToggleMode('all-in-one', e)}
            className={`px-3 py-1 font-marker text-xs uppercase tracking-wider transition-all relative ${
              mobileMode === 'all-in-one' ? 'text-[#FBF7F5]' : 'text-[#2D2D2D] opacity-75'
            }`}
          >
            {mobileMode === 'all-in-one' && (
              <motion.div 
                layoutId="matModePill"
                className="absolute inset-0 bg-[#2D2D2D] -z-10 rounded-[2px]"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            ☷ ALL-IN-ONE
          </button>
        </div>
      </div>

      {/* The Cutting Mat Container */}
      <div className="relative w-full flex-1 max-w-sm sm:max-w-md my-1 flex items-center justify-center overflow-hidden">
        
        {/* Cutting Mat Realistic Graphic */}
        <img 
          src="/assets/cutting-mat.svg" 
          alt="Cutting Mat Base" 
          className="w-full h-full object-contain drop-shadow-[5px_5px_0px_#2D2D2D] pointer-events-none select-none"
          style={{ transform: "rotate(-0.8deg)" }} 
        />

        {/* Mat Content Layer */}
        <div className="absolute inset-0 z-20 pointer-events-auto flex items-center justify-center overflow-hidden">
          
          {/* Static Pinned Stickers (Background layer on mat) */}
          <div className="absolute top-[8%] right-[10%] w-12 sm:w-14 rotate-6 z-0 pointer-events-none drop-shadow-sm select-none opacity-85">
            <img src="/assets/joyBoy.webp" alt="Joy Boy" className="w-full h-auto" />
            <WashiTape className="absolute -top-1.5 left-1/2 -translate-x-1/2 -rotate-2 w-7 h-3" />
          </div>

          <div className="absolute bottom-[16%] left-[6%] w-10 sm:w-12 -rotate-6 z-0 pointer-events-none drop-shadow-sm select-none opacity-70">
            <img src="/assets/time.webp" alt="Time Archive" className="w-full h-auto" />
            <WashiTape className="absolute -top-1 left-1/2 -translate-x-1/2 rotate-3 w-6 h-2.5" />
          </div>

          {/* ==================================== */}
          {/* OPTION 1: SWIPE DECK MODE (Default) */}
          {/* ==================================== */}
          {mobileMode === 'swipe' && (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              
              {/* Left Arrow Button (dottedUpArrow.svg rotated -90deg) */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Studio"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-40 p-1 flex flex-col items-center justify-center group active:scale-90 transition-transform cursor-pointer"
              >
                <img 
                  src="/assets/dottedUpArrow.svg" 
                  alt="Previous" 
                  className="w-8 h-8 sm:w-10 sm:h-10 -rotate-90 filter drop-shadow-[2px_2px_0px_#2D2D2D] select-none pointer-events-none" 
                />
                <span className="font-marker text-[9px] text-[#E6E4D9] uppercase tracking-wider handwritten-text opacity-90 -mt-1 select-none">
                  prev
                </span>
              </button>

              {/* Right Arrow Button (dottedUpArrow.svg rotated 90deg) */}
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Studio"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-40 p-1 flex flex-col items-center justify-center group active:scale-90 transition-transform cursor-pointer"
              >
                <img 
                  src="/assets/dottedUpArrow.svg" 
                  alt="Next" 
                  className="w-8 h-8 sm:w-10 sm:h-10 rotate-90 filter drop-shadow-[2px_2px_0px_#2D2D2D] select-none pointer-events-none" 
                />
                <span className="font-marker text-[9px] text-[#E6E4D9] uppercase tracking-wider handwritten-text opacity-90 -mt-1 select-none">
                  next
                </span>
              </button>

              {/* Left Peeking Card (Clickable to move prev) */}
              <motion.div
                key={`peek-left-${prevIndex}`}
                initial={{ opacity: 0, x: -60, scale: 0.7 }}
                animate={{ opacity: 0.65, x: 0, scale: 0.8 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                onClick={handlePrev}
                className="absolute left-[-8%] sm:left-[-4%] top-1/2 -translate-y-1/2 z-10 w-28 sm:w-36 -rotate-12 cursor-pointer filter drop-shadow-[3px_3px_0px_#2D2D2D] select-none"
              >
                <img 
                  src={STUDIOS[prevIndex].src} 
                  alt={STUDIOS[prevIndex].title} 
                  className="w-full h-auto pointer-events-none" 
                />
              </motion.div>

              {/* Center Hero Card (Swipeable / Clickable) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={STUDIOS[currentIndex].id}
                  initial={{ opacity: 0, scale: 0.88, y: 15 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: [0, -6, 0, 6, 0],
                    rotateZ: [0, 1.2, 0, -1.2, 0]
                  }}
                  exit={{ opacity: 0, scale: 0.88, y: -15 }}
                  transition={{ 
                    y: { repeat: Infinity, duration: 4.8, ease: "easeInOut" },
                    rotateZ: { repeat: Infinity, duration: 4.8, ease: "easeInOut" },
                    default: { type: "spring", stiffness: 380, damping: 26 }
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.25}
                  onDragStart={() => {
                    isDraggingRef.current = true;
                  }}
                  onDragEnd={(e, { offset, velocity }) => {
                    setTimeout(() => {
                      isDraggingRef.current = false;
                    }, 50);

                    const swipe = offset.x;
                    if (swipe < -40 || velocity.x < -300) {
                      handleNext(e);
                    } else if (swipe > 40 || velocity.x > 300) {
                      handlePrev(e);
                    }
                  }}
                  onClick={(e) => handleOpenStudio(STUDIOS[currentIndex], e)}
                  whileTap={{ scale: 0.96 }}
                  className="relative z-30 w-36 sm:w-44 max-w-[55%] cursor-pointer filter drop-shadow-[6px_6px_0px_#2D2D2D] select-none"
                >
                  <img 
                    src={STUDIOS[currentIndex].src} 
                    alt={STUDIOS[currentIndex].title} 
                    className="w-full h-auto pointer-events-none" 
                  />
                  
                  {/* Subtle headline label badge */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#2D2D2D] text-[#FBF7F5] px-2 py-0.5 rounded-[2px] shadow-[2px_2px_0px_#1A1A1A] pointer-events-none">
                    <span className="font-marker text-[10px] sm:text-xs tracking-wider uppercase whitespace-nowrap handwritten-text">
                      {STUDIOS[currentIndex].title}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Right Peeking Card (Clickable to move next) */}
              <motion.div
                key={`peek-right-${nextIndex}`}
                initial={{ opacity: 0, x: 60, scale: 0.7 }}
                animate={{ opacity: 0.65, x: 0, scale: 0.8 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                onClick={handleNext}
                className="absolute right-[-8%] sm:right-[-4%] top-1/2 -translate-y-1/2 z-10 w-28 sm:w-36 rotate-12 cursor-pointer filter drop-shadow-[3px_3px_0px_#2D2D2D] select-none"
              >
                <img 
                  src={STUDIOS[nextIndex].src} 
                  alt={STUDIOS[nextIndex].title} 
                  className="w-full h-auto pointer-events-none" 
                />
              </motion.div>

              {/* Bottom Deck Indicator */}
              <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-0.5 pointer-events-none select-none">
                <div className="flex items-center gap-2">
                  {STUDIOS.map((s, idx) => (
                    <span
                      key={s.id}
                      className={`transition-all duration-300 font-marker ${
                        idx === currentIndex 
                          ? 'text-[#F9F7F1] text-sm scale-125' 
                          : 'text-[#F9F7F1]/40 text-xs'
                      }`}
                    >
                      {idx === currentIndex ? '✦' : '•'}
                    </span>
                  ))}
                </div>
                <span className="font-marker text-[10px] tracking-widest text-[#E6E4D9]/90 uppercase handwritten-text">
                  ••• swipe deck ({currentIndex + 1}/{STUDIOS.length}) •••
                </span>
              </div>

            </div>
          )}

          {/* ========================================= */}
          {/* OPTION 2: ALL-IN-ONE VIEW (Five in One)   */}
          {/* ========================================= */}
          {mobileMode === 'all-in-one' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative w-full h-full pointer-events-auto"
            >
              {STUDIOS.map((s) => (
                <FloatingArtifact
                  key={s.id}
                  src={s.src}
                  alt={s.alt}
                  headline={s.title}
                  baseX={s.allInOne.style.left || 'auto'}
                  baseY={s.allInOne.style.top || 'auto'}
                  baseRotate={s.allInOne.baseRotate}
                  config={s.allInOne.config}
                  className={s.allInOne.className}
                  style={s.allInOne.style}
                  onOpenStudio={onOpenStudio}
                />
              ))}

              {/* Bottom All-In-One Indicator */}
              <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none">
                <span className="font-marker text-[10px] tracking-widest text-[#E6E4D9]/90 uppercase handwritten-text">
                  ••• all-in-one studio overview •••
                </span>
              </div>
            </motion.div>
          )}

        </div>
      </div>

    </div>
  );
}
