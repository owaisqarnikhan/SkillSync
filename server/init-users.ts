import { storage } from "./storage";
import { hashPassword } from "./customAuth";

export async function initializeDefaultUsers() {
  try {
    // Check if any superadmin users exist
    const existingAdmin = await storage.getUserByUsername("admin");
    
    if (!existingAdmin) {
      // Create default superadmin user
      const hashedPassword = await hashPassword("admin123");
      
      await storage.createUser({
        username: "admin",
        password: hashedPassword,
        email: "admin@example.com",
        firstName: "System",
        lastName: "Administrator",
        role: "superadmin",
      });
      
      console.log("✓ Default superadmin user created successfully");
      console.log("  Username: admin");
      console.log("  Password: admin123");
    } else {
      console.log("✓ Admin user already exists");
    }
    
    // Check if any manager users exist - create a sample one
    const existingManager = await storage.getUserByUsername("manager");
    
    if (!existingManager) {
      const hashedPassword = await hashPassword("manager123");
      
      await storage.createUser({
        username: "manager",
        password: hashedPassword,
        email: "manager@example.com",
        firstName: "Venue",
        lastName: "Manager",
        role: "manager",
      });
      
      console.log("✓ Default manager user created successfully");
      console.log("  Username: manager");
      console.log("  Password: manager123");
    } else {
      console.log("✓ Manager user already exists");
    }
    
  } catch (error) {
    console.error("Error initializing default users:", error);
  }
}