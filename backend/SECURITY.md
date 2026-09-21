# Security Documentation - Anti-Spam Measures

## Overview

This document outlines the comprehensive anti-spam and email security measures implemented in the Pavira Signature backend to prevent contact form abuse, email bombing, and spam exploitation.

## Implemented Security Layers

### 1. Rate Limiting (Layer 1)

**Location:** `backend/server.js`

**Configuration:**
- **Contact Form Limiter:** 5 requests per 15 minutes per IP address
- **Global Limiter:** 500 requests per 15 minutes per IP (5000 in development)
- **Auth Limiter:** 20 requests per 15 minutes per IP
- **Checkout/Payment Limiter:** 20 requests per 15 minutes per IP

**Applied Routes:**
```javascript
app.use("/api/contact", contactLimiter, contactRoutes);
```

**Response on Limit Exceeded:**
```json
{
  "success": false,
  "message": "Too many contact form submissions. Please try again later or email us directly at care@pavirasignature.in."
}
```

**Bypass Prevention:**
- Uses `express-rate-limit` with IP-based key generation
- Implements safe key generator to handle proxy/load balancer scenarios
- Skips rate limiting for OPTIONS requests (CORS preflight)

---

### 2. Email Validation (Layer 2)

**Location:** `backend/utils/emailValidator.js`

**Features:**
- **RFC 5322 Compliant Regex:** Validates email format according to internet standards
- **Disposable Email Blocking:** Blocklist of 200+ temporary/disposable email domains
- **Format Validation:** Checks for valid structure, length, and single @ symbol

**Blocked Domains Include:**
- Temporary email services (tempmail.com, 10minutemail.com, guerrillamail.com)
- Disposable mailboxes (mailinator.com, maildrop.cc, throwaway.email)
- Anonymous email providers (yopmail.com, fakeinbox.com, trashmail.com)

**Usage:**
```javascript
const { validateEmail } = require("../utils/emailValidator");

const validation = validateEmail(email);
if (!validation.valid) {
  return sendError(res, 400, validation.reason);
}
```

**Error Messages:**
- Invalid format: `"Invalid email format. Please provide a valid email address."`
- Disposable domain: `"Temporary or disposable email addresses are not allowed. Please use a permanent email address."`

---

### 3. Duplicate Submission Detection (Layer 3)

**Location:** `backend/utils/submissionCache.js`

**Mechanism:**
- **In-Memory Cache:** Uses JavaScript Map for fast lookups (no Redis dependency)
- **Hash Generation:** SHA256 hash of `email + message` (first 500 chars)
- **Time Window:** 10-minute duplicate prevention window
- **Auto Cleanup:** Expired entries removed every 5 minutes

**Features:**
```javascript
const { isDuplicateSubmission, recordSubmission } = require("../utils/submissionCache");

// Check for duplicate
if (isDuplicateSubmission(email, message)) {
  return sendError(res, 429, "Duplicate submission detected");
}

// Record successful submission
recordSubmission(email, message);
```

**Cache Statistics:**
```javascript
const { getCacheStats } = require("../utils/submissionCache");
console.log(getCacheStats());
// { size: 15, duplicateWindowMinutes: 10, oldestEntry: 1234567890 }
```

**Response on Duplicate:**
```json
{
  "success": false,
  "message": "You have already submitted this inquiry recently. Please wait 10 minutes before resubmitting, or email us directly at care@pavirasignature.in."
}
```

---

### 4. Honeypot Field Protection (Layer 4)

**Location:** `backend/controllers/contactController.js`

**Concept:**
Invisible form fields that legitimate users won't fill, but bots typically do.

**Implementation:**
```javascript
const { website, phone_number } = req.body;

// Hidden fields - if filled, it's a bot
if (website || phone_number) {
  console.warn(`[HONEYPOT TRIGGERED] Bot detected from IP: ${req.ip}`);
  // Return fake success to avoid revealing anti-bot mechanism
  return sendSuccess(res, 200, { sent: true }, "Your inquiry has been received...");
}
```

**Frontend Integration Required:**
Add these hidden fields to your contact form (CSS: `display: none` or `position: absolute; left: -9999px`):

