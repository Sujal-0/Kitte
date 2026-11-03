import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DELIVERY_PRESETS,
  calculateDeliveryDate 
} from '../../../features/time-letter/tokens/timeLetterTokens';
import { generateLetterShareUrl } from '../../../features/time-letter/utils/timeLetterShare';
import { 
  buildFutureMeEmailHtml, 
  buildFutureMeVaultConfirmationHtml,
  buildFutureMePlainText 
} from '../../../features/time-letter/utils/futureMeEmailTemplate';
import { generateFutureMeEmailAttachments } from '../../../features/time-letter/utils/futureMeAttachments';
import { scheduleFutureLetter } from '../../../services/futureMeService';
import { NeoDatePicker } from '../../ui/calendar';
import { soundFX } from '../../../utils/audio';

export function TimeLetterEmailModal({
  isOpen,
  onClose,
  state,
  onUpdateState
}) {
  const [recipientEmail, setRecipientEmail] = useState(state?.recipientEmail || '');
  const [selectedPreset, setSelectedPreset] = useState(state?.deliveryPreset || '1-year');
  const [customDate, setCustomDate] = useState(state?.customDate || '');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    return state?.deliveryDate || calculateDeliveryDate(state?.deliveryPreset || '1-year', state?.customDate);
  });

  const [isScheduled, setIsScheduled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const modalOpenTime = React.useRef(Date.now());

  useEffect(() => {
    if (state) {
      setRecipientEmail(state.recipientEmail || '');
      setSelectedPreset(state.deliveryPreset || '1-year');
      setCustomDate(state.customDate || '');
      setDeliveryDate(state.deliveryDate || calculateDeliveryDate(state.deliveryPreset || '1-year', state.customDate));
    }
  }, [state, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsScheduled(false);
      setErrorMessage('');
      setCopiedLink(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const effectiveEmail = recipientEmail.trim() || state?.recipientEmail || '';

  // Compose complete effective state
  const effectiveState = {
    ...state,
    letterMode: 'future-self',
    recipient: 'Future Me',
    recipientEmail: effectiveEmail,
    deliveryPreset: selectedPreset,
    customDate,
    deliveryDate
  };

  const shareUrl = generateLetterShareUrl(effectiveState);
  const emailHtml = buildFutureMeEmailHtml({
    state: effectiveState,
    shareUrl,
    deliveryDate,
    effectiveEmail: effectiveEmail || 'your.future.self@example.com'
  });
  const plainText = buildFutureMePlainText({
    state: effectiveState,
    shareUrl,
    deliveryDate,
    effectiveEmail: effectiveEmail || 'your.future.self@example.com'
  });

  const handlePresetSelect = (presetId) => {
    soundFX.playPop();
    setSelectedPreset(presetId);
    if (presetId === 'custom') {
      const effectiveCustom = customDate || calculateDeliveryDate('1-year');
      setCustomDate(effectiveCustom);
      const newDate = calculateDeliveryDate('custom', effectiveCustom);
      setDeliveryDate(newDate);
      if (onUpdateState) {
        onUpdateState('deliveryPreset', 'custom');
        onUpdateState('customDate', effectiveCustom);
        onUpdateState('deliveryDate', newDate);
      }
    } else {
      const newDate = calculateDeliveryDate(presetId, customDate);
      setDeliveryDate(newDate);
      if (onUpdateState) {
        onUpdateState('deliveryPreset', presetId);
        onUpdateState('deliveryDate', newDate);
      }
    }
  };

  const handleCustomDateChange = (isoStr, displayStr) => {
    setCustomDate(isoStr);
    const newDate = displayStr || calculateDeliveryDate('custom', isoStr);
    setDeliveryDate(newDate);
    if (onUpdateState) {
      onUpdateState('customDate', isoStr);
      onUpdateState('deliveryDate', newDate);
      onUpdateState('deliveryPreset', 'custom');
    }
  };

  const handleEmailChange = (val) => {
    setRecipientEmail(val);
    setErrorMessage('');
    if (onUpdateState) {
      onUpdateState('recipientEmail', val);
    }
  };

  // Primary Action: Schedule to Future Self (FutureMe core flow)
  const handleScheduleFutureMe = async () => {
    soundFX.playSnap();

    // Spam Protection: Honeypot check
    if (honeypot || Date.now() - modalOpenTime.current < 900) {
      setIsScheduled(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!recipientEmail.trim() || !emailRegex.test(recipientEmail.trim())) {
      setErrorMessage('Please enter a valid email address (e.g. yourname@domain.com).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Generate real 300 DPI PDF attachments (Letterhead, Foldable Origami Envelope, Stamps Sheet)
      let attachments = [];
      try {
        attachments = await generateFutureMeEmailAttachments(effectiveState);
      } catch (attErr) {
        console.warn('PDF attachments generation notice:', attErr);
      }

      const confirmHtml = buildFutureMeVaultConfirmationHtml({
        state: effectiveState,
        shareUrl,
        deliveryDate,
        effectiveEmail: recipientEmail.trim()
      });

      await scheduleFutureLetter({
        state: effectiveState,
        effectiveEmail: recipientEmail.trim(),
        deliveryDate,
        shareUrl,
        htmlContent: emailHtml,
        confirmHtmlContent: confirmHtml,
        plainTextContent: plainText,
        attachments,
        website_hp: honeypot
      });

      setIsScheduled(true);
      if (typeof soundFX.playSuccess === 'function') soundFX.playSuccess();
      else soundFX.playSnap();
    } catch (err) {
      console.error('Failed to schedule letter:', err);
      setErrorMessage(err.message || 'Error scheduling letter.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyShareLink = () => {
    soundFX.playPop();
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleOpenSharePreview = () => {
    soundFX.playPop();
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-4 select-none"
      >
        <motion.div
          initial={{ scale: 0.94, y: 12 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 12 }}
          className="bg-[#F4F1EA] border-2 sm:border-[3px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] sm:shadow-[8px_8px_0px_#1A1A1A] p-3.5 sm:p-6 max-w-md w-full flex flex-col gap-3 sm:gap-4 relative my-auto max-h-[92vh] sm:max-h-[90vh] overflow-y-auto overscroll-contain"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#1A1A1A]/20 pb-2.5 sm:pb-3">
            <div>
              <h2 className="font-marker text-xl sm:text-2xl uppercase tracking-wider text-[#1A1A1A] handwritten-text leading-tight">
                {isScheduled ? 'Letter Vaulted' : 'Send to Future Self'}
              </h2>
              <span className="font-mono text-[8px] sm:text-[9px] font-bold text-[#1A1A1A]/70 uppercase tracking-widest block mt-0.5">
                {isScheduled ? 'SEALED KEEPSAKE IN TIME VAULT' : 'DIGITAL TIME CAPSULE DISPATCH'}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-marker text-xl text-[#1A1A1A] hover:text-[#B91C1C] cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* If already scheduled: Minimal, Friendly & Elegant Vaulted Confirmation */}
          {isScheduled ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-2 gap-3 sm:gap-3.5"
            >
              {/* Wax Seal / Stamp Medallion */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#B91C1C] text-white flex items-center justify-center border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[3px_3px_0px_#1A1A1A] my-1">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div>
                <h3 className="font-marker text-xl sm:text-2xl text-[#1A1A1A] handwritten-text leading-tight">
                  Sealed into the Vault!
                </h3>
                <p className="font-mono text-[11px] sm:text-xs text-[#1A1A1A]/75 mt-1 sm:mt-1.5 leading-relaxed px-1 sm:px-2">
                  Your letter is sealed and safe in the archive. We will deliver it to your inbox on <strong className="text-[#B91C1C] font-extrabold">{deliveryDate}</strong>.
                </p>
              </div>

              {/* Clean Summary Card */}
              <div className="w-full bg-white border-2 border-[#1A1A1A] p-2.5 sm:p-3 shadow-[2px_2px_0px_#1A1A1A] text-left font-mono text-xs flex flex-col gap-1 sm:gap-1.5">
                <div className="flex justify-between items-center py-0.5 border-b border-[#1A1A1A]/10 pb-1 sm:pb-1.5">
                  <span className="text-[#1A1A1A]/60 text-[9px] sm:text-[10px] uppercase font-bold">Delivery To:</span>
                  <span className="font-bold text-[#1A1A1A] truncate max-w-[180px] sm:max-w-[210px]">{recipientEmail}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-[#1A1A1A]/60 text-[9px] sm:text-[10px] uppercase font-bold">Unlock Date:</span>
                  <span className="font-extrabold text-[#B91C1C]">{deliveryDate}</span>
                </div>
              </div>

              {/* Action Buttons: Secret Link & Preview */}
              <div className="w-full flex flex-col sm:flex-row items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className={`w-full sm:flex-1 font-mono text-[11px] sm:text-xs font-bold py-2 sm:py-2.5 px-3 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase ${
                    copiedLink ? 'bg-[#FFEB3B] text-[#1A1A1A]' : 'bg-white hover:bg-[#FAF7EE] text-[#1A1A1A]'
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>{copiedLink ? 'COPIED LINK' : 'COPY SHARE LINK'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenSharePreview}
                  className="w-full sm:w-auto bg-[#F4F1EA] hover:bg-white text-[#1A1A1A] font-mono text-[11px] sm:text-xs font-bold py-2 sm:py-2.5 px-3 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] transition-all cursor-pointer shrink-0 uppercase text-center"
                  title="Open live web letter in new tab"
                >
                  Open Web Letter ↗
                </button>
              </div>

              {/* Primary Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#1A1A1A] text-[#FFEB3B] hover:bg-[#2A2A2A] font-marker text-base sm:text-lg py-2.5 sm:py-3 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[1px] sm:active:translate-y-[2px] transition-all uppercase tracking-wider cursor-pointer mt-1"
              >
                Back to Studio
              </button>
            </motion.div>
          ) : (
            /* Scheduling Form */
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Form Card */}
              <div className="bg-white border-2 border-[#1A1A1A] p-2.5 sm:p-3.5 shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[3px_3px_0px_#1A1A1A] flex flex-col gap-2.5 sm:gap-3.5 font-mono text-xs relative">
                {/* Honeypot field (hidden from humans) */}
                <input
                  type="text"
                  name="website_hp"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="opacity-0 absolute -z-50 pointer-events-none h-0 w-0"
                />

                {/* Recipient Email Input */}
                <div className="flex flex-col gap-1">
                  <label className="text-[#1A1A1A]/70 uppercase font-bold text-[9px] sm:text-[10px]">
                    YOUR EMAIL ADDRESS (DELIVERY DESTINATION):
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full border-2 border-[#1A1A1A] px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-mono font-bold bg-[#FAF7EE] text-[#1A1A1A] focus:outline-none focus:bg-white"
                  />
                </div>

                {/* Target Delivery Date (Presets + Custom Calendar) */}
                <div className="flex flex-col gap-1 sm:gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[#1A1A1A]/70 uppercase font-bold text-[9px] sm:text-[10px]">
                      DELIVER ON (UNLOCK DATE):
                    </label>
                    <span className="font-mono text-[10px] sm:text-[11px] font-extrabold text-[#B91C1C] bg-[#FFF5F5] px-1.5 sm:px-2 py-0.5 border border-[#B91C1C]">
                      {deliveryDate}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1">
                    {DELIVERY_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePresetSelect(p.id)}
                        className={`py-1 sm:py-1.5 px-0.5 sm:px-1 font-mono text-[9px] sm:text-[10px] font-bold uppercase border border-[#1A1A1A] transition-all cursor-pointer text-center truncate ${
                          selectedPreset === p.id 
                            ? 'bg-[#FFEB3B] text-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A] font-extrabold' 
                            : 'bg-[#FAF7EE] text-[#1A1A1A]/70 hover:bg-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Neobrutalism Custom Date Picker with Year Navigation */}
                  {selectedPreset === 'custom' && (
                    <div className="mt-1">
                      <NeoDatePicker 
                        label=""
                        value={customDate}
                        onChange={handleCustomDateChange}
                        minDate={new Date(Date.now() + 86400000)}
                        placeholder="Click anywhere to pick custom unlock date..."
                      />
                    </div>
                  )}
                </div>

                {/* Keepsake details */}
                <div className="pt-2 border-t border-[#1A1A1A]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] font-mono text-[#1A1A1A]/70">
                  <span className="font-bold uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-600" />
                    Archival Keepsake:
                  </span>
                  <span className="text-[#1A1A1A]/60">
                    Includes 300 DPI Letter &amp; Envelope Craft Sheet
                  </span>
                </div>
              </div>

              {/* Error Message if email invalid */}
              {errorMessage && (
                <div className="bg-amber-100 border-2 border-amber-600 text-amber-900 p-2 sm:p-2.5 font-mono text-xs font-bold">
                  {errorMessage}
                </div>
              )}

              {/* Single Core Primary Action: Send to Future Self */}
              <button
                type="button"
                onClick={handleScheduleFutureMe}
                disabled={isSubmitting}
                className="w-full bg-[#1A1A1A] text-[#FFEB3B] font-marker text-sm sm:text-base lg:text-lg py-2.5 sm:py-3.5 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[3px_3px_0px_#1A1A1A] hover:bg-[#2A2A2A] active:translate-y-[1px] sm:active:translate-y-[2px] transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="truncate">
                  {isSubmitting ? 'Scheduling Letter...' : `Send to Future Self (${deliveryDate})`}
                </span>
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
