/**
 * taxrates-us - Accurate US sales tax rate lookups
 * Starting with California (CDTFA data)
 */

import { TaxRateRequest, TaxRateResponse, Jurisdiction, TaxRateData } from './types';
import taxRateDataRaw from './data/ca-tax-rates.json';

const taxRateData = taxRateDataRaw as TaxRateData;

export { TaxRateRequest, TaxRateResponse, Jurisdiction };

const CA_STATE_BASE_RATE = 0.0725;

/**
 * Get tax rate for a given location
 * 
 * @param request - Location request with state and optional city/zip
 * @returns Tax rate information including rate, components, and source
 * 
 * @example
 * ```typescript
 * import { getTaxRate } from 'taxrates-us';
 * 
 * const rate = getTaxRate({ state: 'CA', city: 'Sacramento' });
 * console.log(rate.percentage); // "8.75%"
 * 
 * const countyRate = getTaxRate({ state: 'CA', city: 'Alpine County' });
 * console.log(countyRate.percentage); // "7.25%"
 * 
 * const unsupported = getTaxRate({ state: 'TX' });
 * console.log(unsupported.supported); // false
 * ```
 */
export function getTaxRate(request: TaxRateRequest): TaxRateResponse {
  const state = request.state.toUpperCase();
  
  // Only California is currently supported
  if (state !== 'CA') {
    return {
      rate: 0,
      percentage: '0.00%',
      jurisdiction: 'N/A',
      state: state,
      components: {
        state: 0,
        district: 0
      },
      source: 'taxrates-us',
      effectiveDate: 'N/A',
      supported: false,
      reason: `No nexus in ${state}. Only California is currently supported.`
    };
  }
  
  // California lookup
  let jurisdiction: Jurisdiction | undefined;
  
  if (request.city) {
    const cityKey = request.city.toLowerCase();
    
    // Try city lookup first
    jurisdiction = taxRateData.lookup.byCity[cityKey];
    
    // If not found, try county lookup
    if (!jurisdiction) {
      jurisdiction = taxRateData.lookup.byCounty[cityKey];
    }
    
    // If still not found, try appending "county" to the search
    if (!jurisdiction && !cityKey.includes('county')) {
      jurisdiction = taxRateData.lookup.byCounty[`${cityKey} county`];
    }
  }
  
  // If no city specified or not found, return state base rate
  if (!jurisdiction) {
    return {
      rate: CA_STATE_BASE_RATE,
      percentage: '7.25%',
      jurisdiction: 'California (State Base Rate)',
      state: 'CA',
      components: {
        state: CA_STATE_BASE_RATE,
        district: 0
      },
      source: taxRateData.metadata.source,
      effectiveDate: taxRateData.metadata.effectiveDate,
      supported: true
    };
  }
  
  return {
    rate: jurisdiction.rate,
    percentage: jurisdiction.ratePercent,
    jurisdiction: jurisdiction.location,
    state: 'CA',
    components: {
      state: CA_STATE_BASE_RATE,
      district: jurisdiction.districtTax
    },
    source: taxRateData.metadata.source,
    effectiveDate: taxRateData.metadata.effectiveDate,
    supported: true
  };
}

/**
 * Get all supported states
 * @returns Array of supported state codes
 */
export function getSupportedStates(): string[] {
  return ['CA'];
}

/**
 * Get metadata about the tax rate data
 */
export function getMetadata() {
  return {
    ...taxRateData.metadata,
    supportedStates: getSupportedStates()
  };
}
