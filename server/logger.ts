// Structured Logging System for Performance Monitoring
// Provides comprehensive application monitoring and debugging capabilities

import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  metadata?: Record<string, any>;
  duration?: number;
  userId?: string;
  requestId?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private logStreams: Map<string, NodeJS.WriteStream> = new Map();
  private logDir: string;

  private constructor() {
    this.logLevel = process.env.LOG_LEVEL 
      ? parseInt(process.env.LOG_LEVEL) 
      : LogLevel.INFO;
    this.logDir = join(process.cwd(), 'logs');
    this.initializeLogDir();
    this.initializeStreams();
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private initializeLogDir(): void {
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }
  }

  private initializeStreams(): void {
    const today = new Date().toISOString().split('T')[0];
    
    // Application logs
    this.logStreams.set('app', createWriteStream(
      join(this.logDir, `app-${today}.log`), 
      { flags: 'a' }
    ));
    
    // Error logs
    this.logStreams.set('error', createWriteStream(
      join(this.logDir, `error-${today}.log`), 
      { flags: 'a' }
    ));
    
    // Performance logs
    this.logStreams.set('performance', createWriteStream(
      join(this.logDir, `performance-${today}.log`), 
      { flags: 'a' }
    ));
    
    // Security logs
    this.logStreams.set('security', createWriteStream(
      join(this.logDir, `security-${today}.log`), 
      { flags: 'a' }
    ));
  }

  private formatLogEntry(entry: LogEntry): string {
    return JSON.stringify(entry) + '\n';
  }

  private writeToStream(streamName: string, entry: LogEntry): void {
    const stream = this.logStreams.get(streamName);
    if (stream) {
      stream.write(this.formatLogEntry(entry));
    }
  }

  private createLogEntry(
    level: LogLevel, 
    message: string, 
    context?: string, 
    metadata?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      context,
      metadata,
      requestId: this.getRequestId(),
      userId: this.getUserId()
    };
  }

  private getRequestId(): string | undefined {
    // Get from async context if available
    return process.env.REQUEST_ID;
  }

  private getUserId(): string | undefined {
    // Get from async context if available
    return process.env.USER_ID;
  }

  error(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void {
    if (this.logLevel < LogLevel.ERROR) return;

    const entry = this.createLogEntry(LogLevel.ERROR, message, context, metadata);
    
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    this.writeToStream('app', entry);
    this.writeToStream('error', entry);
    
    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, error || '', metadata || '');
    }
  }

  warn(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.logLevel < LogLevel.WARN) return;

    const entry = this.createLogEntry(LogLevel.WARN, message, context, metadata);
    this.writeToStream('app', entry);
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, metadata || '');
    }
  }

  info(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.logLevel < LogLevel.INFO) return;

    const entry = this.createLogEntry(LogLevel.INFO, message, context, metadata);
    this.writeToStream('app', entry);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, metadata || '');
    }
  }

  debug(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.logLevel < LogLevel.DEBUG) return;

    const entry = this.createLogEntry(LogLevel.DEBUG, message, context, metadata);
    this.writeToStream('app', entry);
    
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, metadata || '');
    }
  }

  // Performance monitoring
  performance(operation: string, duration: number, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.INFO, `Performance: ${operation}`, 'PERFORMANCE', metadata);
    entry.duration = duration;
    
    this.writeToStream('performance', entry);
    
    if (duration > 1000) { // Log slow operations
      this.warn(`Slow operation detected: ${operation} took ${duration}ms`, 'PERFORMANCE', metadata);
    }
  }

  // Security events
  security(event: string, level: 'INFO' | 'WARN' | 'ERROR', metadata?: Record<string, any>): void {
    const logLevel = level === 'ERROR' ? LogLevel.ERROR : 
                    level === 'WARN' ? LogLevel.WARN : LogLevel.INFO;
    
    const entry = this.createLogEntry(logLevel, `Security: ${event}`, 'SECURITY', metadata);
    this.writeToStream('security', entry);
    this.writeToStream('app', entry);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SECURITY-${level}] ${event}`, metadata || '');
    }
  }

  // API request logging
  apiRequest(method: string, path: string, statusCode: number, duration: number, userId?: string): void {
    const metadata = {
      method,
      path,
      statusCode,
      duration,
      userId
    };

    this.info(`API Request: ${method} ${path} - ${statusCode}`, 'API', metadata);
    this.performance(`API ${method} ${path}`, duration, metadata);
  }

  // Database operation logging
  dbOperation(operation: string, table: string, duration: number, rowCount?: number): void {
    const metadata = {
      operation,
      table,
      duration,
      rowCount
    };

    this.debug(`DB Operation: ${operation} on ${table}`, 'DATABASE', metadata);
    this.performance(`DB ${operation} ${table}`, duration, metadata);
  }

  // Business logic logging
  business(event: string, metadata?: Record<string, any>): void {
    this.info(`Business Event: ${event}`, 'BUSINESS', metadata);
  }

  // Cache operations
  cache(operation: string, key: string, hit: boolean, duration?: number): void {
    const metadata = {
      operation,
      key,
      hit,
      duration
    };

    this.debug(`Cache ${operation}: ${key} - ${hit ? 'HIT' : 'MISS'}`, 'CACHE', metadata);
    
    if (duration) {
      this.performance(`Cache ${operation}`, duration, metadata);
    }
  }

  // Cleanup method
  close(): void {
    this.logStreams.forEach(stream => {
      stream.end();
    });
    this.logStreams.clear();
  }
}

// Performance monitoring middleware
export function performanceMiddleware() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    const logger = Logger.getInstance();
    
    // Set request context
    process.env.REQUEST_ID = Math.random().toString(36).substr(2, 9);
    process.env.USER_ID = req.user?.claims?.sub;

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.apiRequest(
        req.method,
        req.originalUrl,
        res.statusCode,
        duration,
        req.user?.claims?.sub
      );
    });

    next();
  };
}

// Error logging middleware
export function errorLoggingMiddleware() {
  return (err: any, req: any, res: any, next: any) => {
    const logger = Logger.getInstance();
    
    logger.error(
      `API Error: ${req.method} ${req.originalUrl}`,
      err,
      'API',
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: err.status || 500,
        userId: req.user?.claims?.sub,
        body: req.body,
        params: req.params,
        query: req.query
      }
    );

    next(err);
  };
}

// Export singleton instance
export const logger = Logger.getInstance();

// Performance measurement decorator
export function measurePerformance(operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - start;
        logger.performance(`${operation}.${propertyName}`, duration);
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        logger.error(`${operation}.${propertyName} failed`, error as Error, operation, { duration });
        throw error;
      }
    };
  };
}