import React, { useEffect, useState } from "react";

export function triggerBurst(x, y) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kitte:burst', { detail: { x, y } }));
  }
}

export function ClickBurstEngine() {
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      // Avoid spawning on direct text input editing
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;

      const newBurst = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        rotation: Math.random() * 45,
      };

      setBursts((prev) => [...prev.slice(-12), newBurst]); // Keep pool light

      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== newBurst.id));
      }, 450);
    };

    const handleCustomBurst = (e) => {
      const { x, y } = e.detail || {};
      if (typeof x !== 'number' || typeof y !== 'number') return;
      const newBurst = {
        id: Date.now() + Math.random(),
        x,
        y,
        rotation: Math.random() * 45,
      };
      setBursts((prev) => [...prev.slice(-12), newBurst]);
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== newBurst.id));
      }, 450);
    };

    window.addEventListener("pointerdown", handleClick);
    window.addEventListener("kitte:burst", handleCustomBurst);
    return () => {
      window.removeEventListener("pointerdown", handleClick);
      window.removeEventListener("kitte:burst", handleCustomBurst);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className="absolute pointer-events-none"
          style={{
            left: burst.x,
            top: burst.y,
            transform: `translate(-50%, -50%) rotate(${burst.rotation}deg)`,
            width: 54,
            height: 54,
          }}
        >
          <svg
            className="w-full h-full animate-burst"
            viewBox="0 0 60 60"
          >
            {/* 6 Radiating Hand-Drawn Stroke Lines (Walmart / Josh Kern Style) */}
            <line x1="30" y1="18" x2="30" y2="4" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="30" y1="42" x2="30" y2="56" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="18" y1="30" x2="4" y2="30" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="42" y1="30" x2="56" y2="30" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="20" x2="10" y2="10" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
            <line x1="40" y1="40" x2="50" y2="50" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      ))}
    </div>
  );
}
