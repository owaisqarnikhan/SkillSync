import {
  users,
  countries,
  sports,
  teams,
  venues,
  bookings,
  venueBlackouts,
  notifications,
  auditLogs,
  type User,
  type UpsertUser,
  type Country,
  type InsertCountry,
  type Sport,
  type InsertSport,
  type Team,
  type InsertTeam,
  type TeamWithDetails,
  type Venue,
  type InsertVenue,
  type VenueWithDetails,
  type Booking,
  type InsertBooking,
  type BookingWithDetails,
  type VenueBlackout,
  type InsertVenueBlackout,
  type Notification,
  type InsertNotification,
  type NotificationWithDetails,
  type AuditLog,
  type InsertAuditLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, or, sql, not } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Country operations
  getCountries(): Promise<Country[]>;
  createCountry(country: InsertCountry): Promise<Country>;
  
  // Sport operations
  getSports(): Promise<Sport[]>;
  createSport(sport: InsertSport): Promise<Sport>;
  
  // Team operations
  getTeams(countryCode?: string): Promise<TeamWithDetails[]>;
  getTeam(id: string): Promise<TeamWithDetails | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, updates: Partial<InsertTeam>): Promise<Team>;
  deleteTeam(id: string): Promise<void>;
  
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
  
  // Dashboard statistics
  getDashboardStats(userId: string): Promise<{
    activeBookings: number;
    pendingRequests: number;
    availableVenues: number;
    teamMembers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Country operations
  async getCountries(): Promise<Country[]> {
    return await db.select().from(countries).where(eq(countries.isActive, true)).orderBy(asc(countries.name));
  }

  async createCountry(country: InsertCountry): Promise<Country> {
    const [newCountry] = await db.insert(countries).values(country).returning();
    return newCountry;
  }

  // Sport operations
  async getSports(): Promise<Sport[]> {
    return await db.select().from(sports).where(eq(sports.isActive, true)).orderBy(asc(sports.name));
  }

  async createSport(sport: InsertSport): Promise<Sport> {
    const [newSport] = await db.insert(sports).values(sport).returning();
    return newSport;
  }

  // Team operations
  async getTeams(countryCode?: string): Promise<TeamWithDetails[]> {
    const query = db
      .select({
        id: teams.id,
        name: teams.name,
        countryId: teams.countryId,
        sportId: teams.sportId,
        managerId: teams.managerId,
        memberCount: teams.memberCount,
        description: teams.description,
        isActive: teams.isActive,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
        country: countries,
        sport: sports,
        manager: users,
      })
      .from(teams)
      .innerJoin(countries, eq(teams.countryId, countries.id))
      .innerJoin(sports, eq(teams.sportId, sports.id))
      .leftJoin(users, eq(teams.managerId, users.id))
      .where(eq(teams.isActive, true));

    if (countryCode) {
      query = query.where(and(eq(teams.isActive, true), eq(countries.code, countryCode)));
    }

    const results = await query.orderBy(asc(teams.name));
    return results.map(row => ({
      ...row,
      country: row.country,
      sport: row.sport,
      manager: row.manager || undefined,
    }));
  }

  async getTeam(id: string): Promise<TeamWithDetails | undefined> {
    const [result] = await db
      .select({
        id: teams.id,
        name: teams.name,
        countryId: teams.countryId,
        sportId: teams.sportId,
        managerId: teams.managerId,
        memberCount: teams.memberCount,
        description: teams.description,
        isActive: teams.isActive,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
        country: countries,
        sport: sports,
        manager: users,
      })
      .from(teams)
      .innerJoin(countries, eq(teams.countryId, countries.id))
      .innerJoin(sports, eq(teams.sportId, sports.id))
      .leftJoin(users, eq(teams.managerId, users.id))
      .where(eq(teams.id, id));

    if (!result) return undefined;

    return {
      ...result,
      country: result.country,
      sport: result.sport,
      manager: result.manager || undefined,
    };
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db.insert(teams).values(team).returning();
    return newTeam;
  }

  async updateTeam(id: string, updates: Partial<InsertTeam>): Promise<Team> {
    const [updatedTeam] = await db
      .update(teams)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(teams.id, id))
      .returning();
    return updatedTeam;
  }

  async deleteTeam(id: string): Promise<void> {
    await db.update(teams).set({ isActive: false, updatedAt: new Date() }).where(eq(teams.id, id));
  }

  // Venue operations
  async getVenues(isActive = true): Promise<VenueWithDetails[]> {
    const results = await db
      .select({
        id: venues.id,
        name: venues.name,
        type: venues.type,
        location: venues.location,
        capacity: venues.capacity,
        description: venues.description,
        amenities: venues.amenities,
        workingStartTime: venues.workingStartTime,
        workingEndTime: venues.workingEndTime,
        bufferTimeMinutes: venues.bufferTimeMinutes,
        managerId: venues.managerId,
        isActive: venues.isActive,
        createdAt: venues.createdAt,
        updatedAt: venues.updatedAt,
        manager: users,
      })
      .from(venues)
      .leftJoin(users, eq(venues.managerId, users.id))
      .where(eq(venues.isActive, isActive))
      .orderBy(asc(venues.name));

    return results.map(row => ({
      ...row,
      manager: row.manager || undefined,
    }));
  }

  async getVenue(id: string): Promise<VenueWithDetails | undefined> {
    const [result] = await db
      .select({
        id: venues.id,
        name: venues.name,
        type: venues.type,
        location: venues.location,
        capacity: venues.capacity,
        description: venues.description,
        amenities: venues.amenities,
        workingStartTime: venues.workingStartTime,
        workingEndTime: venues.workingEndTime,
        bufferTimeMinutes: venues.bufferTimeMinutes,
        managerId: venues.managerId,
        isActive: venues.isActive,
        createdAt: venues.createdAt,
        updatedAt: venues.updatedAt,
        manager: users,
      })
      .from(venues)
      .leftJoin(users, eq(venues.managerId, users.id))
      .where(eq(venues.id, id));

    if (!result) return undefined;

    return {
      ...result,
      manager: result.manager || undefined,
    };
  }

  async createVenue(venue: InsertVenue): Promise<Venue> {
    const [newVenue] = await db.insert(venues).values(venue).returning();
    return newVenue;
  }

  async updateVenue(id: string, updates: Partial<InsertVenue>): Promise<Venue> {
    const [updatedVenue] = await db
      .update(venues)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(venues.id, id))
      .returning();
    return updatedVenue;
  }

  async deleteVenue(id: string): Promise<void> {
    await db.update(venues).set({ isActive: false, updatedAt: new Date() }).where(eq(venues.id, id));
  }

  // Booking operations
  async getBookings(filters?: {
    userId?: string;
    teamId?: string;
    venueId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<BookingWithDetails[]> {
    let query = db
      .select({
        id: bookings.id,
        venueId: bookings.venueId,
        teamId: bookings.teamId,
        requesterId: bookings.requesterId,
        approverId: bookings.approverId,
        startDateTime: bookings.startDateTime,
        endDateTime: bookings.endDateTime,
        status: bookings.status,
        participantCount: bookings.participantCount,
        specialRequirements: bookings.specialRequirements,
        approvalNotes: bookings.approvalNotes,
        denialReason: bookings.denialReason,
        queuePosition: bookings.queuePosition,
        notificationsSent: bookings.notificationsSent,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        venue: venues,
        team: teams,
        country: countries,
        sport: sports,
        requester: users,
        approver: {
          id: sql<string>`approver.id`,
          email: sql<string>`approver.email`,
          firstName: sql<string>`approver.first_name`,
          lastName: sql<string>`approver.last_name`,
          profileImageUrl: sql<string>`approver.profile_image_url`,
          role: sql<string>`approver.role`,
          countryCode: sql<string>`approver.country_code`,
          isActive: sql<boolean>`approver.is_active`,
          createdAt: sql<Date>`approver.created_at`,
          updatedAt: sql<Date>`approver.updated_at`,
        },
      })
      .from(bookings)
      .innerJoin(venues, eq(bookings.venueId, venues.id))
      .innerJoin(teams, eq(bookings.teamId, teams.id))
      .innerJoin(countries, eq(teams.countryId, countries.id))
      .innerJoin(sports, eq(teams.sportId, sports.id))
      .innerJoin(users, eq(bookings.requesterId, users.id))
      .leftJoin(sql`users as approver`, sql`bookings.approver_id = approver.id`);

    const conditions = [];

    if (filters?.userId) {
      conditions.push(
        or(
          eq(bookings.requesterId, filters.userId),
          eq(bookings.approverId, filters.userId)
        )
      );
    }

    if (filters?.teamId) {
      conditions.push(eq(bookings.teamId, filters.teamId));
    }

    if (filters?.venueId) {
      conditions.push(eq(bookings.venueId, filters.venueId));
    }

    if (filters?.status) {
      conditions.push(eq(bookings.status, filters.status as any));
    }

    if (filters?.startDate) {
      conditions.push(gte(bookings.startDateTime, new Date(filters.startDate)));
    }

    if (filters?.endDate) {
      conditions.push(lte(bookings.endDateTime, new Date(filters.endDate)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(desc(bookings.createdAt));

    return results.map(row => ({
      ...row,
      venue: row.venue,
      team: {
        ...row.team,
        country: row.country,
        sport: row.sport,
      },
      requester: row.requester,
      approver: row.approver.id ? row.approver : undefined,
    }));
  }

  async getBooking(id: string): Promise<BookingWithDetails | undefined> {
    const [result] = await db
      .select({
        id: bookings.id,
        venueId: bookings.venueId,
        teamId: bookings.teamId,
        requesterId: bookings.requesterId,
        approverId: bookings.approverId,
        startDateTime: bookings.startDateTime,
        endDateTime: bookings.endDateTime,
        status: bookings.status,
        participantCount: bookings.participantCount,
        specialRequirements: bookings.specialRequirements,
        approvalNotes: bookings.approvalNotes,
        denialReason: bookings.denialReason,
        queuePosition: bookings.queuePosition,
        notificationsSent: bookings.notificationsSent,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        venue: venues,
        team: teams,
        country: countries,
        sport: sports,
        requester: users,
        approver: {
          id: sql<string>`approver.id`,
          email: sql<string>`approver.email`,
          firstName: sql<string>`approver.first_name`,
          lastName: sql<string>`approver.last_name`,
          profileImageUrl: sql<string>`approver.profile_image_url`,
          role: sql<string>`approver.role`,
          countryCode: sql<string>`approver.country_code`,
          isActive: sql<boolean>`approver.is_active`,
          createdAt: sql<Date>`approver.created_at`,
          updatedAt: sql<Date>`approver.updated_at`,
        },
      })
      .from(bookings)
      .innerJoin(venues, eq(bookings.venueId, venues.id))
      .innerJoin(teams, eq(bookings.teamId, teams.id))
      .innerJoin(countries, eq(teams.countryId, countries.id))
      .innerJoin(sports, eq(teams.sportId, sports.id))
      .innerJoin(users, eq(bookings.requesterId, users.id))
      .leftJoin(sql`users as approver`, sql`bookings.approver_id = approver.id`)
      .where(eq(bookings.id, id));

    if (!result) return undefined;

    return {
      ...result,
      venue: result.venue,
      team: {
        ...result.team,
        country: result.country,
        sport: result.sport,
      },
      requester: result.requester,
      approver: result.approver.id ? result.approver : undefined,
    };
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const bookingData = {
      ...booking,
      startDateTime: new Date(booking.startDateTime),
      endDateTime: new Date(booking.endDateTime),
    };
    
    const [newBooking] = await db.insert(bookings).values(bookingData).returning();
    return newBooking;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  async deleteBooking(id: string): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  async checkBookingConflicts(
    venueId: string,
    startDateTime: Date,
    endDateTime: Date,
    excludeBookingId?: string
  ): Promise<boolean> {
    const conditions = [
      eq(bookings.venueId, venueId),
      not(eq(bookings.status, 'denied')),
      not(eq(bookings.status, 'cancelled')),
      or(
        and(
          lte(bookings.startDateTime, startDateTime),
          gte(bookings.endDateTime, startDateTime)
        ),
        and(
          lte(bookings.startDateTime, endDateTime),
          gte(bookings.endDateTime, endDateTime)
        ),
        and(
          gte(bookings.startDateTime, startDateTime),
          lte(bookings.endDateTime, endDateTime)
        )
      )
    ];

    if (excludeBookingId) {
      conditions.push(not(eq(bookings.id, excludeBookingId)));
    }

    const conflicts = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(and(...conditions))
      .limit(1);

    return conflicts.length > 0;
  }

  // Venue blackout operations
  async getVenueBlackouts(venueId?: string): Promise<VenueBlackout[]> {
    const query = db.select().from(venueBlackouts).orderBy(asc(venueBlackouts.startDateTime));
    
    if (venueId) {
      return await query.where(eq(venueBlackouts.venueId, venueId));
    }
    
    return await query;
  }

  async createVenueBlackout(blackout: InsertVenueBlackout): Promise<VenueBlackout> {
    const [newBlackout] = await db.insert(venueBlackouts).values(blackout).returning();
    return newBlackout;
  }

  // Notification operations
  async getUserNotifications(userId: string, unreadOnly = false): Promise<NotificationWithDetails[]> {
    let query = db
      .select({
        id: notifications.id,
        userId: notifications.userId,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        bookingId: notifications.bookingId,
        isRead: notifications.isRead,
        emailSent: notifications.emailSent,
        createdAt: notifications.createdAt,
        booking: bookings,
        venue: venues,
        team: teams,
        country: countries,
        sport: sports,
        requester: users,
      })
      .from(notifications)
      .leftJoin(bookings, eq(notifications.bookingId, bookings.id))
      .leftJoin(venues, eq(bookings.venueId, venues.id))
      .leftJoin(teams, eq(bookings.teamId, teams.id))
      .leftJoin(countries, eq(teams.countryId, countries.id))
      .leftJoin(sports, eq(teams.sportId, sports.id))
      .leftJoin(users, eq(bookings.requesterId, users.id))
      .where(eq(notifications.userId, userId));

    if (unreadOnly) {
      query = query.where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    }

    const results = await query.orderBy(desc(notifications.createdAt));

    return results.map(row => ({
      ...row,
      booking: row.booking ? {
        ...row.booking,
        venue: row.venue!,
        team: row.team ? {
          ...row.team,
          country: row.country!,
          sport: row.sport!,
        } : undefined,
        requester: row.requester!,
      } : undefined,
    }));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
  }

  // Audit log operations
  async createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog> {
    const [newAuditLog] = await db.insert(auditLogs).values(auditLog).returning();
    return newAuditLog;
  }

  async getAuditLogs(filters?: {
    userId?: string;
    entityType?: string;
    entityId?: string;
  }): Promise<AuditLog[]> {
    let query = db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));

    const conditions = [];
    if (filters?.userId) conditions.push(eq(auditLogs.userId, filters.userId));
    if (filters?.entityType) conditions.push(eq(auditLogs.entityType, filters.entityType));
    if (filters?.entityId) conditions.push(eq(auditLogs.entityId, filters.entityId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  // Dashboard statistics
  async getDashboardStats(userId: string): Promise<{
    activeBookings: number;
    pendingRequests: number;
    availableVenues: number;
    teamMembers: number;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get active bookings count
    const activeBookingsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.requesterId, userId),
          eq(bookings.status, 'approved'),
          gte(bookings.endDateTime, new Date())
        )
      );

    // Get pending requests count
    const pendingRequestsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.requesterId, userId),
          or(
            eq(bookings.status, 'requested'),
            eq(bookings.status, 'pending')
          )
        )
      );

    // Get available venues count
    const availableVenuesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(venues)
      .where(eq(venues.isActive, true));

    // Get team members count (for teams managed by this user)
    const teamMembersResult = await db
      .select({ totalMembers: sql<number>`sum(member_count)` })
      .from(teams)
      .where(
        and(
          eq(teams.managerId, userId),
          eq(teams.isActive, true)
        )
      );

    return {
      activeBookings: activeBookingsResult[0]?.count || 0,
      pendingRequests: pendingRequestsResult[0]?.count || 0,
      availableVenues: availableVenuesResult[0]?.count || 0,
      teamMembers: teamMembersResult[0]?.totalMembers || 0,
    };
  }
}

export const storage = new DatabaseStorage();
