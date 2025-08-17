import { db } from "./db";
import { systemConfig, dashboardPermissions } from "@shared/schema";
import { sql } from "drizzle-orm";

// Initialize system configuration and dashboard permissions
export async function initializeSystemConfig() {
  try {
    // Check if system config already exists
    const existingConfig = await db.select().from(systemConfig).limit(1);
    
    if (existingConfig.length === 0) {
      // Create default system configuration
      await db.insert(systemConfig).values({
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
      });
      console.log("✓ Default system configuration created");
    }

    // Check if dashboard permissions already exist
    const existingPermissions = await db.select().from(dashboardPermissions).limit(1);
    
    if (existingPermissions.length === 0) {
      // Create default dashboard permissions
      const defaultPermissions = [
        { role: "superadmin" as const, dashboardType: "superadmin", canAccess: true },
        { role: "superadmin" as const, dashboardType: "manager", canAccess: true },
        { role: "superadmin" as const, dashboardType: "user", canAccess: true },
        { role: "manager" as const, dashboardType: "superadmin", canAccess: false },
        { role: "manager" as const, dashboardType: "manager", canAccess: true },
        { role: "manager" as const, dashboardType: "user", canAccess: false },
        { role: "user" as const, dashboardType: "superadmin", canAccess: false },
        { role: "user" as const, dashboardType: "manager", canAccess: false },
        { role: "user" as const, dashboardType: "user", canAccess: true },
        { role: "customer" as const, dashboardType: "superadmin", canAccess: false },
        { role: "customer" as const, dashboardType: "manager", canAccess: false },
        { role: "customer" as const, dashboardType: "user", canAccess: true },
      ];

      await db.insert(dashboardPermissions).values(defaultPermissions);
      console.log("✓ Default dashboard permissions created");
    }

    console.log("✓ System initialization completed successfully");
  } catch (error) {
    console.error("✗ Failed to initialize system configuration:", error);
  }
}