import { storage } from './storage';
import { smsService } from './sms-service';
import config from '../config.mjs';

export class DrawScheduler {
  private intervals: NodeJS.Timeout[] = [];
  private isRunning = false;

  constructor() {
    this.setupScheduler();
  }

  private setupScheduler() {
    // Schedule automatic draw creation
    const drawCreationInterval = setInterval(() => {
      this.checkAndCreateNextDraw();
    }, 60000); // Check every minute

    // Schedule draw execution
    const drawExecutionInterval = setInterval(() => {
      this.checkAndExecuteDraws();
    }, 30000); // Check every 30 seconds

    // Schedule notification triggers
    const notificationInterval = setInterval(() => {
      this.checkAndSendNotifications();
    }, 60000); // Check every minute

    this.intervals.push(drawCreationInterval, drawExecutionInterval, notificationInterval);
    this.isRunning = true;
    console.log('[SCHEDULER] Draw scheduler started');
  }

  private async checkAndCreateNextDraw() {
    try {
      const currentDraw = await storage.getCurrentDraw();
      
      // If no current draw exists, create one
      if (!currentDraw) {
        await this.createNextScheduledDraw();
        return;
      }

      // If current draw is completed, create next one
      if (currentDraw.isCompleted) {
        await this.createNextScheduledDraw();
      }
    } catch (error) {
      console.error('[SCHEDULER] Error checking/creating next draw:', error);
    }
  }

  private async createNextScheduledDraw() {
    try {
      const allDraws = await storage.getAllDraws();
      const maxDrawNumber = allDraws.length > 0 
        ? Math.max(...allDraws.map(d => d.drawNumber)) 
        : 999;
      
      const nextDrawNumber = maxDrawNumber + 1;
      const nextDrawDate = this.calculateNextDrawDate();

      const newDraw = await storage.createDraw({
        drawNumber: nextDrawNumber,
        drawDate: nextDrawDate,
        jackpotAmount: "100000.00", // Starting jackpot
        isActive: true,
        isCompleted: false,
      });

      console.log(`[SCHEDULER] Automatically created draw #${nextDrawNumber} scheduled for ${nextDrawDate}`);
      return newDraw;
    } catch (error) {
      console.error('[SCHEDULER] Error creating scheduled draw:', error);
    }
  }

  private calculateNextDrawDate(): Date {
    const now = new Date();
    const drawConfig = config.draw;
    
    if (drawConfig.frequency === 'weekly') {
      const nextDraw = new Date();
      const currentDay = nextDraw.getDay();
      const targetDay = 5; // Friday (0=Sunday, 5=Friday)
      
      let daysUntilTarget = targetDay - currentDay;
      if (daysUntilTarget <= 0) {
        daysUntilTarget += 7; // Next week
      }
      
      nextDraw.setDate(nextDraw.getDate() + daysUntilTarget);
      nextDraw.setHours(20, 0, 0, 0); // 8 PM
      
      return nextDraw;
    }
    
    // Default: next day at 8 PM
    const nextDraw = new Date();
    nextDraw.setDate(nextDraw.getDate() + 1);
    nextDraw.setHours(20, 0, 0, 0);
    return nextDraw;
  }

  private async checkAndExecuteDraws() {
    try {
      const currentDraw = await storage.getCurrentDraw();
      if (!currentDraw || currentDraw.isCompleted) return;

      const now = new Date();
      const drawTime = new Date(currentDraw.drawDate);

      // If draw time has passed, execute the draw
      if (now >= drawTime) {
        console.log(`[SCHEDULER] Executing draw #${currentDraw.drawNumber}`);
        // Note: Actual draw execution requires winning numbers from admin
        // This would trigger completion when admin enters results
      }
    } catch (error) {
      console.error('[SCHEDULER] Error checking draw execution:', error);
    }
  }

  private async checkAndSendNotifications() {
    try {
      if (!config.notifications.sms.enabled) return;

      const currentDraw = await storage.getCurrentDraw();
      if (!currentDraw || currentDraw.isCompleted) return;

      const now = new Date();
      const drawTime = new Date(currentDraw.drawDate);
      const notificationTime = new Date(drawTime.getTime() - (5 * 60 * 1000)); // 5 minutes before

      // Send draw starting notifications
      if (now >= notificationTime && now < drawTime) {
        const lastNotificationKey = `draw_${currentDraw.id}_notification_sent`;
        
        // Simple check to avoid duplicate notifications (in production, use Redis or database)
        if (!global[lastNotificationKey]) {
          await smsService.notifyDrawStarting(currentDraw.id);
          global[lastNotificationKey] = true;
          console.log(`[SCHEDULER] Sent draw starting notifications for draw #${currentDraw.drawNumber}`);
        }
      }
    } catch (error) {
      console.error('[SCHEDULER] Error sending notifications:', error);
    }
  }

  public async triggerWinnerNotifications(drawId: number) {
    try {
      const winners = await storage.getDrawWinners(drawId);
      
      for (const winner of winners) {
        await smsService.notifyWinner(
          winner.user.id, 
          winner.winningAmount, 
          drawId
        );
      }
      
      console.log(`[SCHEDULER] Sent winner notifications for draw #${drawId} to ${winners.length} winners`);
    } catch (error) {
      console.error('[SCHEDULER] Error sending winner notifications:', error);
    }
  }

  public stop() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    this.isRunning = false;
    console.log('[SCHEDULER] Draw scheduler stopped');
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      activeIntervals: this.intervals.length,
      nextCheck: 'Every 30-60 seconds'
    };
  }
}

export const drawScheduler = new DrawScheduler();