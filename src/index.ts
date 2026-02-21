/**
 * taxrates-us - Accurate US sales tax rate lookups
 * Supports: All 50 states + DC
 * 
 * Zero runtime dependencies. Works offline with bundled data.
 * ZIP-level rates sourced from Avalara free tax rate tables (avalara.com/taxrates).
 */

import { TaxRateRequest, TaxRateResponse, TaxRateData, Jurisdiction, ZipEntry, ZipRateEntry, ZipRateMap } from './types';

// Import all state data
import alTaxRates from './data/al-tax-rates.json';
import akTaxRates from './data/ak-tax-rates.json';
import azTaxRates from './data/az-tax-rates.json';
import arTaxRates from './data/ar-tax-rates.json';
import caTaxRates from './data/ca-tax-rates.json';
import caZipMap from './data/ca-zip-map.json';

// ZIP-level rate data (Avalara ZIP5 tables, February 2026)
import akZipRates from './data/zip-rates/ak-zip-rates.json';
import alZipRates from './data/zip-rates/al-zip-rates.json';
import arZipRates from './data/zip-rates/ar-zip-rates.json';
import azZipRates from './data/zip-rates/az-zip-rates.json';
import caZipRates from './data/zip-rates/ca-zip-rates.json';
import coZipRates from './data/zip-rates/co-zip-rates.json';
import ctZipRates from './data/zip-rates/ct-zip-rates.json';
import dcZipRates from './data/zip-rates/dc-zip-rates.json';
import deZipRates from './data/zip-rates/de-zip-rates.json';
import flZipRates from './data/zip-rates/fl-zip-rates.json';
import gaZipRates from './data/zip-rates/ga-zip-rates.json';
import hiZipRates from './data/zip-rates/hi-zip-rates.json';
import iaZipRates from './data/zip-rates/ia-zip-rates.json';
import idZipRates from './data/zip-rates/id-zip-rates.json';
import ilZipRates from './data/zip-rates/il-zip-rates.json';
import inZipRates from './data/zip-rates/in-zip-rates.json';
import ksZipRates from './data/zip-rates/ks-zip-rates.json';
import kyZipRates from './data/zip-rates/ky-zip-rates.json';
import laZipRates from './data/zip-rates/la-zip-rates.json';
import maZipRates from './data/zip-rates/ma-zip-rates.json';
import mdZipRates from './data/zip-rates/md-zip-rates.json';
import meZipRates from './data/zip-rates/me-zip-rates.json';
import miZipRates from './data/zip-rates/mi-zip-rates.json';
import mnZipRates from './data/zip-rates/mn-zip-rates.json';
import moZipRates from './data/zip-rates/mo-zip-rates.json';
import msZipRates from './data/zip-rates/ms-zip-rates.json';
import mtZipRates from './data/zip-rates/mt-zip-rates.json';
import ncZipRates from './data/zip-rates/nc-zip-rates.json';
import ndZipRates from './data/zip-rates/nd-zip-rates.json';
import neZipRates from './data/zip-rates/ne-zip-rates.json';
import nhZipRates from './data/zip-rates/nh-zip-rates.json';
import njZipRates from './data/zip-rates/nj-zip-rates.json';
import nmZipRates from './data/zip-rates/nm-zip-rates.json';
import nvZipRates from './data/zip-rates/nv-zip-rates.json';
import nyZipRates from './data/zip-rates/ny-zip-rates.json';
import ohZipRates from './data/zip-rates/oh-zip-rates.json';
import okZipRates from './data/zip-rates/ok-zip-rates.json';
import orZipRates from './data/zip-rates/or-zip-rates.json';
import paZipRates from './data/zip-rates/pa-zip-rates.json';
import prZipRates from './data/zip-rates/pr-zip-rates.json';
import riZipRates from './data/zip-rates/ri-zip-rates.json';
import scZipRates from './data/zip-rates/sc-zip-rates.json';
import sdZipRates from './data/zip-rates/sd-zip-rates.json';
import tnZipRates from './data/zip-rates/tn-zip-rates.json';
import txZipRates from './data/zip-rates/tx-zip-rates.json';
import utZipRates from './data/zip-rates/ut-zip-rates.json';
import vaZipRates from './data/zip-rates/va-zip-rates.json';
import vtZipRates from './data/zip-rates/vt-zip-rates.json';
import waZipRates from './data/zip-rates/wa-zip-rates.json';
import wiZipRates from './data/zip-rates/wi-zip-rates.json';
import wvZipRates from './data/zip-rates/wv-zip-rates.json';
import wyZipRates from './data/zip-rates/wy-zip-rates.json';
import coTaxRates from './data/co-tax-rates.json';
import ctTaxRates from './data/ct-tax-rates.json';
import deTaxRates from './data/de-tax-rates.json';
import dcTaxRates from './data/dc-tax-rates.json';
import flTaxRates from './data/fl-tax-rates.json';
import gaTaxRates from './data/ga-tax-rates.json';
import hiTaxRates from './data/hi-tax-rates.json';
import idTaxRates from './data/id-tax-rates.json';
import ilTaxRates from './data/il-tax-rates.json';
import inTaxRates from './data/in-tax-rates.json';
import iaTaxRates from './data/ia-tax-rates.json';
import ksTaxRates from './data/ks-tax-rates.json';
import kyTaxRates from './data/ky-tax-rates.json';
import laTaxRates from './data/la-tax-rates.json';
import meTaxRates from './data/me-tax-rates.json';
import mdTaxRates from './data/md-tax-rates.json';
import maTaxRates from './data/ma-tax-rates.json';
import miTaxRates from './data/mi-tax-rates.json';
import mnTaxRates from './data/mn-tax-rates.json';
import msTaxRates from './data/ms-tax-rates.json';
import moTaxRates from './data/mo-tax-rates.json';
import mtTaxRates from './data/mt-tax-rates.json';
import neTaxRates from './data/ne-tax-rates.json';
import nhTaxRates from './data/nh-tax-rates.json';
import njTaxRates from './data/nj-tax-rates.json';
import nmTaxRates from './data/nm-tax-rates.json';
import nyTaxRates from './data/ny-tax-rates.json';
import ncTaxRates from './data/nc-tax-rates.json';
import ndTaxRates from './data/nd-tax-rates.json';
import nvTaxRates from './data/nv-tax-rates.json';
import ohTaxRates from './data/oh-tax-rates.json';
import okTaxRates from './data/ok-tax-rates.json';
import orTaxRates from './data/or-tax-rates.json';
import paTaxRates from './data/pa-tax-rates.json';
import riTaxRates from './data/ri-tax-rates.json';
import scTaxRates from './data/sc-tax-rates.json';
import sdTaxRates from './data/sd-tax-rates.json';
import tnTaxRates from './data/tn-tax-rates.json';
import txTaxRates from './data/tx-tax-rates.json';
import utTaxRates from './data/ut-tax-rates.json';
import vtTaxRates from './data/vt-tax-rates.json';
import vaTaxRates from './data/va-tax-rates.json';
import waTaxRates from './data/wa-tax-rates.json';
import wvTaxRates from './data/wv-tax-rates.json';
import wiTaxRates from './data/wi-tax-rates.json';
import wyTaxRates from './data/wy-tax-rates.json';

