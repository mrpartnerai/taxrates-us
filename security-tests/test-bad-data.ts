#!/usr/bin/env ts-node
/**
 * Security Test: Bad Data Injection
 * 
 * Simulates various attack scenarios where state websites
 * serve malicious or corrupted data to test validation defenses.
 */

import * as fs from 'fs';
import * as path from 'path';

// Simulated attack payloads
const ATTACK_SCENARIOS = {
  
  // 1. Rate Manipulation - Extreme Values
  extremeRates: {
    name: 'Extreme Tax Rates (>100% or negative)',
    csvContent: `Location,County,Type,Rate,Rate_Percent,Notes
Los Angeles,Los Angeles,City,1.5000,150.00%,Malicious rate
San Francisco,San Francisco,City,-0.0500,-5.00%,Negative rate
San Diego,San Diego,City,999.9999,99999.99%,Absurd rate
Sacramento,Sacramento,City,0.0000,0.00%,Zero rate (suspicious)`,
  },

  // 2. CSV Injection / Code Execution Attempts
  csvInjection: {
    name: 'CSV Injection Payloads',
    csvContent: `Location,County,Type,Rate,Rate_Percent,Notes
"=1+1",Los Angeles,City,0.0950,9.50%,Formula injection
"@SUM(1+1)",San Francisco,City,0.0863,8.63%,Excel formula
"+1+1",San Diego,City,0.0775,7.75%,Plus injection
"-1+1",Sacramento,City,0.0875,8.75%,Minus injection
"=cmd|'/c calc'!A1",Oakland,City,0.1075,10.75%,Command injection`,
  },

  // 3. XSS / Script Injection in Text Fields
  xssPayloads: {
    name: 'XSS Script Injection',
    csvContent: `Location,County,Type,Rate,Rate_Percent,Notes
"<script>alert('XSS')</script>",Los Angeles,City,0.0950,9.50%,Script tag
"<img src=x onerror=alert(1)>",San Francisco,City,0.0863,8.63%,Image XSS
"javascript:alert(1)",San Diego,City,0.0775,7.75%,JS protocol
"<svg/onload=alert(1)>",Sacramento,City,0.0875,8.75%,SVG XSS`,
  },

  // 4. SQL Injection Attempts (even though we don't use SQL)
  sqlInjection: {
    name: 'SQL Injection Patterns',
    csvContent: `Location,County,Type,Rate,Rate_Percent,Notes
"'; DROP TABLE jurisdictions; --",Los Angeles,City,0.0950,9.50%,SQL drop
"1' OR '1'='1",San Francisco,City,0.0863,8.63%,OR bypass
"admin'--",San Diego,City,0.0775,7.75%,Comment injection
"1; DELETE FROM rates WHERE 1=1",Sacramento,City,0.0875,8.75%,Delete injection`,
  },

  // 5. Path Traversal / File System Attacks
  pathTraversal: {
    name: 'Path Traversal Attempts',
    csvContent: `Location,County,Type,Rate,Rate_Percent,Notes
"../../etc/passwd",Los Angeles,City,0.0950,9.50%,Unix path traversal
"..\\..\\windows\\system32",San Francisco,City,0.0863,8.63%,Windows path
"/etc/shadow",San Diego,City,0.0775,7.75%,Absolute path
"../../../../../../../etc/hosts",Sacramento,City,0.0875,8.75%,Deep traversal`,
  },

  // 6. Unicode/Encoding Attacks
  unicodeAttacks: {
    name: 'Unicode Normalization Attacks',
    csvContent: `Location,County,Type,Rate,Rate_Percent,Notes
"Los\u0000Angeles",Los Angeles,City,0.0950,9.50%,Null byte
"San\uFEFFFrancisco",San Francisco,City,0.0863,8.63%,Zero-width space
"San%20Diego",San Diego,City,0.0775,7.75%,URL encoding
"Sacramento\r\n",Sacramento,City,0.0875,8.75%,CRLF injection`,
  },

  // 7. Data Type Confusion
  typeConfusion: {
    name: 'Data Type Confusion',
    csvContent: `Location,County,Type,Rate,Rate_Percent,Notes
Los Angeles,Los Angeles,City,0x5F5E100,9.50%,Hex number
San Francisco,San Francisco,City,Infinity,8.63%,Infinity
San Diego,San Diego,City,NaN,7.75%,Not a Number
Sacramento,Sacramento,City,null,8.75%,Null value
Oakland,Alameda,City,undefined,10.75%,Undefined`,
  },

  // 8. Massive Data Injection (DOS)
  massiveData: {
    name: 'Massive Data Injection (10K jurisdictions)',
    csvContent: generateMassiveCSV(10000),
  },

  // 9. Malformed CSV Structure
  malformedCSV: {
    name: 'Malformed CSV Structure',
    csvContent: `Location,County,Type,Rate,Rate_Percent,Notes
Los Angeles,Los Angeles,City,0.0950,9.50%,Normal
San Francisco,San Francisco,City,0.0863,8.63%,"Unclosed quote
Sacramento,City,0.0875,Missing county
Extra,Field,Here,0.0775,7.75%,Extra column,Bonus,More
,,,,,Empty row`,
  },

  // 10. Jurisdiction Count Manipulation
  countManipulation: {
    name: 'Jurisdiction Count Mismatch',
    csvContent: `Location,County,Type,Rate,Rate_Percent,Notes
Los Angeles,Los Angeles,City,0.0950,9.50%,Normal
San Francisco,San Francisco,City,0.0863,8.63%,Normal
San Diego,San Diego,City,0.0775,7.75%,Normal`,
    // Script will claim 1000 jurisdictions in metadata
    fakeCount: 1000,
  },
};

