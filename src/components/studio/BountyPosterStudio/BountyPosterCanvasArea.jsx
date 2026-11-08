import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { BountyPosterCard } from './BountyPosterCard';
import { InteractiveDeskLines } from '../../desk/InteractiveDeskLines';
import { BOUNTY_POSTER_TOKENS } from '../../../features/bounty-poster/tokens/bountyTokens';
import { soundFX } from '../../../utils/audio';

export function BountyPosterCanvasArea({
  state,
  isShowcase,
  onStartCustomizing,
}) {
  const sectionRef = useRef(null);

  // Decoy/Tilt 3D Effect Tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-300, 300], [10, -10]);
  const rotateYBase = useTransform(x, [-300, 300], [-10, 10]);

  // Zoom State - using Spring for smooth dimension/scale tracking
  // Responsive default: fits mobile (0.52) or desktop (0.82)
  const defaultZoom = typeof window !== 'undefined' && window.innerWidth < 768 ? 0.52 : 0.82;
  const zoomTarget = useMotionValue(defaultZoom);
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

      zoomTarget.set(Math.min(Math.max(0.40, newZoom), 2.2));
    };

    // Mobile 2-finger pinch zoom
    let initialDistance = 0;
    let initialZoom = 1;

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistance = Math.hypot(dx, dy);
        initialZoom = zoomTarget.get();
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        if (initialDistance > 0) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const currentDistance = Math.hypot(dx, dy);
          const factor = currentDistance / initialDistance;
          const nextZoom = Math.min(Math.max(0.35, initialZoom * factor), 2.2);
          zoomTarget.set(nextZoom);
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (e.touches.length < 2) {
        initialDistance = 0;
      }
    };

    const handleGesture = (e) => {
      e.preventDefault();
    };

    const section = sectionRef.current;
    if (section) {
      section.addEventListener('wheel', handleNativeWheel, { passive: false });
      section.addEventListener('touchstart', handleTouchStart, { passive: false });
      section.addEventListener('touchmove', handleTouchMove, { passive: false });
      section.addEventListener('touchend', handleTouchEnd, { passive: true });
      section.addEventListener('touchcancel', handleTouchEnd, { passive: true });
      section.addEventListener('gesturestart', handleGesture, { passive: false });
      section.addEventListener('gesturechange', handleGesture, { passive: false });
    }
    return () => {
      if (section) {
        section.removeEventListener('wheel', handleNativeWheel);
        section.removeEventListener('touchstart', handleTouchStart);
        section.removeEventListener('touchmove', handleTouchMove);
        section.removeEventListener('touchend', handleTouchEnd);
        section.removeEventListener('touchcancel', handleTouchEnd);
        section.removeEventListener('gesturestart', handleGesture);
        section.removeEventListener('gesturechange', handleGesture);
      }
    };
  }, [zoomTarget]);

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleClick = () => {
    if (isShowcase) {
      soundFX.playPop();
      onStartCustomizing();
    }
  };

  const baseW = BOUNTY_POSTER_TOKENS.width;  // 408
  const baseH = BOUNTY_POSTER_TOKENS.height; // 600

  // Animated Dimensions for cutting mat guidelines
  const currentW = useTransform(zoom, z => baseW * z);
  const currentH = useTransform(zoom, z => baseH * z);

  return (
    <section 
      ref={sectionRef}
      className="relative flex-1 w-full h-full bg-[#F4F1EA] overflow-hidden flex items-center justify-center select-none pb-14 lg:pb-0 touch-none" 
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      {/* Interactive Desk Lines Background */}
      <div className="absolute inset-0 z-0 bg-deskSurface">
        <InteractiveDeskLines />
      </div>

      {/* Cutting Mat Container (Solid Object on Desk) */}
      <div className="relative w-[94%] lg:w-[90%] h-[94%] lg:h-[90%] max-w-[1200px] border-[4px] lg:border-[6px] border-[#1A1A1A] shadow-[6px_6px_0px_rgba(0,0,0,0.4)] lg:shadow-[12px_12px_0px_rgba(0,0,0,0.5)] bg-[#2a3c24] flex items-center justify-center overflow-hidden z-10">
        
        {/* The Mat Texture */}
        <img 
          src="/assets/cutting-mat.svg" 
          alt="Cutting Mat" 
          className="absolute inset-0 w-full h-full object-cover object-left-bottom opacity-80 pointer-events-none" 
        />

        {/* Dynamic Dimensions UI - Smooth Animated Wrapper */}
        <motion.div 
          className="absolute pointer-events-none z-20 flex items-center justify-center"
          style={{ width: currentW, height: currentH }}
        >
          {/* Top Width Dimension */}
          <div className="absolute -top-7 sm:-top-10 left-0 right-0 h-4 sm:h-6 border-x-2 sm:border-x-[3px] border-t-2 sm:border-t-[3px] border-[#1A1A1A] flex items-start justify-center">
            <span className="font-mono font-bold text-[10px] sm:text-sm bg-[#FFEB3B] text-[#1A1A1A] px-1.5 sm:px-2 py-0.5 border-2 sm:border-[3px] border-[#1A1A1A] -translate-y-1/2 shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[3px_3px_0px_#1A1A1A]">
              W: {baseW}px
            </span>
          </div>

          {/* Left Height Dimension */}
          <div className="absolute -left-7 sm:-left-10 top-0 bottom-0 w-4 sm:w-6 border-y-2 sm:border-y-[3px] border-l-2 sm:border-l-[3px] border-[#1A1A1A] flex items-center justify-start">
            <span className="font-mono font-bold text-[10px] sm:text-sm bg-[#FFEB3B] text-[#1A1A1A] px-1.5 sm:px-2 py-0.5 border-2 sm:border-[3px] border-[#1A1A1A] -translate-x-1/2 -rotate-90 shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[3px_3px_0px_#1A1A1A] whitespace-nowrap">
              H: {baseH}px
            </span>
          </div>

          {/* Top Right DPI Label */}
          <div className="absolute -top-7 sm:-top-10 -right-6 sm:-right-12">
            <span className="font-marker text-xs sm:text-lg text-[#FFEB3B]" style={{ filter: "drop-shadow(2px 2px 0px #1A1A1A)" }}>
              300 DPI
            </span>
          </div>
        </motion.div>

        {/* Showcase Overlay (Matching Travel ID Studio exactly) */}
        <AnimatePresence>
          {isShowcase && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 sm:top-8 z-50 pointer-events-auto"
            >
              <div 
                className="bg-[#1A1A1A] text-[#F4F1EA] px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-white -rotate-2 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] cursor-pointer active:scale-95 transition-transform" 
                onClick={handleClick}
              >
                <span className="font-marker text-base sm:text-xl tracking-wide handwritten-text">Click to make your own</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D Poster Container with Decoy Tilt & Zoom Scale (Single Sided) */}
        <div className="relative z-30" style={{ perspective: '1500px' }}>
          <motion.div
            className={isShowcase ? "cursor-pointer" : ""}
            style={{ 
              rotateX, 
              rotateY: rotateYBase, 
              scale: zoom,
              transformStyle: 'preserve-3d' 
            }}
            onClick={handleClick}
          >
            <BountyPosterCard state={state} isShowcase={isShowcase} />
          </motion.div>
        </div>

      </div>
    </section>
  );
}
