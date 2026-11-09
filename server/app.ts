import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { apiRouter } from './routes';

export const app = express();

// Disable x-powered-by header for obscurity
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Allowed for embedded preview & dynamic assets
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// Global API Rate Limiter (200 requests per 15 mins per IP)
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP address. Please try again after 15 minutes.' },
});

// Strict Login Rate Limiter (15 attempts per 15 mins per IP)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many failed login attempts. Please wait 15 minutes before trying again.' },
});

// Appointment Queue Rate Limiter (10 requests per 15 mins per IP)
const appointmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Rate limit exceeded for consultation requests. Please try again later.' },
});

// Ensure upload directory exists and serve uploaded assets statically
const publicDir = path.resolve(process.cwd(), 'public');
const UPLOAD_DIR = path.resolve(publicDir, 'assets', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  try { fs.mkdirSync(UPLOAD_DIR, { recursive: true }); } catch {}
}
app.use(express.static(publicDir));
app.use('/assets/uploads', express.static(UPLOAD_DIR));

// CORS middleware for cross-device, cross-network, GitHub, and Vercel deployments
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Token');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-XSS-Protection', '1; mode=block');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Recursive Input Sanitization Middleware against XSS Injection
function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    return value
      .replace(/<script\b[^<]*>(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*(["']).*?\1/gi, '')
      .replace(/javascript\s*:/gi, '')
      .trim();
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, any> = {};
    for (const k of Object.keys(value)) {
      sanitized[k] = sanitizeValue(value[k]);
    }
    return sanitized;
  }
  return value;
}

app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  next();
});

// Apply Rate Limiters
app.use('/api', globalApiLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/public/appointments', appointmentLimiter);

// Mount API router strictly under /api so frontend routes like /admin and /admin/login are served by Vite/SPA
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'HEALTH_OK', timestamp: new Date() });
});

// Production Centralized Error Handler (Prevents stack trace leaks)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Internal Error]:', err.message || err);
  const status = typeof err.status === 'number' ? err.status : 500;
  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'An internal server error occurred.' : (err.message || 'Server error'),
  });
});