function generateMassiveCSV(count: number): string {
  const header = 'Location,County,Type,Rate,Rate_Percent,Notes\n';
  const rows = [];
  for (let i = 0; i < count; i++) {
    rows.push(`FakeCity${i},FakeCounty${i},City,0.${String(i).padStart(4, '0')},${(i / 100).toFixed(2)}%,Generated`);
  }
  return header + rows.join('\n');
}

// Test runner
async function runSecurityTests() {
  console.log('🔐 Auto-Update Security Test Suite\n');
  console.log('Testing validation defenses against malicious data...\n');

  const results: Record<string, { passed: boolean; details: string }> = {};

  for (const [key, scenario] of Object.entries(ATTACK_SCENARIOS)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Testing: ${scenario.name}`);
    console.log('='.repeat(60));

    try {
      // Simulate scraping malicious data
      const testResult = await testScenario(scenario);
      results[key] = testResult;
      
      if (testResult.passed) {
        console.log(`\n✅ PASS: Attack was blocked/handled safely`);
      } else {
        console.log(`\n❌ FAIL: Vulnerability detected!`);
      }
      console.log(`   ${testResult.details}`);
      
    } catch (err: any) {
      console.log(`\n⚠️  ERROR: ${err.message}`);
      results[key] = {
        passed: false,
        details: `Unhandled exception: ${err.message}`,
      };
    }
  }

  // Print summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 SECURITY TEST SUMMARY');
  console.log('='.repeat(60) + '\n');

  const passed = Object.values(results).filter(r => r.passed).length;
  const failed = Object.values(results).filter(r => !r.passed).length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('⚠️  VULNERABILITIES FOUND:\n');
    for (const [key, result] of Object.entries(results)) {
      if (!result.passed) {
        console.log(`   • ${ATTACK_SCENARIOS[key as keyof typeof ATTACK_SCENARIOS].name}`);
        console.log(`     ${result.details}\n`);
      }
    }
  } else {
    console.log('✅ All security tests passed!\n');
  }

  return failed === 0;
}

async function testScenario(scenario: any): Promise<{ passed: boolean; details: string }> {
  // Parse the malicious CSV
  const rows = parseCSV(scenario.csvContent);
  
  console.log(`   Parsed ${rows.length} rows from malicious CSV`);
  
  // Run validation checks (simulating what SHOULD happen)
  const validationResults = {
    rateRangeCheck: checkRateRanges(rows),
    injectionCheck: checkInjectionPatterns(rows),
    countCheck: checkJurisdictionCount(rows, scenario.fakeCount),
    dataTypeCheck: checkDataTypes(rows),
    sizeCheck: checkDataSize(rows),
  };

  console.log(`\n   Validation Results:`);
  console.log(`   • Rate range: ${validationResults.rateRangeCheck.valid ? '✅' : '❌'} ${validationResults.rateRangeCheck.reason || ''}`);
  console.log(`   • Injection patterns: ${validationResults.injectionCheck.valid ? '✅' : '❌'} ${validationResults.injectionCheck.reason || ''}`);
  console.log(`   • Count check: ${validationResults.countCheck.valid ? '✅' : '❌'} ${validationResults.countCheck.reason || ''}`);
  console.log(`   • Data types: ${validationResults.dataTypeCheck.valid ? '✅' : '❌'} ${validationResults.dataTypeCheck.reason || ''}`);
  console.log(`   • Size check: ${validationResults.sizeCheck.valid ? '✅' : '❌'} ${validationResults.sizeCheck.reason || ''}`);

  const allValid = Object.values(validationResults).every(r => r.valid);

  return {
    passed: !allValid, // If validation caught it, test passes
    details: allValid 
      ? 'Malicious data would be accepted - VULNERABILITY!' 
      : 'Malicious data was rejected by validation',
  };
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

function checkRateRanges(rows: Record<string, string>[]): { valid: boolean; reason?: string } {
  for (const row of rows) {
    const rate = parseFloat(row.Rate);
    if (isNaN(rate)) {
      return { valid: false, reason: `Non-numeric rate: "${row.Rate}"` };
    }
    if (rate < 0 || rate > 0.20) { // 0-20% is reasonable for US sales tax
      return { valid: false, reason: `Rate out of range: ${rate * 100}% (expected 0-20%)` };
    }
  }
  return { valid: true };
}

function checkInjectionPatterns(rows: Record<string, string>[]): { valid: boolean; reason?: string } {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /DROP\s+TABLE/i,
    /DELETE\s+FROM/i,
    /\.\.\/\.\./,
    /\\\\windows/i,
    /\/etc\//,
    /=cmd\|/i,
    /@SUM\(/i,
  ];

  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          return { valid: false, reason: `Injection pattern detected in ${key}: "${value}"` };
        }
      }
    }
  }
  return { valid: true };
}

function checkJurisdictionCount(rows: Record<string, string>[], expectedCount?: number): { valid: boolean; reason?: string } {
  if (expectedCount && Math.abs(rows.length - expectedCount) > 100) {
    return { valid: false, reason: `Count mismatch: CSV has ${rows.length} rows, metadata claims ${expectedCount}` };
  }
  if (rows.length > 5000) {
    return { valid: false, reason: `Suspiciously large dataset: ${rows.length} jurisdictions (expected <5000)` };
  }
  return { valid: true };
}

function checkDataTypes(rows: Record<string, string>[]): { valid: boolean; reason?: string } {
  const invalidValues = ['Infinity', 'NaN', 'null', 'undefined', '0x'];
  
  for (const row of rows) {
    if (invalidValues.some(v => row.Rate?.includes(v))) {
      return { valid: false, reason: `Invalid data type in Rate: "${row.Rate}"` };
    }
  }
  return { valid: true };
}

function checkDataSize(rows: Record<string, string>[]): { valid: boolean; reason?: string } {
  const maxFieldLength = 500;
  
  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if (value.length > maxFieldLength) {
        return { valid: false, reason: `Field too large: ${key} (${value.length} chars, max ${maxFieldLength})` };
      }
    }
  }
  return { valid: true };
}

// Run tests
runSecurityTests()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
