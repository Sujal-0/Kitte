import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { runDispatchSweep } from './scripts/dispatch-due-letters.mjs'
import { sendEmail, getEnvConfig } from './scripts/email-sender.mjs'

function futureMeSchedulerPlugin() {
  const dbFile = path.resolve(process.cwd(), '.data/futureme_scheduled_letters.json');

  const readDb = () => {
    try {
      if (fs.existsSync(dbFile)) {
        return JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
      }
    } catch (_) {}
    return [];
  };

  const writeDb = (data) => {
    try {
      const dir = path.dirname(dbFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[FutureMe Plugin] Error writing DB:', err);
    }
  };

  return {
    name: 'futureme-scheduler-backend',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/futureme') && !req.url?.startsWith('/api/contact')) {
          return next();
        }

        // Helper to read incoming JSON body
        const getBody = () => new Promise((resolve) => {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              resolve(body ? JSON.parse(body) : {});
            } catch {
              resolve({});
            }
          });
        });

        // 1. GET /api/futureme/scheduled
        if (req.method === 'GET' && req.url === '/api/futureme/scheduled') {
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(readDb()));
        }

        // 2. POST /api/futureme/schedule
        if (req.method === 'POST' && req.url === '/api/futureme/schedule') {
          const payload = await getBody();
          const db = readDb();
          db.unshift(payload);
          writeDb(db);

          const config = getEnvConfig();
          let cloudScheduled = false;
          let confirmationSent = false;
          let resendId = null;
          let resendStatus = 200;
          let resendFeedback = '';

          // If site owner has configured Gmail SMTP or RESEND_API_KEY in .env, schedule or dispatch
          if ((config.hasGmail || config.hasResend) && payload.to) {
            const now = Date.now();
            let targetTime = 0;
            try {
              targetTime = new Date(payload.deliveryDate).getTime();
            } catch (_) {}

            const diffDays = targetTime > 0 ? (targetTime - now) / (1000 * 60 * 60 * 24) : 999;

            // Case A: Immediate delivery requested (deliveryDate <= now)
            if (targetTime > 0 && targetTime <= now) {
              try {
                const sendRes = await sendEmail({
                  to: payload.to,
                  subject: payload.subject || 'A letter from your past self',
                  html: payload.htmlContent,
                  attachments: payload.attachments || []
                });
                confirmationSent = true;
                resendId = sendRes.messageId;
                resendFeedback = `Delivered immediately via ${sendRes.provider} (${sendRes.messageId || 'ok'})`;
              } catch (err) {
                console.warn('[FutureMe Plugin] Immediate dispatch error:', err);
                resendFeedback = err.message;
                resendStatus = 400;
              }
            }
            // Case B: Resend Native schedule (only if using Resend without Gmail and within 30 days)
            else if (config.hasResend && !config.hasGmail && diffDays > 0 && diffDays <= 30) {
              try {
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
                  console.warn('[FutureMe Plugin] Resend schedule notice:', cloudRes.status, cloudData);
                  resendFeedback = cloudData?.message || 'Resend schedule rejected';
                }
              } catch (err) {
                console.warn('[FutureMe Plugin] Cloud schedule warning:', err);
                resendFeedback = err.message;
              }
            } 
            // Case C: Standard Vault: Letter is safely preserved in vault.
            // Dispatch an immediate Vault Confirmation Certificate email to the recipient with attachments!
            else {
              try {
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
              } catch (err) {
                console.warn('[FutureMe Plugin] Confirmation dispatch warning:', err);
                resendFeedback = err.message;
                resendStatus = 400;
              }
            }
          }

          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ 
            success: true, 
            count: db.length, 
            cloudScheduled, 
            confirmationSent,
            resendId,
            resendStatus,
            resendFeedback
          }));
        }

        // 3. POST /api/futureme/send-test
        if (req.method === 'POST' && req.url === '/api/futureme/send-test') {
          const { to, subject, html, attachments } = await getBody();
          const config = getEnvConfig();

          if (!config.hasGmail && !config.hasResend) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ 
              success: false, 
              needsKey: true, 
              message: 'To enable automatic email dispatch, add your GMAIL_USER & GMAIL_APP_PASSWORD into your project .env file.' 
            }));
          }

          if (to) {
            try {
              const sendRes = await sendEmail({
                to,
                subject: subject || 'A letter from your past self [TEST]',
                html,
                attachments: attachments || []
              });

              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ 
                success: true, 
                data: sendRes
              }));
            } catch (err) {
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: false, error: err.message }));
            }
          }

          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ success: false, error: 'Recipient email is required' }));
        }

        // 4. POST /api/futureme/dispatch-due
        if (req.method === 'POST' && req.url === '/api/futureme/dispatch-due') {
          try {
            const sweepResult = await runDispatchSweep();
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(sweepResult));
          } catch (err) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }

        // 5. POST /api/contact (Direct email dispatch from Contact Phone)
        if (req.method === 'POST' && req.url === '/api/contact') {
          const { from, message } = await getBody();
          const config = getEnvConfig();

          if (config.hasGmail || config.hasResend) {
            try {
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

              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: true, data: sendRes }));
            } catch (err) {
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: false, error: err.message }));
            }
          }

          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ success: false, error: 'No email service configured' }));
        }

        next();
      });

      // Run an initial sweep 2 seconds after server boots to catch any due letters
      setTimeout(() => {
        runDispatchSweep().catch(() => {});
      }, 2000);
    }
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    futureMeSchedulerPlugin(),
  ],
  server: {
    watch: {
      ignored: ['**/.data/**', '**/futureme_scheduled_letters.json', '**/data/**', '**/src/data/**']
    }
  }
})