export type { TaxRateRequest, TaxRateResponse, Jurisdiction, TaxRateData, ZipEntry, ZipRateEntry, ZipRateMap };

/** Standard disclaimer for all API responses */
const DISCLAIMER = 'This data is provided for informational purposes only and is not tax advice. Tax rates may change. Always verify rates with official state/local tax authorities before making tax decisions. Use at your own risk.';

// State data registry - all 50 states + DC
const stateData: Record<string, TaxRateData> = {
  AL: alTaxRates as TaxRateData,
  AK: akTaxRates as TaxRateData,
  AZ: azTaxRates as TaxRateData,
  AR: arTaxRates as TaxRateData,
  CA: caTaxRates as TaxRateData,
  CO: coTaxRates as TaxRateData,
  CT: ctTaxRates as TaxRateData,
  DE: deTaxRates as TaxRateData,
  DC: dcTaxRates as TaxRateData,
  FL: flTaxRates as TaxRateData,
  GA: gaTaxRates as TaxRateData,
  HI: hiTaxRates as TaxRateData,
  ID: idTaxRates as TaxRateData,
  IL: ilTaxRates as TaxRateData,
  IN: inTaxRates as TaxRateData,
  IA: iaTaxRates as TaxRateData,
  KS: ksTaxRates as TaxRateData,
  KY: kyTaxRates as TaxRateData,
  LA: laTaxRates as TaxRateData,
  ME: meTaxRates as TaxRateData,
  MD: mdTaxRates as TaxRateData,
  MA: maTaxRates as TaxRateData,
  MI: miTaxRates as TaxRateData,
  MN: mnTaxRates as TaxRateData,
  MS: msTaxRates as TaxRateData,
  MO: moTaxRates as TaxRateData,
  MT: mtTaxRates as TaxRateData,
  NE: neTaxRates as TaxRateData,
  NH: nhTaxRates as TaxRateData,
  NJ: njTaxRates as TaxRateData,
  NM: nmTaxRates as TaxRateData,
  NY: nyTaxRates as TaxRateData,
  NC: ncTaxRates as TaxRateData,
  ND: ndTaxRates as TaxRateData,
  NV: nvTaxRates as TaxRateData,
  OH: ohTaxRates as TaxRateData,
  OK: okTaxRates as TaxRateData,
  OR: orTaxRates as TaxRateData,
  PA: paTaxRates as TaxRateData,
  RI: riTaxRates as TaxRateData,
  SC: scTaxRates as TaxRateData,
  SD: sdTaxRates as TaxRateData,
  TN: tnTaxRates as TaxRateData,
  TX: txTaxRates as TaxRateData,
  UT: utTaxRates as TaxRateData,
  VT: vtTaxRates as TaxRateData,
  VA: vaTaxRates as TaxRateData,
  WA: waTaxRates as TaxRateData,
  WV: wvTaxRates as TaxRateData,
  WI: wiTaxRates as TaxRateData,
  WY: wyTaxRates as TaxRateData,
};

