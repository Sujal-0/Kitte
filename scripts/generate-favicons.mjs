import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

function createIcoFromPng(pngBuffer) {
  // 6-byte ICONDIR header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(1, 4); // 1 image

  // 16-byte ICONDIRENTRY
  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // width: 32
  entry.writeUInt8(32, 1); // height: 32
  entry.writeUInt8(0, 2);  // color palette: 0
  entry.writeUInt8(0, 3);  // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bpp: 32
  entry.writeUInt32LE(pngBuffer.length, 8); // size of image data
  entry.writeUInt32LE(22, 12); // offset: 6 + 16 = 22

  return Buffer.concat([header, entry, pngBuffer]);
}

async function generateFavicons() {
  const sourcePath = path.resolve('public/kitte_favicon.png');
  if (!fs.existsSync(sourcePath)) {
    console.error('Source image not found at:', sourcePath);
    process.exit(1);
  }

  const sourceBase64 = fs.readFileSync(sourcePath).toString('base64');

  const targets = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 }
  ];

  console.log('Launching Puppeteer to generate high-quality icons...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Load master image into page
  await page.setContent(`
    <html>
      <body style="margin:0;padding:0;background:transparent;">
        <img id="srcImg" src="data:image/png;base64,${sourceBase64}" />
      </body>
    </html>
  `);

  await page.waitForSelector('#srcImg');
  const dims = await page.evaluate(() => {
    const img = document.getElementById('srcImg');
    return { w: img.naturalWidth, h: img.naturalHeight };
  });
  console.log(`Source image loaded: ${dims.w}x${dims.h}`);

  let png32Buffer = null;

  for (const t of targets) {
    const base64Out = await page.evaluate((targetSize) => {
      const img = document.getElementById('srcImg');
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetSize, targetSize);
      return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }, t.size);

    const outBuffer = Buffer.from(base64Out, 'base64');
    const outPath = path.resolve('public', t.name);
    fs.writeFileSync(outPath, outBuffer);
    console.log(`Generated: public/${t.name} (${t.size}x${t.size}) - ${outBuffer.length} bytes`);

    if (t.size === 32) {
      png32Buffer = outBuffer;
    }
  }

  // Create favicon.ico using the 32x32 buffer
  if (png32Buffer) {
    const icoBuffer = createIcoFromPng(png32Buffer);
    const icoPath = path.resolve('public/favicon.ico');
    fs.writeFileSync(icoPath, icoBuffer);
    console.log(`Generated: public/favicon.ico (32x32 ICO) - ${icoBuffer.length} bytes`);
  }

  await browser.close();
  console.log('All icons generated successfully!');
}

generateFavicons().catch(err => {
  console.error('Favicon generation failed:', err);
  process.exit(1);
});

