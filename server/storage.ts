import type {
  User,
  UpsertUser,
  Country,
  InsertCountry,
  Sport,
  InsertSport,
  VenueType,
  InsertVenueType,
  Team,
  InsertTeam,
  TeamWithDetails,
  Venue,
  InsertVenue,
  VenueWithDetails,
  Booking,
  InsertBooking,
  BookingWithDetails,
  VenueBlackout,
  InsertVenueBlackout,
  Notification,
  InsertNotification,
  NotificationWithDetails,
  AuditLog,
  InsertAuditLog,
  SystemConfig,
  InsertSystemConfig,
  DashboardPermission,
  InsertDashboardPermission,
  AdminBooking,
} from "@shared/types";

import { MemStorage } from "./memStorage";

export interface IStorage {
  // User operations (custom authentication)
  getAllUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: { username: string; password: string; email?: string | null; firstName?: string | null; lastName?: string | null; role?: 'superadmin' | 'manager' | 'user' | 'customer'; countryCode?: string | null }): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Country operations
  getCountries(): Promise<Country[]>;
  getCountry(id: string): Promise<Country | undefined>;
  createCountry(country: InsertCountry): Promise<Country>;
  updateCountry(id: string, updates: Partial<InsertCountry>): Promise<Country>;
  deleteCountry(id: string): Promise<void>;
  
  // Team operations
  getTeams(countryCode?: string): Promise<TeamWithDetails[]>;
  getTeam(id: string): Promise<TeamWithDetails | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, updates: Partial<InsertTeam>): Promise<Team>;
  deleteTeam(id: string): Promise<void>;
  
  // Sports operations
  getSports(isActive?: boolean): Promise<Sport[]>;
  getSport(id: string): Promise<Sport | undefined>;
  createSport(sport: InsertSport): Promise<Sport>;
  updateSport(id: string, updates: Partial<InsertSport>): Promise<Sport>;
  deleteSport(id: string): Promise<void>;
  
  // Venue Types operations
  getVenueTypes(isActive?: boolean): Promise<VenueType[]>;
  getVenueType(id: string): Promise<VenueType | undefined>;
  createVenueType(venueType: InsertVenueType): Promise<VenueType>;
  updateVenueType(id: string, updates: Partial<InsertVenueType>): Promise<VenueType>;
  deleteVenueType(id: string): Promise<void>;
  
  // Venue operations
  getVenues(isActive?: boolean): Promise<VenueWithDetails[]>;
  getVenue(id: string): Promise<VenueWithDetails | undefined>;
  createVenue(venue: InsertVenue): Promise<Venue>;
  updateVenue(id: string, updates: Partial<InsertVenue>): Promise<Venue>;
  deleteVenue(id: string): Promise<void>;
  
  // Booking operations
  getBookings(filters?: {
    userId?: string;
    teamId?: string;
    venueId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<BookingWithDetails[]>;
  getBooking(id: string): Promise<BookingWithDetails | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<Booking>): Promise<Booking>;
  deleteBooking(id: string): Promise<void>;
  checkBookingConflicts(venueId: string, startDateTime: Date, endDateTime: Date, excludeBookingId?: string): Promise<boolean>;
  getAvailableTimeSlots(venueId: string, date: string): Promise<{ startTime: string; endTime: string; available: boolean }[]>;
  getAdminEmails(): Promise<string[]>;
  
  // Super Admin booking operations
  createAdminBooking(adminBooking: AdminBooking, createdBy: string): Promise<{ 
    booking: Booking; 
    overriddenBooking?: Booking; 
    conflictingBookings?: BookingWithDetails[] 
  }>;
  checkBookingConflictsWithDetails(venueId: string, startDateTime: Date, endDateTime: Date): Promise<{
    hasConflict: boolean;
    conflictingBookings: BookingWithDetails[];
  }>;
  getSuggestedAlternativeSlots(venueId: string, startDateTime: Date, endDateTime: Date, duration: number): Promise<{
    startDateTime: Date;
    endDateTime: Date;
    venueId: string;
    venueName: string;
  }[]>;
  
  // Venue blackout operations
  getVenueBlackouts(venueId?: string): Promise<VenueBlackout[]>;
  createVenueBlackout(blackout: InsertVenueBlackout): Promise<VenueBlackout>;
  
  // Notification operations
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<NotificationWithDetails[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  
  // Audit log operations
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(filters?: { userId?: string; entityType?: string; entityId?: string }): Promise<AuditLog[]>;
  
  // System configuration operations
  getSystemConfig(): Promise<SystemConfig | undefined>;
  updateSystemConfig(config: Partial<InsertSystemConfig>): Promise<SystemConfig>;
  
  // Dashboard permissions operations
  getDashboardPermissions(role?: string): Promise<DashboardPermission[]>;
  updateDashboardPermission(id: string, permission: Partial<DashboardPermission>): Promise<DashboardPermission>;
  createDashboardPermission(permission: InsertDashboardPermission): Promise<DashboardPermission>;
  
  // Dashboard statistics
  getDashboardStats(userId: string): Promise<{
    activeBookings: number;
    pendingRequests: number;
    availableVenues: number;
    teamMembers: number;
  }>;
}

// Use MemStorage as the default implementation for development
export const storage: IStorage = new MemStorage();