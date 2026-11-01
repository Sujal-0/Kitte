import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { soundFX } from "../../utils/audio";

export function KitteLogo({ className = "", onClickHome }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [postmarks, setPostmarks] = useState([]);
  const [localBursts, setLocalBursts] = useState([]);

  const handlePointerDown = (e) => {
    setIsPressed(true);
    soundFX.playPop();

    // Calculate local coordinates for the burst behind the logo
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBurst = { id: Date.now(), x, y, rotation: Math.random() * 45 };
    setLocalBursts((prev) => [...prev, newBurst]);

    setTimeout(() => {
      setLocalBursts((prev) => prev.filter((b) => b.id !== newBurst.id));
    }, 450);
  };

  const handlePointerUp = () => {
    setIsPressed(false);
    
    // Add Postmark validation stamp
    const newPostmark = { id: Date.now() };
    setPostmarks((prev) => [...prev, newPostmark]);
    
    // Remove after 2 seconds
    setTimeout(() => {
      setPostmarks((prev) => prev.filter((p) => p.id !== newPostmark.id));
    }, 2000);

    if (onClickHome) onClickHome();
  };

  const driftVariants = {
    idle: {
      y: ["0px", "-3px", "0px"],
      rotate: [0, 0.8, -0.8, 0],
      transition: {
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" }
      }
    },
    hover: {
      y: -6,
      rotateX: 12,
      rotateY: -8,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    tap: {
      y: 0,
      x: 0,
      rotateX: 0,
      rotateY: 0,
      scale: 0.98,
      transition: { type: "spring", stiffness: 500, damping: 15 }
    }
  };

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.3}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      animate={isPressed ? "tap" : isHovered ? "hover" : "idle"}
      variants={driftVariants}
      style={{ perspective: 1000 }}
      className={`relative inline-block cursor-pointer select-none z-20 ${className}`}
    >
      {/* Local Burst Engine (Fires strictly behind the PNG) */}
      {localBursts.map((b) => (
        <div 
          key={b.id} 
          className="absolute pointer-events-none z-0"
          style={{
            left: b.x,
            top: b.y,
            transform: `translate(-50%, -50%) rotate(${b.rotation}deg)`,
            width: 80,
            height: 80,
          }}
        >
          <svg className="w-full h-full animate-burst" viewBox="0 0 60 60">
            <line x1="30" y1="14" x2="30" y2="0" stroke="#2D2D2D" strokeWidth="3" strokeLinecap="round" />
            <line x1="30" y1="46" x2="30" y2="60" stroke="#2D2D2D" strokeWidth="3" strokeLinecap="round" />
            <line x1="14" y1="30" x2="0" y2="30" stroke="#2D2D2D" strokeWidth="3" strokeLinecap="round" />
            <line x1="46" y1="30" x2="60" y2="30" stroke="#2D2D2D" strokeWidth="3" strokeLinecap="round" />
            <line x1="18" y1="18" x2="6" y2="6" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="42" y1="42" x2="54" y2="54" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      ))}

      {/* The Physical Logo Image directly */}
      <motion.div
        className="relative z-10 flex"
        animate={{
          // Use drop-shadow so the ink traces the actual PNG alpha boundary, not a square CSS box!
          filter: isPressed 
            ? "drop-shadow(0px 0px 0px #2D2D2D)" 
            : isHovered 
              ? "drop-shadow(8px 8px 0px #2D2D2D)" 
              : "drop-shadow(4px 4px 0px #2D2D2D)",
          x: isPressed ? 4 : 0,
          y: isPressed ? 4 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {/* Dynamic Postmark Overlays on the image */}
        {postmarks.map((p) => (
          <Postmark key={p.id} />
        ))}

        {/* Logo Image */}
        <div className="relative w-44 h-auto z-10 pointer-events-none">
          <img 
            src="/kitteLogo.png" 
            alt="Kitte Logo" 
            className="w-full h-auto" 
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden w-44 h-20 bg-paper border-[3px] border-pencil flex-col items-center justify-center font-marker text-lg font-bold">
            [ ADD LOGO ]
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Postmark() {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsFading(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.5, rotate: -25 }}
      animate={{ 
        opacity: isFading ? 0 : 0.45, 
        scale: 1, 
        rotate: -5 
      }}
      transition={{ duration: 0.2, opacity: { duration: isFading ? 0.8 : 0.2 } }}
      className="absolute -top-4 -right-4 w-28 h-28 pointer-events-none z-30"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
         <circle cx="75" cy="35" r="22" fill="none" stroke="#2D2D2D" strokeWidth="1.5" />
         <circle cx="75" cy="35" r="18" fill="none" stroke="#2D2D2D" strokeWidth="0.8" />
         <text x="75" y="32" fontSize="6.5" fontWeight="bold" textAnchor="middle" fill="#2D2D2D" fontFamily="monospace">KITTE LAB</text>
         <text x="75" y="42" fontSize="5.5" textAnchor="middle" fill="#2D2D2D" fontFamily="monospace">POSTAGE PAID</text>
         
         {/* Wavy cancellation lines shooting out to the left */}
         <path d="M 15 25 Q 30 15, 45 25 T 60 25" fill="none" stroke="#2D2D2D" strokeWidth="1.5" />
         <path d="M 10 35 Q 25 25, 40 35 T 55 35" fill="none" stroke="#2D2D2D" strokeWidth="1.5" />
         <path d="M 15 45 Q 30 35, 45 45 T 60 45" fill="none" stroke="#2D2D2D" strokeWidth="1.5" />
      </svg>
    </motion.div>
  );
}
