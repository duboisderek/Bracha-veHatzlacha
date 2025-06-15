import { storage } from './storage';

interface SMSNotification {
  to: string;
  message: string;
  type: 'draw_starting' | 'winning_notification';
  userId?: string;
  drawId?: number;
  amount?: string;
}

export class SMSService {
  private enabled: boolean;
  
  constructor() {
    // Check if SMS credentials are available
    this.enabled = !!(
      process.env.TWILIO_ACCOUNT_SID && 
      process.env.TWILIO_AUTH_TOKEN && 
      process.env.TWILIO_PHONE_NUMBER
    );
  }

  async sendSMS(notification: SMSNotification): Promise<boolean> {
    if (!this.enabled) {
      console.log(`[SMS SIMULATION] Would send SMS to ${notification.to}: ${notification.message}`);
      return true;
    }

    try {
      // Real Twilio implementation would go here
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      await client.messages.create({
        body: notification.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: notification.to
      });
      
      console.log(`SMS sent successfully to ${notification.to}`);
      return true;
    } catch (error) {
      console.error(`Failed to send SMS to ${notification.to}:`, error);
      return false;
    }
  }

  async notifyDrawStarting(drawId: number): Promise<void> {
    try {
      // Get all participants for this draw
      const tickets = await storage.getDrawTickets(drawId);
      const participantIdsSet = new Set(tickets.map(ticket => ticket.userId));
      const participantIds: string[] = [];
      participantIdsSet.forEach(id => participantIds.push(id));
      
      // Get user details for all participants
      const users = await storage.getAllUsers();
      const participants = users.filter(user => participantIds.includes(user.id));
      
      console.log(`Notifying ${participants.length} participants about draw ${drawId} starting...`);
      
      for (const participant of participants) {
        if (participant.phoneNumber) {
          const message = participant.language === 'he' 
            ? `ההגרלה מתחילה בקרוב! בהצלחה! - ברכה והצלחה`
            : `Draw is starting soon! Good luck! - Bracha veHatzlacha`;
            
          await this.sendSMS({
            to: participant.phoneNumber,
            message,
            type: 'draw_starting',
            userId: participant.id,
            drawId
          });
        }
      }
    } catch (error) {
      console.error('Error notifying participants about draw starting:', error);
    }
  }

  async notifyWinner(userId: string, amount: string, drawId: number): Promise<void> {
    try {
      const users = await storage.getAllUsers();
      const winner = users.find(user => user.id === userId);
      
      if (!winner || !winner.phoneNumber) {
        console.log(`Winner ${userId} has no phone number, skipping SMS notification`);
        return;
      }

      const message = winner.language === 'he'
        ? `מזל טוב! זכית ב-₪${amount}! צור קשר איתנו לקבלת הפרס. - ברכה והצלחה`
        : `Congratulations! You won ₪${amount}! Contact us to claim your prize. - Bracha veHatzlacha`;

      await this.sendSMS({
        to: winner.phoneNumber,
        message,
        type: 'winning_notification',
        userId,
        drawId,
        amount
      });
      
      console.log(`Winner notification sent to ${winner.firstName} ${winner.lastName} (₪${amount})`);
    } catch (error) {
      console.error('Error notifying winner:', error);
    }
  }

  async testSMSSystem(): Promise<{ success: boolean; message: string }> {
    const testNumber = process.env.TEST_PHONE_NUMBER || '+972501234567';
    
    try {
      const result = await this.sendSMS({
        to: testNumber,
        message: 'Test SMS from Bracha veHatzlacha lottery system',
        type: 'draw_starting'
      });
      
      return {
        success: result,
        message: result ? 'SMS test successful' : 'SMS test failed'
      };
    } catch (error) {
      return {
        success: false,
        message: `SMS test error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export const smsService = new SMSService();