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
  
  // Draw operations
  getCurrentDraw(): Promise<Draw | undefined>;
  getCompletedDraws(): Promise<Draw[]>;
  createDraw(draw: InsertDraw): Promise<Draw>;
  updateDrawWinningNumbers(drawId: number, winningNumbers: number[]): Promise<void>;
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
}

export const storage = new DatabaseStorage();
