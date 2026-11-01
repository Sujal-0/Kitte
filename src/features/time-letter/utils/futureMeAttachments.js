/**
 * FutureMe Attachments & Asset Pack Generator
 * 
 * Generates:
 * 1. Archival Letterhead (300 DPI Letter Print PDF / PNG)
 * 2. Foldable Origami Pocket Envelope Net (DIY Craft Sheet PDF / PNG)
 * 3. Postage Stamps & Wax Seals Asset Sheet (Stickers / Seals PNG)
 */

import jsPDF from 'jspdf';
import { 
  renderLetterheadCanvas, 
  renderEnvelopeCraftSheetCanvas, 
  renderStampsAndDecorSheetCanvas 
} from '../export/timeLetterExporter';

/**
 * Generate all three archival craft canvases.
 * Unwraps result objects ({ canvas, unitW, unitH }) to pure HTMLCanvasElements.
 */
export async function generateFutureMeCanvases(state) {
  const [letterRes, envelopeRes, stampsRes] = await Promise.all([
    renderLetterheadCanvas(state),
    renderEnvelopeCraftSheetCanvas(state),
    renderStampsAndDecorSheetCanvas(state)
  ]);

  const letterCanvas = letterRes?.canvas || letterRes;
  const envelopeCanvas = envelopeRes?.canvas || envelopeRes;
  const stampsCanvas = stampsRes?.canvas || stampsRes;

  return { letterCanvas, envelopeCanvas, stampsCanvas };
}

/**
 * Generate PDF document from a canvas.
 */
export function canvasToA4Pdf(rawCanvas, orientation = 'landscape') {
  const canvas = rawCanvas?.canvas || rawCanvas;
  if (!canvas || typeof canvas.toDataURL !== 'function') {
    throw new Error('Valid canvas element required to generate A4 PDF');
  }

  const mmPerPixel = 25.4 / 300;
  const pageW = canvas.width * mmPerPixel;
  const pageH = canvas.height * mmPerPixel;

  const pdf = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: [pageW, pageH]
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH, '', 'FAST');
  return pdf;
}

/**
 * Generate attachment payloads for email dispatch APIs (e.g. Resend, backend dispatcher).
 * Produces real 300 DPI A4 PDFs for Letterhead, Origami Envelope, and Stamps/Seals Pack.
 */
export async function generateFutureMeEmailAttachments(state) {
  try {
    const { letterCanvas, envelopeCanvas, stampsCanvas } = await generateFutureMeCanvases(state);
    const attachments = [];

    // 1. Archival Letterhead 300 DPI PDF
    if (letterCanvas && typeof letterCanvas.toDataURL === 'function') {
      try {
        const letterPdf = canvasToA4Pdf(letterCanvas, 'landscape');
        const pdfBase64 = letterPdf.output('datauristring').split(',')[1] || '';
        if (pdfBase64) {
          attachments.push({
            filename: 'Archival_Letterhead_300DPI.pdf',
            content: pdfBase64
          });
        }
      } catch (err) {
        console.warn('Fallback to letterhead PNG attachment:', err);
        const png = letterCanvas.toDataURL('image/png').split(',')[1];
        if (png) attachments.push({ filename: 'Archival_Letterhead_300DPI.png', content: png });
      }
    }

    // 2. Foldable Origami Envelope Craft Sheet PDF
    if (envelopeCanvas && typeof envelopeCanvas.toDataURL === 'function') {
      try {
        const envPdf = canvasToA4Pdf(envelopeCanvas, 'landscape');
        const pdfBase64 = envPdf.output('datauristring').split(',')[1] || '';
        if (pdfBase64) {
          attachments.push({
            filename: 'Foldable_Envelope_CraftSheet.pdf',
            content: pdfBase64
          });
        }
      } catch (err) {
        console.warn('Fallback to envelope PNG attachment:', err);
        const png = envelopeCanvas.toDataURL('image/png').split(',')[1];
        if (png) attachments.push({ filename: 'Foldable_Envelope_CraftSheet.png', content: png });
      }
    }

    // 3. Postage Stamps & Wax Seals Asset Sheet PDF
    if (stampsCanvas && typeof stampsCanvas.toDataURL === 'function') {
      try {
        const stampsPdf = canvasToA4Pdf(stampsCanvas, 'portrait');
        const pdfBase64 = stampsPdf.output('datauristring').split(',')[1] || '';
        if (pdfBase64) {
          attachments.push({
            filename: 'Stamps_and_Wax_Seals_Sheet.pdf',
            content: pdfBase64
          });
        }
      } catch (err) {
        console.warn('Fallback to stamps PNG attachment:', err);
        const png = stampsCanvas.toDataURL('image/png').split(',')[1];
        if (png) attachments.push({ filename: 'Stamps_and_Wax_Seals_Sheet.png', content: png });
      }
    }

    return attachments;
  } catch (err) {
    console.error('Failed to generate FutureMe email attachments:', err);
    return [];
  }
}

/**
 * Download the complete Archival Craft Keepsakes Pack directly in the browser.
 */
export async function downloadFutureMeAssetPack(state, format = 'png') {
  const { letterCanvas, envelopeCanvas, stampsCanvas } = await generateFutureMeCanvases(state);
  const baseName = (state?.recipient || 'Future_Me').replace(/[^a-zA-Z0-9_-]/g, '_');

  if (format === 'pdf') {
    if (letterCanvas && typeof letterCanvas.toDataURL === 'function') {
      const letterPdf = canvasToA4Pdf(letterCanvas, 'landscape');
      letterPdf.save(`${baseName}_Letterhead_300DPI.pdf`);
    }

    setTimeout(() => {
      if (envelopeCanvas && typeof envelopeCanvas.toDataURL === 'function') {
        const envPdf = canvasToA4Pdf(envelopeCanvas, 'landscape');
        envPdf.save(`${baseName}_Foldable_Envelope_CraftSheet.pdf`);
      }
    }, 400);

    setTimeout(() => {
      if (stampsCanvas && typeof stampsCanvas.toDataURL === 'function') {
        const stampsPdf = canvasToA4Pdf(stampsCanvas, 'portrait');
        stampsPdf.save(`${baseName}_Stamps_and_WaxSeals_Sheet.pdf`);
      }
    }, 800);
  } else {
    // Download PNGs
    const triggerDownload = (c, filename) => {
      if (!c || typeof c.toDataURL !== 'function') return;
      const a = document.createElement('a');
      a.download = filename;
      a.href = c.toDataURL('image/png');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    triggerDownload(letterCanvas, `${baseName}_Letterhead_300DPI.png`);
    setTimeout(() => {
      triggerDownload(envelopeCanvas, `${baseName}_Foldable_Envelope_CraftSheet.png`);
    }, 400);
    setTimeout(() => {
      triggerDownload(stampsCanvas, `${baseName}_Stamps_and_WaxSeals_Sheet.png`);
    }, 800);
  }
}
