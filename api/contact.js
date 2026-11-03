import { sendEmail, getEnvConfig } from '../scripts/email-sender.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { from, message, website_hp } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    // Spam Protection: Honeypot trap check
    if (website_hp) {
      console.warn('[API /api/contact] Bot activity prevented via honeypot trap');
      return res.status(200).json({ success: true, message: 'Inquiry received' });
    }

    const config = getEnvConfig();

    if (!config.hasGmail && !config.hasResend) {
      return res.status(500).json({ success: false, error: 'No email service configured.' });
    }

    const sendRes = await sendEmail({
      to: 'sujalsingh2204@gmail.com',
      replyTo: from || undefined,
      subject: `New Project Inquiry from ${from || 'Visitor'} [KITTE]`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 2px solid #2D2D2D; background-color: #FBF7F5; border-radius: 8px;">
          <h2 style="color: #2D2D2D; border-bottom: 2px solid #EAEAEA; padding-bottom: 12px; margin-top: 0;">New Inquiry Received via Contact Phone</h2>
          <p style="font-size: 14px; color: #555;"><strong>From:</strong> ${from || 'Not provided'}</p>
          <div style="background: #FFFFFF; border: 1px solid #E0E0E0; border-radius: 6px; padding: 16px; margin: 18px 0; font-size: 15px; line-height: 1.6; color: #1A1A1A; white-space: pre-wrap;">${message}</div>
          <p style="font-size: 12px; color: #888; margin-bottom: 0;">Sent directly from Kitte Analog Memory Lab Contact Phone.</p>
        </div>
      `
    });

    return res.status(200).json({ success: true, data: sendRes });
  } catch (err) {
    console.error('[API /api/contact] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

