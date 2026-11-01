import React, { useState } from 'react';
import { CreativeLicenseCard } from './CreativeLicenseCard';
import { ThisAndThatCard } from './ThisAndThatCard';

// Generate perfectly distributed stars along the perimeter
const generateStars = () => {
  const stars = [];
  const w = 700; // Border box width (more inset)
  const h = 420; // Border box height (more inset)
  const hCount = 15; // Number of stars horizontally
  const vCount = 9;  // Number of stars vertically

  // Top edge
  for (let i = 0; i < hCount; i++) {
    stars.push({ x: (w / (hCount - 1)) * i, y: 0 });
  }
  // Bottom edge
  for (let i = 0; i < hCount; i++) {
    stars.push({ x: (w / (hCount - 1)) * i, y: h });
  }
  // Left edge (excluding corners)
  for (let i = 1; i < vCount - 1; i++) {
    stars.push({ x: 0, y: (h / (vCount - 1)) * i });
  }
  // Right edge (excluding corners)
  for (let i = 1; i < vCount - 1; i++) {
    stars.push({ x: w, y: (h / (vCount - 1)) * i });
  }
  return stars;
};

const STAR_POSITIONS = generateStars();

function StarBorder() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="relative w-[700px] h-[420px]">
        {STAR_POSITIONS.map((pos, i) => (
          <img 
            key={i} 
            src="/assets/star.svg" 
            alt="star" 
            className="absolute w-[20px] h-[20px] opacity-90 object-contain -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `${pos.x}px`, 
              top: `${pos.y}px`,
              filter: 'brightness(0) saturate(100%)'
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function TravelIDCard({ idState, activeSide, onUpdate: _onUpdate, isShowcase }) {
  const [failedImageSrc, setFailedImageSrc] = useState(null);

  if (idState?.cardType === 'Creative License') {
    return <CreativeLicenseCard idState={idState} activeSide={activeSide} isShowcase={isShowcase} />;
  }

  if (idState?.cardType === 'This & That') {
    return <ThisAndThatCard idState={idState} activeSide={activeSide} isShowcase={isShowcase} />;
  }

  // We render both sides and use absolute positioning/opacity to toggle them,
  // this ensures exportEngine can easily target the #travel-id-front or #travel-id-back

  return (
    <div 
      className="relative flex items-center justify-center preserve-3d"
      style={{
        width: '760px',
        height: '480px'
      }}
    >
      
      {/* FRONT SIDE */}
      <div 
        id="travel-id-front"
        className="absolute inset-0 rounded-[20px] shadow-2xl overflow-hidden transition-opacity duration-300"
        style={{ 
          backgroundColor: idState.colorTheme,
          opacity: activeSide === 'front' ? 1 : 0,
          pointerEvents: activeSide === 'front' ? 'auto' : 'none',
          zIndex: activeSide === 'front' ? 10 : 0
        }}
      >
        {/* Noise overlay for vintage texture */}
        <div 
          className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none" 
          style={{ backgroundImage: "url('/assets/noise.png')" }} 
        />
        
        <StarBorder />

        <div className="relative w-full h-full px-10 pt-11 pb-13 flex">
          
          {/* Left: Photo Box */}
          <div className="w-[45%] h-full flex flex-col pt-1 pl-3 relative z-10">
            <div className="w-full aspect-[4/5] bg-white rounded-sm shadow-[inset_0_0_10px_rgba(0,0,0,0.1),_2px_4px_12px_rgba(0,0,0,0.15)] border-4 border-white overflow-hidden relative group">
              {idState.imageSrc && failedImageSrc !== idState.imageSrc ? (
                <img 
                  src={idState.imageSrc} 
                  alt="ID Portrait" 
                  className="w-full h-full object-cover transition-transform"
                  style={{ 
                    transform: `translate(${idState.imageOffsetX}px, ${idState.imageOffsetY}px) scale(${idState.imageScale})`,
                  }}
                  onError={() => setFailedImageSrc(idState.imageSrc)}
                />
              ) : (
                <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                  <span className="font-mono text-sm text-neutral-400">NO PHOTO</span>
                </div>
              )}
            </div>
            
            {/* Tiny caption under photo */}
            <p className="font-mono text-[9px] text-[#1A1A1A]/80 mt-2 ml-1 tracking-widest uppercase">
              Photograph of Authorized Traveler
            </p>
          </div>

          {/* Right: ID Data Fields */}
          <div className="w-[55%] h-full pl-6 pt-1 flex flex-col">
            
            <div className="text-center mb-2">
              <h2 className="font-mono font-bold text-xs tracking-widest text-[#1A1A1A] uppercase">
                Permanent License of Travel
              </h2>
              <h1 className="font-mono font-black text-xl tracking-wider text-[#1A1A1A] uppercase mt-0.5">
                NO. {idState.idNumber}
              </h1>
            </div>

            <div className="flex flex-col gap-2 font-mono text-[#1A1A1A] relative z-10">
              <div className="flex items-end h-7 relative">
                <span className="text-sm font-mono shrink-0 whitespace-nowrap text-[#1A1A1A] mr-1.5 pb-0.5">
                  Issued to
                </span>
                <div className="flex-1 relative h-full flex items-end border-b-[2px] border-dotted border-[#1A1A1A]/60 pb-0.5 overflow-hidden">
                  <span className="font-marker text-2xl text-[#1A1A1A] leading-none pl-1 truncate w-full text-left">
                    {idState.issuedTo || '\u00A0'}
                  </span>
                </div>
              </div>
              <div className="flex items-end h-7 relative">
                <span className="text-sm font-mono shrink-0 whitespace-nowrap text-[#1A1A1A] mr-1.5 pb-0.5">
                  Date of birth
                </span>
                <div className="flex-1 relative h-full flex items-end border-b-[2px] border-dotted border-[#1A1A1A]/60 pb-0.5 overflow-hidden">
                  <span className="font-marker text-2xl text-[#1A1A1A] leading-none pl-1 truncate w-full text-left">
                    {idState.dateOfBirth || '\u00A0'}
                  </span>
                </div>
              </div>
              <div className="flex items-end h-7 relative">
                <span className="text-sm font-mono shrink-0 whitespace-nowrap text-[#1A1A1A] mr-1.5 pb-0.5">
                  Place of issue
                </span>
                <div className="flex-1 relative h-full flex items-end border-b-[2px] border-dotted border-[#1A1A1A]/60 pb-0.5 overflow-hidden">
                  <span className="font-marker text-2xl text-[#1A1A1A] leading-none pl-1 truncate w-full text-left">
                    {idState.placeOfIssue || '\u00A0'}
                  </span>
                </div>
              </div>
              <div className="flex items-end h-7 relative">
                <span className="text-sm font-mono shrink-0 whitespace-nowrap text-[#1A1A1A] mr-1.5 pb-0.5">
                  Date of issue
                </span>
                <div className="flex-1 relative h-full flex items-end border-b-[2px] border-dotted border-[#1A1A1A]/60 pb-0.5 overflow-hidden">
                  <span className="font-marker text-2xl text-[#1A1A1A] leading-none pl-1 truncate w-full text-left">
                    {idState.dateOfIssue || '\u00A0'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3.5 text-center px-2 relative">
              {/* Optional Blue Call Me If You Get Lost Stamp Overlay */}
              {idState.showBlueStamp && (
                <img 
                  src="/assets/cmiygl-stamp.webp" 
                  alt="Blue Stamp" 
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-56 h-auto pointer-events-none mix-blend-multiply opacity-80 -rotate-6 drop-shadow-sm"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              
              <h3 className="font-mono font-bold text-[10px] tracking-widest text-[#1A1A1A] uppercase mb-0.5">
                License of Travel
              </h3>
              <p className="font-mono text-[10px] leading-snug text-[#1A1A1A]/90">
                This is to Certify that the person named and described above is permitted to travel and explore freely unless detained by law.
              </p>
              
              <h3 className="font-mono font-bold text-[10px] tracking-widest text-[#1A1A1A] uppercase mt-1.5 mb-0.5">
                Important
              </h3>
              <p className="font-mono text-[10px] leading-snug text-[#1A1A1A]/90">
                The holder of this license wrote, composed, and arranged all songs within the attached record, unless stated otherwise.
              </p>
            </div>

            {/* Signature Area */}
            <div className="mt-auto self-center flex flex-col items-center relative z-20 w-64">
              <div className="h-10 w-full flex items-end justify-center pointer-events-none relative">
                <div className="absolute bottom-0.5 transform -rotate-2 w-full flex items-center justify-center">
                  {idState.signatureImage ? (
                    <img src={idState.signatureImage} alt="Signature" className="h-11 w-auto max-w-[220px] object-contain mix-blend-multiply opacity-90" />
                  ) : (
                    <div className="font-marker text-3xl text-[#1A1A1A] leading-none truncate max-w-full">
                      {idState.issuedTo}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full border-t-[2px] border-dotted border-[#1A1A1A]/60 flex justify-center pt-1 z-0">
                <span className="font-mono text-[9px] text-[#1A1A1A]/70 uppercase tracking-widest leading-none">
                  Signature of Authorized Traveler
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* BACK SIDE */}
      <div 
        id="travel-id-back"
        className="absolute inset-0 rounded-[20px] shadow-2xl overflow-hidden transition-opacity duration-300"
        style={{ 
          backgroundColor: idState.colorTheme,
          transform: 'rotateY(180deg)',
          opacity: activeSide === 'back' ? 1 : 0,
          pointerEvents: activeSide === 'back' ? 'auto' : 'none',
          zIndex: activeSide === 'back' ? 10 : 0
        }}
      >
        {/* Noise overlay for vintage texture */}
        <div 
          className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none" 
          style={{ backgroundImage: "url('/assets/noise.png')" }} 
        />
        
        <StarBorder />

        <div className="relative w-full h-full p-12">
          
          <p className="font-mono font-bold text-[10px] tracking-widest text-[#1A1A1A] uppercase mb-10">
            TRAVEL STAMPS: 2011 - PRESENT DAY
          </p>

          {/* Stamps Container */}
          <div className="relative w-full h-full">
            {idState?.stamps?.includes('igor') && (
              <img 
                src="/assets/igor-stamp.webp" 
                alt="IGOR Stamp" 
                className="absolute top-4 left-0 w-64 h-auto mix-blend-multiply -rotate-3 drop-shadow-sm"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            
            {idState?.stamps?.includes('cat') && (
              <img 
                src="/assets/cat-stamp.webp" 
                alt="Cat Stamp" 
                className="absolute top-2 right-12 w-32 h-auto mix-blend-multiply rotate-6 drop-shadow-sm"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            
            {idState?.stamps?.includes('nami') && (
              <img 
                src="/assets/nami-stamp.webp" 
                alt="Nami Stamp" 
                className="absolute bottom-6 left-8 w-48 h-auto mix-blend-multiply -rotate-6 drop-shadow-sm"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}

            {idState?.stamps?.includes('jollyRoger') && (
              <img 
                src="/assets/jollyRoger-stamp.webp" 
                alt="Jolly Roger Stamp" 
                className="absolute bottom-6 right-6 w-40 h-auto mix-blend-multiply rotate-12 drop-shadow-sm"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            
            {/* Center Call Me If You Get Lost - Blue Stamp */}
            {idState?.stamps?.includes('cmiygl') && (
              <img 
                src="/assets/cmiygl-stamp.webp" 
                alt="CMIYGL Blue Stamp" 
                className="absolute top-1/2 left-1/2 -translate-x-[45%] -translate-y-[45%] w-80 h-auto mix-blend-multiply -rotate-[4deg] drop-shadow-sm"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
