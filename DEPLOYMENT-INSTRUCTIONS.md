# Deployment Instructions for taxrates-us

## Pre-Launch Deployment Fixes - COMPLETE ✅

### Issues Fixed
1. ✅ **Landing page deployment structure** - Moved Next.js app to root
2. ✅ **Build configuration** - Updated vercel.json and package.json
3. ✅ **Password protection middleware** - Already in place and tested
4. ✅ **Local testing** - Verified password protection works

### Remaining Manual Step
⚠️ **CRITICAL:** Set `LANDING_PASSWORD` environment variable in Vercel before deployment

---

## How to Set LANDING_PASSWORD in Vercel

### Step 1: Access Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select the **taxrates-us** project
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar

### Step 2: Add Environment Variable
1. Click **Add New** button
2. Fill in the form:
   - **Key:** `LANDING_PASSWORD`
   - **Value:** `[Your secure password here]`
   - **Environments:** Select **Production**, **Preview**, and **Development**
3. Click **Save**

### Step 3: Recommended Password
Choose a strong password (16+ characters recommended):
- Example format: `TaxRates2026Preview!Secure`
- Use a mix of uppercase, lowercase, numbers, and symbols
- Document in 1Password or your secure vault
- Share only with authorized users

### Step 4: Redeploy
After adding the environment variable:
```bash
vercel --prod
```

Or trigger a redeploy from the Vercel dashboard:
1. Go to **Deployments** tab
2. Click ⋯ (three dots) on the latest deployment
3. Select **Redeploy**
4. Confirm the redeploy

---

## Testing After Deployment

### Test 1: Password Protection Active
1. Visit https://taxrates-us.vercel.app in an incognito window
2. You should see a browser authentication prompt
3. Enter any username (ignored) and the password you set
4. The landing page should load

### Test 2: Wrong Password Rejected
1. Visit the site in a new incognito window
2. Enter a wrong password
3. Should show "401 Unauthorized" or re-prompt

### Test 3: API Endpoints Still Work
1. Visit https://taxrates-us.vercel.app/api
2. Should return JSON (no password required for API)
3. Test: https://taxrates-us.vercel.app/api/rate?state=CA&zip=90210

---

## Project Structure After Fixes

```
taxrates-us/
├── app/                    # Next.js app (landing page) - AT ROOT NOW ✅
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── middleware.ts           # Password protection - AT ROOT NOW ✅
├── api/                    # Vercel serverless functions (unchanged)
│   ├── index.ts
│   ├── rate.ts
│   └── states.ts
├── src/                    # npm package source (unchanged)
├── vercel.json             # Updated to build Next.js + API
├── package.json            # Updated with Next.js dependencies
└── .env.example            # Documents LANDING_PASSWORD requirement

landing/                    # OLD DIRECTORY - Can be deleted after deployment verified
```

---

## What Changed

### Before (Broken)
- Landing page in `/landing/` subdirectory
- Root vercel.json configured for npm package only
- Landing page deployment resulted in 404
- Two separate Next.js apps (root and landing)

### After (Fixed)
- Landing page moved to root `/app/` directory
- Middleware moved to root `/middleware.ts`
- vercel.json builds Next.js at root
- Single Next.js app serves both landing page and API
- Standard Next.js + Vercel Functions pattern

---

## Deployment Commands

### Deploy to Production
```bash
cd /Users/partner/.openclaw/workspace/taxrates-us
vercel --prod
```

### Deploy Preview (Testing)
```bash
vercel
```

### Local Development
```bash
npm run dev
# Visit http://localhost:3000

# With password protection:
LANDING_PASSWORD="TestPassword123" npm run dev
```

### Build Locally (Test)
```bash
npm run build
npm start
```

---

## Known Issues & Notes

### ⚠️ Middleware Deprecation Warning
Next.js 16 shows a warning:
```
The "middleware" file convention is deprecated. Please use "proxy" instead.
```

**Impact:** Cosmetic warning only. Middleware works perfectly.  
**Fix:** Update to `proxy.ts` when Next.js stable docs are available.  
**Priority:** Low (can ignore for launch)

### 🔧 MCP Symlink Issue (Local Dev Only)
The `mcp/node_modules/taxrates-us` symlink causes Turbopack infinite loop locally.

**Fix Applied:** Removed symlink for local development  
**Vercel Impact:** None (mcp directory not deployed)  
**Note:** If you need the MCP server, use `npm link` instead of symlink

---

## Security Checklist

- [x] Password protection middleware active
- [x] Middleware prompts for authentication on all routes
- [x] Fails open only when LANDING_PASSWORD not set (intentional for dev)
- [x] API endpoints accessible without password (public API design)
- [x] Rate limiting active (10 req/min, 100 req/hr)
- [x] Disclaimers present (README, TERMS, API responses, landing page)
- [ ] **LANDING_PASSWORD set in Vercel** ⚠️ MITCH MUST DO THIS

---

## When Ready to Go Public (Remove Password)

### Option 1: Remove Environment Variable
1. Vercel Dashboard → Settings → Environment Variables
2. Delete `LANDING_PASSWORD`
3. Redeploy

### Option 2: Update Middleware
Edit `/middleware.ts` to remove password check entirely.

### Option 3: Vercel Deployment Protection
Use Vercel's built-in password protection:
1. Project Settings → Deployment Protection
2. Toggle "Password Protection"
3. No code changes needed

---

## Support & Troubleshooting

### Landing Page Returns 404
- Verify vercel.json `framework: "nextjs"` is set
- Check that `app/` directory exists at root
- Ensure `npm run build` succeeds locally

### Password Prompt Doesn't Appear
- Verify LANDING_PASSWORD is set in Vercel env vars
- Check middleware.ts exists at root (not in landing/)
- Look for console warning "LANDING_PASSWORD not set"

### API Returns 401
- API should NOT require password
- Verify middleware config: `matcher: '/:path*'` excludes `/api/*` naturally
- Test: `curl https://taxrates-us.vercel.app/api`

---

**Last Updated:** 2026-02-15  
**Status:** Ready for deployment (pending LANDING_PASSWORD setup)  
**Tested:** ✅ Local build, ✅ Password protection, ✅ API endpoints
