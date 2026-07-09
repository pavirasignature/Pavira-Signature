# Pavira Signature - Vercel Deployment Guide

## Overview

This application is configured for **monorepo deployment** on Vercel, where both the Next.js frontend and Express backend are served from the same Vercel project.

### Architecture

- **Frontend:** Next.js app deployed to Vercel
- **Backend:** Express.js API deployed to Vercel as serverless functions
- **API Routes:** `/api/*` routes are proxied to the backend server
- **Database:** Supabase (PostgreSQL)
- **File Storage:** Cloudinary

---

## Pre-Deployment Setup

### 1. Local Development Environment

#### Install Dependencies

```bash
# Root level (installs both frontend and backend)
npm install --legacy-peer-deps

# Or individually:
cd frontend && npm install --legacy-peer-deps
cd ../backend && npm install
```

#### Configure Environment Variables

**Backend** - Create `backend/.env`:

```bash
# Copy from .env.example and fill in values
cp backend/.env.example backend/.env
```

Update with your actual credentials:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_32_chars_min
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

**Frontend** - Create `frontend/.env.local`:

```bash
# Copy from .env.example
cp frontend/.env.example frontend/.env.local
```

Update with your keys:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
```

#### Run Locally

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Access at `http://localhost:3000`

---

## Deployment to Vercel

### Step 1: Prepare Repository

1. **Commit all changes:**

   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Root `vercel.json` configured for monorepo:**
   - ✅ Already configured with dual builds (frontend + backend)
   - Routes `/api/*` to backend
   - Routes everything else to frontend

### Step 2: Deploy on Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Option B: GitHub Integration

1. Go to [vercel.com](https://vercel.com)
2. Import the GitHub repository
3. Vercel auto-detects it as a monorepo
4. Set environment variables (see next section)
5. Deploy

### Step 3: Configure Environment Variables on Vercel

**Add these to Vercel Project Settings > Environment Variables:**

#### Backend Variables (Production)

```
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret_32_chars_min
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://YOUR_VERCEL_DOMAIN.vercel.app

# Email Service
EMAIL_USER=your_production_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_SERVICE=Gmail
EMAIL_FROM=Pavira Signature <noreply@pavira-signature.com>

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=your_production_secret

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Frontend Variables (Production)

```
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
```

**Note:** `NEXT_PUBLIC_API_URL=/api` uses relative URL, making the frontend request the backend from the same domain (essential for Vercel deployment).

### Step 4: Deploy

```bash
vercel deploy --prod
```

---

## Troubleshooting

### Issue: "Backend not loading with frontend"

**Symptoms:**

- API calls return 404
- Network tab shows requests to `/api` failing
- CORS errors in console

**Solutions:**

1. **Verify Environment Variables:**

   ```bash
   vercel env pull
   # Check that variables are actually set
   ```

2. **Check Deployment Logs:**

   ```bash
   vercel logs
   ```

   Look for backend initialization errors.

3. **Verify Monorepo Configuration:**
   - Ensure `vercel.json` in root is correct (has both `frontend/` and `backend/` in builds)
   - Check that `routes` section properly maps `/api/*` to backend

4. **Clear Cache:**

   ```bash
   vercel build --prod --cwd .
   ```

5. **Test API Endpoint Directly:**
   - Visit `https://YOUR_VERCEL_DOMAIN.vercel.app/api/health` (if endpoint exists)
   - Should return JSON, not HTML

### Issue: CORS Errors

**Frontend URL:** `https://pavira-signature.vercel.app`
**Backend needs to allow this origin:**

✅ **Already configured in `backend/server.js`:**

```javascript
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:5173",
  "https://pavira-signature.vercel.app",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);
```

If you change your Vercel domain, update `FRONTEND_URL` environment variable.

### Issue: Static Assets Not Loading

**Solution:**

- Ensure uploads are stored in Cloudinary (not local filesystem)
- Update `backend/server.js` static path configuration if needed

---

## Production Checklist

- [ ] All environment variables set on Vercel
- [ ] `FRONTEND_URL` matches your Vercel domain
- [ ] `MONGODB_URI` points to production database
- [ ] `JWT_SECRET` is strong (32+ characters)
- [ ] Email credentials configured
- [ ] Payment keys are production (stripe: `pk_live_`, razorpay: `rzp_live_`)
- [ ] SSL/HTTPS enabled (automatic on Vercel)
- [ ] Vercel deployment logs show no errors
- [ ] Test login, products, checkout flows

---

## Useful Commands

```bash
# View Vercel logs
vercel logs --prod

# List environment variables
vercel env list

# Pull current environment variables
vercel env pull

# Redeploy without changes
vercel redeploy --prod

# View deployment history
vercel list
```

---

## File Structure Notes

```
├── vercel.json              ← Root config: deploys both frontend & backend
├── frontend/
│   ├── vercel.json         ← Not used (root config takes precedence)
│   ├── .env.production     ← Prod env: NEXT_PUBLIC_API_URL=/api
│   └── lib/api.ts          ← Updated for Vercel deployment
├── backend/
│   ├── vercel.json         ← Backup config if deployed separately
│   ├── .env.production     ← Prod env: DATABASE, KEYS, etc.
│   └── server.js           ← Updated CORS for Vercel domain
```

---

## Support & Contact

For issues during deployment, check:

1. Vercel dashboard logs
2. Browser console for frontend errors
3. Network tab for API response codes
4. Environment variables in Vercel Settings

Good luck with your deployment! 🚀
