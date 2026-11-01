import React, { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const cursorRef = useRef(null);
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    // Only enable on fine pointer devices (desktops)
    if (!window.matchMedia('(pointer: fine)').matches) return;
    setIsFinePointer(true);

    const onMouseMove = (e) => {
      if (!cursorRef.current) return;
      
      const target = e.target;
      const isPointer = 
        window.getComputedStyle(target).cursor === 'pointer' || 
        target.tagName.toLowerCase() === 'button' || 
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') !== null || 
        target.closest('a') !== null;
      
      // We subtract 2px from X and Y so the visual tip of our drawn arrow perfectly aligns with the exact pixel the system clicks on!
      // This ensures the Starburst spawns directly at the tip of the arrow.
      cursorRef.current.style.transform = `translate3d(${e.clientX - 2}px, ${e.clientY - 2}px, 0) scale(${isPointer ? 1.15 : 1})`;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  if (!isFinePointer) return null;

  return (
    <div 
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] transition-transform duration-100 ease-out will-change-transform origin-top-left"
      style={{ transform: `translate3d(-100px, -100px, 0)` }}
    >
      {/* Big, bold, manga-style arrow SVG with Hand-drawn Sketchy Filter */}
      <svg 
        width="44" 
        height="44" 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
        style={{ transform: "rotate(-5deg)" }}
      >
        <defs>
          <filter id="cursor-sketch">
            <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <path 
          // Path shifted slightly so the tip starts at (2,2) to avoid stroke clipping
          d="M2 2 L23.5 14 L13.5 15.5 L21 26.5 L16 28.5 L8.5 17.5 L2 25.5 Z" 
          fill="#161616" 
          stroke="#F4F1EA" 
          strokeWidth="2.5" 
          strokeLinejoin="round" 
          filter="url(#cursor-sketch)"
        />
      </svg>
    </div>
  );
}
