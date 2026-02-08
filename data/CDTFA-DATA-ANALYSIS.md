# CDTFA Sales Tax Rate Data Analysis
## California Department of Tax and Fee Administration

**Analysis Date:** February 8, 2026  
**Data Effective Date:** January 1, 2026  
**Purpose:** Open-source npm package `taxrates-us` - Accurate California sales tax rates by address/ZIP

---

## Executive Summary

The California Department of Tax and Fee Administration (CDTFA) provides comprehensive sales tax rate data through multiple channels:
- **Excel/CSV downloads** for bulk jurisdiction data
- **REST API** for real-time address-based lookups
- **SOAP API** for enterprise integration
- **Interactive map tool** for manual lookups

The data covers **546 jurisdictions** (483 cities + 58 counties + 5 unincorporated areas) with rates ranging from **7.250% to 11.250%**.

---

## Available Data Files

### 1. Official Excel Download
- **URL:** https://www.cdtfa.ca.gov/taxes-and-fees/sales-use-tax-rates.htm
- **File:** `SalesTaxRates1-1-26.xlsx` (30.3 KB)
- **Formats:** Excel 2012 (.xlsx), Excel 97-2003 (.xls)
- **Location:** Saved to `./SalesTaxRates1-1-26.xlsx`
- **Cleaned CSV:** `./SalesTaxRates1-1-26-cleaned.csv`

### 2. California Open Data Portal
- **URL:** https://data.ca.gov/dataset/cdtfa-salesandusetaxrates-public
- **Format:** CSV (via GIS API)
- **Last Updated:** July 31, 2025 (metadata: Jan 28, 2026)
- **Note:** File is generated on-demand (may take a few minutes)

### 3. PDF References (Downloaded)
- **CDTFA-105:** District Taxes, Rates, and Effective Dates (753 KB)
- **CDTFA-823:** Active District Tax Rates with Operative and Sunset Dates (277 KB)
- **Location:** Saved to `./cdtfa105.pdf` and `./cdtfa823.pdf`

---

## Data Format and Fields

### Excel/CSV Structure

```csv
Location,Rate,County,Type,Notes
Adelanto,0.0775,San Bernardino,City,
Alameda County,0.1025,Alameda,County,
```

**Fields:**
- **Location** (string): City name or "County" for county-wide rates
- **Rate** (float): Total tax rate as decimal (0.0875 = 8.75%)
- **County** (string): County name
- **Type** (string): "City" or "County" (5 "Unincorporated Area" entries)
- **Notes** (string, optional): Special instructions (5 jurisdictions with notes)

### Notes Examples
Special notes exist for unincorporated areas:
```
"Del Norte County Unincorporated Area: This tax rate applies only to 
unincorporated areas of Del Norte County. Please refer to the applicable 
incorporated city within the county for that city's tax rate."
```

Counties with unincorporated area entries: Del Norte, Kern, Monterey, Santa Cruz, Yuba

---

## API Endpoints

### REST API (Recommended)

**Base URL:** `https://services.maps.cdtfa.ca.gov/api/taxrate/`

#### Get Rate by Address
```
GET /GetRateByAddress?address={address}&city={city}&zip={zip}
```

**Parameters:**
- `address` (required): Street address with spaces as `+` (e.g., `450+N+St`)
- `city` (required): City name with spaces as `+` (e.g., `San+Diego`)
- `zip` (required): 5-digit ZIP code

**Example:**
```bash
curl "https://services.maps.cdtfa.ca.gov/api/taxrate/GetRateByAddress?address=450+N+St&city=Sacramento&zip=95814"
```

**Response:**
```json
{
  "taxRateInfo": [
    {
      "rate": 0.0875,
      "jurisdiction": "SACRAMENTO",
      "city": "SACRAMENTO",
      "county": "SACRAMENTO",
      "tac": "340607050000"
    }
  ],
  "geocodeInfo": {
    "matchCodes": ["Good"],
    "formattedAddress": "450 N St, Sacramento, CA 95814",
    "confidence": "High",
    "calcMethod": "Rooftop",
    "bufferDistance": 50
  },
  "termsOfUse": "https://www.cdtfa.ca.gov/dataportal/policy.htm",
  "disclaimer": "https://www.cdtfa.ca.gov/dataportal/disclaimer.htm"
}
```

#### Get Rate by Latitude/Longitude
```
GET /GetRateByLngLat?longitude={longitude}&latitude={latitude}
```

**Parameters:**
- `longitude` (required): Decimal degrees (DD) format
- `latitude` (required): Decimal degrees (DD) format

**Example:**
```bash
curl "https://services.maps.cdtfa.ca.gov/api/taxrate/GetRateByLngLat?Longitude=-121.502520&Latitude=38.577650"
```

#### API Response Fields

**taxRateInfo** (array of objects):
- `rate` (float): Tax rate as decimal (0.0875 = 8.75%)
- `jurisdiction` (string): Jurisdiction name
- `city` (string): City name
- `county` (string): County name
- `tac` (string): Tax Area Code (12 digits)

