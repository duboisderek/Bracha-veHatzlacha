// Configuration des menus par rôle - Frontend
export interface MenuItem {
  id: string;
  label: string;
  labelKey: string; // Clé de traduction
  icon: string;
  path: string;
  roles: UserRole[];
  children?: MenuItem[];
  badge?: string;
  external?: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  VIP_CLIENT = 'vip_client',
  STANDARD_CLIENT = 'standard_client',
  NEW_CLIENT = 'new_client'
}

export const MENU_ITEMS: MenuItem[] = [
  // Navigation principale pour tous les clients
  {
    id: 'home',
    label: 'Accueil',
    labelKey: 'home',
    icon: 'home',
    path: '/',
    roles: [UserRole.STANDARD_CLIENT, UserRole.VIP_CLIENT, UserRole.NEW_CLIENT]
  },
  {
    id: 'personal',
    label: 'Espace Personnel',
    labelKey: 'dashboard',
    icon: 'user',
    path: '/personal',
    roles: [UserRole.STANDARD_CLIENT, UserRole.VIP_CLIENT, UserRole.NEW_CLIENT],
    children: [
      {
        id: 'tickets',
        label: 'Mes Tickets',
        labelKey: 'myTickets',
        icon: 'ticket',
        path: '/personal/tickets',
        roles: [UserRole.STANDARD_CLIENT, UserRole.VIP_CLIENT]
      },
      {
        id: 'transactions',
        label: 'Mes Transactions',
        labelKey: 'myTransactions',
        icon: 'credit-card',
        path: '/personal/transactions',
        roles: [UserRole.STANDARD_CLIENT, UserRole.VIP_CLIENT]
      },
      {
        id: 'referrals',
        label: 'Parrainage',
        labelKey: 'referrals',
        icon: 'users',
        path: '/personal/referrals',
        roles: [UserRole.STANDARD_CLIENT, UserRole.VIP_CLIENT]
      }
    ]
  },
  {
    id: 'chat',
    label: 'Support',
    labelKey: 'chat',
    icon: 'message-circle',
    path: '/chat',
    roles: [UserRole.STANDARD_CLIENT, UserRole.VIP_CLIENT, UserRole.NEW_CLIENT]
  },

  // Menu VIP exclusif
  {
    id: 'vip_area',
    label: 'Espace VIP',
    labelKey: 'vipArea',
    icon: 'crown',
    path: '/vip',
    roles: [UserRole.VIP_CLIENT],
    badge: 'VIP',
    children: [
      {
        id: 'advanced_stats',
        label: 'Statistiques Avancées',
        labelKey: 'advancedStats',
        icon: 'bar-chart',
        path: '/vip/stats',
        roles: [UserRole.VIP_CLIENT]
      },
      {
        id: 'priority_tickets',
        label: 'Tickets Prioritaires',
        labelKey: 'priorityTickets',
        icon: 'zap',
        path: '/vip/priority',
        roles: [UserRole.VIP_CLIENT]
      },
      {
        id: 'vip_support',
        label: 'Support VIP',
        labelKey: 'vipSupport',
        icon: 'headphones',
        path: '/vip/support',
        roles: [UserRole.VIP_CLIENT]
      }
    ]
  },

  // Menu administrateur
  {
    id: 'admin_dashboard',
    label: 'Dashboard Admin',
    labelKey: 'adminDashboard',
    icon: 'layout-dashboard',
    path: '/admin',
    roles: [UserRole.ADMIN],
    children: [
      {
        id: 'admin_users',
        label: 'Gestion Utilisateurs',
        labelKey: 'userManagement',
        icon: 'users',
        path: '/admin/users',
        roles: [UserRole.ADMIN]
      },
      {
        id: 'admin_draws',
        label: 'Gestion Tirages',
        labelKey: 'drawManagement',
        icon: 'target',
        path: '/admin/draws',
        roles: [UserRole.ADMIN]
      },
      {
        id: 'admin_finances',
        label: 'Gestion Financière',
        labelKey: 'financialManagement',
        icon: 'dollar-sign',
        path: '/admin/finances',
        roles: [UserRole.ADMIN]
      },
      {
        id: 'admin_stats',
        label: 'Statistiques Complètes',
        labelKey: 'completeStats',
        icon: 'trending-up',
        path: '/admin/statistics',
        roles: [UserRole.ADMIN]
      },
      {
        id: 'admin_moderation',
        label: 'Modération',
        labelKey: 'moderation',
        icon: 'shield',
        path: '/admin/moderation',
        roles: [UserRole.ADMIN]
      },
      {
        id: 'admin_config',
        label: 'Configuration',
        labelKey: 'configuration',
        icon: 'settings',
        path: '/admin/config',
        roles: [UserRole.ADMIN]
      }
    ]
  }
];

