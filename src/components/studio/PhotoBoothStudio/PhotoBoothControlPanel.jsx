import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeoInput, validateDateField } from '../../ui/NeoInput';
import { PHOTO_BOOTH_TOKENS } from '../../../features/photobooth/tokens/photoBoothTokens';
import { soundFX } from '../../../utils/audio';

const validateCaption = (val) => {
  if (!val) return '';
  if (val.length > 20) return 'Max 20 chars';
  if (!/^[a-zA-Z0-9\s.,!?'"#-]*$/.test(val)) return 'Letters & numbers only';
  return '';
};

export function PhotoBoothControlPanel({
  state,
  activeSlotIndex,
  onSelectSlot,
  onUpdateState,
  onUpdatePhotoSlot,
  onReset,
  disabled,
  isShowcase,
  isMobileDrawer = false,
}) {
  const fileInputRef = useRef(null);
  const singleSlotInputRef = useRef(null);
  const [showAdjustDrawer, setShowAdjustDrawer] = useState(true);

  const photoCount = state?.photoCount || 4;
  const frameStyleId = state?.frameStyle || 'cat-photographer';
  const paperColor = state?.paperColor || '#FFFFFF';
  const filterId = state?.filter || 'none';
  const caption = state?.caption || 'KITTE PHOTOBOOTH';
  const dateText = state?.dateText || '14/10/2026';
  const showDate = state?.showDate !== false;
  const showBottomChin = state?.showBottomChin !== false;

  const photos = state?.photos || PHOTO_BOOTH_TOKENS.showcaseDefaults.photos;
  const activePhotos = photos.slice(0, photoCount);
  const uploadedCount = activePhotos.filter(p => !!p.src).length;
  const isExportReady = !isShowcase && (uploadedCount === photoCount);

  const activeSlot = photos[activeSlotIndex] || photos[0];

  // Multi-upload handler
  const handleMultiUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.slice(0, photoCount).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result;
        if (src) {
          onUpdatePhotoSlot(idx, {
            src,
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            rotation: 0,
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Single slot replace upload
  const handleSingleSlotUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && activeSlotIndex !== null) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result;
        if (src) {
          onUpdatePhotoSlot(activeSlotIndex, {
            src,
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            rotation: 0,
          });
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const settingsContent = (
    <>
      {/* Hidden file pickers */}
      <input 
        type="file" 
        ref={fileInputRef} 
        multiple 
        accept="image/*" 
        className="hidden" 
        onChange={handleMultiUpload} 
      />
      <input 
        type="file" 
        ref={singleSlotInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleSingleSlotUpload} 
      />
        
        {/* =====================================================================
            1. PHOTO STRIP LAYOUT SELECTOR (2, 3, or 4 Photos)
            ===================================================================== */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">
              Strip Layout
            </label>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#FFEB3B] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] uppercase">
              {photoCount} Photos
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[2, 3, 4].map(count => (
              <button
                key={`count-${count}`}
                onClick={() => {
                  onUpdateState('photoCount', count);
                  if (activeSlotIndex >= count) {
                    onSelectSlot(count - 1);
                  }
                }}
                className={`py-2 px-3 border-2 border-[#1A1A1A] font-mono font-bold text-xs uppercase tracking-wider transition-all flex flex-col items-center gap-1 ${
                  photoCount === count 
                    ? 'bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A] translate-x-[-1px] translate-y-[-1px]' 
                    : 'bg-white hover:bg-neutral-50 shadow-none'
                }`}
              >
                <span>{count} Pics</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="w-1.5 h-2 bg-[#1A1A1A]/70 rounded-[0.5px]" />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* =====================================================================
            2. PHOTO UPLOADS & 2x2 SLOT GRID
            ===================================================================== */}
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">
              Photos
            </label>
            <span className={`font-mono text-[10px] font-bold px-2 py-0.5 border-2 border-[#1A1A1A] uppercase tracking-wider ${
              isExportReady 
                ? 'bg-[#A7F3D0] text-[#065F46] shadow-[2px_2px_0px_#065F46]' 
                : 'bg-[#FFCDD2] text-[#B71C1C] shadow-[2px_2px_0px_#B71C1C]'
            }`}>
              {uploadedCount} / {photoCount} Uploaded
            </span>
          </div>

          {/* Master Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-[#FFEB3B] border-2 border-[#1A1A1A] p-2.5 shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] transition-all flex items-center justify-center gap-2 font-mono font-bold text-xs uppercase cursor-pointer"
          >
            <img src="/assets/upload.svg" className="w-4 h-4" alt="Upload" />
            Upload {photoCount} Photos at once
          </button>

          {/* 2x2 Slot Grid in 3:4 Portrait Rectangle */}
          <div className="grid grid-cols-2 gap-2 justify-items-center mt-1">
            {[0, 1, 2, 3].map(index => {
              const isActiveSlot = index < photoCount;
              const isSelected = activeSlotIndex === index && isActiveSlot;
              const slot = photos[index];
              const hasImg = Boolean(slot?.src);

              if (!isActiveSlot) {
                return (
                  <div 
                    key={`slot-box-${index}`} 
                    className="w-[105px] h-[140px] border-2 border-dashed border-[#1A1A1A]/30 bg-neutral-200/50 rounded-xs flex flex-col items-center justify-center opacity-40 select-none"
                  >
                    <span className="font-mono text-[9px] font-bold text-[#1A1A1A]/40 uppercase">Slot #{index + 1} (Off)</span>
                  </div>
                );
              }

              return (
                <div
                  key={`slot-box-${index}`}
                  onClick={() => {
                    onSelectSlot(index);
                    setShowAdjustDrawer(true);
                  }}
                  className={`w-[105px] h-[140px] border-2 border-[#1A1A1A] rounded-xs relative cursor-pointer overflow-hidden transition-all flex flex-col items-center justify-center ${
                    isSelected 
                      ? 'bg-[#FFEB3B] shadow-[3px_3px_0px_#1A1A1A] ring-2 ring-[#1A1A1A]' 
                      : 'bg-white hover:bg-neutral-50 shadow-[1px_1px_0px_#1A1A1A]'
                  }`}
                >
                  {hasImg ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-white overflow-hidden p-0.5">
                      <img 
                        src={slot.src} 
                        alt={`Slot ${index + 1}`} 
                        className="w-full h-full object-contain" 
                      />
                      <div className="absolute top-1 left-1 bg-black/70 text-white font-mono text-[8px] font-bold px-1 rounded-xs">
                        #{index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdatePhotoSlot(index, { src: null });
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-white/90 hover:bg-red-500 hover:text-white rounded-xs border border-[#1A1A1A] flex items-center justify-center font-mono text-[10px] font-bold cursor-pointer"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-center text-[#1A1A1A]/70">
                      <span className="font-mono text-sm font-black">+</span>
                      <span className="font-mono text-[9px] font-bold uppercase mt-0.5">
                        Slot #{index + 1}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Slot Inspector Drawer */}
          {activeSlot?.src && (
            <div className="mt-1">
              <button
                onClick={() => setShowAdjustDrawer(prev => !prev)}
                className="w-full flex items-center justify-between text-left font-mono text-xs font-bold text-[#1A1A1A] border-b border-[#1A1A1A]/30 pb-1 cursor-pointer"
              >
                <span>Edit Photo #{activeSlotIndex + 1} Settings</span>
                <span>{showAdjustDrawer ? '▲' : '▼'}</span>
              </button>

              <AnimatePresence>
                {showAdjustDrawer && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-2 border-[#1A1A1A] bg-white p-3.5 flex flex-col gap-3 shadow-[2px_2px_0px_#1A1A1A] mt-2">
                      {/* Zoom / Scale Slider */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center font-mono text-[10px] font-bold uppercase">
                          <span>Scale / Zoom</span>
                          <span>{Math.round((activeSlot.scale || 1) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="3"
                          step="0.05"
                          value={activeSlot.scale || 1}
                          onChange={(e) => onUpdatePhotoSlot(activeSlotIndex, { scale: parseFloat(e.target.value) })}
                          className="w-full accent-[#1A1A1A]"
                        />
                      </div>

                      {/* Pan X Slider */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center font-mono text-[10px] font-bold uppercase">
                          <span>Horizontal Pan</span>
                          <span>{activeSlot.offsetX || 0}%</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          step="1"
                          value={activeSlot.offsetX || 0}
                          onChange={(e) => onUpdatePhotoSlot(activeSlotIndex, { offsetX: parseInt(e.target.value) })}
                          className="w-full accent-[#1A1A1A]"
                        />
                      </div>

                      {/* Pan Y Slider */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center font-mono text-[10px] font-bold uppercase">
                          <span>Vertical Pan</span>
                          <span>{activeSlot.offsetY || 0}%</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          step="1"
                          value={activeSlot.offsetY || 0}
                          onChange={(e) => onUpdatePhotoSlot(activeSlotIndex, { offsetY: parseInt(e.target.value) })}
                          className="w-full accent-[#1A1A1A]"
                        />
                      </div>

                      {/* Action Row: Rotate & Replace */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            const curRot = activeSlot.rotation || 0;
                            onUpdatePhotoSlot(activeSlotIndex, { rotation: (curRot + 90) % 360 });
                          }}
                          className="flex-1 py-1.5 px-2 border-2 border-[#1A1A1A] bg-[#F4F1EA] hover:bg-[#FFEB3B] font-mono text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                          ↻ Rotate 90°
                        </button>
                        <button
                          onClick={() => singleSlotInputRef.current?.click()}
                          className="flex-1 py-1.5 px-2 border-2 border-[#1A1A1A] bg-[#F4F1EA] hover:bg-[#FFEB3B] font-mono text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                          Replace Pic
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* =====================================================================
            3. 10 CURATED FRAME STYLES SELECTOR (With Mini-Card Previews)
            ===================================================================== */}
        <div className="flex flex-col gap-2.5">
          <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">
            Frame Styles
          </label>

          <div className="grid grid-cols-2 gap-2">
            {PHOTO_BOOTH_TOKENS.frameStyles.map(frame => {
              const isSelected = frameStyleId === frame.id;
              return (
                <button
                  key={frame.id}
                  onClick={() => {
                    onUpdateState('frameStyle', frame.id);
                    if (frame.defaultColor) {
                      onUpdateState('paperColor', frame.defaultColor);
                    }
                  }}
                  className={`p-2.5 border-2 border-[#1A1A1A] rounded-xs text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#FFEB3B] shadow-[3px_3px_0px_#1A1A1A] translate-x-[-1px] translate-y-[-1px]' 
                      : 'bg-white hover:bg-neutral-50 shadow-[1px_1px_0px_#1A1A1A]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[8px] font-black uppercase px-1 py-0.5 bg-[#1A1A1A] text-white rounded-xs">
                      {frame.badge}
                    </span>
                    {frame.iconAsset && (
                      <div className="w-5 h-5 shrink-0">
                        <img src={frame.iconAsset} alt={frame.name} className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-mono text-xs font-black tracking-tight text-[#1A1A1A] truncate">
                      {frame.name}
                    </h4>
                    <p className="font-mono text-[9px] text-[#1A1A1A]/70 line-clamp-1 leading-tight mt-0.5">
                      {frame.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* =====================================================================
            4. PAPER / CARDSTOCK COLOR PALETTE
            ===================================================================== */}
        <div className="flex flex-col gap-2">
          <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">
            Paper Color
          </label>
          <div className="flex flex-wrap gap-2.5">
            {PHOTO_BOOTH_TOKENS.colors.map(color => (
              <button
                key={color.id}
                onClick={() => onUpdateState('paperColor', color.hex)}
                className={`w-8 h-8 rounded-full border-2 border-[#1A1A1A] transition-all cursor-pointer ${
                  paperColor === color.hex 
                    ? 'scale-110 shadow-[3px_3px_0px_#1A1A1A] z-10' 
                    : 'hover:scale-105 shadow-[2px_2px_0px_#1A1A1A]'
                }`}
                style={{ backgroundColor: color.hex }}
                aria-label={`Select ${color.name} color`}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* =====================================================================
            5. PHOTO FILTERS (Color & B&W Options)
            ===================================================================== */}
        <div className="flex flex-col gap-2">
          <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">
            Photo Filter
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PHOTO_BOOTH_TOKENS.filters.map(filter => {
              const isSelected = filterId === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => onUpdateState('filter', filter.id)}
                  className={`py-2 px-2.5 border-2 border-[#1A1A1A] text-left transition-all ${
                    isSelected 
                      ? 'bg-[#FFEB3B] shadow-[2px_2px_0px_#1A1A1A] translate-x-[-1px] translate-y-[-1px]' 
                      : 'bg-white hover:bg-neutral-50'
                  }`}
                >
                  <span className="font-mono text-xs font-bold block">{filter.name}</span>
                  <span className="font-mono text-[9px] text-[#1A1A1A]/60 block">{filter.subtitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =====================================================================
            6. BOTTOM CHIN & CAPTION TOGGLE
            ===================================================================== */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">
              Bottom Section
            </label>
            <span className="font-mono text-[9px] font-bold px-2 py-0.5 bg-[#FFEB3B] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] uppercase">
              {showBottomChin ? 'Chin Active' : 'Frames Only'}
            </span>
          </div>

          {/* Toggle Chin Switch */}
          <button 
            type="button"
            id="toggle-bottom-chin"
            onClick={() => onUpdateState('showBottomChin', !showBottomChin)}
            className="w-full flex items-center justify-between p-3 bg-white border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] cursor-pointer hover:bg-neutral-50 transition-all select-none text-left"
          >
            <div className="flex flex-col">
              <span className="font-marker text-sm uppercase text-[#1A1A1A] leading-tight">
                Include Bottom Chin
              </span>
              <span className="font-mono text-[9px] text-[#1A1A1A]/70 mt-0.5">
                {showBottomChin ? 'Caption, date & stickers enabled' : 'Pure compact photo frames only'}
              </span>
            </div>
            <div className={`w-11 h-6 border-2 border-[#1A1A1A] rounded-full flex items-center p-0.5 transition-colors ${
              showBottomChin ? 'bg-[#FFEB3B] justify-end' : 'bg-neutral-200 justify-start'
            }`}>
              <div className="w-4 h-4 rounded-full bg-[#1A1A1A] shadow-xs" />
            </div>
          </button>

          {/* If chin is enabled, show caption and date inputs */}
          {showBottomChin && (
            <div className="flex flex-col gap-3 pt-1">
              <NeoInput
                label="Caption"
                name="caption"
                value={caption}
                maxLength={20}
                validate={validateCaption}
                onChange={(e) => onUpdateState('caption', e.target.value.toUpperCase())}
                placeholder="KITTE PHOTOBOOTH"
              />

              <div className="flex items-center gap-2 mt-0.5">
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs font-bold uppercase">
                  <input 
                    type="checkbox" 
                    checked={showDate} 
                    onChange={(e) => onUpdateState('showDate', e.target.checked)}
                    className="w-4 h-4 accent-[#1A1A1A]"
                  />
                  Include Date Stamp
                </label>
              </div>

              {showDate && (
                <NeoInput
                  label="Date"
                  name="dateText"
                  value={dateText}
                  maxLength={10}
                  isDate={true}
                  validate={validateDateField}
                  onChange={(e) => onUpdateState('dateText', e.target.value)}
                  placeholder="14/10/2026"
                />
              )}
            </div>
          )}
        </div>
    </>
  );

  const actionButtons = (
    <div className={`p-4 border-t-4 border-[#1A1A1A] bg-[#F4F1EA] flex flex-col gap-3 shrink-0 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <button 
        type="button"
        onClick={onReset} 
        className="w-full bg-[#F4F1EA] text-[#1A1A1A] font-marker font-bold text-sm py-2 border-[3px] border-[#1A1A1A] hover:bg-[#e51717] hover:text-white transition-colors uppercase tracking-wider handwritten-text border-b-[6px] cursor-pointer"
      >
        Reset Progress
      </button>

      {/* EXPORT BUTTON: Disabled when user hasn't filled all slots */}
      <button 
        type="button"
        id="export-photostrip-btn"
        onClick={() => {
          if (!isExportReady) return;
          soundFX.playSnap();
          window.dispatchEvent(new CustomEvent('OPEN_EXPORT', {
            detail: {
              type: 'Photo Booth',
              data: {
                ...state,
                isShowcase: !!isShowcase,
              }
            }
          }));
        }}
        disabled={!isExportReady} 
        className={`w-full font-marker text-xl py-4 border-[3px] border-[#1A1A1A] transition-all uppercase tracking-widest handwritten-text border-b-[6px] ${
          !isExportReady 
            ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed opacity-60 border-b-[3px]' 
            : 'bg-[#1A1A1A] text-[#FFEB3B] hover:bg-[#2A2A2A] active:border-b-[3px] active:translate-y-[3px] cursor-pointer'
        }`}
      >
        Export Photostrip
      </button>
    </div>
  );

  // 1. Mobile Drawer View
  if (isMobileDrawer) {
    return (
      <div className={`w-full flex flex-col gap-6 select-none pb-8 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {settingsContent}
        {actionButtons}
      </div>
    );
  }

  // 2. Desktop View: 100% UNCHANGED
  return (
    <aside className="w-[360px] h-full border-r-4 border-[#1A1A1A] bg-[#F4F1EA] flex flex-col z-10 shrink-0">
      <div className={`flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-6 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {settingsContent}
      </div>
      {actionButtons}
    </aside>
  );
}
