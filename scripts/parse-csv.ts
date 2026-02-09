#!/usr/bin/env ts-node
/**
 * Parse CDTFA CSV data into structured JSON format
 * 
 * Input: data/SalesTaxRates1-1-26-cleaned.csv
 * Output: src/data/ca-tax-rates.json
 */

import * as fs from 'fs';
import * as path from 'path';

interface CSVRow {
  Location: string;
  Rate: string;
  Rate_Percent: string;
  County: string;
  Type: string;
  Notes: string;
}

interface Jurisdiction {
  location: string;
  type: 'City' | 'County' | 'Unincorporated Area';
  county: string;
  rate: number;
  ratePercent: string;
  districtTax: number;
  notes: string | null;
}

interface TaxRateData {
  metadata: {
    effectiveDate: string;
    source: string;
    lastUpdated: string;
    jurisdictionCount: number;
    version: string;
  };
  jurisdictions: Jurisdiction[];
  lookup: {
    byCity: Record<string, Jurisdiction>;
    byCounty: Record<string, Jurisdiction>;
  };
}

const CA_STATE_BASE_RATE = 0.0725;

function parseCSV(filePath: string): CSVRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row: any = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index] || '';
    });
    
    return row as CSVRow;
  });
}

function determineType(row: CSVRow): 'City' | 'County' | 'Unincorporated Area' {
  // The CDTFA CSV marks unincorporated areas as "County" type,
  // but they have "Unincorporated Area" in their location name
  if (row.Location.includes('Unincorporated Area')) {
    return 'Unincorporated Area';
  }
  if (row.Type === 'County' || row.Location.includes('County')) {
    return 'County';
  }
  return 'City';
}

function formatRatePercent(rate: number): string {
  // Round to 2 decimal places for display, but support 3 for rates like 9.375%
  const pct = rate * 100;
  // Use 3 decimal places only if the third decimal is non-zero
  const rounded3 = Math.round(pct * 1000) / 1000;
  const rounded2 = Math.round(pct * 100) / 100;
  
  if (Math.abs(rounded3 - rounded2) > 0.0001) {
    // Has meaningful third decimal (like 9.375%)
    return `${rounded3.toFixed(3)}%`;
  }
  return `${rounded2.toFixed(2)}%`;
}

function buildTaxRateData(csvData: CSVRow[]): TaxRateData {
  const jurisdictions: Jurisdiction[] = csvData.map(row => {
    const rate = parseFloat(row.Rate);
    const districtTax = Math.round((rate - CA_STATE_BASE_RATE) * 10000) / 10000;
    const type = determineType(row);
    
    return {
      location: row.Location,
      type,
      county: row.County,
      rate,
      ratePercent: formatRatePercent(rate),
      districtTax: Math.max(0, districtTax), // Ensure non-negative
      notes: row.Notes || null,
    };
  });
  
  const byCity: Record<string, Jurisdiction> = {};
  const byCounty: Record<string, Jurisdiction> = {};
  
  jurisdictions.forEach(jurisdiction => {
    const key = jurisdiction.location.toLowerCase();
    
    if (jurisdiction.type === 'County') {
      byCounty[key] = jurisdiction;
      // Also index by just the county name (without "County" suffix)
      // e.g., "alameda county" → also store as "alameda"
      if (key.endsWith(' county')) {
        const shortKey = key.replace(/ county$/, '');
        // Only if there's no city with that name
        if (!jurisdictions.some(j => j.type === 'City' && j.location.toLowerCase() === shortKey)) {
          byCounty[shortKey] = jurisdiction;
        }
      }
    } else if (jurisdiction.type === 'Unincorporated Area') {
      // Store under their full name in county lookup
      byCounty[key] = jurisdiction;
    } else {
      byCity[key] = jurisdiction;
    }
  });
  
  return {
    metadata: {
      effectiveDate: '2026-01-01',
      source: 'California Department of Tax and Fee Administration (CDTFA)',
      lastUpdated: new Date().toISOString().split('T')[0],
      jurisdictionCount: jurisdictions.length,
      version: '0.1.0',
    },
    jurisdictions,
    lookup: {
      byCity,
      byCounty,
    },
  };
}

function main() {
  const csvPath = path.join(__dirname, '..', 'data', 'SalesTaxRates1-1-26-cleaned.csv');
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'ca-tax-rates.json');
  
  console.log('📊 Parsing CDTFA CSV data...');
  const csvData = parseCSV(csvPath);
  console.log(`   Found ${csvData.length} jurisdictions`);
  
  console.log('🔨 Building structured tax rate data...');
  const taxRateData = buildTaxRateData(csvData);
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('💾 Writing JSON file...');
  fs.writeFileSync(outputPath, JSON.stringify(taxRateData, null, 2), 'utf-8');
  
  // Stats
  const types = taxRateData.jurisdictions.reduce((acc: Record<string, number>, j) => {
    acc[j.type] = (acc[j.type] || 0) + 1;
    return acc;
  }, {});
  
  console.log(`✅ Successfully created ${outputPath}`);
  console.log(`   Jurisdictions: ${taxRateData.metadata.jurisdictionCount}`);
  console.log(`   Types: ${JSON.stringify(types)}`);
  console.log(`   Cities in index: ${Object.keys(taxRateData.lookup.byCity).length}`);
  console.log(`   Counties in index: ${Object.keys(taxRateData.lookup.byCounty).length}`);
  
  // Validate: spot-check some known rates
  const checks = [
    { name: 'Sacramento', lookup: taxRateData.lookup.byCity['sacramento'], expected: 0.0875 },
    { name: 'Los Angeles', lookup: taxRateData.lookup.byCity['los angeles'], expected: 0.095 },
    { name: 'Lancaster', lookup: taxRateData.lookup.byCity['lancaster'], expected: 0.1125 },
    { name: 'Alpine County', lookup: taxRateData.lookup.byCounty['alpine county'], expected: 0.0725 },
  ];
  
  let allPassed = true;
  for (const check of checks) {
    if (!check.lookup || check.lookup.rate !== check.expected) {
      console.error(`❌ Validation failed: ${check.name} expected ${check.expected}, got ${check.lookup?.rate}`);
      allPassed = false;
    }
  }
  
  if (allPassed) {
    console.log('✅ Spot-check validation passed');
  }
}

main();
