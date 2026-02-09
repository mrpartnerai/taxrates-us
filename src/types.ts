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
 * ZIP code to city/county mapping
 */
export interface ZipEntry {
  city: string;
  county: string;
}

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
