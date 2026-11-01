import React from 'react';
import { twMerge } from 'tailwind-merge';
import { soundFX } from '../../utils/audio';

export function NeuButton({ children, onClick, className = "" }) {
  return (
    <button 
      onClick={(e) => {
        soundFX.playSnap();
        if (onClick) onClick(e);
      }}
      className={twMerge(
        "px-8 py-3 font-mono font-bold bg-[#E4D4B0] text-[#2D2D2D] text-lg border-2 border-[#2D2D2D] transition-all shadow-[4px_4px_0px_#2D2D2D] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:scale-95",
        className
      )}
    >
      {children}
    </button>
  );
}
