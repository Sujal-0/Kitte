import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundFX } from '../../utils/audio';
import { WashiTape } from './WashiTape';
import { useUrlStateBool } from '../../hooks/useUrlState';
import { triggerBurst } from '../ui/ClickBurstEngine';

export function TornReceipt({ className = "w-14 md:w-20" }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isOpen, setIsOpen] = useUrlStateBool('receipt', false);

  const handleOpen = () => {
    setIsPressed(false);
    setIsOpen(true);
    soundFX.playSnap();
  };

  return (
    <>
      <motion.div
        className={`relative ${className} cursor-pointer select-none`}
        onPointerDown={(e) => {
          setIsPressed(true);
          soundFX.playPop();
          if (e?.clientX && e?.clientY) triggerBurst(e.clientX, e.clientY);
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
            ? "drop-shadow(6px 6px 0px #2D2D2D)"
            : "drop-shadow(3px 3px 0px #2D2D2D)",
          x: isPressed ? 3 : 0,
          y: isPressed ? 3 : 0,
          rotateZ: 2,
          scale: isHovered && !isPressed ? 1.03 : 1
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <img 
          src="/assets/receiptPrivacy.webp" 
          alt="Privacy Receipt" 
          className="w-full h-auto pointer-events-none relative z-10" 
        />
        {/* Taped to the desk */}
        <WashiTape className="absolute -top-1 md:-top-2 left-1/2 -translate-x-1/2 rotate-3 w-8 md:w-12 h-3 md:h-4 z-50 pointer-events-none" />
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            key="receipt-modal-overlay"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 lg:p-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)} 
          >
            <motion.div 
              className="relative h-[90vh] w-fit max-w-[95vw] inline-flex justify-center items-center cursor-pointer"
              initial={{ y: 50, scale: 0.95, rotateZ: 1 }}
              animate={{ y: 0, scale: 1, rotateZ: 0 }}
              exit={{ y: 50, scale: 0.95, rotateZ: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()} 
            >
              <img 
                src="/assets/receiptPrivacy_blank.webp" 
                alt="Receipt Background"
                className="h-full w-auto object-contain drop-shadow-2xl pointer-events-none select-none z-10 block"
              />

              {/* VISIBLE CLOSE BUTTON - Moved slightly down */}
              <button 
                className="absolute top-[6%] right-[8%] z-30 cursor-pointer font-marker text-3xl md:text-4xl text-zinc-900 hover:text-markerRed transition-transform hover:scale-110 active:scale-95 mix-blend-multiply opacity-80"
                onClick={(e) => { e.stopPropagation(); soundFX.playPop(); setIsOpen(false); }}
                aria-label="Close Receipt"
              >
                X
              </button>

              {/* 
                THE TEXT OVERLAY 
                Shifted down (top-[26%]) to avoid overlapping the baked-in date.
              */}
              <div className="absolute top-[26%] bottom-[18%] left-[10%] right-[10%] flex flex-col z-20 font-mono text-zinc-900 mix-blend-multiply opacity-90 overflow-hidden px-4 md:px-6 py-2">
                
                {/* Font sizes reduced slightly (e.g. text-[8px] instead of [9px]) */}
                <div className="flex-1 text-[8px] sm:text-[10px] md:text-[12px] lg:text-[13px] space-y-3 md:space-y-4 font-bold flex flex-col justify-center">
                  
                  {/* Grid layout for perfect alignment and gap between item & price */}
                  <div className="grid grid-cols-[auto_1fr_auto] gap-4 uppercase pb-1">
                    <span>Qty</span>
                    <span className="text-center">Item</span>
                    <span className="text-right">Price</span>
                  </div>
                  
                  <div className="border-t-[1.5px] border-dashed border-zinc-900/60 w-full"></div>

                  <div className="space-y-4 md:space-y-5 py-3 md:py-4">
                    <div>
                      <div className="grid grid-cols-[auto_1fr_auto] gap-4">
                        <span>01</span>
                        <span className="pl-2">ESSENTIAL COOKIES</span>
                        <span className="text-right">$0.00</span>
                      </div>
                      <p className="text-[6px] sm:text-[8px] lg:text-[9px] text-zinc-600 pl-6 md:pl-8 uppercase leading-none mt-1">Store local memory state</p>
                    </div>

                    <div>
                      <div className="grid grid-cols-[auto_1fr_auto] gap-4">
                        <span>00</span>
                        <span className="pl-2">TRACKING SCRIPTS</span>
                        <span className="text-right">VOID</span>
                      </div>
                      <p className="text-[6px] sm:text-[8px] lg:text-[9px] text-zinc-600 pl-6 md:pl-8 uppercase leading-none mt-1">No user data harvested</p>
                    </div>
                  </div>

                  <div className="border-t-[1.5px] border-dashed border-zinc-900/60 w-full"></div>

                  <div className="space-y-2 md:space-y-3 pt-2 md:pt-4">
                    <div className="flex justify-between">
                      <span>DATA HARVESTED:</span>
                      <span>0 BYTES</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm md:text-base lg:text-lg font-black mt-2">
                      <span>TOTAL SECURE:</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
                
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