```html
<!-- DO NOT REMOVE - Anti-bot honeypot fields -->
<input type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" />
<input type="text" name="phone_number" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" />
```

**Important:** These fields must be present in the form but invisible to users.

---

### 5. Email Safe Mode (Development Feature)

**Location:** `backend/utils/email.js`

**Purpose:** Prevent actual email sending during development/testing

**Configuration:**
```bash
# .env file
EMAIL_SAFE_MODE=true  # Disable email sending (log only)
EMAIL_SAFE_MODE=false # Enable email sending (production)
```

**Behavior:**
- **Safe Mode ON:** Emails logged to console but NOT sent
- **Safe Mode OFF:** Emails sent normally via configured SMTP/service

**Console Output (Safe Mode):**
```
⚠️  [EMAIL SAFE MODE ENABLED] Emails will be logged but NOT sent ⚠️

--- [EMAIL SAFE MODE: BLOCKED] ---
Would have sent email to: customer@example.com
Subject: We Have Received Your Inquiry
From: Pavira Signature <care@pavirasignature.in>
Reply-To: admin@pavirasignature.in
-----------------------------------
```

---

## Security Flow Diagram

```
Contact Form Submission
         ↓
[1] Rate Limiter Check (5/15min)
         ↓ PASS
[2] Honeypot Field Check (website, phone_number)
         ↓ PASS
[3] Basic Field Validation (name, email, message)
         ↓ PASS
[4] Advanced Email Validation (format + disposable check)
         ↓ PASS
[5] Duplicate Submission Check (hash-based, 10min window)
         ↓ PASS
[6] Send Emails to Admin + Customer
         ↓
[7] Record Submission in Cache
         ↓
[8] Store in Supabase Database
         ↓
    SUCCESS RESPONSE
```

---

## Monitoring & Maintenance

### Log Patterns to Monitor

**Spam Indicators:**
```bash
# Rate limit hits
grep "Too many contact form submissions" logs/*.log

# Honeypot triggers (bot activity)
grep "HONEYPOT TRIGGERED" logs/*.log

# Duplicate submissions (potential spam flooding)
grep "SPAM DETECTED" logs/*.log

# Disposable email attempts
grep "disposable email" logs/*.log
```

**Success Patterns:**
```bash
# Legitimate inquiries
grep "INQUIRY SUCCESS" logs/*.log

# Cache statistics
grep "SUBMISSION CACHED" logs/*.log
grep "CACHE CLEANUP" logs/*.log
```

### Health Checks

**Submission Cache Health:**
```javascript
// In Node.js console or monitoring script
const { getCacheStats } = require("./utils/submissionCache");
console.log(getCacheStats());
```

**Expected Output:**
- Cache size should not grow indefinitely (cleanup working)
- Typical size: 10-50 entries depending on traffic
- If size > 1000, investigate potential memory leak

### Alert Thresholds

Set up monitoring alerts for:

1. **High Rate Limit Hits:** > 50 per hour (possible attack)
2. **Honeypot Triggers:** > 10 per hour (bot activity spike)
3. **Duplicate Submissions:** > 20 per hour (spam campaign)
4. **Email Send Failures:** > 5 per hour (service degradation)

---

## Attack Vectors & Mitigations

### Attack Vector 1: Email Bombing via Contact Form

**Method:** Attacker submits hundreds of forms to flood admin inbox

**Mitigations:**
- ✅ Rate limiter (5 submissions per 15 min per IP)
- ✅ Duplicate detection (same email+message blocked for 10 min)
- ✅ Honeypot (catches automated bots)

**Residual Risk:** Low - Attacker would need rotating IPs and unique messages

---

### Attack Vector 2: Reflected Spam

**Method:** Attacker uses victim's email to trigger confirmation emails

**Mitigations:**
- ✅ Rate limiter (prevents mass submissions)
- ✅ Email validation (blocks disposable/invalid emails)
- ✅ Duplicate detection (prevents repeated targeting)

**Residual Risk:** Very Low - Only 5 emails per 15 min possible per IP

---

### Attack Vector 3: Bot Spam Submissions

**Method:** Automated bots submit junk inquiries

**Mitigations:**
- ✅ Honeypot fields (bots typically fill hidden fields)
- ✅ Rate limiter (slows bot effectiveness)
- ✅ Email validation (rejects invalid formats)

