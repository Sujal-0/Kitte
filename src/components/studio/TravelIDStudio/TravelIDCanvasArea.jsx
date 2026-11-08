import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { TravelIDCard } from './TravelIDCard';
import { InteractiveDeskLines } from '../../desk/InteractiveDeskLines';
import { soundFX } from '../../../utils/audio';

export function TravelIDCanvasArea({ activeSide, idState, onUpdate, onFlip, isShowcase, onStartCustomizing }) {
  const sectionRef = useRef(null);

  // Decoy/Tilt Effect Tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-300, 300], [10, -10]);
  const rotateYBase = useTransform(x, [-300, 300], [-10, 10]);
  
  // Zoom State - using Spring for smooth dimension/scale tracking
  // Responsive default: 0.62 on mobile so 500px card fits comfortably inside cutting mat, 1.0 on desktop
  const defaultZoom = typeof window !== 'undefined' && window.innerWidth < 768 ? 0.62 : 1.0;
  const zoomTarget = useMotionValue(defaultZoom);
  const zoom = useSpring(zoomTarget, { stiffness: 300, damping: 30 });
  
  useEffect(() => {
    const handleNativeWheel = (e) => {
      e.preventDefault(); // Prevent browser trackpad zoom/scroll
      const delta = e.deltaY;
      const currentZoom = zoomTarget.get();
      
      let newZoom = currentZoom - (delta > 0 ? 0.05 : -0.05);
      if (e.ctrlKey) {
        newZoom = currentZoom - (delta * 0.01);
      }
      
      zoomTarget.set(Math.min(Math.max(0.4, newZoom), 3));
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
          const nextZoom = Math.min(Math.max(0.35, initialZoom * factor), 3);
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

  const handleProductClick = (e) => {
    e?.stopPropagation?.();
    soundFX.playPop();
    if (isShowcase) {
      onStartCustomizing();
    } else {
      onFlip();
    }
  };

  // Dimensions matching Memory Ticket Studio
  const baseW = 500;
  const baseH = 315;

  const currentW = useTransform(zoom, z => baseW * z);
  const currentH = useTransform(zoom, z => baseH * z);

  return (
    <section 
      ref={sectionRef}
      className="relative flex-1 w-full h-full bg-[#F4F1EA] overflow-hidden flex items-center justify-center select-none pb-14 lg:pb-0 touch-none" 
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Desk Background & Lines */}
      <div className="absolute inset-0 z-0 bg-deskSurface">
        <InteractiveDeskLines />
      </div>

      {/* Cutting Mat Container */}
      <div className="relative w-[90%] h-[90%] max-w-[1200px] border-[6px] border-[#1A1A1A] shadow-[12px_12px_0px_rgba(0,0,0,0.5)] bg-[#2a3c24] flex items-center justify-center overflow-hidden z-10">
        
        {/* The Mat Image */}
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
          <div className="absolute -top-10 left-0 right-0 h-6 border-x-[3px] border-t-[3px] border-[#1A1A1A] flex items-start justify-center">
            <span className="font-mono font-bold text-sm bg-[#FFEB3B] text-[#1A1A1A] px-2 py-0.5 border-[3px] border-[#1A1A1A] -translate-y-1/2 shadow-[3px_3px_0px_#1A1A1A]">
              W: {baseW}px ({(baseW / 300).toFixed(2)}")
            </span>
          </div>
          {/* Left Height Dimension */}
          <div className="absolute -left-10 top-0 bottom-0 w-6 border-y-[3px] border-l-[3px] border-[#1A1A1A] flex items-center justify-start">
            <span className="font-mono font-bold text-sm bg-[#FFEB3B] text-[#1A1A1A] px-2 py-0.5 border-[3px] border-[#1A1A1A] -translate-x-1/2 -rotate-90 shadow-[3px_3px_0px_#1A1A1A] whitespace-nowrap">
              H: {baseH}px ({(baseH / 300).toFixed(2)}")
            </span>
          </div>
          {/* Top Right DPI Label */}
          <div className="absolute -top-10 -right-12">
            <span className="font-marker text-lg text-[#FFEB3B]" style={{ filter: "drop-shadow(2px 2px 0px #1A1A1A)" }}>300 DPI</span>
          </div>
        </motion.div>

        {/* Showcase Overlay */}
        <AnimatePresence>
          {isShowcase && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-6 sm:top-8 z-50 pointer-events-auto"
            >
              <div 
                className="bg-[#1A1A1A] text-[#F4F1EA] px-3.5 py-1.5 sm:px-4 sm:py-2 border-2 border-white -rotate-2 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] cursor-pointer active:scale-95 transition-transform touch-manipulation" 
                onClick={handleProductClick}
              >
                <span className="font-marker text-base sm:text-xl tracking-wide handwritten-text">Click to make your own</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D ID Container - Uses same animated zoom spring! */}
        <div className="relative z-30" style={{ perspective: '1500px' }}>
          <motion.div
            className="cursor-pointer select-none relative touch-manipulation"
            animate={{ rotateY: activeSide === 'back' ? 180 : 0 }}
            style={{ 
              transformStyle: 'preserve-3d', 
              rotateX,
              scale: zoom
            }}
            transition={{ rotateY: { type: "spring", stiffness: 60, damping: 15, mass: 1 } }}
            onClick={handleProductClick}
          >
            <motion.div 
              style={{ rotateX, rotateY: rotateYBase, transformStyle: 'preserve-3d' }}
              className="w-[500px] h-[315px] relative"
            >
              <div 
                className="absolute inset-0 origin-top-left"
                style={{ 
                  transform: 'scale(0.65789)', // 500/760 = 0.65789, scales 760x480 perfectly into 500x315
                  transformStyle: 'preserve-3d' 
                }}
              >
                <TravelIDCard idState={idState} activeSide={activeSide} onUpdate={onUpdate} isShowcase={isShowcase} />
              </div>
            </motion.div>

            {/* Click/Tap Capture Overlay */}
            <div 
              className="absolute inset-0 z-40 cursor-pointer pointer-events-auto touch-manipulation"
              onClick={handleProductClick}
              aria-label={isShowcase ? "Click to make your own" : "Click to flip card"}
            />
          </motion.div>
        </div>

        {/* CLICK TO FLIP Scribble Text */}
        <div 
          onClick={handleProductClick}
          className="absolute top-4 right-4 sm:top-12 sm:right-12 z-40 cursor-pointer flex items-center gap-1.5 sm:gap-2 opacity-85 hover:opacity-100 active:scale-95 transition-all select-none touch-manipulation"
        >
          <span className="font-marker text-lg sm:text-2xl text-[#F4F1EA] uppercase tracking-widest handwritten-text">
            CLICK TO FLIP
          </span>
          <img src="/assets/dottedUpArrow.svg" alt="arrow" className="w-5 h-5 sm:w-8 sm:h-8 rotate-180 brightness-0 invert handwritten-text" />
        </div>
      </div>
    </section>
  );
}
