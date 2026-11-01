import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export function NeoSignaturePad({ label, onChange, valueDataURL }) {
  const sigCanvas = useRef(null);
  const wrapperRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 100 });

  useEffect(() => {
    if (wrapperRef.current) {
      setDimensions({
        width: wrapperRef.current.offsetWidth - 4, // border offset
        height: 100
      });
    }
  }, []);

  // Synchronize signature canvas with valueDataURL (mount, load, or reset)
  useEffect(() => {
    if (!sigCanvas.current) return;

    if (!valueDataURL) {
      // Unconditionally wipe signature canvas clean when valueDataURL is null/empty (e.g. on reset progress)
      try {
        sigCanvas.current.clear?.();
        const canvas = sigCanvas.current.getCanvas?.();
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      } catch (e) {
        console.error('Failed to clear signature canvas:', e);
      }
      return;
    }

    // If we have a valueDataURL, draw it onto the canvas
    const canvas = sigCanvas.current.getCanvas?.();
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = valueDataURL;
    }
  }, [valueDataURL, dimensions.width]);

  const handleEnd = () => {
    if (!sigCanvas.current) return;

    if (sigCanvas.current.isEmpty && sigCanvas.current.isEmpty()) {
      onChange(null);
      return;
    }

    try {
      const trimmed = sigCanvas.current.getTrimmedCanvas();
      if (trimmed && trimmed.width > 0 && trimmed.height > 0) {
        onChange(trimmed.toDataURL('image/png'));
        return;
      }
    } catch {
      // fallback to standard canvas data URL
    }

    try {
      const dataUrl = sigCanvas.current.toDataURL('image/png');
      onChange(dataUrl);
    } catch (e) {
      console.error('Failed to export signature data:', e);
    }
  };

  const handleClear = () => {
    if (sigCanvas.current) {
      try {
        sigCanvas.current.clear?.();
        const canvas = sigCanvas.current.getCanvas?.();
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      } catch (e) {
        console.error('Failed to clear canvas:', e);
      }
    }
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-1 w-full relative">
      <div className="flex justify-between items-end">
        <label className="font-marker text-xl uppercase tracking-wider text-[#1A1A1A] handwritten-text">
          {label}
        </label>
        
        <button 
          type="button"
          onClick={handleClear}
          className="text-[10px] font-mono font-bold uppercase hover:text-red-600 hover:underline cursor-pointer"
        >
          Clear
        </button>
      </div>
      
      <div 
        ref={wrapperRef}
        className="w-full bg-white border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] focus-within:shadow-[1px_1px_0px_#1A1A1A] focus-within:translate-y-[1px] focus-within:translate-x-[1px] transition-all relative overflow-hidden"
        style={{ height: 100 }}
      >
        {dimensions.width > 0 && (
          <SignatureCanvas 
            ref={sigCanvas}
            penColor="#1A1A1A"
            minWidth={1.5}
            maxWidth={3.5}
            velocityFilterWeight={0.7}
            onEnd={handleEnd}
            canvasProps={{
              width: dimensions.width,
              height: dimensions.height,
              className: 'absolute inset-0 w-full h-full cursor-crosshair'
            }}
          />
        )}
      </div>
    </div>
  );
}