**Residual Risk:** Low - Most bots caught by honeypot

---

### Attack Vector 4: Distributed Attack (Botnet)

**Method:** Attack from many IPs to bypass rate limiting

**Mitigations:**
- ✅ Per-IP rate limiting
- ✅ Duplicate detection (cross-IP protection)
- ✅ Disposable email blocking

**Additional Recommendation:**
- Consider Cloudflare Bot Management or AWS WAF for Layer 7 DDoS protection
- Implement CAPTCHA (reCAPTCHA v3) for additional bot detection

**Residual Risk:** Medium - Determined attacker with botnet can bypass IP-based limits

---

## Updating Disposable Email Blocklist

The disposable email domain list may need periodic updates as new services emerge.

**Current List Location:** `backend/utils/emailValidator.js` (line 12)

**Update Process:**
1. Monitor spam submissions for new disposable domains
2. Check public blocklists:
   - https://github.com/disposable-email-domains/disposable-email-domains
   - https://github.com/ivolo/disposable-email-domains
3. Add new domains to the `DISPOSABLE_EMAIL_DOMAINS` Set
4. Test validation with new domains
5. Deploy update

**Recommended Update Frequency:** Quarterly

---

## Environment Configuration Checklist

### Production Environment

```bash
# Email Service (Choose Option A or B)

# Option A: Use predefined service
EMAIL_SERVICE=Gmail
EMAIL_USER=care@pavirasignature.in
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM="Pavira Signature" <care@pavirasignature.in>

# Option B: Use custom SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=care@pavirasignature.in
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM="Pavira Signature" <care@pavirasignature.in>

# CRITICAL: Disable safe mode in production
EMAIL_SAFE_MODE=false

# Node Environment
NODE_ENV=production
```

### Development Environment

```bash
# Use Mailtrap or similar service for testing
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password
EMAIL_FROM="Pavira Signature Dev" <dev@pavirasignature.in>

# Enable safe mode to prevent accidental sends
EMAIL_SAFE_MODE=true

# Node Environment
NODE_ENV=development
```

---

## Frontend Implementation Notes

### Required Contact Form Fields

**Standard Fields (visible):**
- `name` - Required, trimmed, non-empty
- `email` - Required, validated, disposable-blocked
- `subject` - Optional, defaults to "General Inquiry"
- `message` - Required, trimmed, non-empty, used for duplicate detection

**Honeypot Fields (hidden):**
- `website` - Must remain empty (bot trap)
- `phone_number` - Must remain empty (bot trap)

### Example Frontend HTML

```html
<form action="/api/contact" method="POST">
  <!-- Visible Fields -->
  <input type="text" name="name" placeholder="Your Name" required />
  <input type="email" name="email" placeholder="Your Email" required />
  <input type="text" name="subject" placeholder="Subject (Optional)" />
  <textarea name="message" placeholder="Your Message" required></textarea>
  
  <!-- Honeypot Fields (MUST be hidden) -->
  <input 
    type="text" 
    name="website" 
    tabindex="-1" 
    autocomplete="off" 
    aria-hidden="true"
    style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;"
  />
  <input 
    type="text" 
    name="phone_number" 
    tabindex="-1" 
    autocomplete="off" 
    aria-hidden="true"
    style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;"
  />
  
  <button type="submit">Send Inquiry</button>
</form>
```

### Error Handling Examples

```javascript
// Rate limit exceeded
{
  "success": false,
  "message": "Too many contact form submissions. Please try again later or email us directly at care@pavirasignature.in."
}

// Invalid email format
{
  "success": false,
  "message": "Invalid email format. Please provide a valid email address."
}

// Disposable email blocked
{
  "success": false,
  "message": "Temporary or disposable email addresses are not allowed. Please use a permanent email address."
}

// Duplicate submission
{
  "success": false,
  "message": "You have already submitted this inquiry recently. Please wait 10 minutes before resubmitting, or email us directly at care@pavirasignature.in."
}

// Success
{
  "success": true,
  "data": { "sent": true },
  "message": "Your inquiry has been received. Our art concierge team will contact you within 24 hours."
}
```

---

## Testing & Validation

### Manual Testing Checklist

