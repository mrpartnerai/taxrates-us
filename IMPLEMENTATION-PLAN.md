# Auto-Update Security - Implementation Plan

**Based on:** security-audit-taxrates-autoupdate.md  
**Priority:** P1 (Must complete before enabling auto-deploy)  
**Estimated Time:** 10-15 hours

---

## Quick Summary

The auto-update pipeline currently has **NO validation** of scraped data. This security audit identified critical vulnerabilities and provides a complete implementation plan to fix them.

**Critical Findings:**
- ❌ No input validation in scraper
- ❌ No data quality tests
- ❌ No final checks before git commit
- ❌ Test suite is placeholder only

**Solution Provided:**
- ✅ Complete validation module: `scripts/auto-update/validate-jurisdiction.ts`
- ✅ Security test suite: `security-tests/test-bad-data.ts`
- ✅ Detailed implementation guide (this document)

---

## Phase 1: Immediate Security Fixes (Week 1)

### Task 1.1: Integrate Validation into Scraper

**File to modify:** `scripts/auto-update/scrape-rates.ts`

**Changes needed:**

1. Import the validation module:
```typescript
import { validateJurisdiction, validateDataset } from './validate-jurisdiction';
```

2. Filter jurisdictions through validation (around line 111):
```typescript
const jurisdictions = rows
  .filter(r => r.Location && r.Rate)
  .map(r => {
    const rate = parseFloat(r.Rate);
    const districtTax = Math.round((rate - stateBaseRate) * 10000) / 10000;
    return {
      location: r.Location,
      type: r.Type || 'City',
      county: r.County || 'Unknown',
      rate,
      ratePercent: r.Rate_Percent || `${(rate * 100).toFixed(2)}%`,
      districtTax: Math.max(0, districtTax),
      notes: r.Notes || null,
    };
  })
  .filter(j => {
    // ← ADD THIS VALIDATION FILTER
    const validation = validateJurisdiction(j, 'CA');
    if (!validation.valid) {
      console.error(`❌ Invalid jurisdiction: ${j.location}`);
      for (const error of validation.errors) {
        console.error(`   • ${error}`);
      }
      return false; // Reject this jurisdiction
    }
    if (validation.warnings.length > 0) {
      console.warn(`⚠️  Warnings for ${j.location}:`);
      for (const warning of validation.warnings) {
        console.warn(`   • ${warning}`);
      }
    }
    return true; // Accept this jurisdiction
  });
```

3. Validate final dataset before writing (around line 120):
```typescript
const data = {
  metadata: {
    effectiveDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
    source: 'California Department of Tax and Fee Administration (CDTFA)',
    lastUpdated: now.toISOString().split('T')[0],
    jurisdictionCount: jurisdictions.length,
    version: '0.1.0',
  },
  jurisdictions,
};

// ← ADD FINAL VALIDATION
const finalValidation = validateDataset(data, 'ca');
if (!finalValidation.valid) {
  console.error('❌ Dataset validation failed:');
  for (const error of finalValidation.errors) {
    console.error(`   • ${error}`);
  }
  return { state, data: null, error: 'Dataset validation failed' };
}

if (finalValidation.warnings.length > 0) {
  console.warn('⚠️  Dataset warnings:');
  for (const warning of finalValidation.warnings) {
    console.warn(`   • ${warning}`);
  }
}

return { state, data };
```

**Estimated time:** 1 hour

---

### Task 1.2: Add Pre-Commit Validation Step

**File to create:** `scripts/auto-update/validate-staged.ts`

