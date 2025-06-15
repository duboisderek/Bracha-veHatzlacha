import {
  users,
  draws,
  tickets,
  transactions,
  chatMessages,
  referrals,
  type User,
  type UpsertUser,
  type Draw,
  type InsertDraw,
  type Ticket,
  type InsertTicket,
  type Transaction,
  type InsertTransaction,
  type ChatMessage,
  type InsertChatMessage,
  type Referral,
  type InsertReferral,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for auth)
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  updateUserBalance(userId: string, amount: string): Promise<void>;
  updateUserPhone(userId: string, phoneNumber: string): Promise<void>;
  
  // Draw operations
  getCurrentDraw(): Promise<Draw | undefined>;
  getCompletedDraws(): Promise<Draw[]>;
  getAllDraws(): Promise<Draw[]>;
  createDraw(draw: InsertDraw): Promise<Draw>;
  updateDrawWinningNumbers(drawId: number, winningNumbers: number[]): Promise<void>;
  updateDrawJackpot(drawId: number, additionalAmount: number): Promise<void>;
  completeDraw(drawId: number): Promise<void>;
  
  // Ticket operations
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  getUserTickets(userId: string, drawId?: number): Promise<Ticket[]>;
  getDrawTickets(drawId: number): Promise<Ticket[]>;
  updateTicketResults(ticketId: string, matchCount: number, winningAmount: string): Promise<void>;
  getUserHasTicketForDraw(userId: string, drawId: number): Promise<boolean>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  createAdminDeposit(userId: string, amount: string, comment: string): Promise<Transaction>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(limit?: number): Promise<ChatMessage[]>;
  
  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getUserReferrals(userId: string): Promise<Referral[]>;
  updateReferralDeposit(referralId: string): Promise<void>;
  
  // Stats operations
  getDrawStats(drawId: number): Promise<{
    totalTickets: number;
    totalJackpot: string;
    winners: { matchCount: number; count: number; totalWinnings: string }[];
  }>;
  getDrawWinners(drawId: number): Promise<{
    matchCount: number;
    user: { id: string; firstName: string; lastName: string; email: string };
    winningAmount: string;
    numbers: number[];
  }[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, referralCode));
    return user;
  }

  async updateUserBalance(userId: string, amount: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        balance: sql`${users.balance} + ${amount}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async updateUserPhone(userId: string, phoneNumber: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        phoneNumber,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Draw operations
  async getCurrentDraw(): Promise<Draw | undefined> {
    const [draw] = await db
      .select()
      .from(draws)
      .where(and(eq(draws.isActive, true), eq(draws.isCompleted, false)))
      .orderBy(desc(draws.drawDate))
      .limit(1);
    return draw;
  }

  async getCompletedDraws(): Promise<Draw[]> {
    return db
      .select()
      .from(draws)
      .where(eq(draws.isCompleted, true))
      .orderBy(desc(draws.drawDate))
      .limit(10);
  }

  async getAllDraws(): Promise<Draw[]> {
    return db
      .select()
      .from(draws)
      .orderBy(desc(draws.drawNumber));
  }

  async createDraw(drawData: InsertDraw): Promise<Draw> {
    const [draw] = await db.insert(draws).values(drawData).returning();
    return draw;
  }

  async updateDrawWinningNumbers(drawId: number, winningNumbers: number[]): Promise<void> {
    await db
      .update(draws)
      .set({ winningNumbers })
      .where(eq(draws.id, drawId));
  }

  async updateDrawJackpot(drawId: number, additionalAmount: number): Promise<void> {
    await db
      .update(draws)
      .set({ 
        jackpotAmount: sql`${draws.jackpotAmount} + ${additionalAmount.toFixed(2)}` 
      })
      .where(eq(draws.id, drawId));
  }

  async completeDraw(drawId: number): Promise<void> {
    await db
      .update(draws)
      .set({ isCompleted: true, isActive: false })
      .where(eq(draws.id, drawId));
  }

  // Ticket operations
  async createTicket(ticketData: InsertTicket): Promise<Ticket> {
    const [ticket] = await db.insert(tickets).values(ticketData).returning();
    return ticket;
  }

  async getUserTickets(userId: string, drawId?: number): Promise<Ticket[]> {
    let query = db.select().from(tickets).where(eq(tickets.userId, userId));
    
    if (drawId) {
      query = query.where(eq(tickets.drawId, drawId));
    }
    
    return query.orderBy(desc(tickets.createdAt));
  }

  async getDrawTickets(drawId: number): Promise<Ticket[]> {
    return db
      .select()
      .from(tickets)
      .where(eq(tickets.drawId, drawId))
      .orderBy(desc(tickets.createdAt));
  }

  async updateTicketResults(ticketId: string, matchCount: number, winningAmount: string): Promise<void> {
    await db
      .update(tickets)
      .set({ matchCount, winningAmount })
      .where(eq(tickets.id, ticketId));
  }

  async getUserHasTicketForDraw(userId: string, drawId: number): Promise<boolean> {
    const [result] = await db
      .select({ count: count() })
      .from(tickets)
      .where(and(eq(tickets.userId, userId), eq(tickets.drawId, drawId)));
    
    return result.count > 0;
  }

  // Transaction operations
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(transactionData).returning();
    
    // Check for first deposit tracking for referral bonuses
    if (transactionData.type === 'deposit') {
      const user = await this.getUser(transactionData.userId);
      if (user && user.referredBy) {
        // Check if this is the first deposit
        const previousDeposits = await db.select()
          .from(transactions)
          .where(and(
            eq(transactions.userId, transactionData.userId),
            eq(transactions.type, 'deposit')
          ));
        
        // If this is the first deposit and amount >= 1000₪
        if (previousDeposits.length === 1 && parseFloat(transactionData.amount) >= 1000) {
          // Award referral bonus
          const referrer = await this.getUser(user.referredBy);
          if (referrer) {
            await this.updateUserBalance(user.referredBy, "100");
            
            // Create referral bonus transaction
            await db.insert(transactions).values({
              userId: user.referredBy,
              type: 'referral_bonus',
              amount: "100",
              description: `First deposit referral bonus for ${user.firstName} ${user.lastName} (₪${transactionData.amount})`,
            });
          }
        }
      }
    }
    
    return transaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(50);
  }

  async createAdminDeposit(userId: string, amount: string, comment: string): Promise<Transaction> {
    // Create the transaction record
    const [transaction] = await db.insert(transactions).values({
      userId,
      type: "admin_deposit",
      amount,
      description: `Manual deposit by admin: ₪${amount}`,
      adminComment: comment,
    }).returning();

    // Update user balance (add full amount to user)
    await db
      .update(users)
      .set({ 
        balance: sql`${users.balance} + ${amount}` 
      })
      .where(eq(users.id, userId));

    // Update current draw jackpot (50% goes to next draw)
    const currentDraw = await this.getCurrentDraw();
    if (currentDraw) {
      const jackpotIncrease = (parseFloat(amount) * 0.5).toFixed(2);
      await db
        .update(draws)
        .set({ 
          jackpotAmount: sql`${draws.jackpotAmount} + ${jackpotIncrease}` 
        })
        .where(eq(draws.id, currentDraw.id));
    }

    return transaction;
  }

  // Chat operations
  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(messageData).returning();
    return message;
  }

  async getChatMessages(limit = 50): Promise<ChatMessage[]> {
    return db
      .select({
        id: chatMessages.id,
        userId: chatMessages.userId,
        message: chatMessages.message,
        isFromAdmin: chatMessages.isFromAdmin,
        createdAt: chatMessages.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.userId, users.id))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  // Referral operations
  async createReferral(referralData: InsertReferral): Promise<Referral> {
    const [referral] = await db.insert(referrals).values(referralData).returning();
    
    // Award referral bonus to referrer
    const referrer = await this.getUser(referralData.referrerId);
    if (referrer) {
      const bonusAmount = 100; // 100₪ bonus per referral
      await this.updateUserBalance(referralData.referrerId, bonusAmount.toString());
      
      // Create transaction for referral bonus
      await this.createTransaction({
        userId: referralData.referrerId,
        type: 'referral_bonus',
        amount: bonusAmount.toString(),
        description: `Referral bonus for inviting ${referralData.referredId}`,
      });
      
      // Check if referrer now has 5 or more referrals for 1000₪ bonus
      const referrerReferrals = await this.getUserReferrals(referralData.referrerId);
      const totalReferrals = referrerReferrals.length;
      
      // Award 1000₪ bonus after 5th referral (only once)
      if (totalReferrals === 5) {
        const bigBonusAmount = 1000; // 1000₪ bonus after 5 referrals
        await this.updateUserBalance(referralData.referrerId, bigBonusAmount.toString());
        
        // Create transaction for big referral bonus
        await this.createTransaction({
          userId: referralData.referrerId,
          type: 'referral_milestone_bonus',
          amount: bigBonusAmount.toString(),
          description: `Milestone bonus for reaching 5 referrals - ₪1000`,
        });
        
        // Update user's referral bonus total
        await db.update(users)
          .set({ 
            referralBonus: (parseFloat(referrer.referralBonus || '0') + bigBonusAmount).toString(),
            referralCount: totalReferrals
          })
          .where(eq(users.id, referralData.referrerId));
      } else {
        // Update referral count
        await db.update(users)
          .set({ 
            referralCount: totalReferrals
          })
          .where(eq(users.id, referralData.referrerId));
      }
    }
    
    return referral;
  }

  async getUserReferrals(userId: string): Promise<Referral[]> {
    return db
      .select({
        id: referrals.id,
        referrerId: referrals.referrerId,
        referredId: referrals.referredId,
        bonusAmount: referrals.bonusAmount,
        hasMadeDeposit: referrals.hasMadeDeposit,
        createdAt: referrals.createdAt,
        referredUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        }
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referredId, users.id))
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));
  }

  async updateReferralDeposit(referralId: string): Promise<void> {
    await db
      .update(referrals)
      .set({ hasMadeDeposit: true })
      .where(eq(referrals.id, referralId));
  }

  // Stats operations
  async getDrawStats(drawId: number): Promise<{
    totalTickets: number;
    totalJackpot: string;
    winners: { matchCount: number; count: number; totalWinnings: string }[];
  }> {
    const [drawInfo] = await db.select().from(draws).where(eq(draws.id, drawId));
    
    const [ticketCount] = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.drawId, drawId));

    const winners = await db
      .select({
        matchCount: tickets.matchCount,
        count: count(),
        totalWinnings: sql<string>`SUM(${tickets.winningAmount})`,
      })
      .from(tickets)
      .where(and(eq(tickets.drawId, drawId), sql`${tickets.matchCount} >= 4`))
      .groupBy(tickets.matchCount);

    return {
      totalTickets: ticketCount.count,
      totalJackpot: drawInfo?.jackpotAmount || "0",
      winners: winners.map(w => ({
        matchCount: w.matchCount || 0,
        count: w.count,
        totalWinnings: w.totalWinnings || "0",
      })),
    };
  }

  async getDrawWinners(drawId: number): Promise<{
    matchCount: number;
    user: { id: string; firstName: string; lastName: string; email: string };
    winningAmount: string;
    numbers: number[];
  }[]> {
    const winners = await db
      .select({
        ticketId: tickets.id,
        matchCount: tickets.matchCount,
        winningAmount: tickets.winningAmount,
        numbers: tickets.numbers,
        userId: tickets.userId,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.userId, users.id))
      .where(and(
        eq(tickets.drawId, drawId),
        sql`${tickets.matchCount} >= 4`,
        sql`${tickets.winningAmount} > 0`
      ))
      .orderBy(desc(tickets.matchCount), desc(tickets.winningAmount));

    return winners.map(winner => ({
      matchCount: winner.matchCount || 0,
      user: {
        id: winner.userId,
        firstName: winner.userFirstName || "Unknown",
        lastName: winner.userLastName || "User",
        email: winner.userEmail || "unknown@email.com",
      },
      winningAmount: winner.winningAmount || "0",
      numbers: winner.numbers as number[] || [],
    }));
  }
}

export const storage = new DatabaseStorage();
