import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CREATIVE_LICENSE_TOKENS } from '../../../features/travel-id/tokens/creativeLicenseTokens';

// Barcode bars pattern from shared tokens
const BARCODE_BARS = CREATIVE_LICENSE_TOKENS.barcode.bars;

function StarRow() {
  return (
    <div className="flex justify-between items-center px-12 pt-6 pb-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg 
          key={i} 
          viewBox="0 0 512 512" 
          className="w-4 h-4 text-[#4B728D]" 
          fill="currentColor"
        >
          <path d="M510.698,196.593c-3.61-11.2-14.034-18.795-25.794-18.795H329.21L281.791,30.155c-3.599-11.2-14.018-18.808-25.791-18.808c-11.772,0-22.192,7.608-25.791,18.808l-47.418,147.642H27.097c-11.761,0-22.185,7.594-25.795,18.795c-3.599,11.2,0.436,23.449,9.999,30.302l126.246,90.643l-48.598,147.54c-3.694,11.193,0.278,23.47,9.801,30.398c9.529,6.926,22.44,6.897,31.94-0.058L256,403.594l125.312,91.824c9.5,6.956,22.411,6.985,31.941,0.058c9.522-6.927,13.494-19.205,9.811-30.398l-48.61-147.54L500.7,226.895C510.262,220.042,514.298,207.792,510.698,196.593z" />
        </svg>
      ))}
    </div>
  );
}

