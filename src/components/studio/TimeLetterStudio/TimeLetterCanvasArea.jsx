import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { TimeLetterCard } from './TimeLetterCard';
import { TimeEnvelopeCard } from './TimeEnvelopeCard';
import { TimeLetterInteractiveEnvelope } from './TimeLetterInteractiveEnvelope';
import { InteractiveDeskLines } from '../../desk/InteractiveDeskLines';
import { soundFX } from '../../../utils/audio';

export function TimeLetterCanvasArea({ 
  state, 
  activeSide, 
  onFlip, 
  onUpdate,
  isShowcase, 
  onStartCustomizing 
}) {
  const sectionRef = useRef(null);

  // Decoy/Tilt Tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-300, 300], [10, -10]);
  const rotateYBase = useTransform(x, [-300, 300], [-10, 10]);

  // Zoom State with Spring
  const zoomTarget = useMotionValue(1.0);
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
      zoomTarget.set(Math.min(Math.max(0.5, newZoom), 2.5));
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

  const handleFlipClick = () => {
    soundFX.playPop();
    onFlip();
  };

  const handleMakeYourOwn = () => {
    soundFX.playPop();
    onStartCustomizing();
  };

  const baseW = 580;
  const baseH = 380;

  const currentW = useTransform(zoom, z => baseW * z);
  const currentH = useTransform(zoom, z => baseH * z);

  return (
    <section 
      ref={sectionRef}
      className="relative flex-1 bg-[#F4F1EA] overflow-hidden flex items-center justify-center select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Desk Background & Lines */}
      <div className="absolute inset-0 z-0 bg-deskSurface">
        <InteractiveDeskLines />
      </div>

      {/* Cutting Mat Container (Matching Travel ID & Bounty Studios) */}
      <div 
        onClick={() => {
          if (isShowcase) {
            handleMakeYourOwn();
          }
        }}
        className={`relative w-[92%] h-[92%] max-w-[1300px] border-[6px] border-[#1A1A1A] shadow-[12px_12px_0px_rgba(0,0,0,0.5)] bg-[#2a3c24] flex items-center justify-center overflow-hidden z-10 ${isShowcase ? 'cursor-pointer' : ''}`}
      >
        
        {/* Cutting Mat Surface Pattern */}
        <img 
          src="/assets/cutting-mat.svg" 
          alt="Cutting Mat" 
          className="absolute inset-0 w-full h-full object-cover object-left-bottom opacity-80 pointer-events-none" 
        />

        {/* Dynamic Dimensions UI */}
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

        {/* Top-Center Showcase Overlay Banner (Exact 1:1 Match to Travel ID Studio) */}
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleMakeYourOwn();
                }}
              >
                <span className="font-marker text-xl tracking-wide handwritten-text">Click to make your own</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Envelope with Opening Animation & Sliding Letterhead */}
        <div className="relative z-30">
          <motion.div
            style={{ 
              rotateX, 
              rotateY: rotateYBase, 
              scale: zoom 
            }}
          >
            <TimeLetterInteractiveEnvelope 
              state={state} 
              isShowcase={isShowcase} 
              onStartCustomizing={handleMakeYourOwn}
              onToggleOpen={() => onUpdate('isOpen', !state.isOpen)}
            />
          </motion.div>
        </div>

        {/* Top-Right Interactive Scribble Guide Text */}
        <div 
          onClick={() => {
            if (isShowcase) {
              handleMakeYourOwn();
            } else {
              soundFX.playPop();
              onUpdate('isOpen', !state.isOpen);
            }
          }}
          className="absolute top-10 right-10 z-40 cursor-pointer flex items-center gap-2 opacity-85 group hover:opacity-100 transition-opacity"
        >
          <span className="font-marker text-2xl text-[#F4F1EA] uppercase tracking-widest handwritten-text group-hover:text-[#FFEB3B]">
            {isShowcase 
              ? 'CLICK TO MAKE YOUR OWN' 
              : state.isOpen 
                ? 'CLICK TO TUCK IN & SEAL' 
                : 'CLICK TO UNSEAL & OPEN LETTER'}
          </span>
          <img 
            src="/assets/dottedUpArrow.svg" 
            alt="Action arrow" 
            className={`w-8 h-8 brightness-0 invert transition-transform handwritten-text ${state.isOpen ? 'rotate-0' : 'rotate-180'}`} 
          />
        </div>
      </div>
    </section>
  );
}
