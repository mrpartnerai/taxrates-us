/**
 * Simple in-memory rate limiter for Vercel serverless functions
 * 
 * Limits:
 * - 10 requests per minute per IP
 * - 100 requests per hour per IP
 * 
 * Note: This is a simple implementation. For production at scale, consider:
 * - Redis-based rate limiting (Upstash)
 * - Vercel Edge Config
 * - API key-based limits with database storage
 */

interface RateLimitEntry {
  minute: number;
  hour: number;
  minuteStart: number;
  hourStart: number;
}

// In-memory store (resets on cold starts, which is acceptable for MVP)
const limitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of limitStore.entries()) {
    // Remove entries older than 1 hour
    if (now - entry.hourStart > 60 * 60 * 1000) {
      limitStore.delete(ip);
    }
  }
}, 10 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const minuteWindow = 60 * 1000; // 1 minute
  const hourWindow = 60 * 60 * 1000; // 1 hour
  
  const entry = limitStore.get(ip) || {
    minute: 0,
    hour: 0,
    minuteStart: now,
    hourStart: now,
  };
  
  // Reset minute counter if window expired
  if (now - entry.minuteStart > minuteWindow) {
    entry.minute = 0;
    entry.minuteStart = now;
  }
  
  // Reset hour counter if window expired
  if (now - entry.hourStart > hourWindow) {
    entry.hour = 0;
    entry.hourStart = now;
  }
  
  // Check limits
  const minuteLimit = 10;
  const hourLimit = 100;
  
  if (entry.minute >= minuteLimit) {
    const reset = entry.minuteStart + minuteWindow;
    return {
      allowed: false,
      limit: minuteLimit,
      remaining: 0,
      reset: Math.ceil(reset / 1000),
    };
  }
  
  if (entry.hour >= hourLimit) {
    const reset = entry.hourStart + hourWindow;
    return {
      allowed: false,
      limit: hourLimit,
      remaining: 0,
      reset: Math.ceil(reset / 1000),
    };
  }
  
  // Increment counters
  entry.minute++;
  entry.hour++;
  limitStore.set(ip, entry);
  
  // Return success with remaining counts
  const minuteRemaining = minuteLimit - entry.minute;
  const hourRemaining = hourLimit - entry.hour;
  const remaining = Math.min(minuteRemaining, hourRemaining);
  
  return {
    allowed: true,
    limit: minuteLimit,
    remaining,
    reset: Math.ceil((entry.minuteStart + minuteWindow) / 1000),
  };
}

export function getRateLimitHeaders(result: RateLimitResult) {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  };
}
