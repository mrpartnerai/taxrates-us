# Validation Thresholds & Security Gates

**Last Updated:** 2026-02-16  
**Status:** Active — enforced in CI/CD pipeline

---

## Overview

The auto-update pipeline validates all scraped data before it can be committed. Three exit codes control the flow:

| Exit Code | Meaning | Pipeline Action |
|-----------|---------|-----------------|
| **0** | Validation passed | Auto-deploy (if <5% change) |
| **1** | Validation failed (errors) | **Block deployment entirely** |
| **2** | Needs manual review | Create PR for human review |

---

## Per-Jurisdiction Thresholds

| Check | Threshold | Severity |
|-------|-----------|----------|
| Rate range | 0% – 20% | **Error** (blocks deploy) |
| Rate warning | >15% | Warning |
| Location length | ≤200 chars | Error |
| County length | ≤100 chars | Error |
| Notes length | ≤500 chars | Warning |
| Valid types | State, City, County, District, Special, Unincorporated Area, Transit District | Warning |
| Injection patterns | XSS, SQL, path traversal, CSV formula, command injection | **Error** |
| Suspicious Unicode | Null bytes, zero-width chars | Warning |

## Dataset Thresholds

| Check | Threshold | Severity |
|-------|-----------|----------|
| Min jurisdictions (fully-scraped states: CA) | ≥50 | **Error** |
| Min jurisdictions (other states) | ≥1 | **Error** |
| Max jurisdictions | ≤5,000 | **Error** |
| Duplicate jurisdictions | 0 | **Error** |
| Metadata count mismatch | Must match array length | Warning |
| Statistical outliers | >3σ from mean rate | Warning |

## Diff Thresholds (New vs. Current Data)

| Check | Threshold | Severity |
|-------|-----------|----------|
| Jurisdiction count change | >20% | **Error** |
| Jurisdiction count change | >10% | Warning |
| Data source changed | Any change | Warning |
| Mass removals | >50 jurisdictions | **Error** |
| Mass removals | >20 jurisdictions | Warning |

## Auto-Deploy Gate

| Check | Threshold | Action |
|-------|-----------|--------|
| Overall change impact | <5% of jurisdictions | Auto-deploy allowed |
| Overall change impact | ≥5% of jurisdictions | **Manual review required (exit 2)** |
| Total warnings | >10 | **Manual review required (exit 2)** |

## Alerting

- **Webhook:** Set `VALIDATION_ALERT_WEBHOOK` secret in GitHub repo settings
- **Triggers:** Any validation failure (errors > 0) or excessive warnings (> 10)
- **Payload:** JSON with timestamp, files, error/warning counts
- **Audit log:** Written to `staged-data/validation-audit.json` (last 100 runs)

## Fully-Scraped States

States with dedicated scrapers that produce full jurisdiction data:

- **CA** — CDTFA CSV scraper (MIN_COUNT = 50)

All other states use state-level data only (MIN_COUNT = 1). Update the `FULLY_SCRAPED_STATES` array in `validate-jurisdiction.ts` when adding new scrapers.

## Attack Scenarios Tested (10/10 pass)

1. Extreme tax rates (>100%, negative)
2. CSV injection / formula injection
3. XSS / script injection
4. SQL injection patterns
5. Path traversal attempts
6. Unicode normalization attacks
7. Data type confusion (Infinity, NaN, hex)
8. Massive data injection (10K rows DoS)
9. Malformed CSV structure
10. Jurisdiction count manipulation
