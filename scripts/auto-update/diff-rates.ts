#!/usr/bin/env ts-node
/**
 * Diff tax rate data files against current versions.
 * 
 * Compares freshly-scraped JSON data against committed data files.
 * Outputs a structured diff report used by the CI pipeline to decide
 * whether to auto-deploy or flag for human review.
 * 
 * Exit codes:
 *   0 - no changes or changes within auto-deploy threshold
 *   1 - error
 *   2 - changes exceed threshold, needs review
 */

import * as fs from 'fs';
import * as path from 'path';

interface DiffReport {
  timestamp: string;
  totalJurisdictions: number;
  changedJurisdictions: number;
  changePercent: number;
  newJurisdictions: string[];
  removedJurisdictions: string[];
  rateChanges: RateChange[];
  structuralChanges: string[];
  needsReview: boolean;
  autoDeployable: boolean;
  summary: string;
}

interface RateChange {
  state: string;
  location: string;
  county: string;
  oldRate: number;
  newRate: number;
  diff: number;
}

const DATA_DIR = path.join(__dirname, '..', '..', 'src', 'data');
const THRESHOLD_PERCENT = 5; // >5% of jurisdictions changed = needs review
const MAX_RATE_CHANGE = 0.03; // >3% rate jump on any single jurisdiction = flag

function loadStateData(filePath: string): any {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function diffState(state: string, oldData: any, newData: any): {
  changes: RateChange[];
  added: string[];
  removed: string[];
  structural: string[];
} {
  const changes: RateChange[] = [];
  const added: string[] = [];
  const removed: string[] = [];
  const structural: string[] = [];

  if (!oldData || !newData) {
    if (newData && !oldData) structural.push(`${state}: entirely new state data file`);
    if (oldData && !newData) structural.push(`${state}: state data file removed`);
    return { changes, added, removed, structural };
  }

  // Check metadata structural changes
  const oldMeta = oldData.metadata || {};
  const newMeta = newData.metadata || {};
  
  if (oldMeta.source !== newMeta.source) {
    structural.push(`${state}: data source changed from "${oldMeta.source}" to "${newMeta.source}"`);
  }

  // Build lookup maps
  const oldMap = new Map<string, any>();
  for (const j of (oldData.jurisdictions || [])) {
    oldMap.set(`${j.location}|${j.county}|${j.type}`, j);
  }

  const newMap = new Map<string, any>();
  for (const j of (newData.jurisdictions || [])) {
    newMap.set(`${j.location}|${j.county}|${j.type}`, j);
  }

  // Find changes and additions
  for (const [key, newJ] of newMap) {
    const oldJ = oldMap.get(key);
    if (!oldJ) {
      added.push(`${state}: ${(newJ as any).location} (${(newJ as any).county})`);
    } else if ((oldJ as any).rate !== (newJ as any).rate) {
      changes.push({
        state,
        location: (newJ as any).location,
        county: (newJ as any).county,
        oldRate: (oldJ as any).rate,
        newRate: (newJ as any).rate,
        diff: (newJ as any).rate - (oldJ as any).rate,
      });
    }
  }

  // Find removals
  for (const [key, oldJ] of oldMap) {
    if (!newMap.has(key)) {
      removed.push(`${state}: ${(oldJ as any).location} (${(oldJ as any).county})`);
    }
  }

  // Jurisdiction count swing
  const countDiff = Math.abs((newData.jurisdictions?.length || 0) - (oldData.jurisdictions?.length || 0));
  if (countDiff > 20) {
    structural.push(`${state}: jurisdiction count changed by ${countDiff} (${oldData.jurisdictions?.length} → ${newData.jurisdictions?.length})`);
  }

  return { changes, added, removed, structural };
}

function main() {
  const stagedDir = process.argv[2] || path.join(__dirname, '..', '..', 'staged-data');
  
  if (!fs.existsSync(stagedDir)) {
    console.error(`Staged data directory not found: ${stagedDir}`);
    process.exit(1);
  }

  const stagedFiles = fs.readdirSync(stagedDir).filter(f => f.endsWith('-tax-rates.json'));
  
  if (stagedFiles.length === 0) {
    console.log('No staged data files found. Nothing to diff.');
    process.exit(0);
  }

  let totalJurisdictions = 0;
  let allChanges: RateChange[] = [];
  let allAdded: string[] = [];
  let allRemoved: string[] = [];
  let allStructural: string[] = [];

  for (const file of stagedFiles) {
    const state = file.replace('-tax-rates.json', '').toUpperCase();
    const oldData = loadStateData(path.join(DATA_DIR, file));
    const newData = loadStateData(path.join(stagedDir, file));

    if (newData?.jurisdictions) {
      totalJurisdictions += newData.jurisdictions.length;
    }

    const diff = diffState(state, oldData, newData);
    allChanges.push(...diff.changes);
    allAdded.push(...diff.added);
    allRemoved.push(...diff.removed);
    allStructural.push(...diff.structural);
  }

  const changedCount = allChanges.length + allAdded.length + allRemoved.length;
  const changePercent = totalJurisdictions > 0 ? (changedCount / totalJurisdictions) * 100 : 0;
  const hasLargeRateJump = allChanges.some(c => Math.abs(c.diff) > MAX_RATE_CHANGE);
  const needsReview = changePercent > THRESHOLD_PERCENT || allStructural.length > 0 || hasLargeRateJump || allRemoved.length > 10;
  const autoDeployable = changedCount > 0 && !needsReview;

  const report: DiffReport = {
    timestamp: new Date().toISOString(),
    totalJurisdictions,
    changedJurisdictions: changedCount,
    changePercent: Math.round(changePercent * 100) / 100,
    newJurisdictions: allAdded,
    removedJurisdictions: allRemoved,
    rateChanges: allChanges,
    structuralChanges: allStructural,
    needsReview,
    autoDeployable,
    summary: changedCount === 0
      ? 'No changes detected.'
      : `${changedCount} jurisdictions changed (${changePercent.toFixed(2)}%). ${needsReview ? '⚠️ NEEDS REVIEW' : '✅ Auto-deployable'}`,
  };

  // Write report
  const reportPath = path.join(stagedDir, 'diff-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  if (needsReview) {
    process.exit(2);
  }
  process.exit(0);
}

main();
