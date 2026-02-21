#!/usr/bin/env node
/**
 * Generate state tax rate JSON files for all 50 states + DC
 * 
 * Rates sourced from Sales Tax Institute (as of 2/1/2026)
 * https://www.salestaxinstitute.com/resources/rates
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'src', 'data');

// All state data: [code, name, rate, source, notes]
const states = [
  ['AL', 'Alabama', 0.04, 'Alabama Department of Revenue', 'State base rate. Local jurisdictions may add up to 9% additional tax.'],
  ['AK', 'Alaska', 0, 'Alaska Department of Revenue', 'No state sales tax. Some local jurisdictions impose local sales taxes up to 9.5%.'],
  ['AZ', 'Arizona', 0.056, 'Arizona Department of Revenue', 'State Transaction Privilege Tax (TPT) base rate. Local jurisdictions may add additional tax.'],
  ['AR', 'Arkansas', 0.065, 'Arkansas Department of Finance and Administration', 'State base rate. Local jurisdictions may add up to 6.125% additional tax.'],
  ['CO', 'Colorado', 0.029, 'Colorado Department of Revenue', 'State base rate. Local jurisdictions may add up to 8.3% additional tax.'],
  ['CT', 'Connecticut', 0.0635, 'Connecticut Department of Revenue Services', 'State rate. Reduced rates apply to certain items. Limited local tax authority.'],
  ['DE', 'Delaware', 0, 'Delaware Division of Revenue', 'No sales tax. Delaware imposes a gross receipts tax on businesses instead.'],
  ['DC', 'District of Columbia', 0.06, 'DC Office of Tax and Revenue', 'Standard sales tax rate. No additional local rates.'],
  ['GA', 'Georgia', 0.04, 'Georgia Department of Revenue', 'State base rate. Local jurisdictions add 1% to 5% additional tax.'],
  ['HI', 'Hawaii', 0.04, 'Hawaii Department of Taxation', 'General Excise Tax (GET) rate. County surcharges may add up to 0.5%.'],
  ['ID', 'Idaho', 0.06, 'Idaho State Tax Commission', 'State base rate. Local jurisdictions may add up to 3% additional tax.'],
  ['IL', 'Illinois', 0.0625, 'Illinois Department of Revenue', 'State base rate. Local jurisdictions may add up to 5.75% additional tax.'],
  ['IN', 'Indiana', 0.07, 'Indiana Department of Revenue', 'State rate. No additional local sales taxes.'],
  ['IA', 'Iowa', 0.06, 'Iowa Department of Revenue', 'State base rate. Local option sales tax of up to 2% may apply.'],
  ['KS', 'Kansas', 0.065, 'Kansas Department of Revenue', 'State base rate. Local jurisdictions may add up to 5.625% additional tax.'],
  ['KY', 'Kentucky', 0.06, 'Kentucky Department of Revenue', 'State rate. No additional local sales taxes.'],
  ['LA', 'Louisiana', 0.05, 'Louisiana Department of Revenue', 'State base rate. Local jurisdictions may add up to 8.5% additional tax.'],
  ['ME', 'Maine', 0.055, 'Maine Revenue Services', 'State rate. No additional local sales taxes.'],
  ['MD', 'Maryland', 0.06, 'Maryland Comptroller of the Treasury', 'State rate. No additional local sales taxes.'],
  ['MA', 'Massachusetts', 0.0625, 'Massachusetts Department of Revenue', 'State rate. No additional local sales taxes.'],
  ['MI', 'Michigan', 0.06, 'Michigan Department of Treasury', 'State rate. No additional local sales taxes.'],
  ['MN', 'Minnesota', 0.06875, 'Minnesota Department of Revenue', 'State base rate. Local jurisdictions may add up to 3% additional tax.'],
  ['MS', 'Mississippi', 0.07, 'Mississippi Department of Revenue', 'State base rate. Local jurisdictions may add up to 1% additional tax.'],
  ['MO', 'Missouri', 0.04225, 'Missouri Department of Revenue', 'State base rate. Local jurisdictions may add up to 8.013% additional tax.'],
  ['MT', 'Montana', 0, 'Montana Department of Revenue', 'No sales tax. Montana has no state or local general sales tax.'],
  ['NE', 'Nebraska', 0.055, 'Nebraska Department of Revenue', 'State base rate. Local jurisdictions may add up to 7% additional tax.'],
  ['NH', 'New Hampshire', 0, 'New Hampshire Department of Revenue Administration', 'No sales tax. New Hampshire has no state or local general sales tax.'],
  ['NJ', 'New Jersey', 0.06625, 'New Jersey Division of Taxation', 'State rate. Urban Enterprise Zones have reduced rate of 3.3125%. No other local taxes.'],
  ['NM', 'New Mexico', 0.04875, 'New Mexico Taxation and Revenue Department', 'Gross Receipts Tax state rate. Local jurisdictions may add up to 7.75% additional tax.'],
  ['NC', 'North Carolina', 0.0475, 'North Carolina Department of Revenue', 'State base rate. Local jurisdictions add 2% to 4.25% additional tax.'],
  ['ND', 'North Dakota', 0.05, 'North Dakota Office of State Tax Commissioner', 'State base rate. Local jurisdictions may add up to 3.5% additional tax.'],
  ['OH', 'Ohio', 0.0575, 'Ohio Department of Taxation', 'State base rate. County sales taxes add 0% to 2.5% additional tax.'],
  ['OK', 'Oklahoma', 0.045, 'Oklahoma Tax Commission', 'State base rate. Local jurisdictions may add up to 7% additional tax.'],
  ['PA', 'Pennsylvania', 0.06, 'Pennsylvania Department of Revenue', 'State base rate. Local jurisdictions may add up to 2% additional tax (Philadelphia 2%, Allegheny County 1%).'],
  ['RI', 'Rhode Island', 0.07, 'Rhode Island Division of Taxation', 'State rate. No additional local sales taxes.'],
  ['SC', 'South Carolina', 0.06, 'South Carolina Department of Revenue', 'State base rate. Local jurisdictions may add up to 3% additional tax.'],
  ['SD', 'South Dakota', 0.042, 'South Dakota Department of Revenue', 'State base rate. Local jurisdictions may add additional tax. Rate reduced from 4.5% effective 2023, set to sunset in 2027.'],
  ['TN', 'Tennessee', 0.07, 'Tennessee Department of Revenue', 'State base rate. Local jurisdictions add 1.5% to 2.75% additional tax.'],
  ['UT', 'Utah', 0.0485, 'Utah State Tax Commission', 'State base rate. Local jurisdictions add 1% to 7.5% additional tax.'],
  ['VT', 'Vermont', 0.06, 'Vermont Department of Taxes', 'State base rate. Local jurisdictions may add up to 1% additional tax.'],
  ['VA', 'Virginia', 0.043, 'Virginia Department of Taxation', 'State base rate (4.3% state general + local minimum). Local jurisdictions add 1% to 2.7% additional tax.'],
  ['WV', 'West Virginia', 0.06, 'West Virginia State Tax Department', 'State base rate. Local jurisdictions may add up to 1% additional tax.'],
  ['WI', 'Wisconsin', 0.05, 'Wisconsin Department of Revenue', 'State base rate. Local jurisdictions may add up to 1.75% additional tax.'],
  ['WY', 'Wyoming', 0.04, 'Wyoming Department of Revenue', 'State base rate. Local jurisdictions may add up to 4% additional tax.'],
];

// Skip states we already have
const existing = ['CA', 'TX', 'NY', 'FL', 'WA', 'NV', 'OR'];

for (const [code, name, rate, source, notes] of states) {
  if (existing.includes(code)) continue;

  const ratePercent = rate === 0 ? '0.00%' : (rate * 100).toFixed(rate * 100 % 1 === 0 ? 2 : 3).replace(/0+$/, '').replace(/\.$/, '.00') + '%';
  
  // Format rate percent properly - strip trailing zeros but keep at least 2 decimal places
  const pct = Math.round(rate * 100000) / 1000; // e.g. 6.35, 6.875, 4.225
  let ratePercentStr;
  // Check how many decimal places needed
  const str = pct.toString();
  const decimals = str.includes('.') ? str.split('.')[1].length : 0;
  ratePercentStr = pct.toFixed(Math.max(2, decimals)) + '%';

  const stateLower = name.toLowerCase();
  
  const data = {
    metadata: {
      effectiveDate: '2026-01-01',
      source: source,
      lastUpdated: '2026-02-10',
      jurisdictionCount: 1,
      version: '0.4.0',
    },
    jurisdictions: [
      {
        location: name,
        type: 'State',
        county: 'State',
        rate: rate,
        ratePercent: ratePercentStr,
        districtTax: 0,
        notes: notes,
      },
    ],
    lookup: {
      byCity: {},
      byCounty: {},
      byState: {
        [stateLower]: {
          location: name,
          type: 'State',
          county: 'State',
          rate: rate,
          ratePercent: ratePercentStr,
          districtTax: 0,
          notes: notes,
        },
      },
    },
  };

  const filename = `${code.toLowerCase()}-tax-rates.json`;
  const filepath = path.join(dataDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n');
  console.log(`Generated ${filename} - ${name}: ${ratePercentStr}`);
}

console.log(`\nDone! Generated ${states.filter(s => !existing.includes(s[0])).length} state files.`);
