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

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.createdAt));
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: { username: string; password: string; email?: string | null; firstName?: string | null; lastName?: string | null; role?: 'superadmin' | 'manager' | 'user' | 'customer'; countryCode?: string | null }): Promise<User> {
    const [user] = await db.insert(users).values({
      username: userData.username,
      password: userData.password,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      role: userData.role || 'customer',
      countryCode: userData.countryCode || null,
    }).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
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

  async getCountry(id: string): Promise<Country | undefined> {
    const [country] = await db.select().from(countries).where(eq(countries.id, id));
    return country;
  }

  async updateCountry(id: string, updates: Partial<InsertCountry>): Promise<Country> {
    const [updated] = await db
      .update(countries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(countries.id, id))
      .returning();
    return updated;
  }

  async deleteCountry(id: string): Promise<void> {
    await db.delete(countries).where(eq(countries.id, id));
  }

  // Sports operations
  async getSports(isActive?: boolean): Promise<Sport[]> {
    const query = db.select().from(sports);
    if (isActive !== undefined) {
      query.where(eq(sports.isActive, isActive));
    }
    return await query.orderBy(asc(sports.name));
  }

  async getSport(id: string): Promise<Sport | undefined> {
    const [sport] = await db.select().from(sports).where(eq(sports.id, id));
    return sport;
  }

  async createSport(sport: InsertSport): Promise<Sport> {
    const [newSport] = await db.insert(sports).values(sport).returning();
    return newSport;
  }

  async updateSport(id: string, updates: Partial<InsertSport>): Promise<Sport> {
    const [updated] = await db
      .update(sports)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(sports.id, id))
      .returning();
    return updated;
  }

  async deleteSport(id: string): Promise<void> {
    await db.delete(sports).where(eq(sports.id, id));
  }

  // Venue Types operations
  async getVenueTypes(isActive?: boolean): Promise<VenueType[]> {
    const query = db.select().from(venueTypes);
    if (isActive !== undefined) {
      query.where(eq(venueTypes.isActive, isActive));
    }
    return await query.orderBy(asc(venueTypes.name));
  }

  async getVenueType(id: string): Promise<VenueType | undefined> {
    const [venueType] = await db.select().from(venueTypes).where(eq(venueTypes.id, id));
    return venueType;
  }

  async createVenueType(venueTypeData: InsertVenueType): Promise<VenueType> {
    const [venueType] = await db.insert(venueTypes).values(venueTypeData).returning();
    return venueType;
  }

  async updateVenueType(id: string, updates: Partial<InsertVenueType>): Promise<VenueType> {
    const [venueType] = await db
      .update(venueTypes)
      .set(updates)
      .where(eq(venueTypes.id, id))
      .returning();
    return venueType;
  }

  async deleteVenueType(id: string): Promise<void> {
    await db.delete(venueTypes).where(eq(venueTypes.id, id));
  }

  // Team operations
  async getTeams(countryCode?: string): Promise<TeamWithDetails[]> {
    let query = db
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
      .leftJoin(sports, eq(teams.sportId, sports.id))
      .leftJoin(users, eq(teams.managerId, users.id));

    const conditions = [eq(teams.isActive, true)];
    if (countryCode) {
      conditions.push(eq(countries.code, countryCode));
    }
    
    const finalQuery = query.where(and(...conditions));

    const results = await finalQuery.orderBy(asc(teams.name));
    return results.map(row => ({
      ...row,
      country: row.country,
      sport: row.sport || undefined,
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
      .leftJoin(sports, eq(teams.sportId, sports.id))
      .leftJoin(users, eq(teams.managerId, users.id))
      .where(eq(teams.id, id));

    if (!result) return undefined;

    return {
      ...result,
      country: result.country,
      sport: result.sport || undefined,
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
        venueTypeId: venues.venueTypeId,
        location: venues.location,
        capacity: venues.capacity,
        description: venues.description,
        imageUrl: venues.imageUrl,
        attachmentUrl: venues.attachmentUrl,
        amenities: venues.amenities,
        workingStartTime: venues.workingStartTime,
        workingEndTime: venues.workingEndTime,
        bufferTimeMinutes: venues.bufferTimeMinutes,
        managerId: venues.managerId,
        isActive: venues.isActive,
        createdAt: venues.createdAt,
        updatedAt: venues.updatedAt,
        manager: users,
        venueType: venueTypes,
      })
      .from(venues)
      .leftJoin(users, eq(venues.managerId, users.id))
      .leftJoin(venueTypes, eq(venues.venueTypeId, venueTypes.id))
      .where(eq(venues.isActive, isActive))
      .orderBy(asc(venues.name));

    return results.map(row => ({
      ...row,
      manager: row.manager || undefined,
      venueType: row.venueType || undefined,
    }));
  }

  async getVenue(id: string): Promise<VenueWithDetails | undefined> {
    const [result] = await db
      .select({
        id: venues.id,
        name: venues.name,
        venueTypeId: venues.venueTypeId,
        location: venues.location,
        capacity: venues.capacity,
        description: venues.description,
        imageUrl: venues.imageUrl,
        attachmentUrl: venues.attachmentUrl,
        amenities: venues.amenities,
        workingStartTime: venues.workingStartTime,
        workingEndTime: venues.workingEndTime,
        bufferTimeMinutes: venues.bufferTimeMinutes,
        managerId: venues.managerId,
        isActive: venues.isActive,
        createdAt: venues.createdAt,
        updatedAt: venues.updatedAt,
        manager: users,
        venueType: venueTypes,
      })
      .from(venues)
      .leftJoin(users, eq(venues.managerId, users.id))
      .leftJoin(venueTypes, eq(venues.venueTypeId, venueTypes.id))
      .where(eq(venues.id, id));

    if (!result) return undefined;

    return {
      ...result,
      manager: result.manager || undefined,
      venueType: result.venueType || undefined,
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
        // sport field now part of teams table
        requester: users,
        approver: sql<User | null>`
          CASE 
            WHEN approver.id IS NOT NULL THEN 
              JSON_BUILD_OBJECT(
                'id', approver.id,
                'email', approver.email,
                'firstName', approver.first_name,
                'lastName', approver.last_name,
                'profileImageUrl', approver.profile_image_url,
                'role', approver.role,
                'countryCode', approver.country_code,
                'isActive', approver.is_active,
                'createdAt', approver.created_at,
                'updatedAt', approver.updated_at
              )
            ELSE NULL
          END
        `,
      })
      .from(bookings)
      .innerJoin(venues, eq(bookings.venueId, venues.id))
      .innerJoin(teams, eq(bookings.teamId, teams.id))
      .innerJoin(countries, eq(teams.countryId, countries.id))
      // sports join removed - sport is now a string field
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

    const finalQuery = conditions.length > 0 
      ? query.where(and(...conditions))
      : query;

    const results = await finalQuery.orderBy(desc(bookings.createdAt));

    return results.map(row => ({
      ...row,
      venue: row.venue,
      team: {
        ...row.team,
        country: row.country,
      },
      requester: row.requester,
      approver: row.approver || undefined,
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
        // sport field now part of teams table
        requester: users,
        approver: sql<User | null>`
          CASE 
            WHEN approver.id IS NOT NULL THEN 
              JSON_BUILD_OBJECT(
                'id', approver.id,
                'email', approver.email,
                'firstName', approver.first_name,
                'lastName', approver.last_name,
                'profileImageUrl', approver.profile_image_url,
                'role', approver.role,
                'countryCode', approver.country_code,
                'isActive', approver.is_active,
                'createdAt', approver.created_at,
                'updatedAt', approver.updated_at
              )
            ELSE NULL
          END
        `,
      })
      .from(bookings)
      .innerJoin(venues, eq(bookings.venueId, venues.id))
      .innerJoin(teams, eq(bookings.teamId, teams.id))
      .innerJoin(countries, eq(teams.countryId, countries.id))
      // sports join removed - sport is now a string field
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
      },
      requester: result.requester,
      approver: result.approver ? result.approver as User : undefined,
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
        // sport field now part of teams table
        requester: users,
      })
      .from(notifications)
      .leftJoin(bookings, eq(notifications.bookingId, bookings.id))
      .leftJoin(venues, eq(bookings.venueId, venues.id))
      .leftJoin(teams, eq(bookings.teamId, teams.id))
      .leftJoin(countries, eq(teams.countryId, countries.id))
      // sports join removed - sport is now a string field
      .leftJoin(users, eq(bookings.requesterId, users.id));

    const conditions = [eq(notifications.userId, userId)];
    if (unreadOnly) {
      conditions.push(eq(notifications.isRead, false));
    }
    
    const finalQuery = query.where(and(...conditions));

    const results = await finalQuery.orderBy(desc(notifications.createdAt));

    return results.map((row: any): NotificationWithDetails => ({
      ...row,
      booking: row.booking ? {
        ...row.booking,
        venue: row.venue,
        team: {
          ...row.team,
          country: row.country || {},
          sport: row.sport || {},
        },
        requester: row.requester,
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

    const finalQuery = conditions.length > 0
      ? query.where(and(...conditions))
      : query;

    return await finalQuery;
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
  
  // System configuration operations
  async getSystemConfig(): Promise<SystemConfig | undefined> {
    const [config] = await db.select().from(systemConfig).limit(1);
    return config;
  }

  async updateSystemConfig(configData: Partial<InsertSystemConfig>): Promise<SystemConfig> {
    // First check if config exists
    const existing = await this.getSystemConfig();
    
    // Remove any timestamp fields from configData to avoid conflicts
    const { createdAt, updatedAt, ...cleanConfigData } = configData as any;
    
    if (existing) {
      const [updated] = await db
        .update(systemConfig)
        .set({ ...cleanConfigData, updatedAt: new Date() })
        .where(eq(systemConfig.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(systemConfig)
        .values(cleanConfigData)
        .returning();
      return created;
    }
  }
  
  // Dashboard permissions operations
  async getDashboardPermissions(role?: string): Promise<DashboardPermission[]> {
    let query = db.select().from(dashboardPermissions).orderBy(asc(dashboardPermissions.role));
    
    const finalQuery = role
      ? query.where(eq(dashboardPermissions.role, role as any))
      : query;
    
    return await finalQuery;
  }

  async updateDashboardPermission(id: string, permissionData: Partial<DashboardPermission>): Promise<DashboardPermission> {
    const [updated] = await db
      .update(dashboardPermissions)
      .set({ ...permissionData, updatedAt: new Date() })
      .where(eq(dashboardPermissions.id, id))
      .returning();
    return updated;
  }

  async createDashboardPermission(permissionData: InsertDashboardPermission): Promise<DashboardPermission> {
    const [created] = await db
      .insert(dashboardPermissions)
      .values(permissionData)
      .returning();
    return created;
  }

  // Get available time slots for a venue on a specific date
  async getAvailableTimeSlots(venueId: string, date: string): Promise<{ startTime: string; endTime: string; available: boolean }[]> {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all bookings for this venue on this date
    const existingBookings = await db
      .select({
        startDateTime: bookings.startDateTime,
        endDateTime: bookings.endDateTime,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.venueId, venueId),
          gte(bookings.startDateTime, startOfDay),
          lte(bookings.startDateTime, endOfDay),
          eq(bookings.status, 'approved')
        )
      );

    // Generate hourly slots from 6 AM to 10 PM
    const timeSlots = [];
    for (let hour = 6; hour <= 22; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      const slotStart = new Date(targetDate);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(targetDate);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      // Check if this slot conflicts with any existing booking
      const hasConflict = existingBookings.some(booking => {
        const bookingStart = new Date(booking.startDateTime);
        const bookingEnd = new Date(booking.endDateTime);
        
        return (
          (slotStart >= bookingStart && slotStart < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (slotStart <= bookingStart && slotEnd >= bookingEnd)
        );
      });

      timeSlots.push({
        startTime,
        endTime,
        available: !hasConflict
      });
    }

    return timeSlots;
  }

  // Get admin emails for notifications
  async getAdminEmails(): Promise<string[]> {
    const admins = await db
      .select({ email: users.email })
      .from(users)
      .where(
        and(
          or(eq(users.role, 'superadmin'), eq(users.role, 'manager')),
          eq(users.isActive, true),
          sql`${users.email} IS NOT NULL AND ${users.email} != ''`
        )
      );

    return admins.map(admin => admin.email).filter(email => email) as string[];
  }
}

export const storage = new DatabaseStorage();
