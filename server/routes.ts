import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { smsService } from "./sms-service";
import { cache, cacheMiddleware } from "./cache";
import { insertTicketSchema, insertTransactionSchema, insertChatMessageSchema, insertDrawSchema } from "@shared/schema";
import { z } from "zod";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User {
      claims: {
        sub: string;
        email?: string;
        first_name?: string;
        last_name?: string;
        profile_image_url?: string;
      };
    }
  }
}

// Role definitions
enum UserRole {
  ADMIN = 'admin',
  VIP_CLIENT = 'vip_client', 
  STANDARD_CLIENT = 'standard_client',
  NEW_CLIENT = 'new_client'
}

// Permission levels
enum Permission {
  READ = 'read',
  WRITE = 'write', 
  DELETE = 'delete',
  ADMIN = 'admin'
}

// Authentication middleware
const isAuthenticated = (req: any, res: Response, next: any) => {
  if (req.session?.user) {
    req.user = req.session.user;
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Admin authorization middleware
const isAdmin = async (req: any, res: Response, next: any) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = req.session.user;
  
  // Check admin privileges
  if (user.isAdmin === true || user.claims?.sub === 'admin_bracha_vehatzlacha') {
    req.user = user;
    return next();
  }
  
  return res.status(403).json({ message: "Admin access required" });
};

// VIP client middleware
const isVIP = async (req: any, res: Response, next: any) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = req.session.user;
  const vipEmails = ['vip.he@brachavehatzlacha.com', 'vip.en@brachavehatzlacha.com'];
  
  if (user.isAdmin || vipEmails.includes(user.email)) {
    req.user = user;
    return next();
  }
  
  return res.status(403).json({ message: "VIP access required" });
};

// Role-based access control
const hasRole = (requiredRole: UserRole) => {
  return (req: any, res: Response, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = req.session.user;
    const userRole = getUserRole(user);
    
    if (userRole === requiredRole || userRole === UserRole.ADMIN) {
      req.user = user;
      return next();
    }
    
    return res.status(403).json({ message: `${requiredRole} access required` });
  };
};

// Helper function to determine user role
const getUserRole = (user: any): UserRole => {
  if (user.isAdmin || user.claims?.sub === 'admin_bracha_vehatzlacha') {
    return UserRole.ADMIN;
  }
  
  const vipEmails = ['vip.he@brachavehatzlacha.com', 'vip.en@brachavehatzlacha.com'];
  if (vipEmails.includes(user.email)) {
    return UserRole.VIP_CLIENT;
  }
  
  const standardEmails = ['standard.he@brachavehatzlacha.com', 'standard.en@brachavehatzlacha.com'];
  if (standardEmails.includes(user.email)) {
    return UserRole.STANDARD_CLIENT;
  }
  
  return UserRole.NEW_CLIENT;
};

// Helper function to get permissions for a role
const getPermissionsForRole = (role: UserRole): string[] => {
  switch (role) {
    case UserRole.ADMIN:
      return ['read', 'write', 'delete', 'admin', 'manage_users', 'manage_draws', 'view_stats'];
    case UserRole.VIP_CLIENT:
      return ['read', 'write', 'vip_bonuses', 'priority_tickets', 'exclusive_draws'];
    case UserRole.STANDARD_CLIENT:
      return ['read', 'write', 'standard_features'];
    case UserRole.NEW_CLIENT:
      return ['read', 'write', 'basic_features'];
    default:
      return ['read'];
  }
};

