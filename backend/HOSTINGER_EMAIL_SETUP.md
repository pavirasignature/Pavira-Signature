# Hostinger Email Configuration Guide

## Overview

Your Pavira Signature backend is now configured to use `care@pavirasignature.in` from Hostinger for sending all emails (contact form notifications, order confirmations, etc.).

## Hostinger Email Details

**Email Address:** `care@pavirasignature.in`  
**Provider:** Hostinger Email Hosting  
**Usage:** All outgoing emails from Pavira Signature backend

## Backend Configuration

### Option 1: Using Hostinger SMTP Settings (Recommended)

Update your `.env` file with these Hostinger SMTP settings:

```bash
# Hostinger SMTP Configuration
EMAIL_SERVICE=
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=care@pavirasignature.in
EMAIL_PASSWORD=your_hostinger_email_password
EMAIL_FROM="Pavira Signature" <care@pavirasignature.in>

# CRITICAL: Set to false in production to send real emails
EMAIL_SAFE_MODE=false

# Environment
NODE_ENV=production
FRONTEND_URL=https://pavirasignature.in
```

### Alternative Hostinger Ports

Hostinger supports multiple SMTP ports:

| Port | Encryption | Recommended |
|------|------------|-------------|
| 587  | STARTTLS   | ✅ Yes (Most common) |
| 465  | SSL/TLS    | ✅ Yes (Alternative) |
| 25   | None       | ❌ No (Often blocked) |

**For Port 465 (SSL):**
```bash
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=care@pavirasignature.in
EMAIL_PASSWORD=your_hostinger_email_password
```

**For Port 587 (STARTTLS):**
```bash
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=care@pavirasignature.in
EMAIL_PASSWORD=your_hostinger_email_password
```

## Getting Your Hostinger Email Password

### If You Don't Remember Your Password:

