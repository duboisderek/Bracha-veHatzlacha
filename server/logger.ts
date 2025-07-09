export interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
}

export interface LogEntry {
  timestamp: Date;
  level: string;
  message: string;
  service?: string;
  metadata?: any;
  error?: Error;
}

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: string, message: string, error?: Error, service?: string, metadata?: any): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      service,
      metadata,
      error
    };

    this.logs.push(entry);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output
    const prefix = service ? `[${service}]` : '';
    const timestamp = entry.timestamp.toISOString();
    
    switch (level) {
      case 'error':
        console.error(`${timestamp} ERROR ${prefix} ${message}`, error || '');
        break;
      case 'warn':
        console.warn(`${timestamp} WARN ${prefix} ${message}`);
        break;
      case 'info':
        console.info(`${timestamp} INFO ${prefix} ${message}`);
        break;
      case 'debug':
        console.debug(`${timestamp} DEBUG ${prefix} ${message}`);
        break;
      default:
        console.log(`${timestamp} ${level.toUpperCase()} ${prefix} ${message}`);
    }
  }

  debug(message: string, service?: string, metadata?: any): void {
    this.log('debug', message, undefined, service, metadata);
  }

  info(message: string, service?: string, metadata?: any): void {
    this.log('info', message, undefined, service, metadata);
  }

  warn(message: string, service?: string, metadata?: any): void {
    this.log('warn', message, undefined, service, metadata);
  }

  error(message: string, error: Error, service?: string, metadata?: any): void {
    this.log('error', message, error, service, metadata);
  }

  getLogs(limit?: number, level?: string, service?: string): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (service) {
      filteredLogs = filteredLogs.filter(log => log.service === service);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs.reverse(); // Most recent first
  }

  clearLogs(): void {
    this.logs = [];
  }

  getLogStats(): { total: number; byLevel: Record<string, number>; byService: Record<string, number> } {
    const byLevel: Record<string, number> = {};
    const byService: Record<string, number> = {};

    this.logs.forEach(log => {
      byLevel[log.level] = (byLevel[log.level] || 0) + 1;
      if (log.service) {
        byService[log.service] = (byService[log.service] || 0) + 1;
      }
    });

    return {
      total: this.logs.length,
      byLevel,
      byService
    };
  }
}

export const logger = Logger.getInstance();