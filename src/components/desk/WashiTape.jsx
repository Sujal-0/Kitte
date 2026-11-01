import React from 'react';

export function WashiTape({ className = "h-6 w-20" }) {
  return (
    <div className={`bg-[#E4D4B0]/80 backdrop-blur-[1px] border-t border-b border-[#C8B895]/60 shadow-[1px_2px_4px_rgba(0,0,0,0.08)] pointer-events-none z-40 select-none ${className}`}>
      {/* Tape Texture */}
      <div 
        className="w-full h-full opacity-30 mix-blend-multiply"
        style={{
          backgroundImage: "radial-gradient(#A88F62 1px, transparent 1px)",
          backgroundSize: "4px 4px",
        }}
      />
    </div>
  );
}
