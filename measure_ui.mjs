import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  } catch (e) {}
  await new Promise(r => setTimeout(r, 1000));

  // Open Export Overlay
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('OPEN_EXPORT', {
      detail: {
        type: 'Travel ID',
        data: {
          colorTheme: '#F5EEDB',
          imageSrc: '/assets/luffyTravelID.webp',
          imageScale: 1,
          imageOffsetX: 0,
          imageOffsetY: 0,
          issuedTo: 'Monkey D. Luffy',
          dateOfBirth: '05/05/1997',
          placeOfIssue: 'East Blue',
          dateOfIssue: '10/10/2026',
          idNumber: 'TTC6252021',
          signatureImage: null,
          stamps: ['igor', 'cat', 'jollyRoger', 'nami', 'cmiygl'],
          showBlueStamp: true,
        }
      }
    }));
  });
  await new Promise(r => setTimeout(r, 1500));

  // Click card to flip
  const cardArea = await page.$('.w-\\[500px\\].h-\\[315px\\]');
  if (cardArea) {
    await cardArea.click();
    await new Promise(r => setTimeout(r, 1500));
  }

  // Measure exact bounding boxes relative to #travel-id-back
  const metrics = await page.evaluate(() => {
    const back = document.querySelector('#travel-id-back');
    const scale = 760 / 500; // unscale from 500x315 back to 760x480 coordinate space
    const bRect = back.getBoundingClientRect();

    const stamps = Array.from(back.querySelectorAll('img[alt]')).map(img => {
      const r = img.getBoundingClientRect();
      // Because back is flipped with rotateY(180), in 3D:
      // left on screen is right in DOM if rotated, or let's measure relative to on-screen bRect
      return {
        alt: img.alt,
        screenX: (r.left - bRect.left) * scale,
        screenY: (r.top - bRect.top) * scale,
        screenW: r.width * scale,
        screenH: r.height * scale,
        naturalW: img.naturalWidth,
        naturalH: img.naturalHeight,
        className: img.className
      };
    });

    const header = back.querySelector('p');
    const hRect = header ? header.getBoundingClientRect() : null;

    return {
      bRect: { w: bRect.width * scale, h: bRect.height * scale },
      header: hRect ? {
        screenX: (hRect.left - bRect.left) * scale,
        screenY: (hRect.top - bRect.top) * scale,
        screenW: hRect.width * scale,
        screenH: hRect.height * scale
      } : null,
      stamps
    };
  });

  console.log('EXACT UI METRICS (in 760x480 space):', JSON.stringify(metrics, null, 2));

  await browser.close();
})();
