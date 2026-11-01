import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundFX } from '../../utils/audio';
import { useUrlStateBool } from '../../hooks/useUrlState';
import { triggerBurst } from '../ui/ClickBurstEngine';

export function ContactPhone({ className = "w-24 md:w-28" }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isOpen, setIsOpen] = useUrlStateBool('phone', false);

  const [sender, setSender] = useState('');
  const [budget, setBudget] = useState('Pick a range');
  const [deadline, setDeadline] = useState('When by?');
  const [message, setMessage] = useState("Let's work together! What kind of website are we making? :)");

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
    const mailto = `mailto:sujalsingh2204@gmail.com?subject=${encodeURIComponent("New Project Inquiry [KITTE]")}&body=${encodeURIComponent(`From: ${sender}\nBudget: ${budget}\nDeadline: ${deadline}\n\nMessage:\n${message}`)}`;
    window.location.href = mailto;
    setIsOpen(false);
  };

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
            ? "drop-shadow(10px 10px 0px #2D2D2D)"
            : "drop-shadow(5px 5px 0px #2D2D2D)",
          x: isPressed ? 4 : 0,
          y: isPressed ? 4 : 0,
          rotateZ: -4,
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

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            key="phone-modal-overlay"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 lg:p-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)} 
          >
            <motion.div 
              className="relative h-[85vh] max-h-[850px] aspect-[1/2] flex justify-center items-center"
              initial={{ y: 50, scale: 0.95, rotateZ: -2 }}
              animate={{ y: 0, scale: 1, rotateZ: 0 }}
              exit={{ y: 50, scale: 0.95, rotateZ: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()} 
            >
              {/* BASE IMAGE LAYER */}
              <img 
                src="/assets/phoneContact.webp" 
                alt="Phone Modal Base"
                className="w-full h-full object-contain drop-shadow-2xl pointer-events-none select-none z-10"
              />

              {/* 
                INTERACTIVE FORM OVERLAY
                Coordinates adjusted to perfectly match your blue reference box!
                Top and bottom margins are heavily increased to avoid the bezel/home button. 
              */}
              <div className="absolute top-[18%] bottom-[19%] left-[7.5%] right-[9.5%] flex flex-col text-zinc-900 bg-[#EAEAEA]/85 z-20">
                
                {/* REAL-TIME IOS STATUS BAR */}
                <div className="flex justify-between items-center text-[10px] font-semibold px-4 pt-1 pb-2">
                  <span>{time}</span>
                  <div className="flex gap-1.5 items-center">
                    {/* Signal Bars */}
                    <div className="flex items-end gap-[1px] h-2.5">
                      <div className="w-[2px] h-[30%] bg-zinc-900 rounded-sm" />
                      <div className="w-[2px] h-[50%] bg-zinc-900 rounded-sm" />
                      <div className="w-[2px] h-[75%] bg-zinc-900 rounded-sm" />
                      <div className="w-[2px] h-full bg-zinc-900 rounded-sm" />
                    </div>
                    {/* Fake Wifi Icon */}
                    <svg width="12" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                    {/* Battery */}
                    <div className="flex items-center">
                      <div className="border border-zinc-900/60 w-5 h-2.5 rounded-[2px] p-[1px]">
                        <div className="bg-zinc-900 h-full w-[70%]" />
                      </div>
                      <div className="bg-zinc-900/60 w-[1px] h-1 rounded-r-sm" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[12px] sm:text-[14px] font-semibold mb-1 px-3">
                  <button type="button" onClick={() => { soundFX.playPop(); setIsOpen(false); }} className="text-[#007AFF] hover:opacity-70 cursor-pointer">
                    Cancel
                  </button>
                  <span className="font-bold">New Message</span>
                  <button type="button" onClick={handleSubmit} className="text-[#007AFF] font-bold hover:opacity-70 cursor-pointer">
                    Send
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-0 text-[12px] sm:text-[13px] flex-1 flex flex-col font-sans px-1">
                  <div className="flex items-center gap-2 border-b border-zinc-400/30 py-1.5 px-2">
                    <span className="text-zinc-500 w-14">To:</span>
                    <span className="font-medium">sujalsingh2204@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2 border-b border-zinc-400/30 py-1.5 px-2">
                    <span className="text-zinc-500 w-14">From:</span>
                    <input
                      type="email"
                      placeholder="you@somewhere.com"
                      value={sender}
                      onChange={(e) => setSender(e.target.value)}
                      className="w-full bg-transparent focus:outline-none placeholder:text-zinc-400/70 text-zinc-900"
                    />
                  </div>
                  <div className="flex items-center gap-2 border-b border-zinc-400/30 py-1.5 px-2">
                    <span className="text-zinc-500 w-14">Budget:</span>
                    <input
                      type="text"
                      placeholder="Pick a range"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-transparent focus:outline-none placeholder:text-zinc-400/70 text-zinc-900"
                    />
                  </div>
                  <div className="flex items-center gap-2 border-b border-zinc-400/30 py-1.5 px-2">
                    <span className="text-zinc-500 w-14">Deadline:</span>
                    <input
                      type="text"
                      placeholder="When by?"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-transparent focus:outline-none placeholder:text-zinc-400/70 text-zinc-900"
                    />
                  </div>
                  
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-full bg-transparent focus:outline-none resize-none mt-2 px-2 text-[14px] leading-relaxed text-zinc-900"
                  />
                </form>
              </div>
              
              {/* TOP CRACK LAYER (Inverted & Screened) */}
              {/* This places a duplicate image exactly on top, inverted so the black screen becomes white, 
                  and the white cracks become dark, then applies mix-blend-multiply to stamp those cracks ON TOP of your form! */}
              <img 
                src="/assets/phoneContact.webp" 
                alt="Phone Cracks"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-30 mix-blend-multiply opacity-30 invert"
              />

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
