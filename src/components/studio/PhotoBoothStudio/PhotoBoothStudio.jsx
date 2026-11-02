import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UniversalStudioHeader } from '../UniversalStudioHeader';
import { PhotoBoothControlPanel } from './PhotoBoothControlPanel';
import { PhotoBoothCanvasArea } from './PhotoBoothCanvasArea';
import { MobileStudioDrawer } from '../MobileStudioDrawer';
import { useIDBState } from '../../../hooks/useIDBState';
import { PHOTO_BOOTH_TOKENS } from '../../../features/photobooth/tokens/photoBoothTokens';
import { playClick, playScribble, soundFX } from '../../../utils/audio';

export function PhotoBoothStudio({ onExit }) {
  const [stripState, setStripState, isLoadedState] = useIDBState(
    'kitte_photobooth_state',
    PHOTO_BOOTH_TOKENS.showcaseDefaults
  );

  const [isShowcase, setIsShowcase, isLoadedShowcase] = useIDBState(
    'kitte_photobooth_isShowcase',
    true
  );

  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Update specific top-level state key
  const handleUpdateState = (key, value) => {
    playClick();
    if (isShowcase) setIsShowcase(false);
    setStripState(prev => ({ ...prev, [key]: value }));
  };

  // Update specific photo slot
  const handleUpdatePhotoSlot = (index, updates) => {
    playScribble();
    if (isShowcase) setIsShowcase(false);
    setStripState(prev => {
      const photos = [...(prev.photos || PHOTO_BOOTH_TOKENS.showcaseDefaults.photos)];
      photos[index] = { ...photos[index], ...updates };
      return { ...prev, photos };
    });
  };

  // Start personal editing - fades showcase and empties content for user's own creation
  const handleStartCustomizing = () => {
    playClick();
    setIsShowcase(false);
    setStripState(prev => ({
      ...prev,
      caption: '',
      photos: [
        { id: 1, src: null, scale: 1, offsetX: 0, offsetY: 0, rotation: 0 },
        { id: 2, src: null, scale: 1, offsetX: 0, offsetY: 0, rotation: 0 },
        { id: 3, src: null, scale: 1, offsetX: 0, offsetY: 0, rotation: 0 },
        { id: 4, src: null, scale: 1, offsetX: 0, offsetY: 0, rotation: 0 },
      ],
    }));
    setActiveSlotIndex(0);
  };

  // Reset confirmation
  const handleReset = () => {
    playClick();
    setShowResetConfirm(true);
  };

  const confirmReset = useCallback(() => {
    playClick();
    setStripState(PHOTO_BOOTH_TOKENS.showcaseDefaults);
    setIsShowcase(true);
    setActiveSlotIndex(0);
    setShowResetConfirm(false);
  }, [setStripState, setIsShowcase]);

  // Export Readiness
  const photoCount = stripState?.photoCount || 4;
  const photos = stripState?.photos || PHOTO_BOOTH_TOKENS.showcaseDefaults.photos;
  const activePhotos = photos.slice(0, photoCount);
  const uploadedCount = activePhotos.filter(p => !!p.src).length;
  const isExportReady = !isShowcase && (uploadedCount === photoCount);

  const handleExport = () => {
    if (!isExportReady) return;
    soundFX.playSnap();
    window.dispatchEvent(new CustomEvent('OPEN_EXPORT', {
      detail: {
        type: 'Photo Booth',
        data: {
          ...stripState,
          isShowcase: !!isShowcase,
        }
      }
    }));
  };

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

  const isAllLoaded = isLoadedState && isLoadedShowcase;
  if (!isAllLoaded) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-screen h-screen flex flex-col bg-[#F4F1EA] overflow-hidden relative"
    >
      <UniversalStudioHeader
        title="PHOTO BOOTH STUDIO"
        description="Instant vintage photostrip creator. 300 DPI Export."
        onBack={onExit}
        onReset={handleReset}
        onExport={handleExport}
        isExportReady={isExportReady}
        canReset={!isShowcase}
      />

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Desktop Left Control Panel */}
        <div className="hidden lg:flex h-full shrink-0">
          <PhotoBoothControlPanel
            state={stripState}
            activeSlotIndex={activeSlotIndex}
            onSelectSlot={(idx) => setActiveSlotIndex(idx)}
            onUpdateState={handleUpdateState}
            onUpdatePhotoSlot={handleUpdatePhotoSlot}
            onReset={handleReset}
            disabled={isShowcase}
            isShowcase={isShowcase}
          />
        </div>

        {/* Center/Full Canvas Area */}
        <div className="flex-1 w-full h-full min-h-0 relative">
          <PhotoBoothCanvasArea
            state={stripState}
            activeSlotIndex={activeSlotIndex}
            onSelectSlot={(idx) => setActiveSlotIndex(idx)}
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
            <PhotoBoothControlPanel
              state={stripState}
              activeSlotIndex={activeSlotIndex}
              onSelectSlot={(idx) => setActiveSlotIndex(idx)}
              onUpdateState={handleUpdateState}
              onUpdatePhotoSlot={handleUpdatePhotoSlot}
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
                <h2 className="font-marker text-xl sm:text-2xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">Reset Photostrip?</h2>
              </div>
              <p className="font-mono text-xs sm:text-sm text-[#1A1A1A] leading-relaxed">
                Are you sure you want to discard your current design and restore the default preview? This action cannot be undone.
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
