import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingArtifact } from './FloatingArtifact';
import { WashiTape } from './WashiTape';
import { useIsMobile } from '../../hooks/useIsMobile';
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
    desktop: {
      baseX: '35%',
      baseY: '35%',
      baseRotate: -2,
      config: { a: 0.8, b: 1.1, A: 10, B: 10, delta: Math.PI },
      className: 'w-20 sm:w-28 md:w-32 lg:w-40'
    },
    allInOne: {
      style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
      baseRotate: -2,
      config: { a: 0.8, b: 1.1, A: 4, B: 4, delta: Math.PI },
      className: 'w-18 sm:w-22'
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
      style: { top: '14%', left: '10%' },
      baseRotate: -4,
      config: { a: 1.1, b: 1.5, A: 4, B: 4, delta: 0 },
      className: 'w-20 sm:w-24'
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
      style: { top: '14%', right: '10%' },
      baseRotate: 3,
      config: { a: 1.2, b: 1.4, A: 4, B: 4, delta: Math.PI / 3 },
      className: 'w-20 sm:w-24'
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
      style: { bottom: '18%', left: '12%' },
      baseRotate: 4,
      config: { a: 1.4, b: 1.1, A: 4, B: 4, delta: Math.PI / 4 },
      className: 'w-20 sm:w-24'
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
      style: { bottom: '18%', right: '12%' },
      baseRotate: -5,
      config: { a: 1.3, b: 1.6, A: 3, B: 4, delta: Math.PI / 2 },
      className: 'w-14 sm:w-16'
    }
  }
];

