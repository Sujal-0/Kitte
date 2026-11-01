import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function NeoSelect({ label, value, onChange, options, name }) {
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
                    onChange(opt.value);
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
