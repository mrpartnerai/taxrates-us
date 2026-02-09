/**
 * taxrates-us - Accurate US sales tax rate lookups
 * Supports: CA, TX, NY, FL, WA, NV, OR
 * 
 * Zero runtime dependencies. Works offline with bundled data.
 */

import { TaxRateRequest, TaxRateResponse, TaxRateData, Jurisdiction, ZipEntry } from './types';

// Import all state data
import caTaxRates from './data/ca-tax-rates.json';
import caZipMap from './data/ca-zip-map.json';
import txTaxRates from './data/tx-tax-rates.json';
import nyTaxRates from './data/ny-tax-rates.json';
import flTaxRates from './data/fl-tax-rates.json';
import waTaxRates from './data/wa-tax-rates.json';
import nvTaxRates from './data/nv-tax-rates.json';
import orTaxRates from './data/or-tax-rates.json';

export { TaxRateRequest, TaxRateResponse, Jurisdiction, TaxRateData, ZipEntry };

// State data registry
const stateData: Record<string, TaxRateData> = {
  CA: caTaxRates as TaxRateData,
  TX: txTaxRates as TaxRateData,
  NY: nyTaxRates as TaxRateData,
  FL: flTaxRates as TaxRateData,
  WA: waTaxRates as TaxRateData,
  NV: nvTaxRates as TaxRateData,
  OR: orTaxRates as TaxRateData,
};

// ZIP to state mapping (for auto-detection)
const zipToState: Record<string, string> = {
  // California: 900xx-961xx
  '90': 'CA', '91': 'CA', '92': 'CA', '93': 'CA', '94': 'CA', '95': 'CA', '96': 'CA',
  // Texas: 750xx-799xx, 885xx
  '75': 'TX', '76': 'TX', '77': 'TX', '78': 'TX', '79': 'TX', '88': 'TX',
  // New York: 100xx-149xx
  '10': 'NY', '11': 'NY', '12': 'NY', '13': 'NY', '14': 'NY',
  // Florida: 320xx-349xx
  '32': 'FL', '33': 'FL', '34': 'FL',
  // Washington: 980xx-994xx
  '98': 'WA', '99': 'WA',
  // Nevada: 889xx-898xx
  '89': 'NV',
  // Oregon: 970xx-979xx
  '97': 'OR',
};

// CA-specific data
const caZipMapData = caZipMap as Record<string, ZipEntry>;

/** California state base tax rate (7.25%) */
const CA_STATE_BASE_RATE = 0.0725;

/** Breakdown of the 7.25% CA state base rate */
const CA_STATE_COMPONENTS = {
  stateGeneral: 0.0600,
  countyLocal: 0.0125,
};

/**
 * Get tax rate for a given location.
 * 
 * Lookup priority:
 * 1. If ZIP provided, auto-detect state from ZIP prefix
 * 2. Use explicit state parameter
 * 3. City name (most specific)
 * 4. ZIP code → mapped city (CA only)
 * 5. County name
 * 6. State default (base rate)
 * 
 * @param request - Location request with state and optional city/zip/county
 * @returns Tax rate information including rate, components, and source
 * 
 * @example
 * ```typescript
 * import { getTaxRate } from 'taxrates-us';
 * 
 * // Auto-detect state from ZIP
 * const rate = getTaxRate({ zip: '90210' });
 * console.log(rate.state); // "CA"
 * 
 * // Explicit state
 * const txRate = getTaxRate({ state: 'TX' });
 * console.log(txRate.percentage); // "6.25%"
 * 
 * // With state override
 * const nyRate = getTaxRate({ state: 'NY' });
 * console.log(nyRate.percentage); // "4.00%"
 * ```
 */
export function getTaxRate(request: TaxRateRequest | { zip: string; state?: string }): TaxRateResponse {
  let state: string;
  
  // Auto-detect state from ZIP if provided
  if ('zip' in request && request.zip) {
    const zipPrefix = request.zip.substring(0, 2);
    const detectedState = zipToState[zipPrefix];
    
    if (detectedState && !request.state) {
      state = detectedState;
    } else if (request.state) {
      state = request.state.toUpperCase().trim();
    } else {
      // ZIP provided but not in our mapping
      return createUnsupportedResponse('UNKNOWN', 'Could not determine state from ZIP code');
    }
  } else if ('state' in request && request.state) {
    state = request.state.toUpperCase().trim();
  } else {
    return createUnsupportedResponse('UNKNOWN', 'Either state or zip parameter is required');
  }
  
  // Check if state is supported
  const data = stateData[state];
  if (!data) {
    return createUnsupportedResponse(state);
  }
  
  // Special handling for CA (has city/county data)
  if (state === 'CA') {
    return getCaliforniaRate(request as TaxRateRequest);
  }
  
  // For other states, return base state rate
  return getStateBaseRate(state, data);
}

