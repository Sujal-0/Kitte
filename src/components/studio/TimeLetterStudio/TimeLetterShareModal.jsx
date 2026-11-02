import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isLetterLocked, getRemainingLockTime } from '../../../features/time-letter/utils/timeLetterShare';
import { TimeLetterInteractiveEnvelope } from './TimeLetterInteractiveEnvelope';
import { soundFX } from '../../../utils/audio';

export function TimeLetterShareModal({
  isOpen,
  onClose,
  state
}) {
  const [internalState, setInternalState] = useState({ ...state, isOpen: false });
  const [countdown, setCountdown] = useState(getRemainingLockTime(state?.deliveryDate));
  const [showLockedToast, setShowLockedToast] = useState(false);
  const [simulatedTimeWarp, setSimulatedTimeWarp] = useState(false);

  const isOriginallyLocked = isLetterLocked(state);
  const isLocked = isOriginallyLocked && !simulatedTimeWarp;

  useEffect(() => {
    setInternalState({ ...state, isOpen: false });
  }, [state, isOpen]);

  // Live countdown timer interval
  useEffect(() => {
    if (!isOpen || !isLocked) return;
    const interval = setInterval(() => {
      setCountdown(getRemainingLockTime(state?.deliveryDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isLocked, state?.deliveryDate]);

  if (!isOpen) return null;

  const handleEnvelopeClick = () => {
    if (isLocked) {
      soundFX.playSnap();
      setShowLockedToast(true);
      setTimeout(() => setShowLockedToast(false), 3000);
      return;
    }
    soundFX.playPop();
    setInternalState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-[#1A1A1A]/90 backdrop-blur-md select-none overflow-hidden"
      >
        {/* Top Floating Header */}
        <header className="absolute top-3 left-3 right-3 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-50 gap-2">
          <div className="min-w-0 flex-1">
            <span className="font-marker text-lg sm:text-2xl text-[#F4F1EA] uppercase tracking-wider block handwritten-text truncate">
              {state.letterMode === 'someone-special' ? 'A Special Letter For You' : 'Time Capsule Dispatch'}
            </span>
            <span className="font-mono text-[8px] sm:text-[9px] text-[#FFEB3B] uppercase tracking-widest font-bold block truncate">
              {isLocked ? 'ARCHIVAL VAULT • LOCKED' : (simulatedTimeWarp ? 'TIME WARP: 10 YEARS LATER' : 'READY TO READ')}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isOriginallyLocked && (
              <button
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  setSimulatedTimeWarp(prev => !prev);
                  setInternalState(prev => ({ ...prev, isOpen: false }));
                }}
                className="bg-[#FFEB3B] text-[#1A1A1A] font-mono text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 border-2 border-[#1A1A1A] shadow-[1px_1px_0px_#FFFFFF] sm:shadow-[2px_2px_0px_#FFFFFF] hover:bg-yellow-300 transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap"
              >
                <span>{simulatedTimeWarp ? 'View as Today' : 'Fast-Forward'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#F4F1EA] text-[#1A1A1A] font-marker text-xl sm:text-2xl flex items-center justify-center border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#FFFFFF] sm:shadow-[3px_3px_0px_#FFFFFF] hover:bg-[#FF4D4D] hover:text-white transition-all cursor-pointer shrink-0"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* Center Stage: The Ambient Cutting Desk & Envelope */}
        <div className="relative w-full max-w-4xl h-[520px] sm:h-[650px] flex flex-col items-center justify-center px-2">
          
          {/* Status Badge & Countdown Banner */}
          <div className="mb-3 sm:mb-6 flex flex-col items-center gap-1.5 sm:gap-2 z-40">
            {isLocked ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#FFF9C4] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[4px_4px_0px_#1A1A1A] px-3 sm:px-5 py-1.5 sm:py-3 flex flex-col items-center text-center max-w-xs sm:max-w-md mx-2"
              >
                <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                  <span className="font-mono font-bold text-[9px] sm:text-xs uppercase tracking-wider text-[#B91C1C]">
                    LOCKED UNTIL {state.deliveryDate || 'OCT 26, 2036'}
                  </span>
                </div>
                <div className="font-mono text-xs sm:text-base font-extrabold text-[#1A1A1A] tracking-wider">
                  {countdown.formatted}
                </div>
                <span className="font-mono text-[8px] sm:text-[9px] text-[#1A1A1A]/70 mt-0.5 sm:mt-1">
                  Written on {state.sendDate || 'Today'} by {state.author || 'Past You'}. Sealed until the target date!
                </span>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#FFEB3B] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[4px_4px_0px_#1A1A1A] px-4 sm:px-6 py-1.5 sm:py-2.5 flex items-center gap-2 sm:gap-3 cursor-pointer mx-2"
                onClick={handleEnvelopeClick}
              >
                <span className="font-marker text-xs sm:text-lg text-[#1A1A1A] uppercase tracking-wide handwritten-text text-center">
                  {internalState.isOpen ? 'Click envelope to fold & seal' : (simulatedTimeWarp ? 'Vault Unlocked: Click to read letter' : 'Click envelope to unseal & read letter')}
                </span>
              </motion.div>
            )}
          </div>

          {/* Interactive Envelope with Opening Animation */}
          <div className="relative z-30 scale-[0.48] xs:scale-[0.56] sm:scale-[0.76] md:scale-90 lg:scale-100 origin-center transition-transform touch-manipulation">
            <TimeLetterInteractiveEnvelope 
              state={internalState}
              isShowcase={false}
              onStartCustomizing={() => {}}
              onToggleOpen={handleEnvelopeClick}
            />
          </div>

          {/* Locked Toast Notification (if user clicks while locked) */}
          <AnimatePresence>
            {showLockedToast && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute bottom-16 bg-[#B91C1C] text-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#FFFFFF] px-4 sm:px-5 py-2 sm:py-2.5 font-mono text-[10px] sm:text-xs font-bold tracking-wide z-50 flex items-center gap-2 max-w-sm sm:max-w-md text-center mx-2"
              >
                <span>Patience! This Time Capsule is strictly confidential until {state.deliveryDate}.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Action Footer */}
        <footer className="absolute bottom-6 flex items-center gap-4 z-50">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#F4F1EA] text-[#1A1A1A] font-mono font-bold text-xs py-2 px-5 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#FFFFFF] hover:bg-white transition-all uppercase cursor-pointer"
          >
            ← Back to Studio Editor
          </button>

          {!isLocked && (
            <button
              type="button"
              onClick={handleEnvelopeClick}
              className="bg-[#FFEB3B] text-[#1A1A1A] font-mono font-bold text-xs py-2 px-5 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#FFFFFF] hover:bg-yellow-300 transition-all uppercase cursor-pointer"
            >
              {internalState.isOpen ? 'Seal Envelope' : 'Open Envelope'}
            </button>
          )}
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}
