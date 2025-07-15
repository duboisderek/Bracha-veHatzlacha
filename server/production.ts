// Production server configuration for Replit deployment
import './index.js';

// Ensure production mode
process.env.NODE_ENV = 'production';

console.log('🚀 BrachaVeHatzlacha Production Server');
console.log('=====================================');
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Port: ${process.env.PORT || 5000}`);
console.log(`Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});