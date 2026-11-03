/**
 * FutureMe Archival Email Template
 * 
 * Recreates the exact authentic visual identity of Kitte Studio:
 * 1. Envelope UI: Matches Kitte Studio envelope card (paper micro-dots, #B91C1C border,
 *    triangular flap creases meeting at a silk ribbon bow knot, authentic Kitte Cat stamp
 *    with wavy postmark cancellation lines, recipient in Patrick Hand handwriting font).
 *    Removes the red middle circle and matches the authentic paper envelope style.
 * 2. Letterhead UI: Matches Kitte Studio letterhead (dashed stitched #B91C1C border,
 *    dual-layer micro-dot grid + 24px ruled notebook writing lines, top-left tied ribbon bow,
 *    top-right mini cat stamp, Patrick Hand handwritten typography aligning with ruled lines,
 *    author signature with crimson heart doodle).
 * 3. Keepsakes Pack: Highlights the 3 attached 300 DPI PDFs.
 * 4. Social Media Footer: Direct links to Sujal's Instagram, LinkedIn, and GitHub.
 */



/**
 * Returns the appropriate handwritten font family based on user selection
 */
function getLetterFontFamily(fontStyle) {
  switch (fontStyle) {
    case 'marker':
      return "'Patrick Hand', 'Caveat', 'Comic Sans MS', cursive, sans-serif";
    case 'caveat':
      return "'Caveat', 'Patrick Hand', 'Segoe Print', cursive, sans-serif";
    case 'courierPrime':
      return "'Courier Prime', 'Courier New', Courier, monospace";
    case 'specialElite':
      return "'Special Elite', 'Courier Prime', Courier, monospace";
    case 'times':
      return "'Playfair Display', Georgia, 'Times New Roman', serif";
    default:
      return "'Patrick Hand', 'Caveat', 'Comic Sans MS', cursive, sans-serif";
  }
}

/**
 * Postmark Stamp Assets (Hosted permanently on raw GitHub repository)
 */
const KITTE_POSTMARKED_STAMP_URL = 'https://raw.githubusercontent.com/Sujal-0/Kitte/main/public/assets/kitte_postmarked_stamp.png';
const KITTE_FAVICON_STAMP_URL = 'https://raw.githubusercontent.com/Sujal-0/Kitte/main/public/kitte_favicon.png';

/**
 * Authentic Postmarked Kitte Stamp for Envelope (Matches Image 2 reference)
 */
function buildEnvelopeStampHtml() {
  return `
    <img src="${KITTE_POSTMARKED_STAMP_URL}" width="155" height="95" alt="Kitte Postal Stamp" style="display: block; width: 155px; height: 95px; border: 0; outline: none;" />
  `;
}

/**
 * Authentic Favicon Stamp for Letterhead (Matches Image 3 reference)
 */
function buildLetterheadStampHtml() {
  return `
    <img src="${KITTE_FAVICON_STAMP_URL}" width="46" height="46" alt="Kitte Stamp" style="display: inline-block; vertical-align: middle; border: 0; outline: none;" />
  `;
}

/**
 * Authentic Tied Silk Ribbon Bow SVG
 */
