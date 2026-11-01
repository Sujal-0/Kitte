import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { TravelIDCard } from './TravelIDCard';
import { InteractiveDeskLines } from '../../desk/InteractiveDeskLines';

export function TravelIDCanvasArea({ activeSide, idState, onUpdate, onFlip, isShowcase, onStartCustomizing }) {
  const sectionRef = useRef(null);

  // Decoy/Tilt Effect Tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-300, 300], [10, -10]);
  const rotateYBase = useTransform(x, [-300, 300], [-10, 10]);
  
  // Zoom State - using Spring for smooth dimension/scale tracking
  const zoomTarget = useMotionValue(1.0);
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
      
      zoomTarget.set(Math.min(Math.max(0.5, newZoom), 3));
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
      className="relative flex-1 bg-[#F4F1EA] overflow-hidden flex items-center justify-center" 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
              className="absolute top-8 z-50 pointer-events-auto"
            >
              <div className="bg-[#1A1A1A] text-[#F4F1EA] px-4 py-2 border-2 border-white -rotate-2 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] cursor-pointer" onClick={handleClick}>
                <span className="font-marker text-xl tracking-wide handwritten-text">Click to make your own</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D ID Container - Uses same animated zoom spring! */}
        <div className="relative z-30" style={{ perspective: '1500px' }}>
          <motion.div
            className="cursor-pointer"
            animate={{ rotateY: activeSide === 'back' ? 180 : 0 }}
            style={{ 
              transformStyle: 'preserve-3d', 
              rotateX,
              scale: zoom
            }}
            transition={{ rotateY: { type: "spring", stiffness: 60, damping: 15, mass: 1 } }}
            onClick={handleClick}
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
          </motion.div>
        </div>

        {/* CLICK TO FLIP Scribble Text */}
        <div className="absolute top-12 right-12 z-40 pointer-events-none flex items-center gap-2 opacity-80">
          <span className="font-marker text-2xl text-[#F4F1EA] uppercase tracking-widest handwritten-text">
            CLICK TO FLIP
          </span>
          <img src="/assets/dottedUpArrow.svg" alt="arrow" className="w-8 h-8 rotate-180 brightness-0 invert handwritten-text" />
        </div>
      </div>
    </section>
  );
}
