import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { soundFX } from '../../utils/audio';
import { useUrlStateBool } from '../../hooks/useUrlState';
import { triggerBurst } from '../ui/ClickBurstEngine';

const DEFAULT_MESSAGE = "Let's work together! What kind of website are we making? :)";

export function ContactPhone({ className = "w-24 md:w-28" }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isOpen, setIsOpen] = useUrlStateBool('phone', false);

  const [sender, setSender] = useState('');
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const messageRef = useRef(null);

  const selectDefaultMessage = () => {
    if (messageRef.current && message === DEFAULT_MESSAGE) {
      messageRef.current.select();
      try {
        messageRef.current.setSelectionRange(0, messageRef.current.value.length);
      } catch (_) {}
    }
  };

  const handleMessageFocus = () => {
    if (message === DEFAULT_MESSAGE) {
      selectDefaultMessage();
      setTimeout(selectDefaultMessage, 20);
    }
  };

  const handleMessageClick = () => {
    if (message === DEFAULT_MESSAGE) {
      selectDefaultMessage();
      setTimeout(selectDefaultMessage, 20);
    }
  };

  const [time, setTime] = useState('');
  
  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    updateTime();
    const int = setInterval(updateTime, 1000);
    return () => clearInterval(int);
  }, []);

  const handleOpen = () => {
    setIsPressed(false);
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    soundFX.playSnap();
    const mailto = `mailto:sujalsingh2204@gmail.com?subject=${encodeURIComponent("New Project Inquiry [KITTE]")}&body=${encodeURIComponent(`From: ${sender}\n\nMessage:\n${message}`)}`;
    window.location.href = mailto;
    setIsOpen(false);
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="phone-modal-overlay"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-6 cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)} 
        >
          <motion.div 
            className="relative flex justify-center items-center cursor-auto select-none"
            style={{
              height: 'min(78vh, 800px, calc(88vw * 593 / 320))',
              width: 'min(calc(78vh * 320 / 593), calc(800px * 320 / 593), 88vw)',
              aspectRatio: '320 / 593'
            }}
            initial={{ y: 30, scale: 0.95, rotateZ: -2 }}
            animate={{ y: 0, scale: 1, rotateZ: 0 }}
            exit={{ y: 30, scale: 0.95, rotateZ: -2 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()} 
          >
            {/* BASE IMAGE LAYER */}
            <img 
              src="/assets/phoneContact.webp" 
              alt="Phone Modal Base"
              className="w-full h-full object-contain drop-shadow-2xl pointer-events-none select-none z-10 block"
            />

            {/* INTERACTIVE FORM OVERLAY */}
            <div className="absolute top-[18%] bottom-[19%] left-[7.5%] right-[9.5%] flex flex-col text-zinc-900 bg-[#EAEAEA]/90 z-20 overflow-hidden rounded-sm">
              
              {/* REAL-TIME IOS STATUS BAR */}
              <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-semibold px-3 pt-1 pb-1">
                <span>{time}</span>
                <div className="flex gap-1.5 items-center">
                  <div className="flex items-end gap-[1px] h-2">
                    <div className="w-[2px] h-[30%] bg-zinc-900 rounded-sm" />
                    <div className="w-[2px] h-[50%] bg-zinc-900 rounded-sm" />
                    <div className="w-[2px] h-[75%] bg-zinc-900 rounded-sm" />
                    <div className="w-[2px] h-full bg-zinc-900 rounded-sm" />
                  </div>
                  <svg width="10" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                  <div className="flex items-center">
                    <div className="border border-zinc-900/60 w-4 h-2 rounded-[2px] p-[1px]">
                      <div className="bg-zinc-900 h-full w-[70%]" />
                    </div>
                    <div className="bg-zinc-900/60 w-[1px] h-0.5 rounded-r-sm" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] sm:text-[13px] font-semibold mb-1 px-3">
                <button type="button" onClick={() => { soundFX.playPop(); setIsOpen(false); }} className="text-[#007AFF] hover:opacity-70 cursor-pointer">
                  Cancel
                </button>
                <span className="font-bold">New Message</span>
                <button type="button" onClick={handleSubmit} className="text-[#007AFF] font-bold hover:opacity-70 cursor-pointer">
                  Send
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-0 text-[10px] sm:text-[12px] flex-1 flex flex-col font-sans px-1 overflow-hidden">
                <div className="flex items-center gap-1.5 border-b border-zinc-400/30 py-1 px-2">
                  <span className="text-zinc-500 w-12 text-[10px] sm:text-xs">To:</span>
                  <span className="font-medium text-[10px] sm:text-xs truncate">sujalsingh2204@gmail.com</span>
                </div>
                <div className="flex items-center gap-1.5 border-b border-zinc-400/30 py-1 px-2">
                  <span className="text-zinc-500 w-12 text-[10px] sm:text-xs">From:</span>
                  <input
                    type="email"
                    placeholder="you@somewhere.com"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    className="w-full bg-transparent focus:outline-none placeholder:text-zinc-400/70 text-zinc-900 text-[10px] sm:text-xs"
                  />
                </div>
                <textarea
                  ref={messageRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={handleMessageFocus}
                  onClick={handleMessageClick}
                  placeholder="What kind of website are we making? :)"
                  className="w-full flex-1 bg-transparent focus:outline-none resize-none mt-1 p-2 text-[11px] sm:text-[13px] leading-relaxed text-zinc-900"
                />
              </form>
            </div>
            
            {/* TOP CRACK LAYER */}
            <img 
              src="/assets/phoneContact.webp" 
              alt="Phone Cracks"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-30 mix-blend-multiply opacity-25 invert"
            />

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.div
        className={`relative ${className} cursor-pointer select-none`}
        onPointerDown={(e) => {
          setIsPressed(true);
          soundFX.playPop();
          if (e?.clientX && e?.clientY) triggerBurst(e.clientX, e.clientY);
        }}
        onPointerUp={handleOpen}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        style={{ opacity: isOpen ? 0 : 1 }}
        animate={{
          filter: isPressed
            ? "drop-shadow(0px 0px 0px #2D2D2D)"
            : isHovered
            ? "drop-shadow(8px 8px 0px #2D2D2D)"
            : "drop-shadow(4px 4px 0px #2D2D2D)",
          x: isPressed ? 3 : 0,
          y: isPressed ? 3 : 0,
          rotateZ: 2,
          scale: isHovered && !isPressed ? 1.05 : 1
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <img 
          src="/assets/phoneContact.webp" 
          alt="Contact Phone" 
          className="w-full h-auto pointer-events-none" 
        />
      </motion.div>

      {typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent}
    </>
  );
}
