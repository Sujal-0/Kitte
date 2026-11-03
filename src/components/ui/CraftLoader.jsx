import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SCENARIOS = {
  'export-pdf': {
    kanji: '印刷中',
    tag: 'PRINTING CRAFT SHEET',
    messages: [
      'Your keepsake is getting ready...',
      'Drafting 300 DPI archival craft sheet...',
      'Inking origami cutting and fold guides...',
      'Calibrating print margins and bleed...',
      'Your physical keepsake is almost ready!'
    ]
  },
  'export-png': {
    kanji: '現像中',
    tag: 'DEVELOPING HIGH-RES IMAGE',
    messages: [
      'Your craft piece is developing...',
      'Rendering authentic paper textures...',
      'Inking nostalgic halftones...',
      'Sharpening stamp details...',
      'Ready to download in a moment!'
    ]
  },
  'vaulting': {
    kanji: '封印中',
    tag: 'SEALING ARCHIVAL TIME VAULT',
    messages: [
      'Sealing into the time capsule archive...',
      'Generating 300 DPI printable attachments...',
      'Securing scheduled delivery destination...',
      'Locking vault until maturation date...',
      'Keepsake safely vaulted!'
    ]
  },
  'preloader': {
    kanji: '切手',
    tag: 'INITIALIZING KITTE WORKSHOP',
    messages: [
      'Setting up your analog craft desk...',
      'Warming up print plates...',
      'Preparing artisanal studios...'
    ]
  }
};

export function CraftLoader({ 
  isOpen, 
  scenario = 'export-pdf',
  customTitle,
  customSubtitle 
}) {
  const currentScenario = SCENARIOS[scenario] || SCENARIOS['export-pdf'];
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle through contextual status variation messages
  useEffect(() => {
    if (!isOpen) {
      setMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % currentScenario.messages.length);
    }, 1400);

    return () => clearInterval(interval);
  }, [isOpen, currentScenario]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="craft-loader-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 select-none cursor-wait"
        >
          <motion.div
            initial={{ scale: 0.9, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="bg-[#F4F1EA] border-2 sm:border-[3px] border-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A] p-5 sm:p-7 max-w-sm w-full flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* Circular Crest Badge with Japanese Typography & Rotating Dotted Perforations */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center my-2">
              {/* Outer Rotating Dotted Stamp Perforations */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-[2.5px] border-dashed border-[#1A1A1A]/50 pointer-events-none"
              />

              {/* Inner Crest Stamp */}
              <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full border-[3px] border-[#1A1A1A] bg-[#FAF7EE] flex items-center justify-center shadow-[3px_3px_0px_#1A1A1A] relative z-10">
                <span 
                  className="font-marker font-black text-3xl sm:text-4xl text-[#1A1A1A] select-none tracking-tight pt-1" 
                  style={{ WebkitTextStroke: '1.5px #1A1A1A' }}
                >
                  {currentScenario.kanji}
                </span>
              </div>
            </div>

            {/* Header Scenario Tag */}
            <div className="mt-2.5">
              <span className="font-mono text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-[#B91C1C] bg-[#FFF5F5] px-2 py-0.5 border border-[#B91C1C] inline-block shadow-[1px_1px_0px_#B91C1C]">
                {customTitle || currentScenario.tag}
              </span>
            </div>

            {/* Dynamic Contextual Variation Message */}
            <div className="h-10 flex items-center justify-center mt-2.5">
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="font-marker text-sm sm:text-base text-[#1A1A1A] leading-snug px-2 handwritten-text"
                >
                  {customSubtitle || currentScenario.messages[messageIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Brutalist Wobbly Progress Indicator */}
            <div className="w-full bg-[#1A1A1A]/10 border border-[#1A1A1A] h-2 rounded-none mt-3 overflow-hidden relative">
              <motion.div
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  ease: 'easeInOut'
                }}
                className="w-1/2 h-full bg-[#1A1A1A]"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
