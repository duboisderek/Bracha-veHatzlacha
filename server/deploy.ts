import express from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic } from "./vite.js";
import session from "express-session";
import { drawScheduler } from "./scheduler.js";
import { initializeCache } from "./cache.js";
import { securityHeadersMiddleware } from "./ssl-config.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Basic security headers only
app.use(securityHeadersMiddleware);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'lottery-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Allow HTTP for Replit dev URLs
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Simple request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

(async () => {
  console.log("Starting deployment server...");
  
  // Initialize services without blocking
  initializeCache().catch(err => console.log("Cache warning:", err.message));
  
  // Register routes
  const server = await registerRoutes(app);
  
  // In development, use Vite
  if (process.env.NODE_ENV !== 'production') {
    await setupVite(app, server);
  } else {
    // In production, serve static files
    serveStatic(app);
  }

  const port = process.env.PORT || 5000;
  
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
    console.log(`Ready for deployment!`);
  });
})();