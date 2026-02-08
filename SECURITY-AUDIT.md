# Security Audit Report
**Project:** taxrates-us  
**Date:** 2026-02-08  
**Audited By:** OpenClaw Agent  
**Stack:** (Planned: Next.js 15, TypeScript, Supabase, Vercel)

---

## Executive Summary
**taxrates-us is not yet built.** The project currently consists of planning documents only (SPEC.md, ROADMAP.md, data files). No code exists to audit.

---

## Current State

### Files Present
- `SPEC.md` — Product specification
- `ROADMAP.md` — Development roadmap
- `data/` — Raw rate data files (California CDTFA)

### No Security Concerns
Since no application code exists, there are:
- ❌ No exposed secrets (no codebase)
- ❌ No npm dependencies (no package.json)
- ❌ No API routes (not built)
- ❌ No database (not connected)
- ❌ No git history to audit (repo is empty specs)

---

## Recommendations for Future Development

When building taxrates-us, consider these security best practices from the start:

### 1. Authentication & API Keys
- Implement API key auth with proper hashing (bcrypt or SHA-256)
- Use `X-API-Key` header for all endpoints
- Store keys in Supabase with RLS policies
- Provide key rotation mechanism

### 2. Rate Limiting
- **Critical** for public API — prevents abuse and DoS
- Use Vercel Edge middleware or Upstash Redis
- Suggested limits:
  - Free tier: 100 requests/month (tracked in DB)
  - Paid tier: Higher limits based on plan
  - Burst protection: 10 requests/second max per key

### 3. Input Validation
- Sanitize all address/ZIP inputs (prevent injection)
- Validate state codes (2-letter uppercase only)
- Limit query string lengths
- Return 400 for malformed requests

### 4. Security Headers
- Add CSP, X-Frame-Options, X-Content-Type-Options from day one
- Use restrictive CSP (no `unsafe-inline` or `unsafe-eval` if possible)

### 5. Environment Variables
- Use Vercel environment variables for secrets
- **Never** commit Supabase service role key, payment API keys, etc.
- Prefix client-safe vars with `NEXT_PUBLIC_`

### 6. Data Integrity
- Sign rate data bundles (prevent tampering)
- Validate rate math: `state + county + city + district = total`
- Test suite with known addresses before deploying updates

### 7. npm Package Security
- No dependencies (as spec'd — good!)
- Sign npm releases with 2FA-enabled account
- Include integrity checks in bundled data

### 8. Open Source Considerations
- MIT license (as planned)
- Clear disclaimer about rate accuracy
- Public issue tracker for rate errors
- No secrets in public repo (use GitHub Secrets for CI/CD)

### 9. Monitoring & Logging
- Log API key usage (for abuse detection)
- Alert on unusual rate data changes
- Track failed auth attempts

### 10. Compliance
- ToS with liability limits (as planned)
- GDPR considerations if serving EU users
- No PII collected (address lookups are anonymous)

---

## Overall Risk: ⚪ N/A (Not Built)

**Next Steps:**
1. Initialize Next.js project
2. Implement authentication and rate limiting first
3. Set up Supabase with RLS
4. Add security headers
5. Write comprehensive tests
6. Re-run this audit on the completed codebase

---

**When the project is built, re-run this security audit to verify all recommendations were implemented.**
