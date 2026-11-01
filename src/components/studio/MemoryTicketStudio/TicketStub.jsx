import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTicketPath, getPerforationLine } from './TicketShapes';

const BARCODE_PATTERN = [3, 1, 1, 2, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 1, 2, 2, 1, 3, 1, 1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 3];

export function TicketStub({ state, activeSide, onUpdate, showShadow = false }) {
  const isHoriz = state.layout === 'horizontal';
  
  // Base dimensions swap perfectly without changing the aspect ratio math
  const w = isHoriz ? 500 : 250;
  const h = isHoriz ? 250 : 500;
  
  // Setup Stroke
  let strokeW = 0;
  if (state.border === 'thick') strokeW = 6;
  if (state.border === 'thin') strokeW = 2;

  const pathData = getTicketPath(state.shape, w, h, isHoriz, strokeW);
  const perf = getPerforationLine(state.shape, w, h, isHoriz, strokeW);

  const isBack = activeSide === 'back';

  return (
    <div 
      className="relative group flex items-center justify-center w-full h-full cursor-pointer" 
      style={{ transform: isBack ? 'scaleX(-1)' : 'none' }}
    >
      <motion.svg 
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`} 
        className="block overflow-visible transition-all duration-500"
      >
        <defs>
          <clipPath id="ticket-clip">
            <path d={pathData} />
          </clipPath>
        </defs>

        {/* Paper Base */}
        <motion.path 
          d={pathData} 
          fill={state.color} 
          stroke={strokeW > 0 ? '#1A1A1A' : 'none'} 
          strokeWidth={strokeW}
        />

        {/* Perforation Line (only visual, the cut is in the path) */}
        <line 
          x1={perf.x1} y1={perf.y1} x2={perf.x2} y2={perf.y2} 
          stroke="#1A1A1A" strokeWidth="2" strokeDasharray={state.shape === 'cinema' ? "4 8" : "8 8"} 
          strokeLinecap="round" opacity="0.15" 
        />

        {/* HTML Content Overlay */}
        <foreignObject x={strokeW/2} y={strokeW/2} width={w - strokeW} height={h - strokeW} clipPath="url(#ticket-clip)">
          <motion.div layout className={`w-full h-full flex ${isHoriz ? 'flex-row' : 'flex-col'} ${state.fontFamily} text-[#1A1A1A]`} style={{ padding: '2px' }}>
            
            {/* Kitte Stamp Watermark (Back Side Only) */}
            {isBack && state.showLogo && (
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
                <span className="font-marker text-[140px] uppercase font-black tracking-tighter" style={{ transform: isHoriz ? 'rotate(-10deg)' : 'rotate(-90deg)' }}>切手</span>
              </div>
            )}

            {/* Main Body */}
            <motion.div layout className={`relative z-10 flex-1 flex flex-col p-4 ${isHoriz ? '' : 'justify-end'}`}>
              <AnimatePresence mode="wait">
                {!isBack ? (
                  <motion.div key="front" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col h-full w-full">
                    {/* FRONT MAIN */}
                    {state.imageSrc ? (
                      <motion.div 
                        layout 
                        className="w-full flex-1 border-2 border-[#1A1A1A] bg-white shadow-sm overflow-hidden flex flex-col relative group photo-upload-area cursor-pointer"
                        style={{ padding: `${state.imagePadding !== undefined ? state.imagePadding : 8}px` }}
                      >
                        <div className="w-full h-full relative overflow-hidden pointer-events-none">
                          <img 
                            src={state.imageSrc} 
                            className={`absolute w-full h-full ${state.imageFit === 'contain' ? 'object-contain' : 'object-cover'} filter contrast-125 saturate-50 sepia-[0.2]`}
                            style={{ 
                              transform: `scale(${state.imageScale || 1}) translate(${state.imageOffsetX || 0}%, ${state.imageOffsetY || 0}%)`,
                              transformOrigin: 'center center'
                            }} 
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        layout 
                        className="w-full flex-1 border-2 border-dashed border-[#1A1A1A]/40 flex items-center justify-center bg-black/5 hover:bg-[#FFEB3B]/20 hover:border-solid hover:border-[#1A1A1A] transition-all duration-300 relative group photo-upload-area cursor-pointer"
                      >
                        <span className="font-marker text-xl opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-transform handwritten-text pointer-events-none">SUBMIT PHOTO</span>
                      </motion.div>
                    )}
                    
                    {/* Details under photo */}
                    <motion.div layout className="mt-2 flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-40 leading-none mb-1">Location</span>
                        <span className="text-lg font-bold leading-none">{state.location || '...'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-40 leading-none mb-1 block">Date</span>
                        <span className="text-base leading-none">{state.date || '...'}</span>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div key="back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between h-full w-full">
                    {/* BACK MAIN */}
                    <div>
                      <h3 className="font-mono text-xs uppercase tracking-widest opacity-40 mb-2 border-b-2 border-black/10 pb-1">Memory Note</h3>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{state.note || 'No notes left behind...'}</p>
                    </div>
                    <div className="mt-4 text-right">
                      <span className="font-mono text-[10px] uppercase tracking-widest opacity-40 block mb-1">Authorised By</span>
                      <span className="font-marker text-2xl">{state.signature || 'Anonymous'}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Stub Section */}
            <motion.div layout className={`relative z-10 ${isHoriz ? 'w-1/3 border-l-2 pl-12' : 'h-1/3 border-t-2 pt-12'} border-dashed border-[#1A1A1A]/10 p-3 flex flex-col items-center justify-center`}>
              {!isBack ? (
                <>
                  {/* FRONT STUB */}
                  <motion.div layout className={`flex flex-col items-center justify-center w-[90%] ${isHoriz ? '-rotate-90' : ''}`}>
                    <span className="font-mono text-[10px] uppercase tracking-widest opacity-60 border-y border-black/20 py-0.5 mb-2">Admit One</span>
                    
                    {/* Real Product Barcode for Front (Always horizontal, perfect span) */}
                    <div className="flex h-8 w-full justify-between items-end overflow-hidden mb-1">
                      {BARCODE_PATTERN.map((bw, i) => (
                        <div key={i} className="bg-[#1A1A1A] h-full" style={{ width: `${bw}px` }} />
                      ))}
                    </div>

                    <span className="font-marker text-3xl font-bold leading-none">{state.barcodeValue ? state.barcodeValue.split('-')[1] : '0000'}</span>
                  </motion.div>
                </>
              ) : (
                <>
                  {/* BACK STUB */}
                  <motion.div layout className={`flex flex-col items-center w-[90%] ${isHoriz ? '-rotate-90' : ''}`}>
                    
                    {/* Real Product Barcode for Back (Always horizontal, perfect span) */}
                    <div className="flex h-12 w-full justify-between items-end overflow-hidden">
                      {BARCODE_PATTERN.map((bw, i) => (
                        <div key={i} className="bg-[#1A1A1A] h-full" style={{ width: `${bw}px` }} />
                      ))}
                    </div>

                    <span className="font-mono text-[10px] tracking-widest mt-1 block w-full text-center">{state.barcodeValue || 'KITTE-0000'}</span>
                  </motion.div>
                </>
              )}
            </motion.div>

          </motion.div>
        </foreignObject>
      </motion.svg>
    </div>
  );
}