function buildSilkRibbonBowSvg({ color = '#B91C1C', width = 64, height = 48 }) {
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 64 48" fill="none" style="display: block; margin: 0 auto;">
      <!-- Left Bow Loop -->
      <path d="M 29 17 C 14 3, 2 17, 15 28 C 24 33, 30 22, 29 18" fill="${color}" stroke="#7F1D1D" stroke-width="1.2" stroke-linejoin="round" />
      <path d="M 27 17 C 18 8, 9 19, 18 25 C 23 28, 27 21, 26 17" fill="#DC2626" />
      
      <!-- Right Bow Loop -->
      <path d="M 35 17 C 50 3, 62 17, 49 28 C 40 33, 34 22, 35 18" fill="${color}" stroke="#7F1D1D" stroke-width="1.2" stroke-linejoin="round" />
      <path d="M 37 17 C 46 8, 55 19, 46 25 C 41 28, 37 21, 38 17" fill="#DC2626" />
      
      <!-- Left Ribbon Tail -->
      <path d="M 27 22 C 20 31, 15 40, 19 45 C 23 45, 27 37, 29 25 Z" fill="#991B1B" stroke="#7F1D1D" stroke-width="1" />
      
      <!-- Right Ribbon Tail -->
      <path d="M 37 22 C 44 31, 49 40, 45 45 C 41 45, 37 37, 35 25 Z" fill="#991B1B" stroke="#7F1D1D" stroke-width="1" />
      
      <!-- Center Knot -->
      <ellipse cx="32" cy="20" rx="6.5" ry="5.5" fill="${color}" stroke="#7F1D1D" stroke-width="1.2" />
      <ellipse cx="31" cy="19" rx="4" ry="3" fill="#EF4444" />
    </svg>
  `;
}

/**
 * Small Tied Ribbon Bow for Top-Left of Letterhead
 */
function buildMiniRibbonBowSvg({ color = '#B91C1C' }) {
  return `
    <svg width="24" height="20" viewBox="0 0 64 48" fill="none" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
      <path d="M 29 17 C 14 3, 2 17, 15 28 C 24 33, 30 22, 29 18" fill="${color}" />
      <path d="M 35 17 C 50 3, 62 17, 49 28 C 40 33, 34 22, 35 18" fill="${color}" />
      <path d="M 27 22 C 20 31, 15 40, 19 45 C 23 45, 27 37, 29 25 Z" fill="#991B1B" />
      <path d="M 37 22 C 44 31, 49 40, 45 45 C 41 45, 37 37, 35 25 Z" fill="#991B1B" />
      <ellipse cx="32" cy="20" rx="6.5" ry="5.5" fill="${color}" />
    </svg>
  `;
}

/**
 * Crimson Heart Doodle beside Author Signature
 */
function buildHeartSvg({ color = '#B91C1C', size = 18 }) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" style="display: inline-block; vertical-align: middle; margin-left: 6px;">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  `;
}

function buildSocialFooterHtml() {
  return `
    <!-- Creator Social Footer -->
    <tr>
      <td align="center" style="padding-top: 42px; padding-bottom: 24px;">
        <div style="width: 64px; height: 1.5px; background-color: #D1D5DB; margin-bottom: 22px;"></div>
        
        <p style="font-family: 'Courier Prime', Courier, monospace; font-size: 10px; font-weight: 700; color: #8C7B6B; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px 0;">
          CONNECT &bull; CREATED BY SUJAL SINGH
        </p>

        <!-- Social Media Buttons (Neo-brutalist tactile pills) -->
        <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
          <tr>
            <td style="padding: 0 5px;">
              <a href="https://www.instagram.com/_sujal_singh01/" target="_blank" style="display: inline-block; background-color: #FFFFFF; border: 1.5px solid #1A1A1A; border-radius: 4px; padding: 7px 13px; text-decoration: none; font-family: 'Courier Prime', Courier, monospace; font-size: 10px; font-weight: 700; color: #1A1A1A; box-shadow: 2px 2px 0px #1A1A1A;">
                INSTAGRAM &bull; @_sujal_singh01
              </a>
            </td>
            <td style="padding: 0 5px;">
              <a href="https://www.linkedin.com/in/sujalsingh01" target="_blank" style="display: inline-block; background-color: #FFFFFF; border: 1.5px solid #1A1A1A; border-radius: 4px; padding: 7px 13px; text-decoration: none; font-family: 'Courier Prime', Courier, monospace; font-size: 10px; font-weight: 700; color: #1A1A1A; box-shadow: 2px 2px 0px #1A1A1A;">
                LINKEDIN &bull; sujalsingh01
              </a>
            </td>
            <td style="padding: 0 5px;">
              <a href="https://github.com/Sujal-0" target="_blank" style="display: inline-block; background-color: #FFFFFF; border: 1.5px solid #1A1A1A; border-radius: 4px; padding: 7px 13px; text-decoration: none; font-family: 'Courier Prime', Courier, monospace; font-size: 10px; font-weight: 700; color: #1A1A1A; box-shadow: 2px 2px 0px #1A1A1A;">
                GITHUB &bull; Sujal-0
              </a>
            </td>
          </tr>
        </table>

        <p style="font-family: 'Courier Prime', Courier, monospace; font-size: 9px; color: #9CA3AF; letter-spacing: 1px; margin-top: 18px; line-height: 1.6;">
          KITTE ARCHIVAL STUDIO &bull; TIME CAPSULE REGISTRY<br />
          Crafted with love for letters to the future
        </p>
      </td>
    </tr>
  `;
}

