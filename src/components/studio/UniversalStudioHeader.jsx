import React from 'react';
import { motion } from 'framer-motion';
import { NeuButton } from '../ui/NeuButton';

export function UniversalStudioHeader({ title, description, onBack }) {
  return (
    <header className="w-full h-24 border-b-4 border-[#1A1A1A] bg-[#F4F1EA] flex items-center justify-between px-8 shrink-0 z-20">
      
      {/* Left: Back Button & Title */}
      <div className="flex items-center gap-8">
        <NeuButton 
          onClick={onBack}
          className="px-6 py-2 text-base flex items-center gap-3 group"
        >
          <img 
            src="/assets/dottedUpArrow.svg" 
            alt="Back" 
            className="w-6 h-6 object-contain -rotate-180 handwritten-text transition-transform duration-300 group-hover:-translate-x-3"
          />
          <span>RETURN TO DESK</span>
        </NeuButton>

        <h1 className="font-marker text-5xl uppercase tracking-tighter text-[#1A1A1A] handwritten-text" style={{ WebkitTextStroke: '1px #1A1A1A' }}>
          {title}
        </h1>
      </div>

      {/* Right: Typewriter Description */}
      <div className="max-w-sm text-right">
        <p className="font-mono text-sm uppercase tracking-widest text-[#1A1A1A]/80 leading-tight">
          {description}
        </p>
      </div>

    </header>
  );
}
