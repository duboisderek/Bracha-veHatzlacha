// Minimal working server for debugging
import express from "express";
import { createServer } from "http";

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Minimal server working'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('<h1>BrachaVeHatzlacha - Minimal Server</h1><p>Server is responding correctly!</p>');
});

// Create HTTP server
const server = createServer(app);
const port = 5000;

// Start server with comprehensive logging
server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Minimal server running on http://0.0.0.0:${port}`);
  console.log(`✅ Minimal server running on http://localhost:${port}`);
  
  // Self-test
  setTimeout(async () => {
    try {
      const response = await fetch(`http://localhost:${port}/api/health`);
      const data = await response.json();
      console.log('✅ Self-test successful:', data);
    } catch (error) {
      console.log('❌ Self-test failed:', error.message);
    }
  }, 1000);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

server.on('close', () => {
  console.log('🔴 Server closed');
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close();
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close();
});