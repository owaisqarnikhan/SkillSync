import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword, comparePasswords } from "./customAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { emailService } from "./emailService";
import { reminderService } from "./reminderService";
import { 
  insertBookingSchema,
  insertTeamSchema,
  insertVenueSchema,
  insertCountrySchema,
  insertNotificationSchema,
  insertAuditLogSchema,
  insertSportSchema,
  insertVenueTypeSchema,
  type Sport,
  type InsertSport,
  type VenueType,
  type InsertVenueType,
} from "@shared/schema";
import { z } from "zod";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'temp');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for local file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

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
  
  // Initialize base data (countries and sports)
  const { initializeBaseData } = await import('./init-data');
  await initializeBaseData();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      // Prevent caching to ensure fresh user data
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
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

  app.put('/api/countries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertCountrySchema.partial().parse(req.body);
      const country = await storage.updateCountry(req.params.id, validatedData);
      
      await createAuditLog(req, 'UPDATE', 'country', country.id, null, validatedData);
      
      res.json(country);
    } catch (error) {
      console.error("Error updating country:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update country" });
    }
  });

  app.delete('/api/countries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteCountry(req.params.id);
      
      await createAuditLog(req, 'DELETE', 'country', req.params.id, null, null);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting country:", error);
      res.status(500).json({ message: "Failed to delete country" });
    }
  });

  // Sports routes
  app.get('/api/sports', isAuthenticated, async (req, res) => {
    try {
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
      const sports = await storage.getSports(isActive);
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

  app.put('/api/sports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertSportSchema.partial().parse(req.body);
      const sport = await storage.updateSport(req.params.id, validatedData);
      
      await createAuditLog(req, 'UPDATE', 'sport', sport.id, null, validatedData);
      
      res.json(sport);
    } catch (error) {
      console.error("Error updating sport:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update sport" });
    }
  });

  app.delete('/api/sports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteSport(req.params.id);
      
      await createAuditLog(req, 'DELETE', 'sport', req.params.id, null, null);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting sport:", error);
      res.status(500).json({ message: "Failed to delete sport" });
    }
  });

  // Venue Types routes
  app.get('/api/venue-types', isAuthenticated, async (req, res) => {
    try {
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
      const venueTypes = await storage.getVenueTypes(isActive);
      res.json(venueTypes);
    } catch (error) {
      console.error("Error fetching venue types:", error);
      res.status(500).json({ message: "Failed to fetch venue types" });
    }
  });

  app.post('/api/venue-types', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertVenueTypeSchema.parse(req.body);
      const venueType = await storage.createVenueType(validatedData);
      
      await createAuditLog(req, 'CREATE', 'venue_type', venueType.id, null, validatedData);
      
      res.status(201).json(venueType);
    } catch (error) {
      console.error("Error creating venue type:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create venue type" });
    }
  });

  app.put('/api/venue-types/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = insertVenueTypeSchema.partial().parse(req.body);
      const venueType = await storage.updateVenueType(req.params.id, validatedData);
      
      await createAuditLog(req, 'UPDATE', 'venue_type', venueType.id, null, validatedData);
      
      res.json(venueType);
    } catch (error) {
      console.error("Error updating venue type:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update venue type" });
    }
  });

  app.delete('/api/venue-types/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteVenueType(req.params.id);
      
      await createAuditLog(req, 'DELETE', 'venue_type', req.params.id, null, null);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting venue type:", error);
      res.status(500).json({ message: "Failed to delete venue type" });
    }
  });

  // Object Storage routes
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      // Handle missing object storage configuration
      if (error instanceof Error && error.message.includes('PUBLIC_OBJECT_SEARCH_PATHS not set')) {
        return res.status(503).json({ 
          error: "File serving is temporarily unavailable. Object storage needs to be configured.",
          message: "Please set up object storage in the Replit workspace to enable file serving." 
        });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Object storage upload error:", error);
      // Temporary fallback when object storage is not configured
      if (error instanceof Error && error.message.includes('PRIVATE_OBJECT_DIR not set')) {
        // Return a temporary local upload endpoint as fallback
        const localUploadUrl = `${req.protocol}://${req.get('host')}/api/objects/upload-local`;
        res.json({ 
          uploadURL: localUploadUrl,
          isLocalFallback: true,
          message: "Using temporary local storage. Please set up object storage for production use."
        });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Local file upload endpoint (fallback when object storage is not configured)
  app.post("/api/objects/upload-local", isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Return the file URL that can be used to access the uploaded file
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/temp/${req.file.filename}`;
      
      res.json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        isLocalUpload: true,
        message: "File uploaded to temporary local storage. Please set up object storage for production use."
      });
    } catch (error) {
      console.error("Local file upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Serve local uploaded files
  app.get("/uploads/temp/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
    
    // Set appropriate headers
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.sendFile(filePath);
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
        status: 'approved', // Automatically approve all bookings
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
      
      // Get booking details for email notifications
      const [user, team, venue] = await Promise.all([
        storage.getUser(userId),
        storage.getTeam(validatedData.teamId),
        storage.getVenue(validatedData.venueId)
      ]);

      if (user && team && venue) {
        // Send confirmation email to user
        const userEmailContent = emailService.generateBookingConfirmationEmail({
          userName: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.username,
          teamName: team.name,
          venueName: venue.name,
          startDateTime: validatedData.startDateTime,
          endDateTime: validatedData.endDateTime,
          participantCount: validatedData.participantCount,
          specialRequirements: validatedData.specialRequirements || undefined,
        });

        if (user.email) {
          await emailService.sendEmail({
            to: user.email,
            subject: userEmailContent.subject,
            html: userEmailContent.html,
            text: userEmailContent.text,
          });
        }

        // Send notification email to admins
        const adminEmails = await storage.getAdminEmails();
        if (adminEmails.length > 0) {
          const adminEmailContent = emailService.generateAdminNotificationEmail({
            userName: user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user.username,
            teamName: team.name,
            venueName: venue.name,
            startDateTime: validatedData.startDateTime,
            endDateTime: validatedData.endDateTime,
            participantCount: validatedData.participantCount,
          });

          await emailService.sendEmail({
            to: adminEmails,
            subject: adminEmailContent.subject,
            html: adminEmailContent.html,
            text: adminEmailContent.text,
          });
        }

        // Schedule reminder emails
        await reminderService.scheduleBookingReminders(booking.id);
      }

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

  // Get available time slots for a venue on a specific date
  app.get('/api/venues/:venueId/availability', isAuthenticated, async (req: any, res) => {
    try {
      const { venueId } = req.params;
      const { date } = req.query;
      
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }

      const venue = await storage.getVenue(venueId);
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }

      const availableSlots = await storage.getAvailableTimeSlots(venueId, date as string);
      
      res.json({
        venue: {
          id: venue.id,
          name: venue.name,
        },
        date: date,
        slots: availableSlots
      });
    } catch (error) {
      console.error("Error fetching venue availability:", error);
      res.status(500).json({ message: "Failed to fetch venue availability" });
    }
  });

  // Check if a specific booking time slot is available
  app.post('/api/venues/:venueId/check-availability', isAuthenticated, async (req: any, res) => {
    try {
      const { venueId } = req.params;
      const { startDateTime, endDateTime } = req.body;
      
      if (!startDateTime || !endDateTime) {
        return res.status(400).json({ message: "Start and end datetime are required" });
      }

      const venue = await storage.getVenue(venueId);
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }

      // Check for conflicts
      const hasConflicts = await storage.checkBookingConflicts(
        venueId,
        new Date(startDateTime),
        new Date(endDateTime)
      );

      if (hasConflicts) {
        // Get conflicting bookings for more detailed feedback
        const conflictingBookings = await storage.getBookings({
          venueId,
          startDate: new Date(startDateTime).toISOString().split('T')[0],
          endDate: new Date(endDateTime).toISOString().split('T')[0],
        });

        const conflicts = conflictingBookings.filter(booking => {
          if (!['approved', 'pending', 'requested'].includes(booking.status)) return false;
          
          const bookingStart = new Date(booking.startDateTime);
          const bookingEnd = new Date(booking.endDateTime);
          const requestStart = new Date(startDateTime);
          const requestEnd = new Date(endDateTime);
          
          return (requestStart < bookingEnd && requestEnd > bookingStart);
        });

        return res.json({
          available: false,
          message: "Time slot is not available due to existing bookings",
          conflicts: conflicts.map(booking => ({
            id: booking.id,
            startTime: new Date(booking.startDateTime).toTimeString().slice(0, 5),
            endTime: new Date(booking.endDateTime).toTimeString().slice(0, 5),
            teamName: booking.team?.name || 'Unknown Team',
            status: booking.status
          }))
        });
      }

      res.json({
        available: true,
        message: "Time slot is available for booking"
      });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ message: "Failed to check availability" });
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
      
      // Handle status changes and reminder scheduling
      if (updates.status) {
        if (updates.status === 'denied' || updates.status === 'cancelled') {
          // Cancel reminders for denied/cancelled bookings
          reminderService.cancelBookingReminders(req.params.id);
        } else if (updates.status === 'approved') {
          // Schedule reminders for newly approved bookings
          await reminderService.scheduleBookingReminders(req.params.id);
        }

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

      // Cancel any scheduled reminders for this booking
      reminderService.cancelBookingReminders(req.params.id);
      
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

      // Normalize image URLs if they exist
      const objectStorageService = new ObjectStorageService();
      const updateData = { ...req.body };
      
      if (updateData.logoUrl) {
        updateData.logoUrl = objectStorageService.normalizeObjectEntityPath(updateData.logoUrl);
      }
      if (updateData.separatorImageUrl) {
        updateData.separatorImageUrl = objectStorageService.normalizeObjectEntityPath(updateData.separatorImageUrl);
      }

      const config = await storage.updateSystemConfig(updateData);
      await createAuditLog(req, 'UPDATE', 'system_config', config.id, null, updateData);
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

      const allUsers = await storage.getAllUsers();
      // Don't return password hashes
      const safeUsers = allUsers.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        countryCode: u.countryCode,
        isActive: u.isActive,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { username, password, email, firstName, lastName, role, countryCode } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const { hashPassword } = await import('./customAuth');
      const hashedPassword = await hashPassword(password);

      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        email: email || null,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role || 'customer',
        countryCode: countryCode || null
      });

      await createAuditLog(req, 'CREATE', 'user', newUser.id, null, newUser);
      
      // Return user without password
      const { password: _, ...safeUser } = newUser;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.id);
      if (currentUser?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't allow updating password through this endpoint
      const { password, ...updateData } = req.body;
      
      const updatedUser = await storage.updateUser(req.params.id, updateData);
      
      await createAuditLog(req, 'UPDATE', 'user', req.params.id, targetUser, updateData);
      
      // Return user without password
      const { password: _, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Password update endpoint for users to change their own password
  app.put('/api/users/:id/password', isAuthenticated, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      const currentUser = await storage.getUser(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only allow users to change their own password, unless they're superadmin
      if (req.params.id !== currentUser.id && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ message: "Target user not found" });
      }

      // Verify current password (not required for superadmin changing other users' passwords)
      if (req.params.id === currentUser.id) {
        const isCurrentPasswordValid = await comparePasswords(currentPassword, targetUser.password);
        if (!isCurrentPasswordValid) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);
      
      // Update password
      await storage.updateUser(req.params.id, { password: hashedNewPassword });
      
      await createAuditLog(req, 'UPDATE', 'user', req.params.id, null, { passwordChanged: true });
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Password reset endpoint for superadmins to reset any user's password
  app.put('/api/users/:id/reset-password', isAuthenticated, async (req: any, res) => {
    try {
      const { newPassword } = req.body;
      
      const currentUser = await storage.getUser(req.user.id);
      if (currentUser?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);
      
      // Update password
      await storage.updateUser(req.params.id, { password: hashedNewPassword });
      
      await createAuditLog(req, 'RESET_PASSWORD', 'user', req.params.id, null, { passwordReset: true });
      
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  app.delete('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.id);
      if (currentUser?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't allow deleting yourself
      if (targetUser.id === currentUser.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      await storage.deleteUser(req.params.id);
      await createAuditLog(req, 'DELETE', 'user', req.params.id, targetUser, null);
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
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

  // Object Storage routes
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Public route specifically for user profile images (no authentication required)
  app.get("/profile-images/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      // Convert the profile image path to the full object path
      const fullPath = `/objects/${req.params.objectPath}`;
      const objectFile = await objectStorageService.getObjectEntityFile(fullPath);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing profile image:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.put("/api/profile/picture", isAuthenticated, async (req: any, res) => {
    if (!req.body.profileImageUrl) {
      return res.status(400).json({ error: "profileImageUrl is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const userId = req.user.id;
      
      // Normalize the object path
      const objectPath = objectStorageService.normalizeObjectEntityPath(req.body.profileImageUrl);
      
      // Convert private object path to public profile image path
      const publicProfileImagePath = objectPath.replace('/objects/', '/profile-images/');
      
      // Update user profile image in database with public path
      await storage.updateUser(userId, { profileImageUrl: publicProfileImagePath });
      
      res.status(200).json({ 
        message: "Profile picture updated successfully",
        profileImageUrl: objectPath 
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({ error: "Failed to update profile picture" });
    }
  });

  // Public object serving
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // System config image upload endpoints
  app.put("/api/system/logo", isAuthenticated, async (req: any, res) => {
    if (!req.body.logoUrl) {
      return res.status(400).json({ error: "logoUrl is required" });
    }

    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const objectStorageService = new ObjectStorageService();
      
      // Normalize the object path
      const objectPath = objectStorageService.normalizeObjectEntityPath(req.body.logoUrl);
      
      // Update system config logo in database
      const currentConfig = await storage.getSystemConfig();
      const updatedConfig = await storage.updateSystemConfig({ 
        ...currentConfig, 
        logoUrl: objectPath 
      });
      
      res.status(200).json({ 
        message: "Logo updated successfully",
        logoUrl: objectPath 
      });
    } catch (error) {
      console.error("Error updating logo:", error);
      res.status(500).json({ error: "Failed to update logo" });
    }
  });

  app.put("/api/system/separator", isAuthenticated, async (req: any, res) => {
    if (!req.body.separatorImageUrl) {
      return res.status(400).json({ error: "separatorImageUrl is required" });
    }

    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const objectStorageService = new ObjectStorageService();
      
      // Normalize the object path
      const objectPath = objectStorageService.normalizeObjectEntityPath(req.body.separatorImageUrl);
      
      // Update system config separator image in database
      const currentConfig = await storage.getSystemConfig();
      const updatedConfig = await storage.updateSystemConfig({ 
        ...currentConfig, 
        separatorImageUrl: objectPath 
      });
      
      res.status(200).json({ 
        message: "Separator image updated successfully",
        separatorImageUrl: objectPath 
      });
    } catch (error) {
      console.error("Error updating separator image:", error);
      res.status(500).json({ error: "Failed to update separator image" });
    }
  });

  // Venue image upload endpoint
  app.put("/api/venues/:id/image", isAuthenticated, async (req: any, res) => {
    if (!req.body.imageUrl) {
      return res.status(400).json({ error: "imageUrl is required" });
    }

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

      const objectStorageService = new ObjectStorageService();
      
      // Normalize the object path
      const objectPath = objectStorageService.normalizeObjectEntityPath(req.body.imageUrl);
      
      // Update venue image in database
      const updatedVenue = await storage.updateVenue(req.params.id, { imageUrl: objectPath });
      
      res.status(200).json({ 
        message: "Venue image updated successfully",
        imageUrl: objectPath 
      });
    } catch (error) {
      console.error("Error updating venue image:", error);
      res.status(500).json({ error: "Failed to update venue image" });
    }
  });

  // Initialize reminder service for existing bookings on server start
  console.log('Starting reminder service initialization...');
  await reminderService.initializeExistingBookingReminders();
  console.log('Reminder service initialization completed');

  const httpServer = createServer(app);
  return httpServer;
}
