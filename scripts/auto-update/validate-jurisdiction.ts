/**
 * Jurisdiction Validation Module
 * 
 * Validates scraped tax jurisdiction data to prevent malicious or corrupted
 * data from being committed to the repository.
 * 
 * Usage:
 *   import { validateJurisdiction } from './validate-jurisdiction';
 *   
 *   const isValid = validateJurisdiction(jurisdictionData, 'CA');
 *   if (!isValid) {
 *     console.error('Invalid jurisdiction data');
 *   }
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a single jurisdiction record
 */
export function validateJurisdiction(j: any, state: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Required fields check (support both capitalized and lowercase field names)
  const location = j.location || j.Location;
  const county = j.county || j.County;
  const rate = j.rate !== undefined ? j.rate : j.Rate;
  const type = j.type || j.Type;
  const notes = j.notes || j.Notes;

  if (!location || typeof location !== 'string') {
    errors.push('Missing or invalid location field');
  }
  
  if (!county || typeof county !== 'string') {
    errors.push('Missing or invalid county field');
  }
  
  if (rate === undefined) {
    errors.push('Missing rate field');
  }

  // 2. Field length limits (prevent DoS via massive strings)
  const MAX_LOCATION_LENGTH = 200;
  const MAX_COUNTY_LENGTH = 100;
  const MAX_NOTES_LENGTH = 500;

  if (location && location.length > MAX_LOCATION_LENGTH) {
    errors.push(`Location field too long: ${location.length} chars (max ${MAX_LOCATION_LENGTH})`);
  }

  if (county && county.length > MAX_COUNTY_LENGTH) {
    errors.push(`County field too long: ${county.length} chars (max ${MAX_COUNTY_LENGTH})`);
  }

  if (notes && notes.length > MAX_NOTES_LENGTH) {
    warnings.push(`Notes field very long: ${notes.length} chars`);
  }

  // 3. Injection pattern detection
  const dangerousPatterns = [
    // XSS patterns
    { pattern: /<script/i, name: 'Script tag' },
    { pattern: /javascript:/i, name: 'JavaScript protocol' },
    { pattern: /onerror\s*=/i, name: 'onerror handler' },
    { pattern: /onload\s*=/i, name: 'onload handler' },
    { pattern: /<iframe/i, name: 'iframe tag' },
    { pattern: /<embed/i, name: 'embed tag' },
    
    // SQL injection patterns (defense in depth, even though we don't use SQL)
    { pattern: /DROP\s+TABLE/i, name: 'SQL DROP' },
    { pattern: /DELETE\s+FROM/i, name: 'SQL DELETE' },
    { pattern: /INSERT\s+INTO/i, name: 'SQL INSERT' },
    { pattern: /UPDATE\s+.*\s+SET/i, name: 'SQL UPDATE' },
    { pattern: /;\s*--/, name: 'SQL comment' },
    { pattern: /'\s+OR\s+'1'\s*=/i, name: 'SQL OR bypass' },
    
    // Path traversal
    { pattern: /\.\.[\/\\]/, name: 'Path traversal' },
    { pattern: /\/etc\//i, name: 'Unix system path' },
    { pattern: /\\\\windows\\/i, name: 'Windows system path' },
    
    // CSV injection (Excel formula injection)
    { pattern: /^[=+\-@]/, name: 'CSV formula injection' },
    { pattern: /@SUM\(/i, name: 'Excel SUM function' },
    { pattern: /=cmd\|/i, name: 'Excel command execution' },
    
    // Command injection
    { pattern: /`.*`/, name: 'Backtick command' },
    { pattern: /\$\(.*\)/, name: 'Command substitution' },
  ];

  const fieldsToCheck = [
    { name: 'location', value: location },
    { name: 'county', value: county },
    { name: 'type', value: type },
    { name: 'notes', value: notes },
  ];

  for (const field of fieldsToCheck) {
    if (!field.value) continue;
    
    for (const { pattern, name } of dangerousPatterns) {
      if (pattern.test(field.value)) {
        errors.push(`SECURITY: ${name} detected in ${field.name}: "${field.value}"`);
      }
    }
  }

  // 4. Rate validation
  const rateValue = typeof rate === 'number' ? rate : parseFloat(rate);
  
  if (isNaN(rateValue)) {
    errors.push(`Invalid rate (not a number): "${rate}"`);
  } else if (!isFinite(rateValue)) {
    errors.push(`Invalid rate (Infinity or -Infinity): "${rate}"`);
  } else {
    // US sales tax rates are typically 0-20%
    // Some localities can be higher, but >20% is suspicious
    const MIN_RATE = 0.0;
    const MAX_RATE = 0.20; // 20%
    const WARN_RATE = 0.15; // 15% (high but plausible)

    if (rateValue < MIN_RATE) {
      errors.push(`Rate below minimum: ${(rateValue * 100).toFixed(2)}% (min ${MIN_RATE * 100}%)`);
    }
    
    if (rateValue > MAX_RATE) {
      errors.push(`Rate exceeds maximum: ${(rateValue * 100).toFixed(2)}% (max ${MAX_RATE * 100}%)`);
    } else if (rateValue > WARN_RATE) {
      warnings.push(`Unusually high rate: ${(rateValue * 100).toFixed(2)}% (expected <${WARN_RATE * 100}%)`);
    }
  }

  // 5. Type validation (should be recognized jurisdiction type)
  const validTypes = ['State', 'City', 'County', 'District', 'Special', 'Unincorporated Area', 'Transit District'];
  if (type && !validTypes.includes(type)) {
    warnings.push(`Unusual jurisdiction type: "${type}" (expected: ${validTypes.join(', ')})`);
  }

  // 6. Unicode validation (check for suspicious characters)
  const suspiciousUnicodePatterns = [
    { pattern: /\u0000/, name: 'Null byte' },
    { pattern: /\uFEFF/, name: 'Zero-width no-break space' },
    { pattern: /[\u200B-\u200D\uFEFF]/, name: 'Zero-width character' },
  ];

  for (const field of fieldsToCheck) {
    if (!field.value) continue;
    
    for (const { pattern, name } of suspiciousUnicodePatterns) {
      if (pattern.test(field.value)) {
        warnings.push(`Suspicious Unicode (${name}) in ${field.name}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates an entire dataset (all jurisdictions + metadata)
 */
export function validateDataset(data: any, state: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Check structure
  if (!data.metadata) {
    errors.push('Missing metadata object');
  }
  
  if (!data.jurisdictions || !Array.isArray(data.jurisdictions)) {
    errors.push('Missing or invalid jurisdictions array');
    return { valid: false, errors, warnings };
  }

  // 2. Jurisdiction count sanity
  const count = data.jurisdictions.length;
  // States with full scraper coverage have hundreds of jurisdictions;
  // states with only state-level data have 1-10. Use dynamic threshold.
  const FULLY_SCRAPED_STATES = ['ca']; // Add states here as scrapers are built
  const stateKey = (state || '').toLowerCase();
  const MIN_COUNT = FULLY_SCRAPED_STATES.includes(stateKey) ? 50 : 1;
  const MAX_COUNT = 5000; // >5000 is suspiciously large

  if (count < MIN_COUNT) {
    errors.push(`Too few jurisdictions: ${count} (expected >${MIN_COUNT})`);
  }
  
  if (count > MAX_COUNT) {
    errors.push(`Too many jurisdictions: ${count} (expected <${MAX_COUNT}) - possible DoS attack`);
  }

  // 3. Metadata consistency
  if (data.metadata && data.metadata.jurisdictionCount !== count) {
    warnings.push(`Metadata count mismatch: metadata says ${data.metadata.jurisdictionCount}, but array has ${count}`);
  }

  // 4. Check for duplicates
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const j of data.jurisdictions) {
    const key = `${j.location}|${j.county}|${j.type}`.toLowerCase();
    if (seen.has(key)) {
      duplicates.push(`${j.location} (${j.county})`);
    }
    seen.add(key);
  }

  if (duplicates.length > 0) {
    errors.push(`Duplicate jurisdictions found: ${duplicates.slice(0, 10).join(', ')}${duplicates.length > 10 ? ` and ${duplicates.length - 10} more` : ''}`);
  }

  // 5. Validate each jurisdiction
  let invalidCount = 0;
  for (const j of data.jurisdictions) {
    const result = validateJurisdiction(j, state);
    if (!result.valid) {
      invalidCount++;
      if (invalidCount <= 10) { // Only report first 10
        errors.push(`Invalid jurisdiction "${j.location}": ${result.errors.join(', ')}`);
      }
    }
    warnings.push(...result.warnings);
  }

  if (invalidCount > 10) {
    errors.push(`... and ${invalidCount - 10} more invalid jurisdictions`);
  }

  // 6. Statistical anomaly detection
  const rates = data.jurisdictions.map((j: any) => parseFloat(j.rate)).filter((r: number) => !isNaN(r));
  if (rates.length > 0) {
    const mean = rates.reduce((a: number, b: number) => a + b, 0) / rates.length;
    const stdDev = Math.sqrt(rates.reduce((sum: number, r: number) => sum + Math.pow(r - mean, 2), 0) / rates.length);
    
    // Check for outliers (>3 standard deviations from mean)
    const outliers = data.jurisdictions.filter((j: any) => {
      const rate = parseFloat(j.rate);
      return !isNaN(rate) && Math.abs(rate - mean) > 3 * stdDev;
    });

    if (outliers.length > 0) {
      warnings.push(`${outliers.length} statistical outliers detected (rates >3σ from mean)`);
      for (const j of outliers.slice(0, 5)) {
        warnings.push(`  • ${j.location}: ${(j.rate * 100).toFixed(2)}% (mean: ${(mean * 100).toFixed(2)}%)`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates comparison between old and new data (diff validation)
 */
export function validateDiff(oldData: any, newData: any, state: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!oldData || !newData) {
    return { valid: true, errors, warnings }; // Can't compare if one is missing
  }

  // 1. Large swings in jurisdiction count
  const oldCount = oldData.jurisdictions?.length || 0;
  const newCount = newData.jurisdictions?.length || 0;
  const countDiff = Math.abs(newCount - oldCount);
  const countChangePercent = oldCount > 0 ? (countDiff / oldCount) * 100 : 0;

  if (countChangePercent > 20) {
    errors.push(`Large jurisdiction count change: ${oldCount} → ${newCount} (${countChangePercent.toFixed(1)}% change)`);
  } else if (countChangePercent > 10) {
    warnings.push(`Significant jurisdiction count change: ${oldCount} → ${newCount} (${countChangePercent.toFixed(1)}% change)`);
  }

  // 2. Data source change
  if (oldData.metadata?.source !== newData.metadata?.source) {
    warnings.push(`Data source changed: "${oldData.metadata?.source}" → "${newData.metadata?.source}"`);
  }

  // 3. Mass removals (could indicate compromised data)
  const oldLocations = new Set((oldData.jurisdictions || []).map((j: any) => j.location));
  const newLocations = new Set((newData.jurisdictions || []).map((j: any) => j.location));
  
  const removed = [...oldLocations].filter(loc => !newLocations.has(loc));
  if (removed.length > 50) {
    errors.push(`Mass jurisdiction removal: ${removed.length} jurisdictions removed (possible data corruption)`);
  } else if (removed.length > 20) {
    warnings.push(`Many jurisdictions removed: ${removed.length}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// CLI interface for standalone validation
if (require.main === module) {
  const fs = require('fs');
  const path = require('path');
  
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: tsx validate-jurisdiction.ts <json-file> [state]');
    process.exit(1);
  }

  const filePath = args[0];
  const state = args[1] || 'UNKNOWN';

  console.log(`🔍 Validating: ${filePath}\n`);

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const result = validateDataset(data, state);

  if (result.errors.length > 0) {
    console.log('❌ ERRORS:\n');
    for (const error of result.errors) {
      console.log(`   • ${error}`);
    }
    console.log('');
  }

  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    for (const warning of result.warnings) {
      console.log(`   • ${warning}`);
    }
    console.log('');
  }

  if (result.valid) {
    console.log('✅ Validation passed!\n');
    process.exit(0);
  } else {
    console.log('❌ Validation failed!\n');
    process.exit(1);
  }
}
