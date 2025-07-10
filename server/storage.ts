import {
  users,
  draws,
  tickets,
  transactions,
  chatMessages,
  referrals,
  cryptoPayments,
  securityEvents,
  twoFactorAuth,
  systemSettings,
  adminWallets,
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
  type CryptoPayment,
  type InsertCryptoPayment,
  type SecurityEvent,
  type InsertSecurityEvent,
  type TwoFactorAuth,
  type InsertTwoFactorAuth,
  type SystemSetting,
  type InsertSystemSetting,
  type AdminWallet,
  type InsertAdminWallet,
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
  updateUser(userId: string, updates: Partial<User>): Promise<void>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;
  
  // Draw operations
  getCurrentDraw(): Promise<Draw | undefined>;
  getCompletedDraws(): Promise<Draw[]>;
  getAllDraws(): Promise<Draw[]>;
  getDraw(drawId: number): Promise<Draw | undefined>;
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

  // Crypto payment operations
  createCryptoPayment(payment: InsertCryptoPayment): Promise<CryptoPayment>;
  getCryptoPayment(paymentId: string): Promise<CryptoPayment | undefined>;
  updateCryptoPayment(paymentId: string, updates: Partial<CryptoPayment>): Promise<void>;
  getPendingCryptoPayments(): Promise<CryptoPayment[]>;
  getUserCryptoPayments(userId: string): Promise<CryptoPayment[]>;

  // Security operations
  createSecurityEvent(event: InsertSecurityEvent): Promise<SecurityEvent>;
  getSecurityEvents(limit?: number, severity?: string, userId?: string): Promise<SecurityEvent[]>;

  // Two factor auth operations
  createTwoFactorAuth(twoFA: InsertTwoFactorAuth): Promise<TwoFactorAuth>;
  getTwoFactorAuth(userId: string): Promise<TwoFactorAuth | undefined>;
  enableTwoFactorAuth(userId: string): Promise<void>;
  removeBackupCode(userId: string, code: string): Promise<void>;

  // System settings operations
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  setSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting>;
  getAllSystemSettings(): Promise<SystemSetting[]>;

  // Admin wallet operations
  getAdminWallets(): Promise<AdminWallet[]>;
  setAdminWallet(wallet: InsertAdminWallet): Promise<AdminWallet>;
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

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    await db
      .update(users)
      .set({ 
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        passwordHash: hashedPassword,
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

  async getDraw(drawId: number): Promise<Draw | undefined> {
    const [draw] = await db
      .select()
      .from(draws)
      .where(eq(draws.id, drawId))
      .limit(1);
    return draw;
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

  // Crypto payment operations
  async createCryptoPayment(paymentData: InsertCryptoPayment): Promise<CryptoPayment> {
    const [payment] = await db.insert(cryptoPayments).values(paymentData).returning();
    return payment;
  }

  async getCryptoPayment(paymentId: string): Promise<CryptoPayment | undefined> {
    const [payment] = await db.select().from(cryptoPayments).where(eq(cryptoPayments.id, paymentId));
    return payment;
  }

  async updateCryptoPayment(paymentId: string, updates: Partial<CryptoPayment>): Promise<void> {
    await db
      .update(cryptoPayments)
      .set(updates)
      .where(eq(cryptoPayments.id, paymentId));
  }

  async getPendingCryptoPayments(): Promise<CryptoPayment[]> {
    return db
      .select()
      .from(cryptoPayments)
      .where(eq(cryptoPayments.status, 'pending'))
      .orderBy(desc(cryptoPayments.submittedAt));
  }

  async getUserCryptoPayments(userId: string): Promise<CryptoPayment[]> {
    return db
      .select()
      .from(cryptoPayments)
      .where(eq(cryptoPayments.userId, userId))
      .orderBy(desc(cryptoPayments.submittedAt));
  }

  // Security operations
  async createSecurityEvent(eventData: InsertSecurityEvent): Promise<SecurityEvent> {
    const [event] = await db.insert(securityEvents).values(eventData).returning();
    return event;
  }

  async getSecurityEvents(limit = 100, severity?: string, userId?: string): Promise<SecurityEvent[]> {
    let query = db.select().from(securityEvents);

    if (severity) {
      query = query.where(eq(securityEvents.severity, severity));
    }
    
    if (userId) {
      query = query.where(eq(securityEvents.userId, userId));
    }

    return query
      .orderBy(desc(securityEvents.timestamp))
      .limit(limit);
  }

  // Two factor auth operations
  async createTwoFactorAuth(twoFAData: InsertTwoFactorAuth): Promise<TwoFactorAuth> {
    const [twoFA] = await db.insert(twoFactorAuth).values(twoFAData).returning();
    return twoFA;
  }

  async getTwoFactorAuth(userId: string): Promise<TwoFactorAuth | undefined> {
    const [twoFA] = await db.select().from(twoFactorAuth).where(eq(twoFactorAuth.userId, userId));
    return twoFA;
  }

  async enableTwoFactorAuth(userId: string): Promise<void> {
    await db
      .update(twoFactorAuth)
      .set({ 
        enabled: true,
        enabledAt: new Date()
      })
      .where(eq(twoFactorAuth.userId, userId));
  }

  async removeBackupCode(userId: string, code: string): Promise<void> {
    const twoFA = await this.getTwoFactorAuth(userId);
    if (twoFA) {
      const backupCodes = (twoFA.backupCodes as string[]).filter(c => c !== code);
      await db
        .update(twoFactorAuth)
        .set({ backupCodes })
        .where(eq(twoFactorAuth.userId, userId));
    }
  }

  // System settings operations
  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting;
  }

  async setSystemSetting(settingData: InsertSystemSetting): Promise<SystemSetting> {
    const [setting] = await db
      .insert(systemSettings)
      .values(settingData)
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: {
          value: settingData.value,
          description: settingData.description,
          updatedBy: settingData.updatedBy,
          updatedAt: new Date(),
        },
      })
      .returning();
    return setting;
  }

  async getAllSystemSettings(): Promise<SystemSetting[]> {
    return db.select().from(systemSettings).orderBy(systemSettings.key);
  }

  // Admin wallet operations
  async getAdminWallets(): Promise<AdminWallet[]> {
    return db
      .select()
      .from(adminWallets)
      .where(eq(adminWallets.isActive, true))
      .orderBy(adminWallets.currency);
  }

  async setAdminWallet(walletData: InsertAdminWallet): Promise<AdminWallet> {
    const [wallet] = await db
      .insert(adminWallets)
      .values(walletData)
      .onConflictDoUpdate({
        target: adminWallets.currency,
        set: {
          address: walletData.address,
          isActive: walletData.isActive,
          updatedAt: new Date(),
        },
      })
      .returning();
    return wallet;
  }

  // NOUVELLES MÉTHODES POUR LES STATISTIQUES DE TIRAGES
  async getDrawStats(drawId: number): Promise<{
    totalTickets: number;
    totalJackpot: string;
    winners: { matchCount: number; count: number; totalWinnings: string }[];
  }> {
    try {
      const draw = await this.getDraw(drawId);
      if (!draw) {
        return { totalTickets: 0, totalJackpot: "0.00", winners: [] };
      }

      const ticketStats = await db.select({ count: count() })
        .from(tickets)
        .where(eq(tickets.drawId, drawId));

      const totalTickets = ticketStats[0]?.count || 0;

      const winnersQuery = await db.select({
        matchCount: tickets.matchCount,
        count: count(),
        totalWinnings: sql<string>`COALESCE(SUM(${tickets.winningAmount}), '0.00')`.as('totalWinnings')
      })
      .from(tickets)
      .where(and(eq(tickets.drawId, drawId), sql`${tickets.matchCount} > 0`))
      .groupBy(tickets.matchCount);

      const winners = winnersQuery.map(w => ({
        matchCount: w.matchCount || 0,
        count: w.count,
        totalWinnings: w.totalWinnings || "0.00"
      }));

      return { totalTickets, totalJackpot: draw.jackpot || "0.00", winners };
    } catch (error) {
      console.error("Error getting draw stats:", error);
      return { totalTickets: 0, totalJackpot: "0.00", winners: [] };
    }
  }

  async getDrawWinners(drawId: number): Promise<{
    matchCount: number;
    user: { id: string; firstName: string; lastName: string; email: string };
    winningAmount: string;
    numbers: number[];
  }[]> {
    try {
      const winnersQuery = await db.select({
        matchCount: tickets.matchCount,
        winningAmount: tickets.winningAmount,
        numbers: tickets.numbers,
        userId: tickets.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.userId, users.id))
      .where(and(eq(tickets.drawId, drawId), sql`${tickets.matchCount} > 0`))
      .orderBy(desc(tickets.matchCount));

      return winnersQuery.map(w => ({
        matchCount: w.matchCount || 0,
        user: {
          id: w.userId,
          firstName: w.firstName || '',
          lastName: w.lastName || '',
          email: w.email || ''
        },
        winningAmount: w.winningAmount || "0.00",
        numbers: w.numbers || []
      }));
    } catch (error) {
      console.error("Error getting draw winners:", error);
      return [];
    }
  }

  async updateDrawWinningNumbers(drawId: number, winningNumbers: number[]): Promise<void> {
    try {
      await db.update(draws)
        .set({ 
          winningNumbers,
          updatedAt: new Date()
        })
        .where(eq(draws.id, drawId));
    } catch (error) {
      console.error("Error updating draw winning numbers:", error);
      throw error;
    }
  }

  async completeDraw(drawId: number): Promise<void> {
    try {
      await db.update(draws)
        .set({ 
          isCompleted: true,
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(draws.id, drawId));
    } catch (error) {
      console.error("Error completing draw:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
