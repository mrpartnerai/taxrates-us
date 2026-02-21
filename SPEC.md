# SPEC: taxrates-us

## Overview
Open-source npm package + hosted API for **accurate US sales tax rate lookups** by address/ZIP code. Self-updating rate data sourced directly from state tax authorities. Zero tolerance accuracy policy ensures production-ready reliability. Self-hostable with zero dependencies or use our hosted API for convenience.

**Mission:** Democratize access to accurate tax data. Make sales tax calculation free, transparent, and developer-friendly.

## Goals & Success Criteria
- [x] CA tax rates working (17 tests passing, npm package core built)
- [ ] All 50 states + DC coverage within 6 months
- [ ] Zero false rates in production (100% accuracy requirement)
- [ ] 1,000+ npm downloads/month by Q2 2026
- [ ] Hosted API revenue: $500/month MRR by Q3 2026
- [ ] MCP server integration for AI agents
- [ ] Self-hosting docs with <10 minute setup time

## Users / Audience

**Primary:**
- E-commerce developers (Shopify, WooCommerce, custom stores)
- Accounting/invoicing SaaS builders
- Mobile app developers with checkout flows
- AI agents needing tax rate context (via MCP)

**Secondary:**
- Finance teams validating vendor tax calculations
- Researchers analyzing US tax policy
- Open source enthusiasts contributing state parsers

## Zero Tolerance Accuracy Policy

**Philosophy:** A wrong tax rate is worse than no tax rate. Production systems can't afford "close enough."

**Implementation:**
1. **Source Truth:** Only official state tax authority data (no scraped or third-party aggregators)
2. **Validation Pipeline:** Every rate update must pass:
   - Component math verification (state + county + city + district = total)
   - Anomaly detection (flag >0.5% changes from previous rate)
   - Known-address test suite (100+ hand-verified locations)
   - Range bounds (0% ≤ total ≤ 15%, no negative components)
3. **Manual Review Gate:** Failed validation blocks auto-deploy, alerts human for investigation
4. **Rollback Capability:** Bad data never reaches npm/API. Previous known-good version stays live.
5. **Transparency:** Every response includes `source`, `effectiveDate`, `lastVerified` so users can audit
6. **Community Verification:** Open issue template for reporting incorrect rates (24h SLA for investigation)

