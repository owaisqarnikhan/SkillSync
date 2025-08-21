import { z } from "zod";

// User types
export interface User {
  id: string;
  username: string;
  email: string | null;
  password: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: 'superadmin' | 'manager' | 'user' | 'customer';
  countryCode: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertUser extends User {}

export const insertUserSchema = z.object({
  username: z.string().min(1),
  email: z.string().email().optional().nullable(),
  password: z.string().min(6),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  role: z.enum(['superadmin', 'manager', 'user', 'customer']).default('customer'),
  countryCode: z.string().length(3).optional().nullable(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

// Country types
export interface Country {
  id: string;
  name: string;
  code: string;
  flagUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const insertCountrySchema = z.object({
  name: z.string().min(1),
  code: z.string().length(3),
  flagUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type InsertCountry = z.infer<typeof insertCountrySchema>;

// Sport types
export interface Sport {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const insertSportSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type InsertSport = z.infer<typeof insertSportSchema>;

// VenueType types
export interface VenueType {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const insertVenueTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type InsertVenueType = z.infer<typeof insertVenueTypeSchema>;

// Team types
export interface Team {
  id: string;
  name: string;
  countryId: string;
  sportId: string;
  managerId: string | null;
  memberCount: number;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamWithDetails extends Team {
  country: Country;
  sport?: Sport;
  manager?: User;
}

export const insertTeamSchema = z.object({
  name: z.string().min(1),
  countryId: z.string(),
  sportId: z.string(),
  managerId: z.string().optional().nullable(),
  memberCount: z.number().default(0),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type InsertTeam = z.infer<typeof insertTeamSchema>;

// Venue types
export interface Venue {
  id: string;
  name: string;
  venueTypeId: string;
  location: string | null;
  capacity: number;
  description: string | null;
  imageUrl: string | null;
  attachmentUrl: string | null;
  amenities: string[] | null;
  workingStartTime: string;
  workingEndTime: string;
  bufferTimeMinutes: number;
  managerId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VenueWithDetails extends Venue {
  manager?: User;
  venueType?: VenueType;
}

export const insertVenueSchema = z.object({
  name: z.string().min(1),
  venueTypeId: z.string(),
  location: z.string().optional().nullable(),
  capacity: z.number().min(1),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  attachmentUrl: z.string().url().optional().nullable(),
  amenities: z.array(z.string()).optional().nullable(),
  workingStartTime: z.string().default('06:00'),
  workingEndTime: z.string().default('22:00'),
  bufferTimeMinutes: z.number().default(15),
  managerId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type InsertVenue = z.infer<typeof insertVenueSchema>;

// Booking types
export interface Booking {
  id: string;
  venueId: string;
  teamId: string;
  requesterId: string;
  approverId: string | null;
  status: 'requested' | 'pending' | 'approved' | 'denied' | 'cancelled' | 'completed';
  startDateTime: Date;
  endDateTime: Date;
  purpose: string | null;
  notes: string | null;
  cancellationReason: string | null;
  queuePosition: number | null;
  estimatedWaitTime: number | null;
  participantCount: number | null;
  specialRequirements: string | null;
  createdBy: string | null; // Who created the booking (for Super Admin bookings)
  priority: 'normal' | 'high' | 'admin_override'; // Priority level for Super Admin bookings
  isAdminBooking: boolean; // Flag to indicate if booked by Super Admin
  overriddenBookingId: string | null; // Reference to original booking if this was an override
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingWithDetails extends Booking {
  venue: Venue;
  team: Team;
  requester: User;
  approver?: User;
  creator?: User; // User who created the booking (for Super Admin bookings)
  overriddenBooking?: Booking; // Original booking if this was an override
}

export const insertBookingSchema = z.object({
  venueId: z.string(),
  teamId: z.string(),
  requesterId: z.string(),
  approverId: z.string().optional().nullable(),
  status: z.enum(['requested', 'pending', 'approved', 'denied', 'cancelled', 'completed']).default('requested'),
  startDateTime: z.date(),
  endDateTime: z.date(),
  purpose: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  cancellationReason: z.string().optional().nullable(),
  queuePosition: z.number().optional().nullable(),
  estimatedWaitTime: z.number().optional().nullable(),
  participantCount: z.number().optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  priority: z.enum(['normal', 'high', 'admin_override']).default('normal'),
  isAdminBooking: z.boolean().default(false),
  overriddenBookingId: z.string().optional().nullable(),
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Super Admin Booking schema for creating bookings on behalf of teams
export const adminBookingSchema = z.object({
  venueId: z.string(),
  teamId: z.string(),
  startDateTime: z.date(),
  endDateTime: z.date(),
  purpose: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  participantCount: z.number().optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  priority: z.enum(['normal', 'high', 'admin_override']).default('high'),
  forceOverride: z.boolean().default(false), // For conflict resolution
});

export type AdminBooking = z.infer<typeof adminBookingSchema>;

// Conflict resolution response type
export interface BookingConflictResponse {
  hasConflict: boolean;
  conflictingBookings: BookingWithDetails[];
  suggestedSlots: {
    startDateTime: Date;
    endDateTime: Date;
    venueId: string;
    venueName: string;
  }[];
}

// VenueBlackout types
export interface VenueBlackout {
  id: string;
  venueId: string;
  startDateTime: Date;
  endDateTime: Date;
  reason: string | null;
  isRecurring: boolean;
  recurrencePattern: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const insertVenueBlackoutSchema = z.object({
  venueId: z.string(),
  startDateTime: z.date(),
  endDateTime: z.date(),
  reason: z.string().optional().nullable(),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.string().optional().nullable(),
  createdBy: z.string(),
});

export type InsertVenueBlackout = z.infer<typeof insertVenueBlackoutSchema>;

// Notification types
export interface Notification {
  id: string;
  userId: string;
  senderId: string | null;
  type: 'booking' | 'system' | 'reminder' | 'announcement' | 'booking_approved' | 'booking_denied' | 'booking_cancelled';
  title: string;
  message: string;
  data: any | null;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationWithDetails extends Notification {
  sender?: User;
}

export const insertNotificationSchema = z.object({
  userId: z.string(),
  senderId: z.string().optional().nullable(),
  type: z.enum(['booking', 'system', 'reminder', 'announcement', 'booking_approved', 'booking_denied', 'booking_cancelled']),
  title: z.string(),
  message: z.string(),
  data: z.any().optional().nullable(),
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// AuditLog types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: any | null;
  newValues: any | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export const insertAuditLogSchema = z.object({
  userId: z.string(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  oldValues: z.any().optional().nullable(),
  newValues: z.any().optional().nullable(),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// SystemConfig types
export interface SystemConfig {
  id: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  bookingWindowDays: number;
  maxBookingsPerUser: number;
  maxBookingHours: number;
  bookingRules: any | null;
  emailSettings: any | null;
  notificationSettings: any | null;
  // UI Configuration
  logoUrl: string | null;
  logoSize: 'small' | 'medium' | 'large' | 'xlarge';
  systemName: string | null;
  systemSubtitle: string | null;
  separatorImageUrl: string | null;
  // Login page customization
  loginHeading1: string | null;
  loginHeading2: string | null;
  loginHeading3: string | null;
  // Booking rules
  twoHourLimitEnabled: boolean;
  maxBookingDuration: number; // in hours
  createdAt: Date;
  updatedAt: Date;
}

export const insertSystemConfigSchema = z.object({
  maintenanceMode: z.boolean().default(false),
  registrationEnabled: z.boolean().default(true),
  bookingWindowDays: z.number().default(30),
  maxBookingsPerUser: z.number().default(10),
  maxBookingHours: z.number().default(4),
  bookingRules: z.any().optional().nullable(),
  emailSettings: z.any().optional().nullable(),
  notificationSettings: z.any().optional().nullable(),
  // UI Configuration
  logoUrl: z.string().optional().nullable(),
  logoSize: z.enum(['small', 'medium', 'large', 'xlarge']).default('medium'),
  systemName: z.string().optional().nullable(),
  systemSubtitle: z.string().optional().nullable(),
  separatorImageUrl: z.string().optional().nullable(),
  // Login page customization
  loginHeading1: z.string().optional().nullable(),
  loginHeading2: z.string().optional().nullable(),
  loginHeading3: z.string().optional().nullable(),
  // Booking rules
  twoHourLimitEnabled: z.boolean().default(false),
  maxBookingDuration: z.number().default(4), // in hours
});

export type InsertSystemConfig = z.infer<typeof insertSystemConfigSchema>;

// Permission types
export interface Permission {
  id: string;
  role: 'superadmin' | 'manager' | 'user' | 'customer';
  resource: string;
  action: string;
  allowed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy compatibility
export interface DashboardPermission extends Permission {}

// Permission Resources
export const PERMISSION_RESOURCES = {
  USERS: 'users',
  TEAMS: 'teams', 
  VENUES: 'venues',
  BOOKINGS: 'bookings',
  COUNTRIES: 'countries',
  SPORTS: 'sports',
  VENUE_TYPES: 'venue_types',
  SYSTEM_CONFIG: 'system_config',
  DASHBOARD_STATS: 'dashboard_stats',
  AUDIT_LOGS: 'audit_logs',
  NOTIFICATIONS: 'notifications',
  PERMISSIONS: 'permissions',
  PROFILE: 'profile'
} as const;

// Permission Actions
export const PERMISSION_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  DENY: 'deny',
  ASSIGN: 'assign',
  MANAGE: 'manage',
  VIEW_ALL: 'view_all',
  VIEW_OWN: 'view_own'
} as const;

export type PermissionResource = typeof PERMISSION_RESOURCES[keyof typeof PERMISSION_RESOURCES];
export type PermissionAction = typeof PERMISSION_ACTIONS[keyof typeof PERMISSION_ACTIONS];

export const insertPermissionSchema = z.object({
  role: z.enum(['superadmin', 'manager', 'user', 'customer']),
  resource: z.enum(Object.values(PERMISSION_RESOURCES) as [string, ...string[]]),
  action: z.enum(Object.values(PERMISSION_ACTIONS) as [string, ...string[]]),
  allowed: z.boolean(),
});

// Legacy compatibility
export const insertDashboardPermissionSchema = insertPermissionSchema;

export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type InsertDashboardPermission = InsertPermission;

// Default Permission Sets for each role
export const DEFAULT_PERMISSIONS = {
  superadmin: [
    // Full access to everything
    { resource: 'users', action: 'create', allowed: true },
    { resource: 'users', action: 'read', allowed: true },
    { resource: 'users', action: 'update', allowed: true },
    { resource: 'users', action: 'delete', allowed: true },
    { resource: 'users', action: 'manage', allowed: true },
    
    { resource: 'teams', action: 'create', allowed: true },
    { resource: 'teams', action: 'read', allowed: true },
    { resource: 'teams', action: 'update', allowed: true },
    { resource: 'teams', action: 'delete', allowed: true },
    { resource: 'teams', action: 'assign', allowed: true },
    
    { resource: 'venues', action: 'create', allowed: true },
    { resource: 'venues', action: 'read', allowed: true },
    { resource: 'venues', action: 'update', allowed: true },
    { resource: 'venues', action: 'delete', allowed: true },
    { resource: 'venues', action: 'manage', allowed: true },
    
    { resource: 'bookings', action: 'create', allowed: true },
    { resource: 'bookings', action: 'read', allowed: true },
    { resource: 'bookings', action: 'update', allowed: true },
    { resource: 'bookings', action: 'delete', allowed: true },
    { resource: 'bookings', action: 'approve', allowed: true },
    { resource: 'bookings', action: 'deny', allowed: true },
    
    { resource: 'system_config', action: 'read', allowed: true },
    { resource: 'system_config', action: 'update', allowed: true },
    
    { resource: 'dashboard_stats', action: 'read', allowed: true },
    { resource: 'audit_logs', action: 'read', allowed: true },
    { resource: 'permissions', action: 'manage', allowed: true },
    
    { resource: 'countries', action: 'create', allowed: true },
    { resource: 'countries', action: 'read', allowed: true },
    { resource: 'countries', action: 'update', allowed: true },
    { resource: 'countries', action: 'delete', allowed: true },
    
    { resource: 'sports', action: 'create', allowed: true },
    { resource: 'sports', action: 'read', allowed: true },
    { resource: 'sports', action: 'update', allowed: true },
    { resource: 'sports', action: 'delete', allowed: true },
    
    { resource: 'venue_types', action: 'create', allowed: true },
    { resource: 'venue_types', action: 'read', allowed: true },
    { resource: 'venue_types', action: 'update', allowed: true },
    { resource: 'venue_types', action: 'delete', allowed: true },
  ],
  manager: [
    // Limited user management
    { resource: 'users', action: 'read', allowed: true },
    { resource: 'users', action: 'view_own', allowed: true },
    
    // Team management for assigned teams
    { resource: 'teams', action: 'read', allowed: true },
    { resource: 'teams', action: 'update', allowed: true },
    { resource: 'teams', action: 'view_own', allowed: true },
    
    // Venue management for assigned venues
    { resource: 'venues', action: 'read', allowed: true },
    { resource: 'venues', action: 'update', allowed: true },
    { resource: 'venues', action: 'view_own', allowed: true },
    
    // Booking approval powers
    { resource: 'bookings', action: 'read', allowed: true },
    { resource: 'bookings', action: 'approve', allowed: true },
    { resource: 'bookings', action: 'deny', allowed: true },
    
    // Read access to reference data
    { resource: 'countries', action: 'read', allowed: true },
    { resource: 'sports', action: 'read', allowed: true },
    { resource: 'venue_types', action: 'read', allowed: true },
    
    { resource: 'dashboard_stats', action: 'read', allowed: true },
    { resource: 'notifications', action: 'read', allowed: true },
    { resource: 'profile', action: 'update', allowed: true }
  ],
  user: [
    // Basic user permissions
    { resource: 'teams', action: 'read', allowed: true },
    { resource: 'venues', action: 'read', allowed: true },
    
    // Booking management for own bookings
    { resource: 'bookings', action: 'create', allowed: true },
    { resource: 'bookings', action: 'view_own', allowed: true },
    { resource: 'bookings', action: 'update', allowed: true },
    
    // Reference data access
    { resource: 'countries', action: 'read', allowed: true },
    { resource: 'sports', action: 'read', allowed: true },
    { resource: 'venue_types', action: 'read', allowed: true },
    
    { resource: 'notifications', action: 'read', allowed: true },
    { resource: 'profile', action: 'update', allowed: true }
  ],
  customer: [
    // NOC user permissions - similar to user but country-restricted
    { resource: 'teams', action: 'read', allowed: true },
    { resource: 'venues', action: 'read', allowed: true },
    
    // Booking management for own bookings
    { resource: 'bookings', action: 'create', allowed: true },
    { resource: 'bookings', action: 'view_own', allowed: true },
    
    // Reference data access
    { resource: 'countries', action: 'read', allowed: true },
    { resource: 'sports', action: 'read', allowed: true },
    { resource: 'venue_types', action: 'read', allowed: true },
    
    { resource: 'notifications', action: 'read', allowed: true },
    { resource: 'profile', action: 'update', allowed: true }
  ]
} as const;