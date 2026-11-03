import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundFX } from '../../utils/audio';
import { triggerBurst } from './ClickBurstEngine';

const COOKIE_STORAGE_KEY = 'kitte_cookie_consent';

export function CookieConsentBanner({ currentView, isAnyModalOpen, onOpenPrivacy }) {
  const [hasConsented, setHasConsented] = useState(() => {
    try {
      return localStorage.getItem(COOKIE_STORAGE_KEY) === 'accepted';
    } catch {
      return false;
    }
  });

  const canvasRef = useRef(null);

  // Draw miniature wavy desk lines background matching the desk workspace
  useEffect(() => {
    if (hasConsented) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 380;
    const height = 180;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(180, 150, 110, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';

    const linesCount = 14;
    const stepY = height / linesCount;
    for (let i = 0; i < linesCount; i++) {
      const y = i * stepY + 10;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= width; x += 15) {
        const wave = Math.sin((x / 40) + i) * 3;
        ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }
  }, [hasConsented]);

  // Production requirement:
  // ONLY show when user is on the Desk Workspace UI (currentView === 'desk')
  // HIDE immediately if user enters any studio or opens any artifact modal
  const shouldShow = !hasConsented && currentView === 'desk' && !isAnyModalOpen;

  const handleAccept = (e) => {
    soundFX.playSnap();
    if (e?.clientX && e?.clientY) {
      triggerBurst(e.clientX, e.clientY);
    }
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, 'accepted');
    } catch (_) {}
    setHasConsented(true);
  };

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    soundFX.playPop();
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, 'accepted');
    } catch (_) {}
    setHasConsented(true);
  };

  const handleOpenPrivacy = (e) => {
    if (e) e.stopPropagation();
    soundFX.playPop();
    if (onOpenPrivacy) {
      onOpenPrivacy();
    } else {
      window.dispatchEvent(new CustomEvent('OPEN_LEGAL', { detail: { tab: 'privacy' } }));
    }
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.aside
          initial={{ opacity: 0, y: 35, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 w-[calc(100vw-1.5rem)] sm:w-[390px] max-w-full bg-[#F4F1EA] border-2 sm:border-[2.5px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] sm:shadow-[6px_6px_0px_#1A1A1A] p-3 sm:p-4 select-none overflow-hidden"
          role="region"
          aria-label="Cookie and Privacy Consent"
        >
          {/* Interactive Desk Lines Background Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
          />

          <div className="relative z-10 flex flex-col gap-2">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/20 pb-1.5">
              <div className="flex items-center gap-2">
                <img 
                  src="/assets/cookieSvg.svg" 
                  alt="Cookie Icon" 
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0" 
                />
                <h3 className="font-marker text-base sm:text-lg uppercase tracking-wider text-[#1A1A1A] leading-tight handwritten-text">
                  Crafter's Cookies
                </h3>
              </div>

              {/* X Close Button matching TornReceipt UI */}
              <button
                type="button"
                onClick={handleClose}
                className="cursor-pointer font-marker text-xl sm:text-2xl text-zinc-900 hover:text-markerRed transition-transform hover:scale-110 active:scale-95 px-1 leading-none opacity-80"
                aria-label="Close Cookie Notice"
              >
                X
              </button>
            </div>

            {/* Content Note */}
            <p className="font-mono text-[10px] sm:text-[11px] text-[#1A1A1A]/85 leading-relaxed">
              We use essential cookies &amp; local storage strictly to preserve your craft designs, photo crops, and sound preferences. Zero ad tracking scripts.
            </p>

            {/* Action Buttons in font-marker style */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleAccept}
                className="flex-1 bg-[#1A1A1A] text-[#FFEB3B] hover:bg-[#2A2A2A] font-marker text-sm sm:text-base py-1.5 sm:py-2 px-3.5 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] active:translate-y-[1px] transition-all uppercase tracking-wider cursor-pointer text-center handwritten-text"
              >
                Got It
              </button>

              <button
                type="button"
                onClick={handleOpenPrivacy}
                className="bg-white hover:bg-[#FAF7EE] text-[#1A1A1A] font-marker text-sm sm:text-base py-1.5 sm:py-2 px-3.5 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] active:translate-y-[1px] transition-all uppercase tracking-wider cursor-pointer text-center handwritten-text"
              >
                Privacy
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
