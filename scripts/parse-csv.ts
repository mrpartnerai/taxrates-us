#!/usr/bin/env ts-node
/**
 * Parse CDTFA CSV data into structured JSON format
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

function buildTaxRateData(csvData: CSVRow[]): TaxRateData {
  const jurisdictions: Jurisdiction[] = csvData.map(row => {
    const rate = parseFloat(row.Rate);
    const districtTax = Math.round((rate - CA_STATE_BASE_RATE) * 10000) / 10000;
    
    return {
      location: row.Location,
      type: row.Type as any,
      county: row.County,
      rate: rate,
      ratePercent: `${(rate * 100).toFixed(2)}%`,
      districtTax: districtTax,
      notes: row.Notes || null
    };
  });
  
  const byCity: Record<string, Jurisdiction> = {};
  const byCounty: Record<string, Jurisdiction> = {};
  
  jurisdictions.forEach(jurisdiction => {
    const key = jurisdiction.location.toLowerCase();
    
    if (jurisdiction.type === 'County') {
      byCounty[key] = jurisdiction;
      // Also allow lookup by "County Name County" format
      const countyKey = `${jurisdiction.location.toLowerCase()} county`;
      byCounty[countyKey] = jurisdiction;
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
      version: '0.1.0'
    },
    jurisdictions,
    lookup: {
      byCity,
      byCounty
    }
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
  
  console.log(`✅ Successfully created ${outputPath}`);
  console.log(`   Jurisdictions: ${taxRateData.metadata.jurisdictionCount}`);
  console.log(`   Cities in index: ${Object.keys(taxRateData.lookup.byCity).length}`);
  console.log(`   Counties in index: ${Object.keys(taxRateData.lookup.byCounty).length}`);
}

main();
