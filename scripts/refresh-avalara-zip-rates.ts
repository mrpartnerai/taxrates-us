#!/usr/bin/env ts-node
/**
 * Refresh Avalara ZIP-level tax rate data.
 *
 * Avalara provides free ZIP-level tax rate CSV tables that require
 * an interactive form submission (email + state selection) to download.
 * This script processes already-downloaded CSV files and converts them
 * into the compact JSON format used by the package.
 *
 * Usage:
 *   1. Download CSVs from https://www.avalara.com/taxrates/en/download-tax-tables.html
 *   2. Place them in data/avalara-csv/ (one per state, e.g. TAXRATES_ZIP5_CA202602.csv)
 *   3. Run: npx tsx scripts/refresh-avalara-zip-rates.ts
 *
 * Output: src/data/zip-rates/{state}-zip-rates.json for each state
 */

import * as fs from 'fs';
import * as path from 'path';

const CSV_DIR = path.join(__dirname, '..', 'data', 'avalara-csv');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'zip-rates');

interface ZipRateEntry {
  r: number;
  n: string;
  s?: number;
  co?: number;
  ci?: number;
  sp?: number;
}

/**
 * Parse an Avalara ZIP5 CSV file.
 * Expected columns: State,ZipCode,TaxRegionName,EstimatedCombinedRate,
 *   StateRate,EstimatedCountyRate,EstimatedCityRate,EstimatedSpecialRate,
 *   RiskLevel
 */
function parseAvalaraCsv(csvContent: string): Record<string, ZipRateEntry> {
  const lines = csvContent.split('\n').filter(l => l.trim());
  if (lines.length < 2) return {};

  const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const zipIdx = header.findIndex(h => /zip/i.test(h));
  const nameIdx = header.findIndex(h => /taxregionname/i.test(h));
  const combinedIdx = header.findIndex(h => /estimatedcombinedrate/i.test(h));
  const stateRateIdx = header.findIndex(h => /^staterate$/i.test(h));
  const countyIdx = header.findIndex(h => /estimatedcountyrate/i.test(h));
  const cityIdx = header.findIndex(h => /estimatedcityrate/i.test(h));
  const specialIdx = header.findIndex(h => /estimatedspecialrate/i.test(h));

  if (zipIdx < 0 || combinedIdx < 0) {
    console.error('CSV missing required columns. Header:', header);
    return {};
  }

  const result: Record<string, ZipRateEntry> = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    const zip = cols[zipIdx]?.padStart(5, '0');
    if (!zip || zip.length !== 5) continue;

    const combined = parseFloat(cols[combinedIdx]) || 0;
    const stateRate = stateRateIdx >= 0 ? parseFloat(cols[stateRateIdx]) || 0 : 0;
    const county = countyIdx >= 0 ? parseFloat(cols[countyIdx]) || 0 : 0;
    const city = cityIdx >= 0 ? parseFloat(cols[cityIdx]) || 0 : 0;
    const special = specialIdx >= 0 ? parseFloat(cols[specialIdx]) || 0 : 0;
    const name = nameIdx >= 0 ? (cols[nameIdx] || '').toUpperCase() : '';

    const entry: ZipRateEntry = { r: round(combined), n: name };
    if (stateRate) entry.s = round(stateRate);
    if (county) entry.co = round(county);
    if (city) entry.ci = round(city);
    if (special) entry.sp = round(special);

    // Keep highest combined rate per ZIP (multiple regions possible)
    if (!result[zip] || result[zip].r < entry.r) {
      result[zip] = entry;
    }
  }

  return result;
}

function round(n: number): number {
  return Math.round(n * 100000) / 100000;
}

function main() {
  if (!fs.existsSync(CSV_DIR)) {
    console.log(`No CSV directory found at ${CSV_DIR}`);
    console.log('Download Avalara CSVs and place them there first.');
    process.exit(1);
  }

  const files = fs.readdirSync(CSV_DIR).filter(f => f.endsWith('.csv'));
  if (files.length === 0) {
    console.log('No CSV files found in', CSV_DIR);
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  let totalZips = 0;

  for (const file of files) {
    const content = fs.readFileSync(path.join(CSV_DIR, file), 'utf-8');
    const rates = parseAvalaraCsv(content);
    const zipCount = Object.keys(rates).length;

    if (zipCount === 0) {
      console.log(`  SKIP ${file} (no valid entries)`);
      continue;
    }

    // Detect state from first entry or filename
    const stateMatch = file.match(/([A-Z]{2})/);
    const state = stateMatch ? stateMatch[1].toLowerCase() : 'unknown';

    const outFile = path.join(OUTPUT_DIR, `${state}-zip-rates.json`);
    fs.writeFileSync(outFile, JSON.stringify(rates, null, 0));
    console.log(`  ${state.toUpperCase()}: ${zipCount} ZIPs → ${outFile}`);
    totalZips += zipCount;
  }

  console.log(`\nTotal: ${totalZips} ZIP codes across ${files.length} files`);
}

main();
