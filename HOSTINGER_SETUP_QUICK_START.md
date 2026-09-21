# Hostinger Email - Quick Setup Guide

## 🚀 3-Step Setup

### Step 1: Update `.env` File

Open `backend/.env` and add/update these lines:

```bash
# Hostinger Email Configuration
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=care@pavirasignature.in
EMAIL_PASSWORD=YOUR_HOSTINGER_EMAIL_PASSWORD
EMAIL_FROM="Pavira Signature" <care@pavirasignature.in>

# Enable email sending
EMAIL_SAFE_MODE=false
NODE_ENV=production
```

### Step 2: Get Your Password

1. Go to [Hostinger hPanel](https://hpanel.hostinger.com)
2. Navigate to **Emails**
3. Find `care@pavirasignature.in`
4. Click **Manage** → **Change Password** (if needed)
5. Copy the password to `.env` file

### Step 3: Restart Server

```bash
# If using PM2
pm2 restart pavira-backend

# If using Node directly
npm start

# If using Docker
docker-compose restart backend
```

## ✅ Test It

Submit a contact form on your website and check:
- Email arrives in `care@pavirasignature.in` inbox
- Check webmail: https://webmail.hostinger.com

## 📧 Where Emails Go

**Admin Notifications:** care@pavirasignature.in  
**Customer Confirmations:** Customer's provided email

## 🔧 Troubleshooting

**"Invalid login"** → Wrong password, reset in Hostinger hPanel  
**"Connection timeout"** → Try port 465 instead of 587  
**"Certificate error"** → Normal with Hostinger, emails still work

## 📖 Full Documentation

- **Detailed Setup:** `backend/HOSTINGER_EMAIL_SETUP.md`
- **Security Info:** `backend/SECURITY.md`
- **Anti-spam Details:** `ANTI_SPAM_IMPLEMENTATION.md`

---

**Email:** care@pavirasignature.in  
**SMTP:** smtp.hostinger.com:587  
**Status:** ✅ Ready to use
