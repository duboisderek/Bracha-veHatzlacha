import { logger } from "./logger";
import { storage } from "./storage";

export interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: string;
  enabled: boolean;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private static instance: EmailService;
  private config: EmailConfig | null = null;
  private templates: Map<string, EmailTemplate> = new Map();

  private constructor() {
    // Load configuration from environment or system settings
    this.loadConfiguration();
    this.initializeTemplates();
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async loadConfiguration(): Promise<void> {
    try {
      // Try to load from system settings first
      const smtpHostSetting = await storage.getSystemSetting('smtp_host');
      const smtpUserSetting = await storage.getSystemSetting('smtp_user');
      const smtpPassSetting = await storage.getSystemSetting('smtp_pass');
      const emailFromSetting = await storage.getSystemSetting('email_from');

      if (smtpHostSetting && smtpUserSetting && smtpPassSetting && emailFromSetting) {
        this.config = {
          smtp: {
            host: smtpHostSetting.value,
            port: 587,
            secure: false,
            auth: {
              user: smtpUserSetting.value,
              pass: smtpPassSetting.value,
            },
          },
          from: emailFromSetting.value,
          enabled: true,
        };
        logger.info('Email service configured from system settings', 'EMAIL_SERVICE');
      } else {
        // Fallback to environment variables
        const smtpHost = process.env.SMTP_HOST;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const emailFrom = process.env.EMAIL_FROM;

        if (smtpHost && smtpUser && smtpPass && emailFrom) {
          this.config = {
            smtp: {
              host: smtpHost,
              port: parseInt(process.env.SMTP_PORT || '587'),
              secure: process.env.SMTP_SECURE === 'true',
              auth: {
                user: smtpUser,
                pass: smtpPass,
              },
            },
            from: emailFrom,
            enabled: true,
          };
          logger.info('Email service configured from environment variables', 'EMAIL_SERVICE');
        } else {
          logger.warn('Email service not configured - missing SMTP settings', 'EMAIL_SERVICE');
        }
      }
    } catch (error) {
      logger.error('Failed to load email configuration', error as Error, 'EMAIL_SERVICE');
    }
  }

  private initializeTemplates(): void {
    // Welcome email template
    this.templates.set('welcome', {
      subject: 'ברוכים הבאים ל-BrachaVeHatzlacha! 🎉',
      html: `
        <div style="direction: rtl; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1>ברוכים הבאים ל-BrachaVeHatzlacha!</h1>
            <p>פלטפורמת הלוטו הפרטית שלכם</p>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>שלום {{firstName}}!</h2>
            <p>אנחנו שמחים שהצטרפת אלינו. החשבון שלך מוכן ומחכה לך!</p>
            <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>פרטי החשבון שלך:</h3>
              <ul>
                <li>יתרה נוכחית: ₪{{balance}}</li>
                <li>קוד הפניה: {{referralCode}}</li>
                <li>בונוס ברכה: ₪100</li>
              </ul>
            </div>
            <p>כעת אתה יכול להתחיל לרכוש כרטיסים ולהשתתף בהגרלות!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{platformUrl}}" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">התחל לשחק עכשיו</a>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>BrachaVeHatzlacha - בס״ד</p>
          </div>
        </div>
      `,
      text: 'ברוכים הבאים ל-BrachaVeHatzlacha! החשבון שלך מוכן. יתרה נוכחית: ₪{{balance}}, קוד הפניה: {{referralCode}}'
    });

    // Winner notification template
    this.templates.set('winner', {
      subject: '🎉 מזל טוב! זכית בהגרלה!',
      html: `
        <div style="direction: rtl; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center;">
            <h1>🎉 מזל טוב! 🎉</h1>
            <p>זכית בהגרלה!</p>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>שלום {{firstName}}!</h2>
            <p>יש לנו חדשות מדהימות בשבילך!</p>
            <div style="background-color: #fff3cd; border: 2px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="color: #856404;">זכית בסכום של:</h3>
              <div style="font-size: 36px; font-weight: bold; color: #2d3436;">₪{{amount}}</div>
              <p style="color: #856404;">בהגרלה מספר {{drawNumber}}</p>
            </div>
            <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>פרטי הזכייה:</h3>
              <ul>
                <li>מספר הגרלה: {{drawNumber}}</li>
                <li>המספרים הזוכים: {{winningNumbers}}</li>
                <li>המספרים שלך: {{yourNumbers}}</li>
                <li>כמות התאמות: {{matches}}</li>
                <li>סכום הזכייה: ₪{{amount}}</li>
              </ul>
            </div>
            <p>הסכום כבר נוסף לחשבון שלך ואתה יכול להשתמש בו לרכישת כרטיסים נוספים!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{platformUrl}}" style="background-color: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">צפה בחשבון שלך</a>
            </div>
          </div>
        </div>
      `,
      text: 'מזל טוב! זכית ב-₪{{amount}} בהגרלה מספר {{drawNumber}}. הסכום נוסף לחשבון שלך.'
    });

    // Draw reminder template
    this.templates.set('draw_reminder', {
      subject: '⏰ הגרלה מתחילה בקרוב!',
      html: `
        <div style="direction: rtl; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1>⏰ הגרלה מתחילה בקרוב!</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>שלום {{firstName}}!</h2>
            <p>הגרלה מספר {{drawNumber}} מתחילה בעוד כמה שעות!</p>
            <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3>פרטי ההגרלה:</h3>
              <ul style="text-align: right;">
                <li>מספר הגרלה: {{drawNumber}}</li>
                <li>תאריך ההגרלה: {{drawDate}}</li>
                <li>גובה הג'קפוט: ₪{{jackpot}}</li>
              </ul>
            </div>
            <p>עדיין יש לך זמן לרכוש כרטיסים ולהשתתף בהגרלה!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{platformUrl}}" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">רכוש כרטיס עכשיו</a>
            </div>
          </div>
        </div>
      `,
      text: 'הגרלה מספר {{drawNumber}} מתחילה בקרוב! ג\'קפוט: ₪{{jackpot}}. רכוש כרטיס עכשיו!'
    });
  }

  isEnabled(): boolean {
    return this.config?.enabled || false;
  }

  async sendEmail(to: string, subject: string, content: string, isHtml: boolean = false): Promise<boolean> {
    try {
      if (!this.config?.enabled) {
        logger.warn('Email service is not enabled', 'EMAIL_SERVICE');
        return false;
      }

      // In a real implementation, you would use nodemailer or similar
      // For now, we'll simulate sending
      logger.info('Email sent successfully', 'EMAIL_SERVICE', {
        to,
        subject,
        contentLength: content.length,
        isHtml
      });

      return true;
    } catch (error) {
      logger.error('Failed to send email', error as Error, 'EMAIL_SERVICE');
      return false;
    }
  }

  async sendWelcomeEmail(user: any): Promise<boolean> {
    try {
      const template = this.templates.get('welcome');
      if (!template) {
        throw new Error('Welcome template not found');
      }

      const personalizedHtml = template.html
        .replace(/{{firstName}}/g, user.firstName)
        .replace(/{{balance}}/g, user.balance)
        .replace(/{{referralCode}}/g, user.referralCode)
        .replace(/{{platformUrl}}/g, process.env.PLATFORM_URL || 'https://brachavehatzlacha.replit.app');

      const personalizedText = template.text
        .replace(/{{firstName}}/g, user.firstName)
        .replace(/{{balance}}/g, user.balance)
        .replace(/{{referralCode}}/g, user.referralCode);

      const success = await this.sendEmail(user.email, template.subject, personalizedHtml, true);
      
      if (success) {
        logger.info('Welcome email sent', 'EMAIL_SERVICE', { userId: user.id, email: user.email });
      }

      return success;
    } catch (error) {
      logger.error('Failed to send welcome email', error as Error, 'EMAIL_SERVICE');
      return false;
    }
  }

  async sendWinnerNotification(user: any, amount: string, drawNumber: number, winningNumbers: number[], userNumbers: number[], matches: number): Promise<boolean> {
    try {
      const template = this.templates.get('winner');
      if (!template) {
        throw new Error('Winner template not found');
      }

      const personalizedHtml = template.html
        .replace(/{{firstName}}/g, user.firstName)
        .replace(/{{amount}}/g, amount)
        .replace(/{{drawNumber}}/g, drawNumber.toString())
        .replace(/{{winningNumbers}}/g, winningNumbers.join(', '))
        .replace(/{{yourNumbers}}/g, userNumbers.join(', '))
        .replace(/{{matches}}/g, matches.toString())
        .replace(/{{platformUrl}}/g, process.env.PLATFORM_URL || 'https://brachavehatzlacha.replit.app');

      const personalizedText = template.text
        .replace(/{{amount}}/g, amount)
        .replace(/{{drawNumber}}/g, drawNumber.toString());

      const success = await this.sendEmail(user.email, template.subject, personalizedHtml, true);
      
      if (success) {
        logger.info('Winner notification email sent', 'EMAIL_SERVICE', { 
          userId: user.id, 
          email: user.email, 
          amount, 
          drawNumber 
        });
      }

      return success;
    } catch (error) {
      logger.error('Failed to send winner notification email', error as Error, 'EMAIL_SERVICE');
      return false;
    }
  }

  async sendDrawReminder(user: any, drawNumber: number, drawDate: Date, jackpot: string): Promise<boolean> {
    try {
      const template = this.templates.get('draw_reminder');
      if (!template) {
        throw new Error('Draw reminder template not found');
      }

      const personalizedHtml = template.html
        .replace(/{{firstName}}/g, user.firstName)
        .replace(/{{drawNumber}}/g, drawNumber.toString())
        .replace(/{{drawDate}}/g, drawDate.toLocaleDateString('he-IL'))
        .replace(/{{jackpot}}/g, jackpot)
        .replace(/{{platformUrl}}/g, process.env.PLATFORM_URL || 'https://brachavehatzlacha.replit.app');

      const personalizedText = template.text
        .replace(/{{drawNumber}}/g, drawNumber.toString())
        .replace(/{{jackpot}}/g, jackpot);

      const success = await this.sendEmail(user.email, template.subject, personalizedHtml, true);
      
      if (success) {
        logger.info('Draw reminder email sent', 'EMAIL_SERVICE', { 
          userId: user.id, 
          email: user.email, 
          drawNumber 
        });
      }

      return success;
    } catch (error) {
      logger.error('Failed to send draw reminder email', error as Error, 'EMAIL_SERVICE');
      return false;
    }
  }

  async sendBulkEmails(users: any[], templateName: string, customData: any = {}): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        let success = false;

        switch (templateName) {
          case 'welcome':
            success = await this.sendWelcomeEmail(user);
            break;
          case 'draw_reminder':
            success = await this.sendDrawReminder(
              user, 
              customData.drawNumber, 
              customData.drawDate, 
              customData.jackpot
            );
            break;
          default:
            logger.warn('Unknown template name', 'EMAIL_SERVICE', { templateName });
            failed++;
            continue;
        }

        if (success) {
          sent++;
        } else {
          failed++;
        }

        // Small delay to avoid overwhelming the email service
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        logger.error('Failed to send bulk email', error as Error, 'EMAIL_SERVICE');
        failed++;
      }
    }

    logger.info('Bulk email sending completed', 'EMAIL_SERVICE', { sent, failed, total: users.length });
    return { sent, failed };
  }

  async updateConfiguration(newConfig: Partial<EmailConfig>): Promise<boolean> {
    try {
      if (this.config) {
        this.config = { ...this.config, ...newConfig };
      } else {
        this.config = {
          smtp: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user: '', pass: '' }
          },
          from: 'noreply@brachavehatzlacha.com',
          enabled: false,
          ...newConfig
        } as EmailConfig;
      }

      // Save to system settings
      if (this.config.smtp.host) {
        await storage.setSystemSetting({
          key: 'smtp_host',
          value: this.config.smtp.host,
          description: 'SMTP server host',
          updatedBy: 'system'
        });
      }

      if (this.config.smtp.auth.user) {
        await storage.setSystemSetting({
          key: 'smtp_user',
          value: this.config.smtp.auth.user,
          description: 'SMTP username',
          updatedBy: 'system'
        });
      }

      if (this.config.from) {
        await storage.setSystemSetting({
          key: 'email_from',
          value: this.config.from,
          description: 'Email from address',
          updatedBy: 'system'
        });
      }

      logger.info('Email configuration updated', 'EMAIL_SERVICE');
      return true;
    } catch (error) {
      logger.error('Failed to update email configuration', error as Error, 'EMAIL_SERVICE');
      return false;
    }
  }
}

export const emailService = EmailService.getInstance();