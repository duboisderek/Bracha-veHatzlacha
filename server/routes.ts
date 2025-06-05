import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
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
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUser(req.user.claims.sub);
  if (!user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  return next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use((req: any, res, next) => {
    if (!req.session) {
      req.session = {};
    }
    next();
  });

  // Demo login endpoint (replace with proper auth in production)
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Demo: Create or get user
      const userId = email.replace('@', '_').replace('.', '_');
      const referralCode = `REF_${userId}`;
      
      const userData = {
        id: userId,
        email,
        firstName: email.split('@')[0],
        lastName: "User",
        referralCode,
        balance: "2450.00",
        totalWinnings: "12750.00",
        referralBonus: "1700.00",
        referralCount: 7,
        language: "en",
      };

      const user = await storage.upsertUser(userData);
      
      req.session.user = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
        }
      };
      
      res.json({ user });
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
      const ticketData = insertTicketSchema.parse({
        ...req.body,
        userId // Add userId to the data being validated
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

  app.post('/api/admin/draws', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { drawDate } = req.body;
      
      // Generate next draw number
      const completedDraws = await storage.getCompletedDraws();
      const drawNumber = completedDraws.length + 1000;
      
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
      const winners = { 6: [], 5: [], 4: [] };
      
      // Calculate matches for each ticket
      for (const ticket of tickets) {
        const ticketNumbers = ticket.numbers as number[];
        const matches = ticketNumbers.filter(num => winningNumbers.includes(num)).length;
        
        if (matches >= 4) {
          winners[matches as keyof typeof winners].push(ticket);
        }
        
        await storage.updateTicketResults(ticket.id, matches, "0");
      }
      
      // Distribute winnings (50-50 split: 50% to winners, 50% retained)
      const distributions = {
        6: 0.4, // 40% of total jackpot (80% of distributed amount)
        5: 0.075, // 7.5% of total jackpot (15% of distributed amount)
        4: 0.025, // 2.5% of total jackpot (5% of distributed amount)
      };
      
      for (const [matchCount, winnerTickets] of Object.entries(winners)) {
        if (winnerTickets.length > 0) {
          const totalForLevel = jackpot * distributions[matchCount as keyof typeof distributions];
          const winningPerTicket = totalForLevel / winnerTickets.length;
          
          for (const ticket of winnerTickets) {
            await storage.updateTicketResults(ticket.id, parseInt(matchCount), winningPerTicket.toFixed(2));
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
      
      // Complete the draw
      await storage.completeDraw(drawId);
      
      res.json({ message: "Results submitted successfully" });
    } catch (error) {
      console.error("Error submitting results:", error);
      res.status(500).json({ message: "Failed to submit results" });
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
