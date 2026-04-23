// utils/mailer.js
const { Resend } = require('resend');
const nodemailer = require('nodemailer');

let resendClient = null;
let smtpTransporter = null;

// ─── Init ────────────────────────────────────────────────────────────────────
async function initMailer() {
  console.log('📨 Initializing mailer services...');
  
  // 1. Initialize Resend if API key is present and NOT a placeholder
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && resendKey !== 're_your_key_here' && resendKey.trim() !== '') {
    try {
      resendClient = new Resend(resendKey);
      console.log('✅ Resend API initialized');
    } catch (err) {
      console.warn('⚠️  Failed to initialize Resend:', err.message);
    }
  } else {
    console.warn('ℹ️  Resend API key missing or placeholder. Skipping Resend.');
  }

  // 2. Initialize Nodemailer (SMTP) as fallback/alternative
  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPass = process.env.SMTP_PASSWORD;
  
  if (smtpEmail && smtpPass) {
    try {
      smtpTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpEmail,
          pass: smtpPass
        }
      });
      // Verify connection
      await smtpTransporter.verify();
      console.log('✅ SMTP (Gmail) Transporter ready');
    } catch (err) {
      console.warn('⚠️  SMTP Transporter failed to initialize:', err.message);
    }
  } else {
    console.warn('ℹ️  SMTP credentials missing. Skipping SMTP.');
  }

  if (!resendClient && !smtpTransporter) {
    console.error('❌ CRITICAL: No mailer services available. Emails will NOT be sent.');
  }
}

