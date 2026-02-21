/**
 * Multi-state test suite for taxrates-us
 * Tests all 50 states + DC
 * 
 * All rates verified against Sales Tax Institute (as of 2/1/2026)
 * https://www.salestaxinstitute.com/resources/rates
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { getTaxRate, getStates } from './index';

// ============================================================================
// Multi-State Support
// ============================================================================

describe('Multi-State Support', () => {
  it('getStates returns all 51 entries (50 states + DC)', () => {
    const states = getStates();
    assert.strictEqual(states.length, 51);
  });

  it('includes all 50 states + DC', () => {
    const states = getStates();
    const expected = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
      'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
      'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'NV', 'OH', 'OK', 'OR', 'PA', 'RI',
      'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    ];
    for (const s of expected) {
      assert.ok(states.includes(s), `Missing state: ${s}`);
    }
  });
});

// ============================================================================
// No-Sales-Tax States (5 states: AK, DE, MT, NH, OR)
// ============================================================================

describe('No-Sales-Tax States', () => {
  const noTaxStates = [
    ['AK', 'Alaska'],
    ['DE', 'Delaware'],
    ['MT', 'Montana'],
    ['NH', 'New Hampshire'],
    ['OR', 'Oregon'],
  ];

  for (const [code, name] of noTaxStates) {
    it(`${name} (${code}): 0.00%`, () => {
      const r = getTaxRate({ state: code });
      assert.strictEqual(r.rate, 0);
      assert.strictEqual(r.percentage, '0.00%');
      assert.strictEqual(r.state, code);
      assert.strictEqual(r.supported, true);
    });
  }
});

// ============================================================================
// All State Rates (verified against Sales Tax Institute 2/1/2026)
// ============================================================================

describe('All State Base Rates', () => {
  const stateRates: [string, number, string][] = [
    ['AL', 0.04, '4.00%'],
    ['AK', 0, '0.00%'],
    ['AZ', 0.056, '5.60%'],
    ['AR', 0.065, '6.50%'],
    ['CA', 0.0725, '7.25%'],
    ['CO', 0.029, '2.90%'],
    ['CT', 0.0635, '6.35%'],
    ['DE', 0, '0.00%'],
    ['DC', 0.06, '6.00%'],
    ['FL', 0.06, '6.00%'],
    ['GA', 0.04, '4.00%'],
    ['HI', 0.04, '4.00%'],
    ['ID', 0.06, '6.00%'],
    ['IL', 0.0625, '6.25%'],
    ['IN', 0.07, '7.00%'],
    ['IA', 0.06, '6.00%'],
    ['KS', 0.065, '6.50%'],
    ['KY', 0.06, '6.00%'],
    ['LA', 0.05, '5.00%'],
    ['ME', 0.055, '5.50%'],
    ['MD', 0.06, '6.00%'],
    ['MA', 0.0625, '6.25%'],
    ['MI', 0.06, '6.00%'],
    ['MN', 0.06875, '6.875%'],
    ['MS', 0.07, '7.00%'],
    ['MO', 0.04225, '4.225%'],
    ['MT', 0, '0.00%'],
    ['NE', 0.055, '5.50%'],
    ['NH', 0, '0.00%'],
    ['NJ', 0.06625, '6.625%'],
    ['NM', 0.04875, '4.875%'],
    ['NY', 0.04, '4.00%'],
    ['NC', 0.0475, '4.75%'],
    ['ND', 0.05, '5.00%'],
    ['NV', 0.0685, '6.85%'],
    ['OH', 0.0575, '5.75%'],
    ['OK', 0.045, '4.50%'],
    ['OR', 0, '0.00%'],
    ['PA', 0.06, '6.00%'],
    ['RI', 0.07, '7.00%'],
    ['SC', 0.06, '6.00%'],
    ['SD', 0.042, '4.20%'],
    ['TN', 0.07, '7.00%'],
    ['TX', 0.0625, '6.25%'],
    ['UT', 0.0485, '4.85%'],
    ['VT', 0.06, '6.00%'],
    ['VA', 0.043, '4.30%'],
    ['WA', 0.065, '6.50%'],
    ['WV', 0.06, '6.00%'],
    ['WI', 0.05, '5.00%'],
    ['WY', 0.04, '4.00%'],
  ];

  for (const [code, rate, pct] of stateRates) {
    it(`${code}: ${pct}`, () => {
      const r = getTaxRate({ state: code });
      assert.strictEqual(r.rate, rate, `${code} rate mismatch: expected ${rate}, got ${r.rate}`);
      assert.strictEqual(r.percentage, pct, `${code} percentage mismatch: expected ${pct}, got ${r.percentage}`);
      assert.strictEqual(r.state, code);
      assert.strictEqual(r.supported, true);
    });
  }
});

// ============================================================================
// Texas (TX) - City-level data
// ============================================================================

describe('Texas Tax Rates', () => {
  it('Houston: 8.25%', () => {
    const r = getTaxRate({ state: 'TX', city: 'Houston' });
    assert.strictEqual(r.rate, 0.0825);
    assert.strictEqual(r.percentage, '8.25%');
    assert.strictEqual(r.jurisdiction, 'Houston');
  });

  it('Dallas: 8.25%', () => {
    const r = getTaxRate({ state: 'TX', city: 'Dallas' });
    assert.strictEqual(r.rate, 0.0825);
  });

  it('Austin: 8.25%', () => {
    const r = getTaxRate({ state: 'TX', city: 'Austin' });
    assert.strictEqual(r.rate, 0.0825);
  });

  it('San Antonio: 8.25%', () => {
    const r = getTaxRate({ state: 'TX', city: 'San Antonio' });
    assert.strictEqual(r.rate, 0.0825);
  });
});

// ============================================================================
// New York (NY) - City-level data
// ============================================================================

describe('New York Tax Rates', () => {
  it('New York City: 8.875%', () => {
    const r = getTaxRate({ state: 'NY', city: 'New York City' });
    assert.strictEqual(r.rate, 0.08875);
  });

  it('NYC (alias): 8.875%', () => {
    const r = getTaxRate({ state: 'NY', city: 'NYC' });
    assert.strictEqual(r.rate, 0.08875);
  });

  it('Buffalo: 8.75%', () => {
    const r = getTaxRate({ state: 'NY', city: 'Buffalo' });
    assert.strictEqual(r.rate, 0.0875);
  });

  it('Rochester: 8.00%', () => {
    const r = getTaxRate({ state: 'NY', city: 'Rochester' });
    assert.strictEqual(r.rate, 0.08);
  });

  it('Albany: 8.00%', () => {
    const r = getTaxRate({ state: 'NY', city: 'Albany' });
    assert.strictEqual(r.rate, 0.08);
  });
});

// ============================================================================
// ZIP Code → State Auto-Detection (all states)
// ============================================================================

describe('ZIP Auto-Detection - All States', () => {
  const zipTests: [string, string][] = [
    ['01001', 'MA'], // Springfield, MA
    ['03101', 'NH'], // Manchester, NH
    ['04101', 'ME'], // Portland, ME
    ['05401', 'VT'], // Burlington, VT
    ['06101', 'CT'], // Hartford, CT
    ['07001', 'NJ'], // Avenel, NJ
    ['10001', 'NY'], // Manhattan
    ['15201', 'PA'], // Pittsburgh
    ['20001', 'DC'], // Washington DC
    ['21201', 'MD'], // Baltimore
    ['22201', 'VA'], // Arlington
    ['25301', 'WV'], // Charleston
    ['27601', 'NC'], // Raleigh
    ['28201', 'NC'], // Charlotte area
    ['29201', 'SC'], // Columbia
    ['30301', 'GA'], // Atlanta
    ['32801', 'FL'], // Orlando
    ['35201', 'AL'], // Birmingham
    ['37201', 'TN'], // Nashville
    ['39201', 'MS'], // Jackson
    ['40201', 'KY'], // Louisville
    ['43201', 'OH'], // Columbus
    ['46201', 'IN'], // Indianapolis
    ['48201', 'MI'], // Detroit
    ['50301', 'IA'], // Des Moines
    ['53201', 'WI'], // Milwaukee
    ['55401', 'MN'], // Minneapolis
    ['57101', 'SD'], // Sioux Falls
    ['58101', 'ND'], // Fargo
    ['59101', 'MT'], // Billings
    ['60601', 'IL'], // Chicago
    ['63101', 'MO'], // St. Louis
    ['66101', 'KS'], // Kansas City, KS
    ['68101', 'NE'], // Omaha
    ['70112', 'LA'], // New Orleans
    ['72201', 'AR'], // Little Rock
    ['73101', 'OK'], // Oklahoma City
    ['75201', 'TX'], // Dallas
    ['80201', 'CO'], // Denver
    ['82001', 'WY'], // Cheyenne
    ['83201', 'ID'], // Pocatello
    ['84101', 'UT'], // Salt Lake City
    ['85001', 'AZ'], // Phoenix
    ['87101', 'NM'], // Albuquerque
    ['89101', 'NV'], // Las Vegas
    ['90210', 'CA'], // Beverly Hills
    ['97201', 'OR'], // Portland
    ['98101', 'WA'], // Seattle
  ];

  for (const [zip, expectedState] of zipTests) {
    it(`${zip} → ${expectedState}`, () => {
      const r = getTaxRate({ zip });
      assert.strictEqual(r.state, expectedState, `ZIP ${zip} expected ${expectedState}, got ${r.state}`);
      assert.strictEqual(r.supported, true);
    });
  }

  it('state override takes precedence over ZIP detection', () => {
    const r = getTaxRate({ zip: '90210', state: 'TX' });
    assert.strictEqual(r.state, 'TX');
  });

  it('unsupported ZIP prefix returns error', () => {
    const r = getTaxRate({ zip: '00601' }); // Puerto Rico
    assert.strictEqual(r.supported, false);
    assert.ok(r.reason);
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('Edge Cases - Multi-State', () => {
  it('invalid state code', () => {
    const r = getTaxRate({ state: 'XX' });
    assert.strictEqual(r.supported, false);
    assert.ok(r.reason);
  });

  it('empty state string', () => {
    const r = getTaxRate({ state: '' });
    assert.strictEqual(r.supported, false);
  });

  it('no parameters returns error', () => {
    const r = getTaxRate({} as any);
    assert.strictEqual(r.supported, false);
  });

  it('all states return valid components', () => {
    const states = getStates();
    for (const state of states) {
      const r = getTaxRate({ state });
      assert.ok('components' in r, `${state} missing components`);
      assert.ok(typeof r.components.state === 'number', `${state} components.state not number`);
      assert.ok(typeof r.components.county === 'number');
      assert.ok(typeof r.components.city === 'number');
      assert.ok(typeof r.components.district === 'number');
    }
  });

  it('all states return metadata', () => {
    const states = getStates();
    for (const state of states) {
      const r = getTaxRate({ state });
      assert.ok(r.source, `${state} missing source`);
      assert.ok(r.effectiveDate, `${state} missing effectiveDate`);
      assert.strictEqual(r.supported, true, `${state} not supported`);
    }
  });

  it('case-insensitive state codes for all states', () => {
    for (const code of ['al', 'Az', 'cO', 'DC', 'il', 'mn', 'Wv']) {
      const r = getTaxRate({ state: code });
      assert.strictEqual(r.supported, true, `${code} should be supported`);
      assert.strictEqual(r.state, code.toUpperCase());
    }
  });

  it('highest state rate: California at 7.25%', () => {
    const r = getTaxRate({ state: 'CA' });
    assert.strictEqual(r.rate, 0.0725);
  });

  it('lowest non-zero rate: Colorado at 2.90%', () => {
    const r = getTaxRate({ state: 'CO' });
    assert.strictEqual(r.rate, 0.029);
  });

  it('states tied at 7.00%: IN, MS, RI, TN', () => {
    for (const code of ['IN', 'MS', 'RI', 'TN']) {
      const r = getTaxRate({ state: code });
      assert.strictEqual(r.rate, 0.07, `${code} should be 7.00%`);
    }
  });
});
