#!/usr/bin/env tsx
/**
 * Tax Rate Validation Script
 * Cross-references taxrates-us data against official state tax authority sources
 * Spot-checks 5-10 cities per state and reports discrepancies
 */

import * as fs from 'fs';
import * as path from 'path';

interface Jurisdiction {
  location: string;
  type: string;
  county: string;
  rate: number;
  ratePercent: string;
  districtTax: number;
  notes: string | null;
}

interface TaxRateFile {
  metadata: {
    effectiveDate: string;
    source: string;
    lastUpdated: string;
    jurisdictionCount: number;
    version: string;
  };
  jurisdictions: Jurisdiction[];
}

interface ValidationResult {
  state: string;
  passed: number;
  failed: number;
  errors: Array<{
    location: string;
    expected: string;
    actual: string;
    type: 'rate_mismatch' | 'missing' | 'format_error';
  }>;
}

// Official state tax rates for validation (as of 2026-01-01)
// These are spot-checked against official state sources
const OFFICIAL_RATES: Record<string, Record<string, number>> = {
  CA: {
    // California base rate
    'California': 0.0725,
    // Major cities - spot check sample
    'Los Angeles': 0.0950,
    'San Francisco': 0.08625,
    'San Diego': 0.0775,
    'San Jose': 0.09375,
    'Sacramento': 0.08750,
    'Oakland': 0.10750,
    'Fresno': 0.08350,
    'Long Beach': 0.10250,
    'Santa Ana': 0.09250,
    'Beverly Hills': 0.0950,
  },
  TX: {
    // Texas base rate
    'Texas': 0.0625,
    // Major cities
    'Houston': 0.0825,
    'Dallas': 0.0825,
    'San Antonio': 0.0825,
    'Austin': 0.0825,
    'Fort Worth': 0.0825,
    'El Paso': 0.0825,
    'Plano': 0.0825,
    'Corpus Christi': 0.0825,
  },
  NY: {
    // New York base rate
    'New York': 0.0400,
    // Major cities
    'New York City': 0.08875,
    'Buffalo': 0.0875,
    'Rochester': 0.0800,
    'Yonkers': 0.08375,
    'Syracuse': 0.0800,
    'Albany': 0.0800,
  },
  FL: {
    // Florida base rate (no local jurisdictions in our data)
    'Florida': 0.0600,
  },
  WA: {
    // Washington base rate
    'Washington': 0.0650,
  },
  NV: {
    // Nevada base rate
    'Nevada': 0.0685,
  },
  OR: {
    // Oregon - no sales tax
    'Oregon': 0.0000,
  },
};

class TaxRateValidator {
  private distDir = path.join(__dirname, '../dist/data');
  private results: ValidationResult[] = [];

  async validateAllStates(): Promise<void> {
    console.log('🔍 Starting tax rate validation...\n');
    
    const states = ['ca', 'tx', 'ny', 'fl', 'wa', 'nv', 'or'];
    
    for (const state of states) {
      await this.validateState(state);
    }
    
    this.printReport();
  }

