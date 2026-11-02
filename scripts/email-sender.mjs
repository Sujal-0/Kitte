/**
 * Kitte Archival Studio - Unified Email Dispatch Service
 * 
 * Supports:
 * 1. Gmail SMTP (via nodemailer) - Free, sends to ANY recipient (self, friends, etc.), zero restrictions.
 * 2. Resend API (via fetch) - Cloud API fallback.
 */

import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

// Cache environment lookup
let envLoaded = false;
export function getEnvConfig() {
  if (!envLoaded) {
    const envFiles = ['.env.local', '.env'];
    for (const f of envFiles) {
      const full = path.resolve(process.cwd(), f);
      if (fs.existsSync(full)) {
        try {
          const lines = fs.readFileSync(full, 'utf-8').split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx !== -1) {
              const k = trimmed.substring(0, eqIdx).trim();
              const v = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
              if (!process.env[k]) process.env[k] = v;
            }
          }
        } catch (_) {}
      }
    }
    envLoaded = true;
  }

  const gmailUser = (process.env.GMAIL_USER || '').trim();
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  const resendKey = (process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || '').trim();

  return {
    gmailUser,
    gmailPass,
    resendKey,
    hasGmail: Boolean(gmailUser && gmailPass),
    hasResend: Boolean(resendKey)
  };
}

/**
 * Normalizes email attachments into Node Buffer format for flawless delivery
 */
function normalizeAttachments(attachments = []) {
  return attachments.map(att => {
    if (!att || !att.content) return null;
    let base64Data = att.content;
    if (typeof base64Data === 'string' && base64Data.includes(';base64,')) {
      base64Data = base64Data.split(';base64,')[1];
    }
    return {
      filename: att.filename || 'attachment.pdf',
      content: Buffer.from(base64Data, 'base64'),
      contentType: att.filename?.endsWith('.pdf') ? 'application/pdf' : undefined
    };
  }).filter(Boolean);
}

/**
 * Dispatch an email to any recipient using the configured provider
 */
export async function sendEmail({
  to,
  subject,
  html,
  attachments = [],
  from,
  replyTo
}) {
  const config = getEnvConfig();

  if (!to) {
    throw new Error('Recipient email (to) is required.');
  }

  // 1. Primary: Gmail SMTP (Sends to anyone in the world, 0 restrictions)
  if (config.hasGmail) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.gmailUser,
        pass: config.gmailPass
      }
    });

    const sender = from || `"Kitte Time Capsule" <${config.gmailUser}>`;
    const mailOptions = {
      from: sender,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: subject || 'A letter from your past self [KITTE]',
      html: html || '<p>A sealed keepsake from Kitte Archival Studio.</p>',
      replyTo: replyTo || undefined,
      attachments: normalizeAttachments(attachments)
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      provider: 'gmail',
      messageId: info.messageId,
      response: info.response,
      feedback: `Dispatched via Kitte Archive (${config.gmailUser})`
    };
  }

  // 2. Fallback: Resend API
  if (config.hasResend) {
    const formattedAttachments = (attachments || []).map(a => {
      let content = a.content;
      if (typeof content === 'string' && content.includes(';base64,')) {
        content = content.split(';base64,')[1];
      }
      return {
        filename: a.filename,
        content
      };
    });

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: from || 'FutureMe Kitte <onboarding@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        reply_to: replyTo || undefined,
        subject: subject || 'A letter from your past self',
        html: html,
        attachments: formattedAttachments
      })
    });

    const data = await res.json();
    if (res.ok) {
      return {
        success: true,
        provider: 'resend',
        messageId: data?.id,
        feedback: `Dispatched via Resend (${data?.id || 'ok'})`
      };
    } else {
      throw new Error(data?.message || `Resend error (${res.status})`);
    }
  }

  throw new Error('No email credentials configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env');
}
