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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)} 
          >
            <motion.div 
              className="relative w-full max-w-[300px] sm:max-w-[360px] md:max-w-[420px] h-[78vh] sm:h-[84vh] max-h-[740px] flex justify-center items-center cursor-auto"
              initial={{ y: 30, scale: 0.95, rotateZ: 1 }}
              animate={{ y: 0, scale: 1, rotateZ: 0 }}
              exit={{ y: 30, scale: 0.95, rotateZ: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()} 
            >
              <img 
                src="/assets/receiptPrivacy_blank.webp" 
                alt="Receipt Background"
                className="w-full h-full object-contain drop-shadow-2xl pointer-events-none select-none z-10 block"
              />

              {/* VISIBLE CLOSE BUTTON */}
              <button 
                className="absolute top-[5%] right-[7%] z-30 cursor-pointer font-marker text-2xl sm:text-3xl text-zinc-900 hover:text-markerRed transition-transform hover:scale-110 active:scale-95 mix-blend-multiply opacity-80"
                onClick={(e) => { e.stopPropagation(); soundFX.playPop(); setIsOpen(false); }}
                aria-label="Close Receipt"
              >
                X
              </button>

              {/* THE TEXT OVERLAY */}
              <div className="absolute top-[25%] bottom-[16%] left-[8%] right-[8%] flex flex-col justify-between z-20 font-mono text-zinc-900 mix-blend-multiply opacity-90 overflow-hidden px-2 sm:px-4 py-1.5">
                <div className="text-[8px] sm:text-[10px] md:text-[12px] space-y-2 sm:space-y-3 font-bold flex flex-col justify-center">
                  
                  {/* Header row */}
                  <div className="grid grid-cols-[auto_1fr_auto] gap-2 uppercase pb-1 text-[7px] sm:text-[9px]">
                    <span>Qty</span>
                    <span className="text-center">Item</span>
                    <span className="text-right">Price</span>
                  </div>
                  
                  <div className="border-t-[1.5px] border-dashed border-zinc-900/60 w-full"></div>

                  <div className="space-y-2.5 sm:space-y-3.5 py-1">
                    <div>
                      <div className="grid grid-cols-[auto_1fr_auto] gap-2">
                        <span>01</span>
                        <span className="pl-1">ESSENTIAL COOKIES</span>
                        <span className="text-right">$0.00</span>
                      </div>
                      <p className="text-[6px] sm:text-[8px] text-zinc-600 pl-4 uppercase leading-none mt-0.5">Store local memory state</p>
                    </div>

                    <div>
                      <div className="grid grid-cols-[auto_1fr_auto] gap-2">
                        <span>00</span>
                        <span className="pl-1">TRACKING SCRIPTS</span>
                        <span className="text-right">VOID</span>
                      </div>
                      <p className="text-[6px] sm:text-[8px] text-zinc-600 pl-4 uppercase leading-none mt-0.5">No user data harvested</p>
                    </div>
                  </div>

                  <div className="border-t-[1.5px] border-dashed border-zinc-900/60 w-full"></div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[7px] sm:text-[9px]">
                      <span>DATA HARVESTED:</span>
                      <span>0 BYTES</span>
                    </div>
                    <div className="flex justify-between text-[10px] sm:text-xs md:text-sm font-black mt-1">
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
