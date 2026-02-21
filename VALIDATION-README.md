# Tax Rates Validation Guide

## Quick Start

Run the validation suite:
```bash
cd /Users/partner/.openclaw/workspace/taxrates-us
npx tsx scripts/validate-tax-rates.ts
```

## What Gets Checked

✅ **Metadata consistency** - jurisdiction count matches actual entries  
✅ **Format validation** - rate and ratePercent fields are consistent  
✅ **Rate accuracy** - spot-check against known official values  
✅ **Data integrity** - required fields present

## Validation Schedule

**Recommended frequency:**
- Before each npm release
- After updating any state data files
- Quarterly to catch any missed rate changes
- When official sources publish updates (usually January, April, July, October)

## Current Validation Coverage

| State | Jurisdictions | Spot-Checked | Coverage |
|-------|---------------|--------------|----------|
| CA | 546 | 11 | 2.0% |
| TX | 9 | 9 | 100% |
| NY | 7 | 7 | 100% |
| FL | 1 | 1 | 100% |
| WA | 1 | 1 | 100% |
| NV | 1 | 1 | 100% |
| OR | 1 | 1 | 100% |

## Interpreting Results

### ✅ Passed
The spot-checked rate matches our expected value. No action needed.

### ❌ Failed - Rate Mismatch
**Causes:**
1. Our data is outdated/incorrect → Update the data file
2. Validation script has wrong expected value → Update the validation script
3. Official source changed rates → Update data and re-release

**Action:** Cross-reference with official state source (see Official Sources below)

### ⚠️ Format Issue
**Common causes:**
- ratePercent doesn't match calculated rate
- Missing required fields
- Inconsistent decimal places

**Action:** Fix data file or validation script depending on issue

## Official Sources

### California
- **Main page:** https://cdtfa.ca.gov/taxes-and-fees/sales-use-tax-rates.htm
- **Excel file:** https://cdtfa.ca.gov/taxes-and-fees/SalesTaxRates1-1-26.xlsx
- **Rate lookup:** https://maps.cdtfa.ca.gov/
- **Update frequency:** Quarterly (Jan 1, Apr 1, Jul 1, Oct 1)

### Texas  
- **Main page:** https://comptroller.texas.gov/taxes/sales/
- **Rate locator:** https://gis.cpa.texas.gov/search/
- **Update frequency:** Quarterly

### New York
- **Main page:** https://www.tax.ny.gov/bus/st/stidx.htm
- **Rate database:** https://www.tax.ny.gov/bus/st/sales_tax_rates.htm
- **Update frequency:** Quarterly

### Florida
- **Main page:** https://floridarevenue.com/taxes/taxesfees/Pages/sales_tax.aspx
- **Update frequency:** Rarely (state law change required)

### Washington
- **Main page:** https://dor.wa.gov/taxes-rates/sales-and-use-tax-rates
- **Rate lookup:** https://webgis.dor.wa.gov/taxratelookup/SalesTax.aspx
- **Update frequency:** Quarterly

### Nevada
- **Main page:** https://tax.nv.gov/LocalGovt/LocalGovtTax/Sales___Use_Tax/
- **Update frequency:** Rarely

### Oregon
- **No sales tax** - Always 0.00%

## Adding New States

When adding a new state:

1. **Add official rates to validation script:**
   ```typescript
   OFFICIAL_RATES: {
     // ... existing states
     IL: {
       'Illinois': 0.0625,
       'Chicago': 0.1025,
       // Add 5-10 major cities
     }
   }
   ```

2. **Document official source** in this guide

3. **Run validation** to establish baseline

4. **Set up monitoring** for quarterly updates

## Known Issues

### California
- 3 cities need manual verification (Los Angeles, Long Beach, Beverly Hills)
- Missing statewide base rate entry (pending)
- 75 cities use 3+ decimal places (this is correct for precision)

See `VALIDATION-FINDINGS.md` for details.

## Scripts

### Main Validation
```bash
npx tsx scripts/validate-tax-rates.ts
```
Validates all states, spot-checks major cities, reports discrepancies.

### CA Verification
```bash
cd scripts && npx tsx verify-ca-rates.ts
```
Shows detailed breakdown for top 10 California cities.

## Troubleshooting

### "Rate mismatch" but our data is correct
Update `OFFICIAL_RATES` in `scripts/validate-tax-rates.ts` with the correct expected value.

### Format inconsistency warnings
- If 3+ decimal places are mathematically correct, ignore or update validator
- If genuinely wrong, fix in data file

### Metadata count doesn't match
Update `jurisdictionCount` in the state's metadata section.

## Automation Opportunities

**Future enhancements:**
- [ ] Automated download of official Excel/CSV files
- [ ] Parsing CDTFA Excel to extract rates programmatically  
- [ ] GitHub Action to run validation on PR
- [ ] Quarterly cron job to check for rate changes
- [ ] Email alerts when official sources publish updates

## Questions?

See detailed findings in:
- `VALIDATION-REPORT.md` - Initial validation report
- `VALIDATION-FINDINGS.md` - Detailed analysis and recommendations