export function CreativeLicenseCard({ idState, activeSide, isShowcase }) {
  const [failedImage, setFailedImage] = useState(false);
  const defaults = CREATIVE_LICENSE_TOKENS.showcaseDefaults;

  // If in showcase mode and no user-uploaded image, show Luffy portrait.
  // When user taps "Click to make your own", isShowcase is false and imageSrc becomes null.
  const imageSrc = idState?.imageSrc !== undefined && idState?.imageSrc !== null
    ? idState.imageSrc
    : (isShowcase ? '/assets/luffyTravelID.webp' : null);

  const scale = idState?.imageScale || 1;
  const offsetX = idState?.imageOffsetX || 0;
  const offsetY = idState?.imageOffsetY || 0;

  const cardBg = idState?.colorTheme || '#F5EEDB';
  const licenseNumber = (idState?.creativeNumber || idState?.idNumber || '0051').replace(/^TTC/, '').slice(-4).padStart(4, '0');
  const numberSpaced = licenseNumber.split('').join(' ');

  // Showcase fallback values fade to empty when user customizes
  const nameVal = idState?.issuedTo ?? (isShowcase ? defaults.name : '');
  const occupationVal = idState?.occupation ?? (isShowcase ? defaults.occupation : '');
  const dobVal = idState?.dateOfBirth ?? (isShowcase ? defaults.dob : '');
  const nationalityVal = idState?.nationality ?? (isShowcase ? defaults.nationality : '');
  const userBadgeVal = idState?.userBadge || 'GRAPHIC USER';
  const expertiseVal = idState?.expertise ?? (isShowcase ? defaults.expertise : '');
  const barcodeCode = idState?.barcodeText || `SR-VISUAL-${licenseNumber}`;

  // Back specifics
  const skillsVal = idState?.skills ?? (isShowcase ? defaults.skills : '');
  const softwareVal = idState?.software ?? (isShowcase ? defaults.software : '');
  const phoneVal = idState?.contactPhone ?? (isShowcase ? defaults.phone : '');
  const emailVal = idState?.contactEmail ?? (isShowcase ? defaults.email : '');
  const socialVal = idState?.contactSocial ?? (isShowcase ? defaults.social : '');
  const quoteVal = idState?.quoteText ?? (isShowcase ? defaults.quote : '');
  const authorVal = idState?.quoteAuthor ?? (isShowcase ? defaults.author : '');

  return (
    <div 
      className="relative flex items-center justify-center select-none"
      style={{ 
        width: '760px', 
        height: '480px',
        transformStyle: 'preserve-3d' 
      }}
    >
      {/* =========================================================================
          FRONT SIDE (Matches TravelIDCard structure and 3D flipping behavior)
          ========================================================================= */}
      <div 
        id="creative-id-front"
        className="absolute inset-0 rounded-[24px] shadow-2xl overflow-hidden border-[3px] border-[#1A1A1A] flex flex-col justify-between transition-opacity duration-300"
        style={{ 
          backgroundColor: cardBg,
          opacity: activeSide === 'front' ? 1 : 0,
          pointerEvents: activeSide === 'front' ? 'auto' : 'none',
          zIndex: activeSide === 'front' ? 10 : 0
        }}
      >
        {/* Subtle Noise Texture */}
        <div 
          className="absolute inset-0 opacity-25 mix-blend-multiply pointer-events-none" 
          style={{ backgroundImage: 'url("/assets/noise.png")', backgroundRepeat: 'repeat' }} 
        />

        {/* Inset Dashed Border */}
        <div className="absolute inset-3 border-2 border-dashed border-[#1A1A1A]/75 rounded-[16px] pointer-events-none" />

        {/* Top 5 Blue Stars (Pushed down with breathing room away from dashed border) */}
        <StarRow />

        {/* Card Body Grid (Pushed down away from top stars) */}
        <div className="relative flex-1 px-8 pt-3 pb-4 flex gap-5 z-10">
          
          {/* LEFT COLUMN: Photo, Sticker Overlays, Barcode */}
          <div className="w-[200px] flex flex-col justify-between shrink-0">
            {/* Photo Box with Polaroid-style white border */}
            <div className="relative mt-2">
              <div className="w-[195px] h-[225px] border-[5px] border-white shadow-[0_3px_10px_rgba(0,0,0,0.18)] bg-[#E5E0D8] overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {imageSrc && !failedImage ? (
                    <motion.img 
                      key={imageSrc}
                      src={imageSrc} 
                      alt="Portrait"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="w-full h-full object-cover origin-center"
                      style={{
                        transform: `translate(${offsetX}%, ${offsetY}%) scale(${scale})`
                      }}
                      onError={() => setFailedImage(true)}
                    />
                  ) : (
                    <motion.div 
                      key="no-photo"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="w-full h-full flex flex-col items-center justify-center bg-neutral-200 text-neutral-400 font-mono text-xs gap-1.5 p-4 text-center"
                    >
                      <img src="/assets/upload.svg" className="w-6 h-6 opacity-40" alt="" />
                      <span className="font-bold text-[10px] tracking-wider uppercase text-neutral-500">Upload Portrait</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Overlapping Sticker Cluster on Bottom of Photo (Increased Sizes) */}
              <div className="absolute -bottom-8 -left-3 right-0 pointer-events-none z-20">
                {/* 1. IMAGINATION Sticker (left, larger size) */}
                <div 
                  className="absolute bottom-1 -left-3 w-[68px] h-[95px] overflow-hidden -rotate-6 shadow-[2px_2px_4px_rgba(0,0,0,0.25)] border border-black/20"
                >
                  <img src="/assets/imig.webp" alt="Think Imagination" className="w-full h-full object-cover" />
                </div>

                {/* 2. Blue Globe / NO SUBSTITUTE sticker (middle, larger size) */}
                <div 
                  className="absolute -bottom-1 left-[44px] w-[76px] h-[76px] rotate-3 shadow-[2px_2px_4px_rgba(0,0,0,0.25)]"
                >
                  <img src="/assets/no-sub.webp" alt="No Substitute" className="w-full h-full object-contain" />
                </div>

                {/* 3. GUARANTEED / Stay Humble badge (larger padding & font) */}
                <div 
                  className="absolute bottom-7 left-[90px] bg-[#1B5E3C] text-white font-impact text-[12px] px-2.5 py-1 tracking-wider uppercase rotate-[-2deg] border border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]"
                >
                  GUARANTEED.
                </div>

                {/* 4. OMG Comic burst sticker (larger size) */}
                <div 
                  className="absolute -bottom-3 right-0 w-[82px] h-[58px] rotate-[8deg] drop-shadow-[2px_2px_4px_rgba(0,0,0,0.25)]"
                >
                  <img src="/assets/omg.webp" alt="OMG" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>

            {/* Bottom Barcode */}
            <div className="mt-7 flex flex-col items-center">
              <div className="flex items-end justify-center h-[34px] w-full">
                {BARCODE_BARS.map((width, idx) => (
                  <div 
                    key={idx} 
                    className="h-full bg-[#1A1A1A]" 
                    style={{ 
                      width: `${width * 1.4}px`, 
                      marginRight: idx === BARCODE_BARS.length - 1 ? 0 : '1.3px' 
                    }} 
                  />
                ))}
              </div>
              <span className="font-mono text-[10.5px] font-bold tracking-[3px] text-[#1A1A1A] mt-1 text-center">
                {barcodeCode}
              </span>
            </div>
          </div>

          {/* RIGHT AREA: Headers, Stamps, Info Grid, Badges */}
          <div className="flex-1 flex flex-col justify-between relative pl-1">
            
            {/* Watermark Certified Stamp (Center-Left, Larger) */}
            <div className="absolute top-10 left-10 w-52 h-52 pointer-events-none opacity-[0.38] mix-blend-multiply -rotate-12 z-0">
              <img src="/assets/certified-stamp.webp" alt="Certified Stamp" className="w-full h-full object-contain" />
            </div>

            {/* Background Star Sticker Graphic (Prominent & Larger than rest of assets) */}
            <div className="absolute top-8 right-4 w-[175px] h-[175px] pointer-events-none opacity-30 mix-blend-multiply z-0">
              <img src="/assets/star-sticker.webp" alt="Star Graphic" className="w-full h-full object-contain" />
            </div>

            {/* Header: CREATIVE LICENSE & # OF LICENSE (Pushed down) */}
            <div className="flex justify-between items-start z-10 pt-2">
              <div>
                <h1 className="font-creative text-[54px] leading-[0.85] text-[#1A1A1A] tracking-tight -ml-1 mt-1">
                  CREATIVE
                </h1>
                <h2 className="font-mono font-black text-[28px] leading-none text-[#1A1A1A] tracking-[4px] mt-2.5">
                  LICENSE
                </h2>
                <p className="font-mono text-[7.5px] leading-[1.25] text-[#1A1A1A]/70 max-w-[215px] mt-2 font-semibold">
                  This creative license empowers you to design without limit and unlock the full potential of your imagination together, we shape a world of boundless artistic possibilities.
                </p>
              </div>

              {/* License Number in Red Digits */}
              <div className="flex flex-col items-end pt-1">
                <span className="font-mono text-[10px] font-bold tracking-widest text-[#1A1A1A]/80 uppercase">
                  #OF LICENSE
                </span>
                <span className="font-mono text-[28px] font-black tracking-[8px] text-[#C93B2B] leading-tight mr-[-8px]">
                  {numberSpaced}
                </span>
              </div>
            </div>

            {/* Information Grid Box */}
            <div className="border-2 border-[#1A1A1A] bg-white/55 backdrop-blur-[0.5px] flex flex-col mt-2 z-10 shadow-[2px_2px_0px_rgba(0,0,0,0.15)]">
              {/* Row 1: Signature (Clean flowing handwriting without scribble line-boil) */}
              <div className="border-b-2 border-[#1A1A1A] px-2.5 pt-1 pb-1 relative min-h-[46px] flex flex-col justify-between">
                <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/75">
                  Signature of Authorized Creative
                </span>
                <div className="h-7 flex items-center">
                  <AnimatePresence mode="wait">
                    {idState?.signatureImage ? (
                      <motion.img 
                        key="sig-img"
                        src={idState.signatureImage} 
                        alt="Signature" 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="h-8 w-auto max-w-[200px] object-contain mix-blend-multiply" 
                      />
                    ) : nameVal ? (
                      <motion.span 
                        key="sig-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="font-hand italic text-3xl font-bold text-[#2B5490] leading-none truncate select-none"
                      >
                        {nameVal}
                      </motion.span>
                    ) : (
                      <span className="leading-none text-transparent select-none">{'\u00A0'}</span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Row 2: First Name */}
              <div className="border-b-2 border-[#1A1A1A] px-2.5 pt-1.5 pb-1.5">
                <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/75 block leading-none">
                  First Name
                </span>
                <AnimatePresence mode="wait">
                  {nameVal ? (
                    <motion.span 
                      key="name-val"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="font-mono text-base font-black tracking-wider text-[#1A1A1A] uppercase truncate block leading-tight mt-1"
                    >
                      {nameVal}
                    </motion.span>
                  ) : (
                    <span className="block leading-tight text-transparent select-none">{'\u00A0'}</span>
                  )}
                </AnimatePresence>
              </div>

              {/* Row 3: Occupation */}
              <div className="border-b-2 border-[#1A1A1A] px-2.5 pt-1.5 pb-1.5">
                <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/75 block leading-none">
                  Occupation
                </span>
                <AnimatePresence mode="wait">
                  {occupationVal ? (
                    <motion.span 
                      key="occ-val"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="font-mono text-sm font-extrabold tracking-wide text-[#1A1A1A] uppercase truncate block leading-tight mt-1"
                    >
                      {occupationVal}
                    </motion.span>
                  ) : (
                    <span className="block leading-tight text-transparent select-none">{'\u00A0'}</span>
                  )}
                </AnimatePresence>
              </div>

              {/* Row 4: D.O.B & Nationality (2 Columns) */}
              <div className="grid grid-cols-2">
                <div className="border-r-2 border-[#1A1A1A] px-2.5 pt-1.5 pb-1.5">
                  <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/75 block leading-none">
                    D.O.B
                  </span>
                  <AnimatePresence mode="wait">
                    {dobVal ? (
                      <motion.span 
                        key="dob-val"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="font-mono text-xs font-bold text-[#1A1A1A] block leading-tight mt-1"
                      >
                        {dobVal}
                      </motion.span>
                    ) : (
                      <span className="block leading-tight text-transparent select-none">{'\u00A0'}</span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="px-2.5 pt-1.5 pb-1.5">
                  <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-[#1A1A1A]/75 block leading-none">
                    Nationality
                  </span>
                  <AnimatePresence mode="wait">
                    {nationalityVal ? (
                      <motion.span 
                        key="nat-val"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="font-mono text-xs font-bold text-[#1A1A1A] uppercase truncate block leading-tight mt-1"
                      >
                        {nationalityVal}
                      </motion.span>
                    ) : (
                      <span className="block leading-tight text-transparent select-none">{'\u00A0'}</span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Below Grid: VALID UNTIL IT DOESN'T & GRAPHIC USER */}
            <div className="flex justify-between items-center px-1 my-1 z-10">
              <div className="font-mono text-[8.5px] font-black leading-tight tracking-wider text-[#1A1A1A] uppercase">
                <div>VALID</div>
                <div>UNTIL</div>
                <div>IT DOESN'T</div>
              </div>

              <div className="font-impact text-[34px] font-black tracking-[2px] text-[#1A1A1A] leading-none uppercase">
                {userBadgeVal}
              </div>
            </div>

            {/* Bottom Row: Expertise */}
            <div className="border-2 border-[#1A1A1A] bg-white/55 px-2.5 py-1 flex items-baseline gap-2 z-10 shadow-[2px_2px_0px_rgba(0,0,0,0.15)]">
              <span className="font-mono text-[8.5px] font-bold uppercase tracking-wider text-[#1A1A1A]/75 shrink-0">
                Expertise
              </span>
              <AnimatePresence mode="wait">
                {expertiseVal ? (
                  <motion.span 
                    key="exp-val"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="font-mono text-xs font-black tracking-wider text-[#1A1A1A] uppercase truncate"
                  >
                    {expertiseVal}
                  </motion.span>
                ) : (
                  <span className="text-transparent select-none">{'\u00A0'}</span>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>

      {/* =========================================================================
          BACK SIDE (Matches TravelIDCard structure and 3D flipping behavior)
          ========================================================================= */}
      <div 
        id="creative-id-back"
        className="absolute inset-0 rounded-[24px] shadow-2xl overflow-hidden border-[3px] border-[#1A1A1A] p-7 flex justify-between transition-opacity duration-300"
        style={{ 
          backgroundColor: cardBg,
          transform: 'rotateY(180deg)',
          opacity: activeSide === 'back' ? 1 : 0,
          pointerEvents: activeSide === 'back' ? 'auto' : 'none',
          zIndex: activeSide === 'back' ? 10 : 0
        }}
      >
        {/* Subtle Noise Texture */}
        <div 
          className="absolute inset-0 opacity-25 mix-blend-multiply pointer-events-none" 
          style={{ backgroundImage: 'url("/assets/noise.png")', backgroundRepeat: 'repeat' }} 
        />

        {/* Inset Dashed Border */}
        <div className="absolute inset-3 border-2 border-dashed border-[#1A1A1A]/75 rounded-[16px] pointer-events-none" />

        {/* LEFT AREA: Star Sticker Graphic + Sticker Bomb + Quote */}
        <div className="w-[330px] flex flex-col justify-between relative z-10 pl-2">
          
          {/* Prominent Large Star Sticker Background Graphic (Bigger than other assets) */}
          <div className="absolute top-2 left-2 w-[220px] h-[220px] pointer-events-none opacity-30 mix-blend-multiply z-0 -rotate-12">
            <img src="/assets/star-sticker.webp" alt="Star Graphic" className="w-full h-full object-contain" />
          </div>

          {/* Sticker Bomb Cluster (Larger asset sizes) */}
          <div className="relative pt-5 flex flex-col gap-2.5 z-10">
            {/* Sticker 1: IT with screw (yellow, larger) */}
            <div 
              className="w-[218px] h-[60px] -rotate-3 overflow-hidden shadow-[3px_3px_6px_rgba(0,0,0,0.3)] border border-black/30 bg-white"
              style={{
                backgroundImage: 'url("/assets/creative-back.webp")',
                backgroundSize: '100% auto',
                backgroundPosition: 'center 49.5%',
                backgroundRepeat: 'no-repeat'
              }}
            />

            {/* Sticker 2: STAMP OUT EVERYBODY! (red, larger) */}
            <div 
              className="w-[228px] h-[65px] rotate-2 ml-4 -mt-1 overflow-hidden shadow-[3px_3px_6px_rgba(0,0,0,0.3)] border border-black/30 bg-white"
              style={{
                backgroundImage: 'url("/assets/creative-back.webp")',
                backgroundSize: '100% auto',
                backgroundPosition: 'center 2%',
                backgroundRepeat: 'no-repeat'
              }}
            />

            {/* Sticker 3: SICK, SAD WORLD (blue, larger) */}
            <div 
              className="w-[212px] h-[60px] -rotate-2 -mt-1 overflow-hidden shadow-[3px_3px_6px_rgba(0,0,0,0.3)] border border-black/30 bg-white"
              style={{
                backgroundImage: 'url("/assets/creative-back.webp")',
                backgroundSize: '100% auto',
                backgroundPosition: 'center 97%',
                backgroundRepeat: 'no-repeat'
              }}
            />

            {/* Bottom Row Stickers: NO SUBSTITUTE oval + Prominent Star Sticker + Floral Graphic */}
            <div className="flex items-center gap-3 mt-1 -ml-1">
              <div className="w-[100px] h-[40px] rotate-4 shadow-[2px_2px_5px_rgba(0,0,0,0.25)] rounded-full overflow-hidden border border-black/40 bg-[#FCD835] flex items-center justify-center shrink-0">
                <span className="font-impact text-[11px] tracking-wider text-black text-center leading-none">
                  NO SUBSTITUTE
                </span>
              </div>

              {/* star-sticker.webp (Prominent, bigger in size from rest of assets) */}
              <div className="w-[88px] h-[88px] -rotate-6 drop-shadow-[2px_3px_6px_rgba(0,0,0,0.35)] shrink-0">
                <img src="/assets/star-sticker.webp" alt="Star Burst" className="w-full h-full object-contain" />
              </div>

              <div className="w-[60px] h-[60px] rotate-12 drop-shadow-[2px_3px_6px_rgba(0,0,0,0.35)] shrink-0">
                <img src="/assets/star-grafitti.webp" alt="Pro Grow Flower" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          {/* Bottom Left Quote */}
          {quoteVal && quoteVal.trim() ? (
            <div className="mb-2">
              <p className="font-mono text-[11px] font-bold text-[#1A1A1A] leading-relaxed">
                {quoteVal.trim()}
              </p>
              {authorVal && authorVal.trim() ? (
                <p className="font-mono text-[11px] font-semibold text-[#1A1A1A]/75 mt-0.5">
                  - {authorVal.trim()}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mb-2 h-6" />
          )}
        </div>

        {/* RIGHT AREA: Bordered Details Box (Skills, Software, Contact) */}
        <div className="w-[350px] h-full border-2 border-[#1A1A1A] bg-white/40 p-5 flex flex-col justify-between text-right relative z-10 shadow-[4px_4px_0px_rgba(0,0,0,0.15)] overflow-hidden">
          
          {/* Section 1: Skills */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/70">
              Skills
            </span>
            <AnimatePresence mode="wait">
              {skillsVal ? (
                <motion.p 
                  key="skills-val"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="font-mono text-[11px] font-semibold text-[#1A1A1A] leading-relaxed"
                >
                  {skillsVal}
                </motion.p>
              ) : (
                <p className="font-mono text-[11px] text-transparent select-none">{'\u00A0'}</p>
              )}
            </AnimatePresence>
          </div>

          {/* Section 2: Software */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/70">
              Software
            </span>
            <AnimatePresence mode="wait">
              {softwareVal ? (
                <motion.div 
                  key="soft-val"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="font-mono text-[11px] font-semibold text-[#1A1A1A] leading-snug whitespace-pre-line"
                >
                  {softwareVal}
                </motion.div>
              ) : (
                <div className="font-mono text-[11px] text-transparent select-none">{'\u00A0'}</div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 3: Contact */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/70">
              Contact
            </span>
            <div className="font-mono text-[11px] font-semibold text-[#1A1A1A] leading-snug">
              <AnimatePresence mode="wait">
                {phoneVal || emailVal || socialVal ? (
                  <motion.div 
                    key="contact-vals"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>PH: {phoneVal || '\u00A0'}</div>
                    <div>Gmail: {emailVal || '\u00A0'}</div>
                    <div>INS: {socialVal || '\u00A0'}</div>
                  </motion.div>
                ) : (
                  <div className="text-transparent select-none">{'\u00A0'}</div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