/**
 * 1. Redesigned Envelope UI (Matches Image 2 reference with micro-dots & minimal clean layout)
 * - Cream paper with micro-dots
 * - Red outer border (#8B1D1D / #B91C1C, border-radius 18px)
 * - Top-left: ORIGIN and SEALED dates in monospace
 * - Top-right: Authentic Kitte postmarked stamp with cancellation waves (PNG image)
 * - Recipient in handwritten script + email + location
 * - Neobrutalism CTA button to open interactive letter
 * - Clean minimal footer (no unnecessary text, no corner squares)
 */
function buildEnvelopeHtml({ state, targetDate, sendDate, location, effectiveEmail, shareUrl }) {
  const recipientName = state?.recipient || (state?.letterMode === 'someone-special' ? 'Someone Special' : 'Future Me');
  const borderColor = state?.envelopeBorderColor || '#8B1D1D';
  const emailOpenUrl = shareUrl ? (shareUrl.includes('src=email') ? shareUrl : `${shareUrl}&src=email`) : '#';
  const handwrittenFont = "'Patrick Hand', 'Caveat', 'Comic Sans MS', cursive, sans-serif";

  return `
    <!-- Envelope Card (Matches Image 2 reference) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 550px; background-color: #FDFBF7; border: 2.5px solid ${borderColor}; border-radius: 18px; box-shadow: 0 10px 28px rgba(45, 35, 20, 0.08); overflow: hidden; background-image: radial-gradient(rgba(26,26,26,0.13) 1.2px, transparent 0); background-size: 8px 8px;">
      
      <!-- Top Bar: Origin, Sealed Date on Left, Postmark Stamp on Right -->
      <tr>
        <td style="padding: 18px 20px 0 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" valign="top" style="padding-top: 8px;">
                <span style="font-family: 'Courier Prime', Courier, monospace; font-size: 9.5px; font-weight: 700; color: #1A1A1A; text-transform: uppercase; letter-spacing: 1.5px; display: block;">
                  ORIGIN: ${location}
                </span>
                <span style="font-family: 'Courier Prime', Courier, monospace; font-size: 9.5px; font-weight: 700; color: #1A1A1A; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-top: 4px;">
                  SEALED: ${sendDate}
                </span>
              </td>
              <td align="right" valign="top">
                ${buildEnvelopeStampHtml()}
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Center Recipient & Primary Action (No flap lines, no ribbon bow, no bottom boxes) -->
      <tr>
        <td align="center" style="padding: 10px 24px 34px 24px;">
          
          <!-- Recipient Name in Authentic Handwritten Script -->
          <div style="font-family: ${handwrittenFont}; font-size: 38px; font-weight: 700; color: #1A1A1A; letter-spacing: 1.5px; margin-top: 6px; text-transform: uppercase; line-height: 1.1;">
            ${recipientName}
          </div>

          <!-- Recipient Email -->
          <div style="font-family: 'Courier Prime', Courier, monospace; font-size: 11.5px; font-weight: 600; color: #2B579A; text-decoration: underline; margin-top: 6px;">
            ${effectiveEmail}
          </div>

          <!-- Origin Location Subtitle -->
          <div style="font-family: 'Courier Prime', Courier, monospace; font-size: 9px; font-weight: 700; color: #1A1A1A; opacity: 0.55; letter-spacing: 2px; text-transform: uppercase; margin-top: 14px;">
            &bull; ${location} &bull;
          </div>

          <!-- Direct CTA Button: Open & Unseal in Kitte Studio -->
          <div style="margin-top: 24px;">
            <a href="${emailOpenUrl}" target="_blank" style="background-color: #1A1A1A; color: #FFEB3B; font-family: 'Courier Prime', Courier, monospace; font-size: 11.5px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; text-decoration: none; padding: 13px 32px; border: 2px solid #1A1A1A; border-radius: 4px; display: inline-block; box-shadow: 3px 3px 0px #1A1A1A;">
              OPEN LETTER &amp; ENVELOPE ↗
            </a>
          </div>

        </td>
      </tr>

    </table>
  `;
}

