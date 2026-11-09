import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from './server/app';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  // Serve static files from public folder (photos, logos, uploaded assets)
  const publicDir = path.resolve(__dirname, 'public');
  app.use(express.static(publicDir));

  if (!isProd) {
    // Development mode: Mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve dist folder
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Anika Homeopathy Server] Running on http://localhost:${PORT} [Mode: ${isProd ? 'production' : 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('[Server Startup Failure]:', err);
  process.exit(1);
});
