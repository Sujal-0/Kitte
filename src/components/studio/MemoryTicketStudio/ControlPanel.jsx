import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeoInput, validateDateField } from '../../ui/NeoInput';
import { soundFX } from '../../../utils/audio';

export function ControlPanel({ 
  activeSide, 
  ticketState, 
  onUpdate, 
  onFlip, 
  onReset, 
  disabled, 
  isMobileDrawer = false,
  isShowcase = false 
}) {
  
  const fileInputRef = useRef(null);
  const [showAdjustDrawer, setShowAdjustDrawer] = useState(false);
  const [formatSuggestion, setFormatSuggestion] = useState(null);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    onUpdate(name, type === 'checkbox' ? checked : value);
    if (name === 'layout') {
      setFormatSuggestion(null);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      onUpdate('imageSrc', src);
      onUpdate('imageScale', 1);
      onUpdate('imageOffsetX', 0);
      onUpdate('imageOffsetY', 0);
      onUpdate('imageFit', 'cover');
      setShowAdjustDrawer(true); // Open drawer immediately on first upload

      // Detect natural dimensions to check format fit
      const img = new Image();
      img.onload = () => {
        const isPortrait = img.naturalHeight > img.naturalWidth;
        const isLandscape = img.naturalWidth > img.naturalHeight;

        if (isPortrait && ticketState.layout === 'horizontal') {
          setFormatSuggestion({
            targetFormat: 'vertical',
            message: 'Tip: This photo is portrait-oriented. Switch ticket to Vertical for an edge-to-edge fit?',
            buttonLabel: 'Switch to Vertical',
            keepLabel: 'Keep Horizontal',
          });
        } else if (isLandscape && ticketState.layout === 'vertical') {
          setFormatSuggestion({
            targetFormat: 'horizontal',
            message: 'Tip: This photo is landscape-oriented. Switch ticket to Horizontal for an edge-to-edge fit?',
            buttonLabel: 'Switch to Horizontal',
            keepLabel: 'Keep Vertical',
          });
        } else {
          setFormatSuggestion(null);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const variants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  const renderFrontControls = () => (
    <div className="flex flex-col gap-4">
      {/* Photo Upload Section */}
      <div className="flex flex-col gap-2">
        <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">Memory Photo</label>
        
        {/* Hidden File Input */}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
        
        {!ticketState.imageSrc ? (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-[#FFEB3B] border-2 border-[#1A1A1A] p-3 shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] transition-all flex items-center justify-center gap-2 font-mono font-bold uppercase"
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
                    src={ticketState.imageSrc} 
                    className={`w-full h-full ${ticketState.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`} 
                    alt="Preview" 
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-mono text-xs font-bold truncate">Uploaded Image</p>
                  <p className="font-mono text-[10px] text-[#1A1A1A]/60 uppercase tracking-wider mt-1 group-hover:text-[#1A1A1A] transition-colors">
                    {showAdjustDrawer ? 'Close Settings' : 'Click to Adjust / Crop'}
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate('imageSrc', null);
                    setShowAdjustDrawer(false);
                    setFormatSuggestion(null);
                  }}
                  className="w-8 h-8 shrink-0 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors border-2 border-transparent hover:border-[#1A1A1A]"
                  title="Remove"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    
                    {/* Format Fit Helper Note Toast */}
                    <AnimatePresence>
                      {formatSuggestion && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ duration: 0.2 }}
                          className="relative bg-[#FFF9C4] border-2 border-[#1A1A1A] p-3 shadow-[3px_3px_0px_#1A1A1A] flex flex-col gap-2"
                        >
                          {/* Header with SVG alert icon and close button */}
                          <div className="flex items-center justify-between gap-2 border-b border-[#1A1A1A]/20 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <img src="/assets/alert.svg" className="w-4 h-4 shrink-0" alt="Notice" />
                              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]">
                                Orientation Suggestion
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFormatSuggestion(null)}
                              className="w-5 h-5 flex items-center justify-center text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FFF9C4] border border-[#1A1A1A] transition-colors cursor-pointer"
                              title="Close note"
                              aria-label="Close note"
                            >
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>

                          {/* Note Message with scribble effect animation */}
                          <div className="py-0.5">
                            <p className="font-marker text-sm text-[#1A1A1A] leading-snug tracking-wide">
                              <span className="handwritten-text font-bold">
                                {formatSuggestion.message}
                              </span>
                            </p>
                            {/* Scribble squiggle SVG */}
                            <svg className="w-full h-1 text-[#1A1A1A]/70 handwritten-text mt-0.5 overflow-visible" viewBox="0 0 100 4" fill="none" preserveAspectRatio="none">
                              <path d="M 0 2 Q 25 0, 50 2 T 100 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>

                          {/* Neo Action Buttons */}
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                onUpdate('layout', formatSuggestion.targetFormat);
                                onUpdate('imageFit', 'cover');
                                onUpdate('imageScale', 1);
                                onUpdate('imageOffsetX', 0);
                                onUpdate('imageOffsetY', 0);
                                setFormatSuggestion(null);
                              }}
                              className="flex-1 bg-[#1A1A1A] text-[#FFEB3B] font-mono text-[9px] font-bold uppercase py-1.5 px-1.5 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer text-center whitespace-nowrap"
                            >
                              {formatSuggestion.buttonLabel}
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormatSuggestion(null)}
                              className="flex-1 bg-white text-[#1A1A1A] font-mono text-[9px] font-bold uppercase py-1.5 px-1.5 border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] hover:bg-neutral-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer text-center whitespace-nowrap"
                            >
                              {formatSuggestion.keepLabel}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative w-5 h-5 border-2 border-[#1A1A1A] bg-white flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0px_#1A1A1A] transition-all">
                        <input 
                          type="checkbox" 
                          checked={ticketState.imageFit === 'contain'}
                          onChange={(e) => onUpdate('imageFit', e.target.checked ? 'contain' : 'cover')}
                          className="opacity-0 absolute inset-0 cursor-pointer" 
                        />
                        {ticketState.imageFit === 'contain' && <div className="w-2.5 h-2.5 bg-[#1A1A1A]" />}
                      </div>
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Fit Image to Box</span>
                    </label>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <label className="font-mono text-[10px] font-bold uppercase">Image Border Gap</label>
                        <span className="font-mono text-[10px]">{ticketState.imagePadding !== undefined ? ticketState.imagePadding : 8}px</span>
                      </div>
                      <input 
                        type="range" min="0" max="16" step="1" 
                        value={ticketState.imagePadding !== undefined ? ticketState.imagePadding : 8} 
                        onChange={(e) => onUpdate('imagePadding', parseInt(e.target.value))}
                        className="w-full accent-[#1A1A1A]" 
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <label className="font-mono text-[10px] font-bold uppercase">Scale (Zoom)</label>
                        <span className="font-mono text-[10px]">{ticketState.imageScale || 1}x</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="3" step="0.05" 
                        value={ticketState.imageScale || 1} 
                        onChange={(e) => onUpdate('imageScale', parseFloat(e.target.value))}
                        className="w-full accent-[#1A1A1A]" 
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <label className="font-mono text-[10px] font-bold uppercase">Horizontal Pan</label>
                        <span className="font-mono text-[10px]">{ticketState.imageOffsetX || 0}%</span>
                      </div>
                      <input 
                        type="range" min="-100" max="100" step="1" 
                        value={ticketState.imageOffsetX || 0} 
                        onChange={(e) => onUpdate('imageOffsetX', parseInt(e.target.value))}
                        className="w-full accent-[#1A1A1A]" 
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <label className="font-mono text-[10px] font-bold uppercase">Vertical Pan</label>
                        <span className="font-mono text-[10px]">{ticketState.imageOffsetY || 0}%</span>
                      </div>
                      <input 
                        type="range" min="-100" max="100" step="1" 
                        value={ticketState.imageOffsetY || 0} 
                        onChange={(e) => onUpdate('imageOffsetY', parseInt(e.target.value))}
                        className="w-full accent-[#1A1A1A]" 
                      />
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}
      </div>

      <NeoInput 
        label="Memory Location" 
        name="location" 
        value={ticketState.location} 
        onChange={handleInputChange} 
        placeholder="e.g. Kyoto, Japan" 
        maxLength={20} 
        validate={(val) => {
          if (!val || !val.trim()) return '';
          if (val.trim().length < 2) return 'Min 2 characters';
          return '';
        }}
      />
      <NeoInput 
        label="Date" 
        name="date" 
        value={ticketState.date} 
        onChange={handleInputChange} 
        placeholder="DD/MM/YYYY" 
        maxLength={10} 
        isDate={true}
        validate={validateDateField} 
      />
      
      <NeoSelect label="Ticket Shape" name="shape" value={ticketState.shape} onChange={handleInputChange} options={[
        { value: 'notch', label: 'Classic Notch' },
        { value: 'zigzag', label: 'Vintage Zig-Zag' },
        { value: 'cinema', label: 'Cinema Dots' },
        { value: 'scalloped', label: 'Scalloped Edges' },
        { value: 'beveled', label: 'Beveled Corners' },
        { value: 'corner-notches', label: 'Corner Cutouts' },
        { value: 'minimal', label: 'Minimalist Clean' },
      ]} />

      <div className="flex gap-2">
        <div className="flex-1">
          <NeoSelect label="Format" name="layout" value={ticketState.layout} onChange={handleInputChange} options={[
            { value: 'horizontal', label: 'Horizontal' },
            { value: 'vertical', label: 'Vertical' },
          ]} />
        </div>
        <div className="flex-1">
          <NeoSelect label="Border" name="border" value={ticketState.border} onChange={handleInputChange} options={[
            { value: 'thick', label: 'Thick' },
            { value: 'thin', label: 'Thin' },
            { value: 'none', label: 'None' },
          ]} />
        </div>
      </div>

      {/* Paper Color Palette */}
      <div className="flex flex-col gap-2">
        <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">
          Paper Color
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'white', hex: '#ffffff', label: 'Crisp White' },
            { id: 'parchment', hex: '#F4F1EA', label: 'Warm Parchment' },
            { id: 'vintage-yellow', hex: '#E6D3A3', label: 'Vintage Yellow' },
            { id: 'soft-pink', hex: '#FFB6C1', label: 'Soft Pink' },
            { id: 'pastel-blue', hex: '#AEC6CF', label: 'Pastel Blue' },
            { id: 'sage-green', hex: '#B2AC88', label: 'Sage Green' },
            { id: 'lavender', hex: '#D8B4E2', label: 'Soft Lavender' },
            { id: 'tangerine', hex: '#FFB347', label: 'Tangerine' },
          ].map(color => (
            <button
              key={color.id}
              type="button"
              onClick={() => onUpdate('color', color.hex)}
              className={`w-8 h-8 rounded-full border-2 border-[#1A1A1A] transition-all cursor-pointer ${ticketState.color === color.hex ? 'scale-110 shadow-[3px_3px_0px_#1A1A1A] ring-2 ring-offset-1 ring-[#1A1A1A] z-10' : 'hover:scale-105 shadow-[2px_2px_0px_#1A1A1A]'}`}
              style={{ backgroundColor: color.hex }}
              aria-label={`Select ${color.label} color`}
              title={color.label}
            />
          ))}
        </div>
      </div>

      <NeoSelect label="Typography Font" name="fontFamily" value={ticketState.fontFamily} onChange={handleInputChange} options={[
        { value: 'font-marker', label: 'Sketchy Marker' },
        { value: 'font-mono', label: 'Typewriter' },
        { value: 'font-sans', label: 'Clean Sans' },
        { value: 'font-serif', label: 'Classic Serif' },
        { value: 'font-comic', label: 'Playful Comic' },
        { value: 'font-impact', label: 'Bold Headline' },
        { value: 'font-courier', label: 'Retro Courier' },
      ]} />
    </div>
  );

  const renderBackControls = () => (
    <div className="flex flex-col gap-4">
      <NeoInput 
        label="Author Signature" 
        name="signature" 
        value={ticketState.signature} 
        onChange={handleInputChange} 
        placeholder="Your name" 
        maxLength={20}
        validate={(val) => {
          if (!val || !val.trim()) return '';
          if (val.trim().length < 2) return 'Min 2 characters';
          return '';
        }}
      />
      
      <div className="flex flex-col gap-1">
        <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">Memory Note</label>
        <textarea 
          name="note" 
          value={ticketState.note} 
          onChange={handleInputChange} 
          rows={4}
          maxLength={150}
          className="w-full border-2 border-[#1A1A1A] p-2 font-marker resize-none shadow-[2px_2px_0px_#1A1A1A] focus:outline-none focus:translate-y-[1px] focus:translate-x-[1px] focus:shadow-[1px_1px_0px_#1A1A1A] transition-all"
          placeholder="Jot down a quick memory..."
        />
      </div>

      <NeoInput 
        label="Barcode Value" 
        name="barcodeValue" 
        value={ticketState.barcodeValue} 
        onChange={handleInputChange} 
        placeholder="KITTE-1234" 
        maxLength={15}
        validate={(val) => {
          if (!val || !val.trim()) return '';
          if (val.trim().length < 3) return 'Min 3 chars';
          if (!/^[a-zA-Z0-9-]+$/.test(val)) return 'Letters & numbers';
          return '';
        }}
      />
      
      <label className="flex items-center gap-3 cursor-pointer group mt-2">
        <div className="relative w-6 h-6 border-2 border-[#1A1A1A] bg-white flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0px_#1A1A1A] transition-all">
          <input type="checkbox" name="showLogo" checked={ticketState.showLogo} onChange={handleInputChange} className="opacity-0 absolute inset-0 cursor-pointer" />
          {ticketState.showLogo && <div className="w-3 h-3 bg-[#1A1A1A]" />}
        </div>
        <span className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">Stamp Kitte Logo</span>
      </label>
    </div>
  );

  const isExportReady = !isShowcase && Boolean(ticketState?.imageSrc);

  const actionButtons = (
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
        disabled={!isExportReady}
        onClick={() => {
          if (!isExportReady) return;
          soundFX.playSnap();
          window.dispatchEvent(new CustomEvent('OPEN_EXPORT', { 
            detail: { 
              type: 'Memory Ticket', 
              data: ticketState 
            } 
          }));
        }}
        className={`w-full font-marker text-xl py-4 border-[3px] border-[#1A1A1A] transition-all uppercase tracking-widest handwritten-text border-b-[6px] ${
          !isExportReady 
            ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed opacity-60 border-b-[3px]' 
            : 'bg-[#1A1A1A] text-[#FFEB3B] hover:bg-[#2A2A2A] active:border-b-[3px] active:translate-y-[3px] cursor-pointer'
        }`}
      >
        Export Ticket
      </button>
    </div>
  );

  // 1. Mobile Drawer View: Both Front & Back rendered with identical neo-brutalist divider badge
  if (isMobileDrawer) {
    return (
      <div className={`w-full flex flex-col gap-5 select-none pb-8 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Front Side Divider Badge */}
        <div className="mt-1 mb-2 border-t-2 border-dashed border-[#1A1A1A]/30 relative flex items-center justify-center">
          <span className="bg-[#F4F1EA] px-3 font-marker text-sm uppercase tracking-wider text-[#1A1A1A] -translate-y-1/2 border border-[#1A1A1A]/30 shadow-[1px_1px_0px_#1A1A1A] handwritten-text">
            FRONT SIDE
          </span>
        </div>
        {renderFrontControls()}

        {/* Back Side Divider Badge */}
        <div className="my-6 border-t-2 border-dashed border-[#1A1A1A]/30 relative flex items-center justify-center">
          <span className="bg-[#F4F1EA] px-3 font-marker text-sm uppercase tracking-wider text-[#1A1A1A] -translate-y-1/2 border border-[#1A1A1A]/30 shadow-[1px_1px_0px_#1A1A1A] handwritten-text">
            BACK SIDE
          </span>
        </div>

        {/* Back Controls Section */}
        {renderBackControls()}

        {/* Action Buttons inside Drawer */}
        {actionButtons}
      </div>
    );
  }

  // 2. Desktop View: 100% UNCHANGED
  return (
    <aside className="w-[350px] h-full border-r-4 border-[#1A1A1A] bg-[#F4F1EA] flex flex-col z-10 shrink-0">

      {/* Settings Container with Crossfade */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden p-4 relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <AnimatePresence mode="wait">
          
          {activeSide === 'front' ? (
            <motion.div 
              key="front-settings"
              variants={variants}
              initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.2 }}
              className="pb-12"
            >
              {renderFrontControls()}
            </motion.div>
          ) : (
            <motion.div 
              key="back-settings"
              variants={variants}
              initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderBackControls()}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      {actionButtons}

    </aside>
  );
}

// Reusable Neo-Brutalist Select (Custom Dropdown)
function NeoSelect({ label, name, value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || '';

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] truncate handwritten-text">{label}</label>
      <div className="relative">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full border-2 border-[#1A1A1A] bg-white p-2 text-sm font-mono cursor-pointer flex justify-between items-center shadow-[2px_2px_0px_#1A1A1A]"
        >
          <span>{selectedLabel}</span>
          <span className={`font-bold transition-transform ${isOpen ? 'rotate-180' : ''}`}>↓</span>
        </div>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 w-full mt-2 bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] z-50 flex flex-col max-h-[200px] overflow-y-auto"
            >
              {options.map(opt => (
                <div 
                  key={opt.value}
                  onClick={() => {
                    onChange({ target: { name, value: opt.value } });
                    setIsOpen(false);
                  }}
                  className={`p-2 text-sm font-mono cursor-pointer hover:bg-[#FFEB3B] border-b-2 border-[#1A1A1A]/10 last:border-0 transition-colors ${value === opt.value ? 'bg-[#FFEB3B] font-bold' : ''}`}
                >
                  {opt.label}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
