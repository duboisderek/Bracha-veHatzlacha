// Configuration complète des rôles et permissions - Backend
export enum UserRole {
  ADMIN = 'admin',
  VIP_CLIENT = 'vip_client',
  STANDARD_CLIENT = 'standard_client',
  NEW_CLIENT = 'new_client'
}

export enum Permission {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
  VIP = 'vip',
  MODERATE = 'moderate'
}

export interface RoleDefinition {
  name: UserRole;
  displayName: string;
  permissions: Permission[];
  restrictions: string[];
  features: string[];
  menuItems: string[];
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  [UserRole.ADMIN]: {
    name: UserRole.ADMIN,
    displayName: 'Administrateur',
    permissions: [
      Permission.READ,
      Permission.WRITE,
      Permission.DELETE,
      Permission.ADMIN,
      Permission.VIP,
      Permission.MODERATE
    ],
    restrictions: [],
    features: [
      'user_management',
      'draw_management',
      'financial_management',
      'statistics_complete',
      'chat_moderation',
      'system_configuration',
      'backup_restore',
      'audit_logs'
    ],
    menuItems: [
      'dashboard',
      'users',
      'draws',
      'finances',
      'moderation',
      'statistics',
      'configuration',
      'logs'
    ]
  },

  [UserRole.VIP_CLIENT]: {
    name: UserRole.VIP_CLIENT,
    displayName: 'Client VIP',
    permissions: [
      Permission.READ,
      Permission.WRITE,
      Permission.VIP
    ],
    restrictions: [
      'no_admin_access',
      'limited_chat_support'
    ],
    features: [
      'lottery_participation',
      'advanced_statistics',
      'priority_tickets',
      'vip_support',
      'early_draw_access',
      'bonus_multiplier'
    ],
    menuItems: [
      'home',
      'personal',
      'vip_area',
      'advanced_stats',
      'priority_support',
      'chat'
    ]
  },

  [UserRole.STANDARD_CLIENT]: {
    name: UserRole.STANDARD_CLIENT,
    displayName: 'Client Standard',
    permissions: [
      Permission.READ,
      Permission.WRITE
    ],
    restrictions: [
      'no_admin_access',
      'no_vip_features',
      'standard_support_only'
    ],
    features: [
      'lottery_participation',
      'basic_statistics',
      'standard_support',
      'referral_system',
      'transaction_history'
    ],
    menuItems: [
      'home',
      'personal',
      'tickets',
      'transactions',
      'referrals',
      'chat'
    ]
  },

  [UserRole.NEW_CLIENT]: {
    name: UserRole.NEW_CLIENT,
    displayName: 'Nouveau Client',
    permissions: [
      Permission.READ
    ],
    restrictions: [
      'no_admin_access',
      'no_vip_features',
      'limited_participation',
      'basic_support_only'
    ],
    features: [
      'limited_lottery_participation',
      'basic_profile',
      'welcome_bonus',
      'guided_tour'
    ],
    menuItems: [
      'home',
      'personal',
      'help',
      'tutorial'
    ]
  }
};

export function getUserRole(user: any): UserRole {
  if (!user) return UserRole.NEW_CLIENT;
  
  if (user.isAdmin) return UserRole.ADMIN;
  
  // Logique VIP basée sur participations ou statut spécial
  if (user.participationCount >= 100 || user.isVIP) {
    return UserRole.VIP_CLIENT;
  }
  
  // Client standard après première participation
  if (user.participationCount > 0) {
    return UserRole.STANDARD_CLIENT;
  }
  
  return UserRole.NEW_CLIENT;
}

export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_DEFINITIONS[role]?.permissions || [];
}

export function hasPermission(userRole: UserRole, requiredPermission: Permission): boolean {
  const userPermissions = getPermissionsForRole(userRole);
  return userPermissions.includes(requiredPermission);
}

export function canAccessFeature(userRole: UserRole, feature: string): boolean {
  const roleDefinition = ROLE_DEFINITIONS[userRole];
  return roleDefinition?.features.includes(feature) || false;
}

export function getMenuItemsForRole(userRole: UserRole): string[] {
  return ROLE_DEFINITIONS[userRole]?.menuItems || [];
}

export function getRoleRestrictions(userRole: UserRole): string[] {
  return ROLE_DEFINITIONS[userRole]?.restrictions || [];
}