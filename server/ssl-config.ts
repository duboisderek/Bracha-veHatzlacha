// SSL/TLS Configuration and Security Enhancements
import { type Request, type Response, type NextFunction } from "express";

export interface SSLConfig {
  forceHTTPS: boolean;
  hsts: {
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  securityHeaders: boolean;
  contentSecurityPolicy: string;
}

export const sslConfig: SSLConfig = {
  forceHTTPS: process.env.NODE_ENV === 'production',
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  securityHeaders: true,
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.whatsapp.com https://web.whatsapp.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https: wss: ws: https://api.whatsapp.com",
    "media-src 'self' https:",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
};

export function httpsRedirectMiddleware(req: Request, res: Response, next: NextFunction) {
  if (sslConfig.forceHTTPS && req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.header('host')}${req.url}`);
  }
  next();
}

export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // HSTS Header
  if (sslConfig.forceHTTPS) {
    const hstsValue = `max-age=${sslConfig.hsts.maxAge}` +
      (sslConfig.hsts.includeSubDomains ? '; includeSubDomains' : '') +
      (sslConfig.hsts.preload ? '; preload' : '');
    res.setHeader('Strict-Transport-Security', hstsValue);
  }

  if (sslConfig.securityHeaders) {
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', sslConfig.contentSecurityPolicy);
    
    // Permissions Policy (formerly Feature-Policy)
    res.setHeader('Permissions-Policy', [
      'camera=()', 
      'microphone=()', 
      'geolocation=()',
      'interest-cohort=()'
    ].join(', '));
    
    // Remove server identification
    res.removeHeader('X-Powered-By');
    
    // DNS Prefetch Control
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    
    // Download Options for IE
    res.setHeader('X-Download-Options', 'noopen');
  }
  
  next();
}

export function rateLimitingMiddleware() {
  const attempts = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting in development for static assets and API
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 1000; // Increased for development, 100 for production
    
    // Clean expired entries
    for (const [key, value] of attempts.entries()) {
      if (now > value.resetTime) {
        attempts.delete(key);
      }
    }
    
    const current = attempts.get(ip);
    if (!current) {
      attempts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (now > current.resetTime) {
      attempts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    current.count++;
    
    if (current.count > maxAttempts) {
      return res.status(429).json({
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      });
    }
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxAttempts);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxAttempts - current.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000));
    
    next();
  };
}

export function sslHealthCheck(req: Request, res: Response) {
  const sslStatus = {
    ssl: {
      enabled: sslConfig.forceHTTPS,
      hsts: sslConfig.hsts,
      headers: sslConfig.securityHeaders
    },
    security: {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      headers: {
        'strict-transport-security': res.getHeader('Strict-Transport-Security'),
        'content-security-policy': res.getHeader('Content-Security-Policy'),
        'x-frame-options': res.getHeader('X-Frame-Options')
      }
    }
  };
  
  res.json(sslStatus);
}

export default {
  sslConfig,
  httpsRedirectMiddleware,
  securityHeadersMiddleware,
  rateLimitingMiddleware,
  sslHealthCheck
};