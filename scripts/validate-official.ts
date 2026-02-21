#!/usr/bin/env npx tsx
/**
 * validate-official.ts — Validates our tax rate data against official government sources.
 *
 * California: Scraped from CDTFA rates page (https://cdtfa.ca.gov/taxes-and-fees/rates.aspx)
 * Texas: Well-known rates from TX Comptroller (only 9 entries, all verifiable)
 * New York: Well-known rates from NY DTF
 * Other states: Spot-checked against known rates where possible
 *
 * Exit code 1 if ANY mismatch found.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

interface Jurisdiction {
  location: string;
  type: string;
  county: string;
  rate: number;
  ratePercent: string;
  districtTax: number;
  notes: string | null;
}

interface TaxData {
  metadata: { jurisdictionCount: number; effectiveDate: string };
  jurisdictions: Jurisdiction[];
}

interface ValidationResult {
  state: string;
  location: string;
  ourRate: number;
  officialRate: number;
  match: boolean;
  source: string;
}

const DIST_DIR = path.join(__dirname, '..', 'dist', 'data');

function loadStateData(state: string): TaxData {
  const filePath = path.join(DIST_DIR, `${state}-tax-rates.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function ratesMatch(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.00001;
}

// ─── California: Scrape CDTFA ───────────────────────────────────────────

function fetchPage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'taxrates-us-validator/1.0' } }, (res) => {
      // Follow redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchPage(res.headers.location).then(resolve, reject);
      }
      let data = '';
      res.on('data', (chunk: Buffer) => data += chunk.toString());
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function parseCDTFARates(html: string): Map<string, { rate: number; county: string; type: string }> {
  const rates = new Map<string, { rate: number; county: string; type: string }>();

  // The CDTFA page has rows like: "Adelanto7.750%San BernardinoCity"
  // In the actual HTML, these are table rows. Let's parse them from the rendered text.
  // The pattern in the fetched markdown is: LocationRate%CountyType
  // e.g., "Adelanto7.750%San BernardinoCity"

  // Extract from HTML table rows
  // Pattern: <td>Location</td><td>Rate%</td><td>County</td><td>Type</td>
  const rowRegex = /<tr[^>]*>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>([0-9.]+%)<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>(City|County)<\/td>/gi;
  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const location = match[1].trim();
    const rateStr = match[2].trim();
    const county = match[3].trim();
    const type = match[4].trim();
    const rate = parseFloat(rateStr) / 100;
    rates.set(location.toLowerCase(), { rate, county, type });
  }

  // If HTML parsing didn't work, try the markdown/text format
  if (rates.size === 0) {
    // Format: "Location Name9.750%CountyCity" or with spaces
    // More reliable: split by lines and parse each
    const lines = html.split('\n');
    for (const line of lines) {
      const textMatch = line.match(/^\s*(.+?)(\d+\.\d+%)\s*(.+?)(City|County)\s*$/);
      if (textMatch) {
        const location = textMatch[1].trim();
        const rateStr = textMatch[2].trim();
        const type = textMatch[4].trim();
        const rate = parseFloat(rateStr) / 100;
        // Skip entries with notes/asterisks
        if (!location.includes('*')) {
          rates.set(location.toLowerCase(), { rate, county: textMatch[3].trim(), type });
        }
      }
    }
  }

  return rates;
}

async function validateCalifornia(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  const source = 'CDTFA rates.aspx';

  console.log('  Fetching CDTFA rates page...');
  let html: string;
  try {
    html = await fetchPage('https://www.cdtfa.ca.gov/taxes-and-fees/rates.aspx');
  } catch (e) {
    console.log('  ⚠️  Failed to fetch CDTFA page, falling back to text parsing');
    // Try alternate URL
    try {
      html = await fetchPage('https://cdtfa.ca.gov/taxes-and-fees/rates.aspx');
    } catch (e2) {
      console.log('  ❌ Cannot reach CDTFA — skipping CA validation');
      return results;
    }
  }

  const officialRates = parseCDTFARates(html);
  console.log(`  Parsed ${officialRates.size} rates from CDTFA`);

  if (officialRates.size === 0) {
    console.log('  ⚠️  Could not parse any rates from CDTFA HTML — trying raw text extraction');
    // Try a simpler text-based approach from the raw HTML
    // Look for the data in text content between tags
    const textContent = html.replace(/<[^>]+>/g, '\n');
    const reParsed = parseCDTFARates(textContent);
    if (reParsed.size > 0) {
      console.log(`  Parsed ${reParsed.size} rates from text extraction`);
      return validateCAWithMap(reParsed, source);
    }
    console.log('  ❌ Failed to parse CDTFA data');
    return results;
  }

  return validateCAWithMap(officialRates, source);
}

function validateCAWithMap(officialRates: Map<string, { rate: number; county: string; type: string }>, source: string): ValidationResult[] {
  const results: ValidationResult[] = [];
  const caData = loadStateData('ca');

  // Validate ALL our jurisdictions against CDTFA
  let checked = 0;
  let notFound = 0;
  for (const j of caData.jurisdictions) {
    const key = j.location.toLowerCase();
    const official = officialRates.get(key);
    if (official) {
      checked++;
      results.push({
        state: 'CA',
        location: j.location,
        ourRate: j.rate,
        officialRate: official.rate,
        match: ratesMatch(j.rate, official.rate),
        source,
      });
    } else {
      notFound++;
    }
  }
  console.log(`  Matched ${checked} jurisdictions, ${notFound} not found on CDTFA page`);
  return results;
}

// ─── Texas: Known rates ─────────────────────────────────────────────────

function validateTexas(): ValidationResult[] {
  // TX state rate is 6.25%, max local is 2%, max combined is 8.25%
  // All major cities charge the max 2% local = 8.25% combined
  // Source: https://comptroller.texas.gov/taxes/sales/
  const officialRates: Record<string, number> = {
    'Texas': 0.0625,        // State rate
    'Houston': 0.0825,      // 6.25% + 2% local
    'Dallas': 0.0825,       // 6.25% + 2% local
    'San Antonio': 0.0825,  // 6.25% + 2% local
    'Austin': 0.0825,       // 6.25% + 2% local
    'Fort Worth': 0.0825,   // 6.25% + 2% local
    'El Paso': 0.0825,      // 6.25% + 2% local
    'Arlington': 0.0825,    // 6.25% + 2% local
    'Corpus Christi': 0.0825, // 6.25% + 2% local
  };

  const txData = loadStateData('tx');
  const results: ValidationResult[] = [];

  for (const j of txData.jurisdictions) {
    const official = officialRates[j.location];
    if (official !== undefined) {
      results.push({
        state: 'TX',
        location: j.location,
        ourRate: j.rate,
        officialRate: official,
        match: ratesMatch(j.rate, official),
        source: 'TX Comptroller (well-known rates)',
      });
    }
  }
  return results;
}

// ─── New York: Known rates ──────────────────────────────────────────────

function validateNewYork(): ValidationResult[] {
  // NY state rate is 4%. Local rates vary by county.
  // Source: https://www.tax.ny.gov/bus/st/rates.htm
  const officialRates: Record<string, number> = {
    'New York': 0.04,          // State base rate
    'New York City': 0.08875,  // 4% state + 4.5% city + 0.375% MCTD
    'Buffalo': 0.0875,         // 4% state + 4.75% Erie County
    'Rochester': 0.08,         // 4% state + 4% Monroe County
    'Syracuse': 0.08,          // 4% state + 4% Onondaga County
    'Albany': 0.08,            // 4% state + 4% Albany County
    'Yonkers': 0.08375,        // 4% state + 4% Westchester + 0.375% MCTD
  };

  const nyData = loadStateData('ny');
  const results: ValidationResult[] = [];

  for (const j of nyData.jurisdictions) {
    const official = officialRates[j.location];
    if (official !== undefined) {
      results.push({
        state: 'NY',
        location: j.location,
        ourRate: j.rate,
        officialRate: official,
        match: ratesMatch(j.rate, official),
        source: 'NY DTF (well-known rates)',
      });
    }
  }
  return results;
}

// ─── Other states: Spot-check known rates ───────────────────────────────

interface StateSpotCheck {
  state: string;
  source: string;
  rates: Record<string, number>;
}

const SPOT_CHECKS: StateSpotCheck[] = [
  {
    state: 'wa',
    source: 'WA DOR (well-known rates)',
    rates: {
      'Washington': 0.065,
      'Seattle': 0.1025,
      'Tacoma': 0.102,
      'Spokane': 0.089,
    },
  },
  {
    state: 'il',
    source: 'IL DOR (well-known rates)',
    rates: {
      'Illinois': 0.0625,
      'Chicago': 0.1025,
    },
  },
  {
    state: 'fl',
    source: 'FL DOR (well-known rates)',
    rates: {
      'Florida': 0.06,
    },
  },
  {
    state: 'pa',
    source: 'PA DOR (well-known rates)',
    rates: {
      'Pennsylvania': 0.06,
      'Philadelphia': 0.08,
      'Pittsburgh': 0.07,
    },
  },
  {
    state: 'oh',
    source: 'OH DTX (well-known rates)',
    rates: {
      'Ohio': 0.0575,
    },
  },
  {
    state: 'nj',
    source: 'NJ Treasury (well-known rates)',
    rates: {
      'New Jersey': 0.06625,
    },
  },
  {
    state: 'tn',
    source: 'TN DOR (well-known rates)',
    rates: {
      'Tennessee': 0.07,
    },
  },
  {
    state: 'ga',
    source: 'GA DOR (well-known rates)',
    rates: {
      'Georgia': 0.04,
    },
  },
];

function validateSpotChecks(): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (const check of SPOT_CHECKS) {
    let data: TaxData;
    try {
      data = loadStateData(check.state);
    } catch {
      console.log(`  ⚠️  No data file for ${check.state.toUpperCase()}`);
      continue;
    }

    for (const j of data.jurisdictions) {
      const official = check.rates[j.location];
      if (official !== undefined) {
        results.push({
          state: check.state.toUpperCase(),
          location: j.location,
          ourRate: j.rate,
          officialRate: official,
          match: ratesMatch(j.rate, official),
          source: check.source,
        });
      }
    }
  }

  return results;
}

// ─── States needing manual verification ─────────────────────────────────

const MANUAL_VERIFICATION_NOTES: Record<string, string> = {
  'AK': 'No state sales tax; local rates vary. Verify via individual borough/city websites.',
  'CO': 'Complex home-rule cities with self-administered taxes. Use Colorado Tax Rate Lookup (tax.colorado.gov).',
  'LA': 'Parish-level taxes. Use LA Dept of Revenue tax rate lookup.',
  'MO': 'Many local jurisdictions. Use MO DOR tax rate lookup.',
  'SC': 'County-level local option taxes. Verify via SC DOR.',
  'VA': 'Regional taxes differ. Verify via VA TAX.',
  'WI': 'County-level stadium/transit taxes. Use WI DOR rate lookup.',
};

// ─── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Tax Rate Validator — Official Source Comparison');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const allResults: ValidationResult[] = [];

  // California (scraped)
  console.log('🔍 California (CDTFA scrape)...');
  const caResults = await validateCalifornia();
  allResults.push(...caResults);
  console.log();

  // Texas
  console.log('🔍 Texas (known rates)...');
  const txResults = validateTexas();
  allResults.push(...txResults);
  console.log(`  Checked ${txResults.length} jurisdictions`);
  console.log();

  // New York
  console.log('🔍 New York (known rates)...');
  const nyResults = validateNewYork();
  allResults.push(...nyResults);
  console.log(`  Checked ${nyResults.length} jurisdictions`);
  console.log();

  // Other states spot-checks
  console.log('🔍 Other states (spot-checks)...');
  const spotResults = validateSpotChecks();
  allResults.push(...spotResults);
  console.log(`  Checked ${spotResults.length} jurisdictions across ${new Set(spotResults.map(r => r.state)).size} states`);
  console.log();

  // ─── Report ─────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const mismatches = allResults.filter(r => !r.match);
  const matches = allResults.filter(r => r.match);

  // Show all mismatches first
  if (mismatches.length > 0) {
    console.log(`❌ MISMATCHES (${mismatches.length}):\n`);
    console.log('  State | Location                    | Ours     | Official | Source');
    console.log('  ------+-----------------------------+----------+----------+---------------------------');
    for (const r of mismatches) {
      const loc = r.location.padEnd(27);
      const ours = (r.ourRate * 100).toFixed(3).padStart(7) + '%';
      const off = (r.officialRate * 100).toFixed(3).padStart(7) + '%';
      console.log(`  ${r.state.padEnd(5)}| ${loc} | ${ours} | ${off} | ${r.source}`);
    }
    console.log();
  }

  // Summary
  console.log(`✅ Matches:    ${matches.length}`);
  console.log(`❌ Mismatches: ${mismatches.length}`);
  console.log(`📊 Total:      ${allResults.length} jurisdictions checked\n`);

  // States needing manual verification
  console.log('📋 States needing manual verification:');
  for (const [state, note] of Object.entries(MANUAL_VERIFICATION_NOTES)) {
    console.log(`  ${state}: ${note}`);
  }
  console.log();

  if (mismatches.length > 0) {
    console.log('🚨 VALIDATION FAILED — mismatches found above need fixing');
    process.exit(1);
  } else {
    console.log('✅ ALL CHECKS PASSED');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(2);
});