// ZIP prefix to state mapping (2-digit prefix → most likely state)
// Note: Some prefixes serve multiple states; this provides best-effort auto-detection.
// Users can always override with explicit state parameter.
const zipToState: Record<string, string> = {
  // 005-009: PR/VI/military (not mapped)
  '01': 'MA', '02': 'MA',
  '03': 'NH',
  '04': 'ME',
  '05': 'VT',
  '06': 'CT',
  '07': 'NJ', '08': 'NJ',
  // 09: Military APO/FPO (not mapped)
  '10': 'NY', '11': 'NY', '12': 'NY', '13': 'NY', '14': 'NY',
  '15': 'PA', '16': 'PA', '17': 'PA', '18': 'PA', '19': 'PA',
  '20': 'DC', '21': 'MD',
  '22': 'VA', '23': 'VA', '24': 'VA',
  '25': 'WV', '26': 'WV',
  '27': 'NC', '28': 'NC',
  '29': 'SC',
  '30': 'GA', '31': 'GA',
  '32': 'FL', '33': 'FL', '34': 'FL',
  '35': 'AL', '36': 'AL',
  '37': 'TN', '38': 'TN',
  '39': 'MS',
  '40': 'KY', '41': 'KY', '42': 'KY',
  '43': 'OH', '44': 'OH', '45': 'OH',
  '46': 'IN', '47': 'IN',
  '48': 'MI', '49': 'MI',
  '50': 'IA', '51': 'IA', '52': 'IA',
  '53': 'WI', '54': 'WI',
  '55': 'MN', '56': 'MN',
  '57': 'SD',
  '58': 'ND',
  '59': 'MT',
  '60': 'IL', '61': 'IL', '62': 'IL',
  '63': 'MO', '64': 'MO', '65': 'MO',
  '66': 'KS', '67': 'KS',
  '68': 'NE', '69': 'NE',
  '70': 'LA', '71': 'LA',
  '72': 'AR',
  '73': 'OK', '74': 'OK',
  '75': 'TX', '76': 'TX', '77': 'TX', '78': 'TX', '79': 'TX',
  '80': 'CO', '81': 'CO',
  '82': 'WY',
  '83': 'ID',
  '84': 'UT',
  '85': 'AZ', '86': 'AZ',
  '87': 'NM',
  '88': 'TX', // 880-884 are NM, 885+ are TX; TX is more common
  '89': 'NV',
  '90': 'CA', '91': 'CA', '92': 'CA', '93': 'CA', '94': 'CA', '95': 'CA', '96': 'CA',
  '97': 'OR',
  '98': 'WA', '99': 'WA',
};

