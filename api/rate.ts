/**
 * Tax rate lookup endpoint
 * GET /api/rate?zip=90210
 * GET /api/rate?zip=90210&state=CA
 * GET /api/rate?state=TX
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTaxRate } from '../dist/index.js';
import { checkRateLimit, getRateLimitHeaders } from './lib/rateLimit.js';

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
  
  // Rate limiting
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
             req.headers['x-real-ip'] as string || 
             'unknown';
  
  const rateLimit = checkRateLimit(ip);
  const rateLimitHeaders = getRateLimitHeaders(rateLimit);
  
  // Set rate limit headers
  Object.entries(rateLimitHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: rateLimit.reset - Math.floor(Date.now() / 1000),
    });
  }
  
  const { zip, state, city, county } = req.query;
  
  // Validate input
  if (!zip && !state) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Either "zip" or "state" parameter is required',
      example: '/api/rate?zip=90210',
    });
  }
  
  try {
    // Build request object
    const request: any = {};
    
    if (zip) request.zip = String(zip);
    if (state) request.state = String(state);
    if (city) request.city = String(city);
    if (county) request.county = String(county);
    
    // Get tax rate
    const result = getTaxRate(request);
    
    // Return success response
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in /api/rate:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while looking up the tax rate',
    });
  }
}
