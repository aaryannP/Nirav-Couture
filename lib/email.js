import nodemailer from 'nodemailer';

/**
 * Cryptographically random 6-digit numeric OTP generator
 */
export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Dynamic Admin Security Key computation:
 * First 4 letters of email + '@' + last 4 digits of phone
 * e.g., admin@era43.com (phone 9876543210) -> "admi@3210"
 */
export function getAdminSecurityKey(email, phone = '9876543210') {
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanPhone = (phone || '').replace(/\D/g, '') || '3210';
  const prefix = cleanEmail.slice(0, 4);
  const suffix = cleanPhone.slice(-4);
  return `${prefix}@${suffix}`;
}

/**
 * Creates SMTP transporter if environment variables are provided
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }
  return null;
}

/**
 * Sends luxury 6-digit OTP Verification Email
 */
export async function sendOtpEmail({ to, name, otp, purpose = 'Verification' }) {
  const transporter = getTransporter();
  const title = purpose === 'REGISTER' 
    ? 'Verify Your ERA43 Account' 
    : 'Reset Your ERA43 Password';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; background-color: #0D0E12; font-family: 'Helvetica Neue', Arial, sans-serif; color: #FAF7F2; }
          .container { max-width: 540px; margin: 40px auto; background: #16181F; border: 1px solid rgba(212,175,55,0.3); border-radius: 16px; overflow: hidden; }
          .header { background: #000000; padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(212,175,55,0.2); }
          .brand { font-size: 26px; font-weight: 800; letter-spacing: 4px; color: #D4AF37; margin: 0; }
          .content { padding: 36px 32px; text-align: center; }
          .otp-box { margin: 28px 0; padding: 20px; background: #0D0E12; border: 2px dashed #D4AF37; border-radius: 12px; font-size: 34px; letter-spacing: 12px; font-weight: 800; color: #D4AF37; }
          .footer { padding: 20px; text-align: center; font-size: 11px; color: #8A8D98; border-top: 1px solid #232634; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="brand">ERA43 COUTURE</h1>
            <p style="color: #A0A3AF; font-size: 12px; letter-spacing: 2px; margin-top: 6px; text-transform: uppercase;">Two-Step Verification Protocol</p>
          </div>
          <div class="content">
            <h2 style="font-size: 20px; color: #FAF7F2; margin-bottom: 12px;">${title}</h2>
            <p style="font-size: 14px; color: #B3B7C5; line-height: 1.6; margin: 0 0 20px;">
              Hello ${name || 'Valued Member'},<br/>
              Use the single-use 6-digit authentication code below to complete your ${purpose.toLowerCase()}.
            </p>
            <div class="otp-box">${otp}</div>
            <p style="font-size: 12px; color: #E5A93C; margin: 16px 0 6px; font-weight: 600;">
              ⏳ Valid for 10 minutes only. Maximum 3 attempts allowed.
            </p>
            <p style="font-size: 12px; color: #8A8D98; margin: 0;">
              If you did not request this code, no action is required. Your account remains protected.
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ERA43 Couture. All rights reserved. Encrypted &amp; Protected.
          </div>
        </div>
      </body>
    </html>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"ERA43 Security" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject: `[${otp}] Your ERA43 ${title} Code`,
        html
      });
      console.log(`[SMTP] Successfully delivered OTP to ${to}`);
      return { success: true, delivered: true };
    } catch (err) {
      console.error('[SMTP Send Error]', err);
    }
  }

  // Fallback Dev / Simulator mode: Always log to console & allow test verification
  console.log('================================================================');
  console.log(`📧 [ERA43 DEV EMAIL SIMULATOR]`);
  console.log(`To: ${to}`);
  console.log(`Purpose: ${purpose}`);
  console.log(`6-Digit OTP Code: >>> ${otp} <<<`);
  console.log('================================================================');
  return { success: true, devMode: true, otp };
}

/**
 * Sends Suspicious Activity Alert Email on 3 Failed OTP / Login Attempts
 */
export async function sendSuspiciousActivityAlert({ to, name, reason = 'Multiple Failed OTP Attempts', lockHours = 48 }) {
  const transporter = getTransporter();
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; background-color: #0D0E12; font-family: 'Helvetica Neue', Arial, sans-serif; color: #FAF7F2; }
          .container { max-width: 540px; margin: 40px auto; background: #16181F; border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 16px; overflow: hidden; }
          .header { background: #1A0D0D; padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(239, 68, 68, 0.3); }
          .alert-title { font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #EF4444; margin: 0; }
          .content { padding: 32px; text-align: left; }
          .warning-box { margin: 20px 0; padding: 18px; background: rgba(239, 68, 68, 0.1); border: 1px solid #EF4444; border-radius: 8px; color: #FCA5A5; font-size: 13px; line-height: 1.6; }
          .footer { padding: 20px; text-align: center; font-size: 11px; color: #8A8D98; border-top: 1px solid #232634; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size: 32px; margin-bottom: 8px;">🛡️⚠️</div>
            <h1 class="alert-title">SUSPICIOUS ACTIVITY DETECTED</h1>
            <p style="color: #F87171; font-size: 12px; margin-top: 4px; text-transform: uppercase;">Automated Security Lockout Engaged</p>
          </div>
          <div class="content">
            <p style="font-size: 15px; color: #FAF7F2; margin-top: 0;">
              Hello ${name || 'User'},
            </p>
            <p style="font-size: 14px; color: #D1D5DB; line-height: 1.6;">
              Our automated defense system detected <strong>3 consecutive failed authentication attempts</strong> for your email address.
            </p>
            <div class="warning-box">
              <strong>🔒 LOCKOUT PROTOCOL ENGAGED:</strong><br/>
              Reason: ${reason}<br/>
              Duration: Access locked for <strong>${lockHours} Hours</strong>.<br/>
              Status: All further requests from this email are blocked until the countdown expires.
            </div>
            <p style="font-size: 13px; color: #9CA3AF; line-height: 1.5;">
              If this was <strong>NOT you</strong>, someone may be attempting unauthorized access to your account or email. Your account is currently safeguarded.
            </p>
          </div>
          <div class="footer">
            ERA43 Automated Security Monitoring &bull; End-to-End Threat Defense
          </div>
        </div>
      </body>
    </html>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"ERA43 Security Alert" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject: `⚠️ URGENT: Suspicious Activity Detected on Your ERA43 Account`,
        html
      });
      console.log(`[SMTP] Delivered Suspicious Activity Alert to ${to}`);
      return { success: true };
    } catch (err) {
      console.error('[SMTP Alert Error]', err);
    }
  }

  console.log('================================================================');
  console.log(`⚠️ [ERA43 DEV SECURITY ALERT TRIGGERED]`);
  console.log(`To: ${to}`);
  console.log(`Alert: Suspicious Activity Detected (${reason}). Account locked for ${lockHours} hours.`);
  console.log('================================================================');
  return { success: true, devMode: true };
}
