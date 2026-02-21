#!/usr/bin/env tsx
/**
 * California Tax Rates Verification
 * Cross-check specific CA cities against official CDTFA data
 */

import * as https from 'https';
import * as fs from 'fs';

interface CACityRate {
  city: string;
  ourRate: string;
  officialRate?: string;
  status: 'verified' | 'mismatch' | 'pending';
}

const citiesToCheck: string[] = [
  'Los Angeles',
  'Long Beach', 
  'Beverly Hills',
  'San Francisco',
  'San Diego',
  'San Jose',
  'Sacramento',
  'Oakland',
  'Fresno',
  'Santa Ana',
];

async function verifyCARates(): Promise<void> {
  console.log('📊 California Tax Rates Verification\n');
  console.log('Loading our CA tax data...\n');
  
  const caData = JSON.parse(
    fs.readFileSync('../dist/data/ca-tax-rates.json', 'utf-8')
  );
  
  const results: CACityRate[] = [];
  
  for (const cityName of citiesToCheck) {
    const jurisdiction = caData.jurisdictions.find(
      (j: any) => j.location === cityName
    );
    
    if (!jurisdiction) {
      console.log(`⚠️  ${cityName}: NOT FOUND in our data`);
      continue;
    }
    
    results.push({
      city: cityName,
      ourRate: jurisdiction.ratePercent,
      status: 'pending',
    });
    
    console.log(`${cityName}:`);
    console.log(`  Our rate: ${jurisdiction.ratePercent}`);
    console.log(`  County: ${jurisdiction.county}`);
    console.log(`  District tax: ${jurisdiction.districtTax}`);
    console.log(`  Base + district = ${(0.0725 + jurisdiction.districtTax) * 100}%`);
    console.log();
  }
  
  console.log('\n📝 Summary:');
  console.log(`Checked ${results.length} cities from our data`);
  console.log('\nNote: To fully verify these rates, compare against:');
  console.log('https://cdtfa.ca.gov/taxes-and-fees/SalesTaxRates1-1-26.xlsx');
  console.log('or use the CDTFA rate lookup tool:');
  console.log('https://maps.cdtfa.ca.gov/\n');
}

verifyCARates().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
