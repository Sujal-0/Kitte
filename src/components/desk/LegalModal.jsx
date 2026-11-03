import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { soundFX } from '../../utils/audio';

const PRIVACY_PAGES = [
  {
    tag: 'Zero Tracker Architecture',
    highlightClass: 'bg-postitYellow text-pencil',
    title: 'Zero Data Harvesting',
    paragraphs: [
      'Kitte is built on a strict zero-surveillance philosophy. We do not sell, rent, or monetize your personal data, and we do not embed third-party advertising tracking scripts.',
      'All creative designs, photo crops, and studio configurations reside securely in your browser local storage.'
    ]
  },
  {
    tag: 'Archival Time Vault',
    highlightClass: 'bg-[#FFF5F5] text-markerRed border border-markerRed',
    title: 'Time Capsule Privacy',
    paragraphs: [
      'When you vault a FutureMe time letter, we store solely the destination email and target delivery date to schedule dispatch.',
      'Upon delivery date maturation and inbox dispatch, the letter record is marked fulfilled and safely archived.'
    ]
  },
  {
    tag: 'User Rights & Contact',
    highlightClass: 'bg-postitYellow text-pencil',
    title: 'Your Data, Your Control',
    paragraphs: [
      'You hold full sovereignty over your memory archives. To request cancellation or complete deletion of any scheduled letter before its delivery date, contact kitte.archive@gmail.com.',
      'You can reset all local craft states anytime by clearing your browser cache.'
    ]
  }
];

const TERMS_PAGES = [
  {
    tag: 'Creator IP Ownership',
    highlightClass: 'bg-postitYellow text-pencil',
    title: '100% Your Creation',
    paragraphs: [
      'You retain full, exclusive ownership of all photos, written letters, ticket memories, and printable documents you design on Kitte.',
      'Kitte claims zero copyright or licensing claims over the physical or digital keepsakes you generate.'
    ]
  },
  {
    tag: 'Service Disclaimer',
    highlightClass: 'bg-[#FFF5F5] text-markerRed border border-markerRed',
    title: 'Best-Effort Archival Service',
    paragraphs: [
      'Digital time capsule dispatch is provided free of charge as a best-effort nostalgic service.',
      'For permanent generational keepsakes, we strongly encourage downloading and physically printing your 300 DPI high-resolution craft sheets.'
    ]
  },
  {
    tag: 'Community & Use',
    highlightClass: 'bg-postitYellow text-pencil',
    title: 'Respectful Craft Use',
    paragraphs: [
      'Kitte is designed for personal memory preservation, sentimental correspondence, and papercrafting.',
      'Automated spamming, harassing letters, or malicious usage of our delivery endpoints is strictly prohibited.'
    ]
  }
];

