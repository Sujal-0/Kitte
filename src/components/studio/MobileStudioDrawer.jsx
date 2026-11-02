import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundFX } from '../../utils/audio';

export function MobileStudioDrawer({
  isOpen,
  onOpen,
  onClose,
  children
}) {
  const touchStartY = useRef(null);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY.current;
    if (deltaY < -30 && !isOpen) {
      soundFX.playPop();
      onOpen();
    } else if (deltaY > 30 && isOpen) {
      soundFX.playPop();
      onClose();
    }
    touchStartY.current = null;
  };

  return (
    <>
      {/* 1. Backdrop Overlay covering top 10% when drawer is expanded */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-0 h-[10vh] z-40 bg-black/40 backdrop-blur-[2px] cursor-pointer"
            onClick={() => {
              soundFX.playPop();
              onClose();
            }}
            aria-label="Close drawer"
          />
        )}
      </AnimatePresence>

      {/* 2. Bottom Drawer Sheet (Swipeable & Animated to 90vh) */}
      <motion.div
        className="fixed inset-x-0 bottom-0 z-50 bg-[#F4F1EA] border-t-[4px] border-[#1A1A1A] shadow-[0px_-8px_0px_rgba(0,0,0,0.25)] flex flex-col select-none"
        initial={false}
        animate={{
          height: isOpen ? "90vh" : "44px",
        }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
      >
        {/* Minimal Centered Handle Bar (Tap or Swipe) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => {
            soundFX.playPop();
            if (isOpen) onClose();
            else onOpen();
          }}
          className="w-full h-11 bg-[#F4F1EA] border-b-2 border-[#1A1A1A]/20 flex items-center justify-center cursor-pointer shrink-0 select-none hover:bg-[#eae4d3] transition-colors"
          role="button"
          tabIndex={0}
          aria-label={isOpen ? "Close controls drawer" : "Open controls drawer"}
        >
          {/* Centered Triangle Button (^ when closed, v when open) */}
          <div className="relative flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
            <svg 
              width="54" 
              height="24" 
              viewBox="0 0 54 24" 
              className="drop-shadow-[2px_2px_0px_#1A1A1A]"
            >
              {isOpen ? (
                // V triangle pointing down (when open)
                <polygon 
                  points="4,3 50,3 27,22" 
                  fill="#E4D4B0" 
                  stroke="#1A1A1A" 
                  strokeWidth="2.5" 
                  strokeLinejoin="round" 
                />
              ) : (
                // ^ triangle pointing up (when closed)
                <polygon 
                  points="27,2 50,21 4,21" 
                  fill="#E4D4B0" 
                  stroke="#1A1A1A" 
                  strokeWidth="2.5" 
                  strokeLinejoin="round" 
                />
              )}
            </svg>

            {/* Dotted Arrow strictly facing UP (-rotate-90) when closed, and DOWN (rotate-90) when open */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img
                src="/assets/dottedUpArrow.svg"
                alt={isOpen ? "Close" : "Open"}
                className={`w-3.5 h-3.5 object-contain handwritten-text transition-transform duration-300 ${
                  isOpen ? "rotate-90 translate-y-0.5" : "-rotate-90 -translate-y-0.5"
                }`}
              />
            </div>
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

