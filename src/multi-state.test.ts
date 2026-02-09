/**
 * Multi-state test suite for taxrates-us
 * Tests for TX, NY, FL, WA, NV, OR
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { getTaxRate, getStates } from './index';

// ============================================================================
// Multi-State Support
// ============================================================================

describe('Multi-State Support', () => {
  it('getStates returns all supported states', () => {
    const states = getStates();
    assert.ok(states.includes('CA'));
    assert.ok(states.includes('TX'));
    assert.ok(states.includes('NY'));
    assert.ok(states.includes('FL'));
    assert.ok(states.includes('WA'));
    assert.ok(states.includes('NV'));
    assert.ok(states.includes('OR'));
    assert.strictEqual(states.length, 7);
  });
});

// ============================================================================
// Texas (TX)
// ============================================================================

describe('Texas Tax Rates', () => {
  it('TX state base rate: 6.25%', () => {
    const r = getTaxRate({ state: 'TX' });
    assert.strictEqual(r.rate, 0.0625);
    assert.strictEqual(r.percentage, '6.25%');
    assert.strictEqual(r.state, 'TX');
    assert.strictEqual(r.supported, true);
  });

  it('TX rate from ZIP (75201 - Dallas)', () => {
    const r = getTaxRate({ zip: '75201' });
    assert.strictEqual(r.state, 'TX');
    assert.strictEqual(r.rate, 0.0625);
  });

  it('TX rate from ZIP (78701 - Austin)', () => {
    const r = getTaxRate({ zip: '78701' });
    assert.strictEqual(r.state, 'TX');
    assert.strictEqual(r.rate, 0.0625);
  });

  it('TX case-insensitive state code', () => {
    const r = getTaxRate({ state: 'tx' });
    assert.strictEqual(r.state, 'TX');
    assert.strictEqual(r.supported, true);
  });
});

// ============================================================================
// New York (NY)
// ============================================================================

describe('New York Tax Rates', () => {
  it('NY state base rate: 4.00%', () => {
    const r = getTaxRate({ state: 'NY' });
    assert.strictEqual(r.rate, 0.04);
    assert.strictEqual(r.percentage, '4.00%');
    assert.strictEqual(r.state, 'NY');
    assert.strictEqual(r.supported, true);
  });

  it('NY rate from ZIP (10001 - Manhattan)', () => {
    const r = getTaxRate({ zip: '10001' });
    assert.strictEqual(r.state, 'NY');
    assert.strictEqual(r.rate, 0.04);
  });

  it('NY rate from ZIP (11201 - Brooklyn)', () => {
    const r = getTaxRate({ zip: '11201' });
    assert.strictEqual(r.state, 'NY');
    assert.strictEqual(r.rate, 0.04);
  });
});

// ============================================================================
// Florida (FL)
// ============================================================================

describe('Florida Tax Rates', () => {
  it('FL state base rate: 6.00%', () => {
    const r = getTaxRate({ state: 'FL' });
    assert.strictEqual(r.rate, 0.06);
    assert.strictEqual(r.percentage, '6.00%');
    assert.strictEqual(r.state, 'FL');
    assert.strictEqual(r.supported, true);
  });

  it('FL rate from ZIP (33101 - Miami)', () => {
    const r = getTaxRate({ zip: '33101' });
    assert.strictEqual(r.state, 'FL');
    assert.strictEqual(r.rate, 0.06);
  });

  it('FL rate from ZIP (32801 - Orlando)', () => {
    const r = getTaxRate({ zip: '32801' });
    assert.strictEqual(r.state, 'FL');
    assert.strictEqual(r.rate, 0.06);
  });
});

// ============================================================================
// Washington (WA)
// ============================================================================

describe('Washington Tax Rates', () => {
  it('WA state base rate: 6.50%', () => {
    const r = getTaxRate({ state: 'WA' });
    assert.strictEqual(r.rate, 0.065);
    assert.strictEqual(r.percentage, '6.50%');
    assert.strictEqual(r.state, 'WA');
    assert.strictEqual(r.supported, true);
  });

  it('WA rate from ZIP (98101 - Seattle)', () => {
    const r = getTaxRate({ zip: '98101' });
    assert.strictEqual(r.state, 'WA');
    assert.strictEqual(r.rate, 0.065);
  });

  it('WA rate from ZIP (99201 - Spokane)', () => {
    const r = getTaxRate({ zip: '99201' });
    assert.strictEqual(r.state, 'WA');
    assert.strictEqual(r.rate, 0.065);
  });
});

// ============================================================================
// Nevada (NV)
// ============================================================================

describe('Nevada Tax Rates', () => {
  it('NV state base rate: 6.85%', () => {
    const r = getTaxRate({ state: 'NV' });
    assert.strictEqual(r.rate, 0.0685);
    assert.strictEqual(r.percentage, '6.85%');
    assert.strictEqual(r.state, 'NV');
    assert.strictEqual(r.supported, true);
  });

  it('NV rate from ZIP (89101 - Las Vegas)', () => {
    const r = getTaxRate({ zip: '89101' });
    assert.strictEqual(r.state, 'NV');
    assert.strictEqual(r.rate, 0.0685);
  });

  it('NV rate from ZIP (89501 - Reno)', () => {
    const r = getTaxRate({ zip: '89501' });
    assert.strictEqual(r.state, 'NV');
    assert.strictEqual(r.rate, 0.0685);
  });
});

// ============================================================================
// Oregon (OR)
// ============================================================================

describe('Oregon Tax Rates', () => {
  it('OR has no sales tax: 0.00%', () => {
    const r = getTaxRate({ state: 'OR' });
    assert.strictEqual(r.rate, 0);
    assert.strictEqual(r.percentage, '0.00%');
    assert.strictEqual(r.state, 'OR');
    assert.strictEqual(r.supported, true);
  });

  it('OR rate from ZIP (97201 - Portland)', () => {
    const r = getTaxRate({ zip: '97201' });
    assert.strictEqual(r.state, 'OR');
    assert.strictEqual(r.rate, 0);
  });

  it('OR rate from ZIP (97401 - Eugene)', () => {
    const r = getTaxRate({ zip: '97401' });
    assert.strictEqual(r.state, 'OR');
    assert.strictEqual(r.rate, 0);
  });
});

// ============================================================================
// State Auto-Detection from ZIP
// ============================================================================

describe('State Auto-Detection from ZIP', () => {
  it('detects CA from 90210', () => {
    const r = getTaxRate({ zip: '90210' });
    assert.strictEqual(r.state, 'CA');
  });

  it('detects TX from 75001', () => {
    const r = getTaxRate({ zip: '75001' });
    assert.strictEqual(r.state, 'TX');
  });

  it('detects NY from 10001', () => {
    const r = getTaxRate({ zip: '10001' });
    assert.strictEqual(r.state, 'NY');
  });

  it('detects FL from 33101', () => {
    const r = getTaxRate({ zip: '33101' });
    assert.strictEqual(r.state, 'FL');
  });

  it('detects WA from 98101', () => {
    const r = getTaxRate({ zip: '98101' });
    assert.strictEqual(r.state, 'WA');
  });

  it('detects NV from 89101', () => {
    const r = getTaxRate({ zip: '89101' });
    assert.strictEqual(r.state, 'NV');
  });

  it('detects OR from 97201', () => {
    const r = getTaxRate({ zip: '97201' });
    assert.strictEqual(r.state, 'OR');
  });

  it('state override takes precedence', () => {
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

  it('no parameters throws or returns error', () => {
    const r = getTaxRate({} as any);
    assert.strictEqual(r.supported, false);
  });

  it('all states return valid components', () => {
    const states = ['CA', 'TX', 'NY', 'FL', 'WA', 'NV', 'OR'];
    for (const state of states) {
      const r = getTaxRate({ state });
      assert.ok('components' in r);
      assert.ok(typeof r.components.state === 'number');
      assert.ok(typeof r.components.county === 'number');
      assert.ok(typeof r.components.city === 'number');
      assert.ok(typeof r.components.district === 'number');
    }
  });

  it('all states return metadata', () => {
    const states = ['CA', 'TX', 'NY', 'FL', 'WA', 'NV', 'OR'];
    for (const state of states) {
      const r = getTaxRate({ state });
      assert.ok(r.source);
      assert.ok(r.effectiveDate);
    }
  });
});
