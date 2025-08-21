import { storage } from './storage';
import { DEFAULT_PERMISSIONS, PERMISSION_RESOURCES, PERMISSION_ACTIONS } from '@shared/types';

/**
 * Initialize default permissions for all roles
 */
export async function initializeDefaultPermissions() {
  try {
    console.log('Initializing default permissions...');
    
    // Get existing permissions to avoid duplicates
    const existingPermissions = await storage.getDashboardPermissions();
    const existingKeys = new Set(
      existingPermissions.map(p => `${p.role}:${p.resource}:${p.action}`)
    );

    let createdCount = 0;

    // Create default permissions for each role
    for (const [role, permissions] of Object.entries(DEFAULT_PERMISSIONS)) {
      for (const permission of permissions) {
        const key = `${role}:${permission.resource}:${permission.action}`;
        
        // Skip if permission already exists
        if (existingKeys.has(key)) {
          continue;
        }

        await storage.createDashboardPermission({
          role: role as any,
          resource: permission.resource,
          action: permission.action,
          allowed: permission.allowed
        });

        createdCount++;
      }
    }

    if (createdCount > 0) {
      console.log(`✓ Created ${createdCount} default permissions`);
    } else {
      console.log('✓ Default permissions already exist');
    }
    
    console.log('✓ Permission initialization completed successfully');
  } catch (error) {
    console.error('Error initializing permissions:', error);
    throw error;
  }
}

/**
 * Create comprehensive permission set for a new role
 */
export async function createRolePermissions(role: string, permissionSet: 'full' | 'manager' | 'user' | 'customer' = 'user') {
  const permissions = [];
  
  switch (permissionSet) {
    case 'full':
      // Full access to all resources and actions
      for (const resource of Object.values(PERMISSION_RESOURCES)) {
        for (const action of Object.values(PERMISSION_ACTIONS)) {
          permissions.push({
            role: role as any,
            resource,
            action,
            allowed: true
          });
        }
      }
      break;
      
    case 'manager':
      permissions.push(...DEFAULT_PERMISSIONS.manager.map(p => ({ ...p, role: role as any })));
      break;
      
    case 'user':
      permissions.push(...DEFAULT_PERMISSIONS.user.map(p => ({ ...p, role: role as any })));
      break;
      
    case 'customer':
      permissions.push(...DEFAULT_PERMISSIONS.customer.map(p => ({ ...p, role: role as any })));
      break;
  }

  // Create permissions in database
  for (const permission of permissions) {
    await storage.createDashboardPermission(permission);
  }

  console.log(`✓ Created ${permissions.length} permissions for role: ${role}`);
}

/**
 * Reset permissions for a role to defaults
 */
export async function resetRolePermissions(role: 'superadmin' | 'manager' | 'user' | 'customer') {
  try {
    // Delete existing permissions for role
    const existingPermissions = await storage.getDashboardPermissions(role);
    for (const permission of existingPermissions) {
      await storage.deleteDashboardPermission(permission.id);
    }

    // Recreate default permissions
    const defaultPerms = DEFAULT_PERMISSIONS[role] || [];
    for (const permission of defaultPerms) {
      await storage.createDashboardPermission({
        role,
        resource: permission.resource,
        action: permission.action,
        allowed: permission.allowed
      });
    }

    console.log(`✓ Reset permissions for role: ${role} (${defaultPerms.length} permissions)`);
  } catch (error) {
    console.error(`Error resetting permissions for ${role}:`, error);
    throw error;
  }
}