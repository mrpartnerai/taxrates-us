/**
 * API health check endpoint
 * GET /api
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  return res.status(200).json({
    service: 'taxrates-us API',
    version: '0.3.0',
    endpoints: {
      rate: '/api/rate?zip=90210',
      states: '/api/states',
      health: '/api',
    },
    documentation: 'https://github.com/mrpartnerai/taxrates-us',
  });
}
