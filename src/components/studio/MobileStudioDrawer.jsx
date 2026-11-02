import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundFX } from '../../utils/audio';

export function MobileStudioDrawer({
  isOpen,
  onOpen,
  onClose,
  title = "CUSTOMIZE & CONTROLS",
  badgeText,
  children
}) {
  return (
    <>
      {/* 1. Backdrop Overlay covering top 20% when drawer is expanded */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-0 h-[20vh] z-40 bg-black/40 backdrop-blur-[2px] cursor-pointer"
            onClick={() => {
              soundFX.playPop();
              onClose();
            }}
            aria-label="Tap to close drawer"
          >
            <div className="w-full h-full flex items-center justify-center pointer-events-none">
              <span className="bg-[#1A1A1A]/85 text-white font-mono text-[10px] px-3 py-1 border border-white/20 uppercase tracking-wider shadow">
                Tap outside to close
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Bottom Drawer Sheet (Swipeable & Animated) */}
      <motion.div
        className="fixed inset-x-0 bottom-0 z-50 bg-[#F4F1EA] border-t-[4px] border-[#1A1A1A] shadow-[0px_-8px_0px_rgba(0,0,0,0.25)] flex flex-col select-none"
        initial={false}
        animate={{
          height: isOpen ? "80vh" : "56px",
        }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
      >
        {/* Top Handle / Peek Button Bar */}
        <div
          onClick={() => {
            soundFX.playPop();
            if (isOpen) onClose();
            else onOpen();
          }}
          className="w-full h-14 bg-[#F4F1EA] border-b-2 border-[#1A1A1A]/20 flex items-center justify-between px-4 cursor-pointer shrink-0 select-none hover:bg-[#eae4d3] transition-colors"
        >
          {/* Left: Drag indicator bar or icon */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]" />
            <span className="font-marker text-sm uppercase tracking-wider text-[#1A1A1A] handwritten-text">
              {title}
            </span>
            {badgeText && (
              <span className="font-mono text-[9px] font-bold bg-[#FFEB3B] border border-[#1A1A1A] px-1.5 py-0.5 shadow-[1px_1px_0px_#1A1A1A] uppercase">
                {badgeText}
              </span>
            )}
          </div>

          {/* Center / Action: dottedUpArrow with swipe animation */}
          <div className="flex items-center gap-2">
            <motion.div
              animate={isOpen ? { rotate: 180, y: [0, 2, 0] } : { rotate: 0, y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="flex items-center justify-center w-7 h-7 bg-[#E4D4B0] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]"
            >
              <img
                src="/assets/dottedUpArrow.svg"
                alt="Toggle Drawer"
                className="w-4 h-4 object-contain handwritten-text"
              />
            </motion.div>
            <span className="font-marker text-xs text-[#1A1A1A] handwritten-text">
              {isOpen ? "CLOSE" : "SWIPE UP"}
            </span>
          </div>
        </div>

        {/* Drawer Scrollable Content Area */}
        <div 
          className={`flex-1 overflow-y-auto overscroll-contain p-4 pb-12 transition-opacity duration-200 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {children}
        </div>
      </motion.div>
    </>
  );
}
