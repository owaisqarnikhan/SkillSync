import { storage } from "./storage";
import { hashPassword } from "./customAuth";

// Asian countries participating in Bahrain Asian Youth Games 2025
const asianCountries = [
  { code: 'AFG', name: 'Afghanistan' },
  { code: 'BHR', name: 'Bahrain' },
  { code: 'BGD', name: 'Bangladesh' },
  { code: 'BTN', name: 'Bhutan' },
  { code: 'BRN', name: 'Brunei' },
  { code: 'KHM', name: 'Cambodia' },
  { code: 'CHN', name: 'China' },
  { code: 'TWN', name: 'Chinese Taipei' },
  { code: 'IND', name: 'India' },
  { code: 'IDN', name: 'Indonesia' },
  { code: 'IRN', name: 'Iran' },
  { code: 'IRQ', name: 'Iraq' },
  { code: 'JPN', name: 'Japan' },
  { code: 'JOR', name: 'Jordan' },
  { code: 'KAZ', name: 'Kazakhstan' },
  { code: 'KWT', name: 'Kuwait' },
  { code: 'KGZ', name: 'Kyrgyzstan' },
  { code: 'LAO', name: 'Laos' },
  { code: 'LBN', name: 'Lebanon' },
  { code: 'MYS', name: 'Malaysia' },
  { code: 'MDV', name: 'Maldives' },
  { code: 'MNG', name: 'Mongolia' },
  { code: 'MMR', name: 'Myanmar' },
  { code: 'NPL', name: 'Nepal' },
  { code: 'PRK', name: 'North Korea' },
  { code: 'OMN', name: 'Oman' },
  { code: 'PAK', name: 'Pakistan' },
  { code: 'PLE', name: 'Palestine' },
  { code: 'PHL', name: 'Philippines' },
  { code: 'QAT', name: 'Qatar' },
  { code: 'SAU', name: 'Saudi Arabia' },
  { code: 'SGP', name: 'Singapore' },
  { code: 'KOR', name: 'South Korea' },
  { code: 'LKA', name: 'Sri Lanka' },
  { code: 'SYR', name: 'Syria' },
  { code: 'TJK', name: 'Tajikistan' },
  { code: 'THA', name: 'Thailand' },
  { code: 'TLS', name: 'Timor-Leste' },
  { code: 'TKM', name: 'Turkmenistan' },
  { code: 'UAE', name: 'UAE' },
  { code: 'UZB', name: 'Uzbekistan' },
  { code: 'VNM', name: 'Vietnam' },
  { code: 'YEM', name: 'Yemen' },
  { code: 'HKG', name: 'Hong Kong' },
  { code: 'MAC', name: 'Macau' }
];

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
    
    // Create 45 NOC (National Olympic Committee) users for Asian countries
    console.log("Creating NOC users for Asian countries...");
    let createdCount = 0;
    
    for (const country of asianCountries) {
      const username = `noc_${country.code.toLowerCase()}`;
      const existingNOC = await storage.getUserByUsername(username);
      
      if (!existingNOC) {
        const hashedPassword = await hashPassword(`${country.code.toLowerCase()}123`);
        
        await storage.createUser({
          username,
          password: hashedPassword,
          email: `noc.${country.code.toLowerCase()}@bahrain2025.com`,
          firstName: "NOC",
          lastName: country.name,
          role: "customer",
          countryCode: country.code,
        });
        
        createdCount++;
      }
    }
    
    if (createdCount > 0) {
      console.log(`✓ Created ${createdCount} NOC users successfully`);
      console.log(`  Total NOC users: ${asianCountries.length}`);
      console.log(`  Username format: noc_{countrycode}`);
      console.log(`  Password format: {countrycode}123`);
      console.log(`  Example: Username 'noc_bhr', Password 'bhr123'`);
    } else {
      console.log(`✓ All ${asianCountries.length} NOC users already exist`);
    }
    
  } catch (error) {
    console.error("Error initializing default users:", error);
  }
}