**Trade-offs:**
- Slower expansion (can't add states without reliable source)
- More complex pipeline (validation suite maintenance)
- Worth it: trust is the entire value proposition

## Value Proposition

**vs Competitors (TaxJar, Avalara, Stripe Tax, Ziptax):**
- **Open Source:** MIT licensed, auditable code + data (no competitor offers this)
- **Self-Hostable:** Run entirely offline, zero API calls (no competitor offers this)
- **Price:** Free for self-hosting, $9/mo for API vs $19-99/mo competitors
- **Developer UX:** `npm install` → one function call, no SDKs or complex integrations
- **Accuracy Transparency:** Source attribution + effective dates on every response
- **No Lock-In:** Export your data, run your own API, switch anytime

## Business Model

### Free Tier (npm Package)
- MIT licensed, unlimited use
- Self-hosted, zero runtime dependencies
- Bundled rate data (updated quarterly)
- Manual updates: `npx taxrates-us update`
- Rate limiting: none (runs locally)
- Support: GitHub Issues (community best-effort)

**Revenue Impact:** Loss leader. Drives adoption, trust, and hosted API conversions.

### Paid Tier (Hosted API)
**Pricing:**
- **Developer**: $9/mo — 10K requests/month, email support, 99.5% uptime SLA
- **Business**: $29/mo — 100K requests/month, priority support, 99.9% uptime SLA, webhooks
- **Enterprise**: Custom — unlimited requests, dedicated support, on-prem deployment, SLA negotiations

**Why developers pay despite free option:**
- **Convenience:** No server maintenance, auto-updates, global CDN
- **Real-time updates:** API reflects rate changes within 24h (npm is quarterly)
- **Webhooks:** Get notified when rates change in your active jurisdictions
- **Compliance:** Verifiable audit trail for tax calculation sources
- **Scale:** No bundling costs or update orchestration for microservices

**Conversion Strategy:**
- Landing page demo shows both options side-by-side
- npm README includes "Upgrade to API" section after self-hosting instructions
- Free tier is 1K requests/month (lets small projects start, forces growth to paid)

## Tech Stack

### npm Package
- **Language:** TypeScript (compiled to CJS + ESM)
- **Runtime:** Node.js 18+ (zero dependencies)
- **Data Format:** Bundled JSON (embedded in package, ~2MB compressed)
- **Build Tool:** tsc + rollup
- **Testing:** Vitest (17 tests passing, targeting 90%+ coverage)
- **Package Manager:** npm (published to public registry)

### Hosted API
- **Framework:** Next.js 15 (App Router, serverless functions)
- **Hosting:** Vercel (edge functions for <50ms responses)
- **Database:** Supabase Postgres (API keys, usage tracking, billing)
- **Auth:** API key header (`X-API-Key`)
- **Rate Limiting:** Vercel edge middleware (per-key quotas)
- **Monitoring:** Vercel Analytics + Sentry (error tracking)
- **CDN:** Vercel global edge network

### MCP Server
- **Protocol:** Model Context Protocol (Anthropic spec)
- **Transport:** stdio (local tool) + SSE (hosted tool)
- **Tools Exposed:**
  - `get_tax_rate(address)` — lookup tax rate by full address
  - `get_tax_rate_by_zip(zip, city?, state?)` — lookup by ZIP code
  - `list_supported_states()` — show coverage + last update dates
  - `verify_rate(address, expected_rate)` — validate external rate calculations
- **Use Cases:** Claude/GPT agents calculating invoice totals, tax advice chatbots, financial planning tools
- **Installation:** `npx @modelcontextprotocol/server-taxrates-us`

### Auto-Update Pipeline (Hybrid Approach)
**Philosophy:** Automate the common case (quarterly updates), require human judgment for anomalies.

**Pipeline Stages:**
1. **Fetch** (daily check, 3am PST)
   - Poll state tax authority websites for new rate files
   - Download if modified-since header changed or version number incremented
   - Store raw files in `data/raw/{state}/{date}/`

2. **Parse** (triggered by new fetch)
   - State-specific parsers (TX uses CSV, CA uses fixed-width, FL uses XML, etc.)
   - Normalize to standard schema: `{ jurisdiction, state, zip, city, county, rate, components, effectiveDate }`
   - Write to `data/parsed/{state}.json`

3. **Validate** (after parse)
   - **Component Math:** Verify `state + county + city + district = rate` (±0.0001 tolerance for rounding)
   - **Range Check:** 0% ≤ rate ≤ 15%, all components ≥ 0%
   - **Anomaly Detection:** Flag rates changed >0.5% from previous version
   - **Test Suite:** 100+ known addresses with hand-verified rates (e.g., Apple Park, Disneyland, Times Square)
   - **Diff Report:** Generate markdown showing all changes (new jurisdictions, rate changes, removals)

4. **Review Gate**
   - **Auto-pass:** Validation clean + no anomalies detected → proceed to deploy
   - **Human Review:** Validation failures or anomalies → Slack alert with diff report, await approval
   - **Rollback:** Bad data rejected, previous version stays live, incident logged

5. **Deploy** (after review gate)
   - Commit new JSON to `main` branch
   - Bump npm package version (patch for data updates, minor for new states)
   - Publish to npm registry (`npm publish`)
   - Trigger Vercel redeploy (API serves new data within 60s)
   - Post-deploy smoke test (hit 10 test addresses, verify responses)

6. **Notify** (after deploy)
   - Webhook to paid API customers: "CA rates updated (43 jurisdictions changed)"
   - GitHub release notes with diff summary
   - Twitter/blog post for major milestones (new state added, 1M requests served, etc.)

**Hybrid Approach:** Automated fetching + parsing + validation, but humans approve deploys when anomalies detected. This prevents silent breakage while minimizing toil.

**Rollout Schedule:**
- **Phase 1 (Weeks 1-2):** CA only, quarterly manual updates
- **Phase 2 (Weeks 3-6):** Add TX, FL, NY, WA — top 5 ecommerce states
- **Phase 3 (Months 2-3):** SST (Streamlined Sales Tax) 24 states via single API
- **Phase 4 (Months 4-6):** Remaining states, transition to automated pipeline

## TheAnswerIsJesus (TAIJ) Integration

**Context:** TheAnswerIsJesus is a Christian apparel e-commerce store (Next.js, Vercel, Cloudflare R2). Currently uses hardcoded 9.5% CA sales tax. Needs accurate multi-state rates for compliance.

**Integration Points:**
1. **Checkout Flow** (`app/api/checkout/route.ts`)
   - Replace hardcoded `0.095` with `getTaxRate()` call
   - Pass customer address from Stripe checkout
   - Display itemized tax breakdown: state + county + city + district

2. **Orders Backend** (`app/api/orders/route.ts`)
   - Store calculated tax rate + components in order record
   - Include `source`, `effectiveDate` for audit trail

3. **Admin Dashboard** (`app/admin/orders/page.tsx`)
   - Show tax calculation source on order details page
   - Flag orders with non-standard rates for review

4. **Packing Slip** (generated in orders API)
   - Print full tax breakdown with jurisdiction name
   - Include disclaimer: "Tax rate as of {effectiveDate} per {source}"

**Implementation:**
```typescript
// Before (hardcoded)
const tax = subtotal * 0.095;

// After (dynamic)
import { getTaxRate } from 'taxrates-us';

const { rate, components, source, effectiveDate } = getTaxRate({
  state: order.shippingAddress.state,
  city: order.shippingAddress.city,
  zip: order.shippingAddress.zip
});

const tax = subtotal * rate;
```

**Migration Plan:**
1. Add `taxrates-us` to TAIJ dependencies
2. Update checkout API to call `getTaxRate()`
3. Update order schema to store tax components
4. Update admin UI to display source attribution
5. Deploy to staging, test with 10 sample addresses
6. Deploy to production with feature flag (gradual rollout)

**Compliance Benefit:** TAIJ can now say "tax rates sourced directly from [state] Department of Revenue" instead of "we guessed 9.5%."

## Architecture

### Data Flow

**npm Package (Local Lookup):**
```
User Code
  └─> getTaxRate({ state, city, zip })
        └─> Load bundled JSON (cached in memory after first call)
        └─> Match jurisdiction by state+city or state+zip
        └─> Return rate + components + metadata
```

**Hosted API (Remote Lookup):**
```
Client Request (REST)
  └─> Vercel Edge Function
        └─> Validate API key (check Supabase)
        └─> Rate limit check (Redis)
        └─> Query tax data (in-memory JSON or Postgres)
        └─> Log request (async, non-blocking)
        └─> Return rate + components + metadata
```

**MCP Server (Tool Call):**
```
AI Agent (Claude/GPT)
  └─> MCP Tool Call: get_tax_rate(address)
        └─> Parse address string → components
        └─> Call getTaxRate() (local package)
        └─> Format response for agent context
        └─> Return structured data
```

**Auto-Update Pipeline:**
```
Vercel Cron (daily 3am PST)
  └─> Fetch state tax files
        └─> Parse → Validate → Review Gate
              └─> [Auto] Clean validation → Deploy
              └─> [Manual] Anomalies detected → Slack alert → Human approval → Deploy
                    └─> npm publish + Vercel redeploy + Webhook notify
```

### Data Model

**Core Schema (JSON):**
```typescript
interface TaxRate {
  jurisdiction: string;      // "Los Angeles"
  state: string;             // "CA"
  zip?: string;              // "90001" (optional, for ZIP-based states)
  city?: string;             // "Los Angeles" (optional, for city-based states)
  county?: string;           // "Los Angeles County"
  rate: number;              // 0.0950 (decimal)
  components: {
    state: number;           // 0.0725
    county: number;          // 0.0025
    city: number;            // 0.0100
    district: number;        // 0.0000
  };
  source: string;            // "California CDTFA"
  effectiveDate: string;     // "2026-01-01" (ISO date)
  lastVerified: string;      // "2026-02-08T08:00:00Z" (ISO datetime)
}
```

**Database Schema (Supabase):**
```sql
-- API Keys
CREATE TABLE api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  tier text NOT NULL,  -- 'free' | 'developer' | 'business' | 'enterprise'
  monthly_quota integer NOT NULL,
  requests_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Usage Logs (for billing + analytics)
CREATE TABLE api_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid REFERENCES api_keys(id),
  endpoint text NOT NULL,
  state text,
  zip text,
  response_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Webhook Subscriptions
CREATE TABLE webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid REFERENCES api_keys(id),
  url text NOT NULL,
  states text[],  -- null = all states, or ['CA', 'TX'] = specific
  created_at timestamptz DEFAULT now()
);
```

### API Surface

**Base URL:** `https://api.taxrates.dev` (future custom domain)  
**Current:** `https://taxrates-us.vercel.app`

**Authentication:** Header `X-API-Key: your_key_here`

**Endpoints:**

#### `GET /api/v1/rate`
Lookup tax rate by address components or full address string.

**Query Params:**
- `state` (required) — 2-letter code (e.g., `CA`)
- `city` (optional) — City name (e.g., `Los Angeles`)
- `zip` (optional) — 5-digit ZIP (e.g., `90001`)
- `address` (optional) — Full address string (overrides other params)

**Example Request:**
```bash
curl -H "X-API-Key: sk_live_..." \
  "https://api.taxrates.dev/api/v1/rate?state=CA&city=Los+Angeles&zip=90001"
```

**Example Response (200 OK):**
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
  "lastVerified": "2026-02-08T08:00:00Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "missing_state",
  "message": "State parameter is required"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "jurisdiction_not_found",
  "message": "No tax rate found for CA, Los Angeles, 90001. State may not be supported yet.",
  "supportedStates": ["CA"]
}
```

#### `GET /api/v1/states`
List supported states with coverage metadata.

**Example Response (200 OK):**
```json
{
  "states": [
    {
      "code": "CA",
      "name": "California",
      "jurisdictions": 546,
      "source": "CDTFA",
      "lastUpdated": "2026-02-08T08:00:00Z",
      "effectiveDate": "2026-01-01",
      "coverage": "complete"
    }
  ],
  "total": 1,
  "lastGlobalUpdate": "2026-02-08T08:00:00Z"
}
```

#### `GET /api/v1/status`
API health check + system status.

**Example Response (200 OK):**
```json
{
  "status": "operational",
  "version": "1.2.3",
  "dataVersion": "2026.02.08",
  "uptime": 99.97,
  "latency": {
    "p50": 12,
    "p95": 34,
    "p99": 67
  },
  "statesSupported": 1,
  "totalJurisdictions": 546
}
```

#### `POST /api/v1/webhook` (Business+ tier)
Register webhook for rate change notifications.

**Request Body:**
```json
{
  "url": "https://yourapp.com/webhooks/tax-rates",
  "states": ["CA", "TX"],  // null = all states
  "events": ["rate_changed", "state_added"]
}
```

**Webhook Payload (on rate change):**
```json
{
  "event": "rate_changed",
  "state": "CA",
  "jurisdiction": "Los Angeles",
  "oldRate": 0.095,
  "newRate": 0.0975,
  "effectiveDate": "2026-04-01",
  "timestamp": "2026-03-25T10:00:00Z"
}
```

#### `GET /api/v1/bulk` (Business+ tier)
Batch lookup for multiple addresses (up to 100 per request).

**Request Body:**
```json
{
  "addresses": [
    { "state": "CA", "city": "Los Angeles", "zip": "90001" },
    { "state": "CA", "city": "San Francisco", "zip": "94102" },
    { "state": "TX", "city": "Austin", "zip": "78701" }
  ]
}
```

**Response:**
```json
{
  "results": [
    { "index": 0, "rate": 0.095, ...components },
    { "index": 1, "rate": 0.08625, ...components },
    { "index": 2, "error": "state_not_supported" }
  ]
}
```

## Self-Hosting Guide

**Why Self-Host:**
- Zero runtime costs (no API fees)
- Works offline (bundled data)
- Full data control (export, audit, customize)
- No rate limits
- No external dependencies (privacy/compliance)

**Setup (< 10 minutes):**

1. **Install Package:**
```bash
npm install taxrates-us
```

2. **Basic Usage:**
```typescript
import { getTaxRate } from 'taxrates-us';

