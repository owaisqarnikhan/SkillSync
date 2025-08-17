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
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingWithDetails extends Booking {
  venue: Venue;
  team: Team;
  requester: User;
  approver?: User;
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
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;

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

// DashboardPermission types
export interface DashboardPermission {
  id: string;
  role: 'superadmin' | 'manager' | 'user' | 'customer';
  resource: string;
  action: string;
  allowed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const insertDashboardPermissionSchema = z.object({
  role: z.enum(['superadmin', 'manager', 'user', 'customer']),
  resource: z.string(),
  action: z.string(),
  allowed: z.boolean(),
});

export type InsertDashboardPermission = z.infer<typeof insertDashboardPermissionSchema>;