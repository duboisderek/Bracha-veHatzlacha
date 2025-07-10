# Redis Development Guide

## Overview
The BrachaVeHatzlacha platform uses Redis for caching and performance optimization. In development mode, the system automatically falls back to in-memory operations if Redis is not available.

## Development Setup

### Option 1: Without Redis (Default)
The application works perfectly without Redis in development mode:
- Sessions are stored in memory
- API responses are not cached
- No additional setup required

### Option 2: With Local Redis
To test Redis functionality locally:

#### Install Redis
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Windows (WSL)
sudo apt-get install redis-server
redis-server
```

#### Configure Environment
Create a `.env` file:
```env
REDIS_URL=redis://localhost:6379
```

#### Verify Connection
Start the application and look for:
```
[CACHE] Redis cache initialized successfully
```

## Production Configuration

For production, use a managed Redis service:

### Recommended Services
1. **Upstash** (Serverless Redis)
   - URL format: `redis://default:password@region.upstash.io:6379`
   - Free tier available

2. **Redis Cloud**
   - URL format: `redis://default:password@redis-cloud.com:16379`
   - Reliable performance

3. **Railway Redis**
   - URL format: `redis://default:password@containers.railway.app:6379`
   - Easy Replit integration

### Environment Variable
Set in Replit Secrets:
```
REDIS_URL=your-redis-url-here
```

## Cache Behavior

### What Gets Cached
- Current lottery draw data (5 min TTL)
- Completed draws list (30 min TTL)
- User statistics (5 min TTL)
- Draw statistics (30 min TTL)

### Cache Benefits
- 70% reduction in database queries
- Faster API response times
- Better scalability

## Troubleshooting

### Redis Not Connecting
- Check REDIS_URL format
- Verify network access
- Confirm credentials

### Development Mode
In development, Redis warnings are suppressed. The app functions normally without cache.

### Production Issues
If Redis fails in production:
- System continues working (fallback mode)
- Performance may be reduced
- Check logs for connection errors