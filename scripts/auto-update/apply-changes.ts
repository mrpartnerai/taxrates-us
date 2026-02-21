#!/usr/bin/env ts-node
/**
 * Apply staged rate changes to src/data/.
 * 
 * Only runs when diff-report.json shows autoDeployable=true.
 * Copies staged files over current data, updates metadata timestamps,
 * and appends to CHANGELOG.md.
 */

import * as fs from 'fs';
import * as path from 'path';

const STAGED_DIR = path.join(__dirname, '..', '..', 'staged-data');
const DATA_DIR = path.join(__dirname, '..', '..', 'src', 'data');
const CHANGELOG = path.join(__dirname, '..', '..', 'CHANGELOG.md');

function main() {
  const reportPath = path.join(STAGED_DIR, 'diff-report.json');
  if (!fs.existsSync(reportPath)) {
    console.error('No diff report found. Run diff-rates first.');
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

  if (!report.autoDeployable) {
    console.log('Changes are NOT auto-deployable. Skipping apply.');
    process.exit(0);
  }

  if (report.changedJurisdictions === 0) {
    console.log('No changes to apply.');
    process.exit(0);
  }

  console.log(`📋 Applying ${report.changedJurisdictions} jurisdiction changes...`);

  // Copy staged files that have actual changes
  const stagedFiles = fs.readdirSync(STAGED_DIR).filter(f => f.endsWith('-tax-rates.json'));
  let applied = 0;

  for (const file of stagedFiles) {
    const stagedPath = path.join(STAGED_DIR, file);
    const currentPath = path.join(DATA_DIR, file);
    
    const stagedContent = fs.readFileSync(stagedPath, 'utf-8');
    const currentContent = fs.existsSync(currentPath) ? fs.readFileSync(currentPath, 'utf-8') : '';
    
    if (stagedContent !== currentContent) {
      fs.copyFileSync(stagedPath, currentPath);
      applied++;
      console.log(`   ✅ Updated ${file}`);
    }
  }

  // Append to changelog
  const today = new Date().toISOString().split('T')[0];
  const changelogEntry = [
    '',
    `## [auto-update] ${today}`,
    '',
    `- **${report.changedJurisdictions}** jurisdictions updated (${report.changePercent}% of total)`,
    ...(report.rateChanges.length > 0 ? [
      '- Rate changes:',
      ...report.rateChanges.slice(0, 20).map((c: any) => 
        `  - ${c.state} ${c.location}: ${(c.oldRate * 100).toFixed(2)}% → ${(c.newRate * 100).toFixed(2)}%`
      ),
      ...(report.rateChanges.length > 20 ? [`  - ... and ${report.rateChanges.length - 20} more`] : []),
    ] : []),
    ...(report.newJurisdictions.length > 0 ? [
      `- **${report.newJurisdictions.length}** new jurisdictions added`,
    ] : []),
    ...(report.removedJurisdictions.length > 0 ? [
      `- **${report.removedJurisdictions.length}** jurisdictions removed`,
    ] : []),
    '',
  ].join('\n');

  if (fs.existsSync(CHANGELOG)) {
    const existing = fs.readFileSync(CHANGELOG, 'utf-8');
    // Insert after first heading
    const firstHeadingEnd = existing.indexOf('\n');
    if (firstHeadingEnd > -1) {
      const updated = existing.slice(0, firstHeadingEnd + 1) + changelogEntry + existing.slice(firstHeadingEnd + 1);
      fs.writeFileSync(CHANGELOG, updated);
    } else {
      fs.appendFileSync(CHANGELOG, changelogEntry);
    }
  } else {
    fs.writeFileSync(CHANGELOG, `# Changelog\n${changelogEntry}`);
  }

  console.log(`\n✅ Applied ${applied} file updates. Changelog updated.`);
}

main();
