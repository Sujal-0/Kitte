import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeoInput, NeoTextarea, validateDateField } from '../../ui/NeoInput';
import { NeoSelect } from '../../ui/NeoSelect';
import { NeoSignaturePad } from '../../ui/NeoSignaturePad';

export function TravelIDControlPanel({ activeSide, idState, onUpdate, onReset, disabled, isShowcase, onCardTypeChange }) {
  const fileInputRef = useRef(null);
  const [showAdjustDrawer, setShowAdjustDrawer] = useState(false);
  const isCreative = idState?.cardType === 'Creative License';
  const isThisAndThat = idState?.cardType === 'This & That';

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result;
        if (src) {
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

  return (
    <aside className="w-[350px] h-full border-r-4 border-[#1A1A1A] bg-[#F4F1EA] flex flex-col z-10 shrink-0">
      
      {/* Settings Container */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden p-4 relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* Front Settings */}
        <div className={`flex flex-col gap-6 pb-12 ${activeSide === 'front' ? 'block' : 'hidden'}`}>
              {/* Photo Upload Section */}
              <div className="flex flex-col gap-2">
                <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">Portrait Photo</label>
                
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                
                {!idState.imageSrc ? (
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
                            src={idState.imageSrc} 
                            className="w-full h-full object-cover" 
                            alt="Preview" 
                            style={{ 
                              transform: `translate(${idState.imageOffsetX}%, ${idState.imageOffsetY}%) scale(${idState.imageScale})`,
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
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdate('imageSrc', null);
                            setShowAdjustDrawer(false);
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
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between">
                                <label className="font-mono text-[10px] font-bold uppercase">Scale / Zoom</label>
                                <span className="font-mono text-[10px]">{Math.round((idState.imageScale || 1) * 100)}%</span>
                              </div>
                              <input 
                                type="range" min="0.5" max="3" step="0.05" 
                                value={idState.imageScale || 1} 
                                onChange={(e) => onUpdate('imageScale', parseFloat(e.target.value))}
                                className="w-full accent-[#1A1A1A]" 
                              />
                            </div>
                            
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between">
                                <label className="font-mono text-[10px] font-bold uppercase">Horizontal Pan</label>
                                <span className="font-mono text-[10px]">{idState.imageOffsetX || 0}%</span>
                              </div>
                              <input 
                                type="range" min="-100" max="100" step="1" 
                                value={idState.imageOffsetX || 0} 
                                onChange={(e) => onUpdate('imageOffsetX', parseInt(e.target.value))}
                                className="w-full accent-[#1A1A1A]" 
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between">
                                <label className="font-mono text-[10px] font-bold uppercase">Vertical Pan</label>
                                <span className="font-mono text-[10px]">{idState.imageOffsetY || 0}%</span>
                              </div>
                              <input 
                                type="range" min="-100" max="100" step="1" 
                                value={idState.imageOffsetY || 0} 
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

              {/* Card Style */}
              <div className="flex flex-col gap-4">
                <NeoSelect 
                  label="Card Type"
                  value={idState.cardType}
                  onChange={(val) => {
                    if (onCardTypeChange) {
                      onCardTypeChange(val);
                    } else {
                      onUpdate('cardType', val);
                    }
                  }}
                  options={[
                    { value: 'Travel License', label: 'Permanent License of Travel' },
                    { value: 'Creative License', label: 'Creative License' },
                    { value: 'This & That', label: 'This & That' }
                  ]}
                />
                
                <div className="flex flex-col gap-2">
                  <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">
                    Paper Color
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 'cream', hex: '#F5EEDB' },
                      { id: 'pink', hex: '#F3D9DC' },
                      { id: 'blue', hex: '#D2E4F1' },
                      { id: 'green', hex: '#D7E5D4' }
                    ].map(color => (
                      <button
                        key={color.id}
                        onClick={() => onUpdate('colorTheme', color.hex)}
                        className={`w-8 h-8 rounded-full border-2 border-[#1A1A1A] transition-all ${idState.colorTheme === color.hex ? 'scale-110 shadow-[3px_3px_0px_#1A1A1A] z-10' : 'hover:scale-105 shadow-[2px_2px_0px_#1A1A1A]'}`}
                        style={{ backgroundColor: color.hex }}
                        aria-label={`Select ${color.id} color`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Front Details Fields */}
              {isCreative ? (
                /* Creative License Specific Front Fields */
                <div className="flex flex-col gap-4">
                  <NeoInput 
                    label="License No."
                    name="creativeNumber"
                    value={idState.creativeNumber || ''}
                    maxLength={4}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                      onUpdate('creativeNumber', digits);
                      if (!idState.barcodeText || idState.barcodeText.startsWith('SR-VISUAL-')) {
                        onUpdate('barcodeText', `SR-VISUAL-${digits.padStart(4, '0')}`);
                      }
                    }}
                    placeholder="0051"
                    validate={(val) => {
                      if (!val) return '';
                      if (val.length < 4) return 'Must be 4 digits';
                      return '';
                    }}
                  />
                  <NeoInput 
                    label="First Name"
                    name="issuedTo"
                    value={idState.issuedTo || ''}
                    maxLength={20}
                    onChange={(e) => {
                      onUpdate('issuedTo', e.target.value);
                      if (idState.signatureImage) {
                        onUpdate('signatureImage', null);
                      }
                    }}
                    placeholder="First Name / Handle"
                    validate={(val) => {
                      if (!val || !val.trim()) return '';
                      if (val.trim().length < 2) return 'Min 2 characters';
                      if (!/^[a-zA-Z\s.'-]+$/.test(val)) return 'Letters only';
                      return '';
                    }}
                  />
                  <NeoInput 
                    label="Occupation"
                    name="occupation"
                    value={idState.occupation || ''}
                    maxLength={20}
                    onChange={(e) => onUpdate('occupation', e.target.value)}
                    placeholder="e.g. 3D Artist, Designer"
                    validate={(val) => {
                      if (!val || !val.trim()) return '';
                      if (val.trim().length < 2) return 'Min 2 characters';
                      return '';
                    }}
                  />
                  <NeoInput 
                    label="Date of Birth"
                    name="dateOfBirth"
                    value={idState.dateOfBirth || ''}
                    maxLength={10}
                    isDate={true}
                    onChange={(e) => onUpdate('dateOfBirth', e.target.value)}
                    placeholder="DD/MM/YYYY"
                    validate={validateDateField}
                  />
                  <NeoInput 
                    label="Nationality"
                    name="nationality"
                    value={idState.nationality || ''}
                    maxLength={20}
                    onChange={(e) => onUpdate('nationality', e.target.value)}
                    placeholder="e.g. Indian, Global"
                    validate={(val) => {
                      if (!val || !val.trim()) return '';
                      if (val.trim().length < 2) return 'Min 2 characters';
                      return '';
                    }}
                  />
                  <NeoInput 
                    label="User Badge"
                    name="userBadge"
                    value={idState.userBadge || ''}
                    maxLength={16}
                    onChange={(e) => onUpdate('userBadge', e.target.value.toUpperCase())}
                    placeholder="GRAPHIC USER"
                  />
                  <NeoInput 
                    label="Expertise"
                    name="expertise"
                    value={idState.expertise || ''}
                    maxLength={32}
                    onChange={(e) => onUpdate('expertise', e.target.value.toUpperCase())}
                    placeholder="3D ARTIST & VISUAL DESIGNER"
                  />
                  <NeoInput 
                    label="Barcode Text"
                    name="barcodeText"
                    value={idState.barcodeText || ''}
                    maxLength={18}
                    onChange={(e) => onUpdate('barcodeText', e.target.value.toUpperCase())}
                    placeholder="SR-VISUAL-0051"
                  />
                  <NeoSignaturePad
                    label="Signature"
                    valueDataURL={idState.signatureImage}
                    onChange={(dataUrl) => onUpdate('signatureImage', dataUrl)}
                  />
                </div>
              ) : isThisAndThat ? (
                /* This & That Specific Front Fields */
                <div className="flex flex-col gap-4">
                  <NeoInput 
                    label="Full Name"
                    name="issuedTo"
                    value={idState.issuedTo || ''}
                    maxLength={20}
                    onChange={(e) => onUpdate('issuedTo', e.target.value)}
                    placeholder="e.g. Hwang Hyunjin"
                    validate={(val) => {
                      if (!val || !val.trim()) return '';
                      if (val.trim().length < 2) return 'Min 2 characters';
                      return '';
                    }}
                  />
                  <NeoInput 
                    label="Occupancy"
                    name="occupancy"
                    value={idState.occupancy || ''}
                    maxLength={16}
                    onChange={(e) => onUpdate('occupancy', e.target.value.toUpperCase())}
                    placeholder="e.g. STAY"
                  />
                  <NeoInput 
                    label="Date of Issue"
                    name="dateOfIssue"
                    value={idState.dateOfIssue || ''}
                    maxLength={10}
                    isDate={true}
                    onChange={(e) => onUpdate('dateOfIssue', e.target.value)}
                    placeholder="DD/MM/YYYY"
                    validate={validateDateField}
                  />
                  <NeoInput 
                    label="Document Code"
                    name="idNumber"
                    value={idState.idNumber || ''}
                    maxLength={14}
                    onChange={(e) => onUpdate('idNumber', e.target.value.toUpperCase())}
                    placeholder="SKZ-080726"
                  />
                </div>
              ) : (
                /* Travel License Standard Fields */
                <div className="flex flex-col gap-4">
                  <NeoInput 
                    label="Issued To"
                    name="issuedTo"
                    value={idState.issuedTo}
                    maxLength={20}
                    onChange={(e) => {
                      onUpdate('issuedTo', e.target.value);
                      if (idState.signatureImage) {
                        onUpdate('signatureImage', null);
                      }
                    }}
                    placeholder="Full Name"
                    validate={(val) => {
                      if (!val || !val.trim()) return '';
                      if (val.trim().length < 2) return 'Min 2 characters';
                      if (!/^[a-zA-Z\s.'-]+$/.test(val)) return 'Letters only';
                      return '';
                    }}
                  />
                  <NeoInput 
                    label="Date of Birth"
                    name="dateOfBirth"
                    value={idState.dateOfBirth}
                    maxLength={10}
                    isDate={true}
                    onChange={(e) => onUpdate('dateOfBirth', e.target.value)}
                    placeholder="DD/MM/YYYY"
                    validate={validateDateField}
                  />
                  <NeoInput 
                    label="Place of Issue"
                    name="placeOfIssue"
                    value={idState.placeOfIssue}
                    maxLength={20}
                    onChange={(e) => onUpdate('placeOfIssue', e.target.value)}
                    placeholder="City, Country"
                    validate={(val) => {
                      if (!val || !val.trim()) return '';
                      if (val.trim().length < 2) return 'Min 2 characters';
                      if (!/^[a-zA-Z0-9\s,.'-]+$/.test(val)) return 'Letters & numbers';
                      return '';
                    }}
                  />
                  <NeoInput 
                    label="Date of Issue"
                    name="dateOfIssue"
                    value={idState.dateOfIssue}
                    maxLength={10}
                    isDate={true}
                    onChange={(e) => onUpdate('dateOfIssue', e.target.value)}
                    placeholder="DD/MM/YYYY"
                    validate={validateDateField}
                  />
                  <NeoInput 
                    label="ID Number"
                    name="idNumber"
                    value={idState.idNumber}
                    maxLength={12}
                    onChange={(e) => onUpdate('idNumber', e.target.value.toUpperCase())}
                    placeholder="TTC6252021"
                    validate={(val) => {
                      if (!val || !val.trim()) return '';
                      if (val.trim().length < 4) return 'Min 4 characters';
                      if (!/^[a-zA-Z0-9-]+$/.test(val)) return 'Letters & digits';
                      return '';
                    }}
                  />
                  <NeoSignaturePad
                    label="Signature"
                    valueDataURL={idState.signatureImage}
                    onChange={(dataUrl) => onUpdate('signatureImage', dataUrl)}
                  />
                </div>
              )}
        </div>

        {/* Back Settings */}
        <div className={`flex flex-col gap-6 pb-12 ${activeSide === 'back' ? 'block' : 'hidden'}`}>
          {isCreative ? (
            /* Creative License Specific Back Fields */
            <div className="flex flex-col gap-4">
              <h3 className="font-marker text-xl uppercase tracking-widest text-[#1A1A1A] border-b-2 border-[#1A1A1A]/20 pb-2 handwritten-text">Creative Profile</h3>
              
              <p className="font-mono text-xs text-[#1A1A1A]/60 leading-relaxed mb-1">
                Customize your professional skills, software mastery, and contact details for the back of your card.
              </p>

              <NeoTextarea
                label="Skills"
                name="skills"
                value={idState.skills || ''}
                maxLength={140}
                rows={3}
                onChange={(e) => onUpdate('skills', e.target.value)}
                placeholder="3D Modeling, Digital Painting, Graphic Design, Video Editing..."
              />

              <NeoTextarea
                label="Software"
                name="software"
                value={idState.software || ''}
                maxLength={100}
                rows={3}
                onChange={(e) => onUpdate('software', e.target.value)}
                placeholder="Adobe Photoshop&#10;Adobe After Effects&#10;Blender..."
              />

              <div className="flex flex-col gap-3 mt-1">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#1A1A1A] border-b border-[#1A1A1A]/20 pb-1">
                  Contact Information
                </h4>
                <NeoInput
                  label="Phone Number"
                  name="contactPhone"
                  value={idState.contactPhone || ''}
                  maxLength={22}
                  onChange={(e) => onUpdate('contactPhone', e.target.value)}
                  placeholder="+91 94960 33887"
                  validate={(val) => {
                    if (!val || !val.trim()) return '';
                    const digits = val.replace(/\D/g, '');
                    if (!/^[+\d\s()-]+$/.test(val)) return 'Invalid phone chars';
                    if (digits.length < 7) return 'Min 7 digits';
                    return '';
                  }}
                />
                <NeoInput
                  label="Email Address"
                  name="contactEmail"
                  value={idState.contactEmail || ''}
                  maxLength={32}
                  onChange={(e) => onUpdate('contactEmail', e.target.value)}
                  placeholder="strawhat@kitte.studio"
                  validate={(val) => {
                    if (!val || !val.trim()) return '';
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(val.trim())) return 'Invalid email format';
                    return '';
                  }}
                />
                <NeoInput
                  label="Instagram / Social"
                  name="contactSocial"
                  value={idState.contactSocial || ''}
                  maxLength={25}
                  onChange={(e) => onUpdate('contactSocial', e.target.value)}
                  placeholder="@monkey_d_luffy"
                  validate={(val) => {
                    if (!val || !val.trim()) return '';
                    const clean = val.trim();
                    if (!/^@?[a-zA-Z0-9._]+$/.test(clean)) return 'Letters, numbers, . and _ only';
                    if (clean.replace(/^@/, '').length < 2) return 'Min 2 characters';
                    return '';
                  }}
                />
              </div>

              <div className="flex flex-col gap-3 mt-1">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#1A1A1A] border-b border-[#1A1A1A]/20 pb-1">
                  Inspirational Quote
                </h4>
                <NeoInput
                  label="Quote"
                  name="quoteText"
                  value={idState.quoteText || ''}
                  maxLength={45}
                  onChange={(e) => onUpdate('quoteText', e.target.value)}
                  placeholder="Creativity takes courage."
                />
                <NeoInput
                  label="Quote Author"
                  name="quoteAuthor"
                  value={idState.quoteAuthor || ''}
                  maxLength={25}
                  onChange={(e) => onUpdate('quoteAuthor', e.target.value)}
                  placeholder="Henri Matisse"
                />
              </div>
            </div>
          ) : isThisAndThat ? (
            /* This & That Specific Back Fields */
            <div className="flex flex-col gap-4">
              <h3 className="font-marker text-xl uppercase tracking-widest text-[#1A1A1A] border-b-2 border-[#1A1A1A]/20 pb-2 handwritten-text">Card Certification</h3>
              
              <p className="font-mono text-xs text-[#1A1A1A]/60 leading-relaxed mb-1">
                Customize your certification declaration and personal handwritten notes for the back of your ID.
              </p>

              <NeoTextarea
                label="Certification Text"
                name="certText"
                value={idState.certText || ''}
                maxLength={140}
                rows={3}
                onChange={(e) => onUpdate('certText', e.target.value)}
                placeholder="This is to certify that the person named and described above is declared to be one and only mine."
              />

              <NeoTextarea
                label="Personal Note (Ruled Lines)"
                name="note"
                value={idState.note || ''}
                maxLength={80}
                rows={2}
                onChange={(e) => onUpdate('note', e.target.value)}
                placeholder="Always by your side, everywhere all around the world."
              />
            </div>
          ) : (
            /* Travel License Stamps & Seals */
            <div className="flex flex-col gap-4">
              <h3 className="font-marker text-xl uppercase tracking-widest text-[#1A1A1A] border-b-2 border-[#1A1A1A]/20 pb-2 handwritten-text">Stamps & Seals</h3>
              
              <p className="font-mono text-xs text-[#1A1A1A]/60 leading-relaxed mb-2">
                Toggle custom stamps for your ID back. Stamps overlap perfectly to recreate authentic ink effects.
              </p>
              
              {/* Stamp Checkboxes */}
              <div className="flex flex-col gap-3">
                {['igor', 'cat', 'jollyRoger', 'nami', 'cmiygl'].map(stamp => (
                  <label key={stamp} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={idState.stamps.includes(stamp)}
                        onChange={(e) => {
                          const newStamps = e.target.checked 
                            ? [...idState.stamps, stamp]
                            : idState.stamps.filter(s => s !== stamp);
                          onUpdate('stamps', newStamps);
                        }}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 border-2 border-[#1A1A1A] bg-white peer-checked:bg-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] transition-all group-hover:shadow-[1px_1px_0px_#1A1A1A] group-hover:translate-x-[1px] group-hover:translate-y-[1px]"></div>
                      <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="font-mono text-sm font-bold uppercase text-[#1A1A1A] group-hover:text-[#e51717] transition-colors">{stamp} Stamp</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Buttons (Matching Memory Ticket exactly) */}
      <div className={`p-4 border-t-4 border-[#1A1A1A] bg-[#F4F1EA] flex flex-col gap-3 shrink-0 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <button 
          onClick={onReset} 
          className="w-full bg-[#F4F1EA] text-[#1A1A1A] font-marker font-bold text-sm py-2 border-[3px] border-[#1A1A1A] hover:bg-[#e51717] hover:text-white transition-colors uppercase tracking-wider handwritten-text border-b-[6px]"
        >
          Reset Progress
        </button>
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('OPEN_EXPORT', { detail: { type: idState?.cardType || 'Travel ID', data: { ...idState, isShowcase: !!isShowcase } } }));
          }}
          disabled={!idState.imageSrc} 
          className={`w-full font-marker text-xl py-4 border-[3px] border-[#1A1A1A] transition-all uppercase tracking-widest handwritten-text border-b-[6px] ${!idState.imageSrc ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed opacity-60 border-b-[3px]' : 'bg-[#1A1A1A] text-[#FFEB3B] hover:bg-[#2A2A2A] active:border-b-[3px] active:translate-y-[3px]'}`}
        >
          Export ID
        </button>
      </div>
    </aside>
  );
}
