# Environment Variables - Complete Mapping

This document lists every environment variable in the project, where it's used, and which deployment platform needs it.

---

## Frontend Environment Variables (Vercel / Netlify / Any Host)

These variables are **built into** the JavaScript bundle when you run `npm run build`. They're public and visible in the browser.

Set these in your frontend host's **Environment Variables** section.

### Required Frontend Variables

| Variable | Example Value | Purpose | Public? |
|----------|---------------|---------|---------|
| `VITE_SUPABASE_URL` | `https://rgjhrrmemjcetbdwjtzx.supabase.co` | Supabase project URL for auth | Yes |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase anon key for client-side auth | Yes |
| `VITE_API_BASE_URL` | `https://api.yourdomain.com` or `http://localhost:3001` | Backend API endpoint (used by frontend to call server) | Yes |
| `VITE_GOOGLE_PAY_ENVIRONMENT` | `TEST` or `PRODUCTION` | Google Pay environment | Yes |
| `VITE_GOOGLE_PAY_MERCHANT_ID` | `BCR2DN5T52FYHNQV` | Google Pay merchant ID | Yes |
| `VITE_GOOGLE_PAY_GATEWAY` | `stripe` | Payment gateway (stripe, paypal, square) | Yes |
| `VITE_GOOGLE_PAY_GATEWAY_MERCHANT_ID` | `acct_1Svhr4JvMwDhITTx` | Payment gateway merchant ID | Yes |
| `GEMINI_API_KEY` | `sk-...` | Google Gemini API key for chat assistant (injected at build time) | Yes (if used) |

### How to Add to Vercel

1. Go to **Vercel Dashboard** → Select your project
2. **Settings** → **Environment Variables**
3. Add each variable above:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://rgjhrrmemjcetbdwjtzx.supabase.co`
   - Environment: Production (or specify)
4. **Save** and **Redeploy**

Example .env for local testing (frontend):
```env
VITE_SUPABASE_URL=https://rgjhrrmemjcetbdwjtzx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=http://localhost:3001
VITE_GOOGLE_PAY_ENVIRONMENT=TEST
VITE_GOOGLE_PAY_MERCHANT_ID=BCR2DN5T52FYHNQV
VITE_GOOGLE_PAY_GATEWAY=stripe
VITE_GOOGLE_PAY_GATEWAY_MERCHANT_ID=acct_1Svhr4JvMwDhITTx
GEMINI_API_KEY=sk-...
```

---

## Backend Environment Variables (Railway / Render / Any Node Host)

These variables are **runtime-only** and must be kept private. They're only used by the Node.js server (`server/index.js`).

Set these in your backend host's **Secrets** or **Environment Variables** section.

### Required Backend Variables

| Variable | Example Value | Purpose | Private? | Used Where |
|----------|---------------|---------|----------|-----------|
| `MPESA_CONSUMER_KEY` | `TTywVbqGEn2KVV0vxx6BUNk...` | M-Pesa OAuth consumer key | **YES** | `server/index.js` |
| `MPESA_CONSUMER_SECRET` | `l6D865ul5ggneGAdFoVwpF...` | M-Pesa OAuth consumer secret | **YES** | `server/index.js` |
| `MPESA_SHORTCODE` | `174379` | M-Pesa business shortcode | No | `server/index.js` |
| `MPESA_PASSKEY` | `bfb279f9aa9bdbcf158e97d...` | M-Pesa STK Push passkey | **YES** | `server/index.js` |
| `MPESA_BASE_URL` | `https://sandbox.safaricom.co.ke` | M-Pesa API base URL (sandbox or production) | No | `server/index.js` |
| `MPESA_CALLBACK_URL` | `https://your-backend.up.railway.app/api/mpesa/callback` | Public HTTPS webhook for M-Pesa callbacks | No (but must be public) | `server/index.js` |
| `PORT` | `3001` | Server port | No | `server/index.js` |
| `NODE_ENV` | `production` | Node environment flag | No | `vite.config.ts`, `server/index.js` |
| `GEMINI_API_KEY` | `sk-...` (same as frontend if used) | Google Gemini API key for backend | **YES** | `services/geminiService.ts` (if backend uses it) |
| `VITE_SUPABASE_URL` | `https://rgjhrrmemjcetbdwjtzx.supabase.co` | Supabase URL (needed by backend during build if co-hosted) | No | Build time (if frontend co-hosted) |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase anon key (needed by backend during build if co-hosted) | No (public key) | Build time (if frontend co-hosted) |

