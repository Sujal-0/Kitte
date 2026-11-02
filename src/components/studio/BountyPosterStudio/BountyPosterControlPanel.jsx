import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  formatBountyInput, 
  sanitizePirateName, 
  MAX_NAME_LENGTH, 
  MAX_BOUNTY_DIGITS 
} from '../../../features/bounty-poster/tokens/bountyTokens';
import { soundFX } from '../../../utils/audio';

export function BountyPosterControlPanel({
  state,
  onUpdate,
  onReset,
  disabled,
  isShowcase,
  isMobileDrawer = false,
}) {
  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const [showAdjustDrawer, setShowAdjustDrawer] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result;
        if (src) {
          soundFX.playPop();
          onUpdate('imageSrc', src);
          onUpdate('imageScale', 1);
          onUpdate('imageOffsetX', 0);
          onUpdate('imageOffsetY', 0);
          setShowAdjustDrawer(true);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleNameChange = (e) => {
    const sanitized = sanitizePirateName(e.target.value);
    onUpdate('name', sanitized);
  };

  const handleBountyChange = (e) => {
    const formatted = formatBountyInput(e.target.value);
    onUpdate('bounty', formatted);
  };

  const handleInsertDot = () => {
    soundFX.playSnap();
    const input = nameInputRef.current;
    const currentName = state.name || '';

    if (input) {
      const start = input.selectionStart ?? currentName.length;
      const end = input.selectionEnd ?? currentName.length;
      const updated = sanitizePirateName(currentName.slice(0, start) + '·' + currentName.slice(end));
      onUpdate('name', updated);

      // Automatically place cursor right after the newly inserted dot
      requestAnimationFrame(() => {
        input.focus();
        const newPos = Math.min(start + 1, MAX_NAME_LENGTH);
        input.setSelectionRange(newPos, newPos);
      });
    } else {
      onUpdate('name', sanitizePirateName(currentName + '·'));
    }
  };

  const isExportReady = !isShowcase && Boolean(state?.imageSrc) && Boolean(state?.name?.trim());

  return (
    <aside className={`${isMobileDrawer ? 'w-full h-auto border-r-0' : 'w-[350px] h-full border-r-4'} border-[#1A1A1A] bg-[#F4F1EA] flex flex-col z-10 shrink-0`}>
      
      {/* Main Settings Container (Disabled & Dimmed in Showcase Mode, matching Travel ID) */}
      <div className={`${isMobileDrawer ? 'overflow-visible' : 'flex-1 overflow-y-auto overflow-x-hidden'} p-4 relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex flex-col gap-6 pb-6">
          
          {/* 1. Portrait Photo Upload Section (Matching Travel ID 1:1) */}
          <div className="flex flex-col gap-2">
            <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">
              Portrait Photo
            </label>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
            
            {!state.imageSrc ? (
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-[#FFEB3B] border-2 border-[#1A1A1A] p-3 shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] transition-all flex items-center justify-center gap-2 font-mono font-bold uppercase cursor-pointer"
              >
                <img src="/assets/upload.svg" className="w-5 h-5" alt="Upload" />
                Upload Photo
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <div 
                  onClick={() => setShowAdjustDrawer(prev => !prev)}
                  className={`border-2 border-[#1A1A1A] bg-white p-2 flex flex-col gap-2 shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] transition-all cursor-pointer group ${showAdjustDrawer ? 'bg-[#FFEB3B]' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 border-2 border-[#1A1A1A] overflow-hidden shrink-0 bg-[#E5E5E5]">
                      <img 
                        src={state.imageSrc} 
                        className="w-full h-full object-cover" 
                        alt="Preview" 
                        style={{ 
                          transform: `translate(${state.imageOffsetX || 0}%, ${state.imageOffsetY || 0}%) scale(${state.imageScale || 1})`,
                        }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-mono text-xs font-bold truncate">Uploaded Portrait</p>
                      <p className="font-mono text-[10px] text-[#1A1A1A]/60 uppercase tracking-wider mt-1 group-hover:text-[#1A1A1A] transition-colors">
                        {showAdjustDrawer ? 'Close Settings' : 'Click to Adjust / Crop'}
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate('imageSrc', null);
                        setShowAdjustDrawer(false);
                      }}
                      className="w-8 h-8 shrink-0 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors border-2 border-transparent hover:border-[#1A1A1A] cursor-pointer"
                      title="Remove"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Adjust Drawer */}
                <AnimatePresence>
                  {showAdjustDrawer && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-2 border-[#1A1A1A] border-t-0 bg-[#F4F1EA] p-4 flex flex-col gap-4 shadow-[2px_2px_0px_#1A1A1A]">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between">
                            <label className="font-mono text-[10px] font-bold uppercase">Scale / Zoom</label>
                            <span className="font-mono text-[10px]">{Math.round((state.imageScale || 1) * 100)}%</span>
                          </div>
                          <input 
                            type="range" min="0.5" max="3" step="0.05" 
                            value={state.imageScale || 1} 
                            onChange={(e) => onUpdate('imageScale', parseFloat(e.target.value))}
                            className="w-full accent-[#1A1A1A] cursor-pointer" 
                          />
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between">
                            <label className="font-mono text-[10px] font-bold uppercase">Horizontal Pan</label>
                            <span className="font-mono text-[10px]">{Math.round(state.imageOffsetX || 0)}%</span>
                          </div>
                          <input 
                            type="range" min="-50" max="50" step="1" 
                            value={state.imageOffsetX || 0} 
                            onChange={(e) => onUpdate('imageOffsetX', parseFloat(e.target.value))}
                            className="w-full accent-[#1A1A1A] cursor-pointer" 
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between">
                            <label className="font-mono text-[10px] font-bold uppercase">Vertical Pan</label>
                            <span className="font-mono text-[10px]">{Math.round(state.imageOffsetY || 0)}%</span>
                          </div>
                          <input 
                            type="range" min="-50" max="50" step="1" 
                            value={state.imageOffsetY || 0} 
                            onChange={(e) => onUpdate('imageOffsetY', parseFloat(e.target.value))}
                            className="w-full accent-[#1A1A1A] cursor-pointer" 
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* 2. Pirate Name Input + Insert Dot */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">
                Pirate Name
              </label>
              <button
                type="button"
                onClick={handleInsertDot}
                className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#FFEB3B] border-2 border-[#1A1A1A] shadow-[1px_1px_0px_#1A1A1A] hover:bg-yellow-300 transition-all uppercase cursor-pointer"
                title="Insert Japanese Middle Dot"
              >
                Insert · Dot
              </button>
            </div>

            <input
              ref={nameInputRef}
              type="text"
              value={state.name || ''}
              onChange={handleNameChange}
              maxLength={MAX_NAME_LENGTH}
              placeholder="MONKEY·D·LUFFY"
              className="w-full p-3 bg-white border-2 border-[#1A1A1A] font-mono font-bold text-base tracking-wider text-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] uppercase focus:outline-none focus:bg-[#FFFDE7]"
            />
            <div className="flex justify-between font-mono text-[10px] text-[#1A1A1A]/60 px-0.5">
              <span>Max {MAX_NAME_LENGTH} characters</span>
              <span>{(state.name || '').length}/{MAX_NAME_LENGTH}</span>
            </div>
          </div>

          {/* 3. Bounty (Berries ฿) Input */}
          <div className="flex flex-col gap-2">
            <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">
              Bounty (Berries ฿)
            </label>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 font-bounty-digits text-2xl text-[#1A1A1A]/70 select-none">
                ฿
              </span>
              <input
                type="text"
                value={state.bounty || ''}
                onChange={handleBountyChange}
                maxLength={26}
                placeholder="3,000,000,000"
                className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-[#1A1A1A] font-bounty-digits text-2xl text-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] focus:outline-none focus:bg-[#FFFDE7]"
              />
            </div>
            <div className="flex justify-between font-mono text-[10px] text-[#1A1A1A]/60 px-0.5">
              <span>Numbers (Max 18 digits) or text</span>
              <span>{(state.bounty || '').replace(/[^0-9]/g, '').length ? `${(state.bounty || '').replace(/[^0-9]/g, '').length}/18 digits` : ''}</span>
            </div>
          </div>

          {/* 4. Parchment Texture & Grain Checkbox Toggle */}
          <div className="flex flex-col gap-3 pt-2 border-t-2 border-[#1A1A1A]/15">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={state.showPaperCreases !== false}
                  onChange={(e) => onUpdate('showPaperCreases', e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 border-2 border-[#1A1A1A] bg-white peer-checked:bg-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] transition-all group-hover:shadow-[1px_1px_0px_#1A1A1A] group-hover:translate-x-[1px] group-hover:translate-y-[1px]" />
                <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="font-mono text-sm font-bold uppercase text-[#1A1A1A] group-hover:text-[#e51717] transition-colors">
                Parchment Texture & Grain
              </span>
            </label>
          </div>

        </div>
      </div>

      {/* Bottom Action Buttons (Matching Travel ID Studio 1:1) */}
      <div className={`p-4 border-t-4 border-[#1A1A1A] bg-[#F4F1EA] flex flex-col gap-3 shrink-0 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <button 
          type="button"
          onClick={onReset} 
          className="w-full bg-[#F4F1EA] text-[#1A1A1A] font-marker font-bold text-sm py-2 border-[3px] border-[#1A1A1A] hover:bg-[#e51717] hover:text-white transition-colors uppercase tracking-wider handwritten-text border-b-[6px] cursor-pointer"
        >
          Reset Progress
        </button>

        <button 
          type="button"
          id="export-bounty-poster-btn"
          onClick={() => {
            if (!isExportReady) return;
            soundFX.playSnap();
            window.dispatchEvent(new CustomEvent('OPEN_EXPORT', {
              detail: {
                type: 'Bounty Poster',
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
          Export Poster
        </button>
      </div>
    </aside>
  );
}
