/**
 * FutureMe Scheduled Email & Delivery Service
 * 
 * Manages:
 * 1. Future date scheduling and storage (local vault + backend queue)
 * 2. Real-time test dispatch to user inboxes (via backend endpoint or Resend API)
 * 3. Cloud-scheduled delivery (using Resend's native `scheduled_at` parameter)
 * 4. Pending delivery monitoring & notification
 */

import { persistLetterRecord, isCloudDatabaseActive } from './dbAdapter';

const STORAGE_KEY = 'kitte_futureme_vault';

export { isCloudDatabaseActive };

/**
 * Retrieve all vaulted/scheduled FutureMe letters.
 */
export function getVaultedLetters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load vaulted letters:', err);
    return [];
  }
}

/**
 * Save a letter to the FutureMe vault and queue for scheduled dispatch.
 */
export async function scheduleFutureLetter({
  state,
  effectiveEmail,
  deliveryDate,
  shareUrl,
  htmlContent,
  confirmHtmlContent,
  plainTextContent,
  attachments = [],
  website_hp = ''
}) {
  const sendDate = state?.sendDate || 'Today';
  const targetTimestamp = new Date(deliveryDate).getTime();
  const id = `futureme_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const letterRecord = {
    id,
    to: effectiveEmail,
    deliveryDate,
    targetTimestamp,
    sendDate,
    salutation: state?.salutation || 'Dear Future Me,',
    author: state?.author || 'Past You',
    subject: `A letter from your past self (${sendDate}) - Sealed until ${deliveryDate}`,
    shareUrl,
    htmlContent,
    confirmHtmlContent,
    plainTextContent,
    attachments,
    website_hp,
    state,
    createdAt: new Date().toISOString(),
    status: 'scheduled',
    cloudScheduled: false,
    confirmationSent: false,
    resendFeedback: ''
  };

  // 1. Send to server scheduler (which reads credentials securely from backend environment)
  try {
    const res = await fetch('/api/futureme/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(letterRecord)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.cloudScheduled) {
        letterRecord.cloudScheduled = true;
      }
      if (data.confirmationSent) {
        letterRecord.confirmationSent = true;
      }
      if (data.resendId) {
        letterRecord.resendId = data.resendId;
      }
      if (data.resendFeedback) {
        letterRecord.resendFeedback = data.resendFeedback;
      }
    }
  } catch (err) {
    console.warn('[futureMeService] Server schedule endpoint notice:', err);
  }

  // 3. Persist in cloud database (Supabase) + local vault
  try {
    await persistLetterRecord(letterRecord);
  } catch (_) {}

  return letterRecord;
}

/**
 * Trigger immediate check & dispatch of all due letters
 */
export async function triggerDueLettersCheck() {
  try {
    const res = await fetch('/api/futureme/dispatch-due', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[futureMeService] Due check error:', err);
  }
  return { success: false };
}

/**
 * Dispatch an immediate test email to verify inbox delivery right now.
 */
export async function sendInstantTestEmail({
  effectiveEmail,
  subject,
  htmlContent,
  attachments = []
}) {
  // 1. Try backend endpoint first (reads RESEND_API_KEY from .env securely)
  try {
    const res = await fetch('/api/futureme/send-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: effectiveEmail,
        subject,
        html: htmlContent,
        attachments
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return { success: true, message: 'Test email successfully sent to your inbox!', data };
      } else if (data.needsKey) {
        return { 
          success: false, 
          needsKey: true, 
          error: data.message || 'To enable automated email delivery, add your RESEND_API_KEY in the .env file.' 
        };
      } else if (data.error) {
        return { success: false, error: data.error };
      }
    }
    return { success: false, error: 'Could not connect to email delivery service.' };
  } catch (err) {
    return { success: false, error: err.message || 'Error sending test email.' };
  }
}

/**
 * Cancel a scheduled delivery.
 */
export function cancelScheduledLetter(id) {
  const vault = getVaultedLetters();
  const updated = vault.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
