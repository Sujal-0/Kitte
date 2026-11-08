import { sendEmail, getEnvConfig } from '../../scripts/email-sender.mjs';

const CANONICAL_ORIGIN = process.env.PUBLIC_APP_URL || 'https://kitte-studio.vercel.app';

function sanitizeLocalhostUrls(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/gi, CANONICAL_ORIGIN);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, subject, html, attachments } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const cleanHtml = sanitizeLocalhostUrls(html);
    const config = getEnvConfig();

    if (!config.hasGmail && !config.hasResend) {
      return res.status(200).json({
        success: false,
        needsKey: true,
        message: 'To enable automated email delivery, add your GMAIL_USER & GMAIL_APP_PASSWORD into your environment variables.'
      });
    }

    if (!to) {
      return res.status(400).json({ success: false, error: 'Recipient email is required.' });
    }

    const result = await sendEmail({
      to,
      subject: subject || 'A letter from your past self [TEST]',
      html: cleanHtml,
      attachments: attachments || []
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('[API /api/futureme/send-test] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