export function CuttingMat({ onOpenStudio, mobileMode = 'swipe' }) {
  const isMobile = useIsMobile(1024);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const isDraggingRef = useRef(false);

  const prevIndex = (currentIndex - 1 + STUDIOS.length) % STUDIOS.length;
  const nextIndex = (currentIndex + 1) % STUDIOS.length;

  const handlePrev = (e) => {
    if (e?.stopPropagation) e.stopPropagation();
    soundFX.playPop();
    if (e?.clientX) {
      triggerBurst(e.clientX, e.clientY);
    } else {
      triggerBurst(window.innerWidth * 0.25, window.innerHeight * 0.45);
    }
    setDirection(-1);
    setCurrentIndex(prevIndex);
  };

  const handleNext = (e) => {
    if (e?.stopPropagation) e.stopPropagation();
    soundFX.playPop();
    if (e?.clientX) {
      triggerBurst(e.clientX, e.clientY);
    } else {
      triggerBurst(window.innerWidth * 0.75, window.innerHeight * 0.45);
    }
    setDirection(1);
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

  // ==========================================
  // DESKTOP LAYOUT (Screen >= 1024px)
  // Preserves 100% of original desktop experience
  // ==========================================
  if (!isMobile) {
    return (
      <div className="relative w-full h-full flex items-center justify-center pointer-events-none p-4 md:p-8 lg:p-12 overflow-hidden">
        <div className="relative w-full h-full max-w-6xl scale-100 md:scale-110">
          <img 
            src="/assets/cutting-mat.svg" 
            alt="Cutting Mat Base" 
            className="w-full h-full object-contain drop-shadow-[4px_4px_0px_rgba(45,45,45,0.8)]"
            style={{ transform: "rotate(-1deg)" }} 
          />
          
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
  // Maximized cutting mat workspace
  // ==========================================
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none p-1 overflow-hidden">
      
      {/* The Cutting Mat SVG Base - Scaled up to fill space without overflow */}
      <div className="relative w-full h-full max-w-[94vw] max-h-[58vh] aspect-[1.38/1] flex items-center justify-center">
        
        {/* Cutting Mat Vector Base with Neo-Brutalist Shadow */}
        <img 
          src="/assets/cutting-mat.svg" 
          alt="Cutting Mat Base" 
          className="w-full h-full object-contain drop-shadow-[5px_5px_0px_#2D2D2D] pointer-events-none select-none"
          style={{ transform: "rotate(-0.8deg)" }} 
        />

        {/* Bounded Inner Layer (Everything stays strictly inside the green mat) */}
        <div className="absolute inset-[4%] z-20 pointer-events-auto flex items-center justify-center overflow-hidden">
          
          {/* Static Pinned Stickers (Kept safely inside green mat bounds) */}
          <div className="absolute top-[12%] right-[16%] w-10 sm:w-12 rotate-3 z-0 pointer-events-none drop-shadow-sm select-none opacity-85">
            <img src="/assets/joyBoy.webp" alt="Joy Boy" className="w-full h-auto" />
            <WashiTape className="absolute -top-1.5 left-1/2 -translate-x-1/2 -rotate-2 w-6 h-2.5" />
          </div>

          <div className="absolute bottom-[16%] left-[16%] w-9 sm:w-11 -rotate-3 z-0 pointer-events-none drop-shadow-sm select-none opacity-75">
            <img src="/assets/time.webp" alt="Time Archive" className="w-full h-auto" />
            <WashiTape className="absolute -top-1 left-1/2 -translate-x-1/2 rotate-3 w-5 h-2" />
          </div>

          {/* ==================================== */}
          {/* OPTION 1: SWIPE DECK MODE (Default) */}
          {/* ==================================== */}
          {mobileMode === 'swipe' && (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              
              {/* Left Arrow Button: Facing Left to Right (→) */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Studio"
                className="absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFFCE8] border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] flex items-center justify-center group active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer pointer-events-auto"
              >
                <img 
                  src="/assets/dottedUpArrow.svg" 
                  alt="Previous" 
                  className="w-5 h-5 rotate-0 select-none pointer-events-none transition-transform group-hover:scale-110" 
                />
              </button>

              {/* Right Arrow Button: Facing Right to Left (←) */}
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Studio"
                className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFFCE8] border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] flex items-center justify-center group active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer pointer-events-auto"
              >
                <img 
                  src="/assets/dottedUpArrow.svg" 
                  alt="Next" 
                  className="w-5 h-5 rotate-180 select-none pointer-events-none transition-transform group-hover:scale-110" 
                />
              </button>

              {/* Left Peeking Card (Clickable) */}
              <div
                onClick={handlePrev}
                className="absolute left-[-4%] sm:left-[-1%] top-1/2 -translate-y-1/2 z-10 w-24 sm:w-32 -rotate-12 cursor-pointer filter drop-shadow-[3px_3px_0px_#2D2D2D] select-none opacity-55 hover:opacity-80 transition-opacity"
              >
                <img 
                  src={STUDIOS[prevIndex].src} 
                  alt={STUDIOS[prevIndex].title} 
                  className="w-full h-auto pointer-events-none" 
                />
              </div>

              {/* Center Hero Card (Swipeable, Directional Springs) */}
              <div className="relative z-30 flex items-center justify-center w-full h-full pointer-events-auto">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  <motion.div
                    key={STUDIOS[currentIndex].id}
                    custom={direction}
                    variants={{
                      enter: (dir) => ({
                        x: dir > 0 ? 80 : dir < 0 ? -80 : 0,
                        opacity: 0,
                        scale: 0.88
                      }),
                      center: {
                        x: 0,
                        opacity: 1,
                        scale: 1,
                        transition: {
                          x: { type: "spring", stiffness: 360, damping: 26 },
                          opacity: { duration: 0.22 },
                          scale: { duration: 0.22 }
                        }
                      },
                      exit: (dir) => ({
                        x: dir > 0 ? -80 : 80,
                        opacity: 0,
                        scale: 0.88,
                        transition: {
                          x: { type: "spring", stiffness: 360, damping: 26 },
                          opacity: { duration: 0.18 }
                        }
                      })
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.3}
                    onDragStart={() => {
                      isDraggingRef.current = true;
                    }}
                    onDragEnd={(e, { offset, velocity }) => {
                      setTimeout(() => {
                        isDraggingRef.current = false;
                      }, 60);

                      const swipe = offset.x;
                      if (swipe < -30 || velocity.x < -200) {
                        handleNext(e);
                      } else if (swipe > 30 || velocity.x > 200) {
                        handlePrev(e);
                      }
                    }}
                    onClick={(e) => handleOpenStudio(STUDIOS[currentIndex], e)}
                    className="relative w-36 sm:w-44 max-w-[55%] cursor-pointer filter drop-shadow-[6px_6px_0px_#2D2D2D] select-none"
                  >
                    <img 
                      src={STUDIOS[currentIndex].src} 
                      alt={STUDIOS[currentIndex].title} 
                      className="w-full h-auto pointer-events-none" 
                    />
                    
                    {/* Badge with studio title */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#2D2D2D] text-[#FFFCE8] border-2 border-[#2D2D2D] px-2.5 py-0.5 shadow-[2px_2px_0px_#1A1A1A] pointer-events-none whitespace-nowrap">
                      <span className="font-mono font-bold text-[9px] sm:text-[10px] tracking-wider uppercase">
                        {STUDIOS[currentIndex].title}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Peeking Card (Clickable) */}
              <div
                onClick={handleNext}
                className="absolute right-[-4%] sm:right-[-1%] top-1/2 -translate-y-1/2 z-10 w-24 sm:w-32 rotate-12 cursor-pointer filter drop-shadow-[3px_3px_0px_#2D2D2D] select-none opacity-55 hover:opacity-80 transition-opacity"
              >
                <img 
                  src={STUDIOS[nextIndex].src} 
                  alt={STUDIOS[nextIndex].title} 
                  className="w-full h-auto pointer-events-none" 
                />
              </div>

              {/* Bottom Deck Indicator with High-Contrast Pill & zigzagHeart Asset */}
              <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 bg-[#2D2D2D] border-2 border-[#FFFCE8] px-3 py-1 shadow-[2px_2px_0px_#1A1A1A] rounded-sm">
                  {STUDIOS.map((s, idx) => (
                    <span key={s.id} className="flex items-center justify-center">
                      {idx === currentIndex ? (
                        <img 
                          src="/assets/zigzagHeart.webp" 
                          alt="Active" 
                          className="w-3.5 h-3.5 object-contain inline-block filter drop-shadow-[0px_0px_2px_rgba(255,255,255,0.7)]" 
                        />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFFCE8]/50 inline-block" />
                      )}
                    </span>
                  ))}
                  <span className="ml-1 text-[10px] font-mono font-bold text-[#FFFCE8] tracking-widest uppercase">
                    DECK ({currentIndex + 1}/{STUDIOS.length})
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* ========================================= */}
          {/* OPTION 2: ALL-IN-ONE VIEW (Five in One)   */}
          {/* Strictly bounded inside green cutting mat */}
          {/* ========================================= */}
          {mobileMode === 'all-in-one' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
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
            </motion.div>
          )}

        </div>
      </div>

    </div>
  );
}
