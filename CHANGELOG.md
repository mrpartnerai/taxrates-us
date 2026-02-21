# Changelog

All notable changes to tax rate data are documented here.
Auto-updates are logged automatically by the CI pipeline.

## [Unreleased — Pre-Launch]

### Security Hardening (Feb 11-16)
- Added CYA disclaimers across README, landing page, API responses, new TERMS.md
- Rate limiting verified on all API endpoints
- Auto-update validation pipeline: validate-jurisdiction.ts + validate-staged.ts
- 10/10 attack vectors blocked in security tests
- Auto-deploy <5% threshold, manual review >5%
- Committed as 2e912db (NOT pushed — awaiting Mitch's push approval)

### Infrastructure (Feb 10-13)
- Landing page deployed to Vercel subdomain (password protected — set LANDING_PASSWORD env var)
- MCP server built (taxrates-mcp) — ready to publish
- Auto-update pipeline wired into GitHub Actions
- API live: https://taxrates-us.vercel.app/api/rate

## [0.4.0] 2026-02-08

- All 50 states + DC coverage complete
- 236 tests, 100% validated against official state sources
- Full validation suite added

## [0.1.0] 2026-02-07

- Initial release: California (7 states)
- Core getTaxRate() function
- CDTFA data parsed into structured JSON
