import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes.js";
import session from "express-session";
import { drawScheduler } from "./scheduler.js";
import { initializeCache } from "./cache.js";
import { securityHeadersMiddleware, rateLimitingMiddleware } from "./ssl-config.js";
import { backupService } from "./backup-service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for Replit
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeadersMiddleware);
app.use(rateLimitingMiddleware);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'lottery-secret-key-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'strict'
  },
  name: 'bvh.sid',
  proxy: true
}));

(async () => {
  console.log("Starting production server...");
  
  // Initialize services
  initializeCache().catch(err => console.log("Cache init warning:", err.message));
  backupService.scheduleBackups().catch(err => console.log("Backup init warning:", err.message));
  
  // Register API routes
  const server = await registerRoutes(app);
  
  // Serve static files from the built frontend
  const publicPath = path.join(__dirname, '../dist/public');
  app.use(express.static(publicPath));
  
  // Catch-all route for SPA
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(publicPath, 'index.html'));
  });

  const port = process.env.PORT || 5000;
  
  server.listen(port, "0.0.0.0", () => {
    console.log(`Production server running on port ${port}`);
  });
})();