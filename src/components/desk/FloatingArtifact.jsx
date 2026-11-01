import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { soundFX } from '../../utils/audio';
import { triggerBurst } from '../ui/ClickBurstEngine';

// Lissajous curve function for organic floating math
// x = A * sin(at + delta)
// y = B * sin(bt)
const generateLissajousPath = (time, config) => {
  const { a, b, A, B, delta } = config;
  return {
    x: A * Math.sin(a * time + delta),
    y: B * Math.sin(b * time)
  };
};

export function FloatingArtifact({ 
  src, 
  alt, 
  headline, 
  baseX, 
  baseY, 
  baseRotate,
  config = { a: 1, b: 2, A: 20, B: 20, delta: Math.PI / 2 },
  speed = 0.001,
  className = "w-32 md:w-48",
  onOpenStudio,
  style = {}
}) {
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();
  
  useEffect(() => {
    let animationFrameId;
    let startTime = Date.now();

    const animate = () => {
      if (!isHovered) {
        // Reduced speed by half for a slow, zero-gravity feel
        const elapsedTime = (Date.now() - startTime) * (speed * 0.5);
        const { x, y } = generateLissajousPath(elapsedTime, config);
        
        controls.set({
          x: x,
          y: y,
          rotateZ: baseRotate + (x * 0.1)
        });
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHovered, config, speed, controls, baseRotate]);

  return (
    <motion.div
      className={`absolute cursor-pointer group select-none ${className}`}
      style={{ left: baseX, top: baseY, ...style }}
      animate={controls}
      whileHover={{ 
        scale: 1.15, 
        rotateZ: 0, 
        zIndex: 50,
        // Reduced shadow size
        filter: "drop-shadow(6px 6px 0px #2D2D2D)",
        transition: { type: "spring", stiffness: 400, damping: 20 }
      }}
      whileTap={{ scale: 0.96 }}
      onHoverStart={() => {
        setIsHovered(true);
        soundFX.playPop();
      }}
      onHoverEnd={() => {
        setIsHovered(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        soundFX.playSnap();
        if (e?.clientX && e?.clientY) triggerBurst(e.clientX, e.clientY);
        if (onOpenStudio) {
          onOpenStudio({
            title: headline,
            imageSrc: src,
            description: "An interactive studio to generate physical-grade analog memory artifacts.",
            features: [
              "High DPI (300) Output",
              "Zero Telemetry & Local Processing",
              "Custom Image Filtering Pipeline",
              "CMYK / PDF Print Support"
            ]
          });
        }
      }}
    >
      <img 
        src={src} 
        alt={alt}
        className="w-full h-auto pointer-events-none drop-shadow-sm group-hover:drop-shadow-none transition-all duration-300"
      />
      
      {/* Kinetic Headline Reveal on Hover - Reduced text sizes */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-postitYellow text-pencil px-3 md:px-4 py-1 font-marker text-base md:text-lg lg:text-xl -rotate-3 border-2 border-pencil shadow-[3px_3px_0px_#2D2D2D] md:shadow-[4px_4px_0px_#2D2D2D]">
          {headline}
        </div>
      </div>
    </motion.div>
  );
}