const rate = getTaxRate({
  state: 'CA',
  city: 'Los Angeles',
  zip: '90001'
});

console.log(`Tax rate: ${rate.percentage}`);
// Tax rate: 9.50%
```

3. **Update Data (Quarterly):**
```bash
npx taxrates-us update
# Fetches latest rates from npm registry, updates local package
```

4. **Run Your Own API (Optional):**
```bash
git clone https://github.com/mrpartnerai/taxrates-us.git
cd taxrates-us/api
npm install
npm run dev
# API now running on http://localhost:3000
```

5. **Deploy Your API (Optional):**
```bash
# Vercel
vercel deploy

# Docker
docker build -t taxrates-api .
docker run -p 3000:3000 taxrates-api

# Any Node.js host
npm run build
npm start
```

**Self-Hosting Support:**
- Documentation: `docs/self-hosting.md`
- Discord community: [invite link]
- GitHub Discussions for troubleshooting
- No paid support (API customers only)

**Trade-offs vs Hosted API:**
- ✅ Free, private, fast, offline-capable
- ❌ Manual quarterly updates (vs real-time)
- ❌ No webhooks or rate change notifications
- ❌ You manage hosting/scaling for API tier

## Tasks (Ordered)

### Phase 1: Foundation (Weeks 1-2) ✅ COMPLETE
- [x] CDTFA data research + parsing
- [x] npm package core (`getTaxRate()` function)
- [x] TypeScript types + tests (17 passing)
- [x] GitHub repo (public, MIT license)
- [x] README with installation + usage
- [x] CA data bundled + working

### Phase 2: API Layer (Weeks 2-3)
- [ ] Next.js API routes (`/api/v1/rate`, `/api/v1/states`, `/api/v1/status`)
- [ ] Supabase setup (API keys table, usage tracking)
- [ ] API key authentication middleware
- [ ] Rate limiting (Vercel edge)
- [ ] Error handling + validation
- [ ] Deploy to Vercel (staging environment)
- [ ] Integration tests (Vitest + Playwright)

### Phase 3: Landing Page (Week 3)
- [ ] Homepage (what + why + demo)
- [ ] Pricing page (free vs paid tiers)
- [ ] API docs (interactive, copy-paste examples)
- [ ] Sign up flow (Supabase Auth)
- [ ] API key generation + dashboard
- [ ] Usage stats display (requests used / quota)

### Phase 4: Multi-State Expansion (Weeks 4-6)
- [ ] Add TX (CSV parser, 1,700+ jurisdictions)
- [ ] Add FL (XML parser, 400+ jurisdictions)
- [ ] Add NY (PDF parser + fallback to manual entry)
- [ ] Add WA (API integration with DOR)
- [ ] SST integration (24 states via single API)
- [ ] Test suite expansion (10+ addresses per state)

### Phase 5: Auto-Update Pipeline (Weeks 6-8)
- [ ] Vercel cron job (daily fetch)
- [ ] State-specific parsers (pluggable architecture)
- [ ] Validation suite (component math, anomaly detection, test addresses)
- [ ] Review gate (Slack alerts, approval workflow)
- [ ] Auto-deploy to npm + Vercel
- [ ] Webhook notifications for paid users
- [ ] Monitoring + alerting (Sentry)

### Phase 6: MCP Server (Week 8)
- [ ] MCP protocol implementation (stdio transport)
- [ ] Tool definitions (`get_tax_rate`, `list_supported_states`, etc.)
- [ ] SSE transport for hosted tool version
- [ ] Documentation for Claude/GPT integration
- [ ] Example prompts ("calculate tax for invoice")
- [ ] Publish to MCP registry

### Phase 7: TAIJ Integration (Week 9)
- [ ] Replace hardcoded tax rate in checkout
- [ ] Update order schema (store components + source)
- [ ] Admin UI updates (show tax breakdown)
- [ ] Packing slip generation (itemized tax)
- [ ] Staging tests (10 sample orders)
- [ ] Production deployment (feature flag rollout)

### Phase 8: Growth & Scale (Months 3-6)
- [ ] All 50 states + DC coverage
- [ ] Bulk lookup endpoint (100 addresses/request)
- [ ] Historical rates API (for audits/refunds)
- [ ] CSV upload tool (batch address validation)
- [ ] Premium support tier (SLA + phone support)
- [ ] Marketing: blog posts, dev.to articles, HN launch
- [ ] Partnerships: Stripe apps, Shopify app store

## Dependencies & Blockers

### External Dependencies
- ⚠️ **State Tax Authority APIs** — Some states don't publish machine-readable data (requires manual parsing or scraping)
- ⚠️ **Supabase Account** — Free tier sufficient for MVP, need paid plan at 100K users
- ⚠️ **Vercel Pro** — Free tier works for MVP, need Pro ($20/mo) for production SLAs
- ⚠️ **Custom Domain** — `api.taxrates.dev` (need to purchase + configure DNS)
- ⚠️ **npm Account** — Already have `mrpartner` account, need 2FA enabled for publishing

### Sequential Dependencies
- ⚠️ **API Layer → Landing Page** — Need working API endpoints before building docs/demo
- ⚠️ **Landing Page → Billing** — Need sign-up flow before usage tracking matters
- ⚠️ **Multi-State Data → Auto-Update** — Need 3+ states to validate pipeline generalization
- ⚠️ **Validation Suite → Auto-Deploy** — Can't trust automation without comprehensive tests

### High-Risk Items
- 🔴 **State Data Format Changes** — Tax authorities can change file formats without notice (need fallback parsers)
- 🔴 **Rate Accuracy Bugs** — A single wrong rate could cause customer financial harm (zero tolerance policy)
- 🔴 **API Key Leaks** — Need rate limiting + key rotation to prevent abuse
- 🔴 **Legal Liability** — Disclaimer + ToS required before public launch (not tax advice, informational only)

## Boundaries

### ✅ Always
- **Source attribution:** Every response includes `source` + `effectiveDate` + `lastVerified`
- **Validation before deploy:** No auto-deploy without passing validation suite
- **Open source:** All code + data in public GitHub repo (except API keys)
- **Semantic versioning:** Patch = data updates, minor = new states, major = breaking changes
- **Zero dependencies:** npm package has no runtime deps (TypeScript dev deps only)
- **TypeScript strict mode:** No `any` types, full type safety
- **Test coverage:** 90%+ for core logic, 100% for tax calculation functions
- **Documentation:** Every endpoint, function, and error code documented with examples

### ⚠️ Ask First
- **New state without official data source** — Don't add if data quality is questionable
- **Breaking API changes** — Discuss versioning strategy (v1 → v2 migration path)
- **Paid tier pricing changes** — Need market research + competitor analysis
- **Third-party integrations** — Zapier, Make, etc. need partnership agreements
- **Marketing spend** — Any paid ads, sponsorships, or promotional costs
- **Legal review** — ToS updates, liability disclaimers, compliance requirements

### 🚫 Never
- **Scraped data without verification** — If we can't verify accuracy, don't include it
- **Hardcoded rates** — All rates must come from bundled JSON (no magic numbers)
- **Breaking changes without migration path** — v1 API stays live during v2 transition
- **Logging sensitive data** — Never log full addresses, only state+city+zip
- **Storing customer data** — No PII in our database (addresses are transient in requests)
- **Selling user data** — Open source + privacy-first, no data monetization
- **Closed-source premium version** — If it's built, it's MIT licensed

## Testing Strategy

### Unit Tests (Vitest)
- **Location:** `src/__tests__/`
- **Coverage Target:** 90%+ overall, 100% for tax calculation logic
- **Run:** `npm test`
- **Current Status:** 17 tests passing (CA only)

**Test Categories:**
- Tax calculation accuracy (known addresses)
- Component math validation (state + county + city + district = total)
- Error handling (missing state, unsupported jurisdiction)
- Edge cases (APO/FPO addresses, tribal lands, unincorporated areas)

### Integration Tests (Vitest + Playwright)
- **Location:** `tests/integration/`
- **Coverage:** API endpoints, auth flow, rate limiting, error responses
- **Run:** `npm run test:integration`

**Test Scenarios:**
- Valid API key → 200 response with rate
- Invalid API key → 401 unauthorized
- Missing state param → 400 bad request
- Rate limit exceeded → 429 too many requests
- Unsupported state → 404 not found

### Validation Suite (Auto-Update Pipeline)
- **Location:** `scripts/validate.ts`
- **Run:** Automatically in pipeline, manually via `npm run validate`

**Checks:**
1. Component math (rate = sum of components)
2. Range bounds (0% ≤ rate ≤ 15%)
3. Anomaly detection (flag >0.5% changes)
4. Known-address test (100+ hand-verified locations)
5. Jurisdiction coverage (no missing ZIP codes in supported states)

### Manual Verification
- [ ] Test all API endpoints in Postman/Insomnia
- [ ] Verify landing page on mobile + desktop
- [ ] Sign up flow with real email
- [ ] Rate limit testing (exceed quota, verify 429 response)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Accessibility audit (WCAG 2.1 AA compliance)

### Continuous Testing
- **Pre-commit:** Lint + type check (Husky hook)
- **PR checks:** Unit tests + integration tests (GitHub Actions)
- **Daily:** Smoke tests against production API (Vercel cron)
- **Quarterly:** Full manual audit of top 100 jurisdictions

## Commands

```bash
# Development
npm install              # Install dependencies
npm run dev             # Start Next.js dev server (API + landing page)
npm test                # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:integration # Run integration tests

