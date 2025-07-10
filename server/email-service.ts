import nodemailer from 'nodemailer';
import { logger } from './logger';
import { storage } from './storage';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailTemplate {
  name: string;
  subject: { [key: string]: string };
  body: { [key: string]: string };
}

export class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter | null = null;
  private configured: boolean = false;
  private templates: Map<string, EmailTemplate> = new Map();

  private constructor() {
    this.initializeTemplates();
    this.checkConfiguration();
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private initializeTemplates() {
    // Welcome email template
    this.templates.set('welcome', {
      name: 'welcome',
      subject: {
        he: 'ברוכים הבאים לברכה והצלחה!',
        en: 'Welcome to BrachaVeHatzlacha!',
        fr: 'Bienvenue à BrachaVeHatzlacha !'
      },
      body: {
        he: `
          <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
            <h2>שלום {{firstName}} {{lastName}},</h2>
            <p>ברוכים הבאים למערכת ההגרלות של ברכה והצלחה!</p>
            <p>קיבלת בונוס רישום של ₪100 לחשבונך.</p>
            <p>הפרטים שלך:</p>
            <ul>
              <li>דוא"ל: {{email}}</li>
              <li>קוד הפניה: {{referralCode}}</li>
            </ul>
            <p>בהצלחה!</p>
          </div>
        `,
        en: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Hello {{firstName}} {{lastName}},</h2>
            <p>Welcome to BrachaVeHatzlacha lottery system!</p>
            <p>You've received a registration bonus of ₪100 to your account.</p>
            <p>Your details:</p>
            <ul>
              <li>Email: {{email}}</li>
              <li>Referral code: {{referralCode}}</li>
            </ul>
            <p>Good luck!</p>
          </div>
        `,
        fr: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Bonjour {{firstName}} {{lastName}},</h2>
            <p>Bienvenue dans le système de loterie BrachaVeHatzlacha !</p>
            <p>Vous avez reçu un bonus d'inscription de ₪100 sur votre compte.</p>
            <p>Vos informations :</p>
            <ul>
              <li>Email : {{email}}</li>
              <li>Code de parrainage : {{referralCode}}</li>
            </ul>
            <p>Bonne chance !</p>
          </div>
        `
      }
    });

    // Ticket purchase template
    this.templates.set('ticket_purchase', {
      name: 'ticket_purchase',
      subject: {
        he: 'אישור רכישת כרטיס - הגרלה #{{drawNumber}}',
        en: 'Ticket Purchase Confirmation - Draw #{{drawNumber}}',
        fr: 'Confirmation d\'achat de billet - Tirage #{{drawNumber}}'
      },
      body: {
        he: `
          <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
            <h2>אישור רכישת כרטיס</h2>
            <p>שלום {{firstName}},</p>
            <p>רכישת הכרטיס שלך אושרה בהצלחה!</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
              <p><strong>מספר הגרלה:</strong> {{drawNumber}}</p>
              <p><strong>המספרים שלך:</strong> {{numbers}}</p>
              <p><strong>עלות:</strong> ₪{{cost}}</p>
              <p><strong>תאריך הגרלה:</strong> {{drawDate}}</p>
            </div>
            <p>בהצלחה!</p>
          </div>
        `,
        en: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Ticket Purchase Confirmation</h2>
            <p>Hello {{firstName}},</p>
            <p>Your ticket purchase has been confirmed successfully!</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
              <p><strong>Draw number:</strong> {{drawNumber}}</p>
              <p><strong>Your numbers:</strong> {{numbers}}</p>
              <p><strong>Cost:</strong> ₪{{cost}}</p>
              <p><strong>Draw date:</strong> {{drawDate}}</p>
            </div>
            <p>Good luck!</p>
          </div>
        `,
        fr: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Confirmation d'achat de billet</h2>
            <p>Bonjour {{firstName}},</p>
            <p>Votre achat de billet a été confirmé avec succès !</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
              <p><strong>Numéro du tirage :</strong> {{drawNumber}}</p>
              <p><strong>Vos numéros :</strong> {{numbers}}</p>
              <p><strong>Coût :</strong> ₪{{cost}}</p>
              <p><strong>Date du tirage :</strong> {{drawDate}}</p>
            </div>
            <p>Bonne chance !</p>
          </div>
        `
      }
    });

    // Winning notification template
    this.templates.set('winning_notification', {
      name: 'winning_notification',
      subject: {
        he: 'מזל טוב! זכית בהגרלה #{{drawNumber}}',
        en: 'Congratulations! You won in draw #{{drawNumber}}',
        fr: 'Félicitations ! Vous avez gagné au tirage #{{drawNumber}}'
      },
      body: {
        he: `
          <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
            <h1 style="color: #d4a574;">🎉 מזל טוב! 🎉</h1>
            <p>{{firstName}} היקר/ה,</p>
            <p>אנו שמחים לבשר לך שזכית בהגרלה!</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; border: 2px solid #d4a574;">
              <p><strong>מספר הגרלה:</strong> {{drawNumber}}</p>
              <p><strong>מספרים זוכים:</strong> {{winningNumbers}}</p>
              <p><strong>המספרים שלך:</strong> {{userNumbers}}</p>
              <p><strong>מספר התאמות:</strong> {{matchCount}}</p>
              <h3 style="color: #d4a574;">סכום הזכייה: ₪{{winAmount}}</h3>
            </div>
            <p>הסכום נוסף לחשבונך באופן אוטומטי.</p>
            <p>ברכות חמות,<br/>צוות ברכה והצלחה</p>
          </div>
        `,
        en: `
          <div style="font-family: Arial, sans-serif;">
            <h1 style="color: #d4a574;">🎉 Congratulations! 🎉</h1>
            <p>Dear {{firstName}},</p>
            <p>We are pleased to inform you that you have won in the lottery!</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; border: 2px solid #d4a574;">
              <p><strong>Draw number:</strong> {{drawNumber}}</p>
              <p><strong>Winning numbers:</strong> {{winningNumbers}}</p>
              <p><strong>Your numbers:</strong> {{userNumbers}}</p>
              <p><strong>Matches:</strong> {{matchCount}}</p>
              <h3 style="color: #d4a574;">Winning amount: ₪{{winAmount}}</h3>
            </div>
            <p>The amount has been automatically added to your account.</p>
            <p>Warm congratulations,<br/>BrachaVeHatzlacha Team</p>
          </div>
        `,
        fr: `
          <div style="font-family: Arial, sans-serif;">
            <h1 style="color: #d4a574;">🎉 Félicitations ! 🎉</h1>
            <p>Cher(e) {{firstName}},</p>
            <p>Nous sommes heureux de vous informer que vous avez gagné à la loterie !</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; border: 2px solid #d4a574;">
              <p><strong>Numéro du tirage :</strong> {{drawNumber}}</p>
              <p><strong>Numéros gagnants :</strong> {{winningNumbers}}</p>
              <p><strong>Vos numéros :</strong> {{userNumbers}}</p>
              <p><strong>Correspondances :</strong> {{matchCount}}</p>
              <h3 style="color: #d4a574;">Montant gagné : ₪{{winAmount}}</h3>
            </div>
            <p>Le montant a été automatiquement ajouté à votre compte.</p>
            <p>Félicitations chaleureuses,<br/>L'équipe BrachaVeHatzlacha</p>
          </div>
        `
      }
    });

    // Password reset template
    this.templates.set('password_reset', {
      name: 'password_reset',
      subject: {
        he: 'איפוס סיסמה - ברכה והצלחה',
        en: 'Password Reset - BrachaVeHatzlacha',
        fr: 'Réinitialisation du mot de passe - BrachaVeHatzlacha'
      },
      body: {
        he: `
          <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
            <h2>איפוס סיסמה</h2>
            <p>שלום {{firstName}},</p>
            <p>קיבלנו בקשה לאיפוס הסיסמה שלך.</p>
            <p>קוד האיפוס שלך הוא:</p>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold;">
              {{resetCode}}
            </div>
            <p>הקוד תקף ל-15 דקות.</p>
            <p>אם לא ביקשת איפוס סיסמה, אנא התעלם מהודעה זו.</p>
          </div>
        `,
        en: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Password Reset</h2>
            <p>Hello {{firstName}},</p>
            <p>We received a request to reset your password.</p>
            <p>Your reset code is:</p>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold;">
              {{resetCode}}
            </div>
            <p>This code is valid for 15 minutes.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
          </div>
        `,
        fr: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Réinitialisation du mot de passe</h2>
            <p>Bonjour {{firstName}},</p>
            <p>Nous avons reçu une demande de réinitialisation de votre mot de passe.</p>
            <p>Votre code de réinitialisation est :</p>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold;">
              {{resetCode}}
            </div>
            <p>Ce code est valide pendant 15 minutes.</p>
            <p>Si vous n'avez pas demandé de réinitialisation, veuillez ignorer cet email.</p>
          </div>
        `
      }
    });
  }

  private async checkConfiguration() {
    try {
      // Configuration SMTP Hostinger directe
      await this.configure({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        auth: {
          user: 'bh@brahatz.com',
          pass: 'Bracha123@vhtzl'
        },
        from: 'bh@brahatz.com'
      });
      logger.info('Email service configured with Hostinger SMTP', 'EMAIL_SERVICE');
    } catch (error) {
      logger.error('Failed to configure email service', error as Error, 'EMAIL_SERVICE');
    }
  }

  async configure(config: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
    from?: string;
  }): Promise<void> {
    try {
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.auth,
        tls: {
          rejectUnauthorized: false
        }
      });

      // Test connection
      await this.transporter.verify();
      this.configured = true;
      
      logger.info('Email service configured successfully', 'EMAIL_SERVICE');
    } catch (error) {
      logger.error('Failed to configure email service', error as Error, 'EMAIL_SERVICE');
      this.configured = false;
      throw error;
    }
  }

  isConfigured(): boolean {
    return this.configured;
  }

  private replaceTemplateVariables(template: string, variables: { [key: string]: any }): string {
    let result = template;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, variables[key]);
    });
    return result;
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.configured || !this.transporter) {
      logger.warn('Email service not configured', 'EMAIL_SERVICE');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: '"BrachaVeHatzlacha" <noreply@brachavehatzlacha.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || (options.html ? options.html.replace(/<[^>]*>/g, '') : '')
      });

      logger.info('Email sent successfully', 'EMAIL_SERVICE', {
        to: options.to,
        subject: options.subject
      });
    } catch (error) {
      logger.error('Failed to send email', error as Error, 'EMAIL_SERVICE');
      throw error;
    }
  }

  async sendTemplateEmail(
    templateName: string,
    to: string,
    language: string,
    variables: { [key: string]: any }
  ): Promise<void> {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    const lang = language || 'en';
    const subject = this.replaceTemplateVariables(template.subject[lang] || template.subject.en, variables);
    const html = this.replaceTemplateVariables(template.body[lang] || template.body.en, variables);

    await this.sendEmail({
      to,
      subject,
      html
    });
  }

  async sendWelcomeEmail(user: any): Promise<void> {
    await this.sendTemplateEmail('welcome', user.email, user.language || 'en', {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      referralCode: user.referralCode
    });
  }

  async sendTicketPurchaseEmail(user: any, ticket: any, draw: any): Promise<void> {
    const numbers = (ticket.numbers as number[]).join(', ');
    await this.sendTemplateEmail('ticket_purchase', user.email, user.language || 'en', {
      firstName: user.firstName,
      drawNumber: draw.drawNumber,
      numbers,
      cost: ticket.cost,
      drawDate: new Date(draw.drawDate).toLocaleDateString()
    });
  }

  async sendWinningNotification(user: any, ticket: any, draw: any): Promise<void> {
    const userNumbers = (ticket.numbers as number[]).join(', ');
    const winningNumbers = (draw.winningNumbers as number[]).join(', ');
    
    await this.sendTemplateEmail('winning_notification', user.email, user.language || 'en', {
      firstName: user.firstName,
      drawNumber: draw.drawNumber,
      winningNumbers,
      userNumbers,
      matchCount: ticket.matchCount,
      winAmount: ticket.winningAmount
    });
  }

  async sendPasswordResetEmail(user: any, resetCode: string): Promise<void> {
    await this.sendTemplateEmail('password_reset', user.email, user.language || 'en', {
      firstName: user.firstName,
      resetCode
    });
  }

  getTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  async updateTemplate(name: string, updates: Partial<EmailTemplate>): Promise<void> {
    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template ${name} not found`);
    }

    if (updates.subject) {
      Object.assign(template.subject, updates.subject);
    }
    if (updates.body) {
      Object.assign(template.body, updates.body);
    }

    // Save to database
    await storage.upsertSystemSetting({
      key: `email_template_${name}`,
      value: JSON.stringify(template),
      description: `Email template: ${name}`
    });
  }

  async testEmailConfiguration(testEmail: string): Promise<void> {
    await this.sendEmail({
      to: testEmail,
      subject: 'Test Email - BrachaVeHatzlacha',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Test Email</h2>
          <p>This is a test email from BrachaVeHatzlacha lottery system.</p>
          <p>If you received this email, your email configuration is working correctly!</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    });
  }

  getConfiguration() {
    return {
      configured: this.configured,
      host: this.transporter?.options?.host,
      port: this.transporter?.options?.port,
      secure: this.transporter?.options?.secure
    };
  }

  async updateConfiguration(config: any) {
    await this.configure(config);
    // Save to database
    await storage.upsertSystemSetting({
      key: 'smtp_config',
      value: JSON.stringify(config),
      description: 'SMTP configuration for email service'
    });
  }
}

export const emailService = EmailService.getInstance();