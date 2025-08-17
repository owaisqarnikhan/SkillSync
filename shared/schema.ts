import { sql } from 'drizzle-orm';
import { 
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  time,
  pgEnum
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['superadmin', 'manager', 'user', 'customer']);

// Users table for custom authentication and role management
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email").unique(),
  password: varchar("password").notNull(), // Hashed password
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('customer').notNull(),
  countryCode: varchar("country_code", { length: 3 }), // ISO 3-letter country code
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Countries table
export const countries = pgTable("countries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 3 }).notNull().unique(), // ISO 3-letter code
  flagUrl: varchar("flag_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sports table for centralized sports management
export const sports = pgTable("sports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }), // e.g., "Aquatics", "Athletics"
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Teams table (now links to sports table)
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  countryId: varchar("country_id").notNull().references(() => countries.id),
  sportId: varchar("sport_id").notNull().references(() => sports.id),
  managerId: varchar("manager_id").references(() => users.id), // Team manager
  memberCount: integer("member_count").default(0).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Venue types table (replaces enum for better management)
export const venueTypes = pgTable("venue_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Venues table
export const venues = pgTable("venues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  venueTypeId: varchar("venue_type_id").notNull().references(() => venueTypes.id),
  location: varchar("location", { length: 200 }),
  capacity: integer("capacity").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"), // Venue image URL
  attachmentUrl: varchar("attachment_url"), // Venue attachment file URL
  amenities: text("amenities").array(), // Array of amenity strings
  workingStartTime: time("working_start_time").default('06:00').notNull(),
  workingEndTime: time("working_end_time").default('22:00').notNull(),
  bufferTimeMinutes: integer("buffer_time_minutes").default(15).notNull(), // Buffer between sessions
  managerId: varchar("manager_id").references(() => users.id), // Venue manager
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Booking status enum
export const bookingStatusEnum = pgEnum('booking_status', [
  'requested', 'pending', 'approved', 'denied', 'cancelled', 'completed'
]);

// Bookings table
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  venueId: varchar("venue_id").notNull().references(() => venues.id),
  teamId: varchar("team_id").notNull().references(() => teams.id),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  approverId: varchar("approver_id").references(() => users.id),
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time").notNull(),
  status: bookingStatusEnum("status").default('requested').notNull(),
  participantCount: integer("participant_count").notNull(),
  specialRequirements: text("special_requirements"),
  approvalNotes: text("approval_notes"),
  denialReason: text("denial_reason"),
  queuePosition: integer("queue_position"), // For queueing system
  notificationsSent: boolean("notifications_sent").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Venue blackout periods (maintenance, events, etc.)
export const venueBlackouts = pgTable("venue_blackouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  venueId: varchar("venue_id").notNull().references(() => venues.id),
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time").notNull(),
  reason: varchar("reason", { length: 200 }).notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notification types enum
export const notificationTypeEnum = pgEnum('notification_type', [
  'booking_approved', 'booking_denied', 'booking_cancelled', 'booking_reminder',
  'booking_requested', 'system_alert'
]);

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  bookingId: varchar("booking_id").references(() => bookings.id),
  isRead: boolean("is_read").default(false).notNull(),
  emailSent: boolean("email_sent").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// System configuration table
export const systemConfig = pgTable("system_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loginHeading1: varchar("login_heading_1", { length: 200 }).default('Welcome to').notNull(),
  loginHeading2: varchar("login_heading_2", { length: 200 }).default('Bahrain Asian Youth Games 2025').notNull(),
  loginHeading3: varchar("login_heading_3", { length: 200 }).default('Training Management System').notNull(),
  logoUrl: varchar("logo_url"),
  logoSize: varchar("logo_size", { length: 20 }).default('medium').notNull(), // small, medium, large, xlarge
  separatorImageUrl: varchar("separator_image_url"),
  smtpHost: varchar("smtp_host"),
  smtpPort: integer("smtp_port").default(587),
  smtpUsername: varchar("smtp_username"),
  smtpPassword: varchar("smtp_password"),
  smtpFromEmail: varchar("smtp_from_email"),
  smtpFromName: varchar("smtp_from_name").default('Training Management System'),
  smtpSecure: boolean("smtp_secure").default(true).notNull(),
  twoHourLimitEnabled: boolean("two_hour_limit_enabled").default(true).notNull(),
  maxBookingDuration: integer("max_booking_duration").default(2).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dashboard permissions table
export const dashboardPermissions = pgTable("dashboard_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: userRoleEnum("role").notNull(),
  dashboardType: varchar("dashboard_type", { length: 50 }).notNull(), // 'user', 'manager', 'superadmin'
  canAccess: boolean("can_access").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Audit logs for tracking changes
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(), // CREATE, UPDATE, DELETE
  entityType: varchar("entity_type", { length: 50 }).notNull(), // booking, venue, team, etc.
  entityId: varchar("entity_id").notNull(),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  country: one(countries, {
    fields: [users.countryCode],
    references: [countries.code],
  }),
  managedTeams: many(teams, { relationName: "teamManager" }),
  managedVenues: many(venues, { relationName: "venueManager" }),
  bookingRequests: many(bookings, { relationName: "bookingRequester" }),
  bookingApprovals: many(bookings, { relationName: "bookingApprover" }),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
}));

export const countriesRelations = relations(countries, ({ many }) => ({
  users: many(users),
  teams: many(teams),
}));

export const venueTypesRelations = relations(venueTypes, ({ many }) => ({
  venues: many(venues),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  country: one(countries, {
    fields: [teams.countryId],
    references: [countries.id],
  }),
  sport: one(sports, {
    fields: [teams.sportId],
    references: [sports.id],
  }),
  manager: one(users, {
    fields: [teams.managerId],
    references: [users.id],
    relationName: "teamManager",
  }),
  bookings: many(bookings),
}));

export const venuesRelations = relations(venues, ({ one, many }) => ({
  venueType: one(venueTypes, {
    fields: [venues.venueTypeId],
    references: [venueTypes.id],
  }),
  manager: one(users, {
    fields: [venues.managerId],
    references: [users.id],
    relationName: "venueManager",
  }),
  bookings: many(bookings),
  blackouts: many(venueBlackouts),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  venue: one(venues, {
    fields: [bookings.venueId],
    references: [venues.id],
  }),
  team: one(teams, {
    fields: [bookings.teamId],
    references: [teams.id],
  }),
  requester: one(users, {
    fields: [bookings.requesterId],
    references: [users.id],
    relationName: "bookingRequester",
  }),
  approver: one(users, {
    fields: [bookings.approverId],
    references: [users.id],
    relationName: "bookingApprover",
  }),
  notifications: many(notifications),
}));

export const venueBlackoutsRelations = relations(venueBlackouts, ({ one }) => ({
  venue: one(venues, {
    fields: [venueBlackouts.venueId],
    references: [venues.id],
  }),
  creator: one(users, {
    fields: [venueBlackouts.createdBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [notifications.bookingId],
    references: [bookings.id],
  }),
}));

export const systemConfigRelations = relations(systemConfig, ({ many }) => ({
  // System config is standalone
}));

export const dashboardPermissionsRelations = relations(dashboardPermissions, ({ one }) => ({
  // Dashboard permissions are standalone role-based config
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCountrySchema = createInsertSchema(countries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Sport schemas
export const insertSportSchema = createInsertSchema(sports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVenueTypeSchema = createInsertSchema(venueTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVenueSchema = createInsertSchema(venues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approverId: true,
  status: true,
  approvalNotes: true,
  denialReason: true,
  queuePosition: true,
  notificationsSent: true,
}).extend({
  startDateTime: z.string(),
  endDateTime: z.string(),
});

export const insertVenueBlackoutSchema = createInsertSchema(venueBlackouts).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertSystemConfigSchema = createInsertSchema(systemConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDashboardPermissionSchema = createInsertSchema(dashboardPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Country = typeof countries.$inferSelect;
export type Sport = typeof sports.$inferSelect;
export type VenueType = typeof venueTypes.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Venue = typeof venues.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type VenueBlackout = typeof venueBlackouts.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type SystemConfig = typeof systemConfig.$inferSelect;
export type DashboardPermission = typeof dashboardPermissions.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type InsertSport = z.infer<typeof insertSportSchema>;
export type InsertVenueType = z.infer<typeof insertVenueTypeSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertVenueBlackout = z.infer<typeof insertVenueBlackoutSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type InsertSystemConfig = z.infer<typeof insertSystemConfigSchema>;
export type InsertDashboardPermission = z.infer<typeof insertDashboardPermissionSchema>;

// Extended types for joins
export type BookingWithDetails = Booking & {
  venue: Venue;
  team: Team & { country: Country };
  requester: User;
  approver?: User;
};

export type TeamWithDetails = Team & {
  country: Country;
  sport?: Sport;
  manager?: User;
};

export type VenueWithDetails = Venue & {
  venueType?: VenueType;
  manager?: User;
};

export type NotificationWithDetails = Notification & {
  booking?: BookingWithDetails;
};
