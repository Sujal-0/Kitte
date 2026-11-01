/**
 * Universal Database Adapter for FutureMe Time Letters
 * 
 * Supports:
 * 1. Supabase Cloud PostgreSQL Database (Production)
 * 2. Local Archival Fallback (Development & Offline)
 */

const STORAGE_KEY = 'kitte_futureme_vault';

function getSupabaseConfig() {
  const url = import.meta.env?.VITE_SUPABASE_URL || '';
  const key = import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
  return {
    isConfigured: Boolean(url && key),
    url: url.replace(/\/$/, ''),
    key
  };
}

export function isCloudDatabaseActive() {
  return getSupabaseConfig().isConfigured;
}

/**
 * Persist a scheduled letter to the cloud database (Supabase) if available,
 * and always into the local vault cache.
 */
export async function persistLetterRecord(record) {
  const sb = getSupabaseConfig();
  let cloudSaved = false;

  if (sb.isConfigured) {
    try {
      const payload = {
        id: record.id,
        recipient_email: record.to || record.recipient_email,
        author: record.author || '',
        salutation: record.salutation || '',
        delivery_date: record.deliveryDate || record.delivery_date,
        target_timestamp: record.targetTimestamp || record.target_timestamp,
        send_date: record.sendDate || record.send_date,
        subject: record.subject,
        share_url: record.shareUrl || record.share_url,
        html_content: record.htmlContent || record.html_content,
        confirm_html_content: record.confirmHtmlContent || record.confirm_html_content || '',
        plain_text_content: record.plainTextContent || record.plain_text_content || '',
        attachments: record.attachments || [],
        state: record.state || {},
        status: record.status || 'scheduled',
        cloud_scheduled: Boolean(record.cloudScheduled),
        confirmation_sent: Boolean(record.confirmationSent),
        resend_id: record.resendId || null
      };

      const res = await fetch(`${sb.url}/rest/v1/time_capsule_letters`, {
        method: 'POST',
        headers: {
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });

      cloudSaved = res.ok;
      if (!res.ok) {
        console.warn('[dbAdapter] Supabase insert notice:', res.status, await res.text());
      }
    } catch (err) {
      console.warn('[dbAdapter] Supabase save error:', err);
    }
  }

  // Local persistence cache
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const vault = raw ? JSON.parse(raw) : [];
    vault.unshift({ ...record, cloudSaved });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vault));
  } catch (_) {}

  return { cloudSaved };
}

/**
 * Retrieve all letters (from Supabase if configured, otherwise local vault)
 */
export async function loadAllVaultedLetters() {
  const sb = getSupabaseConfig();

  if (sb.isConfigured) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/time_capsule_letters?select=*&order=created_at.desc`, {
        headers: {
          'apikey': sb.key,
          'Authorization': `Bearer ${sb.key}`
        }
      });
      if (res.ok) {
        const rows = await res.json();
        return rows.map(r => ({
          id: r.id,
          to: r.recipient_email,
          author: r.author,
          salutation: r.salutation,
          deliveryDate: r.delivery_date,
          targetTimestamp: r.target_timestamp,
          sendDate: r.send_date,
          subject: r.subject,
          shareUrl: r.share_url,
          htmlContent: r.html_content,
          status: r.status,
          cloudScheduled: r.cloud_scheduled,
          confirmationSent: r.confirmation_sent,
          deliveredAt: r.delivered_at,
          createdAt: r.created_at,
          state: r.state
        }));
      }
    } catch (err) {
      console.warn('[dbAdapter] Failed to load from Supabase:', err);
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

