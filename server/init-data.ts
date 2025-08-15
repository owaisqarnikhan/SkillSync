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

// Sports data removed - teams now store sport as string field directly

export async function initializeBaseData() {
  try {
    console.log("Initializing base data (countries only)...");
    
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
    
    // Sports initialization removed - teams now store sport as string field directly
    console.log("✓ Sports table removed - teams are now standalone with sport string fields");
    
    console.log("✓ Base data initialization completed successfully");
    
  } catch (error) {
    console.error("Error initializing base data:", error);
    throw error;
  }
}