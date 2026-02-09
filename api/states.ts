/**
 * Supported states endpoint
 * GET /api/states
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStates } from '../dist/index.js';
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
  
  try {
    const states = getStates();
    
    return res.status(200).json({
      states,
      count: states.length,
    });
  } catch (error) {
    console.error('Error in /api/states:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while fetching supported states',
    });
  }
}
