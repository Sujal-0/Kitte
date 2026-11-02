/**
 * Kitte Time Capsule - Automated Due Letter Dispatcher
 * 
 * Runs as:
 * 1. Daily GitHub Actions cron worker (00:00 UTC)
 * 2. Vercel / Netlify serverless cron job
 * 3. Local background catch-up sweep
 * 
 * Finds all letters in Supabase (or local queue) where target_timestamp <= now()
 * and status == 'scheduled', dispatches them via Resend API, and marks them delivered.
 */

import fs from 'fs';
import path from 'path';
import { sendEmail, getEnvConfig } from './email-sender.mjs';

function loadEnv() {
  getEnvConfig();
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const LOCAL_DB_FILE = path.resolve(process.cwd(), '.data/futureme_scheduled_letters.json');

async function getDueLetters() {
  const now = Date.now();

  // 1. Check Supabase cloud database if configured
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/time_capsule_letters?target_timestamp=lte.${now}&status=eq.scheduled&select=*`;
      const res = await fetch(endpoint, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (res.ok) {
        const rows = await res.json();
        return { source: 'supabase', letters: rows };
      } else {
        console.warn('[Dispatcher] Supabase query failed:', res.status, await res.text());
      }
    } catch (err) {
      console.warn('[Dispatcher] Supabase error:', err.message);
    }
  }

  // 2. Fallback to local JSON storage
  if (fs.existsSync(LOCAL_DB_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(LOCAL_DB_FILE, 'utf-8'));
      const due = raw.filter(item => {
        const t = item.targetTimestamp || (item.deliveryDate ? new Date(item.deliveryDate).getTime() : 0);
        return t > 0 && t <= now && item.status === 'scheduled';
      });
      return { source: 'local', letters: due, allRaw: raw };
    } catch (err) {
      console.error('[Dispatcher] Error reading local DB:', err.message);
    }
  }

  return { source: 'none', letters: [] };
}

async function markLetterDelivered(source, letter, resendId) {
  const nowIso = new Date().toISOString();

  if (source === 'supabase' && SUPABASE_URL && SUPABASE_KEY) {
    try {
      const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/time_capsule_letters?id=eq.${encodeURIComponent(letter.id)}`;
      await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          status: 'delivered',
          delivered_at: nowIso,
          resend_id: resendId
        })
      });
    } catch (err) {
      console.error('[Dispatcher] Supabase update error:', err.message);
    }
  } else if (source === 'local' && fs.existsSync(LOCAL_DB_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(LOCAL_DB_FILE, 'utf-8'));
      const target = raw.find(item => item.id === letter.id);
      if (target) {
        target.status = 'delivered';
        target.deliveredAt = nowIso;
        target.resendId = resendId;
        fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(raw, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('[Dispatcher] Local DB update error:', err.message);
    }
  }
}

export async function runDispatchSweep() {
  console.log(`[FutureMe Dispatcher] Starting sweep at ${new Date().toISOString()}...`);

  const config = getEnvConfig();
  if (!config.hasGmail && !config.hasResend) {
    console.error('[FutureMe Dispatcher] ERROR: No email credentials found (GMAIL_USER & GMAIL_APP_PASSWORD or RESEND_API_KEY).');
    return { success: false, error: 'Missing email credentials' };
  }

  const { source, letters } = await getDueLetters();
  console.log(`[FutureMe Dispatcher] Found ${letters.length} due letter(s) in source: [${source}]`);

  if (letters.length === 0) {
    console.log('[FutureMe Dispatcher] No due letters found today. All scheduled capsules are waiting.');
    return { success: true, processed: 0, delivered: 0 };
  }

  let deliveredCount = 0;
  let failedCount = 0;

  for (const letter of letters) {
    const toEmail = letter.recipient_email || letter.to;
    const subject = letter.subject || `Your Time Capsule Has Unlocked: A letter from your past self`;
    const html = letter.html_content || letter.htmlContent;

    console.log(`[FutureMe Dispatcher] Dispatching capsule ${letter.id} to ${toEmail}...`);

    try {
      const dispatchRes = await sendEmail({
        to: toEmail,
        subject,
        html,
        attachments: letter.attachments || []
      });

      deliveredCount++;
      console.log(`[FutureMe Dispatcher] Successfully delivered capsule ${letter.id} via ${dispatchRes.provider}. Message ID: ${dispatchRes.messageId}`);
      await markLetterDelivered(source, letter, dispatchRes.messageId);
    } catch (err) {
      failedCount++;
      console.error(`[FutureMe Dispatcher] Delivery exception for ${letter.id}:`, err.message);
    }
  }

  console.log(`[FutureMe Dispatcher] Sweep finished. Delivered: ${deliveredCount}, Failed: ${failedCount}`);
  return { success: true, processed: letters.length, delivered: deliveredCount, failed: failedCount };
}

// Direct execution CLI support
if (process.argv[1] && process.argv[1].endsWith('dispatch-due-letters.mjs')) {
  runDispatchSweep().then(res => {
    process.exit(res.success ? 0 : 1);
  });
}

