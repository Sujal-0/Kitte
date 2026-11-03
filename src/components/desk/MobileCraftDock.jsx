import React from 'react';
import { motion } from 'framer-motion';
import { CrafterNotes } from './CrafterNotes';
import { ContactPhone } from './ContactPhone';
import { TornReceipt } from './TornReceipt';
import { WashiTape } from './WashiTape';

export function MobileCraftDock() {
  return (
    <div className="relative w-full px-2 pt-1 pb-3 flex flex-col items-center justify-center select-none overflow-visible">
      {/* Container holding the overlapping craft items */}
      <div className="relative w-full max-w-sm h-32 flex items-end justify-between px-3">
        
        {/* 1. LEFT ITEM: Crafter's Notes */}
        <div className="relative z-10 -rotate-3 hover:rotate-0 transition-transform origin-bottom-left">
          <CrafterNotes className="w-28 sm:w-32" />
        </div>

        {/* 2. MIDDLE ITEM: Torn Receipt with Japanese 切手 stamps */}
        <div className="relative z-20 rotate-3 hover:rotate-0 transition-transform origin-bottom -ml-4 sm:-ml-2">
          <TornReceipt className="w-14 sm:w-16" />
          <WashiTape className="absolute -top-2 left-1/2 -translate-x-1/2 rotate-1 w-10 h-3" />
        </div>

        {/* 3. RIGHT ITEM: Retro Contact Phone with cracked glass */}
        <div className="relative z-10 -rotate-2 hover:rotate-0 transition-transform origin-bottom-right">
          <ContactPhone className="w-16 sm:w-20" />
          <WashiTape className="absolute -top-2 left-1/2 -translate-x-1/2 rotate-3 w-10 h-3" />
        </div>

      </div>
    </div>
  );
}
