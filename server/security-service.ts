import { storage } from "./storage";
import { logger } from "./logger";

export interface LoginAttempt {
  email: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  successful: boolean;
}

export interface SecuritySummary {
  twoFactorEnabled: boolean;
  lastLogin: Date | null;
  loginAttempts: number;
  securityLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export class SecurityService {
  private static instance: SecurityService;
  private loginAttempts: Map<string, LoginAttempt[]> = new Map();
  private blockedIPs: Map<string, Date> = new Map();
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  private constructor() {}

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  async recordLoginAttempt(email: string, ip: string, userAgent: string, successful: boolean): Promise<boolean> {
    try {
      const key = `${email}:${ip}`;
      const now = new Date();
      
      // Check if IP is currently blocked
      const blockedUntil = this.blockedIPs.get(ip);
      if (blockedUntil && now < blockedUntil) {
        return false; // Still blocked
      }

      // Clean old attempts (older than 1 hour)
      const attempts = this.loginAttempts.get(key) || [];
      const recentAttempts = attempts.filter(attempt => 
        now.getTime() - attempt.timestamp.getTime() < 60 * 60 * 1000
      );

      // Add new attempt
      const newAttempt: LoginAttempt = {
        email,
        ip,
        userAgent,
        timestamp: now,
        successful
      };
      recentAttempts.push(newAttempt);
      this.loginAttempts.set(key, recentAttempts);

      if (successful) {
        // Clear failed attempts on successful login
        this.loginAttempts.delete(key);
        this.blockedIPs.delete(ip);

        // Record successful login
        await this.recordSecurityEvent({
          event: 'successful_login',
          userId: null, // Will be filled by caller if available
          ip,
          userAgent,
          severity: 'low',
          blocked: false,
          metadata: { email }
        });

        return true;
      } else {
        // Count failed attempts
        const failedAttempts = recentAttempts.filter(attempt => !attempt.successful);
        
        if (failedAttempts.length >= this.MAX_LOGIN_ATTEMPTS) {
          // Block IP for lockout duration
          this.blockedIPs.set(ip, new Date(now.getTime() + this.LOCKOUT_DURATION));

          // Record security event
          await this.recordSecurityEvent({
            event: 'account_locked',
            userId: null,
            ip,
            userAgent,
            severity: 'high',
            blocked: true,
            metadata: { email, attempts: failedAttempts.length }
          });

          logger.warn('IP blocked due to multiple failed login attempts', 'SECURITY_SERVICE', {
            ip,
            email,
            attempts: failedAttempts.length
          });

          return false;
        }

        // Record failed login attempt
        await this.recordSecurityEvent({
          event: 'failed_login',
          userId: null,
          ip,
          userAgent,
          severity: failedAttempts.length > 2 ? 'medium' : 'low',
          blocked: false,
          metadata: { email, attemptNumber: failedAttempts.length }
        });

        return true; // Can still attempt
      }
    } catch (error) {
      logger.error('Failed to record login attempt', error as Error, 'SECURITY_SERVICE');
      return true; // Allow attempt on error
    }
  }

  async recordSecurityEvent(eventData: {
    event: string;
    userId?: string | null;
    ip: string;
    userAgent: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    blocked: boolean;
    metadata?: any;
  }): Promise<void> {
    try {
      await storage.createSecurityEvent({
        event: eventData.event,
        userId: eventData.userId || null,
        ip: eventData.ip,
        userAgent: eventData.userAgent,
        severity: eventData.severity,
        blocked: eventData.blocked,
        details: eventData.metadata || null
      });
    } catch (error) {
      logger.error('Failed to record security event', error as Error, 'SECURITY_SERVICE');
    }
  }

  async generateTwoFactorSecret(userId: string): Promise<{ secret: string; qrCode: string }> {
    try {
      // Generate a simple secret (in production, use proper TOTP library like speakeasy)
      const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Create or update 2FA record
      const existingTwoFA = await storage.getTwoFactorAuth(userId);
      
      if (existingTwoFA) {
        // Update existing record
        await storage.createTwoFactorAuth({
          userId,
          secret,
          enabled: false,
          backupCodes: this.generateBackupCodes()
        });
      } else {
        // Create new record
        await storage.createTwoFactorAuth({
          userId,
          secret,
          enabled: false,
          backupCodes: this.generateBackupCodes()
        });
      }

      // Generate QR code data (in production, use proper QR code library)
      const qrCodeData = `otpauth://totp/BrachaVeHatzlacha:${userId}?secret=${secret}&issuer=BrachaVeHatzlacha`;
      const qrCode = `data:image/svg+xml;base64,${Buffer.from(this.generateSimpleQRSVG(qrCodeData)).toString('base64')}`;

      await this.recordSecurityEvent({
        event: '2fa_secret_generated',
        userId,
        ip: 'server',
        userAgent: 'system',
        severity: 'medium',
        blocked: false
      });

      return { secret, qrCode };
    } catch (error) {
      logger.error('Failed to generate 2FA secret', error as Error, 'SECURITY_SERVICE');
      throw error;
    }
  }

  async enableTwoFactor(userId: string, token: string): Promise<boolean> {
    try {
      const twoFA = await storage.getTwoFactorAuth(userId);
      if (!twoFA) {
        throw new Error('2FA not set up for user');
      }

      // Verify token (simplified verification)
      const isValid = this.verifyTOTPToken(twoFA.secret, token);
      
      if (isValid) {
        await storage.enableTwoFactorAuth(userId);
        
        await this.recordSecurityEvent({
          event: '2fa_enabled',
          userId,
          ip: 'server',
          userAgent: 'system',
          severity: 'medium',
          blocked: false
        });

        logger.info('2FA enabled for user', 'SECURITY_SERVICE', { userId });
        return true;
      } else {
        await this.recordSecurityEvent({
          event: '2fa_enable_failed',
          userId,
          ip: 'server',
          userAgent: 'system',
          severity: 'medium',
          blocked: false,
          metadata: { reason: 'invalid_token' }
        });

        return false;
      }
    } catch (error) {
      logger.error('Failed to enable 2FA', error as Error, 'SECURITY_SERVICE');
      return false;
    }
  }

  async verifyTwoFactor(userId: string, token: string): Promise<boolean> {
    try {
      if (!token) return true; // No 2FA token provided, skip verification

      const twoFA = await storage.getTwoFactorAuth(userId);
      if (!twoFA || !twoFA.enabled) {
        return true; // 2FA not enabled for user
      }

      // Verify TOTP token
      const isValidTOTP = this.verifyTOTPToken(twoFA.secret, token);
      
      // Check backup codes
      const backupCodes = (twoFA.backupCodes || []) as string[];
      const isValidBackupCode = backupCodes.includes(token);

      if (isValidBackupCode) {
        // Remove used backup code
        await storage.removeBackupCode(userId, token);
        
        await this.recordSecurityEvent({
          event: '2fa_backup_code_used',
          userId,
          ip: 'server',
          userAgent: 'system',
          severity: 'medium',
          blocked: false
        });
      }

      const isValid = isValidTOTP || isValidBackupCode;

      await this.recordSecurityEvent({
        event: isValid ? '2fa_verification_success' : '2fa_verification_failed',
        userId,
        ip: 'server',
        userAgent: 'system',
        severity: isValid ? 'low' : 'medium',
        blocked: false
      });

      return isValid;
    } catch (error) {
      logger.error('Failed to verify 2FA', error as Error, 'SECURITY_SERVICE');
      return false;
    }
  }

  async getSecurityEvents(limit: number = 100, severity?: string, userId?: string): Promise<any[]> {
    try {
      return await storage.getSecurityEvents(limit, severity, userId);
    } catch (error) {
      logger.error('Failed to get security events', error as Error, 'SECURITY_SERVICE');
      return [];
    }
  }

  async getUserSecuritySummary(userId: string): Promise<SecuritySummary> {
    try {
      const twoFA = await storage.getTwoFactorAuth(userId);
      const recentEvents = await storage.getSecurityEvents(50, undefined, userId);
      
      const lastLogin = recentEvents
        .filter(event => event.event === 'successful_login')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      const failedLoginAttempts = recentEvents
        .filter(event => event.event === 'failed_login').length;

      const recommendations: string[] = [];
      let securityLevel: 'low' | 'medium' | 'high' = 'medium';

      if (!twoFA?.enabled) {
        recommendations.push('הפעל אימות דו-שלבי לאבטחה משופרת');
        securityLevel = 'low';
      } else {
        securityLevel = 'high';
      }

      if (failedLoginAttempts > 0) {
        recommendations.push(`יש לך ${failedLoginAttempts} ניסיונות כניסה כושלים אחרונים`);
      }

      if (!lastLogin) {
        recommendations.push('בדוק את פעילות החשבון שלך באופן קבוע');
      }

      return {
        twoFactorEnabled: twoFA?.enabled || false,
        lastLogin: lastLogin ? new Date(lastLogin.timestamp) : null,
        loginAttempts: failedLoginAttempts,
        securityLevel,
        recommendations
      };
    } catch (error) {
      logger.error('Failed to get user security summary', error as Error, 'SECURITY_SERVICE');
      throw error;
    }
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
    return codes;
  }

  private verifyTOTPToken(secret: string, token: string): boolean {
    // Simplified TOTP verification (in production, use proper TOTP library)
    // For now, we'll accept any 6-digit number as valid
    return /^\d{6}$/.test(token);
  }

  private generateSimpleQRSVG(data: string): string {
    // Very basic QR code representation (for demo purposes)
    // In production, use a proper QR code library
    return `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="black"/>
        <rect x="40" y="40" width="120" height="120" fill="white"/>
        <text x="100" y="105" text-anchor="middle" font-family="monospace" font-size="8" fill="black">
          QR Code
        </text>
        <text x="100" y="120" text-anchor="middle" font-family="monospace" font-size="6" fill="black">
          ${data.substring(0, 20)}...
        </text>
      </svg>
    `;
  }

  async checkSuspiciousActivity(userId: string): Promise<{
    suspicious: boolean;
    reasons: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    try {
      const recentEvents = await storage.getSecurityEvents(100, undefined, userId);
      const reasons: string[] = [];
      let suspicious = false;
      let riskLevel: 'low' | 'medium' | 'high' = 'low';

      // Check for multiple failed logins
      const failedLogins = recentEvents.filter(event => 
        event.event === 'failed_login' && 
        new Date().getTime() - new Date(event.timestamp).getTime() < 24 * 60 * 60 * 1000
      );

      if (failedLogins.length > 3) {
        suspicious = true;
        riskLevel = 'medium';
        reasons.push(`${failedLogins.length} ניסיונות כניסה כושלים ב-24 השעות האחרונות`);
      }

      // Check for logins from multiple IPs
      const recentLogins = recentEvents.filter(event => 
        event.event === 'successful_login' &&
        new Date().getTime() - new Date(event.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000
      );

      const uniqueIPs = new Set(recentLogins.map(event => event.ip));
      if (uniqueIPs.size > 3) {
        suspicious = true;
        riskLevel = 'high';
        reasons.push(`כניסות מ-${uniqueIPs.size} כתובות IP שונות בשבוע האחרון`);
      }

      // Check for 2FA bypass attempts
      const twoFAFailures = recentEvents.filter(event => 
        event.event === '2fa_verification_failed'
      );

      if (twoFAFailures.length > 2) {
        suspicious = true;
        riskLevel = 'high';
        reasons.push(`${twoFAFailures.length} ניסיונות כושלים לעקוף אימות דו-שלבי`);
      }

      return { suspicious, reasons, riskLevel };
    } catch (error) {
      logger.error('Failed to check suspicious activity', error as Error, 'SECURITY_SERVICE');
      return { suspicious: false, reasons: [], riskLevel: 'low' };
    }
  }
}

export const securityService = SecurityService.getInstance();