export function LegalModal({ isOpen, onClose, initialTab = 'privacy' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'privacy' | 'terms'
  const [page, setPage] = useState(0);
  const lastScroll = useRef(0);
  const touchStartY = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setPage(0);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const currentPages = activeTab === 'privacy' ? PRIVACY_PAGES : TERMS_PAGES;
  const maxPages = currentPages.length;

  const handleNextPage = (e) => {
    if (e) e.stopPropagation();
    soundFX.playPop();
    setPage((prev) => (prev < maxPages - 1 ? prev + 1 : 0));
  };

  const handlePrevPage = (e) => {
    if (e) e.stopPropagation();
    soundFX.playPop();
    setPage((prev) => (prev > 0 ? prev - 1 : maxPages - 1));
  };

  const handleTabChange = (tab, e) => {
    if (e) e.stopPropagation();
    soundFX.playPop();
    setActiveTab(tab);
    setPage(0);
  };

  const handleWheel = (e) => {
    const now = Date.now();
    if (now - lastScroll.current < 1200) return;
    lastScroll.current = now;

    if (e.deltaY > 20) handleNextPage(e);
    else if (e.deltaY < -20) handlePrevPage(e);
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="legal-modal-overlay"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-6 cursor-pointer select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative flex items-center justify-center cursor-auto select-none"
            style={{
              width: 'min(94vw, 640px, calc(82vh * 578 / 432))',
              height: 'min(calc(94vw * 432 / 578), calc(640px * 432 / 578), 82vh)',
              aspectRatio: '578 / 432'
            }}
            initial={{ y: 30, scale: 0.95, rotateZ: 1 }}
            animate={{ y: 0, scale: 1, rotateZ: 0 }}
            exit={{ y: 30, scale: 0.95, rotateZ: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Blank Paper Background (Matching CrafterNotes) */}
            <img
              src="/assets/notesAbout_blank.webp"
              alt="Legal Notes Paper"
              className="w-full h-full object-contain drop-shadow-2xl pointer-events-none select-none z-10 block"
            />

            {/* Close Button */}
            <button
              type="button"
              className="absolute top-[15%] right-[13%] z-30 cursor-pointer font-marker text-2xl sm:text-3xl text-pencil hover:text-markerRed transition-transform hover:scale-110 active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                soundFX.playPop();
                onClose();
              }}
              aria-label="Close Legal Document"
            >
              X
            </button>

            {/* Tab Selector Header (Rotated with the paper) */}
            <div
              className="absolute top-[18%] left-[17%] right-[22%] z-30 flex items-center gap-2 font-mono text-[9px] sm:text-[11px] md:text-xs font-bold uppercase"
              style={{ transform: 'rotate(-2.8deg)' }}
            >
              <button
                type="button"
                onClick={(e) => handleTabChange('privacy', e)}
                className={`px-2 py-0.5 border border-[#1A1A1A] transition-all cursor-pointer ${
                  activeTab === 'privacy'
                    ? 'bg-[#1A1A1A] text-[#FFEB3B] shadow-[1px_1px_0px_#1A1A1A]'
                    : 'bg-[#FAF7EE] text-[#1A1A1A]/70 hover:bg-white'
                }`}
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={(e) => handleTabChange('terms', e)}
                className={`px-2 py-0.5 border border-[#1A1A1A] transition-all cursor-pointer ${
                  activeTab === 'terms'
                    ? 'bg-[#1A1A1A] text-[#FFEB3B] shadow-[1px_1px_0px_#1A1A1A]'
                    : 'bg-[#FAF7EE] text-[#1A1A1A]/70 hover:bg-white'
                }`}
              >
                Terms &amp; Conditions
              </button>
            </div>

            {/* Interactive Content Zone (Swipe, Tap, Wheel) */}
            <div
              className="absolute top-[28%] bottom-[17%] left-[17%] right-[17%] flex flex-col justify-between z-20 font-marker text-pencil cursor-pointer"
              style={{ transform: 'rotate(-2.8deg)' }}
              onClick={handleNextPage}
              onWheel={handleWheel}
              onTouchStart={(e) => {
                touchStartY.current = e.touches[0].clientY;
              }}
              onTouchEnd={(e) => {
                if (touchStartY.current === null) return;
                const touchEndY = e.changedTouches[0].clientY;
                const delta = touchStartY.current - touchEndY;
                if (delta > 35) handleNextPage(e);
                else if (delta < -35) handlePrevPage(e);
                touchStartY.current = null;
              }}
            >
              <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeTab}-page-${page}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="text-[11px] sm:text-sm md:text-lg lg:text-xl leading-snug flex flex-col gap-1 sm:gap-2"
                  >
                    <div>
                      <span className={`${currentPages[page].highlightClass} px-1.5 py-0.5 -rotate-1 inline-block text-[10px] sm:text-xs md:text-sm uppercase font-bold tracking-wider`}>
                        {currentPages[page].tag}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs sm:text-base md:text-xl text-[#1A1A1A] mt-0.5">
                      {currentPages[page].title}
                    </h4>

                    {currentPages[page].paragraphs.map((p, idx) => (
                      <p key={idx} className="opacity-95 text-[#1A1A1A]/90">
                        {p}
                      </p>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation hint and dots */}
              <div className="flex items-center justify-between text-pencil/60 text-[8px] sm:text-[10px] md:text-xs font-mono font-bold tracking-wider pointer-events-none pb-1 pt-1 border-t border-pencil/15">
                <div className="flex items-center gap-1">
                  {currentPages.map((_, i) => (
                    <span
                      key={i}
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        i === page ? 'bg-markerRed' : 'bg-pencil/30'
                      }`}
                    />
                  ))}
                  <span className="ml-1 uppercase">Page {page + 1}/{maxPages}</span>
                </div>
                <div className="uppercase">
                  ( tap or swipe )
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
