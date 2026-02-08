# taxrates-us — Project Spec

## Overview
Open-source npm package + hosted API for accurate US sales tax rate lookups by address/ZIP code. Self-updating rate data sourced directly from state tax authorities (starting with California CDTFA).

## Value Proposition
- **Free npm package:** Self-hosted, zero API dependency, bundled rate data
- **Paid hosted API:** For developers who want convenience without self-hosting
- **Open source:** MIT license, verifiable rate data, community trust

## Competitive Positioning
- Cheaper than Ziptax, TaxJar, Avalara, Stripe Tax
- Open source (no competitor offers this)
- Self-hostable (no competitor offers this)
- Developer-first (npm install, one function call)

## Tech Stack
- **npm package:** TypeScript, zero dependencies, bundled JSON rate data
- **Hosted API:** Next.js on Vercel (serverless)
- **Database:** Supabase (API keys, usage tracking, billing)
- **Rate data:** CDTFA published files → parsed to JSON
- **Auto-update:** Vercel cron function fetches/validates/deploys quarterly

## npm Package (`taxrates-us`)
```typescript
import { getTaxRate } from 'taxrates-us';

const rate = getTaxRate({ state: 'CA', city: 'Los Angeles', zip: '90001' });
// { rate: 0.095, percentage: "9.50%", jurisdiction: "Los Angeles", state: "CA", components: { state: 0.0725, county: 0.0025, city: 0.01, district: 0.0 }, source: "CDTFA", effectiveDate: "2026-01-01" }
```

### Features
- Zero dependencies
- Works offline (bundled data)
- TypeScript native
- All 12,000+ US jurisdictions (starting with CA, expanding state by state)
- Returns rate components (state, county, city, district)
- Source attribution + effective date on every response
- Auto-update CLI command: `npx taxrates-us update` (fetches latest rates)

## Hosted API
**Base URL:** `https://taxrates-us.vercel.app/api` (then custom domain later)

### Endpoints
- `GET /api/rate?state=CA&city=Los+Angeles&zip=90001` — returns tax rate
- `GET /api/rate?address=123+Main+St,+Los+Angeles,+CA+90001` — full address lookup
- `GET /api/states` — list of supported states + last update dates
- `GET /api/status` — API health + data freshness

### Auth
- API key required (header: `X-API-Key`)
- Free tier: 100 calls/month
- Paid tiers: TBD ($5-9/mo range)

### Response Format
```json
{
  "rate": 0.095,
  "percentage": "9.50%",
  "jurisdiction": "Los Angeles",
  "state": "CA",
  "components": {
    "state": 0.0725,
    "county": 0.0025,
    "city": 0.01,
    "district": 0.0
  },
  "source": "California CDTFA",
  "effectiveDate": "2026-01-01",
  "lastVerified": "2026-02-08T00:00:00Z"
}
```

## Landing Page / Site
- What it does + why it's different (open source, self-hostable)
- Live demo (enter address → see rate)
- Pricing (free tier + paid)
- API docs with code samples (curl, Node.js, Python)
- Sign up / API key generation
- Usage dashboard

## Rate Data Pipeline
1. Scheduled function fetches CDTFA rate files (quarterly, or daily check)
2. Parse into standardized JSON format
3. Validate: anomaly detection + component math + known-address test suite
4. If all tests pass → update bundled data + deploy
5. If any test fails → hold + alert for manual review
6. Publish new npm version with updated data

## Rollout Plan
### Phase 1 — California MVP
- CDTFA data parsed + bundled
- npm package works for CA
- Hosted API works for CA
- Landing page live
- All other states return `{ supported: false }`

### Phase 2 — Expand States
- Add states with public rate APIs/files (TX, FL, NY, WA, etc.)
- Prioritize by ecommerce volume
- SST (Streamlined Sales Tax) participating states as a batch

### Phase 3 — Growth
- All 50 states + DC
- Webhook notifications for rate changes
- Premium features (bulk lookup, CSV upload, historical rates)

## npm Account
- Username: mrpartner
- Package name: taxrates-us

## GitHub
- Repo: mrpartnerai/taxrates-us (to be created)
- Public repo (open source, MIT license)

## Legal
- MIT license (npm package)
- ToS for hosted API (liability limited to amount paid)
- Disclaimer: "Rates sourced from official state tax authorities. For informational purposes only. Not tax advice."
- No E&O insurance initially (revisit at scale)
