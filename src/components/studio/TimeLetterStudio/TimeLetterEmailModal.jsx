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
    if (!recipientEmail.trim() || !recipientEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address so FutureMe can deliver your letter.');
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
        attachments
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
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 select-none"
      >
        <motion.div
          initial={{ scale: 0.94, y: 12 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 12 }}
          className="bg-[#F4F1EA] border-[3px] border-[#1A1A1A] shadow-[8px_8px_0px_#1A1A1A] p-6 max-w-md w-full flex flex-col gap-4 relative my-auto max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#1A1A1A]/20 pb-3">
            <div>
              <h2 className="font-marker text-2xl uppercase tracking-wider text-[#1A1A1A] handwritten-text leading-tight">
                {isScheduled ? 'Letter Vaulted' : 'Send to Future Self'}
              </h2>
              <span className="font-mono text-[9px] font-bold text-[#1A1A1A]/70 uppercase tracking-widest block mt-0.5">
                {isScheduled ? 'SEALED KEEPSAKE IN TIME VAULT' : 'DIGITAL TIME CAPSULE DISPATCH'}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center font-marker text-xl text-[#1A1A1A] hover:text-[#B91C1C] cursor-pointer"
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
              className="flex flex-col items-center text-center py-2 gap-3.5"
            >
              {/* Wax Seal / Stamp Medallion */}
              <div className="w-16 h-16 rounded-full bg-[#B91C1C] text-white flex items-center justify-center border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] my-1">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div>
                <h3 className="font-marker text-2xl text-[#1A1A1A] handwritten-text leading-tight">
                  Sealed into the Vault!
                </h3>
                <p className="font-mono text-xs text-[#1A1A1A]/75 mt-1.5 leading-relaxed px-2">
                  Your letter is sealed and safe in the archive. We will deliver it to your inbox on <strong className="text-[#B91C1C] font-extrabold">{deliveryDate}</strong>.
                </p>
              </div>

              {/* Clean Summary Card */}
              <div className="w-full bg-white border-2 border-[#1A1A1A] p-3 shadow-[2px_2px_0px_#1A1A1A] text-left font-mono text-xs flex flex-col gap-1.5">
                <div className="flex justify-between items-center py-0.5 border-b border-[#1A1A1A]/10 pb-1.5">
                  <span className="text-[#1A1A1A]/60 text-[10px] uppercase font-bold">Delivery To:</span>
                  <span className="font-bold text-[#1A1A1A] truncate max-w-[210px]">{recipientEmail}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-[#1A1A1A]/60 text-[10px] uppercase font-bold">Unlock Date:</span>
                  <span className="font-extrabold text-[#B91C1C]">{deliveryDate}</span>
                </div>
              </div>

              {/* Action Buttons: Secret Link & Preview */}
              <div className="w-full flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className={`flex-1 font-mono text-xs font-bold py-2.5 px-3 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase ${
                    copiedLink ? 'bg-[#FFEB3B] text-[#1A1A1A]' : 'bg-white hover:bg-[#FAF7EE] text-[#1A1A1A]'
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Secret Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenSharePreview}
                  className="bg-white hover:bg-[#FAF7EE] text-[#1A1A1A] font-mono text-xs font-bold py-2.5 px-3 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] transition-all cursor-pointer shrink-0 uppercase"
                  title="Open live preview in new tab"
                >
                  Preview ↗
                </button>
              </div>

              {/* Primary Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#1A1A1A] text-[#FFEB3B] hover:bg-[#2A2A2A] font-marker text-lg py-3 border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[2px] transition-all uppercase tracking-wider cursor-pointer mt-1"
              >
                Back to Studio
              </button>
            </motion.div>
          ) : (
            /* Scheduling Form */
            <div className="flex flex-col gap-4">
              {/* Form Card */}
              <div className="bg-white border-2 border-[#1A1A1A] p-3.5 shadow-[3px_3px_0px_#1A1A1A] flex flex-col gap-3.5 font-mono text-xs">
                {/* Recipient Email Input */}
                <div className="flex flex-col gap-1">
                  <label className="text-[#1A1A1A]/70 uppercase font-bold text-[10px]">
                    YOUR EMAIL ADDRESS (DELIVERY DESTINATION):
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full border-2 border-[#1A1A1A] px-3 py-2 text-xs font-mono font-bold bg-[#FAF7EE] text-[#1A1A1A] focus:outline-none focus:bg-white"
                  />
                </div>

                {/* Target Delivery Date (Presets + Custom Calendar) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[#1A1A1A]/70 uppercase font-bold text-[10px]">
                      DELIVER ON (UNLOCK DATE):
                    </label>
                    <span className="font-mono text-[11px] font-extrabold text-[#B91C1C] bg-[#FFF5F5] px-2 py-0.5 border border-[#B91C1C]">
                      {deliveryDate}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1">
                    {DELIVERY_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePresetSelect(p.id)}
                        className={`py-1.5 px-1 font-mono text-[10px] font-bold uppercase border border-[#1A1A1A] transition-all cursor-pointer text-center ${
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
                <div className="pt-2 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[10px] font-mono text-[#1A1A1A]/70">
                  <span className="font-bold uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Archival Keepsake:
                  </span>
                  <span className="text-[#1A1A1A]/60">
                    Includes 300 DPI Letter &amp; Envelope Craft Sheet
                  </span>
                </div>
              </div>

              {/* Error Message if email invalid */}
              {errorMessage && (
                <div className="bg-amber-100 border-2 border-amber-600 text-amber-900 p-2.5 font-mono text-xs font-bold">
                  {errorMessage}
                </div>
              )}

              {/* Single Core Primary Action: Send to Future Self */}
              <button
                type="button"
                onClick={handleScheduleFutureMe}
                disabled={isSubmitting}
                className="w-full bg-[#1A1A1A] text-[#FFEB3B] font-marker text-lg py-3.5 border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] hover:bg-[#2A2A2A] active:translate-y-[2px] transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>
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
