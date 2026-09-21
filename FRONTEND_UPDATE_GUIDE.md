# Frontend Update Guide - Anti-Spam Integration

## 🚨 CRITICAL: Frontend Changes Required

To complete the anti-spam implementation, you **MUST** add honeypot fields to your contact form(s).

## Where to Update

Find your contact form component(s). Common locations:
- `frontend/src/components/ContactForm.jsx` (or `.tsx`)
- `frontend/src/pages/Contact.jsx`
- `frontend/src/components/forms/InquiryForm.jsx`

## Required Changes

### Step 1: Add Honeypot Fields to Your Form

Add these two **hidden** fields to your contact form HTML:

```jsx
{/* Existing visible fields */}
<input type="text" name="name" placeholder="Your Name" required />
<input type="email" name="email" placeholder="Your Email" required />
<input type="text" name="subject" placeholder="Subject (Optional)" />
<textarea name="message" placeholder="Your Message" required></textarea>

{/* ADD THESE HONEYPOT FIELDS - MUST BE HIDDEN */}
<input 
  type="text" 
  name="website" 
  tabIndex={-1} 
  autoComplete="off" 
  aria-hidden="true"
  style={{
    position: 'absolute',
    left: '-9999px',
    width: '1px',
    height: '1px',
    opacity: 0,
    pointerEvents: 'none'
  }}
/>
<input 
  type="text" 
  name="phone_number" 
  tabIndex={-1} 
  autoComplete="off" 
  aria-hidden="true"
  style={{
    position: 'absolute',
    left: '-9999px',
    width: '1px',
    height: '1px',
    opacity: 0,
    pointerEvents: 'none'
  }}
/>

<button type="submit">Send Inquiry</button>
```

### Step 2: Ensure Form State Includes Empty Honeypot Values

If you're using React state to manage form data:

```javascript
const [formData, setFormData] = useState({
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '',        // ← ADD THIS (honeypot)
  phone_number: ''    // ← ADD THIS (honeypot)
});
```

### Step 3: Submit All Fields (Including Honeypots)

Your form submission should include ALL fields:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await axios.post('/api/contact', {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      website: formData.website,           // ← Include honeypot
      phone_number: formData.phone_number  // ← Include honeypot
    });
    
    // Handle success
    console.log('Inquiry sent successfully');
  } catch (error) {
    // Handle error
    console.error('Failed to send inquiry:', error.response?.data?.message);
  }
};
```

## ⚠️ IMPORTANT RULES

1. **Never make honeypot fields visible** - Bots fill them, humans don't
2. **Don't use `display: none`** - Some bots detect this; use absolute positioning instead
3. **Don't label them** - No labels, placeholders, or visible indicators
4. **Keep field names generic** - `website` and `phone_number` look legitimate to bots
5. **Include in POST request** - Backend expects these fields to check for bots

## Testing

After implementing:

1. **Test Normal Submission:**
   - Fill out form normally (don't touch honeypot fields)
   - Submit → Should succeed

2. **Test Bot Detection:**
   - Fill out form normally
   - Open browser dev tools → Console
   - Run: `document.querySelector('input[name="website"]').value = 'test'`
   - Submit → Should succeed but email won't be sent (bot detected)

3. **Check Backend Logs:**
   - Look for: `[HONEYPOT TRIGGERED] Bot detected from IP: ...`

## CSS Alternative (if inline styles don't work)

Add to your CSS file:

```css
.honeypot-field {
  position: absolute !important;
  left: -9999px !important;
  width: 1px !important;
  height: 1px !important;
  opacity: 0 !important;
  pointer-events: none !important;
  tab-index: -1;
}
```

Then use:

```jsx
<input 
  type="text" 
  name="website" 
  className="honeypot-field"
  tabIndex={-1} 
  autoComplete="off" 
  aria-hidden="true"
/>
```

## Backend Configuration

### Enable Email Sending (Production)

Update your `.env` file:

```bash
# Email Configuration
EMAIL_SERVICE=Gmail
EMAIL_USER=care@pavirasignature.in
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM="Pavira Signature" <care@pavirasignature.in>

# CRITICAL: Set to false in production
EMAIL_SAFE_MODE=false

# Environment
NODE_ENV=production
```

### Generate Gmail App Password

If using Gmail:

1. Go to Google Account Settings → Security
2. Enable 2-Factor Authentication
3. Go to "App Passwords"
4. Generate password for "Mail" application
5. Copy the 16-character password
6. Use in `EMAIL_PASSWORD` env variable

## Security Features Summary

Your contact form is now protected by:

✅ **Rate Limiting:** 5 submissions per 15 minutes per IP  
✅ **Email Validation:** RFC 5322 compliant + 200+ disposable domains blocked  
✅ **Duplicate Detection:** Same email+message blocked for 10 minutes  
✅ **Honeypot Protection:** Hidden fields catch automated bots  
✅ **Input Sanitization:** All fields trimmed and validated  

## Error Handling

Your frontend should handle these error responses:

```javascript
// Rate limit exceeded (HTTP 429)
{
  "success": false,
  "message": "Too many contact form submissions. Please try again later or email us directly at care@pavirasignature.in."
}

// Invalid/disposable email (HTTP 400)
{
  "success": false,
  "message": "Invalid email format. Please provide a valid email address."
}
// or
{
  "success": false,
  "message": "Temporary or disposable email addresses are not allowed. Please use a permanent email address."
}

// Duplicate submission (HTTP 429)
{
  "success": false,
  "message": "You have already submitted this inquiry recently. Please wait 10 minutes before resubmitting, or email us directly at care@pavirasignature.in."
}

// Success (HTTP 200)
{
  "success": true,
  "data": { "sent": true },
  "message": "Your inquiry has been received. Our art concierge team will contact you within 24 hours."
}
```

## Need Help?

See full documentation in `backend/SECURITY.md` for:
- Attack vector analysis
- Monitoring guidelines
- Testing procedures
- Advanced configuration options

---

**Last Updated:** 2026-09-21  
**Priority:** HIGH - Complete before deploying to production