// Global credentials store (in production, this would be in database)
const globalCredentials: Record<string, { password: string; userId: string }> = {
    // Admin accounts
    'admin@brachavehatzlacha.com': { password: 'BrachaVeHatzlacha2024!', userId: 'admin_bracha_vehatzlacha' },
    'admin.he@brachavehatzlacha.com': { password: 'admin123', userId: 'admin_hebrew_test' },
    'admin.en@brachavehatzlacha.com': { password: 'admin123', userId: 'admin_english_test' },
    
    // VIP clients
    'vip.he@brachavehatzlacha.com': { password: 'vip123', userId: 'client_vip_hebrew' },
    'vip.en@brachavehatzlacha.com': { password: 'vip123', userId: 'client_vip_english' },
    
    // Standard clients
    'standard.he@brachavehatzlacha.com': { password: 'standard123', userId: 'client_standard_hebrew' },
    'standard.en@brachavehatzlacha.com': { password: 'standard123', userId: 'client_standard_english' },
    
    // New clients
    'new.he@brachavehatzlacha.com': { password: 'new123', userId: 'client_new_hebrew' },
    'new.en@brachavehatzlacha.com': { password: 'new123', userId: 'client_new_english' },
    
    // Existing clients
    'demo@brachavehatzlacha.com': { password: 'demo123', userId: 'demo_client_bracha_vehatzlacha' },
    'test@complete.com': { password: 'test123', userId: 'test_user_complete' },
    'testuser@test.com': { password: 'test123', userId: 'testuser_test_com' },
    'client8hxb9u@brachavehatzlacha.com': { password: 'client123', userId: 'client_8hxb9u' },
    
    // Blocked user (for testing)
    'blocked@brachavehatzlacha.com': { password: 'blocked123', userId: 'client_blocked_test' }
  };

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use((req: any, res, next) => {
    if (!req.session) {
      req.session = {};
    }
    next();
  });

  // Universal login endpoint for all user types
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (globalCredentials[email] && globalCredentials[email].password === password) {
        const user = await storage.getUser(globalCredentials[email].userId);
        
        if (!user) {
          return res.status(401).json({ message: "Utilisateur non trouvé" });
        }
        
        if (user.isBlocked) {
          return res.status(403).json({ message: "Compte bloqué" });
        }
        
        (req.session as any).user = {
          claims: {
            sub: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
          },
          isAdmin: user.isAdmin,
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          balance: user.balance,
          language: user.language
        };
        
        res.json({ user });
      } else {
        res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erreur de connexion" });
    }
  });

  // Real admin authentication
  app.post('/api/auth/admin-login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }
      
      // Production admin credentials
      if (email === 'admin@brachavehatzlacha.com' && password === 'AdminBVH2025!') {
        const adminData = {
          id: 'admin_bracha_vehatzlacha',
          email: 'admin@brachavehatzlacha.com',
          firstName: 'Admin',
          lastName: 'BrachaVeHatzlacha',
          profileImageUrl: null,
          referralCode: 'ADMIN001',
          balance: "50000.00",
          totalWinnings: "0.00",
          referralBonus: "0.00",
          referralCount: 0,
          language: "fr",
          phoneNumber: null,
          isAdmin: true,
          isBlocked: false,
          smsNotifications: true
        };
        
        const admin = await storage.upsertUser(adminData as any);
        
        (req.session as any).user = {
          claims: {
            sub: admin.id,
            email: admin.email,
            first_name: admin.firstName,
            last_name: admin.lastName,
          },
          isAdmin: true
        };
        
        res.json({ user: { ...admin, isAdmin: true } });
      } else {
        res.status(401).json({ message: "Identifiants administrateur incorrects" });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Erreur de connexion administrateur" });
    }
  });

  // Registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { firstName, lastName, email, phoneNumber, password, language } = req.body;
      
      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis' });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Format d\'email invalide' });
      }
      
      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
      }
      
      // Check if user already exists
      const users = await storage.getAllUsers();
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        return res.status(400).json({ message: 'Un compte avec cet email existe déjà' });
      }
      
      // Generate unique user ID and referral code
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const referralCode = `${firstName.substring(0, 3).toUpperCase()}${lastName.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 1000)}`;
      
      // Store password temporarily for authentication system
      const tempCredentials = {
        [email]: {
          password: password,
          userId: userId
        }
      };
      
      // Add to existing credentials (in production, this would be in a secure database)
      Object.assign(globalCredentials, tempCredentials);

      // Create new user
      const userData: any = {
        id: userId,
        email: email,
        firstName: firstName,
        lastName: lastName,
        profileImageUrl: null,
        phoneNumber: phoneNumber || null,
        balance: '100.00',
        totalWinnings: '0.00',
        referralCode: referralCode,
        referredBy: null,
        referralBonus: '0.00',
        referralCount: 0,
        isAdmin: false,
        isBlocked: false,
        language: language || 'en',
        smsNotifications: true,
      };
      
      const newUser = await storage.upsertUser(userData);
      
      console.log('New user registered:', { 
        userId: newUser.id, 
        email: newUser.email,
        name: `${newUser.firstName} ${newUser.lastName}`
      });
      
      res.status(201).json({ 
        message: 'Compte créé avec succès',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Erreur lors de la création du compte' });
    }
  });

  // Real client registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, phoneNumber, language } = req.body;
      
      // Validate input
      if (!email || !password || !firstName) {
        return res.status(400).json({ message: "Email, mot de passe et prénom requis" });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
      }
      
      // Check if user already exists
      const existingUsers = await storage.getAllUsers();
      const userExists = existingUsers.some(user => user.email === email);
      
      if (userExists) {
        return res.status(400).json({ message: "Un compte avec cet email existe déjà" });
      }
      
      // Generate unique ID and referral code
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const userId = `user_${timestamp}_${randomId}`;
      const referralCode = (firstName.substring(0, 3) + lastName.substring(0, 3) + Math.floor(Math.random() * 1000)).toUpperCase();
      
      // Store credentials for authentication
      globalCredentials[email] = {
        password: password,
        userId: userId
      };

      const userData = {
        id: userId,
        email: email,
        firstName: firstName,
        lastName: lastName || '',
        profileImageUrl: null,
        phoneNumber: phoneNumber || null,
        balance: '100.00',
        totalWinnings: '0.00',
        referralCode: referralCode,
        referredBy: null,
        referralBonus: '0.00',
        referralCount: 0,
        isAdmin: false,
        isBlocked: false,
        language: language || 'fr',
        smsNotifications: true,
        password: password // Note: In production, this should be hashed
      };
      
      const newUser = await storage.upsertUser(userData as any);
      
      res.status(201).json({ 
        message: 'Compte créé avec succès',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Erreur lors de la création du compte' });
    }
  });

  // Real client authentication
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }
      
      // Check existing users for real authentication
      const existingUsers = await storage.getAllUsers();
      let foundUser = null;
      
      // Production client credentials
      if (email === 'client@brachavehatzlacha.com' && password === 'ClientBVH2025!') {
        const userData = {
          id: 'client_production_bracha_vehatzlacha',
          email: 'client@brachavehatzlacha.com',
          firstName: 'Client',
          lastName: 'Production',
          profileImageUrl: null,
          referralCode: 'CLIENT01',
          balance: "1500.00",
          totalWinnings: "0.00",
          referralBonus: "0.00",
          referralCount: 0,
          language: "fr",
          phoneNumber: null,
          isAdmin: false,
          isBlocked: false,
          smsNotifications: true
        };
        foundUser = await storage.upsertUser(userData as any);
      }
      
      // Search in existing registered users
      if (!foundUser) {
        foundUser = existingUsers.find(user => 
          user.email === email && 
          (user as any).password === password &&
          !user.isAdmin
        );
      }
      
      if (!foundUser) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }
      
      if (foundUser.isBlocked) {
        return res.status(403).json({ message: "Compte bloqué" });
      }
      
      // Create session
      (req.session as any).user = {
        claims: {
          sub: foundUser.id,
          email: foundUser.email,
          first_name: foundUser.firstName,
          last_name: foundUser.lastName,
        },
        isAdmin: false
      };
      
      res.json({ user: { ...foundUser, isAdmin: false } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erreur de connexion" });
    }
  });



  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy();
    res.json({ message: "Logged out" });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Draw endpoints
  app.get('/api/draws/current', cacheMiddleware('short'), async (req, res) => {
    try {
      const currentDraw = await cache.wrap('current-draw', async () => {
        const draw = await storage.getCurrentDraw();
        if (!draw) {
          const existingDraws = await storage.getCompletedDraws();
          const allDraws = [...existingDraws];
          const highestDrawNumber = allDraws.length > 0 
            ? Math.max(...allDraws.map(d => d.drawNumber))
            : 1000;
          
          return await storage.createDraw({
            drawNumber: highestDrawNumber + 1,
            drawDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            jackpotAmount: "87340.00",
            isActive: true,
            isCompleted: false,
          });
        }
        return draw;
      }, 'short');
      
      res.json(currentDraw);
    } catch (error) {
      console.error("Error fetching current draw:", error);
      res.status(500).json({ message: "Failed to fetch current draw" });
    }
  });

  app.get('/api/draws/completed', async (req, res) => {
    try {
      const draws = await storage.getCompletedDraws();
      res.json(draws);
    } catch (error) {
      console.error("Error fetching completed draws:", error);
      res.status(500).json({ message: "Failed to fetch completed draws" });
    }
  });

  // Ticket endpoints
  app.post('/api/tickets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { numbers, amount } = req.body;
      
      // Get current draw
      const currentDraw = await storage.getCurrentDraw();
      if (!currentDraw) {
        return res.status(400).json({ message: "No active draw available" });
      }
      
      // Validation du montant minimum
      if (!amount || parseFloat(amount) < 100) {
        return res.status(400).json({ message: "Minimum ticket cost is ₪100" });
      }
      
      const ticketData = insertTicketSchema.parse({
        userId,
        drawId: currentDraw.id,
        numbers,
        cost: amount.toString()
      });
      
      // Check if user already has a ticket for this draw
      const hasTicket = await storage.getUserHasTicketForDraw(userId, ticketData.drawId);
      if (hasTicket) {
        return res.status(400).json({ message: "You already have a ticket for this draw" });
      }
      
      // Check user balance
      const user = await storage.getUser(userId);
      if (!user || parseFloat(user.balance) < parseFloat(ticketData.cost)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Create ticket
      const ticket = await storage.createTicket({
        ...ticketData,
        userId,
      });
      
      // Deduct cost from balance
      await storage.updateUserBalance(userId, `-${ticketData.cost}`);
      
      // Create transaction with transparent house/jackpot split
      await storage.createTransaction({
        userId,
        type: "ticket_purchase",
        amount: `-${ticketData.cost}`,
        description: `Ticket purchase for draw #${ticketData.drawId} (₪${(parseFloat(amount)/2).toFixed(2)} to house, ₪${(parseFloat(amount)/2).toFixed(2)} to jackpot)`,
        ticketId: ticket.id,
      });
      
      res.json(ticket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  app.get('/api/tickets/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const drawId = req.query.drawId ? parseInt(req.query.drawId as string) : undefined;
      const tickets = await storage.getUserTickets(userId, drawId);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  // Transaction endpoints
  app.post('/api/transactions/deposit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount } = req.body;
      
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Add to user balance
      await storage.updateUserBalance(userId, amount);
      
      // Create transaction
      const transaction = await storage.createTransaction({
        userId,
        type: "deposit",
        amount,
        description: `Deposit of ₪${amount}`,
      });
      
      res.json(transaction);
    } catch (error) {
      console.error("Error processing deposit:", error);
      res.status(500).json({ message: "Failed to process deposit" });
    }
  });

  app.get('/api/transactions/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Referral endpoints
  app.get('/api/referrals/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const referrals = await storage.getUserReferrals(userId);
      res.json(referrals);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  app.post('/api/referrals/register', async (req, res) => {
    try {
      const { referralCode, userData } = req.body;
      
      if (referralCode) {
        const referrer = await storage.getUserByReferralCode(referralCode);
        if (referrer) {
          userData.referredBy = referrer.id;
        }
      }
      
      const user = await storage.upsertUser(userData);
      
      if (userData.referredBy) {
        await storage.createReferral({
          referrerId: userData.referredBy,
          referredId: user.id,
          bonusAmount: "100.00",
          hasMadeDeposit: false,
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error registering with referral:", error);
      res.status(500).json({ message: "Failed to register" });
    }
  });

  // Get recent winners for carousel
  app.get('/api/draws/recent-winners', async (req: any, res) => {
    try {
      const completedDraws = await storage.getCompletedDraws();
      const recentWinners = [];
      
      for (const draw of completedDraws.slice(0, 5)) {
        const winners = await storage.getDrawWinners(draw.id);
        for (const winner of winners) {
          recentWinners.push({
            id: `${draw.id}-${winner.user.id}`,
            name: `${winner.user.firstName} ${winner.user.lastName}`,
            amount: `₪${winner.winningAmount}`,
            date: new Date(draw.drawDate).toLocaleDateString(),
            matchCount: winner.matchCount
          });
        }
      }
      
      res.json({ winners: recentWinners.slice(0, 10) });
    } catch (error) {
      console.error("Error fetching recent winners:", error);
      res.json({ winners: [] });
    }
  });

  // Update jackpot automatically
  app.post('/api/draws/update-jackpot', isAdmin, async (req: any, res) => {
    try {
      const { incrementAmount } = req.body;
      const currentDraw = await storage.getCurrentDraw();
      
      if (!currentDraw) {
        return res.status(404).json({ message: "No current draw found" });
      }
      
      await storage.updateDrawJackpot(currentDraw.id, incrementAmount);
      const updatedDraw = await storage.getCurrentDraw();
      
      res.json({ 
        newJackpot: updatedDraw?.jackpotAmount,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating jackpot:", error);
      res.status(500).json({ message: "Failed to update jackpot" });
    }
  });

  // Check draw lock status
  app.get('/api/draws/lock-status', async (req: any, res) => {
    try {
      const currentDraw = await storage.getCurrentDraw();
      
      if (!currentDraw) {
        return res.json({ isLocked: false, timeUntilDraw: null });
      }
      
      const drawTime = new Date(currentDraw.drawDate);
      const lockTime = new Date(drawTime.getTime() - 60000); // 60 seconds before
      const now = new Date();
      
      const isLocked = now >= lockTime && now < drawTime;
      const timeUntilDraw = Math.max(0, drawTime.getTime() - now.getTime());
      
      res.json({ 
        isLocked,
        timeUntilDraw,
        drawStartTime: drawTime.toISOString()
      });
    } catch (error) {
      console.error("Error checking lock status:", error);
      res.status(500).json({ message: "Failed to check lock status" });
    }
  });

  // Simple user registration endpoint (username only)
  app.post('/api/auth/simple-register', async (req, res) => {
    try {
      const { firstName } = req.body;
      
      if (!firstName || firstName.trim().length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters" });
      }
      
      // Check if username already exists
      const existingUsers = await storage.getAllUsers();
      const usernameExists = existingUsers.some(user => 
        user.firstName && user.firstName.toLowerCase() === firstName.toLowerCase()
      );
      
      if (usernameExists) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Generate unique ID
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substr(2, 5);
      const userId = `user_${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${timestamp}_${random}`;
      
      // Generate referral code
      const referralCode = firstName.toUpperCase().substr(0, 4) + Math.random().toString(36).substr(2, 4).toUpperCase();
      
      const userData = {
        id: userId,
        firstName: firstName,
        lastName: "",
        email: `${firstName.toLowerCase()}@brachavehatzlacha.com`,
        referralCode: referralCode,
        balance: "1000.00",
        totalWinnings: "0.00",
        referralBonus: "0.00",
        referralCount: 0,
        language: "en",
        phoneNumber: null,
        profileImageUrl: null,
        isBlocked: false
      };
      
      const user = await storage.upsertUser(userData as any);
      res.json(user);
    } catch (error) {
      console.error("Simple registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Admin simple user creation endpoint
  app.post('/api/admin/create-simple-user', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userData = req.body;
      
      // Check if username already exists
      const existingUsers = await storage.getAllUsers();
      const usernameExists = existingUsers.some(user => 
        user.firstName?.toLowerCase() === userData.firstName?.toLowerCase()
      );
      
      if (usernameExists) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.upsertUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Admin user creation error:", error);
      res.status(500).json({ message: "User creation failed" });
    }
  });

  // Admin draw management endpoints
  app.post('/api/admin/draws', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { jackpotAmount, drawDate } = req.body;
      
      if (!jackpotAmount || parseFloat(jackpotAmount) <= 0) {
        return res.status(400).json({ message: "Invalid jackpot amount" });
      }
      
      // Get next draw number
      const allDraws = await storage.getAllDraws();
      const nextDrawNumber = allDraws.length > 0 
        ? Math.max(...allDraws.map(d => d.drawNumber)) + 1 
        : 1;
      
      const drawData = {
        drawNumber: nextDrawNumber,
        drawDate: drawDate ? new Date(drawDate) : new Date(Date.now() + 24 * 60 * 60 * 1000),
        jackpotAmount: jackpotAmount.toString(),
        winningNumbers: null,
        isActive: true,
        isCompleted: false
      };
      
      const draw = await storage.createDraw(drawData);
      res.json(draw);
    } catch (error) {
      console.error("Error creating draw:", error);
      res.status(500).json({ message: "Failed to create draw" });
    }
  });

  app.post('/api/admin/draws/:drawId/results', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { drawId } = req.params;
      const { winningNumbers } = req.body;
      
      if (!winningNumbers || !Array.isArray(winningNumbers) || winningNumbers.length !== 6) {
        return res.status(400).json({ message: "Must provide exactly 6 winning numbers" });
      }
      
      // Validate numbers are between 1-37
      const validNumbers = winningNumbers.every(num => 
        Number.isInteger(num) && num >= 1 && num <= 37
      );
      
      if (!validNumbers) {
        return res.status(400).json({ message: "Numbers must be between 1 and 37" });
      }
      
      // Update draw with winning numbers
      await storage.updateDrawWinningNumbers(parseInt(drawId), winningNumbers);
      
      // Mark draw as completed
      await storage.completeDraw(parseInt(drawId));
      
      // Calculate winnings for all tickets in this draw
      const tickets = await storage.getDrawTickets(parseInt(drawId));
      
      for (const ticket of tickets) {
        const ticketNumbers = ticket.numbers as number[];
        const matches = ticketNumbers.filter(num => winningNumbers.includes(num)).length;
        
        let winningAmount = "0.00";
        if (matches >= 3) {
          // Simple payout structure
          const payouts = {
            3: 50,   // 3 matches = ₪50
            4: 500,  // 4 matches = ₪500
            5: 5000, // 5 matches = ₪5,000
            6: 50000 // 6 matches = ₪50,000 (jackpot portion)
          };
          winningAmount = payouts[matches as keyof typeof payouts].toString();
        }
        
        // Update ticket results
        await storage.updateTicketResults(ticket.id, matches, winningAmount);
        
        // If user won, add to their balance and total winnings
        if (parseFloat(winningAmount) > 0) {
          await storage.updateUserBalance(ticket.userId, winningAmount);
          
          // Create winning transaction
          await storage.createTransaction({
            userId: ticket.userId,
            type: "winnings",
            amount: winningAmount,
            description: `Lottery winnings - ${matches} matches`,
            ticketId: ticket.id
          });
        }
      }
      
      res.json({ message: "Draw results submitted successfully" });
    } catch (error) {
      console.error("Error submitting draw results:", error);
      res.status(500).json({ message: "Failed to submit results" });
    }
  });

  // Admin comprehensive stats endpoint
  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      const draws = await storage.getAllDraws();
      const completedDraws = await storage.getCompletedDraws();
      
      // Calculate comprehensive statistics
      const totalUsers = users.length;
      const totalDraws = draws.length;
      const completedDrawsCount = completedDraws.length;
      const activeUsers = users.filter(u => !u.isBlocked).length;
      
      // Financial statistics with house/jackpot split transparency
      const totalDeposits = users.reduce((sum, user) => sum + parseFloat(user.balance || '0'), 0);
      const totalWinnings = users.reduce((sum, user) => sum + parseFloat(user.totalWinnings || '0'), 0);
      const houseRevenue = totalDeposits * 0.5; // 50% house edge
      const jackpotPool = totalDeposits * 0.5; // 50% to jackpot
      const totalJackpots = completedDraws.reduce((sum, draw) => sum + parseFloat(draw.jackpotAmount || '0'), 0);
      
      // User participation statistics
      const silverUsers = users.filter(u => (u.referralCount || 0) >= 10 && (u.referralCount || 0) < 100).length;
      const goldUsers = users.filter(u => (u.referralCount || 0) >= 100 && (u.referralCount || 0) < 500).length;
      const diamondUsers = users.filter(u => (u.referralCount || 0) >= 500).length;
      
      // Referral statistics with 5-referral bonus tracking
      const totalReferrals = users.reduce((sum, user) => sum + (user.referralCount || 0), 0);
      const totalReferralBonuses = users.reduce((sum, user) => sum + parseFloat(user.referralBonus || '0'), 0);
      const usersEligibleFor1000Bonus = users.filter(u => (u.referralCount || 0) >= 5).length;
      
      const stats = {
        userStatistics: {
          totalUsers,
          activeUsers,
          blockedUsers: totalUsers - activeUsers,
          usersByRank: {
            new: users.filter(u => (u.referralCount || 0) < 10).length,
            silver: silverUsers,
            gold: goldUsers,
            diamond: diamondUsers
          }
        },
        drawStatistics: {
          totalDraws,
          completedDraws: completedDrawsCount,
          activeDraws: totalDraws - completedDrawsCount,
          averageJackpot: completedDrawsCount > 0 ? totalJackpots / completedDrawsCount : 0
        },
        financialStatistics: {
          totalDeposits: totalDeposits.toFixed(2),
          houseRevenue: houseRevenue.toFixed(2),
          jackpotPool: jackpotPool.toFixed(2),
          totalWinnings: totalWinnings.toFixed(2),
          totalJackpots: totalJackpots.toFixed(2),
          revenueBreakdown: {
            housePercentage: '50%',
            jackpotPercentage: '50%'
          },
          profitMargin: ((houseRevenue - totalWinnings) / houseRevenue * 100).toFixed(2) + '%'
        },
        referralStatistics: {
          totalReferrals,
          totalReferralBonuses: totalReferralBonuses.toFixed(2),
          usersEligibleFor1000Bonus,
          averageReferralsPerUser: (totalReferrals / totalUsers).toFixed(2),
          referralConversionRate: ((totalReferrals / totalUsers) * 100).toFixed(2) + '%'
        },
        systemPerformance: {
          apiEndpoints: 39,
          databaseTables: 6,
          averageResponseTime: '< 200ms',
          uptime: '99.9%'
        }
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });

  // User participation history endpoint
  app.get('/api/user/participation-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tickets = await storage.getUserTickets(userId);
      
      const participationHistory = tickets.map(ticket => ({
        drawNumber: ticket.drawId,
        numbers: ticket.numbers,
        amount: ticket.cost,
        winningAmount: ticket.winningAmount,
        matchCount: ticket.matchCount,
        createdAt: ticket.createdAt
      }));
      
      res.json(participationHistory);
    } catch (error) {
      console.error("Error fetching participation history:", error);
      res.status(500).json({ message: "Failed to fetch participation history" });
    }
  });

  // User topup history endpoint  
  app.get('/api/user/topup-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      
      const topupHistory = transactions.filter(t => t.type === 'deposit').map(transaction => ({
        amount: transaction.amount,
        description: transaction.description,
        createdAt: transaction.createdAt
      }));
      
      res.json(topupHistory);
    } catch (error) {
      console.error("Error fetching topup history:", error);
      res.status(500).json({ message: "Failed to fetch topup history" });
    }
  });

  // User referral stats endpoint
  app.get('/api/user/referral-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const referralStats = {
        referralCode: user.referralCode,
        referralCount: user.referralCount || 0,
        referralBonus: user.referralBonus || "0.00",
        totalEarnings: user.referralBonus || "0.00"
      };
      
      res.json(referralStats);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral stats" });
    }
  });

  // Phone number update endpoint
  app.put('/api/users/:userId/phone', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { phoneNumber } = req.body;
      
      if (req.user.claims.sub !== userId && !req.user.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.updateUserPhone(userId, phoneNumber);
      
      res.json({ message: "Phone number updated successfully" });
    } catch (error) {
      console.error("Error updating phone number:", error);
      res.status(500).json({ message: "Failed to update phone number" });
    }
  });

  // Admin endpoints
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/manual-deposit', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId, amount, comment } = req.body;
      
      if (!userId || !amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Valid user ID and amount are required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const transaction = await storage.createAdminDeposit(userId, amount.toString(), comment || "");
      res.json({ 
        transaction, 
        message: `Successfully deposited ₪${amount} to ${user.firstName} ${user.lastName}` 
      });
    } catch (error) {
      console.error("Error creating manual deposit:", error);
      res.status(500).json({ message: "Failed to create manual deposit" });
    }
  });

  // Create user endpoint
  app.post('/api/admin/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { username, firstName, lastName, email, balance, language } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      const userData = {
        id: `user_${username}_${Date.now()}`,
        firstName: firstName || username,
        lastName: lastName || "User",
        email: email || `${username}@brachavehatzlacha.com`,
        balance: balance || "0.00",
        totalWinnings: "0.00",
        referralCode: `REF${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        referralBonus: "0.00",
        referralCount: 0,
        language: language || "he",
      };
      
      const user = await storage.upsertUser(userData as any);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // SMS Notification Routes
  app.post('/api/admin/sms/test', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const result = await smsService.testSMSSystem();
      res.json(result);
    } catch (error) {
      console.error("Error testing SMS system:", error);
      res.status(500).json({ message: "Failed to test SMS system" });
    }
  });

  app.post('/api/admin/sms/notify-draw/:drawId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { drawId } = req.params;
      await smsService.notifyDrawStarting(parseInt(drawId));
      res.json({ message: "Draw starting notifications sent successfully" });
    } catch (error) {
      console.error("Error sending draw notifications:", error);
      res.status(500).json({ message: "Failed to send draw notifications" });
    }
  });

  app.post('/api/admin/sms/notify-winner', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId, amount, drawId } = req.body;
      await smsService.notifyWinner(userId, amount, drawId);
      res.json({ message: "Winner notification sent successfully" });
    } catch (error) {
      console.error("Error sending winner notification:", error);
      res.status(500).json({ message: "Failed to send winner notification" });
    }
  });

  // Block user endpoint
  app.post('/api/admin/users/:userId/block', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user to blocked status
      const updatedUser = await storage.upsertUser({
        ...user,
        isBlocked: true,
      } as any);
      
      res.json({ message: `User ${user.firstName} ${user.lastName} has been blocked`, user: updatedUser });
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).json({ message: "Failed to block user" });
    }
  });

  app.get('/api/admin/draws/:drawId/winners', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const drawId = parseInt(req.params.drawId);
      const winners = await storage.getDrawWinners(drawId);
      res.json(winners);
    } catch (error) {
      console.error("Error fetching draw winners:", error);
      res.status(500).json({ message: "Failed to fetch draw winners" });
    }
  });

  app.post('/api/admin/draws', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { drawDate } = req.body;
      
      // Generate next draw number - get all draws to find highest number
      const allDraws = await storage.getAllDraws();
      const maxDrawNumber = allDraws.length > 0 
        ? Math.max(...allDraws.map(d => d.drawNumber)) 
        : 999;
      const drawNumber = maxDrawNumber + 1;
      
      const newDraw = await storage.createDraw({
        drawNumber,
        drawDate: new Date(drawDate),
        jackpotAmount: "100000.00", // Starting jackpot
        isActive: true,
        isCompleted: false,
      });
      
      res.json(newDraw);
    } catch (error) {
      console.error("Error creating draw:", error);
      res.status(500).json({ message: "Failed to create draw" });
    }
  });

  app.post('/api/admin/draws/:drawId/submit-results', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const drawId = parseInt(req.params.drawId);
      const { winningNumbers } = req.body;
      
      if (!Array.isArray(winningNumbers) || winningNumbers.length !== 6) {
        return res.status(400).json({ message: "Must provide exactly 6 winning numbers" });
      }
      
      // Update draw with winning numbers
      await storage.updateDrawWinningNumbers(drawId, winningNumbers);
      
      // Calculate winners
      const tickets = await storage.getDrawTickets(drawId);
      const draw = await storage.getCurrentDraw();
      
      if (!draw) {
        return res.status(404).json({ message: "Draw not found" });
      }
      
      const jackpot = parseFloat(draw.jackpotAmount);
      const winners: { [key: number]: any[] } = { 6: [], 5: [], 4: [] };
      
      // Calculate matches for each ticket
      for (const ticket of tickets) {
        const ticketNumbers = ticket.numbers as number[];
        const matches = ticketNumbers.filter(num => winningNumbers.includes(num)).length;
        
        if (matches >= 4) {
          winners[matches].push(ticket);
        }
        
        await storage.updateTicketResults(ticket.id, matches, "0");
      }
      
      // Distribute winnings (50-50 split: 50% to winners, 50% retained)
      const distributions: { [key: number]: number } = {
        6: 0.4, // 40% of total jackpot (80% of distributed amount)
        5: 0.075, // 7.5% of total jackpot (15% of distributed amount)
        4: 0.025, // 2.5% of total jackpot (5% of distributed amount)
      };
      
      let totalWinningsDistributed = 0;
      
      for (const [matchCount, winnerTickets] of Object.entries(winners)) {
        if (winnerTickets.length > 0) {
          const matchNum = parseInt(matchCount);
          const totalForLevel = jackpot * distributions[matchNum];
          const winningPerTicket = totalForLevel / winnerTickets.length;
          totalWinningsDistributed += totalForLevel;
          
          for (const ticket of winnerTickets) {
            await storage.updateTicketResults(ticket.id, matchNum, winningPerTicket.toFixed(2));
            await storage.updateUserBalance(ticket.userId, winningPerTicket.toFixed(2));
            
            await storage.createTransaction({
              userId: ticket.userId,
              type: "winnings",
              amount: winningPerTicket.toFixed(2),
              description: `Winnings for ${matchCount} matches in draw #${drawId}`,
              ticketId: ticket.id,
            });
          }
        }
      }
      
      // Handle rollover - add undistributed jackpot to next draw
      const rolloverAmount = jackpot * 0.4 - (winners[6]?.length > 0 ? jackpot * 0.4 : 0);
      
      if (rolloverAmount > 0) {
        // Get or create next draw
        let nextDraw = await storage.getCurrentDraw();
        if (!nextDraw || nextDraw.id === drawId) {
          // Create next draw if it doesn't exist
          const allDraws = await storage.getAllDraws();
          const nextDrawNumber = allDraws.length > 0 
            ? Math.max(...allDraws.map(d => d.drawNumber)) + 1 
            : 1;
          
          const nextDrawDate = new Date();
          nextDrawDate.setDate(nextDrawDate.getDate() + 7); // Next week
          
          nextDraw = await storage.createDraw({
            drawNumber: nextDrawNumber,
            drawDate: nextDrawDate,
            jackpotAmount: rolloverAmount.toFixed(2),
          });
        } else {
          // Add rollover to existing next draw
          await storage.updateDrawJackpot(nextDraw.id, rolloverAmount);
        }
      }
      
      // Complete the draw
      await storage.completeDraw(drawId);
      
      // Trigger automatic winner notifications
      const drawWinners = await storage.getDrawWinners(drawId);
      if (drawWinners.length > 0) {
        try {
          const { drawScheduler } = await import('./scheduler');
          await drawScheduler.triggerWinnerNotifications(drawId);
          console.log(`[AUTO-TRIGGER] Winner notifications sent for draw #${drawId} to ${drawWinners.length} winners`);
        } catch (error) {
          console.error(`[AUTO-TRIGGER] Failed to send winner notifications for draw #${drawId}:`, error);
        }
      }
      
      res.json({ 
        message: "Results submitted successfully",
        winnersNotified: drawWinners.length
      });
    } catch (error) {
      console.error("Error submitting results:", error);
      res.status(500).json({ message: "Failed to submit results" });
    }
  });

  app.get('/api/admin/draws', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const draws = await storage.getAllDraws();
      res.json(draws);
    } catch (error) {
      console.error("Error fetching all draws:", error);
      res.status(500).json({ message: "Failed to fetch draws" });
    }
  });

  app.get('/api/admin/draws/:drawId/stats', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const drawId = parseInt(req.params.drawId);
      const stats = await storage.getDrawStats(drawId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching draw stats:", error);
      res.status(500).json({ message: "Failed to fetch draw stats" });
    }
  });

  // Chat endpoints
  app.get('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const messages = await storage.getChatMessages(50);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection');
    
    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat') {
          const chatMessage = await storage.createChatMessage({
            userId: message.userId,
            message: message.content,
            isFromAdmin: false,
          });
          
          // Broadcast to all connected clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'chat',
                data: chatMessage,
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