// ─── Send helper ─────────────────────────────────────────────────────────────
async function sendMail({ to, subject, html, replyTo }) {
  // Try Resend first if available
  if (resendClient) {
    try {
      console.log(`📧 Attempting to send via Resend to: ${to}`);
      const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      
      const { data, error } = await resendClient.emails.send({
        from: `A'tech Builder Portfolio <${fromAddress}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(replyTo && { reply_to: replyTo }),
      });

      if (error) {
        console.error('❌ Resend API Error:', error.message);
        // Fall through to SMTP if Resend fails
      } else {
        console.log(`✅ Email sent via Resend. ID: ${data.id}`);
        return data;
      }
    } catch (err) {
      console.error('❌ Resend catch error:', err.message);
      // Fall through to SMTP
    }
  }

  // Try SMTP if Resend skipped or failed
  if (smtpTransporter) {
    try {
      console.log(`📧 Attempting to send via SMTP to: ${to}`);
      const mailOptions = {
        from: `"A'tech Builder Portfolio" <${process.env.SMTP_EMAIL}>`,
        to,
        subject,
        html,
        replyTo: replyTo || process.env.SMTP_EMAIL
      };

      const info = await smtpTransporter.sendMail(mailOptions);
      console.log(`✅ Email sent via SMTP. MessageId: ${info.messageId}`);
      return info;
    } catch (err) {
      console.error('❌ SMTP Failed to send:', err.message);
      throw err;
    }
  }

  throw new Error('No mailer services available to send email.');
}

// ─── Escape HTML ─────────────────────────────────────────────────────────────
function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const baseStyle = `
  body{margin:0;padding:0;background:#0d0d1a;font-family:'Segoe UI',Arial,sans-serif;}
  .wrap{max-width:620px;margin:0 auto;}
  .hdr{padding:32px 40px;border-radius:12px 12px 0 0;}
  .hdr h1{color:#fff;margin:0;font-size:22px;}
  .hdr p{color:rgba(255,255,255,.8);margin:6px 0 0;font-size:13px;}
  .body{background:#12121f;padding:32px 40px;border:1px solid #1e1e3a;border-top:none;color:#c9c9e0;font-size:15px;line-height:1.7;}
  .lbl{color:#8b8baa;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;}
  .val{color:#e2e2f0;font-size:15px;margin-bottom:18px;}
  .box{background:#0d0d1a;border:1px solid #1e1e3a;border-radius:8px;padding:14px 18px;white-space:pre-wrap;margin-bottom:18px;}
  .tag{display:inline-block;background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.4);color:#f59e0b;border-radius:20px;padding:3px 12px;font-size:13px;font-weight:600;margin:2px;}
  .btn{display:inline-block;margin-top:16px;color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;}
  .foot{background:#0d0d1a;border:1px solid #1e1e3a;border-top:none;border-radius:0 0 12px 12px;padding:16px 40px;text-align:center;color:#555577;font-size:12px;}
  .sec{color:#f59e0b;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin:24px 0 10px;border-bottom:1px solid #1e1e3a;padding-bottom:6px;}
`;

// ─── Get Recipients ───────────────────────────────────────────────────────────
function getRecipients() {
  const envEmails = process.env.NOTIFY_EMAILS;
  if (envEmails) {
    return envEmails.split(',').map(e => e.trim()).filter(Boolean);
  }
  return ['atechbuilderss@gmail.com']; // Fallback
}

// ─── CONTACT notification ─────────────────────────────────────────────────────
async function sendContactNotification({ name, email, subject, message }) {
  const RECIPIENTS = getRecipients();

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseStyle}</style></head><body>
    <div class="wrap">
      <div class="hdr" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);">
        <h1>📬 New Contact Message</h1>
        <p>Someone reached out via your A'tech Builder portfolio</p>
      </div>
      <div class="body">
        <div class="lbl">From</div>
        <div class="val">${esc(name)} &lt;${esc(email)}&gt;</div>
        <div class="lbl">Subject</div>
        <div class="val">${esc(subject || 'No Subject')}</div>
        <div class="lbl">Message</div>
        <div class="box">${esc(message)}</div>
        <a href="mailto:${esc(email)}" class="btn" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);">Reply to ${esc(name)}</a>
      </div>
      <div class="foot">A'tech Builder Portfolio — Contact Notification</div>
    </div></body></html>`;

  try {
    await sendMail({
      to: RECIPIENTS,
      subject: `📬 Portfolio Contact: ${subject || 'New Message'} — from ${name}`,
      html,
      replyTo: email,
    });
    console.log(`📧 Contact notification processed for: ${name}`);
  } catch (err) {
    console.error('❌ Failed to process contact notification:', err.message);
  }
}

// ─── ORDER notification ───────────────────────────────────────────────────────
async function sendOrderNotification(data) {
  const { services, projectName, description, budget, timeline, clientName, clientEmail, clientPhone, extraNotes } = data;
  const RECIPIENTS = getRecipients();
  const tagsHtml = (services || []).map(s => `<span class="tag">${esc(s)}</span>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseStyle}</style></head><body>
    <div class="wrap">
      <div class="hdr" style="background:linear-gradient(135deg,#f59e0b,#ef4444);">
        <h1>🛒 New Project Order!</h1>
        <p>A client wants to hire you via A'tech Builder portfolio</p>
      </div>
      <div class="body">
        <div class="sec">🔧 Project Details</div>
        <div class="lbl">Services</div>
        <div style="margin-bottom:18px;">${tagsHtml}</div>
        <div class="lbl">Project Name</div>
        <div class="val">${esc(projectName)}</div>
        <div class="lbl">Description</div>
        <div class="box">${esc(description)}</div>
        <div style="display:flex;gap:40px;">
          <div><div class="lbl">Budget</div><div class="val">${esc(budget || 'Not specified')}</div></div>
          <div><div class="lbl">Timeline</div><div class="val">${esc(timeline || 'Not specified')}</div></div>
        </div>
        <div class="sec">👤 Client Info</div>
        <div class="lbl">Name</div><div class="val">${esc(clientName)}</div>
        <div class="lbl">Email</div><div class="val">${esc(clientEmail)}</div>
        <div class="lbl">Phone</div><div class="val">${esc(clientPhone || 'Not provided')}</div>
        ${extraNotes ? `<div class="lbl">Additional Notes</div><div class="box">${esc(extraNotes)}</div>` : ''}
        <a href="mailto:${esc(clientEmail)}" class="btn" style="background:linear-gradient(135deg,#f59e0b,#ef4444);">Reply to ${esc(clientName)}</a>
      </div>
      <div class="foot">A'tech Builder Portfolio — Order Notification</div>
    </div></body></html>`;

  try {
    return await sendMail({
      to: RECIPIENTS,
      subject: `New Order: ${projectName} - from ${clientName}`,
      html,
      replyTo: clientEmail,
    });
  } catch (err) {
    console.error(`❌ Failed to process order notification:`, err.message);
    throw err;
  }
}

module.exports = { initMailer, sendMail, sendContactNotification, sendOrderNotification };