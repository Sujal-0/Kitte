/**
 * Universal Crop and Trim Marks for Professional Printing
 */

/**
 * Draw professional printer crop/trim marks at the four corners of a rect.
 */
export function drawCropMarks(ctx, x, y, w, h, scale, markLen = 20, markOffset = 8) {
  const mLen = markLen * scale;
  const mOff = markOffset * scale;
  ctx.save();
  ctx.strokeStyle = 'rgba(26, 26, 26, 0.4)';
  ctx.lineWidth = 1 * scale;
  ctx.setLineDash([]);

  const corners = [
    [x, y],
    [x + w, y],
    [x, y + h],
    [x + w, y + h]
  ];

  corners.forEach(([cx, cy]) => {
    // Horizontal mark
    ctx.beginPath();
    ctx.moveTo(cx - mLen, cy);
    ctx.lineTo(cx - mOff, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + mOff, cy);
    ctx.lineTo(cx + mLen, cy);
    ctx.stroke();

    // Vertical mark
    ctx.beginPath();
    ctx.moveTo(cx, cy - mLen);
    ctx.lineTo(cx, cy - mOff);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy + mOff);
    ctx.lineTo(cx, cy + mLen);
    ctx.stroke();
  });

  ctx.restore();
}
