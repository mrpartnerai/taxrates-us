# Security Audit: Auto-Update Pipeline

**Project:** taxrates-us  
**Component:** Auto-Update Scraper & Deployment Pipeline  
**Date:** 2026-02-15  
**Priority:** P2 (High - Must Fix Before Auto-Deploy)  
**Status:** 🚨 **CRITICAL VULNERABILITIES FOUND**

---

## Executive Summary

A comprehensive security audit was conducted on the taxrates-us auto-update pipeline, which automatically scrapes state tax rate data and deploys it to production. **CRITICAL security vulnerabilities were discovered that could allow malicious or corrupted data to poison the production database.**

### Severity: 🚨 **HIGH RISK**

**The current auto-update pipeline has NO data validation**. A compromised state website, MITM attack, or DNS poisoning could inject:
- Malicious scripts (XSS)
- Extreme/absurd tax rates (1000%, negative rates)
- Large datasets (DoS)
- Code injection payloads
- Corrupted jurisdiction counts

### Impact if Exploited:
- ✅ Financial harm to users (incorrect tax calculations)
- ✅ Legal liability (users relying on bad data)
- ✅ Reputation damage (untrustworthy data)
- ✅ Service disruption (malformed data breaks API)
- ✅ Data poisoning (bad data committed to git, served to all users)

### Recommendation:
**DO NOT enable auto-deploy until validation safeguards are implemented.**

---

## 1. Current Pipeline Architecture

### Auto-Update Workflow

```
┌─────────────────────────────────────────────────────────┐
│ 1. SCRAPE (scripts/auto-update/scrape-rates.ts)       │
│    • Fetches CSV from state websites (CDTFA for CA)    │
│    • Parses CSV into JSON                              │
│    • Writes to staged-data/ directory                  │
│    • ⚠️ NO VALIDATION AT THIS STEP                      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ 2. DIFF (scripts/auto-update/diff-rates.ts)           │
│    • Compares staged vs current data                   │
│    • Counts changed jurisdictions                      │
│    • Checks if changePercent > 5%                      │
│    • ⚠️ ONLY THRESHOLD CHECK, NO DATA VALIDATION        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ 3. APPLY (scripts/auto-update/apply-changes.ts)       │
│    • Copies staged data to src/data/                   │
│    • Updates CHANGELOG.md                              │
│    • ⚠️ NO VALIDATION BEFORE COMMIT                     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ 4. DEPLOY (GitHub Actions: auto-update-rates.yml)     │
│    • npm run build                                     │
│    • npm test (⚠️ no validation tests exist)           │
│    • git commit & push to main                         │
│    • Auto-deploys to production (Vercel)              │
└─────────────────────────────────────────────────────────┘
```

### Auto-Deploy Thresholds (diff-rates.ts)

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Changed jurisdictions | ≤5% of total | Auto-deploy to production |
| Changed jurisdictions | >5% of total | Create PR for manual review |
| Large rate jump | Any single jurisdiction >3% | Flag for review |
| Structural changes | Data source change, ±20 jurisdictions | Flag for review |
| Jurisdictions removed | >10 removed | Flag for review |

**Problem:** These thresholds only check *quantity* of changes, not *quality* or *safety* of the data.

---

## 2. Attack Vectors

### 2.1 Compromised State Website

**Scenario:** Attacker gains access to CDTFA website or database

**Attack Methods:**
- Replace CSV file with malicious data
- Inject XSS payloads into jurisdiction names
- Set extreme tax rates (1000%, negative values)
- Add fake jurisdictions (data poisoning)

**Current Defense:** ❌ **NONE**  
**Impact:** Malicious data would be auto-deployed to production within 24 hours

**Likelihood:** Medium (state websites are targets for APTs)

---

### 2.2 Man-in-the-Middle (MITM) Attack

**Scenario:** Attacker intercepts HTTP request between GitHub Actions runner and CDTFA server

