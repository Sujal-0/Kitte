import React, { useState } from 'react';
import { 
  PAPER_THEMES, 
  ENVELOPE_THEMES, 
  ENVELOPE_BORDER_STYLES,
  ENVELOPE_BORDER_COLORS,
  ENVELOPE_FLAP_STYLES,
  POSTAL_STAMPS, 
  DECORATIVE_ACCENTS,
  ENVELOPE_DECORATION_OPTIONS,
  LETTER_FONTS,
  DELIVERY_PRESETS,
  calculateDeliveryDate,
  MAX_LETTER_BODY_LINES,
  MAX_LETTER_BODY_CHARS,
  LETTER_CHARS_PER_LINE,
  getLetterEstimatedLines,
  cutLetterBodyToFit
} from '../../../features/time-letter/tokens/timeLetterTokens';
import { NeoInput, NeoTextarea } from '../../ui/NeoInput';
import { NeoDatePicker } from '../../ui/calendar';
import { soundFX } from '../../../utils/audio';

// Validation & space constraint helpers (Matching Travel ID Studio standard)
const validateRecipient = (val) => {
  if (!val || !val.trim()) return 'Recipient required';
  if (val.trim().length < 2) return 'Min 2 characters';
  if (val.length > 20) return 'Max 20 characters';
  return '';
};

const validateAuthor = (val) => {
  if (!val || !val.trim()) return 'Author required';
  if (val.trim().length < 2) return 'Min 2 characters';
  if (val.length > 18) return 'Max 18 characters';
  return '';
};

const validateSalutation = (val) => {
  if (!val || !val.trim()) return '';
  if (val.trim().length < 2) return 'Min 2 characters';
  if (val.length > 26) return 'Max 26 characters';
  return '';
};

const validateSignOff = (val) => {
  if (!val || !val.trim()) return '';
  if (val.trim().length < 2) return 'Min 2 characters';
  if (val.length > 24) return 'Max 24 characters';
  return '';
};

const validateLocation = (val) => {
  if (!val || !val.trim()) return '';
  if (val.length > 16) return 'Max 16 characters';
  return '';
};

const validateCustomDate = (val) => {
  if (!val) return 'Date required';
  try {
    let d;
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const [y, m, day] = val.split('-').map(Number);
      d = new Date(y, m - 1, day);
    } else {
      d = new Date(val);
    }
    if (isNaN(d.getTime())) return 'Invalid date';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (targetDay.getTime() <= today.getTime()) return 'Must be future date';
    return '';
  } catch (_) {
    return 'Invalid date';
  }
};

const validateRecipientEmail = (val) => {
  if (!val || !val.trim()) return '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'Invalid email';
  if (val.length > 32) return 'Max 32 characters';
  return '';
};

const validateNotice = (val) => {
  if (!val || !val.trim()) return '';
  if (val.length > 32) return 'Max 32 characters';
  return '';
};

const validateLetterBody = (val) => {
  if (!val || !val.trim()) return 'Message required';
  if (val.trim().length < 5) return 'Min 5 characters';
  // Exceeding lines or characters is NOT a blocking validation error.
  // The system allows filling up to limit and automatically cuts exceeded content on export.
  return '';
};

