// utils/mailer.js
const nodemailer = require('nodemailer');

let transporter = null;

// ─── Init ────────────────────────────────────────────────────────────────────
async function initMailer() {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ Mailer ready:', process.env.SMTP_EMAIL);
  } catch (err) {
    console.error('❌ Mailer init failed:', err.message);
    console.error('   Check SMTP_EMAIL and SMTP_PASSWORD in your .env');
  }
}

// ─── Send helper ─────────────────────────────────────────────────────────────
async function sendMail({ to, subject, html, replyTo }) {
  if (!transporter) throw new Error('Mailer not initialised. Call initMailer() first.');
  return transporter.sendMail({
    from: `"A'tech Builder Portfolio" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
    ...(replyTo && { replyTo }),
  });
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

// ─── CONTACT notification ─────────────────────────────────────────────────────
async function sendContactNotification({ name, email, subject, message }) {
  const RECIPIENTS = process.env.NOTIFY_EMAILS || ' atechbuilderss@gmail.com, atechbuilderss@gmail.com';

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

  await sendMail({
    to: RECIPIENTS,
    subject: `📬 Portfolio Contact: ${subject || 'New Message'} — from ${name}`,
    html,
    replyTo: email,
  });

  const autoHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseStyle}</style></head><body>
    <div class="wrap">
      <div class="hdr" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);">
        <h1>✅ Message Received!</h1>
      </div>
      <div class="body">
        <p>Hey <strong>${esc(name)}</strong>,</p>
        <p>Thanks for reaching out! We have received your message and will get back to you within <strong>24-48 hours</strong>.</p>
        <p>Best,<br><strong style="color:#a78bfa;">Arpit Verma &amp; Ansh Singh</strong><br><em>A'tech Builder</em></p>
      </div>
      <div class="foot">A'tech Builder — AI &amp; Web Development Portfolio</div>
    </div></body></html>`;

  await sendMail({
    to: email,
    subject: '✅ We received your message — A tech Builder',
    html: autoHtml,
  });

  console.log(`📧 Contact emails sent: ${name} <${email}>`);
}

// ─── ORDER notification ───────────────────────────────────────────────────────
async function sendOrderNotification({ services, projectName, description, budget, timeline, clientName, clientEmail, clientPhone, extraNotes }) {
  const RECIPIENTS = process.env.NOTIFY_EMAILS || ' atechbuilderss@gmail.com, atechbuilderss@gmail.com';
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

  await sendMail({
    to: RECIPIENTS,
    subject: `🛒 New Order: "${projectName}" — from ${clientName}`,
    html,
    replyTo: clientEmail,
  });

  const autoHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseStyle}</style></head><body>
    <div class="wrap">
      <div class="hdr" style="background:linear-gradient(135deg,#f59e0b,#ef4444);">
        <h1>🚀 Order Confirmed!</h1>
      </div>
      <div class="body">
        <p>Hey <strong>${esc(clientName)}</strong>,</p>
        <p>We have received your project order for <strong style="color:#f59e0b;">"${esc(projectName)}"</strong>. 🎉</p>
        <p>Services: <strong style="color:#f59e0b;">${(services || []).map(esc).join(', ')}</strong></p>
        <p>We will review and get back to you within <strong>24 hours</strong> with a proposal and quote.</p>
        <p>Best,<br><strong style="color:#a78bfa;">Arpit Verma &amp; Ansh Singh</strong><br><em>A'tech Builder</em></p>
      </div>
      <div class="foot">A'tech Builder — AI &amp; Web Development Portfolio</div>
    </div></body></html>`;

  await sendMail({
    to: clientEmail,
    subject: `🚀 Order Confirmed: "${projectName}" — A'tech Builder`,
    html: autoHtml,
  });

  console.log(`📧 Order emails sent: "${projectName}" from ${clientName} <${clientEmail}>`);
}

module.exports = { initMailer, sendContactNotification, sendOrderNotification };