# Building
npm run build           # Build npm package + API
npm run build:package   # Build npm package only
npm run build:api       # Build Next.js API only

# Data Pipeline
npm run fetch           # Fetch latest state data
npm run parse           # Parse raw data → JSON
npm run validate        # Run validation suite
npm run deploy-data     # Publish to npm + trigger Vercel redeploy

# Testing
npm run lint            # ESLint + Prettier
npm run type-check      # TypeScript compiler check
npm run validate-rates  # Run rate validation suite
npm run test:e2e        # End-to-end Playwright tests

# Deployment
npm run deploy          # Deploy API to Vercel
npm publish             # Publish npm package
vercel --prod           # Deploy to production

# Maintenance
npm run update-deps     # Update dependencies (interactive)
npm audit fix           # Fix security vulnerabilities
npm run clean           # Remove build artifacts + node_modules
```

## Success Metrics (6-Month Targets)

**Adoption:**
- 1,000+ npm downloads/month
- 500+ hosted API users
- 50+ GitHub stars
- 10+ community contributors

**Revenue:**
- $500/month MRR (50 Developer tier @ $9/mo + 5 Business @ $30/mo)
- 90%+ monthly retention
- <5% churn rate

**Quality:**
- Zero reported accuracy bugs in production
- 99.9%+ API uptime
- <50ms p95 response time
- 100% state coverage (50 states + DC)

**Community:**
- 100+ Discord members
- 20+ GitHub issues/PRs per month
- 5+ blog posts/tutorials from community
- Featured in at least one major dev publication (HN front page, dev.to trending, etc.)

## Future Roadmap (6-12 Months)

**Features:**
- International support (Canada, EU VAT)
- Historical rates API (for refunds/audits)
- ZIP+4 precision (9-digit ZIP codes)
- Address validation + autocomplete
- Tax nexus calculator (where you owe tax)
- Quarterly rate change summaries (email digest)

**Integrations:**
- Shopify app
- Stripe Tax alternative
- WooCommerce plugin
- Zapier/Make connectors
- Accounting software APIs (QuickBooks, Xero)

**Scale:**
- Multi-region deployment (US, EU, Asia)
- Enterprise on-prem version
- Dedicated support SLA
- White-label licensing
- Reseller partnerships

---

**Last Updated:** 2026-02-10  
**Version:** 2.0 (Comprehensive Spec)  
**Status:** Phase 1 Complete, Phase 2 In Progress
