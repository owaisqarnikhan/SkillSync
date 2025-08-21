import { Request, Response, NextFunction } from "express";
import type { User, Permission, PERMISSION_RESOURCES, PERMISSION_ACTIONS, PermissionResource, PermissionAction } from "@shared/types";
import { storage } from "./storage";

// Permission checking service
export class PermissionService {
  private static permissionCache = new Map<string, Permission[]>();
  private static cacheExpiry = new Map<string, number>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if a user has permission to perform an action on a resource
   */
  static async hasPermission(
    user: User,
    resource: PermissionResource,
    action: PermissionAction
  ): Promise<boolean> {
    // Superadmin always has access (fallback)
    if (user.role === 'superadmin') {
      return true;
    }

    try {
      const permissions = await this.getUserPermissions(user);
      const permission = permissions.find(p => 
        p.resource === resource && p.action === action
      );
      
      return permission?.allowed ?? false;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  /**
   * Get all permissions for a user (with caching)
   */
  private static async getUserPermissions(user: User): Promise<Permission[]> {
    const cacheKey = `${user.role}_permissions`;
    const now = Date.now();

    // Check cache first
    if (this.permissionCache.has(cacheKey)) {
      const expiry = this.cacheExpiry.get(cacheKey) ?? 0;
      if (now < expiry) {
        return this.permissionCache.get(cacheKey)!;
      }
    }

    // Fetch from database
    const permissions = await storage.getDashboardPermissions(user.role);
    
    // Cache the result
    this.permissionCache.set(cacheKey, permissions);
    this.cacheExpiry.set(cacheKey, now + this.CACHE_TTL);

    return permissions;
  }

  /**
   * Clear permission cache
   */
  static clearCache(role?: string) {
    if (role) {
      const cacheKey = `${role}_permissions`;
      this.permissionCache.delete(cacheKey);
      this.cacheExpiry.delete(cacheKey);
    } else {
      this.permissionCache.clear();
      this.cacheExpiry.clear();
    }
  }

  /**
   * Check multiple permissions at once
   */
  static async hasAnyPermission(
    user: User,
    checks: Array<{ resource: PermissionResource; action: PermissionAction }>
  ): Promise<boolean> {
    for (const check of checks) {
      if (await this.hasPermission(user, check.resource, check.action)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if user owns the resource (for view_own, update_own permissions)
   */
  static checkOwnership(user: User, resourceOwnerId: string | null | undefined): boolean {
    return user.id === resourceOwnerId;
  }
}

// Middleware factory for permission checking
export function requirePermission(
  resource: PermissionResource,
  action: PermissionAction,
  options?: {
    checkOwnership?: (req: any) => string | null | undefined;
    fallbackToOwnership?: boolean;
  }
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      let hasPermission = await PermissionService.hasPermission(user, resource, action);

      // If no direct permission, check ownership-based permissions
      if (!hasPermission && options?.checkOwnership) {
        const resourceOwnerId = options.checkOwnership(req);
        const isOwner = PermissionService.checkOwnership(user, resourceOwnerId);
        
        if (isOwner) {
          // Check if user has view_own or similar permission
          const ownerAction = action === 'read' ? 'view_own' : action;
          hasPermission = await PermissionService.hasPermission(user, resource, ownerAction as PermissionAction);
        }
      }

      // Fallback to ownership for certain resources
      if (!hasPermission && options?.fallbackToOwnership && options.checkOwnership) {
        const resourceOwnerId = options.checkOwnership(req);
        hasPermission = PermissionService.checkOwnership(user, resourceOwnerId);
      }

      if (!hasPermission) {
        return res.status(403).json({ 
          message: "Access denied",
          required: { resource, action },
          role: user.role
        });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ message: "Permission check failed" });
    }
  };
}

// Convenience middleware functions
export const requireSuperAdmin = requirePermission('permissions' as PermissionResource, 'manage' as PermissionAction);

export const requireUserManagement = requirePermission('users' as PermissionResource, 'manage' as PermissionAction);

export const requireBookingApproval = requirePermission('bookings' as PermissionResource, 'approve' as PermissionAction);

// Role-based middleware (legacy compatibility)
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        message: "Access denied",
        required_roles: allowedRoles,
        user_role: user.role
      });
    }

    next();
  };
}