/**
 * Get California tax rate (legacy detailed lookup)
 */
function getCaliforniaRate(request: TaxRateRequest): TaxRateResponse {
  // 1. Try direct city name lookup
  if (request.city) {
    const result = lookupByCity(request.city);
    if (result) return result;
  }
  
  // 2. Try ZIP code lookup
  if (request.zip) {
    const result = lookupByZip(request.zip);
    if (result) return result;
  }
  
  // 3. Try county lookup
  if (request.county) {
    const result = lookupByCounty(request.county);
    if (result) return result;
  }
  
  // 4. Fall back to state base rate
  return createStateDefaultResponse();
}

/**
 * Get base state rate for non-CA states
 */
function getStateBaseRate(state: string, data: TaxRateData): TaxRateResponse {
  const stateJurisdiction = data.lookup.byState?.[state.toLowerCase()];
  
  if (!stateJurisdiction) {
    // Fallback: use first jurisdiction
    const jurisdiction = data.jurisdictions[0];
    return createSimpleResponse(jurisdiction, state, data);
  }
  
  return createSimpleResponse(stateJurisdiction, state, data);
}

/**
 * Look up tax rate by city name (CA only)
 */
function lookupByCity(cityName: string): TaxRateResponse | null {
  const caData = stateData.CA;
  const key = cityName.toLowerCase().trim();
  
  let jurisdiction = caData.lookup.byCity[key];
  
  if (jurisdiction) {
    return createResponse(jurisdiction, 'city');
  }
  
  // Try county lookup
  jurisdiction = caData.lookup.byCounty[key];
  if (jurisdiction) {
    return createResponse(jurisdiction, 'county');
  }
  
  // Try appending "county"
  if (!key.includes('county')) {
    jurisdiction = caData.lookup.byCounty[`${key} county`];
    if (jurisdiction) {
      return createResponse(jurisdiction, 'county');
    }
  }
  
  return null;
}

/**
 * Look up tax rate by ZIP code (CA only)
 */
function lookupByZip(zip: string): TaxRateResponse | null {
  const caData = stateData.CA;
  const cleanZip = zip.trim().substring(0, 5);
  
  const zipEntry = caZipMapData[cleanZip];
  if (!zipEntry) return null;
  
  // Try to find the city
  const cityKey = zipEntry.city.toLowerCase();
  let jurisdiction = caData.lookup.byCity[cityKey];
  
  if (jurisdiction) {
    return createResponse(jurisdiction, 'zip');
  }
  
  // Fall back to county
  const countyKey = `${zipEntry.county.toLowerCase()} county`;
  jurisdiction = caData.lookup.byCounty[countyKey];
  
  if (jurisdiction) {
    return createResponse(jurisdiction, 'zip');
  }
  
  return null;
}

/**
 * Look up tax rate by county name (CA only)
 */
function lookupByCounty(countyName: string): TaxRateResponse | null {
  const caData = stateData.CA;
  const key = countyName.toLowerCase().trim();
  
  let jurisdiction = caData.lookup.byCounty[key];
  if (jurisdiction) {
    return createResponse(jurisdiction, 'county');
  }
  
  if (!key.includes('county')) {
    jurisdiction = caData.lookup.byCounty[`${key} county`];
    if (jurisdiction) {
      return createResponse(jurisdiction, 'county');
    }
  }
  
  return null;
}

/**
 * Build a TaxRateResponse from a jurisdiction record (CA-specific)
 */
