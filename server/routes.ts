import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { smsService } from "./sms-service";
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

// Simple auth middleware for this demo
const isAuthenticated = (req: any, res: Response, next: any) => {
  // For development, we'll use a simple session check
  // In production, this would use proper JWT verification
  if (req.session?.user) {
    req.user = req.session.user;
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

const isAdmin = async (req: any, res: Response, next: any) => {
  // Check if user is authenticated first
  if (!req.session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Check if user has admin privileges
  if (req.session.user.isAdmin === true) {
    req.user = req.session.user;
    return next();
  }
  
  // Also check by user ID for specific admin account
  if (req.session.user.claims?.sub === 'admin_bracha_vehatzlacha') {
    req.user = req.session.user;
    return next();
  }
  
  return res.status(403).json({ message: "Admin access required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use((req: any, res, next) => {
    if (!req.session) {
      req.session = {};
    }
    next();
  });

  // Admin login with email/password
  app.post('/api/auth/admin-login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Verify admin credentials
      if (email === 'admin@brachavehatzlacha.com' && password === 'BrachaVeHatzlacha2024!') {
        const adminData = {
          id: 'admin_bracha_vehatzlacha',
          email: 'admin@brachavehatzlacha.com',
          firstName: 'Admin',
          lastName: 'Bracha veHatzlacha',
          profileImageUrl: null,
          referralCode: 'ADMIN001',
          balance: "50000.00",
          totalWinnings: "0.00",
          referralBonus: "0.00",
          referralCount: 0,
          language: "he",
        };
        
        const user = await storage.upsertUser(adminData as any);
        
        (req.session as any).user = {
          claims: {
            sub: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
          },
          isAdmin: true,
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        };
        
        res.json({ user: { ...user, isAdmin: true } });
      } else {
        res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Erreur de connexion" });
    }
  });

  // Demo client login endpoint
  app.post('/api/auth/demo-login', async (req, res) => {
    try {
      const { demoUser } = req.body;
      
      let userData;
      
      if (demoUser === 'client1') {
        userData = {
          id: 'demo_client1_bracha_vehatzlacha',
          email: 'client1@brachavehatzlacha.com',
          firstName: 'Client',
          lastName: 'One',
          profileImageUrl: null,
          referralCode: 'CLIENT1',
          balance: "1500.00",
          totalWinnings: "0.00",
          referralBonus: "0.00",
          referralCount: 0,
          language: "en",
        };
      } else if (demoUser === 'client2') {
        userData = {
          id: 'demo_client2_bracha_vehatzlacha',
          email: 'client2@brachavehatzlacha.com',
          firstName: 'Client',
          lastName: 'Two',
          profileImageUrl: null,
          referralCode: 'CLIENT2',
          balance: "2000.00",
          totalWinnings: "0.00",
          referralBonus: "0.00",
          referralCount: 1,
          language: "he",
        };
      } else if (demoUser === 'client3') {
        userData = {
          id: 'demo_client3_bracha_vehatzlacha',
          email: 'client3@brachavehatzlacha.com',
          firstName: 'Client',
          lastName: 'Three',
          profileImageUrl: null,
          referralCode: 'CLIENT3',
          balance: "1000.00",
          totalWinnings: "0.00",
          referralBonus: "0.00",
          referralCount: 3,
          language: "en",
        };
      } else {
        return res.status(400).json({ message: "Invalid demo user" });
      }

      const user = await storage.upsertUser(userData as any);
      
      (req.session as any).user = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
        },
        isAdmin: false,
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance
      };
      
      res.json({ user: { ...user, isAdmin: false } });
    } catch (error) {
      console.error("Demo login error:", error);
      res.status(500).json({ message: "Demo login failed" });
    }
  });

  // Client demo login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { type } = req.body;
      
      let userData;
      
      if (type === 'admin') {
        // Admin user
        userData = {
          id: 'admin_bracha_vehatzlacha',
          email: 'admin@brachavehatzlacha.com',
          firstName: 'Admin',
          lastName: 'Bracha veHatzlacha',
          profileImageUrl: null,
          referralCode: 'ADMIN001',
          balance: "50000.00",
          totalWinnings: "0.00",
          referralBonus: "0.00",
          referralCount: 0,
          language: "he",
        };
      } else {
        // Demo client user
        userData = {
          id: 'demo_client_bracha_vehatzlacha',
          email: 'demo@brachavehatzlacha.com',
          firstName: 'Demo',
          lastName: 'User',
          profileImageUrl: null,
          referralCode: 'DEMO2024',
          balance: "1000.00",
          totalWinnings: "0.00",
          referralBonus: "0.00",
          referralCount: 5,
          language: "he",
        };
      }

      const user = await storage.upsertUser(userData as any);
      
      (req.session as any).user = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
        },
        isAdmin: type === 'admin'
      };
      
      res.json({ user: { ...user, isAdmin: type === 'admin' } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
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
  app.get('/api/draws/current', async (req, res) => {
    try {
      const currentDraw = await storage.getCurrentDraw();
      if (!currentDraw) {
        // Get highest existing draw number to avoid duplicates
        const existingDraws = await storage.getCompletedDraws();
        const allDraws = [...existingDraws];
        const highestDrawNumber = allDraws.length > 0 
          ? Math.max(...allDraws.map(d => d.drawNumber))
          : 1000;
        
        const newDraw = await storage.createDraw({
          drawNumber: highestDrawNumber + 1,
          drawDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          jackpotAmount: "87340.00",
          isActive: true,
          isCompleted: false,
        });
        return res.json(newDraw);
      }
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
      
      const ticketData = insertTicketSchema.parse({
        userId,
        drawId: currentDraw.id,
        numbers,
        cost: amount || "10.00"
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
      
      // Create transaction
      await storage.createTransaction({
        userId,
        type: "ticket_purchase",
        amount: `-${ticketData.cost}`,
        description: `Ticket purchase for draw #${ticketData.drawId}`,
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
      const userData = req.body;
      
      // Check if username already exists
      const existingUsers = await storage.getAllUsers();
      const usernameExists = existingUsers.some(user => 
        user.firstName.toLowerCase() === userData.firstName.toLowerCase()
      );
      
      if (usernameExists) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.upsertUser(userData);
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
        user.firstName.toLowerCase() === userData.firstName.toLowerCase()
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
      
      res.json({ message: "Results submitted successfully" });
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