export function TimeLetterControlPanel({ 
  state, 
  onUpdate, 
  onReset, 
  disabled,
  isShowcase,
  isMobileDrawer = false 
}) {
  const [activeTab, setActiveTab] = useState('letter'); // 'letter' | 'envelope'

  const maxBodyLines = (state.salutation && state.salutation.trim()) 
    ? MAX_LETTER_BODY_LINES 
    : MAX_LETTER_BODY_LINES + 1;

  const estimatedLines = getLetterEstimatedLines(state.letterBody || '', LETTER_CHARS_PER_LINE);
  const charCount = (state.letterBody || '').length;
  const bodyError = validateLetterBody(state.letterBody);

  const handleCustomDateChange = (e) => {
    const val = typeof e === 'string' ? e : (e?.target?.value || '');
    onUpdate('customDate', val);
    if (val) {
      onUpdate('deliveryDate', calculateDeliveryDate('custom', val));
    }
  };

  const handleLetterBodyChange = (e) => {
    const rawVal = e.target.value;
    // Production behavior: automatically cut content that exceeds limits
    const cutVal = cutLetterBodyToFit(rawVal, maxBodyLines, MAX_LETTER_BODY_CHARS, LETTER_CHARS_PER_LINE);
    if (cutVal !== rawVal) {
      soundFX.playSnap();
    }
    onUpdate('letterBody', cutVal);
  };

  const handleTriggerExport = (mode = 'duplex') => {
    soundFX.playSnap();
    // Automatically cut any exceeded part so the letterhead fits 100% perfectly in export
    const finalLetterBody = cutLetterBodyToFit(state.letterBody || '', maxBodyLines, MAX_LETTER_BODY_CHARS, LETTER_CHARS_PER_LINE);
    if (finalLetterBody !== state.letterBody) {
      onUpdate('letterBody', finalLetterBody);
    }

    window.dispatchEvent(new CustomEvent('OPEN_EXPORT', { 
      detail: { 
        type: 'Time Capsule', 
        data: { 
          ...state, 
          letterBody: finalLetterBody,
          isShowcase: !!isShowcase, 
          exportMode: mode,
          exportSide: state.isOpen ? 'back' : 'front' 
        } 
      } 
    }));
  };

  // Constraint matching Travel ID Studio: Blocks export if any constraint or validation fails
  const hasValidationErrors = Boolean(
    validateRecipient(state.recipient) ||
    validateAuthor(state.author) ||
    validateSalutation(state.salutation) ||
    validateLetterBody(state.letterBody) ||
    validateSignOff(state.signOff) ||
    validateLocation(state.location) ||
    (state.deliveryPreset === 'custom' && validateCustomDate(state.customDate)) ||
    validateNotice(state.envelopeNoticeText)
  );

  const canExport = !isShowcase && !hasValidationErrors && Boolean(state.letterBody && state.letterBody.trim().length > 0);

  // Active theme / colors
  const activeLetterPaper = state.letterPaperTheme || state.paperTheme || 'parchment-wax';
  const activeLetterBorderColor = state.letterBorderColor || '#B91C1C';
  const activeEnvelopeTheme = state.envelopeTheme || 'linen-cream';
  const activeEnvelopeBorderColor = state.envelopeBorderColor || '#B91C1C';

  const renderLetterControls = () => (
    <div className="flex flex-col gap-4 pb-4">
            
            {/* Recipient & Author Fields (Unified for Future Me or Anyone) */}
            <div className="flex flex-col gap-3">
              <NeoInput 
                label="To (Recipient Name)"
                name="recipient"
                value={state.recipient || ''}
                maxLength={20}
                onChange={(e) => onUpdate('recipient', e.target.value)}
                placeholder="e.g. Future Me, Priku, Best Friend"
                validate={validateRecipient}
              />

              <NeoInput 
                label="From (Author / Your Name)"
                name="author"
                value={state.author || ''}
                maxLength={18}
                onChange={(e) => onUpdate('author', e.target.value)}
                placeholder="e.g. Past You, Sam"
                validate={validateAuthor}
              />
            </div>

            {/* Time Capsule Unlock Date (Compact Neobrutalist Card) */}
            <div className="bg-white border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] font-extrabold uppercase text-[#1A1A1A]">
                  Time Capsule Unlock Date
                </label>
                <span className="font-mono text-[10px] font-extrabold text-[#B91C1C] bg-[#FFF5F5] px-1.5 py-0.5 border border-[#B91C1C]">
                  {state.deliveryDate || '1 YEAR'}
                </span>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {DELIVERY_PRESETS.map((preset) => {
                  const isSelected = state.deliveryPreset === preset.id;
                  const shortLabel = preset.id === 'custom' 
                    ? 'Cust' 
                    : preset.label.replace(' Months', 'M').replace(' Years', 'Y').replace(' Year', 'Y');

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      title={preset.label}
                      onClick={() => {
                        soundFX.playPop();
                        onUpdate('deliveryPreset', preset.id);
                        onUpdate('deliveryDate', calculateDeliveryDate(preset.id, state.customDate));
                      }}
                      className={`py-1 text-center border-2 border-[#1A1A1A] font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FFEB3B] text-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A] font-extrabold'
                          : 'bg-[#FAF7EE] text-[#1A1A1A]/70 hover:bg-white'
                      }`}
                    >
                      {shortLabel}
                    </button>
                  );
                })}
              </div>

              {state.deliveryPreset === 'custom' && (
                <div className="mt-0.5 flex flex-col gap-1.5">
                  <NeoDatePicker 
                    label=""
                    value={state.customDate || ''}
                    onChange={handleCustomDateChange}
                    minDate={new Date(Date.now() + 86400000)}
                    validate={validateCustomDate}
                    placeholder="Pick custom date..."
                  />
                  {Boolean(validateCustomDate(state.customDate)) && (
                    <div className="bg-amber-100 border-2 border-amber-600 text-amber-950 px-2.5 py-1.5 flex items-center gap-1.5 shadow-[2px_2px_0px_#d97706] mt-0.5">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span className="font-marker text-xs sm:text-sm uppercase tracking-wide leading-tight">
                        Unlock date has arrived! Pick a future date.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Salutation */}
            <NeoInput 
              label="Salutation"
              name="salutation"
              value={state.salutation || ''}
              maxLength={26}
              onChange={(e) => onUpdate('salutation', e.target.value)}
              placeholder="e.g. Dear Future Me, or Dear Priku,"
              validate={validateSalutation}
            />

            {/* Letter Body Textarea with Automatic Limit Clamping (Production Behavior) */}
            <div className="flex flex-col gap-1 w-full">
              <div className="flex justify-between items-end">
                <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">
                  Letter Message
                </label>
                <div className="flex items-center gap-1.5">
                  {bodyError ? (
                    <span className="text-red-500 font-mono text-[10px] font-bold tracking-tighter uppercase animate-pulse">
                      {bodyError}
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] font-bold text-[#1A1A1A]/40">
                      {estimatedLines}/{maxBodyLines} lines • {charCount}/{MAX_LETTER_BODY_CHARS} chars
                    </span>
                  )}
                </div>
              </div>
              <textarea
                name="letterBody"
                value={state.letterBody || ''}
                onChange={handleLetterBodyChange}
                rows={7}
                maxLength={MAX_LETTER_BODY_CHARS}
                placeholder="Write your heartfelt memories, promises, or reflections here..."
                className={`w-full border-2 ${
                  bodyError 
                    ? 'border-red-500 shadow-[2px_2px_0px_#ef4444]' 
                    : 'border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]'
                } p-2 text-xs font-mono focus:outline-none focus:translate-y-[1px] focus:translate-x-[1px] focus:shadow-[1px_1px_0px_#1A1A1A] transition-all bg-white resize-none`}
              />
            </div>

            {/* Sign-off */}
            <NeoInput 
              label="Sign-Off"
              name="signOff"
              value={state.signOff || ''}
              maxLength={24}
              onChange={(e) => onUpdate('signOff', e.target.value)}
              placeholder="With love & patience,"
              validate={validateSignOff}
            />

            {/* Letter Location (Optional) */}
            <NeoInput 
              label="Letter Location (Optional)"
              name="location"
              value={state.location || ''}
              maxLength={16}
              onChange={(e) => onUpdate('location', e.target.value.toUpperCase())}
              placeholder="e.g. KYOTO, JAPAN"
              validate={validateLocation}
            />

            {/* 1. Stationery Letter Tone (Circle color UI with shadow matching Travel ID Studio) */}
            <div className="flex flex-col gap-2 pt-2 border-t-2 border-[#1A1A1A]/10">
              <label className="font-marker text-lg uppercase tracking-wider text-[#1A1A1A] handwritten-text">
                Letter Paper Tone
              </label>
              <div className="flex gap-2.5 flex-wrap">
                {PAPER_THEMES.map(theme => {
                  const isSelected = activeLetterPaper === theme.id || state.paperTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        onUpdate('letterPaperTheme', theme.id);
                        onUpdate('paperTheme', theme.id);
                      }}
                      className={`w-8 h-8 rounded-full border-2 border-[#1A1A1A] transition-all cursor-pointer ${
                        isSelected 
                          ? 'scale-110 shadow-[3px_3px_0px_#1A1A1A] ring-2 ring-[#1A1A1A] z-10' 
                          : 'hover:scale-105 shadow-[2px_2px_0px_#1A1A1A]'
                      }`}
                      style={{ backgroundColor: theme.bgColor }}
                      aria-label={`Select ${theme.name}`}
                      title={theme.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* 2. Letter Border Style */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-bold uppercase text-[#1A1A1A]">
                Letter Border Style
              </label>
              <div className="grid grid-cols-2 gap-1">
                {ENVELOPE_BORDER_STYLES.map(style => {
                  const isSelected = (state.letterBorderStyle || 'handdrawn-single') === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        onUpdate('letterBorderStyle', style.id);
                      }}
                      className={`p-1.5 border-2 border-[#1A1A1A] font-mono text-[10px] font-bold uppercase text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#FFEB3B] text-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]' 
                          : 'bg-white text-[#1A1A1A]/70 hover:bg-[#F4F1EA]'
                      }`}
                    >
                      {style.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Letter Border Line Color (Circle color UI with shadow matching Travel ID Studio) */}
            <div className="flex flex-col gap-2">
              <label className="font-marker text-lg uppercase tracking-wider text-[#1A1A1A] handwritten-text">
                Letter Border Color
              </label>
              <div className="flex gap-2.5 flex-wrap">
                {ENVELOPE_BORDER_COLORS.map(color => {
                  const isSelected = activeLetterBorderColor === color.hex;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        onUpdate('letterBorderColor', color.hex);
                      }}
                      className={`w-8 h-8 rounded-full border-2 border-[#1A1A1A] transition-all cursor-pointer ${
                        isSelected 
                          ? 'scale-110 shadow-[3px_3px_0px_#1A1A1A] ring-2 ring-[#1A1A1A] z-10' 
                          : 'hover:scale-105 shadow-[2px_2px_0px_#1A1A1A]'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      aria-label={`Select ${color.name}`}
                      title={color.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* 4. Letter Corner Radius */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] font-bold uppercase text-[#1A1A1A]">
                  Letter Corner Radius
                </label>
                <span className="font-mono text-[10px] font-bold bg-[#1A1A1A] text-[#FFEB3B] px-1.5 py-0.5">
                  {state.letterBorderRadius !== undefined ? state.letterBorderRadius : 8}px
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: '0px Sharp', val: 0 },
                  { label: '8px Subtle', val: 8 },
                  { label: '16px Classic', val: 16 },
                  { label: '24px Round', val: 24 }
                ].map(preset => {
                  const currentR = state.letterBorderRadius !== undefined ? Number(state.letterBorderRadius) : 8;
                  const isSelected = currentR === preset.val;
                  return (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        onUpdate('letterBorderRadius', preset.val);
                      }}
                      className={`py-1.5 px-0.5 border-2 border-[#1A1A1A] font-mono text-[9px] font-bold uppercase text-center transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#FFEB3B] text-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] -translate-y-0.5' 
                          : 'bg-white text-[#1A1A1A]/70 hover:bg-[#F4F1EA]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
              <input
                type="range"
                min="0"
                max="32"
                step="2"
                value={state.letterBorderRadius !== undefined ? state.letterBorderRadius : 8}
                onChange={(e) => onUpdate('letterBorderRadius', Number(e.target.value))}
                className="w-full accent-[#1A1A1A] cursor-pointer mt-0.5"
              />
            </div>

            {/* 5. Letter Postage Stamp UI (Now available for Letter too!) */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-bold uppercase text-[#1A1A1A]">
                Letter Postal Stamp
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    onUpdate('letterStamp', 'none');
                  }}
                  className={`p-1 border-2 border-[#1A1A1A] flex flex-col items-center justify-center h-16 transition-all cursor-pointer ${
                    state.letterStamp === 'none'
                      ? 'bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A]' 
                      : 'bg-white hover:bg-[#F4F1EA]'
                  }`}
                >
                  <span className="font-mono text-[9px] font-bold text-[#1A1A1A]/70 uppercase">No Stamp</span>
                </button>
                {POSTAL_STAMPS.map(stamp => {
                  const isSelected = (state.letterStamp || 'cat-stamp') === stamp.id;
                  return (
                    <button
                      key={stamp.id}
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        onUpdate('letterStamp', stamp.id);
                      }}
                      className={`p-1 border-2 border-[#1A1A1A] flex flex-col items-center justify-between h-16 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A]' 
                          : 'bg-white hover:bg-[#F4F1EA]'
                      }`}
                    >
                      <img src={stamp.src} alt={stamp.name} className="w-8 h-8 object-contain" />
                      <span className="font-mono text-[8px] font-bold truncate max-w-full">{stamp.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Letter Seal / Header Accent */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-bold uppercase text-[#1A1A1A]">
                Letter Header Seal / Ribbon
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    onUpdate('letterCenterSeal', 'none');
                    onUpdate('letterTopLeft', 'none');
                  }}
                  className={`p-1 border-2 border-[#1A1A1A] flex flex-col items-center justify-center h-14 transition-all cursor-pointer ${
                    state.letterCenterSeal === 'none'
                      ? 'bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A]' 
                      : 'bg-white hover:bg-[#F4F1EA]'
                  }`}
                >
                  <span className="font-mono text-[8px] font-bold text-[#1A1A1A]/70 uppercase">None</span>
                </button>
                {DECORATIVE_ACCENTS.slice(0, 7).map(accent => {
                  const isSelected = (state.letterCenterSeal || 'ribbon') === accent.id;
                  return (
                    <button
                      key={accent.id}
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        onUpdate('letterCenterSeal', accent.id);
                        onUpdate('letterTopLeft', accent.id);
                      }}
                      className={`p-1 border-2 border-[#1A1A1A] flex flex-col items-center justify-center h-14 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A]' 
                          : 'bg-white hover:bg-[#F4F1EA]'
                      }`}
                    >
                      <img src={accent.src} alt={accent.name} className="w-7 h-7 object-contain" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Typography Font Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-bold uppercase text-[#1A1A1A]">
                Typography & Handwriting
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {LETTER_FONTS.map(font => {
                  const isSelected = (state.fontStyle || 'caveat') === font.id;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        onUpdate('fontStyle', font.id);
                      }}
                      className={`p-2 border-2 border-[#1A1A1A] text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A]' 
                          : 'bg-white hover:bg-[#F4F1EA]'
                      }`}
                    >
                      <div className={`${font.fontClass} text-lg text-[#1A1A1A] leading-tight`}>
                        {font.name}
                      </div>
                      <div className="font-mono text-[8px] text-[#1A1A1A]/60 uppercase mt-0.5">
                        {font.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        );

        {/* ========================================================
            TAB 2: ENVELOPE STYLING & DECORATION
           ======================================================== */}
        const renderEnvelopeControls = () => (
          <div className="flex flex-col gap-4 pb-4">
            
            {/* Envelope Notice / Occasion */}
            <NeoInput 
              label="Envelope Bottom Notice"
              name="envelopeNoticeText"
              value={state.envelopeNoticeText || ''}
              maxLength={32}
              onChange={(e) => onUpdate('envelopeNoticeText', e.target.value)}
              placeholder="e.g. DO NOT OPEN BEFORE 2036"
              validate={validateNotice}
            />

            {/* 1. Envelope Paper Tone (Circle color UI with shadow matching Travel ID Studio) */}
            <div className="flex flex-col gap-2 pt-2 border-t-2 border-[#1A1A1A]/10">
              <label className="font-marker text-lg uppercase tracking-wider text-[#1A1A1A] handwritten-text">
                Envelope Paper Tone
              </label>
              <div className="flex gap-2.5 flex-wrap">
                {ENVELOPE_THEMES.map(theme => {
                  const isSelected = activeEnvelopeTheme === theme.id || state.envelopeTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        onUpdate('envelopeTheme', theme.id);
                      }}
                      className={`w-8 h-8 rounded-full border-2 border-[#1A1A1A] transition-all cursor-pointer ${
                        isSelected 
                          ? 'scale-110 shadow-[3px_3px_0px_#1A1A1A] ring-2 ring-[#1A1A1A] z-10' 
                          : 'hover:scale-105 shadow-[2px_2px_0px_#1A1A1A]'
                      }`}
                      style={{ backgroundColor: theme.bg }}
                      aria-label={`Select ${theme.name}`}
                      title={theme.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* 2. Envelope Border Style */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-bold uppercase text-[#1A1A1A]">
                Envelope Border Style
              </label>
              <div className="grid grid-cols-2 gap-1">
                {ENVELOPE_BORDER_STYLES.map(style => {
                  const isSelected = (state.envelopeBorderStyle || 'handdrawn-single') === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        onUpdate('envelopeBorderStyle', style.id);
                      }}
                      className={`p-1.5 border-2 border-[#1A1A1A] font-mono text-[10px] font-bold uppercase text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#FFEB3B] text-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]' 
                          : 'bg-white text-[#1A1A1A]/70 hover:bg-[#F4F1EA]'
                      }`}
                    >
                      {style.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Envelope Border Line Color (Circle color UI with shadow matching Travel ID Studio) */}
            <div className="flex flex-col gap-2">
              <label className="font-marker text-lg uppercase tracking-wider text-[#1A1A1A] handwritten-text">
                Envelope Border Color
              </label>
              <div className="flex gap-2.5 flex-wrap">
                {ENVELOPE_BORDER_COLORS.map(color => {
                  const isSelected = activeEnvelopeBorderColor === color.hex;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        onUpdate('envelopeBorderColor', color.hex);
                      }}
                      className={`w-8 h-8 rounded-full border-2 border-[#1A1A1A] transition-all cursor-pointer ${
                        isSelected 
                          ? 'scale-110 shadow-[3px_3px_0px_#1A1A1A] ring-2 ring-[#1A1A1A] z-10' 
                          : 'hover:scale-105 shadow-[2px_2px_0px_#1A1A1A]'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      aria-label={`Select ${color.name}`}
                      title={color.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* 4. Envelope Corner Radius */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] font-bold uppercase text-[#1A1A1A]">
                  Envelope Corner Radius
                </label>
                <span className="font-mono text-[10px] font-bold bg-[#1A1A1A] text-[#FFEB3B] px-1.5 py-0.5">
                  {state.envelopeBorderRadius !== undefined ? state.envelopeBorderRadius : 16}px
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: '0px Sharp', val: 0 },
                  { label: '8px Subtle', val: 8 },
                  { label: '16px Classic', val: 16 },
                  { label: '24px Round', val: 24 }
                ].map(preset => {
                  const currentR = state.envelopeBorderRadius !== undefined ? Number(state.envelopeBorderRadius) : 16;
                  const isSelected = currentR === preset.val;
                  return (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        onUpdate('envelopeBorderRadius', preset.val);
                      }}
                      className={`py-1.5 px-0.5 border-2 border-[#1A1A1A] font-mono text-[9px] font-bold uppercase text-center transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#FFEB3B] text-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] -translate-y-0.5' 
                          : 'bg-white text-[#1A1A1A]/70 hover:bg-[#F4F1EA]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
              <input
                type="range"
                min="0"
                max="32"
                step="2"
                value={state.envelopeBorderRadius !== undefined ? state.envelopeBorderRadius : 16}
                onChange={(e) => onUpdate('envelopeBorderRadius', Number(e.target.value))}
                className="w-full accent-[#1A1A1A] cursor-pointer mt-0.5"
              />
            </div>

            {/* 5. Envelope Flap Style */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-bold uppercase text-[#1A1A1A]">
                Envelope Flap Shape
              </label>
              <div className="grid grid-cols-3 gap-1">
                {ENVELOPE_FLAP_STYLES.map(flap => {
                  const isSelected = (state.envelopeFlapStyle || 'triangular') === flap.id;
                  return (
                    <button
                      key={flap.id}
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        onUpdate('envelopeFlapStyle', flap.id);
                      }}
                      className={`p-1.5 border-2 border-[#1A1A1A] font-mono text-[10px] font-bold uppercase text-center transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#FFEB3B] text-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]' 
                          : 'bg-white text-[#1A1A1A]/70 hover:bg-[#F4F1EA]'
                      }`}
                    >
                      {flap.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Envelope Postage Stamp */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-bold uppercase text-[#1A1A1A]">
                Envelope Postage Stamp
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    onUpdate('envelopeStamp', 'none');
                  }}
                  className={`p-1 border-2 border-[#1A1A1A] flex flex-col items-center justify-center h-16 transition-all cursor-pointer ${
                    state.envelopeStamp === 'none'
                      ? 'bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A]' 
                      : 'bg-white hover:bg-[#F4F1EA]'
                  }`}
                >
                  <span className="font-mono text-[9px] font-bold text-[#1A1A1A]/70 uppercase">No Stamp</span>
                </button>
                {POSTAL_STAMPS.map(stamp => {
                  const isSelected = (state.envelopeStamp || 'cat-stamp') === stamp.id;
                  return (
                    <button
                      key={stamp.id}
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        onUpdate('envelopeStamp', stamp.id);
                      }}
                      className={`p-1 border-2 border-[#1A1A1A] flex flex-col items-center justify-between h-16 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A]' 
                          : 'bg-white hover:bg-[#F4F1EA]'
                      }`}
                    >
                      <img src={stamp.src} alt={stamp.name} className="w-8 h-8 object-contain" />
                      <span className="font-mono text-[8px] font-bold truncate max-w-full">{stamp.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Envelope Center Closure Seal */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-bold uppercase text-[#1A1A1A]">
                Envelope Closure Seal
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    onUpdate('envelopeCenterSeal', 'none');
                  }}
                  className={`p-1 border-2 border-[#1A1A1A] flex flex-col items-center justify-center h-14 transition-all cursor-pointer ${
                    state.envelopeCenterSeal === 'none'
                      ? 'bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A]' 
                      : 'bg-white hover:bg-[#F4F1EA]'
                  }`}
                >
                  <span className="font-mono text-[8px] font-bold text-[#1A1A1A]/70 uppercase">None</span>
                </button>
                {DECORATIVE_ACCENTS.slice(0, 7).map(accent => {
                  const isSelected = (state.envelopeCenterSeal || 'ribbon') === accent.id;
                  return (
                    <button
                      key={accent.id}
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        onUpdate('envelopeCenterSeal', accent.id);
                      }}
                      className={`p-1 border-2 border-[#1A1A1A] flex flex-col items-center justify-center h-14 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A]' 
                          : 'bg-white hover:bg-[#F4F1EA]'
                      }`}
                    >
                      <img src={accent.src} alt={accent.name} className="w-7 h-7 object-contain" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. Envelope Corner Accents */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[9px] font-bold uppercase text-[#1A1A1A]">
                  Bottom-Left Decor
                </label>
                <select
                  value={state.envelopeBottomLeft || 'none'}
                  onChange={(e) => onUpdate('envelopeBottomLeft', e.target.value)}
                  className="bg-white border-2 border-[#1A1A1A] p-1.5 font-mono text-[10px] font-bold shadow-[2px_2px_0px_#1A1A1A] cursor-pointer"
                >
                  <option value="none">Empty</option>
                  {ENVELOPE_DECORATION_OPTIONS.filter(d => d.id !== 'none').map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[9px] font-bold uppercase text-[#1A1A1A]">
                  Bottom-Right Decor
                </label>
                <select
                  value={state.envelopeBottomRight || 'none'}
                  onChange={(e) => onUpdate('envelopeBottomRight', e.target.value)}
                  className="bg-white border-2 border-[#1A1A1A] p-1.5 font-mono text-[10px] font-bold shadow-[2px_2px_0px_#1A1A1A] cursor-pointer"
                >
                  <option value="none">Empty</option>
                  {ENVELOPE_DECORATION_OPTIONS.filter(d => d.id !== 'none').map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>
  );

  const actionButtons = (
    <div className={`p-3.5 border-t-4 border-[#1A1A1A] bg-[#F4F1EA] flex flex-col gap-2 shrink-0 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <button 
        type="button"
        onClick={onReset} 
        className="w-full bg-[#F4F1EA] text-[#1A1A1A] font-marker font-bold text-xs py-2 border-2 border-[#1A1A1A] hover:bg-[#e51717] hover:text-white transition-colors uppercase tracking-wider handwritten-text border-b-4 cursor-pointer"
      >
        Reset to Showcase
      </button>

      <button 
        type="button"
        onClick={() => handleTriggerExport('duplex')}
        disabled={!canExport}
        className={`w-full font-marker text-lg py-3.5 border-[3px] border-[#1A1A1A] transition-all uppercase tracking-widest handwritten-text border-b-[6px] ${
          !canExport
            ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed opacity-60 border-b-[3px]'
            : 'bg-[#1A1A1A] text-[#FFEB3B] hover:bg-[#2A2A2A] active:border-b-[3px] active:translate-y-[2px] cursor-pointer'
        }`}
      >
        Export Keepsake Lab
      </button>

      <button 
        type="button"
        onClick={() => {
          soundFX.playPop();
          window.dispatchEvent(new CustomEvent('OPEN_EMAIL_DISPATCH', { detail: state }));
        }}
        disabled={!canExport}
        className={`w-full font-marker font-bold text-sm py-2.5 border-2 border-[#1A1A1A] border-b-4 transition-all uppercase tracking-wider handwritten-text text-center cursor-pointer ${
          !canExport
            ? 'bg-neutral-300 text-neutral-500 border-neutral-300 border-b-2 cursor-not-allowed opacity-60'
            : 'bg-[#FFEB3B] text-[#1A1A1A] hover:bg-[#FFF176] active:border-b-2 active:translate-y-[2px]'
        }`}
      >
        Digital Delivery & Share Link
      </button>
      
      {!canExport && (
        <span className={`font-mono text-[9px] text-center uppercase tracking-wide ${hasValidationErrors ? 'text-[#B91C1C] font-bold animate-pulse' : 'text-[#1A1A1A]/60'}`}>
          {isShowcase 
            ? 'Click envelope to customize' 
            : hasValidationErrors 
              ? 'Fix validation errors before export'
              : 'Write your letter message to unlock export'}
        </span>
      )}
    </div>
  );

  // 1. Mobile Drawer View
  if (isMobileDrawer) {
    return (
      <div className={`w-full flex flex-col gap-6 select-none pb-8 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Front Side (Envelope) Divider Badge */}
        <div className="mt-1 mb-2 border-t-2 border-dashed border-[#1A1A1A]/30 relative flex items-center justify-center">
          <span className="bg-[#F4F1EA] px-3 font-marker text-sm uppercase tracking-wider text-[#1A1A1A] -translate-y-1/2 border border-[#1A1A1A]/30 shadow-[1px_1px_0px_#1A1A1A] handwritten-text">
            FRONT SIDE
          </span>
        </div>
        {renderEnvelopeControls()}

        {/* Back Side (Letter) Divider Badge */}
        <div className="my-6 border-t-2 border-dashed border-[#1A1A1A]/30 relative flex items-center justify-center">
          <span className="bg-[#F4F1EA] px-3 font-marker text-sm uppercase tracking-wider text-[#1A1A1A] -translate-y-1/2 border border-[#1A1A1A]/30 shadow-[1px_1px_0px_#1A1A1A] handwritten-text">
            BACK SIDE
          </span>
        </div>
        {renderLetterControls()}

        {/* Action Buttons inside Drawer */}
        {actionButtons}
      </div>
    );
  }

  // 2. Desktop View: 100% UNCHANGED
  return (
    <aside className="w-[370px] h-full border-r-4 border-[#1A1A1A] bg-[#F4F1EA] flex flex-col z-10 shrink-0 select-none">
      
      {/* ========================================================
          HEADER: 2 CLEAN TABS (LETTER & ENVELOPE ONLY)
         ======================================================== */}
      <div className="bg-[#1A1A1A] p-2 flex items-center gap-1 shrink-0 border-b-2 border-[#1A1A1A]">
        <button
          type="button"
          onClick={() => { soundFX.playPop(); setActiveTab('letter'); }}
          className={`flex-1 py-2 px-1 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center cursor-pointer ${
            activeTab === 'letter'
              ? 'bg-[#FFEB3B] text-[#1A1A1A] shadow-[2px_2px_0px_#FFFFFF] font-extrabold'
              : 'text-[#F4F1EA]/80 hover:bg-white/10'
          }`}
        >
          <span>Letter</span>
        </button>

        <button
          type="button"
          onClick={() => { soundFX.playPop(); setActiveTab('envelope'); }}
          className={`flex-1 py-2 px-1 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center cursor-pointer ${
            activeTab === 'envelope'
              ? 'bg-[#FFEB3B] text-[#1A1A1A] shadow-[2px_2px_0px_#FFFFFF] font-extrabold'
              : 'text-[#F4F1EA]/80 hover:bg-white/10'
          }`}
        >
          <span>Envelope</span>
        </button>
      </div>

      {/* ========================================================
          TAB CONTENT AREA (Scrollable, Clean, Organized)
         ======================================================== */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden p-4 relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {activeTab === 'letter' && renderLetterControls()}
        {activeTab === 'envelope' && renderEnvelopeControls()}
      </div>

      {/* ========================================================
          BOTTOM ACTION FOOTER (Reset & Main Export Keepsake)
          (Matching Travel ID Studio: Disabled until user writes letter message)
         ======================================================== */}
      {actionButtons}

    </aside>
  );
}
