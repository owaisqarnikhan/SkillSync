import { storage } from "./storage";

// Asian countries data for Bahrain Asian Youth Games 2025
const asianCountriesData = [
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

// Sports data for Asian Youth Games
const sportsData = [
  // Aquatics
  { name: 'Swimming', category: 'Aquatics', iconName: 'waves' },
  { name: 'Diving', category: 'Aquatics', iconName: 'waves' },
  { name: 'Water Polo', category: 'Aquatics', iconName: 'waves' },
  { name: 'Artistic Swimming', category: 'Aquatics', iconName: 'waves' },
  
  // Athletics
  { name: 'Track and Field', category: 'Athletics', iconName: 'zap' },
  { name: 'Marathon', category: 'Athletics', iconName: 'zap' },
  { name: 'Race Walking', category: 'Athletics', iconName: 'zap' },
  
  // Ball Sports
  { name: 'Basketball', category: 'Ball Sports', iconName: 'circle' },
  { name: 'Football', category: 'Ball Sports', iconName: 'circle' },
  { name: 'Volleyball', category: 'Ball Sports', iconName: 'circle' },
  { name: 'Beach Volleyball', category: 'Ball Sports', iconName: 'circle' },
  { name: 'Handball', category: 'Ball Sports', iconName: 'circle' },
  
  // Racket Sports
  { name: 'Badminton', category: 'Racket Sports', iconName: 'zap' },
  { name: 'Tennis', category: 'Racket Sports', iconName: 'zap' },
  { name: 'Table Tennis', category: 'Racket Sports', iconName: 'zap' },
  { name: 'Squash', category: 'Racket Sports', iconName: 'zap' },
  
  // Martial Arts
  { name: 'Karate', category: 'Martial Arts', iconName: 'shield' },
  { name: 'Taekwondo', category: 'Martial Arts', iconName: 'shield' },
  { name: 'Judo', category: 'Martial Arts', iconName: 'shield' },
  { name: 'Wrestling', category: 'Martial Arts', iconName: 'shield' },
  { name: 'Boxing', category: 'Martial Arts', iconName: 'shield' },
  { name: 'Wushu', category: 'Martial Arts', iconName: 'shield' },
  
  // Gymnastics
  { name: 'Artistic Gymnastics', category: 'Gymnastics', iconName: 'star' },
  { name: 'Rhythmic Gymnastics', category: 'Gymnastics', iconName: 'star' },
  { name: 'Trampoline', category: 'Gymnastics', iconName: 'star' },
  
  // Cycling
  { name: 'Road Cycling', category: 'Cycling', iconName: 'bicycle' },
  { name: 'Track Cycling', category: 'Cycling', iconName: 'bicycle' },
  { name: 'Mountain Bike', category: 'Cycling', iconName: 'bicycle' },
  { name: 'BMX', category: 'Cycling', iconName: 'bicycle' },
  
  // Other Sports
  { name: 'Weightlifting', category: 'Strength', iconName: 'dumbbell' },
  { name: 'Archery', category: 'Precision', iconName: 'target' },
  { name: 'Shooting', category: 'Precision', iconName: 'target' },
  { name: 'Fencing', category: 'Combat', iconName: 'sword' },
  { name: 'Sailing', category: 'Marine', iconName: 'anchor' },
  { name: 'Rowing', category: 'Marine', iconName: 'anchor' },
  { name: 'Canoe/Kayak', category: 'Marine', iconName: 'anchor' },
  { name: 'Golf', category: 'Precision', iconName: 'flag' },
  { name: 'Cricket', category: 'Ball Sports', iconName: 'circle' },
  { name: 'Hockey', category: 'Ball Sports', iconName: 'circle' },
  { name: 'Rugby', category: 'Ball Sports', iconName: 'circle' },
  { name: 'Baseball', category: 'Ball Sports', iconName: 'circle' },
  { name: 'Softball', category: 'Ball Sports', iconName: 'circle' },
  { name: 'Kabaddi', category: 'Traditional', iconName: 'users' },
  { name: 'Sepak Takraw', category: 'Traditional', iconName: 'users' }
];

export async function initializeBaseData() {
  try {
    console.log("Initializing base data (countries and sports)...");
    
    // Initialize countries
    const existingCountries = await storage.getCountries();
    let countriesCreated = 0;
    
    if (existingCountries.length === 0) {
      console.log("Seeding countries data...");
      for (const countryData of asianCountriesData) {
        try {
          await storage.createCountry({
            name: countryData.name,
            code: countryData.code,
            isActive: true
          });
          countriesCreated++;
        } catch (error: any) {
          // Skip if country already exists (duplicate code)
          if (!error.message?.includes('duplicate') && !error.message?.includes('unique')) {
            console.error(`Error creating country ${countryData.name}:`, error);
          }
        }
      }
      console.log(`✓ Created ${countriesCreated} countries in database`);
    } else {
      console.log(`✓ Countries already exist in database (${existingCountries.length} found)`);
    }
    
    // Initialize sports
    const existingSports = await storage.getSports();
    let sportsCreated = 0;
    
    if (existingSports.length === 0) {
      console.log("Seeding sports data...");
      for (const sportData of sportsData) {
        try {
          await storage.createSport({
            name: sportData.name,
            category: sportData.category,
            iconName: sportData.iconName,
            isActive: true
          });
          sportsCreated++;
        } catch (error: any) {
          // Skip if sport already exists (duplicate name)
          if (!error.message?.includes('duplicate') && !error.message?.includes('unique')) {
            console.error(`Error creating sport ${sportData.name}:`, error);
          }
        }
      }
      console.log(`✓ Created ${sportsCreated} sports in database`);
    } else {
      console.log(`✓ Sports already exist in database (${existingSports.length} found)`);
    }
    
    console.log("✓ Base data initialization completed successfully");
    
  } catch (error) {
    console.error("Error initializing base data:", error);
    throw error;
  }
}