/**
 * 2. Redesigned Letterhead Card (Matches Image 3 reference)
 * - Dual-layer background: Dot grid AND 24px horizontal notebook ruled lines
 * - Red dashed / stitched perimeter border
 * - Top-left: 'A LETTER TO MY FUTURE SELF'
 * - Top-right: Date & location + authentic Favicon stamp
 * - NO horizontal divider lines cutting through the stationery!
 * - Salutation & body in authentic handwritten Patrick Hand font, aligned to notebook lines
 * - Author signature with crimson red heart doodle
 */
function buildLetterheadHtml({ state, sendDate, location, salutation, letterBody, signOff, author, borderColor, letterFont }) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 550px; background-color: #FAF5EA; border: 2.5px dashed ${borderColor}; border-radius: 14px; box-shadow: 0 6px 20px rgba(0,0,0,0.05); background-image: radial-gradient(rgba(26, 26, 26, 0.08) 1px, transparent 0), repeating-linear-gradient(transparent, transparent 23px, rgba(140, 90, 43, 0.12) 24px); background-size: 8px 8px, 100% 24px; background-position: 0 0, 0 44px; overflow: hidden;">
      <tr>
        <td style="padding: 22px 26px 26px 26px;">
          
          <!-- Top Header: Subhead + Date & Favicon Stamp (NO BORDER LINE BELOW!) -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
            <tr>
              <td align="left" valign="middle">
                <span style="font-family: 'Courier Prime', Courier, monospace; font-size: 9px; font-weight: 700; color: #8C7B6B; letter-spacing: 1.5px; text-transform: uppercase;">
                  ${state?.letterMode === 'someone-special' ? 'A SPECIAL LETTER' : 'A LETTER TO MY FUTURE SELF'}
                </span>
              </td>
              <td align="right" valign="middle">
                <span style="font-family: 'Courier Prime', Courier, monospace; font-size: 9px; font-weight: 700; color: #8C7B6B; margin-right: 8px; vertical-align: middle;">
                  ${sendDate}${location ? ` &bull; ${location}` : ''}
                </span>
                ${buildLetterheadStampHtml()}
              </td>
            </tr>
          </table>

          <!-- Salutation (Handwritten Script, e.g. "dear future me") -->
          <div style="font-family: ${letterFont}; font-size: 26px; font-weight: 700; color: #1A1A1A; margin-bottom: 12px; line-height: 24px; letter-spacing: 0.5px;">
            ${salutation}
          </div>

          <!-- Letter Body (Handwritten, sitting right on the 24px ruled notebook lines) -->
          <div style="font-family: ${letterFont}; font-size: 17px; line-height: 24px; color: #1A1A1A; white-space: pre-line; margin-bottom: 24px; min-height: 100px; letter-spacing: 0.3px;">
            ${letterBody}
          </div>

          <!-- Sign-off & Author (NO BORDER LINE ABOVE!) -->
          <div style="margin-top: 16px;">
            <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 13px; font-style: italic; color: #73675C; margin-bottom: 4px;">
              ${signOff}
            </div>
            <div style="font-family: ${letterFont}; font-size: 22px; font-weight: 700; color: #1A1A1A; line-height: 24px;">
              <span>${author}</span>
              ${buildHeartSvg({ color: borderColor, size: 18 })}
            </div>
          </div>

        </td>
      </tr>
    </table>
  `;
}

export function buildFutureMeEmailHtml({
  state,
  shareUrl,
  deliveryDate,
  effectiveEmail
}) {
  const sendDate = state?.sendDate || 'OCT 2026';
  const targetDate = deliveryDate || state?.deliveryDate || 'FUTURE';
  const location = state?.location || 'Kyoto, Japan';
  const author = state?.author || 'Past You';
  const salutation = state?.salutation || 'Dear Future Me,';
  const letterBody = state?.letterBody || '';
  const signOff = state?.signOff || 'With love,';
  const borderColor = state?.letterBorderColor || state?.envelopeBorderColor || '#B91C1C';
  const letterFont = getLetterFontFamily(state?.fontStyle || 'marker');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>A letter from your past self (${sendDate})</title>
  <!-- Google Fonts: Patrick Hand, Caveat, Courier Prime, Playfair Display, Special Elite -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Patrick+Hand&family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Special+Elite&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Patrick+Hand&family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Special+Elite&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #EBF3FC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Ambient Gradient Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(180deg, #E6F0FA 0%, #F3F8FC 30%, #FDFBF7 65%, #F7F3EA 100%); padding: 46px 14px 64px 14px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
          
          <!-- Big Editorial Typography: you've got mail -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <h1 style="font-family: 'Playfair Display', 'Times New Roman', Georgia, serif; font-size: 54px; font-weight: 400; font-style: italic; color: #3A3228; margin: 0; line-height: 1.08; letter-spacing: -0.5px; text-shadow: 0 1px 1px rgba(255,255,255,0.8);">
                you've got<br />mail
              </h1>
              <p style="font-family: 'Courier Prime', Courier, monospace; font-size: 11px; font-weight: 700; color: #8A7B6D; letter-spacing: 2px; text-transform: uppercase; margin: 14px 0 0 0;">
                A Letter from Your Past Self &bull; Scheduled for ${targetDate}
              </p>
            </td>
          </tr>

          <!-- 1. The Authentic Envelope Card -->
          <tr>
            <td align="center" style="padding-bottom: 34px;">
              ${buildEnvelopeHtml({ state, targetDate, sendDate, location, effectiveEmail, shareUrl })}
            </td>
          </tr>

          <!-- 2. The Authentic Letterhead Card -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              ${buildLetterheadHtml({ state, sendDate, location, salutation, letterBody, signOff, author, borderColor, letterFont })}
            </td>
          </tr>

          <!-- 3. Attached Archival Craft Keepsakes Pack -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 540px; background-color: #FFFFFF; border: 2px solid #1A1A1A; border-radius: 6px; box-shadow: 4px 4px 0px #1A1A1A;">
                <tr>
                  <td style="padding: 22px 24px;">
                    <div style="font-family: 'Courier Prime', Courier, monospace; font-size: 11px; font-weight: 800; color: #1A1A1A; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;">
                      ATTACHED ARCHIVAL CRAFT KEEPSAKES PACK (PDFS):
                    </div>

                    <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-family: 'Courier Prime', Courier, monospace; font-size: 11px; color: #3A3228;">
                      <tr>
                        <td width="24" valign="top"><strong>1.</strong></td>
                        <td valign="top">
                          <strong>Archival_Letterhead_300DPI.pdf</strong><br />
                          <span style="color: #666666;">High-resolution archival paper printout for physical letter keeping.</span>
                        </td>
                      </tr>
                      <tr>
                        <td width="24" valign="top"><strong>2.</strong></td>
                        <td valign="top">
                          <strong>Foldable_Envelope_CraftSheet.pdf</strong><br />
                          <span style="color: #666666;">2-Page printable craft sheet with cutting outlines and fold score lines.</span>
                        </td>
                      </tr>
                      <tr>
                        <td width="24" valign="top"><strong>3.</strong></td>
                        <td valign="top">
                          <strong>Stamps_and_Wax_Seals_Sheet.pdf</strong><br />
                          <span style="color: #666666;">Precision sticker and seal assets for physical envelope assembly.</span>
                        </td>
                      </tr>
                    </table>

                    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed rgba(26,26,26,0.2); text-align: center;">
                      <span style="font-family: 'Courier Prime', Courier, monospace; font-size: 10px; color: #15803D; font-weight: 700;">
                        &bull; Attached below as 300 DPI high-resolution PDF documents ready to print &bull;
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 4. Creator Social Media Footer -->
          ${buildSocialFooterHtml()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function buildFutureMeVaultConfirmationHtml({
  state,
  shareUrl,
  deliveryDate,
  effectiveEmail
}) {
  const sendDate = state?.sendDate || 'OCT 2026';
  const targetDate = deliveryDate || state?.deliveryDate || 'FUTURE';
  const location = state?.location || 'Kyoto, Japan';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Time Capsule Vaulted - Scheduled for ${targetDate}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Patrick+Hand&family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Special+Elite&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Patrick+Hand&family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Special+Elite&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #EBF3FC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Ambient Gradient Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(180deg, #E6F0FA 0%, #F3F8FC 30%, #FDFBF7 65%, #F7F3EA 100%); padding: 46px 14px 64px 14px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
          
          <!-- Big Editorial Typography: you've got mail -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <h1 style="font-family: 'Playfair Display', 'Times New Roman', Georgia, serif; font-size: 52px; font-weight: 400; font-style: italic; color: #3A3228; margin: 0; line-height: 1.08; letter-spacing: -0.5px; text-shadow: 0 1px 1px rgba(255,255,255,0.8);">
                you've got<br />mail
              </h1>
              <p style="font-family: 'Courier Prime', Courier, monospace; font-size: 11px; font-weight: 700; color: #8A7B6D; letter-spacing: 2px; text-transform: uppercase; margin: 14px 0 0 0;">
                TIME CAPSULE VAULTED &bull; SCHEDULED FOR ${targetDate}
              </p>
            </td>
          </tr>

          <!-- 1. The Sealed Vault Envelope Card -->
          <tr>
            <td align="center" style="padding-bottom: 34px;">
              ${buildEnvelopeHtml({ state, targetDate, sendDate, location, effectiveEmail, shareUrl })}
            </td>
          </tr>

          <!-- 2. Attached Archival Craft Keepsakes Pack -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 540px; background-color: #FFFFFF; border: 2px solid #1A1A1A; border-radius: 6px; box-shadow: 4px 4px 0px #1A1A1A;">
                <tr>
                  <td style="padding: 22px 24px;">
                    <div style="font-family: 'Courier Prime', Courier, monospace; font-size: 11px; font-weight: 800; color: #1A1A1A; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;">
                      ATTACHED ARCHIVAL CRAFT KEEPSAKES PACK (PDFS):
                    </div>

                    <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-family: 'Courier Prime', Courier, monospace; font-size: 11px; color: #3A3228;">
                      <tr>
                        <td width="24" valign="top"><strong>1.</strong></td>
                        <td valign="top">
                          <strong>Archival_Letterhead_300DPI.pdf</strong><br />
                          <span style="color: #666666;">High-resolution archival paper printout for physical letter keeping.</span>
                        </td>
                      </tr>
                      <tr>
                        <td width="24" valign="top"><strong>2.</strong></td>
                        <td valign="top">
                          <strong>Foldable_Envelope_CraftSheet.pdf</strong><br />
                          <span style="color: #666666;">2-Page printable craft sheet with cutting outlines and fold score lines.</span>
                        </td>
                      </tr>
                      <tr>
                        <td width="24" valign="top"><strong>3.</strong></td>
                        <td valign="top">
                          <strong>Stamps_and_Wax_Seals_Sheet.pdf</strong><br />
                          <span style="color: #666666;">Precision sticker and seal assets for physical envelope assembly.</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 3. Creator Social Media Footer -->
          ${buildSocialFooterHtml()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function buildFutureMePlainText({
  state,
  shareUrl,
  deliveryDate,
  effectiveEmail
}) {
  const sendDate = state?.sendDate || 'OCT 2026';
  const targetDate = deliveryDate || state?.deliveryDate || 'FUTURE';
  const location = state?.location || 'Kyoto, Japan';
  const author = state?.author || 'Past You';
  const salutation = state?.salutation || 'Dear Future Me,';
  const letterBody = state?.letterBody || '';
  const signOff = state?.signOff || 'With love,';

  return `
============================================================
KITTE ARCHIVAL STUDIO - TIME CAPSULE DISPATCH
============================================================

YOU'VE GOT MAIL
A Letter from Your Past Self (${sendDate})
Origin: ${location}
Scheduled Unlock: ${targetDate}
Destination: ${effectiveEmail}

------------------------------------------------------------
${salutation}

${letterBody}

${signOff}
${author}

------------------------------------------------------------
INTERACTIVE WEB LETTER & ENVELOPE:
Open your live 300 DPI interactive letter in Kitte Studio:
${shareUrl}

ATTACHED ARCHIVAL CRAFT KEEPSAKES PACK:
1. Archival_Letterhead_300DPI.pdf
2. Foldable_Envelope_CraftSheet.pdf
3. Stamps_and_Wax_Seals_Sheet.pdf

------------------------------------------------------------
Created by Sujal Singh
Instagram: https://www.instagram.com/_sujal_singh01/
LinkedIn: https://www.linkedin.com/in/sujalsingh01
GitHub: https://github.com/Sujal-0
============================================================
  `.trim();
}
