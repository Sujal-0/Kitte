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
  const [internalState, setInternalState] = useState({ ...state, isWebShare: true, isOpen: true });

  useEffect(() => {
    setInternalState({ ...state, isWebShare: true, isOpen: true });
  }, [state, isOpen]);

  if (!isOpen) return null;

  const handleEnvelopeClick = () => {
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
              {state.letterMode === 'someone-special' ? 'A Special Letter For You' : 'Archival Letter Preview'}
            </span>
            <span className="font-mono text-[8px] sm:text-[9px] text-[#FFEB3B] uppercase tracking-widest font-bold block truncate">
              READY TO READ • CLICK ENVELOPE TO TOGGLE
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
          
          {/* Interactive Envelope with Opening Animation */}
          <div className="relative z-30 scale-[0.48] xs:scale-[0.56] sm:scale-[0.76] md:scale-90 lg:scale-100 origin-center transition-transform touch-manipulation">
            <TimeLetterInteractiveEnvelope 
              state={internalState}
              isShowcase={false}
              isWebShare={true}
              onStartCustomizing={() => {}}
              onToggleOpen={handleEnvelopeClick}
            />
          </div>
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

          <button
            type="button"
            onClick={handleEnvelopeClick}
            className="bg-[#FFEB3B] text-[#1A1A1A] font-mono font-bold text-xs py-2 px-5 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#FFFFFF] hover:bg-yellow-300 transition-all uppercase cursor-pointer"
          >
            {internalState.isOpen ? 'Fold Letter' : 'Open Letter'}
          </button>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}
