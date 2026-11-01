/**
 * Universal A4 PDF Generation & Download Engine
 */

import jsPDF from 'jspdf';

/**
 * Generate and trigger download of an A4 PDF document.
 * Supports Duplex (true 2-page A4) and Single-page formats.
 */
export async function generateA4PDF({ result, state, cleanName, exportType }) {
  const isPhotoBooth = 
    Boolean(cleanName && cleanName.toLowerCase().includes('photo')) || 
    Boolean(exportType && String(exportType).toLowerCase().includes('photo')) ||
    (result?.type === 'single' && cleanName && cleanName.includes('Photo'));

  const canvasToSave = result?.canvas || result?.combinedCanvas;

  // 1. Photo Booth Strip PDF (zero outer white area, exact photostrip proportions, auto full-page view)
  if (isPhotoBooth && canvasToSave) {
    const imgData = canvasToSave.toDataURL('image/png', 1.0);
    const mmPerPixel = 25.4 / 300; // 300 DPI high-resolution print scale
    const pageW = canvasToSave.width * mmPerPixel;
    const pageH = canvasToSave.height * mmPerPixel;
    const isWide = pageW > pageH;

    const pdf = new jsPDF({
      orientation: isWide ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pageW, pageH]
    });

    // ISO 32000 Isolated Transparency Group
    pdf.internal.events.subscribe('putPage', function() {
      pdf.internal.write('/Group << /Type /Group /S /Transparency /CS /DeviceRGB /I true /K false >>');
    });

    try {
      pdf.setDisplayMode('fullpage');
    } catch {}

    // Place photostrip covering 100% of the custom page with zero margins
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH, '', 'FAST');
    pdf.save(`${cleanName}_Kitte.pdf`);
    return true;
  }

  const isBounty = 
    Boolean(cleanName && cleanName.toLowerCase().includes('bounty')) || 
    Boolean(exportType && String(exportType).toLowerCase().includes('bounty'));

  // 1B. Bounty Poster PDF - Borderless Exact Scale (zero outer white area, exact poster proportions, auto full-page view)
  if (isBounty && (!result?.includeBleed || result?.type === 'single') && canvasToSave) {
    const imgData = canvasToSave.toDataURL('image/png', 1.0);
    const mmPerPixel = 25.4 / 300; // 300 DPI high-resolution scale
    const pageW = canvasToSave.width * mmPerPixel;
    const pageH = canvasToSave.height * mmPerPixel;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pageW, pageH]
    });

    // ISO 32000 Isolated Transparency Group
    pdf.internal.events.subscribe('putPage', function() {
      pdf.internal.write('/Group << /Type /Group /S /Transparency /CS /DeviceRGB /I true /K false >>');
    });

    try {
      pdf.setDisplayMode('fullpage');
    } catch {}

    // Place poster covering 100% of the custom page with zero white margins
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH, '', 'FAST');
    pdf.save(`${cleanName}_Kitte.pdf`);
    return true;
  }

  const isTimeCapsule = 
    Boolean(cleanName && (cleanName.toLowerCase().includes('time') || cleanName.toLowerCase().includes('capsule') || cleanName.toLowerCase().includes('letter'))) || 
    Boolean(exportType && (String(exportType).toLowerCase().includes('time') || String(exportType).toLowerCase().includes('capsule')));

  // 1C. Time Capsule Letterhead PDF - Borderless Exact Scale (zero outer white area, exact letter proportions at 300 DPI, full-page view)
  if (isTimeCapsule && (!result?.includeBleed || result?.type === 'borderless') && result?.type !== 'duplex' && result?.type !== 'fold-glue' && result?.type !== 'stamps-sheet' && canvasToSave) {
    const imgData = canvasToSave.toDataURL('image/png', 1.0);
    const mmPerPixel = 25.4 / 300; // 300 DPI high-resolution scale
    const pageW = canvasToSave.width * mmPerPixel;
    const pageH = canvasToSave.height * mmPerPixel;

    const pdf = new jsPDF({
      orientation: pageW >= pageH ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pageW, pageH]
    });

    // ISO 32000 Isolated Transparency Group
    pdf.internal.events.subscribe('putPage', function() {
      pdf.internal.write('/Group << /Type /Group /S /Transparency /CS /DeviceRGB /I true /K false >>');
    });

    try {
      pdf.setDisplayMode('fullpage');
    } catch {}

    // Place letter covering 100% of the custom page with zero white margins
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH, '', 'FAST');
    pdf.save(`${cleanName}_Kitte.pdf`);
    return true;
  }

  // 2. Handle Duplex 2-Page PDF (Page 1 Front, Page 2 Back - Exact Physical Size)
  if (result.type === 'duplex' && result.frontCanvas && result.backCanvas) {
    const isHoriz = state?.layout === 'horizontal' || (result.unitW && result.unitW > result.unitH);
    const isCard = cleanName.includes('License') || cleanName.includes('Travel') || cleanName.includes('Creative') || cleanName.includes('This');
    const isTicket = cleanName.includes('Ticket');

    let pageW, pageH;
    if (isCard) {
      // Standard CR80 PVC Card Dimensions: 85.6mm x 53.98mm (scaled proportionally if bleed margin is present)
      const baseW = 760;
      const baseH = 480;
      const bleedRatioW = result.frontCanvas.width / (baseW * 4);
      const bleedRatioH = result.frontCanvas.height / (baseH * 4);
      pageW = 85.6 * bleedRatioW;
      pageH = 54.0 * bleedRatioH;
    } else if (isTicket) {
      // Standard Physical Ticket Stub Dimensions: 140mm x 70mm (or 70mm x 140mm)
      const baseW = isHoriz ? 500 : 250;
      const baseH = isHoriz ? 250 : 500;
      const bleedRatioW = result.frontCanvas.width / (baseW * 4);
      const bleedRatioH = result.frontCanvas.height / (baseH * 4);
      pageW = (isHoriz ? 140 : 70) * bleedRatioW;
      pageH = (isHoriz ? 70 : 140) * bleedRatioH;
    } else if (isBounty || isTimeCapsule) {
      // Standard Physical A4 2-Page Envelope Craft Package or Poster: 210mm x 297mm
      pageW = 210;
      pageH = 297;
    } else {
      const mmPerPixel = 25.4 / 300;
      pageW = result.frontCanvas.width * mmPerPixel;
      pageH = result.frontCanvas.height * mmPerPixel;
    }

    const pdf = new jsPDF({
      orientation: pageW > pageH ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pageW, pageH]
    });

    // ISO 32000 Isolated Transparency Group on every page (Page 1 Front, Page 2 Back)
    pdf.internal.events.subscribe('putPage', function() {
      pdf.internal.write('/Group << /Type /Group /S /Transparency /CS /DeviceRGB /I true /K false >>');
    });

    try {
      pdf.setDisplayMode('fullpage');
    } catch {}

    const frontData = result.frontCanvas.toDataURL('image/png', 1.0);
    const backData = result.backCanvas.toDataURL('image/png', 1.0);

    if (isBounty) {
      const posterAspect = result.frontCanvas.height / result.frontCanvas.width;
      let drawW = pageW;
      let drawH = drawW * posterAspect;
      if (drawH > pageH) {
        drawH = pageH;
        drawW = drawH / posterAspect;
      }
      const xOff = (pageW - drawW) / 2;
      const yOff = (pageH - drawH) / 2;

      pdf.addImage(frontData, 'PNG', xOff, yOff, drawW, drawH, '', 'FAST');

      pdf.addPage([pageW, pageH], 'portrait');
      pdf.addImage(backData, 'PNG', xOff, yOff, drawW, drawH, '', 'FAST');

      pdf.save(`${cleanName}_Kitte.pdf`);
      return true;
    }

    // Page 1: Front Side (Zero White Margin with viewer matte)
    if (!result.includeBleed) {
      pdf.setFillColor(50, 54, 57);
      pdf.rect(0, 0, pageW, pageH, 'F');
    }
    pdf.addImage(frontData, 'PNG', 0, 0, pageW, pageH, '', 'FAST');

    // Page 2: Back Side (Zero White Margin with viewer matte)
    pdf.addPage([pageW, pageH], pageW > pageH ? 'landscape' : 'portrait');
    if (!result.includeBleed) {
      pdf.setFillColor(50, 54, 57);
      pdf.rect(0, 0, pageW, pageH, 'F');
    }
    pdf.addImage(backData, 'PNG', 0, 0, pageW, pageH, '', 'FAST');

    pdf.save(`${cleanName}_Kitte.pdf`);
    return true;
  }

  // 3. Handle 1-Page PDF (Fold & Glue Craft Sheet, Poster, Letter)
  const singleCanvas = canvasToSave || result.canvas || result.combinedCanvas;
  const imgData = singleCanvas.toDataURL('image/png', 1.0);

  const isWide = singleCanvas.width >= singleCanvas.height;
  const pdf = new jsPDF({
    orientation: isWide ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // ISO 32000 Isolated Transparency Group
  pdf.internal.events.subscribe('putPage', function() {
    pdf.internal.write('/Group << /Type /Group /S /Transparency /CS /DeviceRGB /I true /K false >>');
  });

  const pageW = isWide ? 297 : 210;
  const pageH = isWide ? 210 : 297;

  try {
    pdf.setDisplayMode('fullpage');
  } catch {}

  const isCard = cleanName.includes('License') || cleanName.includes('Travel') || cleanName.includes('Creative') || cleanName.includes('This') || cleanName.includes('Card');
  const isTicket = cleanName.includes('Ticket');
  const isFoldGlue = result?.type === 'fold-glue';

  let physW, physH;

  if (isFoldGlue && isCard) {
    // Exact 1:1 Scale CR80 Physical Card: 85.6mm x 54.0mm per card
    const mmPerUnit = 85.6 / 760;
    physW = (singleCanvas.width / 4) * mmPerUnit;
    physH = (singleCanvas.height / 4) * (54.0 / 480);
  } else if (isFoldGlue && isTicket) {
    // Exact 1:1 Scale Event Ticket Stub: 70mm x 140mm (or 140mm x 70mm) per ticket
    const mmPerUnit = 0.28; // 70mm / 250px or 140mm / 500px
    physW = (singleCanvas.width / 4) * mmPerUnit;
    physH = (singleCanvas.height / 4) * mmPerUnit;

    // Safety guard to ensure large horizontal duo tickets fit comfortably inside A4 printable bounds
    const maxAllowedW = pageW - 24;
    const maxAllowedH = pageH - 32;
    if (physW > maxAllowedW || physH > maxAllowedH) {
      const scaleDown = Math.min(maxAllowedW / physW, maxAllowedH / physH);
      physW *= scaleDown;
      physH *= scaleDown;
    }
  } else if (isBounty) {
    // Authentic One Piece Wanted Poster centered on A4 portrait
    const aspect = singleCanvas.height / singleCanvas.width;
    const availW = pageW - 16;
    const availH = pageH - 16;
    physW = availW;
    physH = physW * aspect;
    if (physH > availH) {
      physH = availH;
      physW = physH / aspect;
    }
  } else if (isTimeCapsule && (isFoldGlue || result?.type === 'stamps-sheet')) {
    // 100% 1:1 True-Scale A4 Printable Craft Sheet (210mm x 297mm)
    physW = pageW;
    physH = pageH;
  } else {
    // Full Page Posters & Letters (Time Capsule)
    const aspect = singleCanvas.height / singleCanvas.width;
    physW = pageW - 24;
    physH = physW * aspect;

    if (physH > pageH - 24) {
      physH = pageH - 24;
      physW = physH / aspect;
    }
  }

  const xOffset = (pageW - physW) / 2;
  const yOffset = (pageH - physH) / 2;

  // Add craft guidelines and scale label on A4 Fold & Glue sheet (Only for generic cards/tickets, NOT Time Capsule!)
  if (isFoldGlue && !isTimeCapsule) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(50, 50, 50);
    pdf.text('KITTE STUDIO • DIY FOLD & GLUE CRAFT SHEET', pageW / 2, Math.max(10, yOffset - 7), { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(110, 110, 110);
    pdf.text('PRINT AT 100% SCALE (DO NOT FIT TO PAGE / ACTUAL SIZE) • 300 DPI HIGH RESOLUTION', pageW / 2, Math.max(14, yOffset - 3.5), { align: 'center' });
  }

  pdf.addImage(imgData, 'PNG', xOffset, yOffset, physW, physH, '', 'FAST');

  if (isFoldGlue && !isTimeCapsule) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(70, 70, 70);
    pdf.text('1. CUT ALONG OUTER CORNER MARKS   •   2. FOLD FIRMLY ALONG CENTER CREASE   •   3. GLUE INNER SIDES TOGETHER', pageW / 2, Math.min(pageH - 9, yOffset + physH + 6.5), { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.8);
    pdf.setTextColor(120, 120, 120);
    const subtext = isCard 
      ? 'Finished Folded Size: Standard CR80 Wallet Card (85.6 × 54.0 mm) — Fits Real Wallets & Badge Sleeves' 
      : isBounty
      ? 'Finished Folded Size: Double-Sided One Piece Wanted Poster & Marine Dossier (A4/A3 Poster Scale)'
      : 'Finished Folded Size: Standard Double-Sided Event Ticket Stub — Fits Scrapbooks & Keepsake Holders';
    pdf.text(subtext, pageW / 2, Math.min(pageH - 5, yOffset + physH + 10.5), { align: 'center' });
  }

  pdf.save(`${cleanName}_Kitte.pdf`);
  return true;
}
