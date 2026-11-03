import { sendEmail, getEnvConfig } from '../../scripts/email-sender.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const config = getEnvConfig();

    let cloudScheduled = false;
    let confirmationSent = false;
    let resendId = null;
    let resendStatus = 200;
    let resendFeedback = '';

    if ((config.hasGmail || config.hasResend) && payload.to) {
      const now = Date.now();
      let targetTime = 0;
      try {
        targetTime = new Date(payload.deliveryDate).getTime();
      } catch (_) {}

      const diffDays = targetTime > 0 ? (targetTime - now) / (1000 * 60 * 60 * 24) : 999;

      if (targetTime > 0 && targetTime <= now) {
        // Immediate dispatch
        const sendRes = await sendEmail({
          to: payload.to,
          subject: payload.subject || 'A letter from your past self',
          html: payload.htmlContent,
          attachments: payload.attachments || []
        });
        confirmationSent = true;
        resendId = sendRes.messageId;
        resendFeedback = `Delivered immediately via ${sendRes.provider}`;
      } else if (config.hasResend && !config.hasGmail && diffDays > 0 && diffDays <= 30) {
        // Resend native scheduling if Resend configured without Gmail
        const cloudRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.resendKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'FutureMe Kitte <onboarding@resend.dev>',
            to: [payload.to],
            subject: payload.subject || 'A letter from your past self',
            html: payload.htmlContent,
            scheduled_at: new Date(payload.deliveryDate).toISOString(),
            attachments: (payload.attachments || []).map(a => ({
              filename: a.filename,
              content: a.content
            }))
          })
        });
        const cloudData = await cloudRes.json();
        resendStatus = cloudRes.status;
        if (cloudRes.ok) {
          cloudScheduled = true;
          resendId = cloudData?.id;
          resendFeedback = `Delivering on ${payload.deliveryDate} (Resend ID: ${cloudData?.id || 'ok'})`;
        } else {
          resendFeedback = cloudData?.message || 'Resend schedule rejected';
        }
      } else {
        // Standard: Instant Vault Confirmation Certificate with PDF attachment dispatched to user!
        const confirmSubject = `Sealed in Vault: A letter to your future self (Scheduled for ${payload.deliveryDate})`;
        const confirmHtml = payload.confirmHtmlContent || payload.htmlContent;

        const sendRes = await sendEmail({
          to: payload.to,
          subject: confirmSubject,
          html: confirmHtml,
          attachments: payload.attachments || []
        });

        confirmationSent = true;
        resendId = sendRes.messageId;
        resendFeedback = `Vaulted for ${payload.deliveryDate}. Sealed certificate dispatched to ${payload.to} via ${sendRes.provider}`;
      }
    }

    return res.status(200).json({
      success: true,
      cloudScheduled,
      confirmationSent,
      resendId,
      resendStatus,
      resendFeedback
    });
  } catch (err) {
    console.error('[API /api/futureme/schedule] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

