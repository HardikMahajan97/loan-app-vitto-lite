import nodemailer from 'nodemailer';

// Reusable transporter
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[mailer] SMTP env vars not set — email delivery disabled');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  return transporter;
};


// Formats a loan amount in Indian Rupee notation
const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);


// Sends a confirmation email after successful loan application. Fire and Forget.
export const sendApplicationConfirmationEmail = (application) => {
  if (!application.email) return;

  const t = getTransporter();
  if (!t) return;

  const refId = application.id.split('-')[0].toUpperCase();

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vitto — Loan Application Received</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; color: #1a1a2e; }
      .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 40px 36px; text-align: center; }
      .logo { font-size: 28px; font-weight: 800; color: #e2b96f; letter-spacing: 2px; }
      .tagline { color: rgba(255,255,255,0.6); font-size: 13px; margin-top: 4px; }
      .body { padding: 40px 36px; }
      .greeting { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 12px; }
      .message { font-size: 15px; color: #4a4a6a; line-height: 1.7; margin-bottom: 28px; }
      .ref-box { background: linear-gradient(135deg, #f0f4ff, #e8ecff); border: 1.5px solid #c5d0ff; border-radius: 12px; padding: 20px 24px; margin-bottom: 28px; }
      .ref-label { font-size: 11px; font-weight: 700; color: #7b8cbf; text-transform: uppercase; letter-spacing: 1px; }
      .ref-value { font-size: 26px; font-weight: 800; color: #1a1a2e; font-family: monospace; margin-top: 4px; }
      .details-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
      .details-table td { padding: 10px 0; border-bottom: 1px solid #f0f0f8; font-size: 14px; }
      .details-table td:first-child { color: #7b8cbf; font-weight: 600; width: 45%; }
      .details-table td:last-child { color: #1a1a2e; font-weight: 500; }
      .badge { display: inline-block; background: #fff8e6; color: #c47c0f; border: 1px solid #f5cc6e; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
      .footer { background: #f9faff; border-top: 1px solid #eef0f8; padding: 24px 36px; text-align: center; }
      .footer p { font-size: 12px; color: #9999bb; line-height: 1.6; }
      .footer a { color: #5a7bf5; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <div class="logo">VITTO</div>
        <div class="tagline">Inclusive Finance · Local Language · Zero Friction</div>
      </div>
      <div class="body">
        <div class="greeting">Application Received ✓</div>
        <p class="message">
          Dear <strong>${application.name}</strong>, your loan application has been successfully submitted and is now under review. 
          Our team will assess your application and reach out shortly.
        </p>
        <div class="ref-box">
          <div class="ref-label">Application Reference</div>
          <div class="ref-value">#${refId}</div>
        </div>
        <table class="details-table">
          <tr>
            <td>Applicant Name</td>
            <td>${application.name}</td>
          </tr>
          <tr>
            <td>Mobile Number</td>
            <td>${application.mobile}</td>
          </tr>
          <tr>
            <td>Loan Amount</td>
            <td><strong>${formatINR(application.amount)}</strong></td>
          </tr>
          <tr>
            <td>Loan Purpose</td>
            <td>${application.purpose}</td>
          </tr>
          <tr>
            <td>Preferred Language</td>
            <td>${application.language}</td>
          </tr>
          <tr>
            <td>Current Status</td>
            <td><span class="badge">Pending Review</span></td>
          </tr>
          <tr>
            <td>Submitted On</td>
            <td>${new Date(application.created_at).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</td>
          </tr>
        </table>
        <p class="message" style="font-size:14px; color:#9999bb;">
          Please save your reference number for future queries. You'll be contacted on your registered mobile number.
        </p>
      </div>
      <div class="footer">
        <p>This is an automated confirmation. Please do not reply to this email.</p>
        <p style="margin-top:6px;">© ${new Date().getFullYear()} Vitto Financial Services · <a href="#">Privacy Policy</a></p>
      </div>
    </div>
  </body>
  </html>`;

  t.sendMail({
    from: `"Vitto Finance" <${process.env.SMTP_USER}>`,
    to: application.email,
    subject: `✓ Loan Application Received — Ref #${refId}`,
    html,
    text: `Dear ${application.name}, your Vitto loan application (Ref: #${refId}) for ${formatINR(application.amount)} has been received and is under review.`,
  }).catch((err) => {
    console.error('[mailer] Failed to send confirmation email:', err.message);
  });
};
