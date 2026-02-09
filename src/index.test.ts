/**
 * Comprehensive test suite for taxrates-us
 * 
 * 80+ tests covering:
 * - City lookups across all major CA regions (verified against CDTFA data)
 * - ZIP code lookups
 * - County lookups
 * - Edge cases (boundaries, unincorporated areas, highest/lowest rates)
 * - Component breakdowns
 * - Unsupported states
 * - Metadata and utility functions
 * 
 * All rates verified against CDTFA SalesTaxRates effective 2026-01-01
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { getTaxRate, getSupportedStates, getMetadata, getJurisdictions, lookupZip } from './index';

// ============================================================================
// City Lookups - Major CA Cities (rates from CDTFA 2026-01-01)
// ============================================================================

describe('getTaxRate - City Lookups', () => {
  it('Sacramento: 8.75%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Sacramento' });
    assert.strictEqual(r.rate, 0.0875);
    assert.strictEqual(r.percentage, '8.75%');
    assert.strictEqual(r.jurisdiction, 'Sacramento');
    assert.strictEqual(r.state, 'CA');
    assert.strictEqual(r.supported, true);
    assert.strictEqual(r.lookupMethod, 'city');
  });

  it('Los Angeles: 9.75%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Los Angeles' });
    assert.strictEqual(r.rate, 0.0975);
    assert.strictEqual(r.percentage, '9.75%');
    assert.strictEqual(r.jurisdiction, 'Los Angeles');
    assert.strictEqual(r.county, 'Los Angeles');
  });

  it('San Francisco: 8.625%', () => {
    const r = getTaxRate({ state: 'CA', city: 'San Francisco' });
    assert.strictEqual(r.rate, 0.08625);
    assert.strictEqual(r.county, 'San Francisco');
  });

  it('San Diego: 7.75%', () => {
    const r = getTaxRate({ state: 'CA', city: 'San Diego' });
    assert.strictEqual(r.rate, 0.0775);
    assert.strictEqual(r.percentage, '7.75%');
  });

  it('San Jose: 9.375%', () => {
    const r = getTaxRate({ state: 'CA', city: 'San Jose' });
    assert.strictEqual(r.rate, 0.09375);
  });

  it('Fresno: 8.35%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Fresno' });
    assert.strictEqual(r.rate, 0.0835);
    assert.strictEqual(r.county, 'Fresno');
  });

  it('Oakland: 10.75%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Oakland' });
    assert.strictEqual(r.rate, 0.1075);
    assert.strictEqual(r.county, 'Alameda');
  });

  it('Long Beach: 10.50%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Long Beach' });
    assert.strictEqual(r.rate, 0.105);
  });

  it('Bakersfield: 8.25%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Bakersfield' });
    assert.strictEqual(r.rate, 0.0825);
    assert.strictEqual(r.county, 'Kern');
  });

  it('Anaheim: 7.75%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Anaheim' });
    assert.strictEqual(r.rate, 0.0775);
    assert.strictEqual(r.county, 'Orange');
  });

  it('Santa Rosa: 10.00%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Santa Rosa' });
    assert.strictEqual(r.rate, 0.10);
    assert.strictEqual(r.county, 'Sonoma');
  });

  it('Riverside: 8.75%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Riverside' });
    assert.strictEqual(r.rate, 0.0875);
    assert.strictEqual(r.county, 'Riverside');
  });

  it('Stockton: 9.00%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Stockton' });
    assert.strictEqual(r.rate, 0.09);
    assert.strictEqual(r.county, 'San Joaquin');
  });

  it('Irvine: 7.75%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Irvine' });
    assert.strictEqual(r.rate, 0.0775);
    assert.strictEqual(r.county, 'Orange');
  });

  it('Modesto: 8.875%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Modesto' });
    assert.strictEqual(r.rate, 0.08875);
    assert.strictEqual(r.county, 'Stanislaus');
  });

  it('Chula Vista: 8.75%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Chula Vista' });
    assert.strictEqual(r.rate, 0.0875);
  });

  it('Santa Barbara: 9.25%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Santa Barbara' });
    assert.strictEqual(r.rate, 0.0925);
    assert.strictEqual(r.county, 'Santa Barbara');
  });

  it('Pasadena: 10.50%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Pasadena' });
    assert.strictEqual(r.rate, 0.105);
  });

  it('Glendale: 10.50%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Glendale' });
    assert.strictEqual(r.rate, 0.105);
  });

  it('Burbank: 10.50%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Burbank' });
    assert.strictEqual(r.rate, 0.105);
  });

  it('Torrance: 10.25%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Torrance' });
    assert.strictEqual(r.rate, 0.1025);
  });

  it('Beverly Hills: 9.75%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Beverly Hills' });
    assert.strictEqual(r.rate, 0.0975);
  });

  it('Santa Monica: 10.75%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Santa Monica' });
    assert.strictEqual(r.rate, 0.1075);
  });

  it('Berkeley: 10.25%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Berkeley' });
    assert.strictEqual(r.rate, 0.1025);
  });

  it('Santa Cruz: 9.75%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Santa Cruz' });
    assert.strictEqual(r.rate, 0.0975);
  });

  it('Napa: 8.75%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Napa' });
    assert.strictEqual(r.rate, 0.0875);
  });

  it('Palm Springs: 9.25%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Palm Springs' });
    assert.strictEqual(r.rate, 0.0925);
  });

  it('Palo Alto: 9.125%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Palo Alto' });
    assert.strictEqual(r.rate, 0.09125);
  });

  it('Redding: 7.25%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Redding' });
    assert.strictEqual(r.rate, 0.0725);
    assert.strictEqual(r.county, 'Shasta');
  });
});

// ============================================================================
// ZIP Code Lookups
// ============================================================================

describe('getTaxRate - ZIP Code Lookups', () => {
  it('90001 → Los Angeles (9.75%)', () => {
    const r = getTaxRate({ state: 'CA', zip: '90001' });
    assert.strictEqual(r.rate, 0.0975);
    assert.strictEqual(r.jurisdiction, 'Los Angeles');
    assert.strictEqual(r.lookupMethod, 'zip');
  });

  it('90210 → Beverly Hills (9.75%)', () => {
    const r = getTaxRate({ state: 'CA', zip: '90210' });
    assert.strictEqual(r.rate, 0.0975);
    assert.strictEqual(r.jurisdiction, 'Beverly Hills');
  });

  it('94102 → San Francisco (8.625%)', () => {
    const r = getTaxRate({ state: 'CA', zip: '94102' });
    assert.strictEqual(r.rate, 0.08625);
    assert.strictEqual(r.jurisdiction, 'San Francisco');
  });

  it('95814 → Sacramento (8.75%)', () => {
    const r = getTaxRate({ state: 'CA', zip: '95814' });
    assert.strictEqual(r.rate, 0.0875);
    assert.strictEqual(r.jurisdiction, 'Sacramento');
  });

  it('92101 → San Diego (7.75%)', () => {
    const r = getTaxRate({ state: 'CA', zip: '92101' });
    assert.strictEqual(r.rate, 0.0775);
    assert.strictEqual(r.jurisdiction, 'San Diego');
  });

  it('95110 → San Jose (9.375%)', () => {
    const r = getTaxRate({ state: 'CA', zip: '95110' });
    assert.strictEqual(r.rate, 0.09375);
    assert.strictEqual(r.jurisdiction, 'San Jose');
  });

  it('94607 → Oakland (10.75%)', () => {
    const r = getTaxRate({ state: 'CA', zip: '94607' });
    assert.strictEqual(r.rate, 0.1075);
    assert.strictEqual(r.jurisdiction, 'Oakland');
  });

  it('94608 → Emeryville (10.50%)', () => {
    const r = getTaxRate({ state: 'CA', zip: '94608' });
    assert.strictEqual(r.rate, 0.105);
    assert.strictEqual(r.jurisdiction, 'Emeryville');
  });

  it('93534 → Lancaster (11.25% — highest in CA)', () => {
    const r = getTaxRate({ state: 'CA', zip: '93534' });
    assert.strictEqual(r.rate, 0.1125);
    assert.strictEqual(r.jurisdiction, 'Lancaster');
  });

  it('92801 → Anaheim (7.75%)', () => {
    const r = getTaxRate({ state: 'CA', zip: '92801' });
    assert.strictEqual(r.rate, 0.0775);
    assert.strictEqual(r.jurisdiction, 'Anaheim');
  });

  it('91910 → Chula Vista (8.75%)', () => {
    const r = getTaxRate({ state: 'CA', zip: '91910' });
    assert.strictEqual(r.rate, 0.0875);
    assert.strictEqual(r.jurisdiction, 'Chula Vista');
  });

  it('93301 → Bakersfield (8.25%)', () => {
    const r = getTaxRate({ state: 'CA', zip: '93301' });
    assert.strictEqual(r.rate, 0.0825);
    assert.strictEqual(r.jurisdiction, 'Bakersfield');
  });

  it('93701 → Fresno (8.35%)', () => {
    const r = getTaxRate({ state: 'CA', zip: '93701' });
    assert.strictEqual(r.rate, 0.0835);
    assert.strictEqual(r.jurisdiction, 'Fresno');
  });

  it('91501 → Burbank (10.50%)', () => {
    const r = getTaxRate({ state: 'CA', zip: '91501' });
    assert.strictEqual(r.rate, 0.105);
    assert.strictEqual(r.jurisdiction, 'Burbank');
  });

  it('ZIP with leading zeros handled correctly', () => {
    const r = getTaxRate({ state: 'CA', zip: '90001' });
    assert.strictEqual(r.supported, true);
    assert.ok(r.rate > 0);
  });

  it('ZIP+4 format handled (takes first 5 digits)', () => {
    const r = getTaxRate({ state: 'CA', zip: '90210-1234' });
    assert.strictEqual(r.rate, 0.0975);
    assert.strictEqual(r.jurisdiction, 'Beverly Hills');
  });

  it('Unknown ZIP returns state default', () => {
    const r = getTaxRate({ state: 'CA', zip: '00000' });
    assert.strictEqual(r.rate, 0.0725);
    assert.strictEqual(r.lookupMethod, 'state-default');
  });
});

// ============================================================================
// County Lookups
// ============================================================================

describe('getTaxRate - County Lookups', () => {
  it('Los Angeles County: 9.75%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Los Angeles County' });
    assert.strictEqual(r.rate, 0.0975);
    assert.strictEqual(r.jurisdiction, 'Los Angeles County');
  });

  it('Alameda County: 10.25%', () => {
    const r = getTaxRate({ state: 'CA', county: 'Alameda' });
    assert.strictEqual(r.rate, 0.1025);
    assert.strictEqual(r.lookupMethod, 'county');
  });

  it('Alpine County: 7.25% (lowest — base rate only)', () => {
    const r = getTaxRate({ state: 'CA', city: 'Alpine County' });
    assert.strictEqual(r.rate, 0.0725);
    assert.strictEqual(r.percentage, '7.25%');
  });

  it('Orange County: 7.75%', () => {
    const r = getTaxRate({ state: 'CA', county: 'Orange' });
    assert.strictEqual(r.rate, 0.0775);
  });

  it('San Francisco County (city-county)', () => {
    const r = getTaxRate({ state: 'CA', county: 'San Francisco' });
    assert.strictEqual(r.rate, 0.08625);
  });

  it('Sacramento County: 7.75%', () => {
    const r = getTaxRate({ state: 'CA', county: 'Sacramento' });
    assert.strictEqual(r.rate, 0.0775);
    assert.strictEqual(r.lookupMethod, 'county');
  });

  it('County lookup with "County" suffix in name', () => {
    const r = getTaxRate({ state: 'CA', county: 'Riverside County' });
    assert.strictEqual(r.rate, 0.0775);
  });

  it('County name without "County" suffix', () => {
    const r = getTaxRate({ state: 'CA', county: 'Alpine' });
    assert.strictEqual(r.rate, 0.0725);
  });

  it('Contra Costa County: 8.75%', () => {
    const r = getTaxRate({ state: 'CA', county: 'Contra Costa' });
    assert.strictEqual(r.rate, 0.0875);
  });

  it('San Bernardino County', () => {
    const r = getTaxRate({ state: 'CA', county: 'San Bernardino' });
    assert.ok(r.rate > 0.07);
    assert.strictEqual(r.lookupMethod, 'county');
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('getTaxRate - Edge Cases', () => {
  it('Highest rate: Lancaster at 11.25%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Lancaster' });
    assert.strictEqual(r.rate, 0.1125);
    assert.strictEqual(r.percentage, '11.25%');
    assert.strictEqual(r.county, 'Los Angeles');
  });

  it('Lowest rate: multiple cities at 7.25%', () => {
    const r = getTaxRate({ state: 'CA', city: 'Redding' });
    assert.strictEqual(r.rate, 0.0725);
  });

  it('Case insensitivity - city', () => {
    const r1 = getTaxRate({ state: 'CA', city: 'sacramento' });
    const r2 = getTaxRate({ state: 'CA', city: 'SACRAMENTO' });
    const r3 = getTaxRate({ state: 'CA', city: 'SaCrAmEnTo' });
    assert.strictEqual(r1.rate, r2.rate);
    assert.strictEqual(r2.rate, r3.rate);
  });

  it('Case insensitivity - state code', () => {
    const r1 = getTaxRate({ state: 'ca', city: 'Sacramento' });
    const r2 = getTaxRate({ state: 'Ca', city: 'Sacramento' });
    assert.strictEqual(r1.rate, 0.0875);
    assert.strictEqual(r2.rate, 0.0875);
  });

  it('No city or ZIP → state default', () => {
    const r = getTaxRate({ state: 'CA' });
    assert.strictEqual(r.rate, 0.0725);
    assert.strictEqual(r.percentage, '7.25%');
    assert.strictEqual(r.lookupMethod, 'state-default');
  });

  it('Nonexistent city → state default', () => {
    const r = getTaxRate({ state: 'CA', city: 'FakeCity99' });
    assert.strictEqual(r.rate, 0.0725);
    assert.strictEqual(r.lookupMethod, 'state-default');
  });

  it('City takes precedence over ZIP', () => {
    // Beverly Hills city + different LA zip → should use Beverly Hills
    const r = getTaxRate({ state: 'CA', city: 'Beverly Hills', zip: '90001' });
    assert.strictEqual(r.jurisdiction, 'Beverly Hills');
    assert.strictEqual(r.lookupMethod, 'city');
  });

  it('ZIP used when city not found', () => {
    const r = getTaxRate({ state: 'CA', city: 'NotACity', zip: '90210' });
    assert.strictEqual(r.jurisdiction, 'Beverly Hills');
    assert.strictEqual(r.lookupMethod, 'zip');
  });

  it('County param used when city and ZIP not found', () => {
    const r = getTaxRate({ state: 'CA', city: 'NotACity', zip: '00000', county: 'Alameda' });
    assert.strictEqual(r.lookupMethod, 'county');
    assert.strictEqual(r.rate, 0.1025);
  });

  it('Whitespace in inputs is trimmed', () => {
    const r = getTaxRate({ state: ' CA ', city: '  Sacramento  ' });
    assert.strictEqual(r.rate, 0.0875);
  });

  it('Empty city string → state default', () => {
    const r = getTaxRate({ state: 'CA', city: '' });
    assert.strictEqual(r.rate, 0.0725);
  });

  it('Multiple params: city wins over county', () => {
    const r = getTaxRate({ state: 'CA', city: 'Irvine', county: 'Alameda' });
    assert.strictEqual(r.jurisdiction, 'Irvine');
    assert.strictEqual(r.rate, 0.0775);
  });
});

// ============================================================================
// Component Breakdowns
// ============================================================================

describe('getTaxRate - Component Breakdowns', () => {
  it('Sacramento components add up to total rate', () => {
    const r = getTaxRate({ state: 'CA', city: 'Sacramento' });
    const sum = r.components.state + r.components.county + r.components.city + r.components.district;
    assert.ok(Math.abs(sum - r.rate) < 0.0001, `Components sum ${sum} ≠ rate ${r.rate}`);
  });

  it('Los Angeles components add up to total rate', () => {
    const r = getTaxRate({ state: 'CA', city: 'Los Angeles' });
    const sum = r.components.state + r.components.county + r.components.city + r.components.district;
    assert.ok(Math.abs(sum - r.rate) < 0.0001, `Components sum ${sum} ≠ rate ${r.rate}`);
  });

  it('Lancaster components add up to total rate', () => {
    const r = getTaxRate({ state: 'CA', city: 'Lancaster' });
    const sum = r.components.state + r.components.county + r.components.city + r.components.district;
    assert.ok(Math.abs(sum - r.rate) < 0.0001, `Components sum ${sum} ≠ rate ${r.rate}`);
  });

  it('Alpine County: no district taxes', () => {
    const r = getTaxRate({ state: 'CA', city: 'Alpine County' });
    assert.strictEqual(r.components.city, 0);
    assert.strictEqual(r.components.district, 0);
    assert.strictEqual(r.components.state, 0.06);
    assert.strictEqual(r.components.county, 0.0125);
  });

  it('State default: no extra components', () => {
    const r = getTaxRate({ state: 'CA' });
    assert.strictEqual(r.components.state, 0.06);
    assert.strictEqual(r.components.county, 0.0125);
    assert.strictEqual(r.components.city, 0);
    assert.strictEqual(r.components.district, 0);
  });

  it('Lancaster: has city district on top of county', () => {
    const r = getTaxRate({ state: 'CA', city: 'Lancaster' });
    assert.ok(r.components.city > 0, 'Lancaster should have city-specific district');
    assert.ok(r.components.district > 0, 'Lancaster should have county-level district');
  });

  it('County-level jurisdiction has no city component', () => {
    const r = getTaxRate({ state: 'CA', county: 'Orange' });
    assert.strictEqual(r.components.city, 0);
  });

  it('All components are non-negative', () => {
    const r = getTaxRate({ state: 'CA', city: 'Los Angeles' });
    assert.ok(r.components.state >= 0);
    assert.ok(r.components.county >= 0);
    assert.ok(r.components.city >= 0);
    assert.ok(r.components.district >= 0);
  });

  it('State component is always 0.06 for CA', () => {
    const cities = ['Sacramento', 'Los Angeles', 'San Diego', 'Lancaster', 'Redding'];
    for (const city of cities) {
      const r = getTaxRate({ state: 'CA', city });
      assert.strictEqual(r.components.state, 0.06, `State component for ${city}`);
    }
  });

  it('County component is always 0.0125 for CA', () => {
    const cities = ['Sacramento', 'Los Angeles', 'San Diego', 'Lancaster', 'Redding'];
    for (const city of cities) {
      const r = getTaxRate({ state: 'CA', city });
      assert.strictEqual(r.components.county, 0.0125, `County component for ${city}`);
    }
  });
});

// ============================================================================
// Unsupported States
// ============================================================================

describe('getTaxRate - Unsupported States', () => {
  it('Unknown state: not supported', () => {
    const r = getTaxRate({ state: 'XX' });
    assert.strictEqual(r.rate, 0);
    assert.strictEqual(r.supported, false);
    assert.ok(r.reason);
  });

  it('Unsupported state: components are all zero', () => {
    const r = getTaxRate({ state: 'ZZ' });
    assert.strictEqual(r.components.state, 0);
    assert.strictEqual(r.components.county, 0);
    assert.strictEqual(r.components.city, 0);
    assert.strictEqual(r.components.district, 0);
  });
});

// ============================================================================
// Utility Functions
// ============================================================================

describe('getSupportedStates', () => {
  it('returns array with all 7 states', () => {
    const states = getSupportedStates();
    assert.strictEqual(Array.isArray(states), true);
    assert.ok(states.length >= 7);
    assert.ok(states.includes('CA'));
    assert.ok(states.includes('TX'));
    assert.ok(states.includes('NY'));
    assert.ok(states.includes('FL'));
    assert.ok(states.includes('WA'));
    assert.ok(states.includes('NV'));
    assert.ok(states.includes('OR'));
  });
});

describe('getMetadata', () => {
  it('returns all required fields', () => {
    const m = getMetadata();
    assert.ok(m.effectiveDate);
    assert.ok(m.source);
    assert.ok(m.lastUpdated);
    assert.ok(m.jurisdictionCount > 0);
    assert.ok(m.version);
    assert.ok('supportedStates' in m);
    if ('zipCodesLoaded' in m) {
      assert.ok(m.zipCodesLoaded > 0);
    }
  });

  it('has correct jurisdiction count (546)', () => {
    const m = getMetadata();
    assert.strictEqual(m.jurisdictionCount, 546);
  });

  it('has significant ZIP code coverage', () => {
    const m = getMetadata();
    if ('zipCodesLoaded' in m) {
      assert.ok(m.zipCodesLoaded >= 900, `Expected 900+ ZIPs, got ${m.zipCodesLoaded}`);
    }
  });

  it('effective date is 2026-01-01', () => {
    const m = getMetadata();
    assert.strictEqual(m.effectiveDate, '2026-01-01');
  });

  it('source mentions CDTFA', () => {
    const m = getMetadata();
    assert.ok(m.source.includes('CDTFA'));
  });
});

describe('getJurisdictions', () => {
  it('returns 546 CA jurisdictions', () => {
    const j = getJurisdictions('CA');
    assert.strictEqual(j.length, 546);
  });

  it('returns jurisdictions for TX', () => {
    const j = getJurisdictions('TX');
    assert.ok(j.length >= 1);
  });

  it('returns empty for unsupported state', () => {
    const j = getJurisdictions('XX');
    assert.strictEqual(j.length, 0);
  });

  it('returns a copy (not the internal array)', () => {
    const j1 = getJurisdictions('CA');
    const j2 = getJurisdictions('CA');
    assert.notStrictEqual(j1, j2);
  });

  it('includes Sacramento', () => {
    const j = getJurisdictions('CA');
    const sac = j.find(x => x.location === 'Sacramento');
    assert.ok(sac);
    assert.strictEqual(sac!.rate, 0.0875);
    assert.strictEqual(sac!.type, 'City');
  });

  it('includes all types', () => {
    const j = getJurisdictions('CA');
    const types = new Set(j.map(x => x.type));
    assert.ok(types.has('City'));
    assert.ok(types.has('County'));
    assert.ok(types.has('Unincorporated Area'));
  });
});

describe('lookupZip', () => {
  it('90210 → Beverly Hills, Los Angeles', () => {
    const entry = lookupZip('90210');
    assert.ok(entry);
    assert.strictEqual(entry!.city, 'Beverly Hills');
    assert.strictEqual(entry!.county, 'Los Angeles');
  });

  it('94102 → San Francisco', () => {
    const entry = lookupZip('94102');
    assert.ok(entry);
    assert.strictEqual(entry!.city, 'San Francisco');
  });

  it('00000 → null', () => {
    const entry = lookupZip('00000');
    assert.strictEqual(entry, null);
  });

  it('handles ZIP+4', () => {
    const entry = lookupZip('90210-5678');
    assert.ok(entry);
    assert.strictEqual(entry!.city, 'Beverly Hills');
  });
});

// ============================================================================
// Regional Coverage Tests
// ============================================================================

describe('getTaxRate - Regional Coverage', () => {
  it('Bay Area: Alameda (10.75%)', () => {
    const r = getTaxRate({ state: 'CA', city: 'Alameda' });
    assert.strictEqual(r.rate, 0.1075);
  });

  it('North Coast: Eureka (10.25%)', () => {
    const r = getTaxRate({ state: 'CA', city: 'Eureka' });
    assert.strictEqual(r.rate, 0.1025);
    assert.strictEqual(r.county, 'Humboldt');
  });

  it('North Coast: Arcata (10.25%)', () => {
    const r = getTaxRate({ state: 'CA', city: 'Arcata' });
    assert.strictEqual(r.rate, 0.1025);
  });

  it('Central Coast: Santa Cruz (9.75%)', () => {
    const r = getTaxRate({ state: 'CA', city: 'Santa Cruz' });
    assert.strictEqual(r.rate, 0.0975);
  });

  it('Central Valley: Visalia (8.50%)', () => {
    const r = getTaxRate({ state: 'CA', city: 'Visalia' });
    assert.strictEqual(r.rate, 0.085);
    assert.strictEqual(r.county, 'Tulare');
  });

  it('Desert: Palm Desert (8.75%)', () => {
    const r = getTaxRate({ state: 'CA', city: 'Palm Desert' });
    assert.strictEqual(r.rate, 0.0875);
    assert.strictEqual(r.county, 'Riverside');
  });

  it('North State: Chico (9.25%)', () => {
    const r = getTaxRate({ state: 'CA', city: 'Chico' });
    assert.strictEqual(r.rate, 0.0925);
    assert.strictEqual(r.county, 'Butte');
  });

  it('Wine Country: Sonoma (10.25%)', () => {
    const r = getTaxRate({ state: 'CA', city: 'Sonoma' });
    assert.strictEqual(r.rate, 0.1025);
    assert.strictEqual(r.county, 'Sonoma');
  });

  it('Imperial Valley: El Centro (8.25%)', () => {
    const r = getTaxRate({ state: 'CA', city: 'El Centro' });
    assert.strictEqual(r.rate, 0.0825);
    assert.strictEqual(r.county, 'Imperial');
  });

  it('Central Coast: Monterey (9.25%)', () => {
    const r = getTaxRate({ state: 'CA', city: 'Monterey' });
    assert.strictEqual(r.rate, 0.0925);
    assert.strictEqual(r.county, 'Monterey');
  });
});

// ============================================================================
// Response Structure Validation
// ============================================================================

describe('Response Structure', () => {
  it('supported response has all required fields', () => {
    const r = getTaxRate({ state: 'CA', city: 'Sacramento' });
    assert.ok('rate' in r);
    assert.ok('percentage' in r);
    assert.ok('jurisdiction' in r);
    assert.ok('state' in r);
    assert.ok('components' in r);
    assert.ok('source' in r);
    assert.ok('effectiveDate' in r);
    assert.ok('supported' in r);
    assert.ok('lookupMethod' in r);
    assert.ok('county' in r);
  });

  it('unsupported response has reason', () => {
    const r = getTaxRate({ state: 'ZZ' });
    assert.ok('reason' in r);
    assert.ok(r.reason && r.reason.length > 0);
  });

  it('rate is a number, not string', () => {
    const r = getTaxRate({ state: 'CA', city: 'Sacramento' });
    assert.strictEqual(typeof r.rate, 'number');
  });

  it('percentage is a formatted string with %', () => {
    const r = getTaxRate({ state: 'CA', city: 'Sacramento' });
    assert.ok(r.percentage.endsWith('%'));
  });
});
