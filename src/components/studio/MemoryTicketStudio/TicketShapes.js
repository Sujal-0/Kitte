export function getTicketPath(shape, w, h, isHoriz, strokeW = 0) {
  const inset = strokeW > 0 ? strokeW / 2 : 0;
  const left = inset;
  const top = inset;
  const right = w - inset;
  const bottom = h - inset;
  const innerW = right - left;
  const innerH = bottom - top;
  const split = isHoriz ? left + innerW * 0.75 : top + innerH * 0.75;
  const r = Math.max(2, 15 - inset); // border radius or notch radius

  switch (shape) {
    case 'notch': {
      if (isHoriz) {
        return `
          M ${left + r} ${top} 
          L ${split - r} ${top}
          A ${r} ${r} 0 0 0 ${split + r} ${top}
          L ${right - r} ${top}
          A ${r} ${r} 0 0 1 ${right} ${top + r}
          L ${right} ${bottom - r}
          A ${r} ${r} 0 0 1 ${right - r} ${bottom}
          L ${split + r} ${bottom}
          A ${r} ${r} 0 0 0 ${split - r} ${bottom}
          L ${left + r} ${bottom}
          A ${r} ${r} 0 0 1 ${left} ${bottom - r}
          L ${left} ${top + r}
          A ${r} ${r} 0 0 1 ${left + r} ${top} Z
        `;
      } else {
        return `
          M ${left} ${top + r}
          A ${r} ${r} 0 0 1 ${left + r} ${top}
          L ${right - r} ${top}
          A ${r} ${r} 0 0 1 ${right} ${top + r}
          L ${right} ${split - r}
          A ${r} ${r} 0 0 0 ${right} ${split + r}
          L ${right} ${bottom - r}
          A ${r} ${r} 0 0 1 ${right - r} ${bottom}
          L ${left + r} ${bottom}
          A ${r} ${r} 0 0 1 ${left} ${bottom - r}
          L ${left} ${split + r}
          A ${r} ${r} 0 0 0 ${left} ${split - r} Z
        `;
      }
    }
    case 'minimal': {
      // Clean rectangle, we will render a dashed line for the perforation separately
      return `M ${left} ${top} L ${right} ${top} L ${right} ${bottom} L ${left} ${bottom} Z`;
    }
    case 'cinema': {
      // Rounded rectangle
      return `
        M ${left + r} ${top}
        L ${right - r} ${top} A ${r} ${r} 0 0 1 ${right} ${top + r}
        L ${right} ${bottom - r} A ${r} ${r} 0 0 1 ${right - r} ${bottom}
        L ${left + r} ${bottom} A ${r} ${r} 0 0 1 ${left} ${bottom - r}
        L ${left} ${top + r} A ${r} ${r} 0 0 1 ${left + r} ${top} Z
      `;
    }
    case 'zigzag': {
      // Sawtooth edge on the outer short edges
      // For horizontal: left and right edges are zigzag
      // For vertical: top and bottom edges are zigzag
      const teethCount = 15;
      const toothDepth = 8;
      let path = '';
      
      if (isHoriz) {
        const toothH = innerH / teethCount;
        path += `M ${left} ${top} L ${right} ${top} `;
        for (let i = 1; i <= teethCount; i++) {
          path += `L ${right - toothDepth} ${top + toothH * (i - 0.5)} L ${right} ${top + toothH * i} `;
        }
        path += `L ${right} ${bottom} L ${left} ${bottom} `;
        for (let i = teethCount; i >= 1; i--) {
          path += `L ${left + toothDepth} ${top + toothH * (i - 0.5)} L ${left} ${top + toothH * (i - 1)} `;
        }
        path += 'Z';
      } else {
        const toothW = innerW / teethCount;
        path += `M ${left} ${top} `;
        for (let i = 1; i <= teethCount; i++) {
          path += `L ${left + toothW * (i - 0.5)} ${top + toothDepth} L ${left + toothW * i} ${top} `;
        }
        path += `L ${right} ${bottom} `;
        for (let i = teethCount; i >= 1; i--) {
          path += `L ${left + toothW * (i - 0.5)} ${bottom - toothDepth} L ${left + toothW * (i - 1)} ${bottom} `;
        }
        path += 'Z';
      }
      return path;
    }
    case 'scalloped': {
      // Wavy/scalloped edge on the short edges
      const scallopsCount = 16;
      let path = '';
      if (isHoriz) {
        const scallopH = innerH / scallopsCount;
        path += `M ${left} ${top} L ${right} ${top} `;
        for (let i = 1; i <= scallopsCount; i++) {
          path += `A ${scallopH/2} ${scallopH/2} 0 0 0 ${right} ${top + scallopH * i} `;
        }
        path += `L ${left} ${bottom} `;
        for (let i = scallopsCount; i >= 1; i--) {
          path += `A ${scallopH/2} ${scallopH/2} 0 0 0 ${left} ${top + scallopH * (i - 1)} `;
        }
        path += 'Z';
      } else {
        const scallopW = innerW / scallopsCount;
        path += `M ${left} ${top} `;
        for (let i = 1; i <= scallopsCount; i++) {
          path += `A ${scallopW/2} ${scallopW/2} 0 0 0 ${left + scallopW * i} ${top} `;
        }
        path += `L ${right} ${bottom} `;
        for (let i = scallopsCount; i >= 1; i--) {
          path += `A ${scallopW/2} ${scallopW/2} 0 0 0 ${left + scallopW * (i - 1)} ${bottom} `;
        }
        path += 'Z';
      }
      return path;
    }
    case 'beveled': {
      // Beveled (cut) outer corners
      const b = Math.max(5, 25 - inset);
      return `
        M ${left + b} ${top} L ${right - b} ${top} L ${right} ${top + b} L ${right} ${bottom - b} L ${right - b} ${bottom} L ${left + b} ${bottom} L ${left} ${bottom - b} L ${left} ${top + b} Z
      `;
    }
    case 'corner-notches': {
      // Semi-circles cut out of the 4 outer corners
      const c = Math.max(5, 20 - inset);
      return `
        M ${left + c} ${top} L ${right - c} ${top} A ${c} ${c} 0 0 0 ${right} ${top + c}
        L ${right} ${bottom - c} A ${c} ${c} 0 0 0 ${right - c} ${bottom}
        L ${left + c} ${bottom} A ${c} ${c} 0 0 0 ${left} ${bottom - c}
        L ${left} ${top + c} A ${c} ${c} 0 0 0 ${left + c} ${top} Z
      `;
    }
    default:
      return `M ${left} ${top} L ${right} ${top} L ${right} ${bottom} L ${left} ${bottom} Z`;
  }
}

export function getPerforationLine(shape, w, h, isHoriz, strokeW = 0) {
  const inset = strokeW > 0 ? strokeW / 2 : 0;
  const left = inset;
  const top = inset;
  const innerW = w - inset * 2;
  const innerH = h - inset * 2;
  const split = isHoriz ? left + innerW * 0.75 : top + innerH * 0.75;
  if (isHoriz) {
    return { x1: split, y1: top + 15, x2: split, y2: top + innerH - 15 };
  } else {
    return { x1: left + 15, y1: split, x2: left + innerW - 15, y2: split };
  }
}
