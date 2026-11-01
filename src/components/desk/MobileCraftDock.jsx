import React from 'react';
import { motion } from 'framer-motion';
import { CrafterNotes } from './CrafterNotes';
import { ContactPhone } from './ContactPhone';
import { TornReceipt } from './TornReceipt';
import { WashiTape } from './WashiTape';
import { triggerBurst } from '../ui/ClickBurstEngine';
import { soundFX } from '../../utils/audio';

export function MobileCraftDock() {
  return (
    <div className="relative w-full px-2 pt-2 pb-4 flex items-end justify-center select-none overflow-visible">
      {/* Container holding the overlapping craft items */}
      <div className="relative w-full max-w-sm h-36 flex items-end justify-between px-2">
        
        {/* 1. LEFT ITEM: Crafter's Notes */}
        <div className="relative z-10 -rotate-3 hover:rotate-0 transition-transform origin-bottom-left">
          <CrafterNotes className="w-28 sm:w-32" />
          
          {/* Pinned washi tape labeled "Washi -tape" matching mobile mockup */}
          <div className="absolute -bottom-2 -left-2 z-20 pointer-events-none flex items-center justify-center">
            <div className="relative bg-[#E6D7B8]/90 border-t border-b border-[#C8B895]/80 px-2 py-0.5 shadow-[1px_2px_3px_rgba(0,0,0,0.15)] -rotate-6">
              <span className="font-marker text-[9px] text-[#2D2D2D] tracking-tight uppercase handwritten-text">
                Washi -tape
              </span>
            </div>
          </div>
        </div>

        {/* 2. MIDDLE ITEM: Torn Receipt with Japanese 切手 stamps */}
        <div className="relative z-20 rotate-3 hover:rotate-0 transition-transform origin-bottom -ml-4 sm:-ml-2">
          {/* Subtle utility stamp sticker above receipt */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-70 pointer-events-none">
            <span className="font-marker text-[9px] text-[#2D2D2D] handwritten-text">utility</span>
            <span className="text-[10px] text-[#2D2D2D]">✦</span>
          </div>

          <TornReceipt className="w-14 sm:w-16" />
          
          <WashiTape className="absolute -top-2 left-1/2 -translate-x-1/2 rotate-1 w-10 h-3" />
        </div>

        {/* 3. RIGHT ITEM: Retro Contact Phone with cracked glass */}
        <div className="relative z-10 -rotate-2 hover:rotate-0 transition-transform origin-bottom-right">
          {/* Pencil note tape sticker */}
          <div className="absolute -top-4 -left-3 z-30 pointer-events-none">
            <div className="bg-[#FFFCE8] border border-[#2D2D2D]/60 px-1.5 py-0.5 shadow-[1px_1px_0px_#2D2D2D] -rotate-6">
              <span className="font-marker text-[8px] text-[#2D2D2D] handwritten-text">
                pencil note
              </span>
            </div>
          </div>

          <ContactPhone className="w-16 sm:w-20" />
          
          <WashiTape className="absolute -top-2 left-1/2 -translate-x-1/2 rotate-3 w-10 h-3" />
        </div>

      </div>
    </div>
  );
}
