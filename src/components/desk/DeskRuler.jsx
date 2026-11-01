import React from "react";

export function DeskRuler({ className = "" }) {
  // Generate 45 centimeter ticks along the physical height
  const ticks = Array.from({ length: 42 });

  return (
    <div 
      className={`relative w-8 h-full bg-[#EAD8B8] border-l-[3px] border-r-[3px] border-pencil shadow-hard select-none pointer-events-none hidden lg:flex flex-col justify-between py-4 ${className}`}
      style={{
        borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px", // wobbly edge
      }}
    >
      {/* Wood / Acrylic Grain Texture */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, #A88F62, #A88F62 1px, transparent 1px, transparent 12px)",
        }}
      />

      {/* Measurement Graduation Ticks */}
      <div className="relative w-full h-full flex flex-col justify-between z-10 px-1">
        {ticks.map((_, i) => {
          const isMajor = i % 5 === 0;
          return (
            <div key={i} className="flex items-center justify-start w-full">
              <div 
                className={`h-[1.5px] bg-pencil ${isMajor ? "w-4" : "w-2"}`} 
              />
              {isMajor && (
                <span className="font-mono text-[8px] font-bold text-pencil ml-1 leading-none">
                  {i}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Ruler Brand Stamp */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 rotate-90 origin-center whitespace-nowrap font-mono text-[9px] text-pencil/70 tracking-widest uppercase">
        KITTE STUDIO 40CM
      </div>
    </div>
  );
}
