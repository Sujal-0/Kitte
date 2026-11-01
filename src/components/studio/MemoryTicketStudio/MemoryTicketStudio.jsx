import React, { useState, useEffect, useCallback } from 'react';
import { UniversalStudioHeader } from '../UniversalStudioHeader';
import { ControlPanel } from './ControlPanel';
import { CanvasArea } from './CanvasArea';
import { AnimatePresence, motion } from 'framer-motion';
import { useIDBState } from '../../../hooks/useIDBState';

export function MemoryTicketStudio({ onExit }) {
  const [activeSide, setActiveSide] = useState('front'); // 'front' or 'back'
  const [isShowcase, setIsShowcase, isLoadedShowcase] = useIDBState('memoryTicketShowcase', true);

  // Global ticket settings
  const [ticketState, setTicketState, isLoadedTicket] = useIDBState('memoryTicketState', {
    shape: 'notch', // notch, zigzag, cinema, minimal
    color: '#ffffff', // paper color
    layout: 'horizontal', // horizontal, vertical
    border: 'thick', // thick, thin, none
    fontFamily: 'font-marker', // multiple fonts
    // Front specific
    imageSrc: '/assets/ghibliparkIMG.webp',
    imagePadding: 8, // New padding property
    location: 'Ghibli Park',
    date: '02/10/2026',
    // Back specific
    barcodeType: 'CODE128',
    barcodeValue: 'KITTE-99321',
    note: 'A magical afternoon exploring the Grand Warehouse...',
    signature: 'Sujal',
    showLogo: true,
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const isAllLoaded = isLoadedShowcase && isLoadedTicket;

  // Clean up any stale revoked blob: URLs saved in IndexedDB from previous browser sessions
  useEffect(() => {
    if (isAllLoaded && ticketState?.imageSrc && typeof ticketState.imageSrc === 'string' && ticketState.imageSrc.startsWith('blob:')) {
      setTicketState(prev => ({ ...prev, imageSrc: null }));
    }
  }, [isAllLoaded, ticketState?.imageSrc, setTicketState]);

  const confirmReset = useCallback(() => {
    // Restore showcase state
    setTicketState({
      shape: 'notch', // notch, zigzag, cinema, minimal
      color: '#ffffff', // paper color
      layout: 'horizontal', // horizontal, vertical
      border: 'thick', // thick, thin, none
      fontFamily: 'font-marker', // multiple fonts
      imageSrc: '/assets/ghibliparkIMG.webp',
      imagePadding: 8,
      location: 'Ghibli Park',
      date: '02/10/2026',
      barcodeType: 'CODE128',
      barcodeValue: 'KITTE-99321',
      note: 'A magical afternoon exploring the Grand Warehouse...',
      signature: 'Sujal',
      showLogo: true,
    });
    setIsShowcase(true);
    setActiveSide('front');
    setShowResetConfirm(false);
  }, [setTicketState, setIsShowcase]);

  // Keyboard shortcut support: Enter to confirm reset, Escape to cancel
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

  if (!isAllLoaded) return null;

  const handleUpdate = (key, value) => {
    setTicketState(prev => ({ ...prev, [key]: value }));
  };

  const handleFlip = () => {
    setActiveSide(prev => prev === 'front' ? 'back' : 'front');
  };

  const handleStartCustomizing = () => {
    // Clear out the showcase data
    setTicketState(prev => ({
      ...prev,
      imageSrc: null,
      location: '',
      date: '',
      note: '',
      signature: '',
    }));
    setIsShowcase(false);
  };
  const handleReset = () => {
    setShowResetConfirm(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-screen h-screen flex flex-col bg-[#F4F1EA] overflow-hidden relative"
    >
      <UniversalStudioHeader 
        title="MEMORY TICKET STUB" 
        description="Physical-grade analog memory artifact generator. 300 DPI Export." 
        onBack={onExit}
      />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Left Control Panel */}
        <ControlPanel 
          activeSide={activeSide} 
          ticketState={ticketState} 
          onUpdate={handleUpdate} 
          onFlip={handleFlip}
          onReset={handleReset}
          disabled={isShowcase}
        />

        {/* Right Canvas Area */}
        <CanvasArea 
          activeSide={activeSide} 
          ticketState={ticketState} 
          onUpdate={handleUpdate}
          onFlip={handleFlip}
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
                <h2 className="font-marker text-2xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">Reset Ticket?</h2>
              </div>
              <p className="font-mono text-sm text-[#1A1A1A] leading-relaxed">
                Are you sure you want to discard your current design and restore the default preview? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-white text-[#1A1A1A] font-mono font-bold uppercase py-2.5 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                >
                  Cancel
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
