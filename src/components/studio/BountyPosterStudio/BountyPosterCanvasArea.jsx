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
  // Default 0.82 fits the 600px tall poster comfortably inside cutting mat on all screen heights
  const zoomTarget = useMotionValue(0.82);
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

      zoomTarget.set(Math.min(Math.max(0.45, newZoom), 2.2));
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
      className="relative flex-1 bg-[#F4F1EA] overflow-hidden flex items-center justify-center select-none" 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Interactive Desk Lines Background */}
      <div className="absolute inset-0 z-0 bg-deskSurface">
        <InteractiveDeskLines />
      </div>

      {/* Cutting Mat Container (Solid Object on Desk) */}
      <div className="relative w-[90%] h-[90%] max-w-[1200px] border-[6px] border-[#1A1A1A] shadow-[12px_12px_0px_rgba(0,0,0,0.5)] bg-[#2a3c24] flex items-center justify-center overflow-hidden z-10">
        
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
            <span className="font-marker text-lg text-[#FFEB3B]" style={{ filter: "drop-shadow(2px 2px 0px #1A1A1A)" }}>
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
              className="absolute top-8 z-50 pointer-events-auto"
            >
              <div 
                className="bg-[#1A1A1A] text-[#F4F1EA] px-4 py-2 border-2 border-white -rotate-2 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] cursor-pointer" 
                onClick={handleClick}
              >
                <span className="font-marker text-xl tracking-wide handwritten-text">Click to make your own</span>
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
