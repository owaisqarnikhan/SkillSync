import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./customAuth";
import { 
  insertBookingSchema,
  insertTeamSchema,
  insertVenueSchema,
  insertCountrySchema,
  insertSportSchema,
  insertNotificationSchema,
  insertAuditLogSchema,
} from "@shared/schema";
import { z } from "zod";

// Helper function to create audit log
async function createAuditLog(
  req: any,
  action: string,
  entityType: string,
  entityId: string,
  oldValues?: any,
  newValues?: any
) {
  try {
    await storage.createAuditLog({
      userId: req.user?.id,
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Initialize system configuration
  const { initializeSystemConfig } = await import('./init-system-config');
  await initializeSystemConfig();
  
  // Initialize default users
  const { initializeDefaultUsers } = await import('./init-users');
  await initializeDefaultUsers();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard statistics
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Countries routes
  app.get('/api/countries', isAuthenticated, async (req, res) => {
    try {
      const countries = await storage.getCountries();
      res.json(countries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      res.status(500).json({ message: "Failed to fetch countries" });
    }
  });

  app.post('/api/countries', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertCountrySchema.parse(req.body);
      const country = await storage.createCountry(validatedData);
      
      await createAuditLog(req, 'CREATE', 'country', country.id, null, validatedData);
      
      res.status(201).json(country);
    } catch (error) {
      console.error("Error creating country:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create country" });
    }
  });

  // Sports routes
  app.get('/api/sports', isAuthenticated, async (req, res) => {
    try {
      const sports = await storage.getSports();
      res.json(sports);
    } catch (error) {
      console.error("Error fetching sports:", error);
      res.status(500).json({ message: "Failed to fetch sports" });
    }
  });

  app.post('/api/sports', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertSportSchema.parse(req.body);
      const sport = await storage.createSport(validatedData);
      
      await createAuditLog(req, 'CREATE', 'sport', sport.id, null, validatedData);
      
      res.status(201).json(sport);
    } catch (error) {
      console.error("Error creating sport:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sport" });
    }
  });

  // Teams routes
  app.get('/api/teams', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      const countryCode = req.query.country as string;
      
      // Customers can only see their own country's teams
      const filterCountry = user?.role === 'customer' ? (user.countryCode || undefined) : (countryCode || undefined);
      
      const teams = await storage.getTeams(filterCountry);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.get('/api/teams/:id', isAuthenticated, async (req: any, res) => {
    try {
      const team = await storage.getTeam(req.params.id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      const user = await storage.getUser(req.user.id);
      // Check permissions
      if (user?.role === 'customer' && team.country.code !== user.countryCode) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(team);
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  app.post('/api/teams', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role === 'customer') {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(validatedData);
      
      await createAuditLog(req, 'CREATE', 'team', team.id, null, validatedData);
      
      res.status(201).json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create team" });
    }
  });

  app.put('/api/teams/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      const existingTeam = await storage.getTeam(req.params.id);
      
      if (!existingTeam) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Check permissions
      if (user?.role === 'customer' || 
          (user?.role === 'manager' && existingTeam.managerId !== user.id)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertTeamSchema.partial().parse(req.body);
      const updatedTeam = await storage.updateTeam(req.params.id, validatedData);
      
      await createAuditLog(req, 'UPDATE', 'team', req.params.id, existingTeam, validatedData);
      
      res.json(updatedTeam);
    } catch (error) {
      console.error("Error updating team:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update team" });
    }
  });

  app.delete('/api/teams/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const existingTeam = await storage.getTeam(req.params.id);
      if (!existingTeam) {
        return res.status(404).json({ message: "Team not found" });
      }

      await storage.deleteTeam(req.params.id);
      await createAuditLog(req, 'DELETE', 'team', req.params.id, existingTeam, null);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting team:", error);
      res.status(500).json({ message: "Failed to delete team" });
    }
  });

  // Venues routes
  app.get('/api/venues', isAuthenticated, async (req, res) => {
    try {
      const venues = await storage.getVenues();
      res.json(venues);
    } catch (error) {
      console.error("Error fetching venues:", error);
      res.status(500).json({ message: "Failed to fetch venues" });
    }
  });

  app.get('/api/venues/:id', isAuthenticated, async (req, res) => {
    try {
      const venue = await storage.getVenue(req.params.id);
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      res.json(venue);
    } catch (error) {
      console.error("Error fetching venue:", error);
      res.status(500).json({ message: "Failed to fetch venue" });
    }
  });

  app.post('/api/venues', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role === 'customer') {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertVenueSchema.parse(req.body);
      const venue = await storage.createVenue(validatedData);
      
      await createAuditLog(req, 'CREATE', 'venue', venue.id, null, validatedData);
      
      res.status(201).json(venue);
    } catch (error) {
      console.error("Error creating venue:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create venue" });
    }
  });

  app.put('/api/venues/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      const existingVenue = await storage.getVenue(req.params.id);
      
      if (!existingVenue) {
        return res.status(404).json({ message: "Venue not found" });
      }

      // Check permissions
      if (user?.role === 'customer' || 
          (user?.role === 'manager' && existingVenue.managerId !== user.id)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertVenueSchema.partial().parse(req.body);
      const updatedVenue = await storage.updateVenue(req.params.id, validatedData);
      
      await createAuditLog(req, 'UPDATE', 'venue', req.params.id, existingVenue, validatedData);
      
      res.json(updatedVenue);
    } catch (error) {
      console.error("Error updating venue:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update venue" });
    }
  });

  app.delete('/api/venues/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const existingVenue = await storage.getVenue(req.params.id);
      if (!existingVenue) {
        return res.status(404).json({ message: "Venue not found" });
      }

      await storage.deleteVenue(req.params.id);
      await createAuditLog(req, 'DELETE', 'venue', req.params.id, existingVenue, null);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting venue:", error);
      res.status(500).json({ message: "Failed to delete venue" });
    }
  });

  // Bookings routes
  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      const filters: any = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        status: req.query.status as string,
        venueId: req.query.venueId as string,
        teamId: req.query.teamId as string,
      };

      // Apply role-based filtering
      if (user?.role === 'customer') {
        filters.userId = userId;
      } else if (user?.role === 'manager') {
        // Managers can see bookings for venues/teams they manage
        // This would need more complex logic in a real implementation
        filters.userId = userId;
      }

      const bookings = await storage.getBookings(filters);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const userId = req.user.id;
      const user = await storage.getUser(userId);

      // Check permissions
      if (user?.role === 'customer' && booking.requesterId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertBookingSchema.parse({
        ...req.body,
        requesterId: userId,
      });

      // Check for conflicts
      const hasConflicts = await storage.checkBookingConflicts(
        validatedData.venueId,
        new Date(validatedData.startDateTime),
        new Date(validatedData.endDateTime)
      );

      if (hasConflicts) {
        return res.status(409).json({ message: "Booking conflicts with existing reservations" });
      }

      // Check system configuration for booking duration limits
      const systemConfig = await storage.getSystemConfig();
      
      if (systemConfig?.twoHourLimitEnabled) {
        const startTime = new Date(validatedData.startDateTime);
        const endTime = new Date(validatedData.endDateTime);
        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

        if (durationHours > 2) {
          return res.status(400).json({ message: "Booking duration cannot exceed 2 hours" });
        }
      }

      const booking = await storage.createBooking(validatedData);
      
      // Create notification for managers
      await storage.createNotification({
        userId: userId, // This would be updated to notify relevant managers
        type: 'booking_requested',
        title: 'New Booking Request',
        message: `New booking request for ${validatedData.venueId}`,
        bookingId: booking.id,
      });

      await createAuditLog(req, 'CREATE', 'booking', booking.id, null, validatedData);
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.put('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const existingBooking = await storage.getBooking(req.params.id);
      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const userId = req.user.id;
      const user = await storage.getUser(userId);

      // Check permissions
      if (user?.role === 'customer' && existingBooking.requesterId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates = req.body;
      
      // If approving/denying, ensure user has permission
      if (updates.status && ['approved', 'denied'].includes(updates.status)) {
        if (user?.role === 'customer') {
          return res.status(403).json({ message: "Cannot approve/deny bookings" });
        }
        updates.approverId = userId;
      }

      const updatedBooking = await storage.updateBooking(req.params.id, updates);
      
      // Create notification
      if (updates.status) {
        const notificationType = updates.status === 'approved' ? 'booking_approved' : 'booking_denied';
        await storage.createNotification({
          userId: existingBooking.requesterId,
          type: notificationType,
          title: `Booking ${updates.status}`,
          message: `Your booking has been ${updates.status}`,
          bookingId: req.params.id,
        });
      }

      await createAuditLog(req, 'UPDATE', 'booking', req.params.id, existingBooking, updates);
      
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  app.delete('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const existingBooking = await storage.getBooking(req.params.id);
      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const userId = req.user.id;
      const user = await storage.getUser(userId);

      // Check permissions
      if (user?.role === 'customer' && existingBooking.requesterId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteBooking(req.params.id);
      
      // Create notification
      await storage.createNotification({
        userId: existingBooking.requesterId,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: 'Your booking has been cancelled',
        bookingId: req.params.id,
      });

      await createAuditLog(req, 'DELETE', 'booking', req.params.id, existingBooking, null);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  // Notifications routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const unreadOnly = req.query.unreadOnly === 'true';
      const notifications = await storage.getUserNotifications(userId, unreadOnly);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put('/api/notifications/mark-all-read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.markAllNotificationsAsRead(userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // System configuration routes
  // Public endpoint for login page configuration
  app.get('/api/system/config', async (req, res) => {
    try {
      const config = await storage.getSystemConfig();
      // Only return public config fields for login page
      const publicConfig = {
        loginHeading1: config?.loginHeading1,
        loginHeading2: config?.loginHeading2, 
        loginHeading3: config?.loginHeading3,
        logoUrl: config?.logoUrl,
        separatorImageUrl: config?.separatorImageUrl,
      };
      res.json(publicConfig);
    } catch (error) {
      console.error("Error fetching system config:", error);
      res.status(500).json({ message: "Failed to fetch system configuration" });
    }
  });
  
  // SuperAdmin only endpoint for full system config
  app.get('/api/system/config/admin', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const config = await storage.getSystemConfig();
      res.json(config);
    } catch (error) {
      console.error("Error fetching system config:", error);
      res.status(500).json({ message: "Failed to fetch system configuration" });
    }
  });

  app.put('/api/system/config', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const config = await storage.updateSystemConfig(req.body);
      await createAuditLog(req, 'UPDATE', 'system_config', config.id, null, req.body);
      res.json(config);
    } catch (error) {
      console.error("Error updating system config:", error);
      res.status(500).json({ message: "Failed to update system configuration" });
    }
  });

  // Dashboard permissions routes (SuperAdmin only)
  app.get('/api/dashboard/permissions', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const permissions = await storage.getDashboardPermissions();
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching dashboard permissions:", error);
      res.status(500).json({ message: "Failed to fetch dashboard permissions" });
    }
  });

  app.put('/api/dashboard/permissions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const permission = await storage.updateDashboardPermission(req.params.id, req.body);
      await createAuditLog(req, 'UPDATE', 'dashboard_permission', req.params.id, null, req.body);
      res.json(permission);
    } catch (error) {
      console.error("Error updating dashboard permission:", error);
      res.status(500).json({ message: "Failed to update dashboard permission" });
    }
  });

  // User management routes (SuperAdmin only)
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // This would need a new method in storage to get all users
      // For now, we'll return an empty array
      res.json([]);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (currentUser?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.upsertUser({
        ...targetUser,
        ...req.body,
        id: req.params.id,
        updatedAt: new Date(),
      });
      
      await createAuditLog(req, 'UPDATE', 'user', req.params.id, targetUser, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Audit logs routes (SuperAdmin only)
  app.get('/api/audit-logs', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const filters = {
        userId: req.query.userId as string,
        entityType: req.query.entityType as string,
        entityId: req.query.entityId as string,
      };

      const auditLogs = await storage.getAuditLogs(filters);
      res.json(auditLogs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
