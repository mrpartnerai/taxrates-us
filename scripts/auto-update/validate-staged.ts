#!/usr/bin/env ts-node
/**
 * Pre-commit validation of staged data.
 * Runs comprehensive checks before allowing data to be committed.
 * 
 * SECURITY CRITICAL: This is the final gate before auto-deploy.
 * If this script passes, data will be committed to the repository.
 */

import * as fs from 'fs';
import * as path from 'path';
import { validateDataset, validateDiff } from './validate-jurisdiction';

const STAGED_DIR = path.join(__dirname, '..', '..', 'staged-data');
const DATA_DIR = path.join(__dirname, '..', '..', 'src', 'data');

// Exit codes
const EXIT_SUCCESS = 0;
const EXIT_VALIDATION_FAILED = 1;
const EXIT_NEEDS_MANUAL_REVIEW = 2;

function main() {
  console.log('🔐 Pre-Commit Validation\n');

  if (!fs.existsSync(STAGED_DIR)) {
    console.log('No staged-data directory found.');
    process.exit(EXIT_SUCCESS);
  }

  const stagedFiles = fs.readdirSync(STAGED_DIR)
    .filter(f => f.endsWith('-tax-rates.json'));

  if (stagedFiles.length === 0) {
    console.log('No staged files found.');
    process.exit(EXIT_SUCCESS);
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalJurisdictionsAffected = 0;
  let totalJurisdictions = 0;

  for (const file of stagedFiles) {
    const state = file.replace('-tax-rates.json', '').toUpperCase();
    console.log(`\n📋 Validating ${state}...`);

    const stagedPath = path.join(STAGED_DIR, file);
    const currentPath = path.join(DATA_DIR, file);

    const stagedData = JSON.parse(fs.readFileSync(stagedPath, 'utf-8'));
    const currentData = fs.existsSync(currentPath)
      ? JSON.parse(fs.readFileSync(currentPath, 'utf-8'))
      : null;

    // Validate dataset
    const datasetValidation = validateDataset(stagedData, state);
    
    if (!datasetValidation.valid) {
      console.error(`\n❌ Dataset validation failed for ${state}:`);
      for (const error of datasetValidation.errors) {
        console.error(`   • ${error}`);
      }
      totalErrors += datasetValidation.errors.length;
    }

    if (datasetValidation.warnings.length > 0) {
      console.warn(`\n⚠️  Warnings for ${state}:`);
      for (const warning of datasetValidation.warnings) {
        console.warn(`   • ${warning}`);
      }
      totalWarnings += datasetValidation.warnings.length;
    }

    // Validate diff
    if (currentData) {
      const diffValidation = validateDiff(currentData, stagedData, state);
      
      if (!diffValidation.valid) {
        console.error(`\n❌ Diff validation failed for ${state}:`);
        for (const error of diffValidation.errors) {
          console.error(`   • ${error}`);
        }
        totalErrors += diffValidation.errors.length;
      }

      if (diffValidation.warnings.length > 0) {
        console.warn(`\n⚠️  Diff warnings for ${state}:`);
        for (const warning of diffValidation.warnings) {
          console.warn(`   • ${warning}`);
        }
        totalWarnings += diffValidation.warnings.length;
      }

      // Calculate impact percentage (for auto-deploy threshold)
      const oldCount = currentData.jurisdictions?.length || 0;
      const newCount = stagedData.jurisdictions?.length || 0;
      const jurisdictionsChanged = Math.abs(newCount - oldCount);
      const changePercent = oldCount > 0 ? (jurisdictionsChanged / oldCount) * 100 : 0;
      
      totalJurisdictionsAffected += jurisdictionsChanged;
      totalJurisdictions += oldCount;

      console.log(`\n📊 Impact: ${jurisdictionsChanged} jurisdictions affected (${changePercent.toFixed(1)}% of ${oldCount})`);

      // CRITICAL: Flag large changes for manual review (>5% threshold per requirements)
      if (changePercent > 5.0) {
        console.warn(`\n⚠️  LARGE CHANGE DETECTED: ${changePercent.toFixed(1)}% of jurisdictions affected`);
        console.warn(`   Manual review required before deployment.`);
        totalWarnings += 1; // Count as warning for manual review trigger
      }
    } else {
      console.log(`\n📄 New state data - no previous version to compare`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Validation Summary');
  console.log('='.repeat(60));
  console.log(`Files validated: ${stagedFiles.length}`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`Warnings: ${totalWarnings}`);
  
  if (totalJurisdictions > 0) {
    const overallChangePercent = (totalJurisdictionsAffected / totalJurisdictions) * 100;
    console.log(`Overall impact: ${totalJurisdictionsAffected} jurisdictions affected (${overallChangePercent.toFixed(1)}%)`);
    
    // CRITICAL: Auto-deploy threshold check
    if (overallChangePercent > 5.0) {
      console.log('\n🚨 MANUAL REVIEW REQUIRED');
      console.log(`   Change affects ${overallChangePercent.toFixed(1)}% of jurisdictions (threshold: 5%)`);
      console.log(`   This update should NOT be auto-deployed.`);
      console.log(`   Human approval required before committing.`);
      process.exit(EXIT_NEEDS_MANUAL_REVIEW);
    }
  }

  if (totalErrors > 0) {
    console.log('\n❌ Validation failed - staged data has errors.');
    console.log('   Do NOT commit this data to the repository.');
    console.log('   Possible data corruption or attack detected.');
    process.exit(EXIT_VALIDATION_FAILED);
  } else if (totalWarnings > 10) {
    console.log('\n⚠️  Many warnings detected - manual review recommended.');
    console.log('   Data may be valid but unusual patterns detected.');
    process.exit(EXIT_NEEDS_MANUAL_REVIEW);
  } else {
    console.log('\n✅ Validation passed - data is safe to commit.');
    console.log('   Change is within auto-deploy threshold (<5% jurisdictions affected).');
    process.exit(EXIT_SUCCESS);
  }
}

main();
