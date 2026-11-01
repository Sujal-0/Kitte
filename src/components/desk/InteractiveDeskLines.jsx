import React, { useEffect, useRef } from 'react';

export function InteractiveDeskLines() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    let resizeTimeout;

    const drawWaveEffect = (width, height) => {
      if (!width || !height || width <= 0 || height <= 0) return;

      const horizontalPadding = -100;
      const verticalPadding = -100;

      const linesCount = 80; 
      const lineHeight = (height + 200) / linesCount;
      const cellWidth = 10;
      const cols = Math.floor((width + 200) / cellWidth);

      const typeCanvasWidth = 400;
      const typeCanvasHeight = Math.floor(typeCanvasWidth * (height / width)); 
      const typeCanvas = document.createElement("canvas");
      const typeContext = typeCanvas.getContext("2d");
      typeCanvas.width = typeCanvasWidth;
      typeCanvas.height = typeCanvasHeight;

      const fontSize = typeCanvasWidth * 0.22;
      typeContext.fillStyle = "black";
      typeContext.fillRect(0, 0, typeCanvasWidth, typeCanvasHeight);
      typeContext.fillStyle = "white";
      typeContext.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
      typeContext.textBaseline = "middle";
      typeContext.textAlign = "center";
      typeContext.fillText("KITTE", typeCanvasWidth / 2, typeCanvasHeight / 2);

      const typeData = typeContext.getImageData(0, 0, typeCanvasWidth, typeCanvasHeight).data;

      context.clearRect(0, 0, width, height);
      context.strokeStyle = "rgba(180, 150, 110, 0.55)"; 
      context.lineWidth = 2.5; 
      context.lineCap = "round";
      context.lineJoin = "round";
      context.beginPath();

      for (let i = 0; i < linesCount; i++) {
        const y = verticalPadding + i * lineHeight;
        let isFirstPoint = true;
        let prevX = 0;
        let prevY = 0;

        for (let j = 0; j < cols; j++) {
          const x = horizontalPadding + j * cellWidth;

          const typeX = Math.floor((j / cols) * typeCanvasWidth);
          const typeY = Math.floor((i / linesCount) * typeCanvasHeight);
          const index = (typeY * typeCanvasWidth + typeX) * 4;
          const brightness = typeData[index] || 0;

          const heightOffset = (brightness / 255) * 45; 
          const sketchyWobble = (Math.random() * 2) - 1; 
          const finalY = y - heightOffset + sketchyWobble;

          if (isFirstPoint) {
            context.moveTo(x, finalY);
            isFirstPoint = false;
          } else {
            const midX = (prevX + x) / 2;
            const midY = (prevY + finalY) / 2;
            context.quadraticCurveTo(prevX, prevY, midX, midY);
          }
          
          prevX = x;
          prevY = finalY;
        }
      }
      context.stroke();
    };

    const resizeCanvas = () => {
      const scaleFactor = window.devicePixelRatio || 1;
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      if (width <= 0 || height <= 0) return;

      canvas.width = width * scaleFactor;
      canvas.height = height * scaleFactor;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(scaleFactor, scaleFactor);

      drawWaveEffect(width, height);
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 200);
    };

    window.addEventListener("resize", handleResize);
    
    // Initial render
    setTimeout(resizeCanvas, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
    />
  );
}
