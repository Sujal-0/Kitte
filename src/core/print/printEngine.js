/**
 * Universal Print & Export Engine
 * Central dispatcher coordinates domain-specific canvas exporters and universal print generators.
 */

import { ensureFontsLoaded } from './canvasUtils';
import { generateA4PDF } from './pdfGenerator';
import { renderTicketExport } from '../../features/memory-ticket/export/ticketExporter';
import { renderTravelIDExport } from '../../features/travel-id/export/travelIDExportRouter';
import { renderPhotoBoothExport } from '../../features/photobooth/export/photoBoothExporter';
import { renderBountyPosterExport } from '../../features/bounty-poster/export/bountyPosterExporter';
import { renderTimeLetterExport } from '../../features/time-letter/export/timeLetterExporter';

/**
 * Resolve product- and card-type-specific export filename.
 * Guarantees distinct names for Creative License, Travel License, This & That, etc.
 */
export function getExportFileName(state, exportType) {
  if (state?.cardType) {
    const ct = String(state.cardType).trim();
    if (ct.toLowerCase().includes('creative')) return 'Creative_License';
    if (ct.toLowerCase().includes('travel')) return 'Travel_License';
    if (ct.toLowerCase().includes('this') && ct.toLowerCase().includes('that')) return 'This_And_That';
    return ct.replace(/&/g, 'And').replace(/[\s-]+/g, '_');
  }

  const norm = String(exportType || 'Kitte_Artifact').trim();
  const upper = norm.toUpperCase();
  if (upper.includes('CREATIVE')) return 'Creative_License';
  if (upper.includes('TRAVEL')) return 'Travel_License';
  if (upper.includes('TICKET')) return 'Memory_Ticket';
  if (upper.includes('PHOTO')) return 'Photobooth_Strip';
  if (upper.includes('BOUNTY')) return 'Bounty_Poster';
  if (upper.includes('TIME') || upper.includes('CAPSULE')) {
    if (state?.printMode === 'stamps-decor' || state?.exportMode === 'stamps-decor') return 'Time_Capsule_Stamps_And_Seals';
    if (state?.printMode === 'fold-glue' || state?.exportMode === 'fold-glue') return 'Time_Capsule_Envelope_DIY';
    return 'Time_Capsule_Letter';
  }

  return norm.replace(/&/g, 'And').replace(/[\s-]+/g, '_');
}

/**
 * Universal product export dispatcher.
 */
export async function renderExportCanvas(state, mode = 'fold-glue', includeBleed = true, exportType = 'Memory Ticket') {
  await ensureFontsLoaded();
  const normType = (exportType || 'Memory Ticket').toUpperCase().trim();

  if (normType.includes('TRAVEL') || normType.includes('LICENSE') || normType.includes('CREATIVE') || Boolean(state?.cardType)) {
    return await renderTravelIDExport(state, mode, includeBleed);
  }
  if (normType.includes('PHOTO')) {
    return await renderPhotoBoothExport(state, mode, includeBleed);
  }
  if (normType.includes('BOUNTY')) {
    return await renderBountyPosterExport(state, mode, includeBleed);
  }
  if (normType.includes('TIME') || normType.includes('CAPSULE')) {
    return await renderTimeLetterExport(state, mode, includeBleed);
  }

  // Default: Memory Ticket
  return await renderTicketExport(state, mode, includeBleed);
}

if (typeof window !== 'undefined') {
  window.__renderExportCanvas = renderExportCanvas;
}

/**
 * Export as PNG and trigger download.
 */
export async function exportAsPNG(state, mode = 'fold-glue', includeBleed = true, exportType = 'Memory Ticket') {
  const result = await renderExportCanvas(state, mode, includeBleed, exportType);
  const cleanName = getExportFileName(state, exportType);

  // Dual Page / Duplex Mode: Trigger Dual File Download for 2-page products
  if ((mode === 'duplex' || (result.frontCanvas && result.backCanvas)) && result.frontCanvas && result.backCanvas) {
    const isEnvelopeCraft = Boolean(exportType && String(exportType).toLowerCase().includes('time') && mode === 'fold-glue');
    const labelF = isEnvelopeCraft ? 'Envelope_Net' : 'Front';
    const labelB = isEnvelopeCraft ? 'Assembly_Guide' : 'Back';

    // 1. Download Page 1 PNG
    const frontData = result.frontCanvas.toDataURL('image/png', 1.0);
    const linkF = document.createElement('a');
    linkF.download = `${cleanName}_${labelF}_Kitte.png`;
    linkF.href = frontData;
    document.body.appendChild(linkF);
    linkF.click();
    document.body.removeChild(linkF);

    // 2. Download Page 2 PNG after 250ms tick to ensure browser triggers both downloads
    await new Promise((r) => setTimeout(r, 250));

    const backData = result.backCanvas.toDataURL('image/png', 1.0);
    const linkB = document.createElement('a');
    linkB.download = `${cleanName}_${labelB}_Kitte.png`;
    linkB.href = backData;
    document.body.appendChild(linkB);
    linkB.click();
    document.body.removeChild(linkB);

    return true;
  }

  const canvasToSave = result.canvas || result.combinedCanvas;
  const dataUrl = canvasToSave.toDataURL('image/png', 1.0);

  const link = document.createElement('a');
  link.download = `${cleanName}_Kitte.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return true;
}

/**
 * Export as PDF and trigger download.
 * In Duplex mode for 2-sided products, generates a true 2-page A4 PDF!
 */
export async function exportAsPDF(state, mode = 'fold-glue', includeBleed = true, exportType = 'Memory Ticket') {
  const result = await renderExportCanvas(state, mode, includeBleed, exportType);
  const cleanName = getExportFileName(state, exportType);

  return await generateA4PDF({ result, state, cleanName, exportType });
}
