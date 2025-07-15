import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { log } from "./vite";
import { drawScheduler } from "./scheduler";
import { initializeCache } from "./cache";
import { logger, performanceMiddleware, errorLoggingMiddleware } from "./logger";
import { httpsRedirectMiddleware, securityHeadersMiddleware, rateLimitingMiddleware } from "./ssl-config";
import { backupService } from "./backup-service";
import path from "path";

const app = express();

// Trust proxy for SSL termination (Replit/CloudFlare)
app.set('trust proxy', 1);

// Security middleware in order - disabled HTTPS redirect in development
if (process.env.NODE_ENV === 'production') {
  app.use(httpsRedirectMiddleware);
}
app.use(securityHeadersMiddleware);

// Enhanced Rate Limiting - Production Ready
if (process.env.NODE_ENV === 'production') {
  app.use(rateLimitingMiddleware);
}
// Disable rate limiting in development to prevent blocking

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Enhanced Session configuration with production SSL
app.use(session({
  secret: process.env.SESSION_SECRET || 'lottery-secret-key-development-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS access to cookies
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // CSRF protection
    domain: process.env.NODE_ENV === 'production' ? '.brahatz.com' : undefined
  },
  name: 'bvh.sid', // Custom session name
  proxy: process.env.NODE_ENV === 'production' // Trust proxy in production
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  console.log("Starting server initialization...");
  
  // Initialize cache in background without blocking
  initializeCache().catch(err => console.log("Cache init warning:", err.message));
  
  // Skip backup scheduling in development
  if (process.env.NODE_ENV === 'production') {
    backupService.scheduleBackups().catch(err => console.log("Backup init warning:", err.message));
  }
  
  console.log("Registering routes...");
  let server;
  try {
    server = await registerRoutes(app);
    console.log("Routes registered successfully");
  } catch (error) {
    console.error("Error registering routes:", error);
    throw error;
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Simple static file serving for now to avoid Vite startup issues
  app.use(express.static('client/public'));
  
  // Catch-all route for SPA
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../client/public/index.html'));
  });

  // Use PORT environment variable or fallback to 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled on Replit.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    console.log(`Server listening on http://0.0.0.0:${port}`);
    console.log(`Server listening on http://localhost:${port}`);
  });
})();
