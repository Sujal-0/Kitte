/**
 * Asset Preloader Utility
 * Ensures all master fonts, desk images, and SVG filters are fully parsed 
 * before opening the StudioPageTransition Shoji doors on first entrance.
 */

const CRITICAL_IMAGES = [
  '/kitteLogo.png',
  '/assets/cutting-mat.svg',
  '/assets/notesAbout.webp',
  '/assets/receiptPrivacy.webp',
  '/assets/phoneContact.webp',
  '/assets/cookieSvg.svg',
  '/assets/notesLegal_blank.png',
  '/assets/bountyPoster.webp',
  '/assets/photoBooth.webp',
  '/assets/timeLetter.webp',
  '/assets/travelID.webp',
  '/assets/memoryTicketStub.webp'
];

export async function preloadCriticalAssets() {
  if (typeof window === 'undefined') return;

  const fontPromise = document.fonts ? document.fonts.ready : Promise.resolve();

  const imagePromises = CRITICAL_IMAGES.map((src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false); // Do not reject, resolve anyway
    });
  });

  // Safety fallback: Never block longer than 2.5 seconds under slow 2G/3G conditions
  const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2500));

  await Promise.race([
    Promise.all([fontPromise, ...imagePromises]),
    timeoutPromise
  ]);
}