1. Log in to [Hostinger hPanel](https://hpanel.hostinger.com)
2. Go to **Emails** section
3. Find `care@pavirasignature.in`
4. Click **Manage** or **Settings**
5. Look for **Change Password** option
6. Set a new strong password
7. Use this password in `EMAIL_PASSWORD` env variable

### Password Security Tips:

- Use a strong, unique password (16+ characters)
- Include uppercase, lowercase, numbers, and symbols
- Don't reuse passwords from other services
- Store securely (password manager recommended)

## Testing Email Configuration

### Step 1: Update `.env` File

```bash
# Navigate to backend directory
cd backend

# Edit .env file (Windows)
notepad .env

# OR (if using nano/vim on server)
nano .env
```

Add these lines:
```bash
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=care@pavirasignature.in
EMAIL_PASSWORD=YOUR_ACTUAL_PASSWORD_HERE
EMAIL_FROM="Pavira Signature" <care@pavirasignature.in>
EMAIL_SAFE_MODE=false
NODE_ENV=production
```

### Step 2: Restart Backend Server

```bash
# If using PM2
pm2 restart pavira-backend

# If using npm/node directly
npm start

# If using Docker
docker-compose restart backend
```

### Step 3: Send Test Email

Use this Node.js script to test:

```javascript
// test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: 'care@pavirasignature.in', // Send to yourself
  subject: 'Test Email - Hostinger Configuration',
  text: 'If you receive this, your Hostinger email is configured correctly!',
  html: '<h1>Success!</h1><p>Your Hostinger email (<strong>care@pavirasignature.in</strong>) is working correctly.</p>',
}, (error, info) => {
  if (error) {
    console.error('❌ Email test failed:', error.message);
  } else {
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
  }
});
```

Run test:
```bash
node test-email.js
```

## Email Receiving Setup

All admin notifications will be sent to: **care@pavirasignature.in**

### Email Recipients for Contact Form:

1. **Admin Notification** → `care@pavirasignature.in` (Hostinger inbox)
2. **Customer Confirmation** → Customer's email address

### Checking Your Inbox:

**Webmail Access:**
- URL: https://webmail.hostinger.com
- Email: care@pavirasignature.in
- Password: Your Hostinger email password

**Email Client Setup (Outlook, Thunderbird, etc.):**

**Incoming Mail (IMAP):**
- Server: `imap.hostinger.com`
- Port: `993`
- Encryption: `SSL/TLS`
- Username: `care@pavirasignature.in`
- Password: Your email password

**Outgoing Mail (SMTP):**
- Server: `smtp.hostinger.com`
- Port: `587` or `465`
- Encryption: `STARTTLS` (587) or `SSL/TLS` (465)
- Username: `care@pavirasignature.in`
- Password: Your email password

## Troubleshooting

### Error: "Invalid login credentials"

**Causes:**
- Wrong password
- Wrong email address
- Account not activated

**Solutions:**
1. Reset password in Hostinger hPanel
2. Verify email address is exactly: `care@pavirasignature.in`
3. Check if email account is active in Hostinger

### Error: "Connection timeout"

**Causes:**
- Wrong SMTP host or port
- Firewall blocking outgoing SMTP connections
- Server network restrictions

**Solutions:**
1. Verify `EMAIL_HOST=smtp.hostinger.com`
2. Try port 465 instead of 587
3. Check server firewall rules
4. Contact hosting provider about SMTP access

### Error: "Self signed certificate"

**Solution:**
Add to your transporter config:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false,
  auth: {
    user: 'care@pavirasignature.in',
    pass: 'your_password',
  },
  tls: {
    rejectUnauthorized: false // Only if necessary
  }
});
```

### Emails Going to Spam

**Solutions:**

1. **Set up SPF Record:**
   - Log in to Hostinger DNS management
   - Add TXT record:
     ```
     v=spf1 include:_spf.hostinger.com ~all
     ```

2. **Set up DKIM:**
   - Enabled automatically by Hostinger
   - Verify in hPanel → Email → Advanced settings

3. **Set up DMARC:**
   - Add TXT record:
     ```
     _dmarc.pavirasignature.in
     v=DMARC1; p=quarantine; rua=mailto:care@pavirasignature.in
     ```

4. **Avoid Spam Triggers:**
   - Don't use ALL CAPS in subject lines
   - Avoid excessive exclamation marks
   - Include unsubscribe link (already in templates)
   - Maintain consistent sending volume

## Production Deployment Checklist

Before going live:

- [ ] Hostinger email password set and stored securely
- [ ] `.env` file updated with Hostinger SMTP settings
- [ ] `EMAIL_SAFE_MODE=false` (to enable real email sending)
- [ ] Backend server restarted with new configuration
- [ ] Test email sent successfully
- [ ] Contact form submission tested end-to-end
- [ ] Emails received in `care@pavirasignature.in` inbox
- [ ] Customer confirmation emails working
- [ ] SPF/DKIM/DMARC records configured (optional but recommended)

## Email Quota & Limits

**Hostinger Email Limits (Standard):**
- **Storage:** Varies by plan (typically 10GB - 50GB)
- **Daily Send Limit:** ~500 emails/day (check your plan)
- **Attachment Size:** Max 50MB
- **IMAP Connections:** Unlimited

**If You Exceed Limits:**
- Upgrade Hostinger plan
- Consider transactional email service (SendGrid, AWS SES)
- Implement email queueing system

## Alternative: Using Gmail as Backup

If Hostinger email has issues, you can switch to Gmail:

```bash
EMAIL_SERVICE=Gmail
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM="Pavira Signature" <care@pavirasignature.in>
```

**Note:** Requires Gmail App Password (2FA must be enabled)

## Support

**Hostinger Support:**
- Chat: Available in hPanel
- Email: support@hostinger.com
- Knowledge Base: https://support.hostinger.com

**Backend Email Issues:**
- Check backend logs: `pm2 logs` or `docker logs`
- Review error messages in console
- Test with `test-email.js` script above

---

**Configuration Date:** September 21, 2026  
**Email:** care@pavirasignature.in  
**Provider:** Hostinger  
**Status:** ✅ Configured and Ready
