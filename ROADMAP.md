# taxrates-us — Roadmap

## Week 1: Foundation + Data (Target: Feb 10-14)
- [ ] Create GitHub repo (mrpartnerai/taxrates-us, public, MIT)
- [ ] Research CDTFA data format — download rate files, understand structure
- [ ] Build CDTFA parser script → outputs `ca-tax-rates.json`
- [ ] Build npm package core: `getTaxRate()` function
- [ ] TypeScript types + zero dependencies
- [ ] Known-address test suite (50+ CA addresses with verified rates)
- [ ] All tests passing

## Week 2: API + Site (Target: Feb 17-21)
- [ ] Next.js project for hosted API
- [ ] `/api/rate` endpoint
- [ ] `/api/states` endpoint
- [ ] `/api/status` endpoint
- [ ] Supabase: API keys table, usage tracking
- [ ] API key auth middleware
- [ ] Landing page (hero, features, pricing, demo)
- [ ] API docs page with code samples
- [ ] Sign up + API key generation flow
- [ ] Deploy to Vercel

## Week 3: Pipeline + Polish (Target: Feb 24-28)
- [ ] Auto-update script (fetch → parse → validate → deploy)
- [ ] Vercel cron for scheduled rate checks
- [ ] Anomaly detection in validation pipeline
- [ ] Usage dashboard for API customers
- [ ] README.md for npm package
- [ ] Polish landing page
- [ ] Mitch review + feedback

## Week 4: Launch (Target: Mar 2-6)
- [ ] Publish npm package (v0.1.0)
- [ ] Custom domain (if purchased)
- [ ] Write launch blog post / README
- [ ] Post on relevant communities (after Mitch approval)
- [ ] Integrate into TheAnswerIsJesus site (dogfood)

## Future
- [ ] Expand to additional states (TX, FL, NY, WA priority)
- [ ] SST participating states batch import
- [ ] Webhook notifications for rate changes
- [ ] Premium tier features
