import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  unique,
  uuid,
  type PgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phoneNumber: varchar("phone_number"),
  password: varchar("password"), // Added password field
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  totalWinnings: decimal("total_winnings", { precision: 10, scale: 2 }).default("0").notNull(),
  referralCode: varchar("referral_code").unique().notNull(),
  referredBy: varchar("referred_by"),
  referralBonus: decimal("referral_bonus", { precision: 10, scale: 2 }).default("0").notNull(),
  referralCount: integer("referral_count").default(0).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isRootAdmin: boolean("is_root_admin").default(false).notNull(),
  isBlocked: boolean("is_blocked").default(false).notNull(),
  isFictional: boolean("is_fictional").default(false).notNull(),
  language: varchar("language", { length: 5 }).default("en").notNull(),
  smsNotifications: boolean("sms_notifications").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Draws table
export const draws = pgTable("draws", {
  id: serial("id").primaryKey(),
  drawNumber: integer("draw_number").unique().notNull(),
  drawDate: timestamp("draw_date").notNull(),
  winningNumbers: jsonb("winning_numbers"), // array of 6 numbers
  jackpotAmount: decimal("jackpot_amount", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tickets table
export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  drawId: integer("draw_id").references(() => draws.id).notNull(),
  numbers: jsonb("numbers").notNull(), // array of 6 numbers
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  matchCount: integer("match_count").default(0),
  winningAmount: decimal("winning_amount", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.drawId), // One ticket per user per draw
]);

// Transactions table
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // 'deposit', 'ticket_purchase', 'winnings', 'referral_bonus', 'admin_deposit'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  ticketId: uuid("ticket_id").references(() => tickets.id),
  adminComment: text("admin_comment"), // For manual deposits by admin
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id),
  message: text("message").notNull(),
  isFromAdmin: boolean("is_from_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Referrals table
export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().defaultRandom(),
  referrerId: varchar("referrer_id").references(() => users.id).notNull(),
  referredId: varchar("referred_id").references(() => users.id).notNull(),
  bonusAmount: decimal("bonus_amount", { precision: 10, scale: 2 }).default("100").notNull(),
  hasMadeDeposit: boolean("has_made_deposit").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Crypto payments table
export const cryptoPayments = pgTable("crypto_payments", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  txHash: varchar("tx_hash").notNull(),
  walletAddress: varchar("wallet_address").notNull(),
  currency: varchar("currency").notNull(), // btc, eth, usdt, bnb
  status: varchar("status").notNull(), // pending, approved, rejected
  submittedAt: timestamp("submitted_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  processedBy: varchar("processed_by").references(() => users.id),
  notes: text("notes"),
});

// Security events table
export const securityEvents = pgTable("security_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id),
  event: varchar("event").notNull(),
  ip: varchar("ip").notNull(),
  userAgent: text("user_agent").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  severity: varchar("severity").notNull(), // low, medium, high, critical
  blocked: boolean("blocked").default(false).notNull(),
  details: jsonb("details"),
});

// Two factor auth table
export const twoFactorAuth = pgTable("two_factor_auth", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  secret: varchar("secret").notNull(),
  enabled: boolean("enabled").default(false).notNull(),
  backupCodes: jsonb("backup_codes").notNull(), // array of backup codes
  createdAt: timestamp("created_at").defaultNow(),
  enabledAt: timestamp("enabled_at"),
});

// System settings table
export const systemSettings = pgTable("system_settings", {
  key: varchar("key").primaryKey(),
  value: text("value").notNull(),
  description: text("description"),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin wallet addresses table
export const adminWallets = pgTable("admin_wallets", {
  currency: varchar("currency").primaryKey(), // btc, eth, usdt, bnb
  address: varchar("address").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  tickets: many(tickets),
  transactions: many(transactions),
  chatMessages: many(chatMessages),
  referralsGiven: many(referrals, { relationName: "referrer" }),
  referralsReceived: many(referrals, { relationName: "referred" }),
  referrer: one(users, {
    fields: [users.referredBy],
    references: [users.id],
  }),
}));

export const drawsRelations = relations(draws, ({ many }) => ({
  tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  user: one(users, {
    fields: [tickets.userId],
    references: [users.id],
  }),
  draw: one(draws, {
    fields: [tickets.drawId],
    references: [draws.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  ticket: one(tickets, {
    fields: [transactions.ticketId],
    references: [tickets.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  referred: one(users, {
    fields: [referrals.referredId],
    references: [users.id],
    relationName: "referred",
  }),
}));

export const cryptoPaymentsRelations = relations(cryptoPayments, ({ one }) => ({
  user: one(users, {
    fields: [cryptoPayments.userId],
    references: [users.id],
  }),
  processedByUser: one(users, {
    fields: [cryptoPayments.processedBy],
    references: [users.id],
  }),
}));

export const securityEventsRelations = relations(securityEvents, ({ one }) => ({
  user: one(users, {
    fields: [securityEvents.userId],
    references: [users.id],
  }),
}));

export const twoFactorAuthRelations = relations(twoFactorAuth, ({ one }) => ({
  user: one(users, {
    fields: [twoFactorAuth.userId],
    references: [users.id],
  }),
}));

// Insert schemas - Corrected types
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertDrawSchema = createInsertSchema(draws).omit({
  id: true,
  createdAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  matchCount: true,
  winningAmount: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export const insertCryptoPaymentSchema = createInsertSchema(cryptoPayments).omit({
  submittedAt: true,
  processedAt: true,
});

export const insertSecurityEventSchema = createInsertSchema(securityEvents).omit({
  id: true,
  timestamp: true,
});

export const insertTwoFactorAuthSchema = createInsertSchema(twoFactorAuth).omit({
  createdAt: true,
  enabledAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  updatedAt: true,
});

export const insertAdminWalletSchema = createInsertSchema(adminWallets).omit({
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Draw = typeof draws.$inferSelect;
export type InsertDraw = z.infer<typeof insertDrawSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type CryptoPayment = typeof cryptoPayments.$inferSelect;
export type InsertCryptoPayment = z.infer<typeof insertCryptoPaymentSchema>;
export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = z.infer<typeof insertSecurityEventSchema>;
export type TwoFactorAuth = typeof twoFactorAuth.$inferSelect;
export type InsertTwoFactorAuth = z.infer<typeof insertTwoFactorAuthSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type AdminWallet = typeof adminWallets.$inferSelect;
export type InsertAdminWallet = z.infer<typeof insertAdminWalletSchema>;
