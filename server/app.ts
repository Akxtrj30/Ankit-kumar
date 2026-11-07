import express from 'express';
import cookieParser from 'cookie-parser';
import { apiRouter } from './routes';

export const app = express();

app.set('trust proxy', 1);

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

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API router at both /api and root / for Vercel serverless flexibility
app.use('/api', apiRouter);
app.use(apiRouter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'HEALTH_OK', timestamp: new Date() });
});