### How to Add to Railway

1. Go to **Railway Dashboard** → Select your service
2. Click **Variables** or **Secrets**
3. Add each variable:
   - Key: `MPESA_CONSUMER_KEY`
   - Value: (paste your secret)
4. **Save** and **Redeploy**

Example .env for local backend testing:
```env
MPESA_CONSUMER_KEY=TTywVbqGEn2KVV0vxx6BUNk...
MPESA_CONSUMER_SECRET=l6D865ul5ggneGAdFoVwpF...
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97d...
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/callback
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=sk-...
VITE_SUPABASE_URL=https://rgjhrrmemjcetbdwjtzx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Deployment Scenarios

### Scenario 1: Frontend on Vercel, Backend on Railway

**Vercel (Frontend)**
- Add all `VITE_*` variables
- Set `VITE_API_BASE_URL` to your Railway service URL: `https://your-service.up.railway.app`
- Run `npm run build` → frontend calls backend via that URL

**Railway (Backend)**
- Add all backend variables (`MPESA_*`, `NODE_ENV`, `PORT`, etc.)
- Do NOT set `VITE_*` variables (they're frontend-only)
- Server serves API only

### Scenario 2: Frontend + Backend Together on Railway (Single Docker Image)

**Railway**
- Add **both** frontend and backend variables:
  - Frontend: All `VITE_*` variables (used at build time)
  - Backend: All backend variables (used at runtime)
- Railway builds the Docker image → compiles frontend → runs server
- Server serves both API and static frontend (`dist`)
- `VITE_API_BASE_URL` can be `http://localhost:3001` or the public Railway URL

---

## Troubleshooting Blank White Screen on Vercel

If you see a white screen on Vercel but not on localhost:

### Check 1: Missing Environment Variables
```javascript
// If these are undefined, app will crash silently
import.meta.env.VITE_SUPABASE_URL      // undefined → blank screen
import.meta.env.VITE_SUPABASE_ANON_KEY // undefined → blank screen
```

**Fix:** Add missing `VITE_*` variables in Vercel Dashboard → Environment Variables → Redeploy

### Check 2: Incorrect `VITE_API_BASE_URL`
If `VITE_API_BASE_URL=http://localhost:3001` on Vercel, all API calls fail.

**Fix:** Change to your actual backend URL:
```env
VITE_API_BASE_URL=https://your-backend.up.railway.app
```

### Check 3: Build Output
Verify Vercel's build settings:
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Check 4: Browser Console Errors
In Vercel, open your site and check browser console (F12 → Console tab):
- Look for red errors like `Cannot read properties of undefined`
- Look for failed network requests (404s on JS files)

---

## Summary Table

| Deployment | Frontend Vars | Backend Vars | Notes |
|------------|--------------|-------------|-------|
| **Vercel + Railway** | All `VITE_*` | All `MPESA_*`, `NODE_ENV`, `PORT`, secrets | Frontend calls backend via `VITE_API_BASE_URL` |
| **Railway Only** | All `VITE_*` + All backend vars | (same as above) | Single Docker image builds frontend + runs backend |
| **Localhost** | .env file | .env file | Use `localhost:3001` and `localhost:3000` |

---

## Do NOT Leak Secrets

❌ **Never add to Git:**
- `MPESA_CONSUMER_SECRET`
- `MPESA_PASSKEY`
- `GEMINI_API_KEY` (if private)
- Private API keys

✅ **Always use platform secret storage:**
- Vercel: Environment Variables section (mark as secret)
- Railway: Secrets section
- Local: .env file (in `.gitignore`)
