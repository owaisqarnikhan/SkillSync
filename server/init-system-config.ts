import { storage } from "./storage";

// Initialize system configuration and dashboard permissions
export async function initializeSystemConfig() {
  try {
    // Check if system config already exists
    const existingConfig = await storage.getSystemConfig();
    
    if (!existingConfig) {
      // Create default system configuration
      await storage.updateSystemConfig({
        maintenanceMode: false,
        registrationEnabled: true,
        bookingWindowDays: 30,
        maxBookingsPerUser: 10,
        maxBookingHours: 4,
        bookingRules: {
          loginHeading1: "Welcome to",
          loginHeading2: "Bahrain Asian Youth Games 2025", 
          loginHeading3: "Training Management System",
          logoUrl: null,
          separatorImageUrl: null,
          smtpHost: "smtp.office365.com",
          smtpPort: 587,
          smtpUsername: null,
          smtpPassword: null,
          smtpFromEmail: "noreply@bahrain2025.com",
          smtpFromName: "Training Management System",
          smtpSecure: true,
          twoHourLimitEnabled: true,
        },
        emailSettings: null,
        notificationSettings: null,
      });
      console.log("✓ Default system configuration created");
    }

    // Create default dashboard permissions
    const defaultPermissions = [
      { role: "superadmin" as const, resource: "dashboard", action: "access", allowed: true },
      { role: "superadmin" as const, resource: "users", action: "manage", allowed: true },
      { role: "superadmin" as const, resource: "venues", action: "manage", allowed: true },
      { role: "manager" as const, resource: "dashboard", action: "access", allowed: true },
      { role: "manager" as const, resource: "bookings", action: "manage", allowed: true },
      { role: "user" as const, resource: "dashboard", action: "access", allowed: true },
      { role: "user" as const, resource: "bookings", action: "create", allowed: true },
      { role: "customer" as const, resource: "dashboard", action: "access", allowed: true },
      { role: "customer" as const, resource: "bookings", action: "create", allowed: true },
    ];

    for (const permission of defaultPermissions) {
      try {
        await storage.createDashboardPermission(permission);
      } catch (error) {
        // Permission might already exist, ignore error
      }
    }
    console.log("✓ Default dashboard permissions created");

    console.log("✓ System initialization completed successfully");
  } catch (error) {
    console.error("✗ Failed to initialize system configuration:", error);
  }
}