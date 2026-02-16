#!/usr/bin/env ts-node
/**
 * Multi-state tax rate scraper.
 * 
 * Fetches the latest tax rate data from official state sources
 * and writes staged JSON files for diffing.
 * 
 * Currently supports:
 *   - CA (CDTFA CSV download)
 * 
 * More states can be added as scrapers are built.
 * States without scrapers are skipped (manual update only).
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { validateJurisdiction, validateDataset } from './validate-jurisdiction';

const STAGED_DIR = path.join(__dirname, '..', '..', 'staged-data');
const DATA_DIR = path.join(__dirname, '..', '..', 'src', 'data');

// --- Utility ---

function fetch(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        if (res.headers.location) return fetch(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} from ${url}`));
        return;
      }
      let data = '';
      res.on('data', (c: Buffer) => data += c);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  return lines.slice(1).map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
      else { current += char; }
    }
    values.push(current.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
}

// --- State Scrapers ---

interface ScraperResult {
  state: string;
  data: any; // Full JSON structure matching *-tax-rates.json format
  error?: string;
}

/**
 * California - CDTFA CSV
 * The URL pattern changes each quarter. We try the current quarter's URL,
 * falling back to copying existing data unchanged.
 */
async function scrapeCA(): Promise<ScraperResult> {
  const state = 'ca';
  try {
    // Try known URL patterns for CDTFA downloads
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    const year = now.getFullYear().toString().slice(-2);
    const qStart = `${quarter * 3 - 2}-1-${year}`;
    
    const urls = [
      // Current known URL
      'https://www.cdtfa.ca.gov/dataportal/dataset/e8cdaca5-36ea-4b2d-a4e3-c5fb7d302dc3/resource/32431b15-be25-451b-b37c-c5e6f7e22c9a/download/salestaxrates1-1-26.csv',
      // Try quarterly pattern
      `https://www.cdtfa.ca.gov/dataportal/dataset/e8cdaca5-36ea-4b2d-a4e3-c5fb7d302dc3/resource/32431b15-be25-451b-b37c-c5e6f7e22c9a/download/salestaxrates${qStart}.csv`,
    ];

    let csvContent: string | null = null;
    for (const url of urls) {
      try {
        csvContent = await fetch(url);
        if (csvContent && csvContent.length > 1000) break;
      } catch { continue; }
    }

    if (!csvContent) {
      return { state, data: null, error: 'Could not download CDTFA CSV from any known URL' };
    }

    const rows = parseCSV(csvContent);
    
    // Build jurisdictions
    const stateBaseRate = 0.0725; // CA state rate
    const jurisdictions = rows
      .filter(r => r.Location && r.Rate)
      .map(r => {
        const rate = parseFloat(r.Rate);
        const districtTax = Math.round((rate - stateBaseRate) * 10000) / 10000;
        return {
          location: r.Location,
          type: r.Type || 'City',
          county: r.County || 'Unknown',
          rate,
          ratePercent: r.Rate_Percent || `${(rate * 100).toFixed(2)}%`,
          districtTax: Math.max(0, districtTax),
          notes: r.Notes || null,
        };
      })
      .filter(j => {
        // SECURITY: Validate each jurisdiction before including
        const validation = validateJurisdiction(j, 'CA');
        if (!validation.valid) {
          console.error(`   ❌ Invalid jurisdiction: ${j.location}`);
          for (const error of validation.errors) {
            console.error(`      • ${error}`);
          }
          return false; // Reject this jurisdiction
        }
        if (validation.warnings.length > 0) {
          console.warn(`   ⚠️  Warnings for ${j.location}:`);
          for (const warning of validation.warnings) {
            console.warn(`      • ${warning}`);
          }
        }
        return true; // Accept this jurisdiction
      });

    const data = {
      metadata: {
        effectiveDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
        source: 'California Department of Tax and Fee Administration (CDTFA)',
        lastUpdated: now.toISOString().split('T')[0],
        jurisdictionCount: jurisdictions.length,
        version: '0.1.0',
      },
      jurisdictions,
    };

    // SECURITY: Final dataset validation before accepting scraped data
    const finalValidation = validateDataset(data, 'CA');
    if (!finalValidation.valid) {
      console.error('   ❌ Dataset validation failed:');
      for (const error of finalValidation.errors) {
        console.error(`      • ${error}`);
      }
      return { state, data: null, error: 'Dataset validation failed' };
    }

    if (finalValidation.warnings.length > 0) {
      console.warn('   ⚠️  Dataset warnings:');
      for (const warning of finalValidation.warnings) {
        console.warn(`      • ${warning}`);
      }
    }

    return { state, data };
  } catch (err: any) {
    return { state, data: null, error: err.message };
  }
}

// Registry of state scrapers
const SCRAPERS: Record<string, () => Promise<ScraperResult>> = {
  ca: scrapeCA,
  // Add more states here as scrapers are built:
  // ny: scrapeNY,
  // tx: scrapeTX,
  // wa: scrapeWA,
};

// --- Main ---

async function main() {
  console.log('🔄 Tax Rate Auto-Update Scraper');
  console.log(`   ${Object.keys(SCRAPERS).length} state scrapers registered\n`);

  // Create staged directory
  if (!fs.existsSync(STAGED_DIR)) {
    fs.mkdirSync(STAGED_DIR, { recursive: true });
  }

  const results: { state: string; status: string; error?: string }[] = [];

  for (const [state, scraper] of Object.entries(SCRAPERS)) {
    console.log(`📥 Scraping ${state.toUpperCase()}...`);
    try {
      const result = await scraper();
      if (result.data) {
        const outPath = path.join(STAGED_DIR, `${state}-tax-rates.json`);
        fs.writeFileSync(outPath, JSON.stringify(result.data, null, 2));
        console.log(`   ✅ ${result.data.jurisdictions?.length || 0} jurisdictions`);
        results.push({ state, status: 'ok' });
      } else {
        console.log(`   ⚠️ Skipped: ${result.error}`);
        results.push({ state, status: 'skipped', error: result.error });
      }
    } catch (err: any) {
      console.log(`   ❌ Error: ${err.message}`);
      results.push({ state, status: 'error', error: err.message });
    }
  }

  // For states without scrapers, copy current data to staged for diffing consistency
  const allDataFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('-tax-rates.json'));
  for (const file of allDataFiles) {
    const state = file.replace('-tax-rates.json', '');
    if (!SCRAPERS[state]) {
      // Copy current as-is (no scraper = no change expected)
      fs.copyFileSync(path.join(DATA_DIR, file), path.join(STAGED_DIR, file));
    }
  }

  // Write scrape summary
  const summary = {
    timestamp: new Date().toISOString(),
    results,
    scrapersRun: Object.keys(SCRAPERS).length,
    totalStaged: fs.readdirSync(STAGED_DIR).filter(f => f.endsWith('.json') && f !== 'diff-report.json').length,
  };
  fs.writeFileSync(path.join(STAGED_DIR, 'scrape-summary.json'), JSON.stringify(summary, null, 2));
  
  console.log(`\n📊 Summary: ${results.filter(r => r.status === 'ok').length} scraped, ${results.filter(r => r.status === 'skipped').length} skipped, ${results.filter(r => r.status === 'error').length} errors`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
