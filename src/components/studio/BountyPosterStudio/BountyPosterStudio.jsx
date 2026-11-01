import React, { useState, useEffect, useCallback } from 'react';
import { UniversalStudioHeader } from '../UniversalStudioHeader';
import { BountyPosterControlPanel } from './BountyPosterControlPanel';
import { BountyPosterCanvasArea } from './BountyPosterCanvasArea';
import { AnimatePresence, motion } from 'framer-motion';
import { useIDBState } from '../../../hooks/useIDBState';
import { DEFAULT_BOUNTY_STATE } from '../../../features/bounty-poster/tokens/bountyTokens';
import { soundFX } from '../../../utils/audio';

export function BountyPosterStudio({ onExit }) {
  const [isShowcase, setIsShowcase, isLoadedShowcase] = useIDBState('bountyPosterShowcase', true);
  const [state, setState, isLoadedState] = useIDBState('bountyPosterState', DEFAULT_BOUNTY_STATE);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const isAllLoaded = isLoadedShowcase && isLoadedState;

  // Clean up any stale revoked blob: URLs saved in IndexedDB from previous browser sessions
  useEffect(() => {
    if (isAllLoaded && state?.imageSrc && typeof state.imageSrc === 'string' && state.imageSrc.startsWith('blob:')) {
      setState(prev => ({ ...prev, imageSrc: null }));
    }
  }, [isAllLoaded, state?.imageSrc, setState]);

  const handleUpdate = (key, value) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const handleStartCustomizing = () => {
    // Clear out showcase image and name so user starts clean with their own pirate design
    setState(prev => ({
      ...prev,
      imageSrc: null,
      name: '',
      bounty: '30,000,000',
      imageScale: 1.0,
      imageOffsetX: 0,
      imageOffsetY: 0,
      showPaperCreases: true,
    }));
    setIsShowcase(false);
  };

  const handleReset = () => {
    soundFX.playPop();
    setShowResetConfirm(true);
  };

  const confirmReset = useCallback(() => {
    soundFX.playSnap();
    setState(DEFAULT_BOUNTY_STATE);
    setIsShowcase(true);
    setShowResetConfirm(false);
  }, [setState, setIsShowcase]);

  // Keyboard shortcut listener: Enter to confirm reset, Escape to cancel
  useEffect(() => {
    if (!showResetConfirm) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirmReset();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowResetConfirm(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResetConfirm, confirmReset]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-screen h-screen flex flex-col bg-[#F4F1EA] overflow-hidden relative"
    >
      <UniversalStudioHeader 
        title="BOUNTY POSTER STUDIO" 
        description="World Government wanted poster generator with authentic typography. 300 DPI Export." 
        onBack={onExit}
      />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Left Control Panel */}
        <BountyPosterControlPanel 
          state={state} 
          onUpdate={handleUpdate} 
          onReset={handleReset}
          disabled={isShowcase}
          isShowcase={isShowcase}
        />

        {/* Right Canvas Area */}
        <BountyPosterCanvasArea 
          state={state} 
          onUpdate={handleUpdate} 
          isShowcase={isShowcase}
          onStartCustomizing={handleStartCustomizing}
        />
      </main>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#F4F1EA] border-[3px] border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] p-6 max-w-sm w-full flex flex-col gap-4 relative"
            >
              <div className="flex items-center gap-3 border-b-2 border-[#1A1A1A]/20 pb-3">
                <img src="/assets/alert.svg" alt="Warning" className="w-6 h-6" />
                <h2 className="font-marker text-2xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">
                  Reset Poster?
                </h2>
              </div>
              <p className="font-mono text-sm text-[#1A1A1A] leading-relaxed">
                Are you sure you want to discard your current design and restore the default Straw Hat Luffy wanted poster?
              </p>
              
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-white text-[#1A1A1A] font-mono font-bold uppercase py-2.5 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                >
                  Cancel (Esc)
                </button>
                <button
                  type="button"
                  onClick={confirmReset}
                  className="flex-1 bg-[#e51717] text-white font-mono font-bold uppercase py-2.5 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                >
                  Reset (Enter ↵)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