**geocodeInfo** (object):
- `matchCodes` (array): Geocoding quality codes
- `formattedAddress` (string): Standardized address
- `confidence` (string): "High", "Medium", "Low"
- `calcMethod` (string): "Rooftop", "Interpolation", etc.
- `bufferDistance` (int): Search radius in meters

**Important Notes:**
- Multiple tax rates may be returned if address is near a boundary
- API does NOT validate addresses - use address validator first
- No authentication required (public API)
- Rate limiting not documented (use responsibly)

### SOAP API (Legacy)

**WSDL:** `https://services.maps.cdtfa.ca.gov/soap/api/taxrate/Service.svc`

Available for enterprise systems requiring SOAP integration. See main documentation for SOAP request format.

---

## Data Statistics

### Coverage
- **Total Jurisdictions:** 546
  - Cities: 483 (88.5%)
  - Counties: 58 (10.6%)
  - Unincorporated Areas: 5 (0.9%)

### Tax Rate Distribution
- **Minimum Rate:** 7.250% (base California state rate)
- **Maximum Rate:** 11.250%
- **Average Rate:** 8.844%
- **Median Rate:** 8.750%

### Most Common Rates
| Rate    | Count | % of Total |
|---------|-------|------------|
| 8.750%  | 91    | 16.7%      |
| 7.750%  | 87    | 15.9%      |
| 8.250%  | 47    | 8.6%       |
| 7.250%  | 44    | 8.1%       |
| 9.250%  | 44    | 8.1%       |
| 9.750%  | 43    | 7.9%       |
| 10.500% | 42    | 7.7%       |
| 10.250% | 20    | 3.7%       |

---

## Tax Rate Structure

### Composition
California sales tax rates are composed of:

```
Total Rate = State Base + County District + City District + Special Districts
```

**State Base Rate:** 7.25% (uniform statewide)

**District Taxes:** 0.00% to 4.00% (local add-ons)
- County-level districts
- City-level districts
- Special taxing districts (transit, transportation, etc.)

### District Tax Distribution

| District Tax | Jurisdictions |
|--------------|---------------|
| 0.000%       | 44            |
| 0.500%       | 87            |
| 1.000%       | 47            |
| 1.500%       | 91            |
| 2.000%       | 44            |
| 2.500%       | 43            |
| 3.000%       | 20            |
| 3.250%       | 42            |
| 3.500%       | 18            |
| 4.000%       | 2             |

### Example Breakdown

**Sacramento City:**
- State base: 7.25%
- District tax: +0.625%
- **Total: 8.750%**

**Los Angeles County:**
- State base: 7.25%
- County district: +2.500%
- **Total: 9.750%**

**Lancaster City (Los Angeles County):**
- State base: 7.25%
- County district: +2.500%
- City district: +1.500%
- **Total: 11.250%** (highest in California)

### Cities vs Counties

**309 cities (64%)** have different rates than their county base:
- Cities can add local district taxes on top of county rates
- Differences range from +0.250% to +1.500%
- Examples:
  - **Alameda** (Alameda County): 10.750% vs County 10.250% (+0.500%)
  - **Antioch** (Contra Costa County): 9.750% vs County 8.750% (+1.000%)
  - **Arcata** (Humboldt County): 10.250% vs County 8.750% (+1.500%)

---

## Update Frequency

### Quarterly Updates (January, April, July, October)
- Tax rates change on **January 1, April 1, July 1, October 1**
- Current data effective: **January 1, 2026**
- Next update expected: **April 1, 2026**

### Rate Change Tracking
The CDTFA publishes an "Explanation of Tax Rate Changes" page showing:
- Which jurisdictions changed rates
- Old vs new rate
- Reason for change (ballot measure, expiration, etc.)
- New tax area codes (TAC)

**Recent Changes (Jan 1, 2026):**
- Many Los Angeles County cities updated due to Measure A (repealed 0.250% Measure H, added new 0.500%)
- Several cities added or increased local taxes (1.00% increases common)
- New county-wide taxes in Butte, Humboldt, Sonoma counties

---

## Tax Area Codes (TAC)

Each jurisdiction has a unique **12-digit Tax Area Code**:
- Format: `340607050000` (Sacramento example)
- Used by retailers for reporting to CDTFA
- Changes when tax rates change (new code issued)
- Returned by API in `tac` field

---

## Recommended Parsing Approach

### For taxrates-us npm package:

#### 1. **Primary Data Source: Excel/CSV Download**
- Most reliable for bulk data
- Download quarterly (January, April, July, October)
- Parse into JSON structure

**Advantages:**
- Complete jurisdiction list
- No rate limits
- Offline capability
- Simple parsing

**Disadvantages:**
- Manual update cycle
- No address geocoding

#### 2. **Secondary/Validation: REST API**
- Use for real-time lookups by address
- Validate parsed data against API responses
- Handle boundary cases (multiple rates returned)

**Advantages:**
- Address-level accuracy
- Geocoding included
- Always current
- Handles special districts

**Disadvantages:**
- Network dependency
- No bulk download
- Rate limiting unknown

### Recommended Architecture

