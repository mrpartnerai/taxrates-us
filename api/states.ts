/**
 * Supported states endpoint
 * GET /api/states
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStates } from '../dist/index.js';

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
