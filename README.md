# taxrates-us

[![npm version](https://badge.fury.io/js/taxrates-us.svg)](https://www.npmjs.com/package/taxrates-us)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Accurate US sales tax rate lookups — 7 states and growing**

Open-source npm package and hosted API for looking up sales tax rates. Self-hosted with bundled rate data, zero external API dependencies, and works completely offline.

🌐 **[View Landing Page](https://taxrates-us.vercel.app)** | 📦 **[npm Package](https://www.npmjs.com/package/taxrates-us)** | 🔗 **[API Docs](https://taxrates-us.vercel.app/api)**

## Features

✅ **Zero dependencies** — Pure TypeScript, no external runtime deps  
✅ **Works offline** — Tax rate data bundled with the package  
✅ **TypeScript native** — Full type safety and IntelliSense support  
✅ **7 states supported** — CA (546 jurisdictions), TX, NY, FL, WA, NV, OR  
✅ **Hosted API** — Vercel serverless endpoints (optional)  
✅ **Auto-detect state** — From ZIP code prefix  
✅ **Source attribution** — All rates from official state tax authorities  
✅ **Open source** — MIT licensed, verifiable data

## Installation

```bash
npm install taxrates-us
```

## Quick Start

### NPM Package

```typescript
import { getTaxRate } from 'taxrates-us';

// Auto-detect state from ZIP code
const rate = getTaxRate({ zip: '90210' });
console.log(rate.percentage); // "9.50%" (Beverly Hills, CA)
console.log(rate.state);      // "CA"

// Explicit state lookup
const txRate = getTaxRate({ state: 'TX' });
console.log(txRate.percentage); // "6.25%"

// California city lookup (546 jurisdictions)
const sf = getTaxRate({ state: 'CA', city: 'San Francisco' });
console.log(sf.percentage); // "8.625%"
```

### Hosted API

```bash
# Get tax rate by ZIP code
curl "https://taxrates-us.vercel.app/api/rate?zip=90210"

# Get tax rate by state
curl "https://taxrates-us.vercel.app/api/rate?state=TX"

# List supported states
curl "https://taxrates-us.vercel.app/api/states"
```

## Supported States

| State | Code | Base Rate | Jurisdictions | Details |
|-------|------|-----------|---------------|---------|
| **California** | CA | 7.25% | 546 | Cities, counties, unincorporated areas |
| **Texas** | TX | 6.25% | 9 | Major cities (Houston, Dallas, Austin, etc.) |
| **New York** | NY | 4.00% | 7 | Major cities (NYC, Buffalo, Rochester, etc.) |
| **Florida** | FL | 6.00% | Base only | County surtax varies |
| **Washington** | WA | 6.50% | Base only | Local rates 8-10% total |
| **Nevada** | NV | 6.85% | Base only | County add-ons vary |
| **Oregon** | OR | 0.00% | Base only | No sales tax |

**California** has the most detailed coverage with 546 jurisdictions. **Texas** and **New York** include major city rates. Other states return base state rates.

## Usage

### Auto-Detect State from ZIP

```typescript
import { getTaxRate } from 'taxrates-us';

// ZIP code automatically determines the state
const dallas = getTaxRate({ zip: '75201' }); // TX
const miami = getTaxRate({ zip: '33101' });  // FL
const seattle = getTaxRate({ zip: '98101' }); // WA

console.log(dallas.state);  // "TX"
console.log(miami.state);   // "FL"
console.log(seattle.state); // "WA"
```

### State Override

```typescript
// ZIP detection can be overridden
const rate = getTaxRate({ zip: '90210', state: 'TX' });
console.log(rate.state); // "TX" (not CA)
```

### California Detailed Lookups

```typescript
// City lookup (546 cities)
const sacramento = getTaxRate({ state: 'CA', city: 'Sacramento' });
console.log(sacramento.percentage); // "8.75%"

// County lookup
const alameda = getTaxRate({ state: 'CA', county: 'Alameda' });
console.log(alameda.percentage); // "10.25%"

// ZIP code to city mapping (CA only)
const beverly = getTaxRate({ state: 'CA', zip: '90210' });
console.log(beverly.jurisdiction); // "Beverly Hills"
console.log(beverly.percentage);   // "9.50%"
```

### Response Format

```typescript
interface TaxRateResponse {
  rate: number;              // 0.0875 for 8.75%
  percentage: string;        // "8.75%"
  jurisdiction: string;      // "Sacramento" or "Texas"
  state: string;             // "CA", "TX", etc.
  county?: string;           // "Sacramento" (CA only)
  components: {
    state: number;           // State base rate
    county: number;          // County portion (CA only)
    city: number;            // City portion (CA only)
    district: number;        // Special districts
  };
  source: string;            // "California CDTFA", "Texas Comptroller", etc.
  effectiveDate: string;     // "2026-01-01"
  supported: boolean;        // true for supported states
  lookupMethod?: string;     // "zip", "city", "county", "state-default"
  reason?: string;           // Explanation for unsupported states
}
```

### Calculate Tax Amount

```typescript
import { getTaxRate } from 'taxrates-us';

function calculateTax(amount: number, zip: string): number {
  const { rate } = getTaxRate({ zip });
  return Math.round(amount * rate * 100) / 100;
}

const subtotal = 100.00;
const tax = calculateTax(subtotal, '90210');
const total = subtotal + tax;

console.log(`Subtotal: $${subtotal.toFixed(2)}`);
console.log(`Tax: $${tax.toFixed(2)}`);
console.log(`Total: $${total.toFixed(2)}`);
```

### Get Supported States

```typescript
import { getStates } from 'taxrates-us';

const states = getStates();
console.log(states); // ["CA", "TX", "NY", "FL", "WA", "NV", "OR"]
```

## Hosted API

The package includes Vercel serverless functions for hosted API access.

### Endpoints

**Base URL**: `https://taxrates-us.vercel.app`

#### `GET /api/rate`

Look up tax rate by location.

**Query Parameters:**
- `zip` (string, optional): ZIP code (auto-detects state)
- `state` (string, optional): Two-letter state code
- `city` (string, optional): City name (CA only)
- `county` (string, optional): County name (CA only)

**Examples:**

```bash
# By ZIP code
curl "https://taxrates-us.vercel.app/api/rate?zip=90210"

# By state
curl "https://taxrates-us.vercel.app/api/rate?state=TX"

# By city (CA)
curl "https://taxrates-us.vercel.app/api/rate?state=CA&city=Sacramento"

# Override state detection
curl "https://taxrates-us.vercel.app/api/rate?zip=90210&state=CA"
```

**Response:**

```json
{
  "rate": 0.0875,
  "percentage": "8.75%",
  "jurisdiction": "Sacramento",
  "state": "CA",
  "county": "Sacramento",
  "components": {
    "state": 0.06,
    "county": 0.0125,
    "city": 0,
    "district": 0.005
  },
  "source": "California Department of Tax and Fee Administration (CDTFA)",
  "effectiveDate": "2026-01-01",
  "supported": true,
  "lookupMethod": "city"
}
```

#### `GET /api/states`

Get list of supported states.

**Example:**

```bash
curl "https://taxrates-us.vercel.app/api/states"
```

**Response:**

```json
{
  "states": ["CA", "TX", "NY", "FL", "WA", "NV", "OR"],
  "count": 7
}
```

#### `GET /api`

Health check and API documentation.

**Example:**

```bash
curl "https://taxrates-us.vercel.app/api"
```

### API Features

- **CORS enabled** — Use from any domain
- **Rate limiting** — 10 requests/minute, 100 requests/hour per IP
- **Rate limit headers** — `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Vercel Edge Network** — Fast global response times
- **Serverless** — Zero infrastructure management
- **Free tier** — Generous Vercel free tier limits

### Rate Limiting

The hosted API implements in-memory rate limiting:
- 10 requests per minute per IP
- 100 requests per hour per IP
- Responses include rate limit headers
- Returns `429 Too Many Requests` when exceeded

### Deploy Your Own API

1. Fork the repository
2. Connect to Vercel
3. Deploy automatically

```bash
# Or deploy via CLI
npm install -g vercel
vercel
```

The API functions are in the `api/` directory and automatically deploy with Vercel.

## Examples

### E-commerce Checkout

```typescript
import { getTaxRate } from 'taxrates-us';

interface CartItem {
  name: string;
  price: number;
}

function calculateCheckout(items: CartItem[], shippingZip: string) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const { rate, percentage, state } = getTaxRate({ zip: shippingZip });
  const tax = Math.round(subtotal * rate * 100) / 100;
  const total = subtotal + tax;
  
  return { subtotal, taxRate: percentage, tax, total, state };
}

const cart = [
  { name: 'Widget', price: 29.99 },
  { name: 'Gadget', price: 49.99 }
];

const checkout = calculateCheckout(cart, '90210');
console.log(checkout);
// { subtotal: 79.98, taxRate: "9.50%", tax: 7.60, total: 87.58, state: "CA" }
```

### Multi-State Pricing Table

```typescript
import { getTaxRate, getStates } from 'taxrates-us';

const basePrice = 100.00;
const states = getStates();

console.log('Price comparison across states:\n');
states.forEach(state => {
  const { rate, percentage } = getTaxRate({ state });
  const tax = basePrice * rate;
  const total = basePrice + tax;
  console.log(`${state}: $${total.toFixed(2)} (${percentage})`);
});

// Output:
// CA: $107.25 (7.25%)
// TX: $106.25 (6.25%)
// NY: $104.00 (4.00%)
// FL: $106.00 (6.00%)
// WA: $106.50 (6.50%)
// NV: $106.85 (6.85%)
// OR: $100.00 (0.00%)
```

## Data Sources

Tax rates are sourced from official state tax authorities:

| State | Source |
|-------|--------|
| **CA** | [California Department of Tax and Fee Administration (CDTFA)](https://www.cdtfa.ca.gov/) |
| **TX** | [Texas Comptroller of Public Accounts](https://comptroller.texas.gov/) |
| **NY** | [New York State Department of Taxation and Finance](https://www.tax.ny.gov/) |
| **FL** | [Florida Department of Revenue](https://floridarevenue.com/) |
| **WA** | [Washington Department of Revenue](https://dor.wa.gov/) |
| **NV** | [Nevada Department of Taxation](https://tax.nv.gov/) |
| **OR** | [Oregon Department of Revenue](https://www.oregon.gov/dor/) |

All rates effective as of **January 1, 2026**.

## API Reference

### `getTaxRate(request): TaxRateResponse`

Look up tax rate for a location.

**Parameters:**
- `request.zip` (string, optional): ZIP code (auto-detects state)
- `request.state` (string, optional): Two-letter state code
- `request.city` (string, optional): City name (CA only)
- `request.county` (string, optional): County name (CA only)

**Returns:** `TaxRateResponse` object

### `getStates(): string[]`

Get list of supported state codes.

**Returns:** Array of state codes (e.g., `["CA", "TX", "NY", ...]`)

### `getSupportedStates(): string[]`

Legacy alias for `getStates()`.

### `getMetadata(state?): object`

Get metadata about tax rate data.

**Parameters:**
- `state` (string, optional): Specific state code

**Returns:** Metadata object with effective date, source, version, etc.

### `getJurisdictions(state): Jurisdiction[]`

Get all jurisdictions for a state.

**Parameters:**
- `state` (string): Two-letter state code

**Returns:** Array of jurisdiction objects (CA has 546, others have 1)

### `lookupZip(zip): ZipEntry | null`

Look up city/county for a ZIP code (CA only).

**Parameters:**
- `zip` (string): 5-digit ZIP code

**Returns:** Object with `city` and `county`, or `null`

## Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --grep "California"
npm test -- --grep "Multi-State"
```

Tests cover:
- 80+ California city lookups
- All 7 supported states
- ZIP code auto-detection
- Edge cases and error handling

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Build + test
npm run build && npm test
```

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Deploy automatically

**Environment:** No environment variables needed. All data is bundled.

### Deploy to Other Platforms

The package works anywhere Node.js runs:
- AWS Lambda
- Google Cloud Functions
- Azure Functions
- Cloudflare Workers (with polyfills)
- Any Node.js server

## Roadmap

- [x] California support (546 jurisdictions)
- [x] Multi-state support (TX, NY, FL, WA, NV, OR)
- [x] ZIP code auto-detection
- [x] Hosted API (Vercel serverless)
- [x] TypeScript types
- [x] Zero dependencies
- [x] Comprehensive test suite
- [ ] Expand TX, NY, FL with county/city data
- [ ] All 50 states + DC
- [ ] Historical rate lookups
- [ ] Rate change notifications
- [ ] CLI tool for local lookups

## Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Submit a pull request

Ideas for contributions:
- Add more state data (county/city level)
- Improve ZIP code mapping
- Add more test cases
- Improve documentation

## Disclaimer

**For informational purposes only. Not tax advice.**

Tax rates are sourced from official state tax authorities. While we strive for accuracy, tax rates can change, and edge cases may exist (special districts, unincorporated areas, exemptions, etc.).

For production use:
- Verify rates for your specific use case
- Consider consulting a tax professional
- Test thoroughly with your address data
- Stay updated with rate changes

This package does NOT:
- Provide tax filing advice
- Handle tax exemptions (groceries, prescription drugs, etc.)
- Calculate use tax or other tax types
- Guarantee legal compliance

**Use at your own risk.** The authors are not liable for incorrect tax calculations or compliance issues.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

Created by [mrpartner](https://github.com/mrpartnerai)

## Links

- [GitHub Repository](https://github.com/mrpartnerai/taxrates-us)
- [npm Package](https://www.npmjs.com/package/taxrates-us)
- [Issue Tracker](https://github.com/mrpartnerai/taxrates-us/issues)
- [API Endpoint](https://taxrates-us.vercel.app/api)

---

**Made with ❤️ for developers who need accurate tax rates without the hassle**
