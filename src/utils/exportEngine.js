/**
 * Kitte Production Export Engine (Facade)
 * 
 * Modularized Architecture (Approach B):
 * - Core Print Engine & A4 Duplex PDF Generator: src/core/print/
 * - Domain Feature Exporters: src/features/{domain}/export/
 * - Shared Layout Tokens: src/features/{domain}/tokens/
 * 
 * Retained for backwards compatibility across all studio overlays and test suites.
 */

export {
  renderExportCanvas,
  exportAsPNG,
  exportAsPDF,
  getExportFileName,
} from '../core/print/printEngine';

export {
  DPI_SCALE,
  loadImage,
  mapFont,
  ensureFontsLoaded,
  wrapText,
  wrapCenteredLines,
  wrapRightLines,
  draw5PointStar,
  drawPaperGrain,
  drawSVGPath,
} from '../core/print/canvasUtils';

export { drawCropMarks } from '../core/print/cropMarks';
export { generateA4PDF } from '../core/print/pdfGenerator';
export { renderTicketExport } from '../features/memory-ticket/export/ticketExporter';
export { renderTravelIDExport } from '../features/travel-id/export/travelIDExportRouter';
export {
  drawTravelIDFront,
  drawTravelIDBack,
} from '../features/travel-id/export/travelLicenseExporter';
export {
  drawCreativeLicenseFront,
  drawCreativeLicenseBack,
} from '../features/travel-id/export/creativeLicenseExporter';
export {
  drawThisAndThatFront,
  drawThisAndThatBack,
} from '../features/travel-id/export/thisAndThatExporter';
export {
  renderPhotoBoothExport,
  drawPhotoBoothStrip,
} from '../features/photobooth/export/photoBoothExporter';
export {
  renderBountyPosterExport,
} from '../features/bounty-poster/export/bountyPosterExporter';
export {
  renderTimeLetterExport,
} from '../features/time-letter/export/timeLetterExporter';