```javascript
// taxrates-us structure
{
  "metadata": {
    "effectiveDate": "2026-01-01",
    "source": "CDTFA",
    "lastUpdated": "2026-02-08",
    "jurisdictionCount": 546
  },
  "jurisdictions": [
    {
      "location": "Sacramento",
      "type": "City",
      "county": "Sacramento",
      "rate": 0.0875,
      "ratePercent": "8.750%",
      "tac": "340607050000",
      "districtTax": 0.0125,
      "notes": null
    },
    {
      "location": "Alameda County",
      "type": "County",
      "county": "Alameda",
      "rate": 0.1025,
      "ratePercent": "10.250%",
      "tac": null,
      "districtTax": 0.0300,
      "notes": null
    }
  ],
  "lookup": {
    // Optimize for fast lookups
    "byCity": {...},
    "byCounty": {...},
    "byZip": {...}  // If ZIP mapping added
  }
}
```

### Parser Logic

1. **Download Excel file** quarterly from CDTFA
2. **Convert to CSV** (or parse XLSX directly)
3. **Clean data:**
   - Convert scientific notation rates to decimals
   - Calculate district tax (rate - 7.25%)
   - Normalize location names
4. **Build lookup indexes:**
   - City name → rate
   - County name → rate
   - Optionally: ZIP code → rates (requires additional ZIP boundary data)
5. **Validate** sample records against API
6. **Version** JSON output with effective date

### Address Lookup Strategy

**Option A: Local Lookup (ZIP-based)**
- Map ZIP codes to jurisdictions
- Fast, offline, no API calls
- Less accurate (ZIP codes cross city boundaries)

**Option B: Hybrid (Local + API fallback)**
- Try local ZIP lookup first
- Fall back to CDTFA API for precision
- Best accuracy, handles edge cases

**Option C: API-only**
- Always call CDTFA API
- Most accurate
- Network dependency, slower

**Recommendation:** Option B (Hybrid) for production use

---

## Important Considerations

### 1. **Boundary Complexity**
- ZIP codes don't always align with city boundaries
- Some addresses return **multiple rates** (near boundaries)
- Unincorporated areas have different rates than nearby cities

### 2. **Special Cases**
- **PO Boxes:** Not supported by API (physical address required)
- **New developments:** May not be in geocoder yet
- **Unincorporated areas:** Check county rate vs city rate

### 3. **Use Tax vs Sales Tax**
- These are **Sales and Use Tax** rates (same rate for both)
- Applies to retail sales and taxable purchases

### 4. **Exemptions Not Included**
- Data shows rates only
- Some items exempt (groceries, prescription drugs, etc.)
- Exemptions require separate logic

### 5. **District Tax Details**
- District taxes fund local services (transit, police, libraries, etc.)
- Many have sunset dates (expire after X years)
- Voters approve via ballot measures (Measure A, H, O, I, etc.)

---

## Next Steps for taxrates-us

### Phase 1: Basic Parser
1. ✅ Download and analyze CDTFA data
2. 🔲 Build Excel → JSON parser
3. 🔲 Create lookup functions (by city, by county)
4. 🔲 Write unit tests with sample data

### Phase 2: Address Lookup
1. 🔲 Add ZIP code mapping (if feasible)
2. 🔲 Integrate CDTFA API for precision lookups
3. 🔲 Handle multiple-rate responses
4. 🔲 Address normalization

### Phase 3: Automation
1. 🔲 Quarterly update checker
2. 🔲 Auto-download new rates
3. 🔲 Diff detection (what changed?)
4. 🔲 Version management

### Phase 4: Validation
1. 🔲 Cross-check parsed data vs API
2. 🔲 Test edge cases (boundaries, unincorporated areas)
3. 🔲 Performance benchmarks

---

## Additional Resources

### Official CDTFA Links
- **Main page:** https://www.cdtfa.ca.gov/taxes-and-fees/sales-use-tax-rates.htm
- **API docs:** https://services.maps.cdtfa.ca.gov/
- **Rate changes:** https://www.cdtfa.ca.gov/taxes-and-fees/explanationoftaxratechanges.htm
- **Interactive map:** https://maps.cdtfa.ca.gov/
- **Terms of use:** https://www.cdtfa.ca.gov/dataportal/policy.htm
- **Disclaimer:** https://www.cdtfa.ca.gov/dataportal/disclaimer.htm

### Data Sources
- **California Open Data:** https://data.ca.gov/dataset/cdtfa-salesandusetaxrates-public
- **GIS Data Portal:** https://gis.data.ca.gov/datasets/CDTFA::california-sales-and-use-tax-rate-rest-api

### Publications
- **Publication 44:** District Taxes (Sales and Use Taxes)
- **Publication 105:** District Taxes and Sales Delivered in California

---

## Contact

For questions about CDTFA data:
- **Phone:** 1-800-400-7115 (TTY: 711)
- **Hours:** Mon-Fri 7:30 AM - 5:00 PM Pacific
- **Local offices:** https://www.cdtfa.ca.gov/office-locations.htm

---

**Analysis prepared for:** taxrates-us open-source npm package  
**Data quality:** High - Official government source  
**Refresh recommended:** Quarterly (before Jan 1, Apr 1, Jul 1, Oct 1)
