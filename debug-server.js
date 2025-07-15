// Quick debug server to test basic functionality
import express from 'express';
import { createServer } from 'http';

const app = express();

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('<h1>Debug Server Running</h1><p>Server is working!</p>');
});

const server = createServer(app);
const port = 5000;

server.listen(port, '0.0.0.0', () => {
  console.log(`Debug server running on http://0.0.0.0:${port}`);
  console.log(`Debug server running on http://localhost:${port}`);
});

server.on('error', (err) => {
  console.error('Debug server error:', err);
});