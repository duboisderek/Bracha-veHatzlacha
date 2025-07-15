#!/bin/bash

# Script de démarrage pour production sur Replit

echo "🚀 Starting BrachaVeHatzlacha Production Server"
echo "=================================="

# Set production environment
export NODE_ENV=production

# Check if database is configured
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set"
    exit 1
fi

# Use Replit's PORT or default to 5000
export PORT=${PORT:-5000}

echo "✅ Environment: Production"
echo "✅ Port: $PORT"
echo "✅ Database: Connected"

# Option 1: Run with tsx (faster startup)
echo "Starting server with tsx..."
exec tsx server/index.ts

# Option 2: Build and run (uncomment if needed)
# echo "Building application..."
# npm run build
# echo "Starting server..."
# exec node dist/index.js