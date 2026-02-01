# Vercel Frontend Deployment Checklist

This checklist ensures your frontend deploys correctly to Vercel and avoids the common blank white screen issue.

---

## Pre-Deployment

- [ ] **Test locally:** Run `npm run build && npm run preview` — if white screen appears here, fix it before pushing to Vercel
- [ ] **All imports match filenames:** Check `App.tsx` and components for case sensitivity (e.g., `AuthContext` not `authcontext`)
- [ ] **No `localhost:3001` in code:** Use environment variables for API URLs
- [ ] **Git push:** Push your code to GitHub (or link repo to Vercel)

---

## Vercel Dashboard Setup

### Step 1: Create Project
1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Select your GitHub repository
3. Click **Import**

### Step 2: Configure Build Settings
In the **Configure Project** screen, set:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Step 3: Environment Variables
Click **Environment Variables** and add **each of these** (copy from your `.env`):

```env
VITE_SUPABASE_URL=https://rgjhrrmemjcetbdwjtzx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=https://your-backend.up.railway.app
VITE_GOOGLE_PAY_ENVIRONMENT=TEST
VITE_GOOGLE_PAY_MERCHANT_ID=BCR2DN5T52FYHNQV
VITE_GOOGLE_PAY_GATEWAY=stripe
VITE_GOOGLE_PAY_GATEWAY_MERCHANT_ID=acct_1Svhr4JvMwDhITTx
GEMINI_API_KEY=sk-...
```

**Important:** 
- For each variable, set **Environment:** to `Production` (or all environments if testing)
- Do NOT add backend-only variables here (M-Pesa secrets, etc.)

### Step 4: Deploy
Click **Deploy** and watch the build logs.

---

## Post-Deployment Troubleshooting

### White Screen / Blank Page

**Step 1: Check Build Logs**
1. Go to Vercel project → **Deployments** → Select latest deployment
2. Click **Build Logs** tab
3. Look for red errors like:
   - `Cannot find module` → case sensitivity issue or missing file
   - `ReferenceError: process is not defined` → missing env var

**Step 2: Check Browser Console**
1. Visit your Vercel URL
2. Right-click → **Inspect** → **Console** tab
3. Look for red errors:
   - `Cannot read properties of undefined` → missing env var
   - `Failed to fetch from /api/...` → `VITE_API_BASE_URL` is wrong
   - `404 on /assets/index-xxx.js` → build output issue

**Step 3: Verify Environment Variables**
1. Vercel project → **Settings** → **Environment Variables**
2. Confirm all `VITE_*` variables are present
3. If missing, add them and **Redeploy**

**Step 4: Test Production Build Locally**
```bash
npm run build
npm run preview
```
If white screen here too, the issue is in your code/build (not Vercel).

### 404 on API Calls

**Issue:** Frontend can load but API requests fail (404 in Network tab)

**Fix:** 
1. Check `VITE_API_BASE_URL` in Vercel Environment Variables
2. Ensure it's the **public HTTPS URL** of your backend (e.g., `https://your-railway.up.railway.app`)
3. NOT `http://localhost:3001`

### Build Fails

**Common causes:**
- Missing dependencies: Run `npm install` locally to verify
- TypeScript errors: Run `npm run build` locally to see errors
- Out of memory: Vercel's build might timeout; check build logs

---

## After First Deployment

### Update Supabase OAuth Redirect URIs

If using Google OAuth:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project
2. **Authentication** → **Providers** → **Google**
3. Add Vercel URL to redirect URIs:
   ```
   https://your-vercel-domain.vercel.app/auth/v1/callback
   ```

### Update M-Pesa Callback URL (if needed)

If backend is separate (Railway):
1. Update your Railway `MPESA_CALLBACK_URL` to your public backend URL:
   ```env
   MPESA_CALLBACK_URL=https://your-backend.up.railway.app/api/mpesa/callback
   ```

---

## Quick Environment Variables Reference

Copy this block and add to Vercel:

```env
VITE_SUPABASE_URL=https://rgjhrrmemjcetbdwjtzx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnamhycm1lbWpjZXRiZHdqdHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODUyMTYsImV4cCI6MjA4NTQ2MTIxNn0.vPIukAcQzLD8JzB2fOWeY8AHVagT1u3yknN-T1oR97g
VITE_API_BASE_URL=https://your-backend.up.railway.app
VITE_GOOGLE_PAY_ENVIRONMENT=TEST
VITE_GOOGLE_PAY_MERCHANT_ID=BCR2DN5T52FYHNQV
VITE_GOOGLE_PAY_GATEWAY=stripe
VITE_GOOGLE_PAY_GATEWAY_MERCHANT_ID=acct_1Svhr4JvMwDhITTx
GEMINI_API_KEY=your_gemini_key
```

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Vite Docs:** https://vitejs.dev/guide/ssr.html
- **Supabase Docs:** https://supabase.com/docs/guides/auth
- See `ENV_VARS.md` for complete environment variable mapping
