# CDTFA Tax Rate Data - taxrates-us

This directory contains California sales tax rate data from the California Department of Tax and Fee Administration (CDTFA).

## Files

### Downloaded Data
- `SalesTaxRates1-1-26.xlsx` - Official Excel file (effective Jan 1, 2026)
- `SalesTaxRates1-1-26.csv` - Raw CSV export from Excel
- `SalesTaxRates1-1-26-cleaned.csv` - Cleaned CSV with proper formatting
- `cdtfa105.pdf` - District Taxes, Rates, and Effective Dates
- `cdtfa823.pdf` - Active District Tax Rates with Sunset Dates

### Analysis
- **`CDTFA-DATA-ANALYSIS.md`** - **READ THIS FIRST** - Comprehensive analysis and recommendations
- `api-test-results.txt` - Sample API responses and edge cases

### Extracted (temporary)
- `excel_extracted/` - Unzipped Excel XML files (can be deleted)

## Quick Facts

- **546 jurisdictions** (483 cities, 58 counties, 5 unincorporated)
- **Rate range:** 7.250% - 11.250%
- **Effective date:** January 1, 2026
- **Update frequency:** Quarterly (Jan, Apr, Jul, Oct)

## Data Sources

1. **Bulk download:** https://www.cdtfa.ca.gov/taxes-and-fees/sales-use-tax-rates.htm
2. **REST API:** https://services.maps.cdtfa.ca.gov/api/taxrate/
3. **Open Data Portal:** https://data.ca.gov/dataset/cdtfa-salesandusetaxrates-public

## Usage

See `CDTFA-DATA-ANALYSIS.md` for:
- Complete API documentation
- Data structure details
- Recommended parsing approach
- Examples and edge cases
- Rate composition breakdown

## Next Steps

1. Build parser for `SalesTaxRates1-1-26-cleaned.csv`
2. Create JSON output format
3. Implement lookup functions
4. Add API integration for address validation
