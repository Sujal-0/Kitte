import React, { useState, useEffect, useCallback } from 'react';
import { UniversalStudioHeader } from '../UniversalStudioHeader';
import { TimeLetterControlPanel } from './TimeLetterControlPanel';
import { TimeLetterCanvasArea } from './TimeLetterCanvasArea';
import { TimeLetterEmailModal } from './TimeLetterEmailModal';
import { TimeLetterShareModal } from './TimeLetterShareModal';
import { parseLetterShareFromUrl } from '../../../features/time-letter/utils/timeLetterShare';
import { AnimatePresence, motion } from 'framer-motion';
import { useIDBState } from '../../../hooks/useIDBState';
import { DEFAULT_TIME_LETTER_STATE } from '../../../features/time-letter/tokens/timeLetterTokens';
import { soundFX } from '../../../utils/audio';

export function TimeLetterStudio({ onExit }) {
  const [activeSide, setActiveSide] = useState('front'); // 'front' = Envelope, 'back' = Letter
  const [isShowcase, setIsShowcase, isLoadedShowcase] = useIDBState('timeLetterShowcase', true);
  const [state, setState, isLoadedState] = useIDBState('timeLetterState', DEFAULT_TIME_LETTER_STATE);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalData, setEmailModalData] = useState(null);
  const [showSharePreview, setShowSharePreview] = useState(false);

  // If a shared letter URL was opened, load it automatically into recipient preview
  useEffect(() => {
    const sharedData = parseLetterShareFromUrl();
    if (sharedData) {
      setState(prev => ({ ...prev, ...sharedData }));
      setIsShowcase(false);
      setShowSharePreview(true);
    }
  }, []);

  const isAllLoaded = isLoadedShowcase && isLoadedState;

  const handleUpdate = (key, value) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const handleFlip = () => {
    setActiveSide(prev => prev === 'front' ? 'back' : 'front');
  };

  const handleStartCustomizing = () => {
    soundFX.playPop();
    setState(prev => ({
      ...prev,
      recipient: '',
      salutation: '',
      recipientEmail: '',
      location: '',
      author: '',
      letterBody: '',
      signOff: '',
      envelopeNoticeText: '',
      isOpen: true
    }));
    setIsShowcase(false);
  };

  // If user is customizing, ensure stale showcase dummy text doesn't linger
  useEffect(() => {
    if (isAllLoaded && !isShowcase) {
      const SHOWCASE_EMAIL = 'future.me@kitte.studio';
      const SHOWCASE_LOCATION = 'KYOTO, JAPAN';
      const SHOWCASE_AUTHOR = 'Past You';
      const SHOWCASE_RECIPIENT = 'Future Me';
      const SHOWCASE_SALUTATION = 'Dear Future Me,';
      const SHOWCASE_SIGNOFF = 'With love & patience,';
      const SHOWCASE_BODY_START = 'I hope when you open this';

      const updates = {};
      if (state.recipientEmail === SHOWCASE_EMAIL) updates.recipientEmail = '';
      if (state.location === SHOWCASE_LOCATION) updates.location = '';
      if (state.author === SHOWCASE_AUTHOR) updates.author = '';
      if (state.recipient === SHOWCASE_RECIPIENT) updates.recipient = '';
      if (state.salutation === SHOWCASE_SALUTATION) updates.salutation = '';
      if (state.signOff === SHOWCASE_SIGNOFF) updates.signOff = '';
      if (state.letterBody && state.letterBody.startsWith(SHOWCASE_BODY_START)) updates.letterBody = '';

      if (Object.keys(updates).length > 0) {
        setState(prev => ({ ...prev, ...updates }));
      }
    }
  }, [isAllLoaded, isShowcase, state?.recipientEmail, state?.location, state?.author, state?.recipient, state?.salutation, state?.signOff, state?.letterBody, setState]);

  // When in showcase mode, ensure envelope always starts sealed closed
  useEffect(() => {
    if (isAllLoaded && isShowcase && state?.isOpen) {
      setState(prev => ({ ...prev, isOpen: false }));
    }
  }, [isAllLoaded, isShowcase, state?.isOpen, setState]);

  const handleReset = () => {
    soundFX.playPop();
    setShowResetConfirm(true);
  };

  const confirmReset = useCallback(() => {
    soundFX.playSnap();
    setState(DEFAULT_TIME_LETTER_STATE);
    setIsShowcase(true);
    setActiveSide('front');
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

  // Listen for share/email modal events dispatched from Export Lab
  useEffect(() => {
    const handleOpenShare = () => setShowSharePreview(true);
    const handleOpenEmail = (e) => {
      if (e?.detail) {
        setEmailModalData(e.detail);
      }
      setShowEmailModal(true);
    };
    window.addEventListener('OPEN_SHARE_PREVIEW', handleOpenShare);
    window.addEventListener('OPEN_EMAIL_DISPATCH', handleOpenEmail);
    return () => {
      window.removeEventListener('OPEN_SHARE_PREVIEW', handleOpenShare);
      window.removeEventListener('OPEN_EMAIL_DISPATCH', handleOpenEmail);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-screen h-screen flex flex-col bg-[#F4F1EA] overflow-hidden relative"
    >
      <UniversalStudioHeader 
        title="TIME CAPSULE STUDIO" 
        description="Write a letter to your future self. Authentic airmail envelopes, wax seals, and 300 DPI craft sheets." 
        onBack={onExit}
      />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Left Control Panel */}
        <TimeLetterControlPanel 
          activeSide={activeSide}
          onFlip={handleFlip}
          state={state} 
          onUpdate={handleUpdate} 
          onReset={handleReset}
          disabled={isShowcase}
          isShowcase={isShowcase}
        />

        {/* Right Canvas Area */}
        <TimeLetterCanvasArea 
          state={state} 
          activeSide={activeSide}
          onFlip={handleFlip}
          onUpdate={handleUpdate} 
          isShowcase={isShowcase}
          onStartCustomizing={handleStartCustomizing}
        />
      </main>

      {/* Recipient Live Animated Letter Preview Modal */}
      <TimeLetterShareModal
        isOpen={showSharePreview}
        onClose={() => setShowSharePreview(false)}
        state={state}
      />

      {/* FutureMe Digital Delivery Dispatch Modal (Root Viewport Level) */}
      <TimeLetterEmailModal
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          setEmailModalData(null);
        }}
        state={emailModalData || state}
        onUpdateState={handleUpdate}
        isShowcase={isShowcase}
      />

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
                  Reset Letter?
                </h2>
              </div>
              <p className="font-mono text-xs sm:text-sm text-[#1A1A1A] leading-relaxed">
                Are you sure you want to discard your draft and restore the default archival showcase letter?
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
