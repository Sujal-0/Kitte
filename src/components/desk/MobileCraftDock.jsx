import React from 'react';
import { motion } from 'framer-motion';
import { CrafterNotes } from './CrafterNotes';
import { ContactPhone } from './ContactPhone';
import { TornReceipt } from './TornReceipt';
import { WashiTape } from './WashiTape';

export function MobileCraftDock() {
  return (
    <div className="relative w-full px-2 pt-1 pb-2 flex flex-col items-center justify-center select-none overflow-visible pointer-events-auto">
      {/* Container holding the overlapping craft items, lifted up safely above home gesture zone */}
      <div className="relative w-full max-w-sm h-32 sm:h-36 flex items-end justify-between px-4 pb-3 sm:pb-4">
        
        {/* 1. LEFT ITEM: Crafter's Notes */}
        <div className="relative z-10 -rotate-3 hover:rotate-0 transition-transform origin-bottom-left pointer-events-auto">
          <CrafterNotes className="w-28 sm:w-32" />
        </div>

        {/* 2. MIDDLE ITEM: Torn Receipt with Japanese 切手 stamps */}
        <div className="relative z-20 rotate-3 hover:rotate-0 transition-transform origin-bottom -ml-4 sm:-ml-2 pointer-events-auto">
          <TornReceipt className="w-14 sm:w-16" />
          <WashiTape className="absolute -top-2 left-1/2 -translate-x-1/2 rotate-1 w-10 h-3 pointer-events-none" />
        </div>

        {/* 3. RIGHT ITEM: Retro Contact Phone with cracked glass */}
        <div className="relative z-10 -rotate-2 hover:rotate-0 transition-transform origin-bottom-right pointer-events-auto">
          <ContactPhone className="w-16 sm:w-20" />
          <WashiTape className="absolute -top-2 left-1/2 -translate-x-1/2 rotate-3 w-10 h-3 pointer-events-none" />
        </div>

      </div>
    </div>
  );
}