export const ADMIN_ACTIONS = [
  {
    id: 'create_user',
    label: 'Créer Utilisateur',
    labelKey: 'createUser',
    endpoint: '/api/admin/create-user',
    method: 'POST',
    roles: [UserRole.ADMIN]
  },
  {
    id: 'create_simple_user',
    label: 'Création Rapide',
    labelKey: 'quickCreate',
    endpoint: '/api/admin/create-simple-user',
    method: 'POST',
    roles: [UserRole.ADMIN]
  },
  {
    id: 'manual_deposit',
    label: 'Dépôt Manuel',
    labelKey: 'manualDeposit',
    endpoint: '/api/admin/deposit',
    method: 'POST',
    roles: [UserRole.ADMIN]
  },
  {
    id: 'create_draw',
    label: 'Créer Tirage',
    labelKey: 'createDraw',
    endpoint: '/api/admin/draws',
    method: 'POST',
    roles: [UserRole.ADMIN]
  },
  {
    id: 'block_user',
    label: 'Bloquer Utilisateur',
    labelKey: 'blockUser',
    endpoint: '/api/admin/users/:id/block',
    method: 'PUT',
    roles: [UserRole.ADMIN]
  },
  {
    id: 'unblock_user',
    label: 'Débloquer Utilisateur',
    labelKey: 'unblockUser',
    endpoint: '/api/admin/users/:id/unblock',
    method: 'PUT',
    roles: [UserRole.ADMIN]
  }
];

export const CLIENT_ACTIONS = [
  {
    id: 'buy_ticket',
    label: 'Acheter Ticket',
    labelKey: 'buyTicket',
    endpoint: '/api/tickets',
    method: 'POST',
    roles: [UserRole.STANDARD_CLIENT, UserRole.VIP_CLIENT],
    minAmount: 100
  },
  {
    id: 'send_message',
    label: 'Envoyer Message',
    labelKey: 'sendMessage',
    endpoint: '/api/chat/messages',
    method: 'POST',
    roles: [UserRole.STANDARD_CLIENT, UserRole.VIP_CLIENT, UserRole.NEW_CLIENT]
  }
];

export const VIP_ACTIONS = [
  {
    id: 'priority_ticket',
    label: 'Ticket Prioritaire',
    labelKey: 'priorityTicket',
    endpoint: '/api/vip/tickets/priority',
    method: 'POST',
    roles: [UserRole.VIP_CLIENT]
  },
  {
    id: 'advanced_stats',
    label: 'Statistiques VIP',
    labelKey: 'vipStats',
    endpoint: '/api/vip/stats/advanced',
    method: 'GET',
    roles: [UserRole.VIP_CLIENT]
  }
];

export function getMenuItemsForUser(userRole: UserRole): MenuItem[] {
  return MENU_ITEMS.filter(item => item.roles.includes(userRole));
}

export function getActionsForUser(userRole: UserRole): any[] {
  const actions = [...CLIENT_ACTIONS];
  
  if (userRole === UserRole.VIP_CLIENT) {
    actions.push(...VIP_ACTIONS);
  }
  
  if (userRole === UserRole.ADMIN) {
    actions.push(...ADMIN_ACTIONS);
  }
  
  return actions.filter(action => action.roles.includes(userRole));
}

export function canAccessPath(userRole: UserRole, path: string): boolean {
  const menuItems = getMenuItemsForUser(userRole);
  
  return menuItems.some(item => {
    if (item.path === path) return true;
    if (item.children) {
      return item.children.some(child => child.path === path);
    }
    return false;
  });
}