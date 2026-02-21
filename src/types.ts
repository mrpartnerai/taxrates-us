/**
 * taxrates-us type definitions
 */

/**
 * Request parameters for tax rate lookup
 */
export interface TaxRateRequest {
  /** Two-letter state code (e.g., "CA", "NY") */
  state: string;
  /** City name (optional, case-insensitive) */
  city?: string;
  /** County name (optional, case-insensitive) */
  county?: string;
  /** ZIP code (optional, 5-digit) */
  zip?: string;
}

/**
 * Tax rate response
 */
export interface TaxRateResponse {
  /** Tax rate as decimal (e.g., 0.0875 = 8.75%) */
  rate: number;
  /** Tax rate as formatted percentage string */
  percentage: string;
  /** Jurisdiction name */
  jurisdiction: string;
  /** State code */
  state: string;
  /** Tax rate components breakdown */
  components: {
    /** State base tax rate */
    state: number;
    /** County base rate (portion of state rate allocated to county) */
    county: number;
    /** City-specific district tax */
    city: number;
    /** Special district taxes (transit, etc.) */
    district: number;
  };
  /** Data source */
  source: string;
  /** Effective date of this rate */
  effectiveDate: string;
  /** Whether this state is supported */
  supported: boolean;
  /** Reason for unsupported state */
  reason?: string;
  /** Lookup method used */
  lookupMethod?: 'city' | 'county' | 'zip' | 'state-default';
  /** County the jurisdiction is in (for city lookups) */
  county?: string;
  /** Legal disclaimer */
  disclaimer: string;
}

/**
 * Jurisdiction data structure
 */
export interface Jurisdiction {
  location: string;
  type: 'City' | 'County' | 'Unincorporated Area' | 'State';
  county: string;
  rate: number;
  ratePercent: string;
  districtTax: number;
  notes: string | null;
}

/**
 * ZIP code to city/county mapping (legacy CA-only format)
 */
export interface ZipEntry {
  city: string;
  county: string;
}

/**
 * ZIP-level tax rate entry (Avalara ZIP5 data — all 50 states)
 * Keys are compact to minimize bundle size.
 */
export interface ZipRateEntry {
  /** Combined estimated rate (e.g. 0.095 = 9.5%) */
  r: number;
  /** Tax region name (e.g. "JACKSONVILLE") */
  n: string;
  /** State rate component */
  s?: number;
  /** County rate component */
  co?: number;
  /** City rate component */
  ci?: number;
  /** Special district rate component */
  sp?: number;
  /** Risk level (0 = standard; higher = more complex) */
  risk?: number;
}

/**
 * ZIP rate map — one per state file in src/data/zip-rates/
 * Maps 5-digit ZIP code → ZipRateEntry
 */
export type ZipRateMap = Record<string, ZipRateEntry>;

/**
 * Complete tax rate data structure
 */
export interface TaxRateData {
  metadata: {
    effectiveDate: string;
    source: string;
    lastUpdated: string;
    jurisdictionCount: number;
    version: string;
  };
  jurisdictions: Jurisdiction[];
  lookup: {
    byCity: Record<string, Jurisdiction>;
    byCounty: Record<string, Jurisdiction>;
    byState?: Record<string, Jurisdiction>;
  };
}
