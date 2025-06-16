import type { Express } from "express";

// Route organization by role and functionality
export interface RouteGroup {
  prefix: string;
  middleware: string[];
  routes: RouteDefinition[];
}

export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  handler: string;
  description: string;
  permissions: string[];
}

// Public routes (no authentication required)
export const publicRoutes: RouteGroup = {
  prefix: '/api',
  middleware: [],
  routes: [
    {
      method: 'GET',
      path: '/draws/current',
      handler: 'getCurrentDraw',
      description: 'Get current lottery draw',
      permissions: ['public']
    },
    {
      method: 'GET', 
      path: '/draws/completed',
      handler: 'getCompletedDraws',
      description: 'Get completed draws history',
      permissions: ['public']
    },
    {
      method: 'POST',
      path: '/auth/login',
      handler: 'userLogin',
      description: 'Universal login endpoint',
      permissions: ['public']
    },
    {
      method: 'POST',
      path: '/auth/register',
      handler: 'userRegister', 
      description: 'New user registration',
      permissions: ['public']
    }
  ]
};

// Authenticated client routes
export const clientRoutes: RouteGroup = {
  prefix: '/api',
  middleware: ['isAuthenticated'],
  routes: [
    {
      method: 'GET',
      path: '/auth/user',
      handler: 'getCurrentUser',
      description: 'Get current user profile',
      permissions: ['client']
    },
    {
      method: 'POST',
      path: '/logout',
      handler: 'userLogout',
      description: 'User logout',
      permissions: ['client']
    },
    {
      method: 'POST',
      path: '/tickets',
      handler: 'purchaseTicket',
      description: 'Purchase lottery ticket',
      permissions: ['client']
    },
    {
      method: 'GET',
      path: '/tickets/user',
      handler: 'getUserTickets',
      description: 'Get user tickets',
      permissions: ['client']
    },
    {
      method: 'GET',
      path: '/transactions/user',
      handler: 'getUserTransactions',
      description: 'Get user transaction history',
      permissions: ['client']
    },
    {
      method: 'POST',
      path: '/chat/messages',
      handler: 'sendChatMessage',
      description: 'Send chat message',
      permissions: ['client']
    },
    {
      method: 'GET',
      path: '/chat/messages',
      handler: 'getChatMessages',
      description: 'Get chat messages',
      permissions: ['client']
    }
  ]
};

// VIP client routes (additional privileges)
export const vipRoutes: RouteGroup = {
  prefix: '/api/vip',
  middleware: ['isAuthenticated', 'isVIP'],
  routes: [
    {
      method: 'GET',
      path: '/bonuses',
      handler: 'getVIPBonuses',
      description: 'Get VIP exclusive bonuses',
      permissions: ['vip']
    },
    {
      method: 'POST',
      path: '/priority-tickets',
      handler: 'purchasePriorityTicket',
      description: 'Purchase priority tickets',
      permissions: ['vip']
    },
    {
      method: 'GET',
      path: '/exclusive-draws',
      handler: 'getExclusiveDraws',
      description: 'Get VIP exclusive draws',
      permissions: ['vip']
    }
  ]
};

// Admin routes (full administrative access)
export const adminRoutes: RouteGroup = {
  prefix: '/api/admin',
  middleware: ['isAuthenticated', 'isAdmin'],
  routes: [
    {
      method: 'GET',
      path: '/users',
      handler: 'getAllUsers',
      description: 'Get all users',
      permissions: ['admin']
    },
    {
      method: 'POST',
      path: '/deposit',
      handler: 'adminDeposit',
      description: 'Admin deposit to user account',
      permissions: ['admin']
    },
    {
      method: 'POST',
      path: '/block',
      handler: 'blockUser',
      description: 'Block user account',
      permissions: ['admin']
    },
    {
      method: 'POST',
      path: '/unblock',
      handler: 'unblockUser',
      description: 'Unblock user account',
      permissions: ['admin']
    },
    {
      method: 'GET',
      path: '/draws',
      handler: 'getAllDraws',
      description: 'Get all draws for management',
      permissions: ['admin']
    },
    {
      method: 'POST',
      path: '/draws',
      handler: 'createDraw',
      description: 'Create new draw',
      permissions: ['admin']
    },
    {
      method: 'PUT',
      path: '/draws/:id',
      handler: 'updateDraw',
      description: 'Update existing draw',
      permissions: ['admin']
    },
    {
      method: 'POST',
      path: '/draws/:id/complete',
      handler: 'completeDraw',
      description: 'Complete draw and select winners',
      permissions: ['admin']
    },
    {
      method: 'GET',
      path: '/stats',
      handler: 'getGlobalStats',
      description: 'Get global platform statistics',
      permissions: ['admin']
    },
    {
      method: 'POST',
      path: '/notify',
      handler: 'sendNotifications',
      description: 'Send SMS notifications',
      permissions: ['admin']
    },
    {
      method: 'GET',
      path: '/tickets',
      handler: 'getAllTickets',
      description: 'Get all tickets across platform',
      permissions: ['admin']
    },
    {
      method: 'GET',
      path: '/transactions',
      handler: 'getAllTransactions',
      description: 'Get all transactions',
      permissions: ['admin']
    }
  ]
};

// Route organization summary
export const routeOrganization = {
  public: publicRoutes,
  client: clientRoutes,
  vip: vipRoutes,
  admin: adminRoutes
};

// Generate route documentation
export const generateRouteDocumentation = (): string => {
  let documentation = "# API Routes Documentation\n\n";
  
  Object.entries(routeOrganization).forEach(([groupName, group]) => {
    documentation += `## ${groupName.toUpperCase()} ROUTES\n`;
    documentation += `**Prefix:** ${group.prefix}\n`;
    documentation += `**Middleware:** ${group.middleware.join(', ') || 'None'}\n\n`;
    
    group.routes.forEach(route => {
      documentation += `### ${route.method} ${group.prefix}${route.path}\n`;
      documentation += `**Description:** ${route.description}\n`;
      documentation += `**Permissions:** ${route.permissions.join(', ')}\n\n`;
    });
    
    documentation += "---\n\n";
  });
  
  return documentation;
};