**Attack Methods:**
- DNS spoofing (redirect cdtfa.ca.gov to attacker's server)
- BGP hijacking (route traffic through malicious network)
- Compromised CA (issue fraudulent SSL cert for cdtfa.ca.gov)
- HTTP downgrade attack (if HTTPS not enforced)

**Current Defense:** ⚠️ **PARTIAL** (uses HTTPS, but no certificate pinning)  
**Impact:** Attacker-controlled data auto-deployed to production

**Likelihood:** Low (requires network-level access or CA compromise)

---

### 2.3 DNS Poisoning

**Scenario:** Attacker poisons DNS cache for cdtfa.ca.gov

**Attack Methods:**
- Compromise DNS resolver used by GitHub Actions
- Cache poisoning attack on authoritative nameservers
- Kaminsky attack (exploit DNS protocol weakness)

**Current Defense:** ❌ **NONE** (relies on DNS integrity)  
**Impact:** Scraper fetches data from attacker's server

**Likelihood:** Low (requires infrastructure access)

---

### 2.4 Supply Chain Attack

**Scenario:** Attacker compromises a dependency used by the scraper

**Attack Methods:**
- Malicious npm package (e.g., typosquatting)
- Compromised maintainer account (publish malicious version)
- Dependency confusion attack

**Current Defense:** ✅ **GOOD** (zero runtime dependencies)  
**Impact:** N/A (no external dependencies in scraper)

**Likelihood:** N/A (not applicable to current setup)

---

### 2.5 Data Corruption (Non-Malicious)

**Scenario:** State website serves corrupted or malformed data due to bug or migration

**Attack Methods:**
- CSV parsing errors (malformed quotes, extra columns)
- Encoding issues (UTF-8 vs Latin-1)
- Truncated downloads (connection timeout)
- Wrong file served (test data instead of production)

**Current Defense:** ❌ **NONE**  
**Impact:** Broken data deployed to production, API returns errors

**Likelihood:** High (websites have bugs, migrations happen)

---

### 2.6 Insider Threat

**Scenario:** Malicious contributor with GitHub write access

**Attack Methods:**
- Directly edit src/data/ files
- Modify scraper to inject bad data
- Bypass CI checks

**Current Defense:** ⚠️ **PARTIAL** (GitHub branch protection, PR reviews)  
**Impact:** Malicious data committed to main branch

**Likelihood:** Low (requires trusted access)

---

## 3. Validation Gaps Analysis

### 3.1 Scraper Validation (scrape-rates.ts)

**Current Code Review:**

```typescript
// Line 111-119: Only validation is parseFloat
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
```

**Missing Validations:**

| Validation | Current | Should Be |
|------------|---------|-----------|
| Rate range check | ❌ None | ✅ 0% ≤ rate ≤ 20% |
| NaN/Infinity check | ❌ None | ✅ isFinite(rate) |
| Location field injection | ❌ None | ✅ Regex for safe chars only |
| County field injection | ❌ None | ✅ Regex for safe chars only |
| Notes field XSS | ❌ None | ✅ Escape or strip HTML |
| Required fields check | ⚠️ Partial (||) | ✅ Strict validation |
| Field length limits | ❌ None | ✅ Max 200 chars per field |
| Jurisdiction count sanity | ❌ None | ✅ 50 ≤ count ≤ 5000 |
| Duplicate detection | ❌ None | ✅ Check for duplicate locations |

**Severity:** 🚨 **CRITICAL**  
**Fix Required:** Implement comprehensive input validation in scraper

---

### 3.2 Diff Validation (diff-rates.ts)

**Current Code Review:**

```typescript
// Line 139-143: Only checks percentage and structural changes
const needsReview = changePercent > THRESHOLD_PERCENT 
  || allStructural.length > 0 
  || hasLargeRateJump 
  || allRemoved.length > 10;
```

**Missing Validations:**

| Validation | Current | Should Be |
|------------|---------|-----------|
| Rate reasonableness | ❌ None | ✅ Check if new rates are plausible |
| Data quality metrics | ❌ None | ✅ Check for missing fields, nulls |
| Historical comparison | ❌ None | ✅ Compare against known good data |
| Anomaly detection | ⚠️ Partial (>3% jump) | ✅ Statistical outlier detection |
| Checksum/hash validation | ❌ None | ✅ Verify data integrity |

**Severity:** ⚠️ **MEDIUM**  
**Fix Required:** Add data quality checks before auto-deploy decision

---

### 3.3 Apply Validation (apply-changes.ts)

**Current Code Review:**

```typescript
// Line 42-52: Blindly copies staged data if autoDeployable=true
if (stagedContent !== currentContent) {
  fs.copyFileSync(stagedPath, currentPath);
  applied++;
  console.log(`   ✅ Updated ${file}`);
}
```

**Missing Validations:**

| Validation | Current | Should Be |
|------------|---------|-----------|
| Final safety check | ❌ None | ✅ Re-validate before commit |
| Backup creation | ❌ None | ✅ Save current data before overwrite |
| Rollback mechanism | ❌ None | ✅ Ability to revert bad deploy |
| Manual approval gate | ❌ None | ⚠️ Optional for high-risk changes |

**Severity:** ⚠️ **MEDIUM**  
**Fix Required:** Add final validation and backup before commit

---

### 3.4 Build/Test Validation (GitHub Actions)

**Current Workflow:**

```yaml
- name: Build & Test
  run: |
    npm run build
    npm test
```

**Actual Test Coverage:**

```bash
$ cat package.json | grep test
"test": "echo \"Error: no test command specified\" && exit 1"
```

**Problem:** ❌ **NO TESTS EXIST**

**Missing Tests:**

| Test Type | Current | Should Be |
|-----------|---------|-----------|
| Data format validation | ❌ None | ✅ JSON schema validation |
| Rate sanity checks | ❌ None | ✅ All rates within 0-20% |
| Required fields check | ❌ None | ✅ All jurisdictions have required fields |
| Duplicate detection | ❌ None | ✅ No duplicate jurisdictions |
| Historical regression | ❌ None | ✅ No major regressions vs last known good |

**Severity:** 🚨 **CRITICAL**  
**Fix Required:** Implement comprehensive test suite before auto-deploy

---

## 4. Security Testing Results

### 4.1 Test Methodology

Created comprehensive security test suite (`security-tests/test-bad-data.ts`) to simulate attack scenarios:

1. **Extreme tax rates** (>100%, negative values)
2. **CSV injection payloads** (Excel formulas, command injection)
3. **XSS script injection** (script tags, event handlers)
4. **SQL injection patterns** (even though we don't use SQL)
5. **Path traversal attempts** (file system access)
6. **Unicode attacks** (null bytes, zero-width chars)
7. **Data type confusion** (Infinity, NaN, hex numbers)
8. **Massive data injection** (10K jurisdictions)
9. **Malformed CSV structure** (unclosed quotes, missing fields)
10. **Jurisdiction count manipulation** (metadata lies about count)

### 4.2 Test Results

**All 10 attack scenarios were detected by the test suite's validation logic.**

✅ **100% detection rate** (when validation is implemented)

**However:** ❌ **NONE of these validations exist in production code**

The test suite demonstrates what *should* be validated, but the actual scraper has no such checks.

### 4.3 Simulation: Compromised CDTFA Website

**Scenario:** CDTFA website serves malicious CSV with XSS payload

```csv
Location,County,Type,Rate,Rate_Percent,Notes
"<script>alert('XSS')</script>",Los Angeles,City,0.0950,9.50%,Hacked
```

**What Happens Now (Without Validation):**

1. Scraper fetches CSV ✅ (no error)
2. Parses location as `"<script>alert('XSS')</script>"` ✅ (no sanitization)
3. Writes to staged-data/ca-tax-rates.json ✅ (malicious data accepted)
4. Diff shows 1 jurisdiction changed (< 5% threshold) ✅ (auto-deploy approved)
5. Apply copies to src/data/ ✅ (no final validation)
6. Committed to git ✅ (malicious data in version control)
7. Deployed to production ✅ (XSS payload now served by API)
8. Users fetch data via API ✅ (receive malicious payload)
9. If rendered in HTML without escaping → **XSS executed in user's browser**

**Likelihood of Exploitation:** High (if validation not added)  
**Impact:** XSS vulnerability in all applications using this API

---

## 5. Recommendations

### 5.1 Immediate Actions (Before Auto-Deploy Enable)

#### Priority 1: Input Validation in Scraper

**File:** `scripts/auto-update/scrape-rates.ts`

Add validation function after CSV parsing:

```typescript
function validateJurisdiction(j: any, state: string): boolean {
  // 1. Required fields
  if (!j.Location || !j.County || !j.Rate) {
    console.warn(`Skipping invalid jurisdiction: missing required fields`);
    return false;
  }

  // 2. Field length limits
  if (j.Location.length > 200 || j.County.length > 100) {
    console.warn(`Skipping jurisdiction: field too long`);
    return false;
  }

  // 3. Injection pattern detection
  const dangerousPatterns = [
    /<script/i, /javascript:/i, /onerror=/i, /onload=/i,
    /DROP\s+TABLE/i, /DELETE\s+FROM/i, /\.\.\//,
    /=cmd\|/i, /@SUM\(/i, /^[=+\-@]/  // CSV injection
  ];
  
  for (const field of [j.Location, j.County, j.Type, j.Notes]) {
    if (field && dangerousPatterns.some(p => p.test(field))) {
      console.error(`❌ SECURITY: Injection pattern detected in ${field}`);
      return false;
    }
  }

  // 4. Rate validation
  const rate = parseFloat(j.Rate);
  if (isNaN(rate) || !isFinite(rate)) {
    console.warn(`Invalid rate: ${j.Rate}`);
    return false;
  }
  
  if (rate < 0 || rate > 0.20) { // 0-20% is reasonable for US sales tax
    console.error(`❌ SECURITY: Rate out of range: ${rate * 100}% (expected 0-20%)`);
    return false;
  }

  return true;
}

// In scrapeCA():
const jurisdictions = rows
  .filter(r => r.Location && r.Rate)
  .filter(r => validateJurisdiction(r, 'CA'))  // ← ADD THIS
  .map(r => { /* existing mapping logic */ });
```

**Status:** 🚨 **REQUIRED BEFORE AUTO-DEPLOY**

---

#### Priority 2: Data Quality Tests

**File:** `scripts/auto-update/validate-scraped-data.ts` (NEW)

Create comprehensive validation test:

```typescript
function validateScrapedData(data: any, state: string): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Metadata checks
  if (!data.metadata || !data.jurisdictions) {
    errors.push('Missing required top-level fields');
  }

  // 2. Jurisdiction count sanity
  const count = data.jurisdictions?.length || 0;
  if (count < 50) {
    errors.push(`Too few jurisdictions: ${count} (expected >50)`);
  }
  if (count > 5000) {
    errors.push(`Too many jurisdictions: ${count} (expected <5000)`);
  }

  // 3. Metadata consistency
  if (data.metadata?.jurisdictionCount !== count) {
    warnings.push(`Metadata count mismatch: ${data.metadata.jurisdictionCount} vs ${count}`);
  }

  // 4. All jurisdictions validate
  for (const j of data.jurisdictions || []) {
    if (!validateJurisdiction(j, state)) {
      errors.push(`Invalid jurisdiction: ${j.location}`);
    }
  }

  // 5. No duplicates
  const seen = new Set();
  for (const j of data.jurisdictions || []) {
    const key = `${j.location}|${j.county}`;
    if (seen.has(key)) {
      errors.push(`Duplicate jurisdiction: ${key}`);
    }
    seen.add(key);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
```

Run this before diff step in GitHub Actions:

```yaml
- name: Validate scraped data
  run: tsx scripts/auto-update/validate-scraped-data.ts staged-data/
  # Exits 1 if validation fails → stops pipeline
```

**Status:** 🚨 **REQUIRED BEFORE AUTO-DEPLOY**

---

#### Priority 3: Manual Approval Gate for First Deploy

**File:** `.github/workflows/auto-update-rates.yml`

Add environment protection:

```yaml
jobs:
  update-rates:
    runs-on: ubuntu-latest
    environment: production  # ← Requires manual approval in GitHub Settings
```

Configure in GitHub:
1. Go to Settings → Environments → Create "production"
2. Enable "Required reviewers" → Add yourself
3. Set protection rules: "Prevent self-review"

**Benefit:** Even if auto-deploy passes all checks, a human must approve before deploy.

**When to Remove:** After 10-20 successful auto-deploys with no issues.

**Status:** ⚠️ **RECOMMENDED FOR INITIAL ROLLOUT**

---

### 5.2 Medium-Term Enhancements

#### 1. Historical Baseline Comparison

Maintain a "known good" snapshot of rates:

```typescript
// Compare new data against last-known-good version
const baselineRates = loadBaseline('ca');
for (const newJ of newData.jurisdictions) {
  const baseline = baselineRates.find(b => b.location === newJ.location);
  if (baseline) {
    const rateDiff = Math.abs(newJ.rate - baseline.rate);
    if (rateDiff > 0.05) { // >5% rate change
      warnings.push(`Large rate change: ${newJ.location} ${baseline.rate} → ${newJ.rate}`);
    }
  }
}
```

**Benefit:** Detect anomalous changes (e.g., 9.5% → 95% likely malicious)

---

#### 2. HTTPS Certificate Pinning

Pin CDTFA certificate to prevent MITM:

```typescript
import * as https from 'https';

const expectedFingerprint = 'SHA256:ABC123...'; // CDTFA cert fingerprint

function fetch(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.cdtfa.ca.gov',
      path: '/...',
      method: 'GET',
      checkServerIdentity: (host: string, cert: any) => {
        const fingerprint = cert.fingerprint256;
        if (fingerprint !== expectedFingerprint) {
          return new Error('Certificate fingerprint mismatch - possible MITM!');
        }
      }
    };
    https.get(options, (res) => { /* ... */ });
  });
}
```

**Benefit:** Blocks MITM attacks even with compromised CA

**Drawback:** Breaks if CDTFA rotates certificate (requires manual update)

---

#### 3. Diff Threshold Alerts

Notify maintainers when changes approach threshold:

```yaml
- name: Check diff threshold
  run: |
    CHANGE_PERCENT=$(jq '.changePercent' staged-data/diff-report.json)
    if (( $(echo "$CHANGE_PERCENT > 3.0" | bc -l) )); then
      echo "⚠️ Warning: Change percent at ${CHANGE_PERCENT}% (threshold: 5%)"
      # Send notification
      curl -X POST $WEBHOOK_URL -d "message=Auto-update approaching threshold"
    fi
```

**Benefit:** Early warning before auto-deploy threshold is hit

---

#### 4. Canary Deployment

Deploy to staging first, then production:

```yaml
- name: Deploy to staging
  run: vercel deploy --env staging

- name: Smoke test staging
  run: curl https://staging-taxrates.vercel.app/api/rate?state=CA

- name: Deploy to production
  if: success()
  run: vercel deploy --prod
```

**Benefit:** Catch data quality issues before production users affected

---

### 5.3 Long-Term Improvements

#### 1. Cryptographic Signatures

If state provides signed data files:

```typescript
import * as crypto from 'crypto';

function verifySignature(data: string, signature: string, publicKey: string): boolean {
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(data);
  return verifier.verify(publicKey, signature, 'base64');
}

// In scraper:
const csvData = await fetch(CSV_URL);
const signature = await fetch(CSV_URL + '.sig');
const publicKey = fs.readFileSync('cdtfa-public-key.pem');

if (!verifySignature(csvData, signature, publicKey)) {
  throw new Error('Data signature verification failed - possible tampering!');
}
```

**Benefit:** Cryptographic proof data hasn't been tampered with

**Drawback:** Requires state to sign their data files (unlikely)

---

#### 2. Multi-Source Verification

Cross-reference data from multiple sources:

```typescript
const cdtfaRates = await scrapeCDTFA();
const avalara Rates = await scrapeAvaларaAPI(); // If they have a public API

// Compare
for (const city of topCities) {
  const r1 = cdtfaRates.find(r => r.location === city);
  const r2 = avalaraRates.find(r => r.location === city);
  
  if (Math.abs(r1.rate - r2.rate) > 0.001) {
    warnings.push(`Mismatch for ${city}: CDTFA=${r1.rate} Avalara=${r2.rate}`);
  }
}
```

**Benefit:** High confidence if multiple sources agree

**Drawback:** Requires finding additional authoritative sources

---

## 6. Attack Scenario Mitigations

| Attack Vector | Current Risk | Mitigation | Priority |
|---------------|--------------|------------|----------|
| **Compromised state website** | 🚨 HIGH | Input validation, rate range checks | P1 |
| **MITM attack** | ⚠️ MEDIUM | HTTPS enforcement, cert pinning | P2 |
| **DNS poisoning** | ⚠️ MEDIUM | Certificate pinning, IP allowlist | P2 |
| **Data corruption** | 🚨 HIGH | Validation tests, sanity checks | P1 |
| **Insider threat** | 🟡 LOW | PR reviews, branch protection | P3 |
| **Supply chain** | ✅ NONE | Zero deps (already secure) | N/A |

---

## 7. Rollback & Incident Response

### 7.1 If Bad Data is Deployed

**Immediate Actions:**

1. **Disable auto-updates**
   ```bash
   # Disable GitHub Actions workflow
   gh workflow disable auto-update-rates.yml
   ```

2. **Revert to last known good**
   ```bash
   git revert <bad_commit>
   git push origin main
   # Vercel auto-deploys the revert
   ```

3. **Notify users** (if API is public)
   - Post GitHub Issue: "Incorrect data deployed on YYYY-MM-DD, reverted"
   - Update README with incident notice
   - If serious: Post security advisory

4. **Root cause analysis**
   - Review diff-report.json from the bad deploy
   - Check GitHub Actions logs
   - Inspect scraped data in artifacts

5. **Prevent recurrence**
   - Add validation rule to catch this specific issue
   - Update tests to cover this case
   - Re-enable auto-updates only after fix verified

---

### 7.2 Incident Response Checklist

- [ ] Identify bad data (which states, which jurisdictions)
- [ ] Determine impact (how many API calls served bad data)
- [ ] Revert to last known good version
- [ ] Verify API serving correct data again
- [ ] Notify affected users (if identifiable)
- [ ] Document incident in postmortem
- [ ] Implement preventive measures
- [ ] Test fix thoroughly before re-enabling auto-updates

---

## 8. Production Readiness Checklist

### Before Enabling Auto-Deploy

- [ ] **Input validation implemented in scraper**
  - [ ] Rate range check (0-20%)
  - [ ] Injection pattern detection
  - [ ] Field length limits
  - [ ] Required fields enforcement

- [ ] **Data quality tests created**
  - [ ] Jurisdiction count sanity
  - [ ] No duplicates
  - [ ] Metadata consistency
  - [ ] All jurisdictions pass validation

- [ ] **GitHub Actions updated**
  - [ ] Run validation tests before deploy
  - [ ] Pipeline fails if validation fails
  - [ ] Manual approval gate configured (optional)

- [ ] **Monitoring & alerting set up**
  - [ ] Email/Slack notification on auto-deploy
  - [ ] Alert if diff threshold >3% (warning level)
  - [ ] Daily digest of auto-update activity

- [ ] **Rollback plan documented**
  - [ ] Instructions in README
  - [ ] Tested rollback procedure
  - [ ] Incident response team identified

- [ ] **First auto-deploy tested in staging**
  - [ ] Manually trigger workflow
  - [ ] Verify validation catches bad data
  - [ ] Confirm auto-deploy works for good data
  - [ ] Test rollback procedure

### Nice-to-Have (Medium-Term)

- [ ] Certificate pinning for HTTPS
- [ ] Historical baseline comparison
- [ ] Canary deployment to staging
- [ ] Multi-source verification
- [ ] Automated smoke tests after deploy

---

## 9. Summary & Risk Assessment

### Current State: 🚨 **NOT PRODUCTION READY**

**Critical Issues:**
1. ❌ No input validation in scraper
2. ❌ No data quality tests
3. ❌ No final validation before commit
4. ❌ npm test does nothing (placeholder)

**Partial Protections:**
1. ✅ HTTPS for downloads (prevents passive eavesdropping)
2. ✅ Zero runtime dependencies (no supply chain risk)
3. ⚠️ Diff thresholds (detect large changes, but not bad data)
4. ⚠️ PR review for >5% changes (human can catch issues)

### Risk Level by Scenario

| Scenario | Likelihood | Impact | Risk Level | Mitigation Status |
|----------|------------|--------|------------|-------------------|
| Compromised state site | Medium | High | 🚨 **CRITICAL** | ❌ Not mitigated |
| MITM attack | Low | High | ⚠️ **MEDIUM** | ⚠️ Partial (HTTPS only) |
| DNS poisoning | Low | High | ⚠️ **MEDIUM** | ❌ Not mitigated |
| Data corruption | High | Medium | 🚨 **HIGH** | ❌ Not mitigated |
| Insider threat | Low | Medium | 🟡 **LOW** | ⚠️ Partial (PR reviews) |

### Recommended Timeline

**Week 1 (Now):**
- Implement input validation in scraper (2-4 hours)
- Create data quality test suite (4-6 hours)
- Update GitHub Actions to run tests (1 hour)
- Test validation with malicious payloads (2 hours)

**Week 2:**
- Add manual approval gate
- Test full auto-deploy pipeline in staging
- Document rollback procedure
- First production auto-deploy (monitored closely)

**Week 3-4:**
- Monitor first 5-10 auto-deploys
- Tune thresholds based on real data
- Remove manual approval gate if confident
- Implement medium-term enhancements (cert pinning, alerts)

**After 1 Month:**
- Review auto-deploy success rate
- Conduct follow-up security audit
- Consider long-term improvements (multi-source, signatures)

---

## 10. Conclusion

The taxrates-us auto-update pipeline is a **powerful automation tool**, but **power requires responsibility**. Without proper validation safeguards, auto-deploy is a **security vulnerability waiting to be exploited**.

### Key Takeaways:

1. ✅ **Attack surface is real** - Compromised state websites, MITM, DNS poisoning are all plausible
2. ✅ **Impact is severe** - Bad data affects all users, creates legal liability
3. ❌ **Current protections are insufficient** - No input validation, no data quality tests
4. ✅ **Fixes are straightforward** - Input validation and test suite can be implemented in 1-2 weeks
5. ⚠️ **Auto-deploy should wait** - Do not enable until validation safeguards are in place

### Final Recommendation:

**DO NOT enable auto-deploy until Priority 1 validations are implemented and tested.**

The risk of deploying malicious or corrupted data to production outweighs the convenience of automation. Once validation is in place and tested, auto-deploy will be a **safe and valuable feature**.

---

**Audit Completed:** 2026-02-15  
**Next Steps:** Implement Priority 1 recommendations, then re-audit  
**Estimated Effort:** 10-15 hours to reach production-ready state

**Questions or Concerns?** Consult this document and the security test suite in `security-tests/test-bad-data.ts`.

---

## Appendix A: Validation Code Samples

See `security-tests/test-bad-data.ts` for:
- Attack payload examples
- Validation logic reference
- Test scenarios

## Appendix B: References

- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [CSV Injection](https://owasp.org/www-community/attacks/CSV_Injection)
- [Man-in-the-Middle Attacks](https://owasp.org/www-community/attacks/Manipulator-in-the-middle_attack)
- [Certificate Pinning Guide](https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning)

---

**END OF REPORT**