- [ ] Submit valid inquiry → Should succeed
- [ ] Submit same inquiry twice rapidly → Second should be blocked (duplicate)
- [ ] Submit 6 inquiries rapidly → 6th should be rate limited
- [ ] Submit with disposable email (test@tempmail.com) → Should be blocked
- [ ] Submit with honeypot field filled → Should silently succeed (but not send email)
- [ ] Submit with invalid email format → Should be blocked
- [ ] Submit with empty name/email/message → Should be blocked
- [ ] Wait 10 minutes and resubmit same inquiry → Should succeed

### Automated Testing Example

```javascript
const axios = require("axios");

const testContactForm = async () => {
  try {
    // Test 1: Valid submission
    const response1 = await axios.post("http://localhost:5000/api/contact", {
      name: "Test User",
      email: "test@example.com",
      subject: "Test Inquiry",
      message: "This is a test message",
    });
    console.log("Test 1 PASSED:", response1.data.message);

    // Test 2: Duplicate submission (should fail)
    const response2 = await axios.post("http://localhost:5000/api/contact", {
      name: "Test User",
      email: "test@example.com",
      subject: "Test Inquiry",
      message: "This is a test message",
    });
    console.log("Test 2 FAILED - Should have been blocked");
  } catch (error) {
    console.log("Test 2 PASSED:", error.response.data.message);
  }

  // Test 3: Disposable email (should fail)
  try {
    const response3 = await axios.post("http://localhost:5000/api/contact", {
      name: "Test User",
      email: "test@tempmail.com",
      subject: "Test Inquiry",
      message: "This is another test",
    });
    console.log("Test 3 FAILED - Should have been blocked");
  } catch (error) {
    console.log("Test 3 PASSED:", error.response.data.message);
  }
};

testContactForm();
```

---

## Performance Considerations

### Memory Usage

**Submission Cache:**
- Each entry: ~100 bytes (hash + timestamp)
- Typical size: 10-50 entries
- Max realistic size: ~1000 entries (high traffic)
- Total memory: < 100KB under normal conditions

**Cleanup Mechanism:**
- Runs every 5 minutes
- Removes entries older than 10 minutes
- Prevents unbounded memory growth

### CPU Usage

All security checks are lightweight:
- Rate limiting: O(1) lookup in express-rate-limit store
- Email validation: O(1) regex match + Set lookup
- Duplicate detection: O(1) Map lookup
- Honeypot: O(1) field presence check

**Total overhead per request:** < 5ms

---

## Future Enhancements

### Recommended Additions

1. **CAPTCHA Integration (High Priority)**
   - Implement reCAPTCHA v3 for invisible bot detection
   - Score-based validation (0.0 = bot, 1.0 = human)
   - No user interaction required

2. **IP Reputation Checking (Medium Priority)**
   - Integrate with services like AbuseIPDB or IPQualityScore
   - Block submissions from known spam IPs
   - Track repeat offenders

3. **Content-Based Spam Detection (Medium Priority)**
   - Keyword filtering (common spam phrases)
   - URL detection in message content
   - Excessive capitalization detection

4. **Geographic Restrictions (Low Priority)**
   - Optional country-based blocking
   - Useful if spam comes from specific regions

5. **Admin Dashboard (Low Priority)**
   - Real-time spam statistics
   - Blocked submission log viewer
   - Cache statistics monitoring

---

## Support & Contact

**Security Issues:** If you discover a security vulnerability, please email security@pavirasignature.in

**Spam False Positives:** If legitimate users report blocked submissions, review logs and adjust thresholds

**Questions:** Contact the development team via Slack #backend-security

---

## Changelog

### Version 1.0.0 (Current)
- ✅ Rate limiting (5 per 15min per IP)
- ✅ Email validation (RFC 5322 + disposable blocking)
- ✅ Duplicate submission detection (10min window)
- ✅ Honeypot field protection
- ✅ Email safe mode toggle

### Future Versions
- 🔜 v1.1.0: CAPTCHA integration
- 🔜 v1.2.0: IP reputation checking
- 🔜 v1.3.0: Content-based spam detection

---

**Last Updated:** 2026-09-21  
**Maintained By:** Pavira Signature Backend Team  
**Review Frequency:** Quarterly
