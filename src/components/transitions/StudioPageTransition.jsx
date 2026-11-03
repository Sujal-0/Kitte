import React, { useEffect } from 'react';
import { motion, useAnimate } from 'framer-motion';
import { preloadCriticalAssets } from '../../utils/assetPreloader';

export function StudioPageTransition({ onComplete, onFinish, isClosing = false, isFirstIntro = false }) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    let isCancelled = false;

    const runAnimation = async () => {
      if (isCancelled) return;

      if (isClosing) {
        // Phase 1: Doors start open, slide them shut smoothly over the active Studio
        animate(".panel-left", { x: 0 }, { duration: 1.1, ease: [0.87, 0, 0.13, 1] });
        await animate(".panel-right", { x: 0 }, { duration: 1.1, ease: [0.87, 0, 0.13, 1] });
        if (isCancelled) return;

        // Brief 50ms breather for compositor to settle before crest entrance
        await new Promise(resolve => setTimeout(resolve, 50));
        if (isCancelled) return;

        // Reveal Canvas & Opposing Line Draw-In (silky smooth, zero DOM mounting lag)
        animate(".line-left", { scaleY: 1 }, { duration: 0.85, ease: [0.16, 1, 0.3, 1] });
        animate(".line-right", { scaleY: 1 }, { duration: 0.85, ease: [0.16, 1, 0.3, 1] });
        animate(".line-center", { scaleY: 1 }, { duration: 0.85, ease: [0.16, 1, 0.3, 1] });
        
        // Smooth crest entrance with custom easeOutExpo (no main-thread spring physics lag)
        await animate(".crest", { scale: 1, opacity: 1 }, { duration: 0.85, ease: [0.16, 1, 0.3, 1] });
        if (isCancelled) return;
        
        // Pause to admire the crest & preload project assets if first-time entrance
        const pauseTime = isFirstIntro ? 900 : 700;
        const pausePromise = new Promise(resolve => setTimeout(resolve, pauseTime));
        const preloadPromise = isFirstIntro ? preloadCriticalAssets() : Promise.resolve();

        await Promise.all([pausePromise, preloadPromise]);
        if (isCancelled) return;

        // Phase 2: Kinetic Exit Wipe
        animate(".line-left", { transformOrigin: "bottom" }, { duration: 0 });
        animate(".line-right", { transformOrigin: "top" }, { duration: 0 });
        animate(".line-center", { transformOrigin: "bottom" }, { duration: 0 });

        animate(".line-left", { scaleY: 0 }, { duration: 0.5, ease: [0.7, 0, 0.84, 0] });
        animate(".line-right", { scaleY: 0 }, { duration: 0.5, ease: [0.7, 0, 0.84, 0] });
        animate(".line-center", { scaleY: 0 }, { duration: 0.5, ease: [0.7, 0, 0.84, 0] });
        
        await animate(".crest", { scale: 1.05, opacity: 0 }, { duration: 0.5, ease: [0.7, 0, 0.84, 0] });
        if (isCancelled) return;

        // Phase 3: Now that the Japanese crest is fully complete and doors are closed,
        // swap the view underneath (Studio unmounts, Desk mounts) with zero visual impact
        onComplete();

        // Brief pause for React layout before doors part
        await new Promise(resolve => setTimeout(resolve, 150));
        if (isCancelled) return;

        // Slide doors open smoothly to reveal the Desk Workspace
        animate(".panel-left", { x: "-100%" }, { duration: 1.1, ease: [0.87, 0, 0.13, 1] });
        await animate(".panel-right", { x: "100%" }, { duration: 1.1, ease: [0.87, 0, 0.13, 1] });
        if (isCancelled) return;

        if (onFinish) onFinish();
      } else {
        // OPENING ANIMATION (Entering Studio from Desk)
        // Reveal Canvas & Opposing Line Draw-In
        animate(".line-left", { scaleY: 1 }, { duration: 0.85, ease: [0.16, 1, 0.3, 1] });
        animate(".line-right", { scaleY: 1 }, { duration: 0.85, ease: [0.16, 1, 0.3, 1] });
        animate(".line-center", { scaleY: 1 }, { duration: 0.85, ease: [0.16, 1, 0.3, 1] });
        
        await animate(".crest", { scale: 1, opacity: 1 }, { duration: 0.85, ease: [0.16, 1, 0.3, 1] });
        if (isCancelled) return;
        
        // Pause to admire the crest & preload project assets if first-time entrance
        const pauseTime = isFirstIntro ? 900 : 700;
        const pausePromise = new Promise(resolve => setTimeout(resolve, pauseTime));
        const preloadPromise = isFirstIntro ? preloadCriticalAssets() : Promise.resolve();

        await Promise.all([pausePromise, preloadPromise]);
        if (isCancelled) return;

        // Phase 2: Kinetic Exit Wipe
        animate(".line-left", { transformOrigin: "bottom" }, { duration: 0 });
        animate(".line-right", { transformOrigin: "top" }, { duration: 0 });
        animate(".line-center", { transformOrigin: "bottom" }, { duration: 0 });

        animate(".line-left", { scaleY: 0 }, { duration: 0.5, ease: [0.7, 0, 0.84, 0] });
        animate(".line-right", { scaleY: 0 }, { duration: 0.5, ease: [0.7, 0, 0.84, 0] });
        animate(".line-center", { scaleY: 0 }, { duration: 0.5, ease: [0.7, 0, 0.84, 0] });
        
        await animate(".crest", { scale: 1.05, opacity: 0 }, { duration: 0.5, ease: [0.7, 0, 0.84, 0] });
        if (isCancelled) return;

        // Small pause before doors open
        await new Promise(resolve => setTimeout(resolve, 150));
        if (isCancelled) return;

        // Phase 3: Shoji Bi-Parting Split
        // Signal completion so the Studio under it can mount
        onComplete(); 

        animate(".panel-left", { x: "-100%" }, { duration: 1.1, ease: [0.87, 0, 0.13, 1] });
        await animate(".panel-right", { x: "100%" }, { duration: 1.1, ease: [0.87, 0, 0.13, 1] });
        if (isCancelled) return;

        if (onFinish) onFinish();
      }
    };

    runAnimation();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  return (
    <div 
      ref={scope} 
      className="fixed inset-0 z-[9999] pointer-events-none flex w-screen h-screen overflow-hidden"
    >
      {/* Left Panel - Initial Opacity 1 to instantly block screen */}
      <motion.div 
        className="panel-left parchment-panel pointer-events-auto absolute top-0 left-0 w-1/2 h-full bg-[#F4F1EA] origin-left border-r border-[#1A1A1A]/10 shadow-[20px_0_50px_rgba(0,0,0,0.1)] z-10 [will-change:transform]"
        initial={{ opacity: 1, x: isClosing ? "-100%" : 0 }}
      />

      {/* Right Panel */}
      <motion.div 
        className="panel-right parchment-panel pointer-events-auto absolute top-0 right-0 w-1/2 h-full bg-[#F4F1EA] origin-right border-l border-[#1A1A1A]/10 shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-10 [will-change:transform]"
        initial={{ opacity: 1, x: isClosing ? "100%" : 0 }}
      />

      {/* Kinetic Lines */}
      {/* Line 1 (Left Margin) */}
      <motion.div 
        className="line-left absolute top-0 bottom-0 left-[8vw] w-[3px] bg-[#1A1A1A] z-20 origin-top [will-change:transform] pointer-events-none"
        initial={{ scaleY: 0 }}
      />

      {/* Line 2 (Right Margin) */}
      <motion.div 
        className="line-right absolute top-0 bottom-0 right-[8vw] w-[3px] bg-[#1A1A1A] z-20 origin-bottom [will-change:transform] pointer-events-none"
        initial={{ scaleY: 0 }}
      />

      {/* Line 3 (Center Axis) */}
      <motion.div 
        className="line-center absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-[#7D7871] z-30 origin-top [will-change:transform] pointer-events-none"
        initial={{ scaleY: 0 }}
      />

      {/* Center Crest Badge */}
      <motion.div 
        className="crest pointer-events-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-[4px] border-[#1A1A1A] bg-[#F4F1EA] flex items-center justify-center z-40 shadow-[4px_4px_0px_#1A1A1A] [will-change:transform,opacity] [transform:translateZ(0)]"
        initial={{ scale: 0.8, opacity: 0 }}
      >
        <span className="font-marker font-black text-6xl text-[#1A1A1A] mt-2 select-none pointer-events-none" style={{ WebkitTextStroke: '3px #1A1A1A' }}>切手</span>
      </motion.div>
    </div>
  );
}
