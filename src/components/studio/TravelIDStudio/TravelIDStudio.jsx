import React, { useState, useEffect, useCallback } from 'react';
import { UniversalStudioHeader } from '../UniversalStudioHeader';
import { TravelIDControlPanel } from './TravelIDControlPanel';
import { TravelIDCanvasArea } from './TravelIDCanvasArea';
import { MobileStudioDrawer } from '../MobileStudioDrawer';
import { AnimatePresence, motion } from 'framer-motion';
import { useIDBState } from '../../../hooks/useIDBState';
import { soundFX } from '../../../utils/audio';

export function TravelIDStudio({ onExit }) {
  const [activeSide, setActiveSide] = useState('front'); // 'front' or 'back'
  const [isShowcase, setIsShowcase, isLoadedShowcase] = useIDBState('travelIDShowcase', true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Global ID settings
  const [idState, setIdState, isLoadedId] = useIDBState('travelIDState', {
    cardType: 'Travel License', // 'Travel License' | 'Creative License' | 'This & That'
    colorTheme: '#F5EEDB', // Default vintage cream
    
    // Front specific
    imageSrc: '/assets/luffyTravelID.webp',
    imageScale: 1,
    imageOffsetX: 0,
    imageOffsetY: 0,
    
    issuedTo: 'Monkey D. Luffy',
    dateOfBirth: '05/05/1997',
    placeOfIssue: 'East Blue',
    dateOfIssue: '10/10/2026',
    idNumber: 'TTC6252021',
    signatureImage: null,
    
    // Back specific
    stamps: ['igor', 'cat', 'jollyRoger', 'nami', 'cmiygl'], // Active stamps
    showBlueStamp: true, // "CALL ME IF YOU GET LOST" stamp on front

    // Creative License specific fields
    creativeNumber: '0051',
    occupation: 'Pirate Captain',
    nationality: 'East Blue',
    userBadge: 'GRAPHIC USER',
    expertise: '3D ARTIST & VISUAL DESIGNER',
    barcodeText: 'SR-VISUAL-0051',
    skills: '3D Modeling, Digital Painting, Graphic Design, Photo Editing, Video Editing, Motion Graphics, Sculpting, Visual Design',
    software: 'Adobe Photoshop\nAdobe After Effects\nAdobe Premiere Pro\nAutodesk Maya\nBlender',
    contactPhone: '+91 94960 33887',
    contactEmail: 'strawhat@kitte.studio',
    contactSocial: '@monkey_d_luffy',
    quoteText: 'Creativity takes courage.',
    quoteAuthor: 'Henri Matisse',
  });

  const isAllLoaded = isLoadedShowcase && isLoadedId;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [pendingCardType, setPendingCardType] = useState(null);

  // Clean up any stale revoked blob: URLs saved in IndexedDB from previous browser sessions
  useEffect(() => {
    if (isAllLoaded && idState?.imageSrc && typeof idState.imageSrc === 'string' && idState.imageSrc.startsWith('blob:')) {
      setIdState(prev => ({ ...prev, imageSrc: null }));
    }
  }, [isAllLoaded, idState?.imageSrc, setIdState]);

  // When user is customizing (not showcase), ensure any unedited fields that still match showcase defaults are cleared
  useEffect(() => {
    if (isAllLoaded && !isShowcase && idState?.cardType === 'Creative License') {
      const SHOWCASE_SKILLS = '3D Modeling, Digital Painting, Graphic Design, Photo Editing, Video Editing, Motion Graphics, Sculpting, Visual Design';
      const SHOWCASE_SOFTWARE = 'Adobe Photoshop\nAdobe After Effects\nAdobe Premiere Pro\nAutodesk Maya\nBlender';
      const SHOWCASE_PHONE = '+91 94960 33887';
      const SHOWCASE_EMAIL = 'strawhat@kitte.studio';
      const SHOWCASE_SOCIAL = '@monkey_d_luffy';
      const SHOWCASE_QUOTE = 'Creativity takes courage.';
      const SHOWCASE_AUTHOR = 'Henri Matisse';
      const SHOWCASE_EXPERTISE = '3D ARTIST & VISUAL DESIGNER';

      const updates = {};
      if (idState.skills === SHOWCASE_SKILLS) updates.skills = '';
      if (idState.software === SHOWCASE_SOFTWARE) updates.software = '';
      if (idState.contactPhone === SHOWCASE_PHONE) updates.contactPhone = '';
      if (idState.contactEmail === SHOWCASE_EMAIL) updates.contactEmail = '';
      if (idState.contactSocial === SHOWCASE_SOCIAL) updates.contactSocial = '';
      if (idState.quoteText === SHOWCASE_QUOTE) updates.quoteText = '';
      if (idState.quoteAuthor === SHOWCASE_AUTHOR) updates.quoteAuthor = '';
      if (idState.expertise === SHOWCASE_EXPERTISE) updates.expertise = '';

      if (Object.keys(updates).length > 0) {
        setIdState(prev => ({ ...prev, ...updates }));
      }
    } else if (isAllLoaded && !isShowcase && idState?.cardType === 'This & That') {
      const SHOWCASE_NOTE = 'Always by your side, everywhere all around the world.';
      if (idState.note === SHOWCASE_NOTE) {
        setIdState(prev => ({ ...prev, note: '' }));
      }
    }
  }, [isAllLoaded, isShowcase, idState?.cardType, setIdState]);

  const handleUpdate = (key, value) => {
    setIdState(prev => ({ ...prev, [key]: value }));
  };

  const handleFlip = () => {
    setActiveSide(prev => prev === 'front' ? 'back' : 'front');
  };

  const handleStartCustomizing = () => {
    // Clear out the showcase data
    if (idState.cardType === 'Creative License') {
      const randNum = String(Math.floor(Math.random() * 9000) + 1000);
      setIdState(prev => ({
        ...prev,
        imageSrc: null,
        issuedTo: '',
        dateOfBirth: '',
        signatureImage: null,
        creativeNumber: randNum,
        occupation: '',
        nationality: '',
        userBadge: 'GRAPHIC USER',
        expertise: '',
        barcodeText: `SR-VISUAL-${randNum}`,
        skills: '',
        software: '',
        contactPhone: '',
        contactEmail: '',
        contactSocial: '',
        quoteText: '',
        quoteAuthor: '',
      }));
    } else if (idState.cardType === 'This & That') {
      setIdState(prev => ({
        ...prev,
        imageSrc: null,
        issuedTo: '',
        occupancy: '',
        dateOfIssue: '',
        idNumber: '',
        signatureImage: null,
        note: '',
        certText: 'This is to certify that the person named and described above is declared to be one and only mine.',
      }));
    } else {
      setIdState(prev => ({
        ...prev,
        imageSrc: null,
        issuedTo: '',
        dateOfBirth: '',
        placeOfIssue: '',
        dateOfIssue: '',
        signatureImage: null,
        idNumber: `TTC${Math.floor(Math.random() * 900000) + 100000}`,
      }));
    }
    setIsShowcase(false);
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = useCallback(() => {
    // Restore showcase state
    if (idState.cardType === 'Creative License') {
      setIdState({
        cardType: 'Creative License',
        colorTheme: '#F5EEDB',
        imageSrc: '/assets/luffyTravelID.webp',
        imageScale: 1,
        imageOffsetX: 0,
        imageOffsetY: 0,
        issuedTo: 'Monkey D. Luffy',
        dateOfBirth: '05/05/1997',
        placeOfIssue: 'East Blue',
        dateOfIssue: '10/10/2026',
        idNumber: 'TTC6252021',
        signatureImage: null,
        creativeNumber: '0051',
        occupation: 'Pirate Captain',
        nationality: 'East Blue',
        userBadge: 'GRAPHIC USER',
        expertise: '3D ARTIST & VISUAL DESIGNER',
        barcodeText: 'SR-VISUAL-0051',
        skills: '3D Modeling, Digital Painting, Graphic Design, Photo Editing, Video Editing, Motion Graphics, Sculpting, Visual Design',
        software: 'Adobe Photoshop\nAdobe After Effects\nAdobe Premiere Pro\nAutodesk Maya\nBlender',
        contactPhone: '+91 94960 33887',
        contactEmail: 'strawhat@kitte.studio',
        contactSocial: '@monkey_d_luffy',
        quoteText: 'Creativity takes courage.',
        quoteAuthor: 'Henri Matisse',
        stamps: ['igor', 'cat', 'jollyRoger', 'nami', 'cmiygl'],
        showBlueStamp: true,
      });
    } else if (idState.cardType === 'This & That') {
      setIdState({
        cardType: 'This & That',
        colorTheme: '#F3EEDA',
        imageSrc: '/assets/luffyTravelID.webp',
        imageScale: 1,
        imageOffsetX: 0,
        imageOffsetY: 0,
        issuedTo: 'HWANG HYUNJIN',
        occupancy: 'STAY',
        dateOfIssue: '08/07/2026',
        idNumber: 'SKZ-080726',
        certText: 'This is to certify that the person named and described above is declared to be one and only mine.',
        note: 'Always by your side, everywhere all around the world.',
        signatureImage: null,
      });
    } else {
      setIdState({
        cardType: 'Travel License',
        colorTheme: '#F5EEDB',
        imageSrc: '/assets/luffyTravelID.webp',
        imageScale: 1,
        imageOffsetX: 0,
        imageOffsetY: 0,
        issuedTo: 'Monkey D. Luffy',
        dateOfBirth: '05/05/1997',
        placeOfIssue: 'East Blue',
        dateOfIssue: '10/10/2026',
        idNumber: 'TTC6252021',
        signatureImage: null,
        stamps: ['igor', 'cat', 'jollyRoger', 'nami', 'cmiygl'],
        showBlueStamp: true,
      });
    }
    setIsShowcase(true);
    setActiveSide('front');
    setShowResetConfirm(false);
  }, [idState.cardType, setIdState, setIsShowcase]);

  const handleCardTypeChange = (newType) => {
    if (newType === idState.cardType) return;
    if (!isShowcase) {
      setPendingCardType(newType);
    } else {
      if (newType === 'Creative License') {
        setIdState(prev => ({
          ...prev,
          cardType: 'Creative License',
          colorTheme: '#F5EEDB',
          imageSrc: '/assets/luffyTravelID.webp',
          imageScale: 1,
          imageOffsetX: 0,
          imageOffsetY: 0,
          issuedTo: 'Monkey D. Luffy',
          dateOfBirth: '05/05/1997',
          signatureImage: null,
          creativeNumber: '0051',
          occupation: 'Pirate Captain',
          nationality: 'East Blue',
          userBadge: 'GRAPHIC USER',
          expertise: '3D ARTIST & VISUAL DESIGNER',
          barcodeText: 'SR-VISUAL-0051',
          skills: '3D Modeling, Digital Painting, Graphic Design, Photo Editing, Video Editing, Motion Graphics, Sculpting, Visual Design',
          software: 'Adobe Photoshop\nAdobe After Effects\nAdobe Premiere Pro\nAutodesk Maya\nBlender',
          contactPhone: '+91 94960 33887',
          contactEmail: 'strawhat@kitte.studio',
          contactSocial: '@monkey_d_luffy',
          quoteText: 'Creativity takes courage.',
          quoteAuthor: 'Henri Matisse',
        }));
      } else if (newType === 'This & That') {
        setIdState(prev => ({
          ...prev,
          cardType: 'This & That',
          colorTheme: '#F3EEDA',
          imageSrc: '/assets/luffyTravelID.webp',
          imageScale: 1,
          imageOffsetX: 0,
          imageOffsetY: 0,
          issuedTo: 'HWANG HYUNJIN',
          occupancy: 'STAY',
          dateOfIssue: '08/07/2026',
          idNumber: 'SKZ-080726',
          certText: 'This is to certify that the person named and described above is declared to be one and only mine.',
          note: 'Always by your side, everywhere all around the world.',
          signatureImage: null,
        }));
      } else {
        setIdState(prev => ({
          ...prev,
          cardType: newType,
          colorTheme: '#F5EEDB',
          imageSrc: '/assets/luffyTravelID.webp',
          imageScale: 1,
          imageOffsetX: 0,
          imageOffsetY: 0,
          issuedTo: 'Monkey D. Luffy',
          dateOfBirth: '05/05/1997',
          placeOfIssue: 'East Blue',
          dateOfIssue: '10/10/2026',
          idNumber: 'TTC6252021',
          signatureImage: null,
          stamps: ['igor', 'cat', 'jollyRoger', 'nami', 'cmiygl'],
          showBlueStamp: true,
        }));
      }
    }
  };

  const confirmChangeCard = useCallback(() => {
    if (!pendingCardType) return;
    const nextType = pendingCardType;
    setPendingCardType(null);

    if (nextType === 'Creative License') {
      setIdState({
        cardType: 'Creative License',
        colorTheme: '#F5EEDB',
        imageSrc: '/assets/luffyTravelID.webp',
        imageScale: 1,
        imageOffsetX: 0,
        imageOffsetY: 0,
        issuedTo: 'Monkey D. Luffy',
        dateOfBirth: '05/05/1997',
        placeOfIssue: 'East Blue',
        dateOfIssue: '10/10/2026',
        idNumber: 'TTC6252021',
        signatureImage: null,
        creativeNumber: '0051',
        occupation: 'Pirate Captain',
        nationality: 'East Blue',
        userBadge: 'GRAPHIC USER',
        expertise: '3D ARTIST & VISUAL DESIGNER',
        barcodeText: 'SR-VISUAL-0051',
        skills: '3D Modeling, Digital Painting, Graphic Design, Photo Editing, Video Editing, Motion Graphics, Sculpting, Visual Design',
        software: 'Adobe Photoshop\nAdobe After Effects\nAdobe Premiere Pro\nAutodesk Maya\nBlender',
        contactPhone: '+91 94960 33887',
        contactEmail: 'strawhat@kitte.studio',
        contactSocial: '@monkey_d_luffy',
        quoteText: 'Creativity takes courage.',
        quoteAuthor: 'Henri Matisse',
        stamps: ['igor', 'cat', 'jollyRoger', 'nami', 'cmiygl'],
        showBlueStamp: true,
      });
    } else if (nextType === 'This & That') {
      setIdState({
        cardType: 'This & That',
        colorTheme: '#F3EEDA',
        imageSrc: '/assets/luffyTravelID.webp',
        imageScale: 1,
        imageOffsetX: 0,
        imageOffsetY: 0,
        issuedTo: 'HWANG HYUNJIN',
        occupancy: 'STAY',
        dateOfIssue: '08/07/2026',
        idNumber: 'SKZ-080726',
        certText: 'This is to certify that the person named and described above is declared to be one and only mine.',
        note: 'Always by your side, everywhere all around the world.',
        signatureImage: null,
      });
    } else {
      setIdState({
        cardType: nextType,
        colorTheme: '#F5EEDB',
        imageSrc: '/assets/luffyTravelID.webp',
        imageScale: 1,
        imageOffsetX: 0,
        imageOffsetY: 0,
        issuedTo: 'Monkey D. Luffy',
        dateOfBirth: '05/05/1997',
        placeOfIssue: 'East Blue',
        dateOfIssue: '10/10/2026',
        idNumber: 'TTC6252021',
        signatureImage: null,
        stamps: ['igor', 'cat', 'jollyRoger', 'nami', 'cmiygl'],
        showBlueStamp: true,
      });
    }
    setIsShowcase(true);
    setActiveSide('front');
  }, [pendingCardType, setIdState, setIsShowcase]);

  // Keyboard shortcut listener: Enter to confirm modal, Escape to cancel
  useEffect(() => {
    if (!showResetConfirm && !pendingCardType) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (showResetConfirm) {
          confirmReset();
        } else if (pendingCardType) {
          confirmChangeCard();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (showResetConfirm) {
          setShowResetConfirm(false);
        } else if (pendingCardType) {
          setPendingCardType(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResetConfirm, pendingCardType, confirmReset, confirmChangeCard]);

  if (!isAllLoaded) return null;

  // Export Readiness
  const isExportReady = Boolean(idState?.imageSrc);

  const handleExport = () => {
    if (!isExportReady) return;
    soundFX.playSnap();
    window.dispatchEvent(new CustomEvent('OPEN_EXPORT', { 
      detail: { 
        type: idState?.cardType || 'Travel ID', 
        data: { ...idState, isShowcase: !!isShowcase } 
      } 
    }));
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
        title="TRAVEL ID STUDIO" 
        description="Physical-grade permanent license of travel generator. 300 DPI Export." 
        onBack={onExit}
        onReset={handleReset}
        onExport={handleExport}
        isExportReady={isExportReady}
        canReset={true}
      />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Desktop Left Control Panel */}
        <div className="hidden lg:flex h-full shrink-0">
          <TravelIDControlPanel 
            activeSide={activeSide} 
            idState={idState} 
            onUpdate={handleUpdate} 
            onFlip={handleFlip}
            onReset={handleReset}
            disabled={isShowcase}
            isShowcase={isShowcase}
            onCardTypeChange={handleCardTypeChange}
          />
        </div>

        {/* Center/Full Canvas Area */}
        <div className="flex-1 w-full h-full min-h-0 relative">
          <TravelIDCanvasArea 
            activeSide={activeSide} 
            idState={idState} 
            onUpdate={handleUpdate} 
            onFlip={handleFlip}
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
            <TravelIDControlPanel 
              activeSide={activeSide} 
              idState={idState} 
              onUpdate={handleUpdate} 
              onFlip={handleFlip}
              onReset={handleReset}
              disabled={isShowcase}
              isShowcase={isShowcase}
              onCardTypeChange={handleCardTypeChange}
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
                <h2 className="font-marker text-xl sm:text-2xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">Reset License?</h2>
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

      {/* Change Card Type Confirmation Modal */}
      <AnimatePresence>
        {pendingCardType && (
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
                <h2 className="font-marker text-xl sm:text-2xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">Change Card?</h2>
              </div>
              <p className="font-mono text-xs sm:text-sm text-[#1A1A1A] leading-relaxed">
                If you change the card your current progress will be lost.
              </p>
              
              <div className="flex gap-2 sm:gap-3 mt-1 sm:mt-2">
                <button
                  type="button"
                  onClick={() => setPendingCardType(null)}
                  className="flex-1 bg-white text-[#1A1A1A] font-mono font-bold uppercase py-1.5 sm:py-2.5 px-2 sm:px-3 text-xs sm:text-sm border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer text-center"
                >
                  Stay
                </button>
                <button
                  type="button"
                  onClick={confirmChangeCard}
                  className="flex-1 bg-[#1A1A1A] text-[#FFEB3B] font-mono font-bold text-xs uppercase py-1.5 sm:py-2.5 px-2 sm:px-3 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer text-center"
                >
                  Open Card
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
