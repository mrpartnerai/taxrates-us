#!/usr/bin/env ts-node
/**
 * Update tax rates by fetching the latest CDTFA data
 * 
 * This script:
 * 1. Downloads the latest CDTFA CSV file
 * 2. Parses and validates the data
 * 3. Checks for anomalies
 * 4. Rebuilds the ca-tax-rates.json file
 * 
 * Usage: npm run update-rates
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const CDTFA_DOWNLOAD_URL = 'https://www.cdtfa.ca.gov/dataportal/dataset/e8cdaca5-36ea-4b2d-a4e3-c5fb7d302dc3/resource/32431b15-be25-451b-b37c-c5e6f7e22c9a/download/salestaxrates1-1-26.csv';

interface CSVRow {
  Location: string;
  Rate: string;
  Rate_Percent: string;
  County: string;
  Type: string;
  Notes: string;
}

/**
 * Download file from URL
 */
function downloadFile(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading from ${url}...`);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        if (response.headers.location) {
          return downloadFile(response.headers.location).then(resolve).catch(reject);
        }
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Parse CSV data
 */
function parseCSV(content: string): CSVRow[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
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
      row[header] = values[index] || '';
    });
    
    return row as CSVRow;
  });
}

/**
 * Validate and detect anomalies in the data
 */
function validateData(data: CSVRow[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check minimum jurisdictions (CA should have 500+)
  if (data.length < 500) {
    errors.push(`Expected at least 500 jurisdictions, found ${data.length}`);
  }
  
  // Check for missing required fields
  data.forEach((row, index) => {
    if (!row.Location || !row.Rate || !row.County || !row.Type) {
      errors.push(`Row ${index + 1}: Missing required fields`);
    }
    
    const rate = parseFloat(row.Rate);
    if (isNaN(rate)) {
      errors.push(`Row ${index + 1}: Invalid rate "${row.Rate}"`);
    } else if (rate < 0.07 || rate > 0.15) {
      errors.push(`Row ${index + 1}: Rate ${rate} outside expected range (0.07-0.15)`);
    }
  });
  
  // Check for duplicates
  const locations = new Set<string>();
  data.forEach((row, index) => {
    const key = `${row.Location}|${row.County}|${row.Type}`;
    if (locations.has(key)) {
      errors.push(`Row ${index + 1}: Duplicate jurisdiction "${row.Location}"`);
    }
    locations.add(key);
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

async function main() {
  console.log('🔄 Updating California tax rates...\n');
  
  try {
    // Download latest data
    const csvContent = await downloadFile(CDTFA_DOWNLOAD_URL);
    console.log('✅ Downloaded successfully\n');
    
    // Parse CSV
    console.log('📊 Parsing CSV data...');
    const data = parseCSV(csvContent);
    console.log(`   Found ${data.length} jurisdictions\n`);
    
    // Validate
    console.log('🔍 Validating data...');
    const validation = validateData(data);
    
    if (!validation.valid) {
      console.error('❌ Validation failed:');
      validation.errors.forEach(err => console.error(`   - ${err}`));
      process.exit(1);
    }
    console.log('✅ Validation passed\n');
    
    // Save cleaned CSV
    const csvPath = path.join(__dirname, '..', 'data', 'SalesTaxRates1-1-26-cleaned.csv');
    const csvLines = [
      'Location,Rate,Rate_Percent,County,Type,Notes',
      ...data.map(row => 
        `${row.Location},${row.Rate},${row.Rate_Percent},${row.County},${row.Type},${row.Notes || ''}`
      )
    ];
    fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf-8');
    console.log(`💾 Saved cleaned CSV to ${csvPath}\n`);
    
    // Rebuild JSON using parse-csv script
    console.log('🔨 Rebuilding JSON data...');
    const { execSync } = require('child_process');
    execSync('npx tsx scripts/parse-csv.ts', { stdio: 'inherit' });
    
    console.log('\n✅ Tax rates updated successfully!');
    console.log('\nNext steps:');
    console.log('  1. Review the changes');
    console.log('  2. Run tests: npm test');
    console.log('  3. Commit and publish if all tests pass');
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

main();
