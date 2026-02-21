# Security Deployment Guide

Quick reference for deploying taxrates-us with security controls enabled.

## 🔒 Pre-Launch Checklist

### 1. Enable Password Protection (Landing Page)

**Where:** Vercel Dashboard → Project Settings → Environment Variables

**Add this variable:**
```
Name:  LANDING_PASSWORD
Value: <your_strong_password>
Scope: Production, Preview
```

**Recommended password format:**
- At least 16 characters
- Mix of letters, numbers, symbols
- Example: `TaxRates2026Preview!Secure`

**After deployment:**
- Test by visiting `https://taxrates-us.vercel.app`
- Browser should prompt for username/password
- Username can be anything, password must match exactly

### 2. Verify Rate Limiting

**Test with curl:**
```bash
# Should succeed (returns tax rate)
curl "https://taxrates-us.vercel.app/api/rate?state=CA"

# Run 15 times rapidly - last 5 should return 429
for i in {1..15}; do
  curl -w "\nHTTP_%{http_code}\n" \
    "https://taxrates-us.vercel.app/api/rate?state=CA"
  sleep 0.5
done
```

**Expected limits:**
- ✅ 10 requests per minute per IP
- ✅ 100 requests per hour per IP
- ✅ Returns `429 Too Many Requests` when exceeded

### 3. Test Error Handling

**Verify no sensitive data leaks:**
```bash
# Missing parameter (should return 400 with helpful message)
curl "https://taxrates-us.vercel.app/api/rate"

# Unsupported state (should return 200 with supported=false)
curl "https://taxrates-us.vercel.app/api/rate?state=ZZ"

# Invalid method (should return 405)
curl -X POST "https://taxrates-us.vercel.app/api/rate?state=CA"
```

**✅ PASS if responses contain:**
- Clear error messages
- No stack traces
- No file paths
- No internal error details

---

## 🚀 Deployment Steps

### Option 1: Via Vercel Dashboard

1. **Set password:**
   - Vercel Dashboard → taxrates-us → Settings → Environment Variables
   - Add `LANDING_PASSWORD` (see above)
   - Click "Save"

2. **Redeploy:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Select "Redeploy"
   - Wait for build to complete (~2 minutes)

3. **Verify:**
   - Visit landing page (should prompt for password)
   - Test API endpoints (should work without password)

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Set environment variable
vercel env add LANDING_PASSWORD

# When prompted:
# > What's the value? <paste_your_password>
# > Add to which environments? Production, Preview

# Redeploy
vercel --prod
```

---

## 🔓 Going Public (Remove Password Protection)

**When ready to make the site public:**

### Step 1: Remove Password
- Vercel Dashboard → Settings → Environment Variables
- Find `LANDING_PASSWORD`
- Click "..." → Delete
- Confirm deletion

### Step 2: Redeploy
- Deployments → Latest → Redeploy
- OR: Push a new commit to trigger auto-deploy

### Step 3: Verify
- Visit landing page (should load immediately, no password prompt)
- API should still have rate limiting active

---

## 🛡️ Security Monitoring

### Daily (First Week)

Check Vercel logs for:
- 429 errors (rate limit hits)
- 500 errors (unexpected failures)
- Unusual traffic spikes

**Access logs:**
- Vercel Dashboard → Analytics → Logs
- Filter by status code: `429` or `500`

### Weekly (Ongoing)

- Review traffic patterns
- Check for abuse (repeated 429s from same IP)
- Update dependencies: `npm audit && npm update`

### Monthly

- Review rate limit effectiveness
- Check for new security advisories (GitHub)
- Update tax rate data (see `/scripts` folder)

---

## ⚠️ Incident Response

### If password is compromised:

1. **Immediately change it:**
   ```bash
   vercel env rm LANDING_PASSWORD production
   vercel env add LANDING_PASSWORD production
   ```
   (Enter new password when prompted)

2. **Redeploy:**
   ```bash
   vercel --prod
   ```

3. **Notify authorized users** of new password

### If API is being abused:

1. **Check logs** for abusive IPs:
   - Vercel Dashboard → Logs
   - Look for repeated 429 errors

2. **Consider temporary measures:**
   - Reduce rate limits in `/api/lib/rateLimit.ts`
   - Deploy updated limits
   - Consider Vercel Firewall (paid feature) to block IPs

3. **Long-term solutions:**
   - Implement API keys for trusted users
   - Add Cloudflare in front for DDoS protection
   - Migrate to Redis-based rate limiting (Upstash)

---

## 📋 Quick Reference

### Files Modified for Security:
- `/landing/middleware.ts` - Password protection
- `/landing/.env.example` - Environment variable template
- `/api/lib/rateLimit.ts` - Rate limiting logic (already existed)
- `/SECURITY-AUDIT.md` - Full security audit report

### Environment Variables:
| Variable | Purpose | Required | Where to Set |
|----------|---------|----------|--------------|
| `LANDING_PASSWORD` | Password-protect landing page | ⚠️ Pre-launch only | Vercel Dashboard |

### Rate Limits (Configured):
- **10 requests/minute** per IP
- **100 requests/hour** per IP
- Returns `429` when exceeded
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Security Headers (Recommended - Not Yet Implemented):
Add to `middleware.ts` or `next.config.ts`:
```typescript
{
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
}
```

---

## ✅ Launch Checklist

Before making the domain public:

- [ ] `LANDING_PASSWORD` set in Vercel
- [ ] Password tested (browser prompts for auth)
- [ ] API endpoints return 200 for valid requests
- [ ] Rate limiting returns 429 after 10 requests/min
- [ ] Error responses don't leak sensitive data
- [ ] Terms of Service visible on landing page
- [ ] Disclaimer banner visible at top
- [ ] GitHub repository is public
- [ ] npm package published (if ready)

**After all checks pass:** Remove `LANDING_PASSWORD` and redeploy for public launch.

---

**Need help?** See `/SECURITY-AUDIT.md` for detailed security analysis.
