/**
 * Landing page password protection middleware
 * 
 * Protects the entire landing page with HTTP Basic Authentication
 * Password is configured via LANDING_PASSWORD environment variable
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get password from environment variable
  const protectedPassword = process.env.LANDING_PASSWORD;
  
  // If no password is set, allow access (fail-open for development)
  if (!protectedPassword) {
    console.warn('LANDING_PASSWORD not set - site is unprotected!');
    return NextResponse.next();
  }
  
  // Check for authorization header
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Protected Area"',
      },
    });
  }
  
  // Parse Basic auth credentials
  const [scheme, encoded] = authHeader.split(' ');
  
  if (scheme !== 'Basic') {
    return new NextResponse('Invalid authentication scheme', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Protected Area"',
      },
    });
  }
  
  // Decode credentials
  const credentials = Buffer.from(encoded, 'base64').toString();
  const [username, password] = credentials.split(':');
  
  // Verify password (username is ignored)
  if (password !== protectedPassword) {
    return new NextResponse('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Protected Area"',
      },
    });
  }
  
  // Authentication successful
  return NextResponse.next();
}

// Apply to all routes
export const config = {
  matcher: '/:path*',
};