// ZIP-level rate maps — all 51 states/territories (Avalara ZIP5, February 2026)
const zipRateData: Record<string, ZipRateMap> = {
  AK: akZipRates as ZipRateMap,
  AL: alZipRates as ZipRateMap,
  AR: arZipRates as ZipRateMap,
  AZ: azZipRates as ZipRateMap,
  CA: caZipRates as ZipRateMap,
  CO: coZipRates as ZipRateMap,
  CT: ctZipRates as ZipRateMap,
  DC: dcZipRates as ZipRateMap,
  DE: deZipRates as ZipRateMap,
  FL: flZipRates as ZipRateMap,
  GA: gaZipRates as ZipRateMap,
  HI: hiZipRates as ZipRateMap,
  IA: iaZipRates as ZipRateMap,
  ID: idZipRates as ZipRateMap,
  IL: ilZipRates as ZipRateMap,
  IN: inZipRates as ZipRateMap,
  KS: ksZipRates as ZipRateMap,
  KY: kyZipRates as ZipRateMap,
  LA: laZipRates as ZipRateMap,
  MA: maZipRates as ZipRateMap,
  MD: mdZipRates as ZipRateMap,
  ME: meZipRates as ZipRateMap,
  MI: miZipRates as ZipRateMap,
  MN: mnZipRates as ZipRateMap,
  MO: moZipRates as ZipRateMap,
  MS: msZipRates as ZipRateMap,
  MT: mtZipRates as ZipRateMap,
  NC: ncZipRates as ZipRateMap,
  ND: ndZipRates as ZipRateMap,
  NE: neZipRates as ZipRateMap,
  NH: nhZipRates as ZipRateMap,
  NJ: njZipRates as ZipRateMap,
  NM: nmZipRates as ZipRateMap,
  NV: nvZipRates as ZipRateMap,
  NY: nyZipRates as ZipRateMap,
  OH: ohZipRates as ZipRateMap,
  OK: okZipRates as ZipRateMap,
  OR: orZipRates as ZipRateMap,
  PA: paZipRates as ZipRateMap,
  PR: prZipRates as ZipRateMap,
  RI: riZipRates as ZipRateMap,
  SC: scZipRates as ZipRateMap,
  SD: sdZipRates as ZipRateMap,
  TN: tnZipRates as ZipRateMap,
  TX: txZipRates as ZipRateMap,
  UT: utZipRates as ZipRateMap,
  VA: vaZipRates as ZipRateMap,
  VT: vtZipRates as ZipRateMap,
  WA: waZipRates as ZipRateMap,
  WI: wiZipRates as ZipRateMap,
  WV: wvZipRates as ZipRateMap,
  WY: wyZipRates as ZipRateMap,
};

const ZIP_RATES_SOURCE = 'Avalara TaxRates (avalara.com/taxrates) — February 2026';
const ZIP_RATES_EFFECTIVE_DATE = '2026-02-01';