  private async validateState(state: string): Promise<void> {
    const stateUpper = state.toUpperCase();
    console.log(`\n═══ Validating ${stateUpper} ═══`);
    
    const filePath = path.join(this.distDir, `${state}-tax-rates.json`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return;
    }
    
    const data: TaxRateFile = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    console.log(`📊 Metadata:`);
    console.log(`   Source: ${data.metadata.source}`);
    console.log(`   Effective Date: ${data.metadata.effectiveDate}`);
    console.log(`   Last Updated: ${data.metadata.lastUpdated}`);
    console.log(`   Jurisdiction Count: ${data.metadata.jurisdictionCount}`);
    console.log(`   Jurisdictions in file: ${data.jurisdictions.length}`);
    
    // Check metadata consistency
    if (data.metadata.jurisdictionCount !== data.jurisdictions.length) {
      console.warn(`⚠️  Metadata jurisdiction count (${data.metadata.jurisdictionCount}) does not match actual count (${data.jurisdictions.length})`);
    }
    
    const result: ValidationResult = {
      state: stateUpper,
      passed: 0,
      failed: 0,
      errors: [],
    };
    
    // Validate against official rates
    const officialRates = OFFICIAL_RATES[stateUpper] || {};
    const locationsToCheck = Object.keys(officialRates);
    
    console.log(`\n🔎 Spot-checking ${locationsToCheck.length} locations...`);
    
    for (const location of locationsToCheck) {
      const expectedRate = officialRates[location];
      const jurisdiction = data.jurisdictions.find(
        j => j.location === location
      );
      
      if (!jurisdiction) {
        result.failed++;
        result.errors.push({
          location,
          expected: this.formatRate(expectedRate),
          actual: 'NOT FOUND',
          type: 'missing',
        });
        console.log(`   ❌ ${location}: NOT FOUND (expected ${this.formatRate(expectedRate)})`);
        continue;
      }
      
      // Check rate match (allow small floating point differences)
      const rateDiff = Math.abs(jurisdiction.rate - expectedRate);
      if (rateDiff > 0.00001) {
        result.failed++;
        result.errors.push({
          location,
          expected: this.formatRate(expectedRate),
          actual: jurisdiction.ratePercent,
          type: 'rate_mismatch',
        });
        console.log(`   ❌ ${location}: ${jurisdiction.ratePercent} (expected ${this.formatRate(expectedRate)})`);
      } else {
        result.passed++;
        console.log(`   ✅ ${location}: ${jurisdiction.ratePercent}`);
      }
      
      // Check format consistency
      const expectedFormatted = this.formatRate(jurisdiction.rate);
      if (jurisdiction.ratePercent !== expectedFormatted) {
        console.warn(`   ⚠️  ${location}: ratePercent format inconsistency (${jurisdiction.ratePercent} vs calculated ${expectedFormatted})`);
      }
    }
    
    // Additional format validation
    console.log(`\n🔧 Checking data format consistency...`);
    let formatIssues = 0;
    
    for (const jurisdiction of data.jurisdictions) {
      // Check that rate and ratePercent match
      const expectedPercent = this.formatRate(jurisdiction.rate);
      if (jurisdiction.ratePercent !== expectedPercent) {
        formatIssues++;
        if (formatIssues <= 5) { // Only show first 5
          console.log(`   ⚠️  ${jurisdiction.location}: ratePercent="${jurisdiction.ratePercent}" but calculated="${expectedPercent}"`);
        }
      }
      
      // Check required fields
      if (!jurisdiction.location || !jurisdiction.type || !jurisdiction.county) {
        formatIssues++;
        console.log(`   ⚠️  ${jurisdiction.location || 'UNKNOWN'}: Missing required fields`);
      }
    }
    
    if (formatIssues > 5) {
      console.log(`   ⚠️  ... and ${formatIssues - 5} more format issues`);
    }
    
    this.results.push(result);
  }

  private formatRate(rate: number): string {
    // Match the format used in the data files (3 decimal places, trailing zeros removed)
    const percent = (rate * 100).toFixed(3);
    // Remove trailing zeros after decimal
    return percent.replace(/\.?0+$/, '') + '%';
  }

  private printReport(): void {
    console.log('\n\n═══════════════════════════════════════════');
    console.log('📋 VALIDATION REPORT');
    console.log('═══════════════════════════════════════════\n');
    
    let totalPassed = 0;
    let totalFailed = 0;
    let totalErrors: typeof this.results[0]['errors'] = [];
    
    for (const result of this.results) {
      totalPassed += result.passed;
      totalFailed += result.failed;
      totalErrors = totalErrors.concat(result.errors);
      
      const status = result.failed === 0 ? '✅' : '❌';
      console.log(`${status} ${result.state}: ${result.passed} passed, ${result.failed} failed`);
    }
    
    console.log(`\n📊 Overall: ${totalPassed} passed, ${totalFailed} failed`);
    
    if (totalErrors.length > 0) {
      console.log('\n⚠️  ERRORS FOUND:\n');
      
      const byState: Record<string, typeof totalErrors> = {};
      for (const error of totalErrors) {
        const state = this.results.find(r => 
          r.errors.includes(error)
        )?.state || 'UNKNOWN';
        
        if (!byState[state]) byState[state] = [];
        byState[state].push(error);
      }
      
      for (const [state, errors] of Object.entries(byState)) {
        console.log(`\n${state}:`);
        for (const error of errors) {
          console.log(`  • ${error.location}:`);
          console.log(`    Expected: ${error.expected}`);
          console.log(`    Actual: ${error.actual}`);
          console.log(`    Type: ${error.type}`);
        }
      }
    } else {
      console.log('\n✅ No errors found! All spot-checked rates match official sources.');
    }
    
    console.log('\n═══════════════════════════════════════════\n');
  }
}

// Run validation
const validator = new TaxRateValidator();
validator.validateAllStates().catch(err => {
  console.error('Validation failed:', err);
  process.exit(1);
});
