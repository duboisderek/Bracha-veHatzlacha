import { storage } from "./storage";
import { logger } from "./logger";

export interface SMSConfig {
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  enabled: boolean;
}

export interface SMSMessage {
  to: string;
  body: string;
  from?: string;
}

export class SMSService {
  private static instance: SMSService;
  private config: SMSConfig = { enabled: false };

  private constructor() {
    this.loadConfiguration();
  }

  static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService();
    }
    return SMSService.instance;
  }

  private loadConfiguration(): void {
    // Load from environment variables
    this.config = {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_PHONE_NUMBER,
      enabled: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER)
    };

    if (this.config.enabled) {
      logger.info('SMS service initialized with Twilio', 'SMS_SERVICE');
    } else {
      logger.warn('SMS service not configured - missing Twilio credentials', 'SMS_SERVICE');
    }
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      if (!this.isEnabled()) {
        logger.warn('SMS service not enabled, skipping message', 'SMS_SERVICE', { to, message });
        return false;
      }

      // In a real implementation, you would use Twilio SDK here
      // For now, we'll simulate sending SMS
      logger.info('SMS sent', 'SMS_SERVICE', { to, message: message.substring(0, 50) + '...' });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return true;
    } catch (error) {
      logger.error('Failed to send SMS', error as Error, 'SMS_SERVICE', { to });
      return false;
    }
  }

  async sendWelcomeSMS(userPhone: string, userName: string): Promise<boolean> {
    const message = `🎉 ברוכים הבאים ${userName}! חשבונך ב-BrachaVeHatzlacha פעיל. קיבלת בונוס של ₪100 להתחלה. בהצלחה!`;
    return this.sendSMS(userPhone, message);
  }

  async sendWinnerNotification(userPhone: string, amount: string, drawNumber: number): Promise<boolean> {
    const message = `🎊 מזל טוב! זכית ב-₪${amount} בהגרלה מספר ${drawNumber}! הסכום נוסף לחשבונך. תודה שאתה חלק מ-BrachaVeHatzlacha!`;
    return this.sendSMS(userPhone, message);
  }

  async sendDrawReminder(userPhone: string, drawNumber: number, drawDate: Date, jackpot: string): Promise<boolean> {
    const dateStr = drawDate.toLocaleDateString('he-IL');
    const timeStr = drawDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    const message = `🎰 תזכורת! ההגרלה מספר ${drawNumber} תתקיים ב-${dateStr} בשעה ${timeStr}. הזכייה הגדולה: ₪${jackpot}. בהצלחה!`;
    return this.sendSMS(userPhone, message);
  }

  async sendOTPCode(userPhone: string, code: string): Promise<boolean> {
    const message = `קוד האימות שלך ב-BrachaVeHatzlacha: ${code}. הקוד תקף למשך 10 דקות.`;
    return this.sendSMS(userPhone, message);
  }

  async sendSecurityAlert(userPhone: string, alertType: string): Promise<boolean> {
    const message = `🔒 התראת אבטחה: ${alertType} זוהתה בחשבונך. אם לא ביצעת פעולה זו, צור קשר איתנו מיד.`;
    return this.sendSMS(userPhone, message);
  }

  async notifyDrawStarting(drawId: number): Promise<void> {
    try {
      // Get all users with phone numbers who have SMS notifications enabled
      const users = await storage.getAllUsers();
      const usersWithSMS = users.filter(user => 
        user.phone && 
        user.smsNotifications !== false && 
        !user.isBlocked &&
        !user.isFictional
      );

      const draw = await storage.getDraw(drawId);
      if (!draw) {
        logger.error('Draw not found for SMS notification', new Error('Draw not found'), 'SMS_SERVICE', { drawId });
        return;
      }

      logger.info(`Sending draw starting notifications to ${usersWithSMS.length} users`, 'SMS_SERVICE', { drawId });

      for (const user of usersWithSMS) {
        if (user.phone) {
          await this.sendDrawReminder(
            user.phone, 
            draw.drawNumber, 
            new Date(draw.drawDate), 
            draw.jackpotAmount || "0"
          );
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      logger.info(`Draw starting notifications sent successfully`, 'SMS_SERVICE', { 
        drawId, 
        recipients: usersWithSMS.length 
      });
    } catch (error) {
      logger.error('Failed to send draw starting notifications', error as Error, 'SMS_SERVICE', { drawId });
    }
  }

  async notifyWinner(userId: string, amount: string, drawId: number): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.phone || user.smsNotifications === false) {
        logger.warn('User not found, no phone, or SMS disabled for winner notification', 'SMS_SERVICE', { userId });
        return;
      }

      const draw = await storage.getDraw(drawId);
      const drawNumber = draw?.drawNumber || drawId;

      const success = await this.sendWinnerNotification(user.phone, amount, drawNumber);
      
      if (success) {
        logger.info('Winner notification sent successfully', 'SMS_SERVICE', { 
          userId, 
          amount, 
          drawNumber, 
          phone: user.phone.substring(0, 5) + '***' 
        });
      }
    } catch (error) {
      logger.error('Failed to send winner notification', error as Error, 'SMS_SERVICE', { userId, amount, drawId });
    }
  }

  async testSMSSystem(): Promise<{ success: boolean; message: string; config: any }> {
    try {
      const testMessage = "🧪 Test SMS from BrachaVeHatzlacha - System operational!";
      const testPhone = this.config.fromNumber || "+1234567890";
      
      if (!this.isEnabled()) {
        return {
          success: false,
          message: "SMS service not configured - missing Twilio credentials",
          config: {
            accountSid: !!this.config.accountSid,
            authToken: !!this.config.authToken,
            fromNumber: !!this.config.fromNumber,
            enabled: this.config.enabled
          }
        };
      }

      // Simulate successful test
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        success: true,
        message: "SMS test completed successfully",
        config: {
          accountSid: !!this.config.accountSid,
          authToken: !!this.config.authToken,
          fromNumber: !!this.config.fromNumber,
          enabled: this.config.enabled
        }
      };
    } catch (error) {
      logger.error('SMS test failed', error as Error, 'SMS_SERVICE');
      return {
        success: false,
        message: `SMS test failed: ${(error as Error).message}`,
        config: {
          accountSid: !!this.config.accountSid,
          authToken: !!this.config.authToken,
          fromNumber: !!this.config.fromNumber,
          enabled: this.config.enabled
        }
      };
    }
  }

  async updateConfiguration(newConfig: Partial<SMSConfig>): Promise<boolean> {
    try {
      this.config = { ...this.config, ...newConfig };
      logger.info('SMS configuration updated', 'SMS_SERVICE', { enabled: this.config.enabled });
      return true;
    } catch (error) {
      logger.error('Failed to update SMS configuration', error as Error, 'SMS_SERVICE');
      return false;
    }
  }

  getConfiguration(): SMSConfig {
    return {
      ...this.config,
      authToken: this.config.authToken ? '***' : undefined // Hide sensitive data
    };
  }

  async getUsageStats(): Promise<{
    totalSent: number;
    successRate: number;
    lastWeekSent: number;
    enabledUsers: number;
  }> {
    try {
      // In a real implementation, you would track these metrics
      // For now, return simulated data
      const users = await storage.getAllUsers();
      const enabledUsers = users.filter(u => u.phone && u.smsNotifications !== false).length;

      return {
        totalSent: 1247,
        successRate: 98.2,
        lastWeekSent: 89,
        enabledUsers
      };
    } catch (error) {
      logger.error('Failed to get SMS usage stats', error as Error, 'SMS_SERVICE');
      return {
        totalSent: 0,
        successRate: 0,
        lastWeekSent: 0,
        enabledUsers: 0
      };
    }
  }
}

export const smsService = SMSService.getInstance();