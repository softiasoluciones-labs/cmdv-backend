import helmet from 'helmet';

/**
 * Helmet middleware for security headers
 * Protects against common web vulnerabilities
 */
export const helmetMiddleware = helmet({
    // Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },

    // X-Frame-Options: Prevent clickjacking
    frameguard: {
        action: 'deny'
    },

    // X-Content-Type-Options: Prevent MIME sniffing
    noSniff: true,

    // Strict-Transport-Security: Force HTTPS
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },

    // X-DNS-Prefetch-Control
    dnsPrefetchControl: {
        allow: false
    },

    // Remove X-Powered-By header
    hidePoweredBy: true,

    // Referrer-Policy
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
    }
});
