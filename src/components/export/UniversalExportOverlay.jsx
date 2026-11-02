import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { TicketStub } from '../studio/MemoryTicketStudio/TicketStub';
import { TravelIDCard } from '../studio/TravelIDStudio/TravelIDCard';
import { PhotoBoothStrip } from '../studio/PhotoBoothStudio/PhotoBoothStrip';
import { BountyPosterCard } from '../studio/BountyPosterStudio/BountyPosterCard';
import { TimeLetterCard } from '../studio/TimeLetterStudio/TimeLetterCard';
import { TimeEnvelopeCard } from '../studio/TimeLetterStudio/TimeEnvelopeCard';
import { InteractiveDeskLines } from '../desk/InteractiveDeskLines';
import { useIDBState } from '../../hooks/useIDBState';
import { exportAsPNG, exportAsPDF } from '../../utils/exportEngine';
import { PHOTO_BOOTH_TOKENS } from '../../features/photobooth/tokens/photoBoothTokens';
import { generateLetterShareUrl } from '../../features/time-letter/utils/timeLetterShare';
import { soundFX } from '../../utils/audio';

export function UniversalExportOverlay() {
  const [isOpen, setIsOpen, isLoadedOpen] = useIDBState('kitte_export_isOpen', false);
  const [exportData, setExportData, isLoadedData] = useIDBState('kitte_export_data', null);
  const [exportType, setExportType, isLoadedType] = useIDBState('kitte_export_type', '');
  
  // Local settings
  const [activeSide, setActiveSide] = useState('front');
  const [printMode, setPrintMode] = useState('fold-glue'); // 'fold-glue' | 'duplex'
  const [includeBleed, setIncludeBleed] = useState(true);
  const [exportingType, setExportingType] = useState(null); // 'pdf' | 'png' | null
  const [exportError, setExportError] = useState(null);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const handleCopyTimeLetterLink = () => {
    if (!exportData) return;
    soundFX.playPop();
    const url = generateLetterShareUrl(exportData);
    navigator.clipboard?.writeText(url).then(() => {
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    });
  };

  const previewContainerRef = useRef(null);

  // Decoy Effect (3D tilt on hover)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateYBase = useTransform(mouseX, [-300, 300], [-15, 15]);

  const handleMouseMove = (e) => {
    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    const handleOpen = (e) => {
      setExportType(e.detail.type);
      setExportData(e.detail.data);
      const isTime = e.detail?.type?.toUpperCase().includes('TIME') || e.detail?.type?.toUpperCase().includes('CAPSULE');
      setIsOpen(true);
      setActiveSide(isTime ? 'back' : 'front');
      setExportError(null);
      // Photo Booth, Bounty Poster, and Time Capsule default to clean border-to-border (zero outer white area)
      if (e.detail?.type?.toUpperCase().includes('PHOTO') || e.detail?.type?.toUpperCase().includes('BOUNTY') || isTime) {
        setIncludeBleed(false);
        setPrintMode('borderless');
      } else {
        setIncludeBleed(true);
        setPrintMode('fold-glue');
      }
    };
    
    // Listen for both the legacy EXPORT_TICKET and the new OPEN_EXPORT
    window.addEventListener('OPEN_EXPORT', handleOpen);
    window.addEventListener('EXPORT_TICKET', (e) => {
      // Temporary fallback if ControlPanel hasn't updated the detail payload yet
      const payload = e.detail || { type: 'MemoryTicket', data: JSON.parse(localStorage.getItem('memoryTicketState') || '{}') };
      handleOpen({ detail: payload });
    });

    return () => {
      window.removeEventListener('OPEN_EXPORT', handleOpen);
      window.removeEventListener('EXPORT_TICKET', handleOpen);
    };
  }, []);

  const handleDownloadPDF = async () => {
    if (!exportData) return;
    setExportingType('pdf');
    setExportError(null);
    try {
      const activeBleed = printMode === 'duplex' ? false : includeBleed;
      const effectiveData = { 
        ...exportData, 
        printMode,
        exportSide: isTimeCapsule ? (printMode === 'borderless' ? 'back' : activeSide) : activeSide 
      };
      await exportAsPDF(effectiveData, printMode, activeBleed, exportType);
      setTimeout(closeExport, 800);
    } catch (err) {
      console.error('Export PDF failed:', err);
      setExportError('PDF export failed. Please try again.');
    } finally {
      setExportingType(null);
    }
  };

  const handleDownloadPNG = async () => {
    if (!exportData) return;
    setExportingType('png');
    setExportError(null);
    try {
      const activeBleed = printMode === 'duplex' ? false : includeBleed;
      const effectiveData = { 
        ...exportData, 
        printMode,
        exportSide: isTimeCapsule ? (printMode === 'borderless' ? 'back' : activeSide) : activeSide 
      };
      await exportAsPNG(effectiveData, printMode, activeBleed, exportType);
      setTimeout(closeExport, 800);
    } catch (err) {
      console.error('Export PNG failed:', err);
      setExportError('PNG export failed. Please try again.');
    } finally {
      setExportingType(null);
    }
  };

  const closeExport = () => {
    setIsOpen(false);
  };

  const isAllLoaded = isLoadedOpen && isLoadedData && isLoadedType;
  if (!isAllLoaded) return null;

  const isTimeCapsule = exportType?.toUpperCase().includes('TIME') || exportType?.toUpperCase().includes('CAPSULE');
  const isBounty = !isTimeCapsule && exportType?.toUpperCase().includes('BOUNTY');
  const isPhotoBooth = !isTimeCapsule && !isBounty && exportType?.toUpperCase().includes('PHOTO');
  const isTravelID = !isTimeCapsule && !isPhotoBooth && !isBounty && (exportType?.toUpperCase().includes('TRAVEL') || exportType?.toUpperCase().includes('LICENSE') || exportType?.toUpperCase().includes('CREATIVE') || Boolean(exportData?.cardType));
  const isChinOn = exportData?.showBottomChin !== false;
  const pbCount = exportData?.photoCount || 4;
  const pbH = isChinOn 
    ? (PHOTO_BOOTH_TOKENS.strip.heightsWithChin[pbCount] || 910) 
    : (PHOTO_BOOTH_TOKENS.strip.heightsWithoutChin[pbCount] || 863);
  const previewW = isTimeCapsule ? (activeSide === 'front' ? 580 : 550) : isBounty ? 408 : isPhotoBooth ? (PHOTO_BOOTH_TOKENS.strip.width || 168) : isTravelID ? 500 : (exportData?.layout === 'horizontal' ? 500 : 250);
  const previewH = isTimeCapsule ? (activeSide === 'front' ? 380 : 432) : isBounty ? 600 : isPhotoBooth ? pbH : isTravelID ? 315 : (exportData?.layout === 'horizontal' ? 250 : 500);

  return (
    <AnimatePresence>
      {isOpen && exportData && (
        <motion.div 
          key="export-overlay-wrapper"
          className="fixed inset-0 z-[100] flex"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.2 } }}
        >
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={closeExport}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full h-[96vh] mt-auto bg-[#F4F1EA] border-t-4 sm:border-t-8 border-[#1A1A1A] shadow-[0px_-6px_0px_rgba(0,0,0,0.5)] sm:shadow-[0px_-10px_0px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row overflow-hidden pointer-events-auto"
          >
            {/* VISIBLE CLOSE BUTTON */}
            <button 
              className="absolute top-2.5 right-2.5 sm:top-5 sm:right-5 w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center z-50 cursor-pointer font-marker text-xl sm:text-4xl text-[#1A1A1A] hover:text-[#FF4D4D] bg-[#F4F1EA] sm:bg-transparent rounded-full sm:rounded-none border-2 border-[#1A1A1A] sm:border-none shadow-[2px_2px_0px_#1A1A1A] sm:shadow-none transition-transform hover:scale-110 active:scale-95 handwritten-text"
              onClick={closeExport}
              aria-label="Close Export"
            >
              X
            </button>

            {/* 1. Left: Instructions & Paper Quality Guide (Desktop side panel) */}
            <div className="hidden lg:flex w-[380px] border-r-4 border-[#1A1A1A] bg-white p-6 overflow-y-auto flex-col gap-5 shrink-0">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-marker text-2xl uppercase handwritten-text tracking-tight">Print & Craft Guide</h2>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#FFEB3B] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] uppercase tracking-wider whitespace-nowrap">
                    {isTimeCapsule ? 'Time Capsule' : isBounty ? 'Wanted Poster' : isPhotoBooth ? 'Photostrip' : isTravelID ? (exportData?.cardType || 'Travel License') : 'Ticket Stub'}
                  </span>
                </div>
                <div className="h-1 w-full bg-[#1A1A1A]" />
              </div>

              <div className="flex flex-col gap-4 font-mono text-sm">
                {/* Dynamic Mode / Studio Summary Banner */}
                {isTimeCapsule ? (
                  <div className="bg-[#FFF9C4] border-2 border-[#1A1A1A] p-3 shadow-[3px_3px_0px_#1A1A1A]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold font-mono text-xs uppercase tracking-wide text-[#1A1A1A] flex items-center gap-1.5">
                        <img src="/assets/alert.svg" className="w-4 h-4" alt="" />
                        Archival Time Letter
                      </span>
                      <span className="text-[9px] font-mono font-bold bg-[#1A1A1A] text-[#FFEB3B] px-1.5 py-0.5 uppercase">
                        300 DPI
                      </span>
                    </div>
                    <p className="text-xs font-mono text-[#1A1A1A]/85 leading-snug">
                      Official dispatch to future self. High-resolution archival stationery, postal cachets, and foldable envelope.
                    </p>
                  </div>
                ) : isBounty ? (
                  <div className="bg-[#FFF9C4] border-2 border-[#1A1A1A] p-3 shadow-[3px_3px_0px_#1A1A1A]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold font-mono text-xs uppercase tracking-wide text-[#1A1A1A] flex items-center gap-1.5">
                        <img src="/assets/alert.svg" className="w-4 h-4" alt="" />
                        Wanted Poster (A4 / A3)
                      </span>
                      <span className="text-[9px] font-mono font-bold bg-[#1A1A1A] text-[#FFEB3B] px-1.5 py-0.5 uppercase">
                        300 DPI
                      </span>
                    </div>
                    <p className="text-xs font-mono text-[#1A1A1A]/85 leading-snug">
                      High-resolution single-sided One Piece Wanted Poster. Ready for framing, wall displays, and pirate collections.
                    </p>
                  </div>
                ) : isPhotoBooth ? (
                  <div className="bg-[#FFF9C4] border-2 border-[#1A1A1A] p-3 shadow-[3px_3px_0px_#1A1A1A]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold font-mono text-xs uppercase tracking-wide text-[#1A1A1A] flex items-center gap-1.5">
                        <img src="/assets/alert.svg" className="w-4 h-4" alt="" />
                        Single Photostrip
                      </span>
                      <span className="text-[9px] font-mono font-bold bg-[#1A1A1A] text-[#FFEB3B] px-1.5 py-0.5 uppercase">
                        300 DPI
                      </span>
                    </div>
                    <p className="text-xs font-mono text-[#1A1A1A]/85 leading-snug">
                      1:1 scale vintage strip with zero white borders. Ready for glossy photo paper or phone cases.
                    </p>
                  </div>
                ) : printMode === 'stamps-decor' ? (
                  <div className="bg-[#E8F5E9] border-2 border-[#1A1A1A] p-3 shadow-[3px_3px_0px_#1A1A1A]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold font-mono text-xs uppercase tracking-wide text-[#1A1A1A] flex items-center gap-1.5">
                        <img src="/assets/alert.svg" className="w-4 h-4" alt="" />
                        DIY Stamps & Seals Sheet
                      </span>
                      <span className="text-[9px] font-mono font-bold bg-[#15803D] text-white px-1.5 py-0.5 uppercase">
                        A4 • STICKER
                      </span>
                    </div>
                    <p className="text-xs font-mono text-[#1A1A1A]/85 leading-snug">
                      Your chosen postage stamps, wax seals, ribbons & bonus vintage airmail labels with precision cut guides for physical assembly.
                    </p>
                  </div>
                ) : printMode === 'fold-glue' ? (
                  <div className="bg-[#FFF9C4] border-2 border-[#1A1A1A] p-3 shadow-[3px_3px_0px_#1A1A1A]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold font-mono text-xs uppercase tracking-wide text-[#1A1A1A] flex items-center gap-1.5">
                        <img src="/assets/alert.svg" className="w-4 h-4" alt="" />
                        {isTimeCapsule ? 'DIY Envelope Craft Sheet' : 'DIY Home Craft'}
                      </span>
                      <span className="text-[9px] font-mono font-bold bg-[#1A1A1A] text-[#FFEB3B] px-1.5 py-0.5 uppercase">
                        2-PAGE A4
                      </span>
                    </div>
                    <p className="text-xs font-mono text-[#1A1A1A]/85 leading-snug">
                      {isTimeCapsule 
                        ? 'Page 1: 100% unmarked envelope net with your selected color & dot pattern. Page 2: Dedicated 6-step diagrammatic assembly guide.' 
                        : 'Front & Back on 1 page with center fold crease. Folding creates instant double-sided thickness.'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#E1F5FE] border-2 border-[#1A1A1A] p-3 shadow-[3px_3px_0px_#1A1A1A]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold font-mono text-xs uppercase tracking-wide text-[#1A1A1A] flex items-center gap-1.5">
                        <img src="/assets/alert.svg" className="w-4 h-4" alt="" />
                        {isTimeCapsule ? 'Archival Letterhead Print' : 'Pro Direct / PVC Print'}
                      </span>
                      <span className="text-[9px] font-mono font-bold bg-[#1A1A1A] text-[#FFEB3B] px-1.5 py-0.5 uppercase">
                        {isTimeCapsule ? '300 DPI' : 'EXACT CUT'}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-[#1A1A1A]/85 leading-snug">
                      {isTimeCapsule 
                        ? 'High-resolution 300 DPI archival letterhead print with authentic stationary tone, border line, and stamp.' 
                        : 'Auto-borderless 2-page PDF + separate Front & Back PNGs with zero white margins for card printers.'}
                    </p>
                  </div>
                )}

                {/* Studio Craft Specifications */}
                <div className="flex items-center justify-between border-b-2 border-[#1A1A1A]/15 pb-1 mt-1">
                  <h3 className="font-bold uppercase tracking-wider text-[#1A1A1A] text-xs font-mono">
                    Craft Specifications
                  </h3>
                  <span className="font-mono text-[10px] text-[#1A1A1A]/60 uppercase">
                    {isTimeCapsule ? 'Letter & Envelope' : isBounty ? 'Manga Poster' : isPhotoBooth ? 'Photo Paper' : isTravelID ? 'CR80 Wallet' : 'Vintage Stub'}
                  </span>
                </div>

                {isTimeCapsule ? (
                  <div className="flex flex-col gap-2">
                    <div className="bg-[#FAF7EE] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider bg-[#1A1A1A] text-[#FFEB3B] px-1.5 py-0.5">
                          PAPER
                        </span>
                        <span className="font-mono text-[10px] text-[#1A1A1A]/60">120–220 GSM</span>
                      </div>
                      <span className="text-xs font-mono text-[#1A1A1A] leading-snug mt-0.5">
                        Linen parchment, laid paper, or archival cotton bond for authentic tactile stationery feel.
                      </span>
                    </div>

                    <div className="bg-[#FAF7EE] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider bg-[#1A1A1A] text-white px-1.5 py-0.5">
                          ENVELOPE
                        </span>
                        <span className="font-mono text-[10px] text-[#1A1A1A]/60">AIRMAIL CRAFT</span>
                      </div>
                      <span className="text-xs font-mono text-[#1A1A1A] leading-snug mt-0.5">
                        Fold letter in horizontal thirds to slide inside standard airmail or kraft envelopes.
                      </span>
                    </div>

                    <div className="bg-[#FAF7EE] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider bg-[#1A1A1A] text-white px-1.5 py-0.5">
                          WAX SEAL
                        </span>
                        <span className="font-mono text-[10px] text-[#1A1A1A]/60">SEAL & SEND</span>
                      </div>
                      <span className="text-xs font-mono text-[#1A1A1A] leading-snug mt-0.5">
                        Melt a drop of crimson sealing wax over the flap or tie with silk ribbon bow.
                      </span>
                    </div>

                    <div className="bg-[#FFF9C4] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-[#1A1A1A]">
                          FUTURE NOTE
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#1A1A1A]/85 leading-snug">
                        Keep sealed until {exportData?.deliveryDate || 'the target delivery date'}. A true keepsake for your future self!
                      </p>
                    </div>
                  </div>
                ) : isBounty ? (
                  <div className="flex flex-col gap-2">
                    <div className="bg-[#FAF7EE] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider bg-[#1A1A1A] text-[#FFEB3B] px-1.5 py-0.5">
                          PAPER
                        </span>
                        <span className="font-mono text-[10px] text-[#1A1A1A]/60">200–260 GSM</span>
                      </div>
                      <span className="text-xs font-mono text-[#1A1A1A] leading-snug mt-0.5">
                        Matte cardstock or aged parchment paper for authentic non-reflective manga look.
                      </span>
                    </div>

                    <div className="bg-[#FAF7EE] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider bg-[#1A1A1A] text-white px-1.5 py-0.5">
                          SCALING
                        </span>
                        <span className="font-mono text-[10px] text-[#1A1A1A]/60">A4 / A3 SIZE</span>
                      </div>
                      <span className="text-xs font-mono text-[#1A1A1A] leading-snug mt-0.5">
                        Standard A4 or A3 frame scale. Set printer to "Actual Size" (100% scale).
                      </span>
                    </div>

                    <div className="bg-[#FAF7EE] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider bg-[#1A1A1A] text-white px-1.5 py-0.5">
                          AGING
                        </span>
                        <span className="font-mono text-[10px] text-[#1A1A1A]/60">WEATHERING</span>
                      </div>
                      <span className="text-xs font-mono text-[#1A1A1A] leading-snug mt-0.5">
                        Lightly rub edges with tea wash or crease paper for authentic sea-worn pirate texture.
                      </span>
                    </div>

                    <div className="bg-[#FFF9C4] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-[#1A1A1A]">
                          PRO TIP
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#1A1A1A]/85 leading-snug">
                        Print on heavy cream or parchment paper with borderless printing for a genuine Grand Line bounty poster.
                      </p>
                    </div>
                  </div>
                ) : isPhotoBooth ? (
                  <div className="flex flex-col gap-2">
                    <div className="bg-[#FAF7EE] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider bg-[#1A1A1A] text-[#FFEB3B] px-1.5 py-0.5">
                          PAPER
                        </span>
                        <span className="font-mono text-[10px] text-[#1A1A1A]/60">240–300 GSM</span>
                      </div>
                      <span className="text-xs font-mono text-[#1A1A1A] leading-snug mt-0.5">
                        Glossy or semi-gloss photo paper for an authentic shiny arcade finish.
                      </span>
                    </div>

                    <div className="bg-[#FAF7EE] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider bg-[#1A1A1A] text-white px-1.5 py-0.5">
                          TRIMMING
                        </span>
                        <span className="font-mono text-[10px] text-[#1A1A1A]/60">RULER & BLADE</span>
                      </div>
                      <span className="text-xs font-mono text-[#1A1A1A] leading-snug mt-0.5">
                        Cut along outer corner marks using a craft blade and metal ruler.
                      </span>
                    </div>

                    <div className="bg-[#FAF7EE] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider bg-[#1A1A1A] text-white px-1.5 py-0.5">
                          KEEPSAKE
                        </span>
                        <span className="font-mono text-[10px] text-[#1A1A1A]/60">DISPLAY IDEAS</span>
                      </div>
                      <span className="text-xs font-mono text-[#1A1A1A] leading-snug mt-0.5">
                        Fits clear phone cases, scrapbook pages, or punches as a gift tag.
                      </span>
                    </div>

                    <div className="bg-[#FFF9C4] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-[#1A1A1A]">
                          PRO TIP
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#1A1A1A]/85 leading-snug">
                        Print at 100% scale (disable "Fit to Page") for true vintage photostrip proportions.
                      </p>
                    </div>
                  </div>
                ) : isTravelID ? (
                  <div className="flex flex-col gap-2">
                    <div className="bg-[#FAF7EE] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider bg-[#1A1A1A] text-[#FFEB3B] px-1.5 py-0.5">
                          PAPER
                        </span>
                        <span className="font-mono text-[10px] text-[#1A1A1A]/60">250–300 GSM</span>
                      </div>
                      <span className="text-xs font-mono text-[#1A1A1A] leading-snug mt-0.5">
                        Heavy cardstock or matte photo paper for sharp, high-contrast colors.
                      </span>
                    </div>

                    <div className="bg-[#FAF7EE] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider bg-[#1A1A1A] text-white px-1.5 py-0.5">
                          ASSEMBLY
                        </span>
                        <span className="font-mono text-[10px] text-[#1A1A1A]/60">FOLD & GLUE</span>
                      </div>
                      <span className="text-xs font-mono text-[#1A1A1A] leading-snug mt-0.5">
                        Fold along crease, bond inner faces with glue stick, and trim outer crop marks.
                      </span>
                    </div>

                    <div className="bg-[#FAF7EE] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider bg-[#1A1A1A] text-white px-1.5 py-0.5">
                          PVC FINISH
                        </span>
                        <span className="font-mono text-[10px] text-[#1A1A1A]/60">PLASTIC RIGID</span>
                      </div>
                      <span className="text-xs font-mono text-[#1A1A1A] leading-snug mt-0.5">
                        Seal inside a 5–10 mil thermal pouch and round corners with a 3mm punch.
                      </span>
                    </div>

                    <div className="bg-[#FFF9C4] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-[#1A1A1A]">
                          PRO TIP
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#1A1A1A]/85 leading-snug">
                        Laminating folded cardstock gives the exact firmness and feel of a real credit card.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="bg-[#FAF7EE] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider bg-[#1A1A1A] text-[#FFEB3B] px-1.5 py-0.5">
                          PAPER
                        </span>
                        <span className="font-mono text-[10px] text-[#1A1A1A]/60">200–240 GSM</span>
                      </div>
                      <span className="text-xs font-mono text-[#1A1A1A] leading-snug mt-0.5">
                        Matte linen or uncoated cardstock for authentic vintage theater stub texture.
                      </span>
                    </div>

                    <div className="bg-[#FAF7EE] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider bg-[#1A1A1A] text-white px-1.5 py-0.5">
                          FOLD & GLUE
                        </span>
                        <span className="font-mono text-[10px] text-[#1A1A1A]/60">CLEAN CREASE</span>
                      </div>
                      <span className="text-xs font-mono text-[#1A1A1A] leading-snug mt-0.5">
                        Lightly score center line before folding and gluing inner sides together.
                      </span>
                    </div>

                    <div className="bg-[#FAF7EE] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider bg-[#1A1A1A] text-white px-1.5 py-0.5">
                          STUB & SHAPE
                        </span>
                        <span className="font-mono text-[10px] text-[#1A1A1A]/60">TEAR-OFF LINE</span>
                      </div>
                      <span className="text-xs font-mono text-[#1A1A1A] leading-snug mt-0.5">
                        Trace dashed line with a needle for a tear stub; cut edges with precision shears.
                      </span>
                    </div>

                    <div className="bg-[#FFF9C4] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                        <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-[#1A1A1A]">
                          PRO TIP
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#1A1A1A]/85 leading-snug">
                        Score fold and perforation lines against a metal ruler before cutting for razor-sharp edges.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Center: Workbench Preview (Non-scrollable, pinned at top on mobile) */}
            <div 
              ref={previewContainerRef}
              className="h-[30vh] sm:h-[36vh] lg:h-full lg:flex-1 bg-deskSurface relative flex items-center justify-center overflow-hidden border-b-4 lg:border-b-0 lg:border-r-4 border-[#1A1A1A] shrink-0 select-none"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Interactive Desk Lines Background */}
              <div className="absolute inset-0 z-0">
                <InteractiveDeskLines />
              </div>

              {/* Actual Cutting Mat Container (Solid Object) */}
              <div className="relative w-[95%] h-[92%] sm:w-[90%] sm:h-[90%] max-w-[1200px] border-[3px] sm:border-[6px] border-[#1A1A1A] shadow-[4px_4px_0px_rgba(0,0,0,0.5)] sm:shadow-[12px_12px_0px_rgba(0,0,0,0.5)] bg-[#2a3c24] flex items-center justify-center overflow-hidden z-10">
                {/* The Mat Image */}
                <img 
                  src="/assets/cutting-mat.svg" 
                  alt="Cutting Mat" 
                  className="absolute inset-0 w-full h-full object-cover object-left-bottom opacity-80 pointer-events-none" 
                />
                
                {/* Dimension UI Container */}
                <div 
                  className="absolute pointer-events-none z-20 hidden sm:flex items-center justify-center" 
                  style={{ 
                    width: isBounty ? previewW * 0.68 : isPhotoBooth && previewH > 650 ? previewW * 0.65 : isTimeCapsule ? previewW * 0.85 : previewW, 
                    height: isBounty ? previewH * 0.68 : isPhotoBooth && previewH > 650 ? previewH * 0.65 : isTimeCapsule ? previewH * 0.85 : previewH 
                  }}
                >
                  {/* Top Width Dimension */}
                  <div className="absolute -top-10 left-0 right-0 h-6 border-x-[3px] border-t-[3px] border-[#1A1A1A] flex items-start justify-center">
                    <span className="font-mono font-bold text-sm bg-[#FFEB3B] text-[#1A1A1A] px-2 py-0.5 border-[3px] border-[#1A1A1A] -translate-y-1/2 shadow-[3px_3px_0px_#1A1A1A]">
                      W: {previewW}px ({(previewW / 300).toFixed(2)}")
                    </span>
                  </div>
                  {/* Left Height Dimension */}
                  <div className="absolute -left-10 top-0 bottom-0 w-6 border-y-[3px] border-l-[3px] border-[#1A1A1A] flex items-center justify-start">
                    <span className="font-mono font-bold text-sm bg-[#FFEB3B] text-[#1A1A1A] px-2 py-0.5 border-[3px] border-[#1A1A1A] -translate-x-1/2 -rotate-90 shadow-[3px_3px_0px_#1A1A1A] whitespace-nowrap">
                      H: {previewH}px ({(previewH / 300).toFixed(2)}")
                    </span>
                  </div>
                  
                  {/* Top Right DPI Label */}
                  <div className="absolute -top-10 -right-12">
                    <span className="font-marker text-lg text-[#FFEB3B]" style={{ filter: "drop-shadow(2px 2px 0px #1A1A1A)" }}>300 DPI</span>
                  </div>
                </div>

                {/* 3D Click-to-Flip Product with Decoy Effect */}
                <div className="relative z-30" style={{ perspective: '1500px' }}>
                  <motion.div
                    className={`cursor-pointer select-none relative scale-[0.46] xs:scale-[0.52] sm:scale-[0.72] md:scale-85 lg:scale-100 touch-manipulation ${(!isPhotoBooth && !isBounty) ? "cursor-pointer" : ""}`}
                    animate={{ rotateY: (!isPhotoBooth && !isBounty && activeSide === 'back') ? 180 : 0 }}
                    style={{ transformStyle: 'preserve-3d', rotateX }}
                    transition={{ rotateY: { type: "spring", stiffness: 60, damping: 15, mass: 1 } }}
                    onClick={() => {
                      if (!isPhotoBooth && !isBounty) {
                        setActiveSide(s => s === 'front' ? 'back' : 'front');
                      }
                    }}
                  >
                    <motion.div style={{ rotateX, rotateY: rotateYBase, transformStyle: 'preserve-3d' }}>
                      {isTimeCapsule ? (
                        <div 
                          className="relative flex items-center justify-center"
                          style={{ 
                            width: activeSide === 'front' ? '580px' : '550px',
                            height: activeSide === 'front' ? '380px' : '432px',
                            transform: 'scale(0.85)',
                            transformOrigin: 'center center',
                            transformStyle: 'preserve-3d',
                            transition: 'width 0.3s ease, height 0.3s ease',
                          }}
                        >
                          {/* Front: Envelope (580 x 380) */}
                          <div 
                            className="w-[580px] h-[380px] absolute"
                            style={{ 
                              backfaceVisibility: 'hidden',
                              WebkitBackfaceVisibility: 'hidden',
                              transform: 'rotateY(0deg)'
                            }}
                          >
                            <TimeEnvelopeCard state={exportData} isShowcase={false} />
                          </div>
                          {/* Back: Letter (550 x 432) */}
                          <div 
                            className="w-[550px] h-[432px] absolute"
                            style={{ 
                              backfaceVisibility: 'hidden',
                              WebkitBackfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)'
                            }}
                          >
                            <TimeLetterCard state={exportData} isShowcase={false} />
                          </div>
                        </div>
                      ) : isBounty ? (
                        <div 
                          className="relative flex items-center justify-center"
                          style={{ 
                            width: `${previewW}px`, 
                            height: `${previewH}px`,
                            transform: 'scale(0.68)',
                            transformOrigin: 'center center',
                            transformStyle: 'preserve-3d',
                          }}
                        >
                          <BountyPosterCard state={exportData} activeSide="front" isShowcase={false} />
                        </div>
                      ) : isPhotoBooth ? (
                        <div 
                          className="relative flex items-center justify-center"
                          style={{ 
                            width: `${previewW}px`, 
                            height: `${previewH}px`,
                            transform: previewH > 650 ? 'scale(0.65)' : 'scale(0.85)',
                            transformOrigin: 'center center'
                          }}
                        >
                          <PhotoBoothStrip state={exportData} activeSlotIndex={null} />
                        </div>
                      ) : isTravelID ? (
                        <div className="w-[500px] h-[315px] relative" style={{ transformStyle: 'preserve-3d' }}>
                          <div 
                            className="absolute inset-0 origin-top-left"
                            style={{ 
                              transform: 'scale(0.65789)', // 500 / 760 = 0.65789
                              transformStyle: 'preserve-3d' 
                            }}
                          >
                            <TravelIDCard idState={exportData} activeSide={activeSide} />
                          </div>
                        </div>
                      ) : (
                        <TicketStub state={exportData} activeSide={activeSide} showShadow={false} />
                      )}
                    </motion.div>
                  </motion.div>
                </div>
              </div>
              
              {/* CLICK TO FLIP Scribble Text (Only for double-sided ID/Ticket) */}
              {!isPhotoBooth && !isBounty && (
                <div className="absolute bottom-2 right-2 sm:bottom-auto sm:top-12 sm:right-12 z-40 pointer-events-none flex items-center gap-1 sm:gap-2 opacity-85">
                  <span className="font-marker text-[11px] sm:text-2xl text-[#F4F1EA] uppercase tracking-widest handwritten-text">
                    CLICK TO FLIP
                  </span>
                  <img src="/assets/dottedUpArrow.svg" alt="Arrow" className="w-3.5 h-3.5 sm:w-8 sm:h-8 rotate-180 brightness-0 invert handwritten-text" />
                </div>
              )}
            </div>

            {/* 3. Right: Export Options (Scrollable on mobile) */}
            <div className="w-full lg:w-[410px] p-3.5 sm:p-6 bg-[#F4F1EA] flex-1 min-h-0 lg:flex-none lg:h-full flex flex-col gap-3.5 sm:gap-6 overflow-y-auto select-none touch-pan-y overscroll-contain">
              <div className="flex flex-col gap-1 sm:gap-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-marker text-xl sm:text-3xl lg:text-4xl uppercase handwritten-text tracking-tighter">Export Lab</h2>
                  <span className="lg:hidden font-mono text-[9px] font-bold px-2 py-0.5 bg-[#FFEB3B] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] uppercase tracking-wider">
                    {isTimeCapsule ? 'Time Capsule' : isBounty ? 'Wanted Poster' : isPhotoBooth ? 'Photostrip' : isTravelID ? (exportData?.cardType || 'Travel ID') : 'Ticket'}
                  </span>
                </div>
                <div className="h-0.5 sm:h-1 w-full bg-[#1A1A1A]" />
              </div>

              <div className="flex flex-col gap-3 sm:gap-4">
                <label className="font-mono font-bold uppercase text-xs sm:text-sm">Print Format</label>
                {isTimeCapsule ? (
                  <div className="flex flex-col gap-2.5 sm:gap-3">
                    {/* Option 1: Letter Print (Archival Letterhead 300 DPI) */}
                    <label className={`border-2 sm:border-4 border-[#1A1A1A] p-2.5 sm:p-3 cursor-pointer transition-all ${printMode === 'borderless' ? 'bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[4px_4px_0px_#1A1A1A] -translate-x-0.5 -translate-y-0.5' : 'bg-white hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <input 
                          type="radio" 
                          name="timePrintMode"
                          checked={printMode === 'borderless'} 
                          onChange={() => {
                            setPrintMode('borderless');
                            setIncludeBleed(false);
                            setActiveSide('back');
                          }} 
                          className="w-4 h-4 accent-[#1A1A1A]" 
                        />
                        <div className="flex flex-col w-full">
                          <div className="flex items-center justify-between">
                            <span className="font-bold font-mono text-xs sm:text-sm">Letter Print</span>
                            <span className="text-[8px] sm:text-[9px] font-mono font-bold bg-[#1A1A1A] text-[#FFEB3B] px-1.5 py-0.5 uppercase">
                              300 DPI • ARCHIVAL
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs font-mono text-[#1A1A1A]/75 mt-0.5">
                            Archival letterhead print with authentic stationary tone, border line, and stamp.
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Option 2: Envelope DIY Craft Sheet */}
                    <label className={`border-2 sm:border-4 border-[#1A1A1A] p-2.5 sm:p-3 cursor-pointer transition-all ${printMode === 'fold-glue' ? 'bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[4px_4px_0px_#1A1A1A] -translate-x-0.5 -translate-y-0.5' : 'bg-white hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <input 
                          type="radio" 
                          name="timePrintMode"
                          checked={printMode === 'fold-glue'} 
                          onChange={() => {
                            setPrintMode('fold-glue');
                            setIncludeBleed(true);
                            setActiveSide('front');
                          }} 
                          className="w-4 h-4 accent-[#1A1A1A]" 
                        />
                        <div className="flex flex-col w-full">
                          <div className="flex items-center justify-between">
                            <span className="font-bold font-mono text-xs sm:text-sm">Envelope DIY Sheet (2-Page)</span>
                            <span className="text-[8px] sm:text-[9px] font-mono font-bold bg-[#1A1A1A] text-white px-1.5 py-0.5 uppercase">
                              A4 • 2-PAGE CRAFT
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs font-mono text-[#1A1A1A]/75 mt-0.5">
                            Page 1: 100% unmarked envelope net (margin guides trim away with scrap). Page 2: Visual 6-step assembly guide.
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Option 3: DIY Stamps & Seals Sheet */}
                    <label className={`border-2 sm:border-4 border-[#1A1A1A] p-2.5 sm:p-3 cursor-pointer transition-all ${printMode === 'stamps-decor' ? 'bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[4px_4px_0px_#1A1A1A] -translate-x-0.5 -translate-y-0.5' : 'bg-white hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <input 
                          type="radio" 
                          name="timePrintMode"
                          checked={printMode === 'stamps-decor'} 
                          onChange={() => {
                            setPrintMode('stamps-decor');
                            setIncludeBleed(true);
                          }} 
                          className="w-4 h-4 accent-[#1A1A1A]" 
                        />
                        <div className="flex flex-col w-full">
                          <div className="flex items-center justify-between">
                            <span className="font-bold font-mono text-xs sm:text-sm">DIY Stamps & Seals Sheet</span>
                            <span className="text-[8px] sm:text-[9px] font-mono font-bold bg-[#15803D] text-white px-1.5 py-0.5 uppercase">
                              A4 • CUT & STICK
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs font-mono text-[#1A1A1A]/75 mt-0.5">
                            Printable A4 sheet with selected postal stamps, wax seals, and ribbons with cut marks for crafting.
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Digital Delivery & Shareable Web Link (Clean, Minimal, Production-level) */}
                    <div className="mt-1 pt-2.5 sm:pt-3 border-t-2 border-[#1A1A1A]/20 flex flex-col gap-2 sm:gap-2.5">
                      <div className="flex items-center justify-between">
                        <label className="font-mono font-bold uppercase text-[11px] sm:text-xs text-[#1A1A1A]">
                          Digital Delivery & Shareable Web Link
                        </label>
                        <span className="text-[8px] font-mono font-bold bg-[#1A1A1A] text-[#FFEB3B] px-1.5 py-0.5 uppercase">
                          WEB & EMAIL
                        </span>
                      </div>

                      {/* Option 1: Send to Future Self or Someone Else */}
                      <div className="bg-white border-2 border-[#1A1A1A] p-2.5 sm:p-3 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-1 sm:gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#1A1A1A]">
                            Send to Future Self or Someone Else
                          </span>
                          <span className="text-[8px] font-mono font-bold bg-[#1A1A1A] text-white px-1.5 py-0.5 uppercase">
                            SCHEDULED
                          </span>
                        </div>
                        <p className="font-mono text-[10px] text-[#1A1A1A]/70 leading-snug">
                          Schedule automated email delivery on your unlock date for either your future self or a special recipient.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playPop();
                            closeExport();
                            window.dispatchEvent(new CustomEvent('OPEN_EMAIL_DISPATCH', { detail: exportData }));
                          }}
                          className="w-full mt-1 bg-[#FFEB3B] text-[#1A1A1A] border-2 border-[#1A1A1A] py-1.5 font-mono text-[10px] sm:text-[11px] font-bold uppercase shadow-[1px_1px_0px_#1A1A1A] hover:bg-[#FFF176] transition-all cursor-pointer text-center"
                        >
                          Configure & Schedule Delivery
                        </button>
                      </div>

                      {/* Option 2: Share Link */}
                      <div className="bg-white border-2 border-[#1A1A1A] p-2.5 sm:p-3 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-1 sm:gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#1A1A1A]">
                            Share Link
                          </span>
                          <span className="text-[8px] font-mono font-bold bg-[#15803D] text-white px-1.5 py-0.5 uppercase">
                            WEB EXPERIENCE
                          </span>
                        </div>
                        <p className="font-mono text-[10px] text-[#1A1A1A]/70 leading-snug">
                          Recipient web link with interactive cutting mat, desk lines, and realistic unsealing animation.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 mt-1">
                          <button
                            type="button"
                            onClick={handleCopyTimeLetterLink}
                            className="flex-1 bg-[#1A1A1A] text-[#FFEB3B] border-2 border-[#1A1A1A] py-1.5 font-mono text-[10px] sm:text-[11px] font-bold uppercase shadow-[1px_1px_0px_#1A1A1A] hover:bg-[#2A2A2A] transition-all cursor-pointer text-center"
                          >
                            {copiedShareLink ? 'COPIED LINK' : 'COPY SHARE LINK'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              soundFX.playPop();
                              const url = generateLetterShareUrl(exportData);
                              window.open(url, '_blank');
                            }}
                            className="flex-1 bg-[#F4F1EA] text-[#1A1A1A] border-2 border-[#1A1A1A] py-1.5 font-mono text-[10px] sm:text-[11px] font-bold uppercase shadow-[1px_1px_0px_#1A1A1A] hover:bg-white transition-all cursor-pointer text-center"
                          >
                            Open Web Letter ↗
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : isBounty ? (
                  <div className="flex flex-col gap-2.5 sm:gap-3">
                    {/* Option 1: Exact Poster (Borderless) */}
                    <label className={`border-2 sm:border-4 border-[#1A1A1A] p-2.5 sm:p-3 cursor-pointer transition-all ${printMode !== 'a4-sheet' ? 'bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[4px_4px_0px_#1A1A1A] -translate-x-0.5 -translate-y-0.5' : 'bg-white hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <input 
                          type="radio" 
                          name="bountyPrintMode"
                          checked={printMode !== 'a4-sheet'} 
                          onChange={() => {
                            setPrintMode('borderless');
                            setIncludeBleed(false);
                          }} 
                          className="w-4 h-4 accent-[#1A1A1A]" 
                        />
                        <div className="flex flex-col w-full">
                          <div className="flex items-center justify-between">
                            <span className="font-bold font-mono text-xs sm:text-sm">Exact Poster (Borderless)</span>
                            <span className="text-[8px] sm:text-[9px] font-mono font-bold bg-[#1A1A1A] text-[#FFEB3B] px-1.5 py-0.5 uppercase">
                              300 DPI
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs font-mono text-[#1A1A1A]/75 mt-0.5">
                            Zero white margins. Best for wallpapers, framing, and digital.
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Option 2: A4 Print Sheet */}
                    <label className={`border-2 sm:border-4 border-[#1A1A1A] p-2.5 sm:p-3 cursor-pointer transition-all ${printMode === 'a4-sheet' ? 'bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[4px_4px_0px_#1A1A1A] -translate-x-0.5 -translate-y-0.5' : 'bg-white hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <input 
                          type="radio" 
                          name="bountyPrintMode"
                          checked={printMode === 'a4-sheet'} 
                          onChange={() => {
                            setPrintMode('a4-sheet');
                            setIncludeBleed(true);
                          }} 
                          className="w-4 h-4 accent-[#1A1A1A]" 
                        />
                        <div className="flex flex-col w-full">
                          <div className="flex items-center justify-between">
                            <span className="font-bold font-mono text-xs sm:text-sm">A4 Print Sheet</span>
                            <span className="text-[8px] sm:text-[9px] font-mono font-bold bg-[#1A1A1A] text-white px-1.5 py-0.5 uppercase">
                              A4 • CUT MARKS
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs font-mono text-[#1A1A1A]/75 mt-0.5">
                            Centered on A4 with outer cut marks for scissors cutting.
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                ) : isPhotoBooth ? (
                  <div className="border-2 sm:border-4 border-[#1A1A1A] p-2.5 sm:p-4 bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[4px_4px_0px_#1A1A1A]">
                    <div className="flex items-center gap-2.5 sm:gap-3 mb-1">
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-[#1A1A1A] bg-[#1A1A1A] flex items-center justify-center">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white" />
                      </div>
                      <span className="font-bold font-mono text-xs sm:text-sm">Single Photostrip (1-Page)</span>
                      <span className="text-[8px] sm:text-[9px] font-mono font-bold bg-[#1A1A1A] text-[#FFEB3B] px-1.5 py-0.5 uppercase tracking-wider ml-auto">
                        300 DPI
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs font-mono ml-6 sm:ml-7 text-[#1A1A1A]/85">
                      Exact 1:1 scale photostrip with zero excess margins. Ready for photo paper or phone cases.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 sm:gap-3">
                    {/* Option 1: DIY Fold & Glue */}
                    <label className={`border-2 sm:border-4 border-[#1A1A1A] p-2.5 sm:p-3.5 cursor-pointer transition-all ${printMode === 'fold-glue' ? 'bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[4px_4px_0px_#1A1A1A] translate-x-[-1px] translate-y-[-1px] sm:translate-x-[-2px] sm:translate-y-[-2px]' : 'bg-white hover:bg-gray-50'}`}>
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <input 
                          type="radio" 
                          checked={printMode === 'fold-glue'} 
                          onChange={() => {
                            setPrintMode('fold-glue');
                            setIncludeBleed(true);
                          }} 
                          className="w-4 h-4 mt-0.5 accent-[#1A1A1A]" 
                        />
                        <div className="flex flex-col gap-0.5 sm:gap-1 w-full">
                          <div className="flex items-center justify-between">
                            <span className="font-bold font-mono text-xs sm:text-sm">DIY Fold & Glue (A4 Sheet)</span>
                            <span className="text-[8px] sm:text-[9px] font-mono font-bold bg-[#1A1A1A] text-[#FFEB3B] px-1.5 py-0.5 uppercase tracking-wider">
                              HOME PRINTER
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs font-mono text-[#1A1A1A]/75 leading-snug">
                            {isTravelID 
                              ? '1:1 scale A4 sheet. Fold & glue for a wallet-ready double-sided card.' 
                              : '1:1 scale A4 sheet with fold line. Guaranteed front/back alignment.'}
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Option 2: Pro Duplex / PVC Print */}
                    <label className={`border-2 sm:border-4 border-[#1A1A1A] p-2.5 sm:p-3.5 cursor-pointer transition-all ${printMode === 'duplex' ? 'bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[4px_4px_0px_#1A1A1A] translate-x-[-1px] translate-y-[-1px] sm:translate-x-[-2px] sm:translate-y-[-2px]' : 'bg-white hover:bg-gray-50'}`}>
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <input 
                          type="radio" 
                          checked={printMode === 'duplex'} 
                          onChange={() => {
                            setPrintMode('duplex');
                            setIncludeBleed(false);
                          }} 
                          className="w-4 h-4 mt-0.5 accent-[#1A1A1A]" 
                        />
                        <div className="flex flex-col gap-0.5 sm:gap-1 w-full">
                          <div className="flex items-center justify-between">
                            <span className="font-bold font-mono text-xs sm:text-sm">Pro Direct / PVC (Exact Size)</span>
                            <span className="text-[8px] sm:text-[9px] font-mono font-bold bg-[#E91E63] text-white px-1.5 py-0.5 uppercase tracking-wider">
                              PVC & DUAL PNG
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs font-mono text-[#1A1A1A]/75 leading-snug">
                            {isTravelID 
                              ? 'Auto-borderless 2-page PDF (85.6 × 54mm) + separate Front & Back PNGs for card printers.' 
                              : 'Auto-borderless 2-page PDF + separate Front & Back PNGs for direct card & ticket printing.'}
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Include Bleed / Cut Marks Option (Hidden for Bounty & PhotoBooth where format already determines it) */}
              {!isBounty && !isPhotoBooth && printMode !== 'duplex' && (
                <label className="flex items-center gap-2.5 sm:gap-3 mt-1 sm:mt-2 cursor-pointer group">
                  <div className="relative w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#1A1A1A] bg-white flex items-center justify-center shadow-[1px_1px_0px_#1A1A1A] sm:shadow-[2px_2px_0px_#1A1A1A] transition-all">
                    <input 
                      type="checkbox" 
                      checked={includeBleed} 
                      onChange={(e) => setIncludeBleed(e.target.checked)} 
                      className="opacity-0 absolute inset-0 cursor-pointer" 
                    />
                    {includeBleed && <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#1A1A1A]" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono font-bold uppercase text-xs sm:text-sm">Include Bleed / Cut Marks</span>
                    <span className="font-mono text-[10px] sm:text-[11px] text-[#1A1A1A]/60">
                      Adds outer trim guidelines for scissors or craft knife cutting
                    </span>
                  </div>
                </label>
              )}

              {/* Error display */}
              {exportError && (
                <div className="bg-red-100 border-2 border-red-400 text-red-700 p-3 font-mono text-sm">
                  {exportError}
                </div>
              )}

              <div className="mt-auto flex flex-col gap-2.5 sm:gap-3 pt-3 sm:pt-4 pb-4 sm:pb-0">
                {isBounty ? (
                  <>
                    <button 
                      type="button"
                      onClick={handleDownloadPDF}
                      disabled={exportingType !== null}
                      className="w-full bg-[#1A1A1A] text-[#FFEB3B] font-marker text-sm sm:text-base lg:text-lg py-2.5 sm:py-3.5 px-3 sm:px-4 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] sm:hover:translate-x-[2px] sm:hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1A1A1A] sm:hover:shadow-[2px_2px_0px_#1A1A1A] transition-all uppercase tracking-wider sm:tracking-widest handwritten-text disabled:opacity-50 flex items-center justify-center cursor-pointer"
                    >
                      {exportingType === 'pdf' ? 'GENERATING PDF...' : 'DOWNLOAD PDF'}
                    </button>
                    <button 
                      type="button"
                      onClick={handleDownloadPNG}
                      disabled={exportingType !== null}
                      className="w-full bg-white text-[#1A1A1A] font-marker text-sm sm:text-base lg:text-lg py-2.5 sm:py-3.5 px-3 sm:px-4 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] sm:hover:translate-x-[2px] sm:hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1A1A1A] sm:hover:shadow-[2px_2px_0px_#1A1A1A] transition-all uppercase tracking-wider sm:tracking-widest handwritten-text disabled:opacity-50 flex items-center justify-center cursor-pointer"
                    >
                      {exportingType === 'png' ? 'GENERATING PNG...' : 'DOWNLOAD PNG'}
                    </button>
                    <p className="font-mono text-[10px] sm:text-[11px] text-[#1A1A1A]/70 text-center leading-tight">
                      * 300 DPI Ultra High-Resolution • Exact 1:1 Canvas Match
                    </p>
                  </>
                ) : printMode === 'duplex' && !isPhotoBooth ? (
                  <>
                    <button 
                      type="button"
                      onClick={handleDownloadPNG}
                      disabled={exportingType !== null}
                      className="w-full bg-[#1A1A1A] text-[#FFEB3B] font-marker text-sm sm:text-base lg:text-lg py-2.5 sm:py-3.5 px-3 sm:px-4 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] sm:hover:translate-x-[2px] sm:hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1A1A1A] sm:hover:shadow-[2px_2px_0px_#1A1A1A] transition-all uppercase tracking-wider sm:tracking-widest handwritten-text disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {exportingType === 'png'
                        ? 'Downloading Front & Back...'
                        : 'Download PNGs (Front & Back)'}
                    </button>
                    <button 
                      type="button"
                      onClick={handleDownloadPDF}
                      disabled={exportingType !== null}
                      className="w-full bg-white text-[#1A1A1A] font-marker text-xs sm:text-sm lg:text-base py-2 sm:py-3 px-3 sm:px-4 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] sm:hover:translate-x-[2px] sm:hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1A1A1A] sm:hover:shadow-[2px_2px_0px_#1A1A1A] transition-all uppercase tracking-wider sm:tracking-widest handwritten-text disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {exportingType === 'pdf' 
                        ? 'Generating PDF...' 
                        : isTravelID 
                          ? 'Download PDF (2-Page Card)'
                          : 'Download PDF (2-Page Ticket)'}
                    </button>
                    <p className="font-mono text-[9px] sm:text-[10px] text-[#1A1A1A]/70 text-center leading-tight">
                      * Direct PVC card & ticket print: Auto-borderless with zero white background on both PNG and PDF.
                    </p>
                  </>
                ) : (
                  <>
                    <button 
                      type="button"
                      onClick={handleDownloadPDF}
                      disabled={exportingType !== null}
                      className="w-full bg-[#1A1A1A] text-[#FFEB3B] font-marker text-sm sm:text-base lg:text-lg py-2.5 sm:py-3.5 px-3 sm:px-4 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] sm:hover:translate-x-[2px] sm:hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1A1A1A] sm:hover:shadow-[2px_2px_0px_#1A1A1A] transition-all uppercase tracking-wider sm:tracking-widest handwritten-text disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {exportingType === 'pdf' 
                        ? 'Generating PDF...' 
                        : isPhotoBooth 
                          ? 'Download PDF (Photostrip)'
                          : 'Download PDF (A4 Sheet)'}
                    </button>
                    <button 
                      type="button"
                      onClick={handleDownloadPNG}
                      disabled={exportingType !== null}
                      className="w-full bg-white text-[#1A1A1A] font-marker text-sm sm:text-base lg:text-lg py-2.5 sm:py-3.5 px-3 sm:px-4 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] sm:hover:translate-x-[2px] sm:hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#1A1A1A] sm:hover:shadow-[2px_2px_0px_#1A1A1A] transition-all uppercase tracking-wider sm:tracking-widest handwritten-text disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {exportingType === 'png'
                        ? 'Generating PNG...'
                        : isPhotoBooth
                          ? 'Download PNG (Photostrip)'
                          : 'Download PNG (A4 Sheet)'}
                    </button>
                    <p className="font-mono text-[9px] sm:text-[10px] text-[#1A1A1A]/70 text-center leading-tight">
                      * 300 DPI high-resolution export for authentic physical printing.
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
