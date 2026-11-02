import React, { useState, useEffect, useCallback } from 'react';
import { UniversalStudioHeader } from '../UniversalStudioHeader';
import { BountyPosterControlPanel } from './BountyPosterControlPanel';
import { BountyPosterCanvasArea } from './BountyPosterCanvasArea';
import { MobileStudioDrawer } from '../MobileStudioDrawer';
import { AnimatePresence, motion } from 'framer-motion';
import { useIDBState } from '../../../hooks/useIDBState';
import { DEFAULT_BOUNTY_STATE } from '../../../features/bounty-poster/tokens/bountyTokens';
import { soundFX } from '../../../utils/audio';

export function BountyPosterStudio({ onExit }) {
  const [isShowcase, setIsShowcase, isLoadedShowcase] = useIDBState('bountyPosterShowcase', true);
  const [state, setState, isLoadedState] = useIDBState('bountyPosterState', DEFAULT_BOUNTY_STATE);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    setIsDrawerOpen(true);
  };

  const handleReset = () => {
    soundFX.playPop();
    setShowResetConfirm(true);
  };

  const isExportReady = Boolean(state?.imageSrc) && Boolean(state?.name?.trim());

  const handleExport = () => {
    if (!isExportReady) return;
    soundFX.playSnap();
    window.dispatchEvent(new CustomEvent('OPEN_EXPORT', {
      detail: {
        type: 'Bounty Poster',
        data: {
          ...state,
          isShowcase: !!isShowcase,
        }
      }
    }));
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
        title="BOUNTY POSTER" 
        description="World Government wanted poster generator with authentic typography. 300 DPI Export." 
        onBack={onExit}
        onReset={handleReset}
        onExport={handleExport}
        isExportReady={isExportReady}
      />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Desktop Left Control Panel */}
        <div className="hidden lg:flex h-full shrink-0">
          <BountyPosterControlPanel 
            state={state} 
            onUpdate={handleUpdate} 
            onReset={handleReset}
            disabled={isShowcase}
            isShowcase={isShowcase}
          />
        </div>

        {/* Center/Full Canvas Area */}
        <div className="flex-1 w-full h-full min-h-0 relative">
          <BountyPosterCanvasArea 
            state={state} 
            onUpdate={handleUpdate} 
            isShowcase={isShowcase}
            onStartCustomizing={() => {
              handleStartCustomizing();
              setIsDrawerOpen(true);
            }}
          />
        </div>

        {/* Mobile Responsive Bottom Drawer Sheet */}
        <div className="lg:hidden">
          <MobileStudioDrawer
            isOpen={isDrawerOpen}
            onOpen={() => setIsDrawerOpen(true)}
            onClose={() => setIsDrawerOpen(false)}
          >
            <BountyPosterControlPanel 
              state={state} 
              onUpdate={handleUpdate} 
              onReset={handleReset}
              disabled={isShowcase}
              isShowcase={isShowcase}
              isMobileDrawer={true}
            />
          </MobileStudioDrawer>
        </div>
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
              className="bg-[#F4F1EA] border-[3px] border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] p-4 sm:p-6 max-w-sm w-full flex flex-col gap-3 sm:gap-4 relative"
            >
              <div className="flex items-center gap-3 border-b-2 border-[#1A1A1A]/20 pb-2.5 sm:pb-3">
                <img src="/assets/alert.svg" alt="Warning" className="w-5 h-5 sm:w-6 sm:h-6" />
                <h2 className="font-marker text-xl sm:text-2xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">
                  Reset Poster?
                </h2>
              </div>
              <p className="font-mono text-xs sm:text-sm text-[#1A1A1A] leading-relaxed">
                Are you sure you want to discard your current design and restore the default Straw Hat Luffy wanted poster?
              </p>
              
              <div className="flex gap-2 sm:gap-3 mt-1 sm:mt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-white text-[#1A1A1A] font-mono font-bold uppercase py-1.5 sm:py-2.5 px-2 sm:px-3 text-xs sm:text-sm border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                >
                  <span className="sm:hidden">Cancel</span>
                  <span className="hidden sm:inline">Cancel (Esc)</span>
                </button>
                <button
                  type="button"
                  onClick={confirmReset}
                  className="flex-1 bg-[#e51717] text-white font-mono font-bold uppercase py-1.5 sm:py-2.5 px-2 sm:px-3 text-xs sm:text-sm border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                >
                  <span className="sm:hidden">Reset</span>
                  <span className="hidden sm:inline">Reset (Enter ↵)</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