```typescript
#!/usr/bin/env ts-node
/**
 * Pre-commit validation of staged data.
 * Runs comprehensive checks before allowing data to be committed.
 */

import * as fs from 'fs';
import * as path from 'path';
import { validateDataset, validateDiff } from './validate-jurisdiction';

const STAGED_DIR = path.join(__dirname, '..', '..', 'staged-data');
const DATA_DIR = path.join(__dirname, '..', '..', 'src', 'data');

function main() {
  console.log('🔐 Pre-Commit Validation\n');

  const stagedFiles = fs.readdirSync(STAGED_DIR)
    .filter(f => f.endsWith('-tax-rates.json'));

  if (stagedFiles.length === 0) {
    console.log('No staged files found.');
    process.exit(0);
  }

  let totalErrors = 0;
  let totalWarnings = 0;

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
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Validation Summary');
  console.log('='.repeat(60));
  console.log(`Files validated: ${stagedFiles.length}`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`Warnings: ${totalWarnings}`);

  if (totalErrors > 0) {
    console.log('\n❌ Validation failed - staged data has errors.');
    console.log('   Do NOT commit this data to the repository.');
    process.exit(1);
  } else if (totalWarnings > 10) {
    console.log('\n⚠️  Many warnings detected - manual review recommended.');
    process.exit(2);
  } else {
    console.log('\n✅ Validation passed - data is safe to commit.');
    process.exit(0);
  }
}

main();
```

**Estimated time:** 1 hour

---

### Task 1.3: Update GitHub Actions Workflow

**File to modify:** `.github/workflows/auto-update-rates.yml`

Add validation step before diff:

```yaml
- name: Validate scraped data (SECURITY)
  run: tsx scripts/auto-update/validate-staged.ts
  # Exits 1 if validation fails, stopping the entire workflow
```

Insert this step **before** the "Diff against current data" step (around line 30).

**Full updated workflow section:**

```yaml
- name: Scrape latest rates
  run: tsx scripts/auto-update/scrape-rates.ts

- name: Validate scraped data (SECURITY)  # ← NEW STEP
  run: tsx scripts/auto-update/validate-staged.ts

- name: Diff against current data
  id: diff
  run: |
    # ... existing diff logic
```

**Estimated time:** 30 minutes

---

### Task 1.4: Create Security Test Suite Integration

**File to add to package.json:**

```json
{
  "scripts": {
    "test": "tsx security-tests/test-bad-data.ts",
    "test:security": "tsx security-tests/test-bad-data.ts",
    "validate:data": "tsx scripts/auto-update/validate-staged.ts"
  }
}
```

**Update GitHub Actions to run tests:**

```yaml
- name: Build & Test
  run: |
    npm run build
    npm test  # Now actually runs security tests
```

**Estimated time:** 30 minutes

---

## Phase 2: Enhanced Monitoring (Week 2)

### Task 2.1: Add Validation Logging

Create audit log of all validation runs:

```typescript
// In validate-staged.ts, add:
const auditLog = {
  timestamp: new Date().toISOString(),
  files: stagedFiles,
  errors: totalErrors,
  warnings: totalWarnings,
  passed: totalErrors === 0,
};

fs.writeFileSync(
  path.join(STAGED_DIR, 'validation-audit.json'),
  JSON.stringify(auditLog, null, 2)
);
```

**Benefit:** Track validation history, detect patterns.

**Estimated time:** 1 hour

---

### Task 2.2: Add Alerting for High-Risk Changes

**File to create:** `scripts/auto-update/alert-webhook.ts`

```typescript
// Send alert if validation warnings exceed threshold
if (totalWarnings > 10 || totalErrors > 0) {
  await fetch(process.env.ALERT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `⚠️ Auto-update validation: ${totalErrors} errors, ${totalWarnings} warnings`,
      files: stagedFiles,
    }),
  });
}
```

Configure webhook URL in GitHub secrets and send to Telegram/Slack.

**Estimated time:** 2 hours

---

### Task 2.3: Manual Approval for First 10 Deploys

**GitHub Environment Protection:**

1. Go to GitHub repo → Settings → Environments
2. Create environment "production-auto-update"
3. Enable "Required reviewers" → Add yourself
4. Update workflow:

```yaml
jobs:
  update-rates:
    runs-on: ubuntu-latest
    environment: production-auto-update  # ← ADD THIS
```

**Benefit:** Human approval required for every deploy until confidence is high.

**Remove after:** 10 successful deploys with no issues.

**Estimated time:** 30 minutes

---

## Phase 3: Advanced Security (Optional - Month 2+)

### Task 3.1: Certificate Pinning

Pin CDTFA SSL certificate fingerprint to detect MITM attacks.

**Estimated time:** 4 hours

---

### Task 3.2: Historical Baseline Comparison

Maintain "known good" snapshot and flag anomalies.

**Estimated time:** 4 hours

---

### Task 3.3: Multi-Source Verification

Cross-reference data from multiple authoritative sources.

**Estimated time:** 8 hours (requires finding additional sources)

---

## Testing Checklist

Before enabling auto-deploy in production:

- [ ] **Unit tests pass**
  ```bash
  npm test  # Should run security-tests/test-bad-data.ts
  ```

- [ ] **Validation detects malicious data**
  ```bash
  # Manually inject bad data into staged-data/
  echo '{"metadata":{...},"jurisdictions":[{"location":"<script>alert(1)</script>",...}]}' > staged-data/ca-tax-rates.json
  tsx scripts/auto-update/validate-staged.ts
  # Should exit 1 with error message
  ```

- [ ] **Validation passes on good data**
  ```bash
  cp src/data/ca-tax-rates.json staged-data/
  tsx scripts/auto-update/validate-staged.ts
  # Should exit 0 (success)
  ```

- [ ] **GitHub Actions workflow updated**
  ```bash
  # Push a test commit and verify:
  # 1. Validation step runs
  # 2. Workflow fails if validation fails
  # 3. Workflow succeeds if validation passes
  ```

- [ ] **Manual approval gate works**
  ```bash
  # Trigger workflow and verify approval required before deploy
  ```

- [ ] **Rollback procedure tested**
  ```bash
  # Deploy bad data (staging), verify revert process works
  ```

---

## Success Criteria

✅ **Phase 1 Complete When:**
- All scraped data passes validation before staging
- GitHub Actions runs validation tests
- Workflow stops if validation fails
- Manual approval required for first 10 deploys

✅ **Phase 2 Complete When:**
- Validation audit logs are tracked
- Alerts sent for high-risk changes
- First 10 successful deploys completed

✅ **Production Ready When:**
- 10+ successful auto-deploys with no issues
- No validation errors in past 30 days
- Rollback procedure documented and tested
- Manual approval gate can be removed

---

## Timeline

| Phase | Tasks | Time | Status |
|-------|-------|------|--------|
| **Phase 1** | Tasks 1.1-1.4 | 3-4 hours | 🚧 Not started |
| **Testing** | Validation testing | 2-3 hours | 🚧 Not started |
| **Phase 2** | Tasks 2.1-2.3 | 4-5 hours | 🚧 Not started |
| **Phase 3** | Optional enhancements | 16+ hours | ⏳ Future |

**Total Minimum:** 10-15 hours to production-ready state

---

## Files Delivered

| File | Purpose | Status |
|------|---------|--------|
| `security-audit-taxrates-autoupdate.md` | Full security audit report | ✅ Complete |
| `scripts/auto-update/validate-jurisdiction.ts` | Validation module (ready to use) | ✅ Complete |
| `security-tests/test-bad-data.ts` | Security test suite | ✅ Complete |
| `IMPLEMENTATION-PLAN.md` | This file - step-by-step guide | ✅ Complete |

**Next Steps:**
1. Review this implementation plan
2. Schedule time to complete Phase 1 (3-4 hours)
3. Test thoroughly before enabling auto-deploy
4. Monitor first 10 deploys closely
5. Remove manual approval after confidence is high

---

**Questions?** Review `security-audit-taxrates-autoupdate.md` for full context and attack scenarios.
