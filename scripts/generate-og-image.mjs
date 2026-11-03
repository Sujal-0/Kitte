import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

async function generateOgImage() {
  const outputPath = path.resolve('public/assets/kitte-og.png');
  const logoBase64 = fs.readFileSync('public/kitteLogo.png').toString('base64');
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 1200px;
            height: 630px;
            background-color: #F4F1EA;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 56px 64px;
            position: relative;
            overflow: hidden;
            border: 14px solid #1A1A1A;
          }
          /* Grid background */
          .grid {
            position: absolute;
            inset: 0;
            background-size: 32px 32px;
            background-image: 
              linear-gradient(to right, rgba(26, 26, 26, 0.07) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(26, 26, 26, 0.07) 1px, transparent 1px);
            pointer-events: none;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            z-index: 10;
          }
          .logo {
            height: 64px;
            object-fit: contain;
          }
          .stamp {
            background-color: #B91C1C;
            color: #FFFFFF;
            border: 2px solid #1A1A1A;
            box-shadow: 4px 4px 0px #1A1A1A;
            padding: 8px 18px;
            font-weight: 900;
            font-size: 13px;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-family: monospace;
            transform: rotate(-1.5deg);
          }
          .center {
            position: relative;
            z-index: 10;
            margin-top: 10px;
          }
          .tagline {
            font-family: monospace;
            font-size: 14px;
            font-weight: 800;
            color: #1A1A1A;
            text-transform: uppercase;
            letter-spacing: 3px;
            background-color: #FFEB3B;
            display: inline-block;
            padding: 4px 10px;
            border: 2px solid #1A1A1A;
            box-shadow: 2px 2px 0px #1A1A1A;
            margin-bottom: 18px;
          }
          .title {
            font-size: 54px;
            font-weight: 900;
            color: #1A1A1A;
            line-height: 1.1;
            letter-spacing: -0.5px;
            text-transform: uppercase;
          }
          .description {
            font-family: monospace;
            font-size: 17px;
            color: #4A4A4A;
            margin-top: 14px;
            max-width: 820px;
            line-height: 1.5;
            font-weight: 600;
          }
          .footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            z-index: 10;
            border-top: 3px solid #1A1A1A;
            padding-top: 24px;
          }
          .badges {
            display: flex;
            gap: 12px;
          }
          .badge {
            background: #FFFFFF;
            border: 2px solid #1A1A1A;
            box-shadow: 3px 3px 0px #1A1A1A;
            padding: 8px 16px;
            font-family: monospace;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            color: #1A1A1A;
          }
          .url {
            font-family: monospace;
            font-size: 15px;
            font-weight: 900;
            color: #1A1A1A;
            letter-spacing: 1px;
          }
        </style>
      </head>
      <body>
        <div class="grid"></div>
        <div class="header">
          <img src="data:image/png;base64,${logoBase64}" class="logo" />
          <div class="stamp">Craft Archival Studio</div>
        </div>

        <div class="center">
          <div class="tagline">Printable Nostalgia &bull; 300 DPI Engineering</div>
          <h1 class="title">Craft Physical &amp; Digital Keepsakes</h1>
          <p class="description">
            Design, personalize, and print authentic archival film strips, vintage concert ticket stubs, creative travel IDs, and vaulted origami time letters.
          </p>
        </div>

        <div class="footer">
          <div class="badges">
            <div class="badge">Photo Booth</div>
            <div class="badge">Memory Ticket</div>
            <div class="badge">Travel ID</div>
            <div class="badge">Time Capsule</div>
          </div>
          <div class="url">KITTE.STUDIO</div>
        </div>
      </body>
    </html>
  `;

  console.log('Launching browser to render OG image...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: outputPath, type: 'png' });
  await browser.close();
  console.log('OG preview image generated successfully at:', outputPath);
}

generateOgImage().catch(err => {
  console.error('Failed to generate OG image:', err);
  process.exit(1);
});

