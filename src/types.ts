/**
 * Request parameters for tax rate lookup
 */
export interface TaxRateRequest {
  /** Two-letter state code (e.g., "CA", "NY") */
  state: string;
  /** City name (optional, case-insensitive) */
  city?: string;
  /** ZIP code (optional, not yet fully supported) */
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
    /** District/local tax rate */
    district: number;
  };
  /** Data source */
  source: string;
  /** Effective date of this rate */
  effectiveDate: string;
  /** Whether this state is supported */
  supported?: boolean;
  /** Reason for unsupported state */
  reason?: string;
}

/**
 * Jurisdiction data structure
 */
export interface Jurisdiction {
  location: string;
  type: 'City' | 'County' | 'Unincorporated Area';
  county: string;
  rate: number;
  ratePercent: string;
  districtTax: number;
  notes: string | null;
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
  };
}
