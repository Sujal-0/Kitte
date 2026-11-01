import React, { useEffect, useRef } from 'react';

export function VerticalDeskLines() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    let resizeTimeout;

    const drawVerticalLines = (width, height) => {
      const horizontalPadding = -50;
      const verticalPadding = -50;

      const linesCount = 40; 
      const lineWidthSpace = (width + 100) / linesCount;
      const cellHeight = 10;
      const rows = Math.floor((height + 100) / cellHeight);

      context.clearRect(0, 0, width, height);
      context.strokeStyle = "rgba(180, 150, 110, 0.4)"; 
      context.lineWidth = 2.5; 
      context.lineCap = "round";
      context.lineJoin = "round";
      context.beginPath();

      for (let i = 0; i < linesCount; i++) {
        const x = horizontalPadding + i * lineWidthSpace;
        let isFirstPoint = true;
        let prevX = 0;
        let prevY = 0;

        for (let j = 0; j < rows; j++) {
          const y = verticalPadding + j * cellHeight;
          const sketchyWobble = (Math.random() * 2) - 1; 
          const finalX = x + sketchyWobble;

          if (isFirstPoint) {
            context.moveTo(finalX, y);
            isFirstPoint = false;
          } else {
            const midX = (prevX + finalX) / 2;
            const midY = (prevY + y) / 2;
            context.quadraticCurveTo(prevX, prevY, midX, midY);
          }
          
          prevX = finalX;
          prevY = y;
        }
      }
      context.stroke();
    };

    const resizeCanvas = () => {
      const scaleFactor = window.devicePixelRatio || 1;
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      canvas.width = width * scaleFactor;
      canvas.height = height * scaleFactor;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(scaleFactor, scaleFactor);

      drawVerticalLines(width, height);
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 200);
    };

    window.addEventListener("resize", handleResize);
    
    // Initial render
    // Use a slight delay to ensure DOM layout is complete (especially for modals)
    setTimeout(resizeCanvas, 50);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60 mix-blend-multiply"
      aria-hidden="true"
    />
  );
}