// CA-specific data (legacy city/county lookups)
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
  
  // 1. Special handling for CA (has detailed city/county jurisdiction data)
  if (state === 'CA') {
    return getCaliforniaRate(request as TaxRateRequest);
  }
  
  // 2. ZIP-level lookup (all non-CA states, Avalara ZIP5 data)
  if ('zip' in request && request.zip) {
    const zipResult = lookupByZipAllStates(state, request.zip);
    if (zipResult) return zipResult;
  }
  
  // 3. Try city lookup for other states
  if ('city' in request && request.city) {
    const cityKey = request.city.toLowerCase().trim();
    const cityJurisdiction = data.lookup.byCity[cityKey];
    if (cityJurisdiction) {
      return createSimpleResponse(cityJurisdiction, state, data);
    }
  }
  
  // 4. For other states, return base state rate
  return getStateBaseRate(state, data);
}

/**
 * Look up ZIP-level rate for any state using Avalara ZIP5 data.
 * Returns null if ZIP not found in the map.
 */
function lookupByZipAllStates(state: string, zip: string): TaxRateResponse | null {
  const zipMap = zipRateData[state];
  if (!zipMap) return null;
  
  const cleanZip = zip.trim().substring(0, 5).padStart(5, '0');
  const entry = zipMap[cleanZip] as ZipRateEntry | undefined;
  if (!entry) return null;
  
  const stateRate = entry.s ?? 0;
  const countyRate = entry.co ?? 0;
  const cityRate = entry.ci ?? 0;
  const specialRate = entry.sp ?? 0;
  const combinedRate = entry.r;
  
  const percentage = (combinedRate * 100).toFixed(4).replace(/\.?0+$/, '') + '%';
  
  return {
    rate: combinedRate,
    percentage,
    jurisdiction: entry.n,
    state,
    components: {
      state: stateRate,
      county: countyRate,
      city: cityRate,
      district: specialRate,
    },
    source: ZIP_RATES_SOURCE,
    effectiveDate: ZIP_RATES_EFFECTIVE_DATE,
    supported: true,
    lookupMethod: 'zip',
    disclaimer: DISCLAIMER,
  };
}

/**
 * Get California tax rate (legacy detailed lookup — city/county resolution)
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
    disclaimer: DISCLAIMER,
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
    disclaimer: DISCLAIMER,
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
    disclaimer: DISCLAIMER,
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
    disclaimer: DISCLAIMER,
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
  const totalZipCodes = Object.values(zipRateData).reduce(
    (sum, map) => sum + Object.keys(map).length, 0
  );
  return {
    ...caData.metadata,
    supportedStates: getStates(),
    totalStates: getStates().length,
    zipCodesLoaded: totalZipCodes,
    zipDataSource: ZIP_RATES_SOURCE,
    zipDataEffectiveDate: ZIP_RATES_EFFECTIVE_DATE,
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
 * Check if a ZIP code is in our legacy city/county mapping (CA only)
 * @param zip - 5-digit ZIP code
 * @returns ZIP entry with city and county, or null
 */
export function lookupZip(zip: string): ZipEntry | null {
  const cleanZip = zip.trim().substring(0, 5);
  return caZipMapData[cleanZip] || null;
}

/**
 * Look up the ZIP-level rate entry for any US ZIP code.
 * Uses Avalara ZIP5 data covering all 50 states + DC.
 * 
 * @param zip - 5-digit ZIP code
 * @param state - Optional 2-letter state code (auto-detected from ZIP if omitted)
 * @returns ZipRateEntry with combined and component rates, or null if not found
 */
export function lookupZipRate(zip: string, state?: string): ZipRateEntry | null {
  let resolvedState = state?.toUpperCase().trim();
  
  if (!resolvedState) {
    const prefix = zip.substring(0, 2);
    resolvedState = zipToState[prefix];
  }
  
  if (!resolvedState) return null;
  
  const zipMap = zipRateData[resolvedState];
  if (!zipMap) return null;
  
  const cleanZip = zip.trim().substring(0, 5).padStart(5, '0');
  return (zipMap[cleanZip] as ZipRateEntry) || null;
}

/**
 * Get zip rate data stats
 */
export function getZipRateStats(): { state: string; zipCount: number }[] {
  return Object.entries(zipRateData).map(([state, map]) => ({
    state,
    zipCount: Object.keys(map).length,
  })).sort((a, b) => a.state.localeCompare(b.state));
}
