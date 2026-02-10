# Password Protection Setup

The landing page is currently **publicly accessible**. Follow these steps to add password protection:

## Method 1: Vercel Deployment Protection (Recommended)

This is the simplest approach and requires no code changes.

### Steps:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the **taxrates-us** project
3. Click **Settings** → **Deployment Protection**
4. Choose one of these options:

   **Option A: Vercel Authentication**
   - Toggle "Vercel Authentication" ON
   - Only logged-in Vercel users with project access can view the site
   - Best for team-only access

   **Option B: Password Protection**
   - Toggle "Password Protection" ON
   - Set a custom password
   - Share password with authorized viewers
   - **Best for this use case** (simple, secure, shareable)

5. Save changes
6. The protection applies to all deployments immediately

### Recommended Settings:
- **Enable:** Password Protection
- **Password:** Choose a strong password (e.g., `taxrates2026preview!`)
- **Share password with:** Mitch + authorized viewers only

## Method 2: Middleware-Based Protection

If you prefer code-based protection, add this middleware:

### Create `middleware.ts`:

```typescript
// landing/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PASSWORD = process.env.SITE_PASSWORD || 'changeme';

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Protected Area"',
      },
    });
  }

  const [scheme, encoded] = authHeader.split(' ');
  
  if (scheme !== 'Basic') {
    return new NextResponse('Invalid authentication scheme', {
      status: 401,
    });
  }

  const credentials = Buffer.from(encoded, 'base64').toString();
  const [username, password] = credentials.split(':');
  
  if (password !== PROTECTED_PASSWORD) {
    return new NextResponse('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Protected Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/(.*)',
};
```

### Set Environment Variable in Vercel:

1. Go to Project Settings → Environment Variables
2. Add: `SITE_PASSWORD` = `your_secure_password`
3. Redeploy

## Method 3: IP Allowlist

For restricted IP access:

1. Go to Project Settings → Deployment Protection
2. Enable "IP Address Allowlist"
3. Add allowed IP addresses

## Current Status

✅ **Deployed:** https://taxrates-us.vercel.app  
❌ **Password Protection:** Not enabled (publicly accessible)

**Action Required:** Enable password protection via Vercel Dashboard (Method 1, Option B)

## Testing Password Protection

After enabling:

1. Visit https://taxrates-us.vercel.app
2. Browser should prompt for password
3. Enter the configured password
4. Landing page should load

## Disabling Protection (for public launch)

When ready to go public:
1. Go to Vercel Dashboard → Settings → Deployment Protection
2. Toggle OFF "Password Protection"
3. Site becomes publicly accessible

---

**Recommendation:** Use Method 1, Option B (Password Protection) for now. It's the simplest, requires no code changes, and can be toggled off instantly when you're ready to go public.
