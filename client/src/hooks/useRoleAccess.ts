// Hook d'autorisation et gestion des rôles - Frontend
import { useAuth } from './useAuth';
import { UserRole, getMenuItemsForUser, getActionsForUser, canAccessPath } from '@/lib/menu-config';

export function useRoleAccess() {
  const { user, isAuthenticated } = useAuth();

  const getUserRole = (): UserRole => {
    if (!user || !isAuthenticated) return UserRole.NEW_CLIENT;
    
    if ((user as any)?.isAdmin) return UserRole.ADMIN;
    
    // Logique VIP basée sur participations ou statut
    const participationCount = (user as any)?.participationCount || 0;
    if (participationCount >= 100 || (user as any)?.isVIP) {
      return UserRole.VIP_CLIENT;
    }
    
    if (participationCount > 0) {
      return UserRole.STANDARD_CLIENT;
    }
    
    return UserRole.NEW_CLIENT;
  };

  const userRole = getUserRole();

  const hasRole = (requiredRole: UserRole): boolean => {
    return userRole === requiredRole || userRole === UserRole.ADMIN;
  };

  const isAdmin = (): boolean => {
    return userRole === UserRole.ADMIN;
  };

  const isVIP = (): boolean => {
    return userRole === UserRole.VIP_CLIENT || isAdmin();
  };

  const isStandardClient = (): boolean => {
    return userRole === UserRole.STANDARD_CLIENT || isVIP();
  };

  const canAccess = (path: string): boolean => {
    return canAccessPath(userRole, path);
  };

  const getAvailableMenuItems = () => {
    return getMenuItemsForUser(userRole);
  };

  const getAvailableActions = () => {
    return getActionsForUser(userRole);
  };

  const canPerformAction = (actionId: string): boolean => {
    const actions = getAvailableActions();
    return actions.some(action => action.id === actionId);
  };

  return {
    userRole,
    user,
    isAuthenticated,
    hasRole,
    isAdmin,
    isVIP,
    isStandardClient,
    canAccess,
    canPerformAction,
    getAvailableMenuItems,
    getAvailableActions
  };
}