function createResponse(
  jurisdiction: Jurisdiction, 
  method: 'city' | 'county' | 'zip'
): TaxRateResponse {
  const caData = stateData.CA;
  const districtTax = jurisdiction.districtTax;
  
  let cityDistrict = 0;
  let otherDistrict = districtTax;
  
  if (jurisdiction.type === 'City') {
    const countyKey = `${jurisdiction.county.toLowerCase()} county`;
    const countyJurisdiction = caData.lookup.byCounty[countyKey];
    
    if (countyJurisdiction) {
      const countyDistrict = countyJurisdiction.districtTax;
      cityDistrict = Math.round((districtTax - countyDistrict) * 10000) / 10000;
      otherDistrict = countyDistrict;
      
      if (cityDistrict < 0) {
        cityDistrict = 0;
        otherDistrict = districtTax;
      }
    }
  }
  
  return {
    rate: jurisdiction.rate,
    percentage: jurisdiction.ratePercent,
    jurisdiction: jurisdiction.location,
    state: 'CA',
    county: jurisdiction.county,
    components: {
      state: CA_STATE_COMPONENTS.stateGeneral,
      county: CA_STATE_COMPONENTS.countyLocal,
      city: cityDistrict,
      district: otherDistrict,
    },
    source: caData.metadata.source,
    effectiveDate: caData.metadata.effectiveDate,
    supported: true,
    lookupMethod: method,
  };
}

/**
 * Build a simple response for non-CA states
 */
function createSimpleResponse(
  jurisdiction: Jurisdiction,
  state: string,
  data: TaxRateData
): TaxRateResponse {
  return {
    rate: jurisdiction.rate,
    percentage: jurisdiction.ratePercent,
    jurisdiction: jurisdiction.location,
    state: state,
    components: {
      state: jurisdiction.rate,
      county: 0,
      city: 0,
      district: 0,
    },
    source: data.metadata.source,
    effectiveDate: data.metadata.effectiveDate,
    supported: true,
    lookupMethod: 'state-default',
  };
}

/**
 * Build a response for the CA state base rate
 */
function createStateDefaultResponse(): TaxRateResponse {
  const caData = stateData.CA;
  return {
    rate: CA_STATE_BASE_RATE,
    percentage: '7.25%',
    jurisdiction: 'California (State Base Rate)',
    state: 'CA',
    components: {
      state: CA_STATE_COMPONENTS.stateGeneral,
      county: CA_STATE_COMPONENTS.countyLocal,
      city: 0,
      district: 0,
    },
    source: caData.metadata.source,
    effectiveDate: caData.metadata.effectiveDate,
    supported: true,
    lookupMethod: 'state-default',
  };
}

/**
 * Build a response for unsupported states
 */
function createUnsupportedResponse(state: string, customReason?: string): TaxRateResponse {
  const supportedStates = Object.keys(stateData).join(', ');
  return {
    rate: 0,
    percentage: '0.00%',
    jurisdiction: 'N/A',
    state: state,
    components: {
      state: 0,
      county: 0,
      city: 0,
      district: 0,
    },
    source: 'taxrates-us',
    effectiveDate: 'N/A',
    supported: false,
    reason: customReason || `State "${state}" is not yet supported. Currently supported: ${supportedStates}.`,
  };
}

/**
 * Get all supported states
 * @returns Array of supported state codes
 */
export function getStates(): string[] {
  return Object.keys(stateData);
}

/**
 * Legacy alias for getStates()
 * @deprecated Use getStates() instead
 */
export function getSupportedStates(): string[] {
  return getStates();
}

/**
 * Get metadata about the tax rate data
 */
export function getMetadata(state?: string) {
  if (state) {
    const data = stateData[state.toUpperCase()];
    if (!data) {
      throw new Error(`State "${state}" is not supported`);
    }
    return {
      ...data.metadata,
      state: state.toUpperCase(),
    };
  }
  
  // Return combined metadata
  const caData = stateData.CA;
  return {
    ...caData.metadata,
    supportedStates: getStates(),
    zipCodesLoaded: Object.keys(caZipMapData).length,
  };
}

/**
 * Get all jurisdictions for a state
 * @param state - Two-letter state code
 * @returns Array of jurisdictions or empty array if state not supported
 */
export function getJurisdictions(state: string): Jurisdiction[] {
  const data = stateData[state.toUpperCase()];
  if (!data) return [];
  return [...data.jurisdictions];
}

/**
 * Check if a ZIP code is in our mapping (CA only)
 * @param zip - 5-digit ZIP code
 * @returns ZIP entry with city and county, or null
 */
export function lookupZip(zip: string): ZipEntry | null {
  const cleanZip = zip.trim().substring(0, 5);
  return caZipMapData[cleanZip] || null;
}
