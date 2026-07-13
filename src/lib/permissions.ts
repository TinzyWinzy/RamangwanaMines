import type { UserRole, LeadPersona } from '../types';

export interface RolePermissions {
  canViewAnalytics: boolean;
  canManageLeads: boolean;
  canManageProjects: boolean;
  canManageTraining: boolean;
  canManageContent: boolean;
  canManageUsers: boolean;
  canViewAdmin: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  client: {
    canViewAnalytics: false,
    canManageLeads: false,
    canManageProjects: false,
    canManageTraining: false,
    canManageContent: false,
    canManageUsers: false,
    canViewAdmin: false,
  },
  trainee: {
    canViewAnalytics: false,
    canManageLeads: false,
    canManageProjects: false,
    canManageTraining: false,
    canManageContent: false,
    canManageUsers: false,
    canViewAdmin: false,
  },
  sales_rep: {
    canViewAnalytics: true,
    canManageLeads: true,
    canManageProjects: false,
    canManageTraining: false,
    canManageContent: false,
    canManageUsers: false,
    canViewAdmin: true,
  },
  trainer: {
    canViewAnalytics: false,
    canManageLeads: false,
    canManageProjects: false,
    canManageTraining: true,
    canManageContent: false,
    canManageUsers: false,
    canViewAdmin: true,
  },
  project_manager: {
    canViewAnalytics: true,
    canManageLeads: true,
    canManageProjects: true,
    canManageTraining: false,
    canManageContent: false,
    canManageUsers: false,
    canViewAdmin: true,
  },
  admin: {
    canViewAnalytics: true,
    canManageLeads: true,
    canManageProjects: true,
    canManageTraining: true,
    canManageContent: true,
    canManageUsers: false,
    canViewAdmin: true,
  },
  super_admin: {
    canViewAnalytics: true,
    canManageLeads: true,
    canManageProjects: true,
    canManageTraining: true,
    canManageContent: true,
    canManageUsers: true,
    canViewAdmin: true,
  },
};

export function getPermissions(role: UserRole | null | undefined): RolePermissions {
  if (!role || !ROLE_PERMISSIONS[role]) {
    return ROLE_PERMISSIONS.client;
  }
  return ROLE_PERMISSIONS[role];
}
