# taxrates-us

[![npm version](https://badge.fury.io/js/taxrates-us.svg)](https://www.npmjs.com/package/taxrates-us)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Accurate US sales tax rate lookups — starting with California**

Open-source npm package for looking up sales tax rates by address. Self-hosted with bundled rate data, zero external API dependencies, and works completely offline.

## Features

✅ **Zero dependencies** — Pure TypeScript, no external runtime deps  
✅ **Works offline** — Tax rate data bundled with the package  
✅ **TypeScript native** — Full type safety and IntelliSense support  
✅ **California complete** — 546 jurisdictions (cities, counties, unincorporated areas)  
✅ **Source attribution** — All rates sourced from California CDTFA  
✅ **Self-updating** — Built-in CLI to fetch latest rates  
✅ **Open source** — MIT licensed, verifiable data

## Installation

```bash
npm install taxrates-us
```

## Usage

### Basic Example

```typescript
import { getTaxRate } from 'taxrates-us';

// Look up by city
const sacramento = getTaxRate({ state: 'CA', city: 'Sacramento' });
console.log(sacramento.percentage); // "8.75%"
console.log(sacramento.rate);       // 0.0875

// Look up by county
const alameda = getTaxRate({ state: 'CA', city: 'Alameda County' });
console.log(alameda.percentage);    // "10.25%"

// State base rate (when city not found)
const unknown = getTaxRate({ state: 'CA', city: 'Unknown City' });
console.log(unknown.percentage);    // "7.25%" (CA state base)

// Unsupported state (no nexus)
const texas = getTaxRate({ state: 'TX' });
console.log(texas.rate);            // 0
console.log(texas.supported);       // false
```

### Response Format

```typescript
interface TaxRateResponse {
  rate: number;              // 0.0875 for 8.75%
  percentage: string;        // "8.75%"
  jurisdiction: string;      // "Sacramento"
  state: string;             // "CA"
  components: {
    state: number;           // 0.0725 (CA base rate)
    district: number;        // 0.015 (local districts)
  };
  source: string;            // "California CDTFA"
  effectiveDate: string;     // "2026-01-01"
  supported: boolean;        // true for CA, false otherwise
  reason?: string;           // Explanation for unsupported states
}
```

### Calculate Tax Amount

```typescript
import { getTaxRate } from 'taxrates-us';

function calculateTax(amount: number, state: string, city?: string): number {
  const { rate } = getTaxRate({ state, city });
  return Math.round(amount * rate * 100) / 100; // Round to 2 decimals
}

const subtotal = 100.00;
const tax = calculateTax(subtotal, 'CA', 'Los Angeles');
const total = subtotal + tax;

console.log(`Subtotal: $${subtotal.toFixed(2)}`);
console.log(`Tax (9.75%): $${tax.toFixed(2)}`);
console.log(`Total: $${total.toFixed(2)}`);
// Output:
// Subtotal: $100.00
// Tax (9.75%): $9.75
// Total: $109.75
```

### Get Metadata

```typescript
import { getMetadata, getSupportedStates } from 'taxrates-us';

const metadata = getMetadata();
console.log(metadata);
/*
{
  effectiveDate: "2026-01-01",
  source: "California Department of Tax and Fee Administration (CDTFA)",
  lastUpdated: "2026-02-08",
  jurisdictionCount: 546,
  version: "0.1.0",
  supportedStates: ["CA"]
}
*/

const states = getSupportedStates();
console.log(states); // ["CA"]
```

## Supported States

Currently supported:
- ✅ **California** (546 jurisdictions)

Coming soon:
- 🔜 Texas
- 🔜 Florida
- 🔜 New York
- 🔜 Washington
- 🔜 [All 50 states]

## Data Source

California tax rates are sourced from the **California Department of Tax and Fee Administration (CDTFA)**, the official state tax authority.

- **Source**: [CDTFA Sales and Use Tax Rates](https://www.cdtfa.ca.gov/taxes-and-fees/sales-use-tax-rates.htm)
- **Effective Date**: January 1, 2026
- **Update Frequency**: Quarterly (January, April, July, October)
- **Jurisdictions**: 546 (483 cities, 58 counties, 5 unincorporated areas)

## Updating Tax Rates

To fetch the latest tax rates from CDTFA:

```bash
npm run update-rates
```

This script will:
1. Download the latest CDTFA CSV file
2. Validate and parse the data
3. Rebuild the bundled JSON file
4. Run tests to verify accuracy

**Note**: After updating, you should rebuild and republish the package for the new rates to take effect for your users.

## CLI Usage (Future)

```bash
# Look up rate by city
npx taxrates-us lookup --state CA --city Sacramento

# Update local rate data
npx taxrates-us update
```

*CLI coming in v0.2.0*

## API Reference

### `getTaxRate(request: TaxRateRequest): TaxRateResponse`

Look up tax rate for a location.

**Parameters:**
- `request.state` (string, required): Two-letter state code (e.g., "CA")
- `request.city` (string, optional): City name (case-insensitive)
- `request.zip` (string, optional): ZIP code *(not yet fully supported)*

**Returns:** `TaxRateResponse` object with rate, percentage, jurisdiction, and source info

### `getSupportedStates(): string[]`

Get list of currently supported state codes.

**Returns:** Array of state codes (e.g., `["CA"]`)

### `getMetadata(): object`

Get metadata about the bundled tax rate data.

**Returns:** Object with effective date, source, version, and jurisdiction count

## Edge Cases

### Case Sensitivity
City names are case-insensitive:
```typescript
getTaxRate({ state: 'CA', city: 'sacramento' });   // ✅ Works
getTaxRate({ state: 'CA', city: 'SACRAMENTO' });   // ✅ Works
getTaxRate({ state: 'CA', city: 'SaCrAmEnTo' });   // ✅ Works
```

### County Lookups
Counties can be looked up with or without "County" suffix:
```typescript
getTaxRate({ state: 'CA', city: 'Alameda County' }); // ✅ Works
getTaxRate({ state: 'CA', city: 'Alameda' });        // ✅ Also works
```

### City Not Found
If a city isn't found, returns the state base rate:
```typescript
const result = getTaxRate({ state: 'CA', city: 'NonexistentCity' });
// Returns: 7.25% (CA state base rate)
// jurisdiction: "California (State Base Rate)"
```

### Unsupported States
States other than CA return 0% (no nexus):
```typescript
const texas = getTaxRate({ state: 'TX' });
// rate: 0, supported: false, reason: "No nexus in TX..."
```

## Examples

### E-commerce Checkout

```typescript
import { getTaxRate } from 'taxrates-us';

interface CartItem {
  name: string;
  price: number;
}

function calculateCheckout(
  items: CartItem[],
  shippingState: string,
  shippingCity: string
) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const { rate, percentage } = getTaxRate({ 
    state: shippingState, 
    city: shippingCity 
  });
  const tax = Math.round(subtotal * rate * 100) / 100;
  const total = subtotal + tax;
  
  return {
    subtotal,
    taxRate: percentage,
    tax,
    total
  };
}

const cart = [
  { name: 'Widget', price: 29.99 },
  { name: 'Gadget', price: 49.99 }
];

const checkout = calculateCheckout(cart, 'CA', 'San Francisco');
console.log(checkout);
// { subtotal: 79.98, taxRate: "8.63%", tax: 6.90, total: 86.88 }
```

### Invoice Generator

```typescript
import { getTaxRate } from 'taxrates-us';

interface Invoice {
  lineItems: Array<{ description: string; amount: number }>;
  customerState: string;
  customerCity: string;
}

function generateInvoice(invoice: Invoice) {
  const subtotal = invoice.lineItems.reduce((s, i) => s + i.amount, 0);
  const taxInfo = getTaxRate({ 
    state: invoice.customerState, 
    city: invoice.customerCity 
  });
  
  if (!taxInfo.supported) {
    return { subtotal, tax: 0, total: subtotal, taxNote: taxInfo.reason };
  }
  
  const tax = Math.round(subtotal * taxInfo.rate * 100) / 100;
  
  return {
    subtotal,
    tax,
    total: subtotal + tax,
    taxRate: taxInfo.percentage,
    taxJurisdiction: taxInfo.jurisdiction,
    taxSource: taxInfo.source
  };
}
```

## Testing

```bash
# Run tests
npm test

# Build and test
npm run build && npm test
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Update tax rates
npm run update-rates
```

## Roadmap

- [x] California support (546 jurisdictions)
- [x] TypeScript types
- [x] Zero dependencies
- [x] Offline operation
- [x] Test suite
- [ ] CLI tool
- [ ] Texas support
- [ ] Florida support
- [ ] New York support
- [ ] All 50 states + DC
- [ ] ZIP code boundary mapping
- [ ] Historical rate lookups
- [ ] Rate change notifications

## Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Submit a pull request

## Disclaimer

**For informational purposes only. Not tax advice.**

Tax rates are sourced from official state tax authorities and updated quarterly. While we strive for accuracy, tax rates can change, and edge cases may exist (special districts, unincorporated areas, etc.).

For production use:
- Verify rates for your specific use case
- Consider consulting a tax professional
- Test thoroughly with your address data
- Stay updated with quarterly rate changes

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

Tax rate data provided by:
- California: [CDTFA](https://www.cdtfa.ca.gov/)

## Links

- [GitHub Repository](https://github.com/mrpartnerai/taxrates-us)
- [npm Package](https://www.npmjs.com/package/taxrates-us)
- [Issue Tracker](https://github.com/mrpartnerai/taxrates-us/issues)
- [California CDTFA](https://www.cdtfa.ca.gov/taxes-and-fees/sales-use-tax-rates.htm)

---

**Made with ❤️ for developers who need accurate tax rates without the hassle**
