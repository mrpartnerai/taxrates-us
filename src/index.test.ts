/**
 * Test suite for taxrates-us
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { getTaxRate, getSupportedStates, getMetadata } from './index';

describe('getTaxRate', () => {
  describe('California lookups', () => {
    it('should return correct rate for Sacramento', () => {
      const result = getTaxRate({ state: 'CA', city: 'Sacramento' });
      assert.strictEqual(result.rate, 0.0875);
      assert.strictEqual(result.percentage, '8.75%');
      assert.strictEqual(result.jurisdiction, 'Sacramento');
      assert.strictEqual(result.state, 'CA');
      assert.strictEqual(result.supported, true);
      assert.strictEqual(result.components.state, 0.0725);
      assert.strictEqual(result.components.district, 0.015);
    });
    
    it('should return correct rate for Los Angeles County', () => {
      const result = getTaxRate({ state: 'CA', city: 'Los Angeles County' });
      assert.strictEqual(result.rate, 0.0975);
      assert.strictEqual(result.percentage, '9.75%');
      assert.strictEqual(result.jurisdiction, 'Los Angeles County');
      assert.strictEqual(result.state, 'CA');
    });
    
    it('should return correct rate for Alameda', () => {
      const result = getTaxRate({ state: 'CA', city: 'Alameda' });
      assert.strictEqual(result.rate, 0.1075);
      assert.strictEqual(result.percentage, '10.75%');
      assert.strictEqual(result.jurisdiction, 'Alameda');
    });
    
    it('should return correct rate for Alpine County', () => {
      const result = getTaxRate({ state: 'CA', city: 'Alpine County' });
      assert.strictEqual(result.rate, 0.0725);
      assert.strictEqual(result.percentage, '7.25%');
      assert.strictEqual(result.jurisdiction, 'Alpine County');
    });
    
    it('should be case-insensitive for city names', () => {
      const result1 = getTaxRate({ state: 'CA', city: 'sacramento' });
      const result2 = getTaxRate({ state: 'CA', city: 'SACRAMENTO' });
      const result3 = getTaxRate({ state: 'CA', city: 'SaCrAmEnTo' });
      
      assert.strictEqual(result1.rate, 0.0875);
      assert.strictEqual(result2.rate, 0.0875);
      assert.strictEqual(result3.rate, 0.0875);
    });
    
    it('should find county when "County" is omitted', () => {
      const result = getTaxRate({ state: 'CA', city: 'Alpine' });
      assert.strictEqual(result.rate, 0.0725);
      assert.strictEqual(result.jurisdiction, 'Alpine County');
    });
    
    it('should return state base rate when city not found', () => {
      const result = getTaxRate({ state: 'CA', city: 'NonexistentCity' });
      assert.strictEqual(result.rate, 0.0725);
      assert.strictEqual(result.percentage, '7.25%');
      assert.strictEqual(result.jurisdiction, 'California (State Base Rate)');
    });
    
    it('should return state base rate when no city specified', () => {
      const result = getTaxRate({ state: 'CA' });
      assert.strictEqual(result.rate, 0.0725);
      assert.strictEqual(result.percentage, '7.25%');
      assert.strictEqual(result.jurisdiction, 'California (State Base Rate)');
    });
    
    it('should handle case-insensitive state codes', () => {
      const result1 = getTaxRate({ state: 'ca', city: 'Sacramento' });
      const result2 = getTaxRate({ state: 'Ca', city: 'Sacramento' });
      
      assert.strictEqual(result1.rate, 0.0875);
      assert.strictEqual(result2.rate, 0.0875);
    });
  });
  
  describe('Non-CA states (unsupported)', () => {
    it('should return 0 rate for Texas', () => {
      const result = getTaxRate({ state: 'TX' });
      assert.strictEqual(result.rate, 0);
      assert.strictEqual(result.percentage, '0.00%');
      assert.strictEqual(result.supported, false);
      assert.strictEqual(result.reason, 'No nexus in TX. Only California is currently supported.');
    });
    
    it('should return 0 rate for New York', () => {
      const result = getTaxRate({ state: 'NY' });
      assert.strictEqual(result.rate, 0);
      assert.strictEqual(result.supported, false);
    });
    
    it('should return 0 rate for Florida', () => {
      const result = getTaxRate({ state: 'FL', city: 'Miami' });
      assert.strictEqual(result.rate, 0);
      assert.strictEqual(result.supported, false);
    });
  });
  
  describe('Edge cases', () => {
    it('should handle highest rate jurisdiction (Lancaster - 11.25%)', () => {
      const result = getTaxRate({ state: 'CA', city: 'Lancaster' });
      assert.strictEqual(result.rate, 0.1125);
      assert.strictEqual(result.percentage, '11.25%');
    });
    
    it('should return valid source and effective date', () => {
      const result = getTaxRate({ state: 'CA', city: 'Sacramento' });
      assert.ok(result.source.includes('CDTFA') || result.source.includes('California'));
      assert.strictEqual(result.effectiveDate, '2026-01-01');
    });
  });
});

describe('getSupportedStates', () => {
  it('should return array with CA', () => {
    const states = getSupportedStates();
    assert.strictEqual(Array.isArray(states), true);
    assert.strictEqual(states.includes('CA'), true);
    assert.strictEqual(states.length, 1);
  });
});

describe('getMetadata', () => {
  it('should return metadata with all required fields', () => {
    const metadata = getMetadata();
    assert.ok(metadata.effectiveDate);
    assert.ok(metadata.source);
    assert.ok(metadata.lastUpdated);
    assert.ok(metadata.jurisdictionCount > 0);
    assert.ok(metadata.version);
    assert.ok(metadata.supportedStates);
  });
  
  it('should have correct jurisdiction count', () => {
    const metadata = getMetadata();
    assert.strictEqual(metadata.jurisdictionCount, 546);
  });
});
