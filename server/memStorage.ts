import { IStorage } from "./storage";
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

export class MemStorage implements IStorage {
  private users: User[] = [];
  private countries: Country[] = [];
  private sports: Sport[] = [];
  private teams: Team[] = [];
  private venueTypes: VenueType[] = [];
  private venues: Venue[] = [];
  private bookings: Booking[] = [];
  private venueBlackouts: VenueBlackout[] = [];
  private notifications: Notification[] = [];
  private auditLogs: AuditLog[] = [];
  private systemConfig: SystemConfig | null = null;
  private dashboardPermissions: DashboardPermission[] = [];

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // User operations
  async getAllUsers(): Promise<User[]> {
    return [...this.users];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(userData: { username: string; password: string; email?: string | null; firstName?: string | null; lastName?: string | null; role?: 'superadmin' | 'manager' | 'user' | 'customer'; countryCode?: string | null }): Promise<User> {
    const user: User = {
      id: this.generateId(),
      username: userData.username,
      email: userData.email || null,
      password: userData.password,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: null,
      role: userData.role || 'customer',
      countryCode: userData.countryCode || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      throw new Error(`User with id ${id} not found`);
    }
    this.users[index] = { ...this.users[index], ...updates, updatedAt: new Date() };
    return this.users[index];
  }

  async deleteUser(id: string): Promise<void> {
    const index = this.users.findIndex(user => user.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const existingIndex = this.users.findIndex(u => u.id === user.id);
    if (existingIndex !== -1) {
      this.users[existingIndex] = { ...this.users[existingIndex], ...user, updatedAt: new Date() };
      return this.users[existingIndex];
    } else {
      const newUser: User = { ...user, createdAt: new Date(), updatedAt: new Date() };
      this.users.push(newUser);
      return newUser;
    }
  }

  // Country operations
  async getCountries(): Promise<Country[]> {
    return this.countries.filter(country => country.isActive);
  }

  async getCountry(id: string): Promise<Country | undefined> {
    return this.countries.find(country => country.id === id);
  }

  async createCountry(countryData: InsertCountry): Promise<Country> {
    const country: Country = {
      ...countryData,
      id: this.generateId(),
      isActive: countryData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.countries.push(country);
    return country;
  }

  async updateCountry(id: string, updates: Partial<InsertCountry>): Promise<Country> {
    const index = this.countries.findIndex(country => country.id === id);
    if (index === -1) {
      throw new Error(`Country with id ${id} not found`);
    }
    this.countries[index] = { ...this.countries[index], ...updates, updatedAt: new Date() };
    return this.countries[index];
  }

  async deleteCountry(id: string): Promise<void> {
    const index = this.countries.findIndex(country => country.id === id);
    if (index !== -1) {
      this.countries.splice(index, 1);
    }
  }

  // Sports operations
  async getSports(isActive?: boolean): Promise<Sport[]> {
    return this.sports.filter(sport => isActive === undefined || sport.isActive === isActive);
  }

  async getSport(id: string): Promise<Sport | undefined> {
    return this.sports.find(sport => sport.id === id);
  }

  async createSport(sportData: InsertSport): Promise<Sport> {
    const sport: Sport = {
      ...sportData,
      id: this.generateId(),
      isActive: sportData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sports.push(sport);
    return sport;
  }

  async updateSport(id: string, updates: Partial<InsertSport>): Promise<Sport> {
    const index = this.sports.findIndex(sport => sport.id === id);
    if (index === -1) {
      throw new Error(`Sport with id ${id} not found`);
    }
    this.sports[index] = { ...this.sports[index], ...updates, updatedAt: new Date() };
    return this.sports[index];
  }

  async deleteSport(id: string): Promise<void> {
    const index = this.sports.findIndex(sport => sport.id === id);
    if (index !== -1) {
      this.sports.splice(index, 1);
    }
  }

  // Venue Types operations
  async getVenueTypes(isActive?: boolean): Promise<VenueType[]> {
    return this.venueTypes.filter(vt => isActive === undefined || vt.isActive === isActive);
  }

  async getVenueType(id: string): Promise<VenueType | undefined> {
    return this.venueTypes.find(vt => vt.id === id);
  }

  async createVenueType(venueTypeData: InsertVenueType): Promise<VenueType> {
    const venueType: VenueType = {
      ...venueTypeData,
      id: this.generateId(),
      isActive: venueTypeData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.venueTypes.push(venueType);
    return venueType;
  }

  async updateVenueType(id: string, updates: Partial<InsertVenueType>): Promise<VenueType> {
    const index = this.venueTypes.findIndex(vt => vt.id === id);
    if (index === -1) {
      throw new Error(`VenueType with id ${id} not found`);
    }
    this.venueTypes[index] = { ...this.venueTypes[index], ...updates, updatedAt: new Date() };
    return this.venueTypes[index];
  }

  async deleteVenueType(id: string): Promise<void> {
    const index = this.venueTypes.findIndex(vt => vt.id === id);
    if (index !== -1) {
      this.venueTypes.splice(index, 1);
    }
  }

  // Team operations
  async getTeams(countryCode?: string): Promise<TeamWithDetails[]> {
    const activeTeams = this.teams.filter(team => team.isActive);
    
    return activeTeams
      .filter(team => !countryCode || this.countries.find(c => c.id === team.countryId)?.code === countryCode)
      .map(team => {
        const country = this.countries.find(c => c.id === team.countryId)!;
        const sport = this.sports.find(s => s.id === team.sportId);
        const manager = team.managerId ? this.users.find(u => u.id === team.managerId) : undefined;
        
        return {
          ...team,
          country,
          sport,
          manager,
        };
      });
  }

  async getTeam(id: string): Promise<TeamWithDetails | undefined> {
    const team = this.teams.find(t => t.id === id);
    if (!team) return undefined;
    
    const country = this.countries.find(c => c.id === team.countryId)!;
    const sport = this.sports.find(s => s.id === team.sportId);
    const manager = team.managerId ? this.users.find(u => u.id === team.managerId) : undefined;
    
    return {
      ...team,
      country,
      sport,
      manager,
    };
  }

  async createTeam(teamData: InsertTeam): Promise<Team> {
    const team: Team = {
      ...teamData,
      id: this.generateId(),
      isActive: teamData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.teams.push(team);
    return team;
  }

  async updateTeam(id: string, updates: Partial<InsertTeam>): Promise<Team> {
    const index = this.teams.findIndex(team => team.id === id);
    if (index === -1) {
      throw new Error(`Team with id ${id} not found`);
    }
    this.teams[index] = { ...this.teams[index], ...updates, updatedAt: new Date() };
    return this.teams[index];
  }

  async deleteTeam(id: string): Promise<void> {
    const index = this.teams.findIndex(team => team.id === id);
    if (index !== -1) {
      this.teams[index] = { ...this.teams[index], isActive: false, updatedAt: new Date() };
    }
  }

  // Venue operations
  async getVenues(isActive = true): Promise<VenueWithDetails[]> {
    return this.venues
      .filter(venue => venue.isActive === isActive)
      .map(venue => {
        const manager = venue.managerId ? this.users.find(u => u.id === venue.managerId) : undefined;
        const venueType = this.venueTypes.find(vt => vt.id === venue.venueTypeId);
        
        return {
          ...venue,
          manager,
          venueType,
        };
      });
  }

  async getVenue(id: string): Promise<VenueWithDetails | undefined> {
    const venue = this.venues.find(v => v.id === id);
    if (!venue) return undefined;
    
    const manager = venue.managerId ? this.users.find(u => u.id === venue.managerId) : undefined;
    const venueType = this.venueTypes.find(vt => vt.id === venue.venueTypeId);
    
    return {
      ...venue,
      manager,
      venueType,
    };
  }

  async createVenue(venueData: InsertVenue): Promise<Venue> {
    const venue: Venue = {
      ...venueData,
      id: this.generateId(),
      isActive: venueData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.venues.push(venue);
    return venue;
  }

  async updateVenue(id: string, updates: Partial<InsertVenue>): Promise<Venue> {
    const index = this.venues.findIndex(venue => venue.id === id);
    if (index === -1) {
      throw new Error(`Venue with id ${id} not found`);
    }
    this.venues[index] = { ...this.venues[index], ...updates, updatedAt: new Date() };
    return this.venues[index];
  }

  async deleteVenue(id: string): Promise<void> {
    const index = this.venues.findIndex(venue => venue.id === id);
    if (index !== -1) {
      this.venues[index] = { ...this.venues[index], isActive: false, updatedAt: new Date() };
    }
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
    let filteredBookings = [...this.bookings];

    if (filters) {
      if (filters.userId) {
        filteredBookings = filteredBookings.filter(b => b.requesterId === filters.userId);
      }
      if (filters.teamId) {
        filteredBookings = filteredBookings.filter(b => b.teamId === filters.teamId);
      }
      if (filters.venueId) {
        filteredBookings = filteredBookings.filter(b => b.venueId === filters.venueId);
      }
      if (filters.status) {
        filteredBookings = filteredBookings.filter(b => b.status === filters.status);
      }
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredBookings = filteredBookings.filter(b => new Date(b.startDateTime) >= startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        filteredBookings = filteredBookings.filter(b => new Date(b.endDateTime) <= endDate);
      }
    }

    return filteredBookings.map(booking => {
      const venue = this.venues.find(v => v.id === booking.venueId)!;
      const team = this.teams.find(t => t.id === booking.teamId)!;
      const requester = this.users.find(u => u.id === booking.requesterId)!;
      const approver = booking.approverId ? this.users.find(u => u.id === booking.approverId) : undefined;

      return {
        ...booking,
        venue,
        team,
        requester,
        approver,
      };
    });
  }

  async getBooking(id: string): Promise<BookingWithDetails | undefined> {
    const booking = this.bookings.find(b => b.id === id);
    if (!booking) return undefined;

    const venue = this.venues.find(v => v.id === booking.venueId)!;
    const team = this.teams.find(t => t.id === booking.teamId)!;
    const requester = this.users.find(u => u.id === booking.requesterId)!;
    const approver = booking.approverId ? this.users.find(u => u.id === booking.approverId) : undefined;

    return {
      ...booking,
      venue,
      team,
      requester,
      approver,
    };
  }

  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const booking: Booking = {
      ...bookingData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bookings.push(booking);
    return booking;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    const index = this.bookings.findIndex(booking => booking.id === id);
    if (index === -1) {
      throw new Error(`Booking with id ${id} not found`);
    }
    this.bookings[index] = { ...this.bookings[index], ...updates, updatedAt: new Date() };
    return this.bookings[index];
  }

  async deleteBooking(id: string): Promise<void> {
    const index = this.bookings.findIndex(booking => booking.id === id);
    if (index !== -1) {
      this.bookings.splice(index, 1);
    }
  }

  async checkBookingConflicts(venueId: string, startDateTime: Date, endDateTime: Date, excludeBookingId?: string): Promise<boolean> {
    const conflictingBookings = this.bookings.filter(booking => 
      booking.venueId === venueId &&
      booking.id !== excludeBookingId &&
      booking.status === 'approved' &&
      ((new Date(booking.startDateTime) < endDateTime && new Date(booking.endDateTime) > startDateTime))
    );
    
    return conflictingBookings.length > 0;
  }

  async getAvailableTimeSlots(venueId: string, date: string): Promise<{ startTime: string; endTime: string; available: boolean }[]> {
    const venue = this.venues.find(v => v.id === venueId);
    if (!venue) return [];

    const slots = [];
    const startHour = parseInt(venue.workingStartTime.split(':')[0]);
    const endHour = parseInt(venue.workingEndTime.split(':')[0]);
    
    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(`${date}T${endTime}:00`);
      
      const hasConflict = await this.checkBookingConflicts(venueId, startDateTime, endDateTime);
      
      slots.push({
        startTime,
        endTime,
        available: !hasConflict
      });
    }
    
    return slots;
  }

  async getAdminEmails(): Promise<string[]> {
    return this.users
      .filter(user => user.role === 'superadmin' && user.email)
      .map(user => user.email!);
  }

  // Venue blackout operations
  async getVenueBlackouts(venueId?: string): Promise<VenueBlackout[]> {
    return this.venueBlackouts.filter(blackout => !venueId || blackout.venueId === venueId);
  }

  async createVenueBlackout(blackoutData: InsertVenueBlackout): Promise<VenueBlackout> {
    const blackout: VenueBlackout = {
      ...blackoutData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.venueBlackouts.push(blackout);
    return blackout;
  }

  // Notification operations
  async getUserNotifications(userId: string, unreadOnly?: boolean): Promise<NotificationWithDetails[]> {
    const userNotifications = this.notifications.filter(notification => 
      notification.userId === userId && 
      (!unreadOnly || !notification.readAt)
    );

    return userNotifications.map(notification => {
      const sender = notification.senderId ? this.users.find(u => u.id === notification.senderId) : undefined;
      return {
        ...notification,
        sender,
      };
    });
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      ...notificationData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.notifications.push(notification);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const index = this.notifications.findIndex(notification => notification.id === id);
    if (index !== -1) {
      this.notifications[index] = { 
        ...this.notifications[index], 
        readAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    this.notifications.forEach((notification, index) => {
      if (notification.userId === userId && !notification.readAt) {
        this.notifications[index] = {
          ...notification,
          readAt: new Date(),
          updatedAt: new Date()
        };
      }
    });
  }

  // Audit log operations
  async createAuditLog(auditLogData: InsertAuditLog): Promise<AuditLog> {
    const auditLog: AuditLog = {
      ...auditLogData,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.auditLogs.push(auditLog);
    return auditLog;
  }

  async getAuditLogs(filters?: { userId?: string; entityType?: string; entityId?: string }): Promise<AuditLog[]> {
    let filteredLogs = [...this.auditLogs];

    if (filters) {
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      if (filters.entityType) {
        filteredLogs = filteredLogs.filter(log => log.entityType === filters.entityType);
      }
      if (filters.entityId) {
        filteredLogs = filteredLogs.filter(log => log.entityId === filters.entityId);
      }
    }

    return filteredLogs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // System configuration operations
  async getSystemConfig(): Promise<SystemConfig | undefined> {
    return this.systemConfig || undefined;
  }

  async updateSystemConfig(configData: Partial<InsertSystemConfig>): Promise<SystemConfig> {
    if (this.systemConfig) {
      this.systemConfig = { ...this.systemConfig, ...configData, updatedAt: new Date() };
    } else {
      this.systemConfig = {
        ...configData as InsertSystemConfig,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return this.systemConfig;
  }

  // Dashboard permissions operations
  async getDashboardPermissions(role?: string): Promise<DashboardPermission[]> {
    return this.dashboardPermissions.filter(permission => !role || permission.role === role);
  }

  async updateDashboardPermission(id: string, updates: Partial<DashboardPermission>): Promise<DashboardPermission> {
    const index = this.dashboardPermissions.findIndex(permission => permission.id === id);
    if (index === -1) {
      throw new Error(`DashboardPermission with id ${id} not found`);
    }
    this.dashboardPermissions[index] = { ...this.dashboardPermissions[index], ...updates, updatedAt: new Date() };
    return this.dashboardPermissions[index];
  }

  async createDashboardPermission(permissionData: InsertDashboardPermission): Promise<DashboardPermission> {
    const permission: DashboardPermission = {
      ...permissionData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.dashboardPermissions.push(permission);
    return permission;
  }

  // Dashboard statistics
  async getDashboardStats(userId: string): Promise<{
    activeBookings: number;
    pendingRequests: number;
    availableVenues: number;
    teamMembers: number;
  }> {
    const user = this.users.find(u => u.id === userId);
    
    if (user?.role === 'superadmin') {
      return {
        activeBookings: this.bookings.filter(b => b.status === 'approved').length,
        pendingRequests: this.bookings.filter(b => b.status === 'pending' || b.status === 'requested').length,
        availableVenues: this.venues.filter(v => v.isActive).length,
        teamMembers: this.users.filter(u => u.isActive).length,
      };
    } else {
      const userTeams = this.teams.filter(t => t.managerId === userId);
      const teamIds = userTeams.map(t => t.id);
      
      return {
        activeBookings: this.bookings.filter(b => teamIds.includes(b.teamId) && b.status === 'approved').length,
        pendingRequests: this.bookings.filter(b => teamIds.includes(b.teamId) && (b.status === 'pending' || b.status === 'requested')).length,
        availableVenues: this.venues.filter(v => v.isActive).length,
        teamMembers: userTeams.reduce((sum, team) => sum + team.memberCount, 0),
      };
    }
  }
}