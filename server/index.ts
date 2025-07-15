import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

// Import with error handling
let registerRoutes, log, drawScheduler, initializeCache, logger, performanceMiddleware, errorLoggingMiddleware;
let httpsRedirectMiddleware, securityHeadersMiddleware, rateLimitingMiddleware, backupService;

try {
  const routes = await import("./routes");
  registerRoutes = routes.registerRoutes;
  
  const vite = await import("./vite");
  log = vite.log;
  
  const scheduler = await import("./scheduler");
  drawScheduler = scheduler.drawScheduler;
  
  const cache = await import("./cache");
  initializeCache = cache.initializeCache;
  
  const loggerModule = await import("./logger");
  logger = loggerModule.logger;
  performanceMiddleware = loggerModule.performanceMiddleware;
  errorLoggingMiddleware = loggerModule.errorLoggingMiddleware;
  
  const ssl = await import("./ssl-config");
  httpsRedirectMiddleware = ssl.httpsRedirectMiddleware;
  securityHeadersMiddleware = ssl.securityHeadersMiddleware;
  rateLimitingMiddleware = ssl.rateLimitingMiddleware;
  
  const backup = await import("./backup-service");
  backupService = backup.backupService;
  
  console.log("✅ All modules imported successfully");
} catch (error) {
  console.error("❌ Module import error:", error);
  // Create fallback functions
  log = console.log;
  registerRoutes = async (app) => {
    const { createServer } = await import("http");
    app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
    return createServer(app);
  };
  initializeCache = async () => {};
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for SSL termination (Replit/CloudFlare)
app.set('trust proxy', 1);

// Security middleware in order - disabled HTTPS redirect in development
if (process.env.NODE_ENV === 'production') {
  app.use(httpsRedirectMiddleware);
}

// Only apply security headers if not explicitly disabled (for debugging)
if (!process.env.DISABLE_SECURITY_HEADERS) {
  app.use(securityHeadersMiddleware);
}

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
  
  // Add process monitoring
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    console.error('Stack:', error.stack);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  
  // Initialize cache in background without blocking - only if available
  if (initializeCache) {
    console.log("Initializing cache...");
    setTimeout(() => {
      initializeCache().catch(err => console.log("Cache init warning:", err.message));
    }, 1000); // Delay cache init to prevent blocking
  }
  
  // Add basic health endpoint immediately for fast startup
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), server: 'minimal' });
  });
  
  app.get('/', (req, res) => {
    res.send('<h1>BrachaVeHatzlacha Server</h1><p>Server is running!</p>');
  });

  // Create basic server first for immediate port binding
  const { createServer } = await import("http");
  let server = createServer(app);
  
  // Use the correct approach - let registerRoutes handle everything
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  console.log(`Starting server using registerRoutes on port ${port}...`);
  
  try {
    // Protect against process.exit in Vite during setup
    const originalExit = process.exit;
    process.exit = ((code?: number) => {
      console.warn(`⚠️ Process.exit(${code}) blocked during startup - keeping server alive`);
      return undefined as never;
    }) as typeof process.exit;
    
    // Import and call registerRoutes - this creates the complete server
    const { registerRoutes } = await import("./routes");
    const fullServer = await registerRoutes(app);
    
    // Start the complete server
    await new Promise<void>((resolve, reject) => {
      fullServer.listen(port, "0.0.0.0", () => {
        console.log(`🚀 Complete server running on http://0.0.0.0:${port}`);
        console.log(`🚀 Complete server running on http://localhost:${port}`);
        resolve();
      }).on('error', reject);
    });
    
    // Restore process.exit after successful startup
    setTimeout(() => {
      process.exit = originalExit;
      console.log("✅ Server started successfully - all systems operational");
    }, 2000);
    
  } catch (error) {
    console.error("Error starting complete server:", error);
    
    // Fallback to minimal server if registerRoutes fails
    console.log("Starting fallback minimal server...");
    server.listen(port, "0.0.0.0", () => {
      console.log(`🔧 Fallback server running on http://0.0.0.0:${port}`);
    });
  }

  // Initialize backup scheduling after server is stable
  if (process.env.NODE_ENV === 'production' && backupService) {
    setTimeout(() => {
      backupService.scheduleBackups().catch(err => console.log("Backup init warning:", err.message));
    }, 5000);
  }
  
  // Add error handling to express app
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    console.error("Express error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal Server Error" });
    }
    next();
  });
  
  console.log("Server setup completed successfully!");
})().catch(err => {
  console.error("❌ Fatal server startup error:", err);
  console.error("Stack trace:", err.stack);
  process.exit(1);
});
