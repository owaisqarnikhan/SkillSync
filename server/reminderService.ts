import { storage } from './storage';
import { emailService } from './emailService';

class ReminderService {
  private reminderIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Schedule all reminders for a booking
  async scheduleBookingReminders(bookingId: string) {
    try {
      const booking = await storage.getBooking(bookingId);
      if (!booking || booking.status !== 'approved') {
        return;
      }

      const user = await storage.getUser(booking.requesterId);
      const team = await storage.getTeam(booking.teamId);
      const venue = await storage.getVenue(booking.venueId);

      if (!user || !team || !venue) {
        console.error('Failed to get booking details for reminders:', bookingId);
        return;
      }

      const startTime = new Date(booking.startDateTime);
      const endTime = new Date(booking.endDateTime);
      const now = new Date();

      // Schedule start reminder (10 minutes before start)
      const startReminderTime = new Date(startTime.getTime() - 10 * 60 * 1000);
      if (startReminderTime > now) {
        const timeoutId = setTimeout(async () => {
          await this.sendStartReminder(booking, user, team, venue);
          this.reminderIntervals.delete(`${bookingId}-start`);
        }, startReminderTime.getTime() - now.getTime());
        
        this.reminderIntervals.set(`${bookingId}-start`, timeoutId);
        console.log(`Scheduled start reminder for booking ${bookingId} at ${startReminderTime}`);
      }

      // Schedule end reminder (10 minutes before end)
      const endReminderTime = new Date(endTime.getTime() - 10 * 60 * 1000);
      if (endReminderTime > now) {
        const timeoutId = setTimeout(async () => {
          await this.sendEndReminder(booking, user, team, venue);
          this.reminderIntervals.delete(`${bookingId}-end`);
        }, endReminderTime.getTime() - now.getTime());
        
        this.reminderIntervals.set(`${bookingId}-end`, timeoutId);
        console.log(`Scheduled end reminder for booking ${bookingId} at ${endReminderTime}`);
      }

      // Schedule thank you email (after session ends)
      if (endTime > now) {
        const timeoutId = setTimeout(async () => {
          await this.sendThankYouEmail(booking, user, team, venue);
          this.reminderIntervals.delete(`${bookingId}-thankyou`);
        }, endTime.getTime() - now.getTime());
        
        this.reminderIntervals.set(`${bookingId}-thankyou`, timeoutId);
        console.log(`Scheduled thank you email for booking ${bookingId} at ${endTime}`);
      }

    } catch (error) {
      console.error('Error scheduling booking reminders:', error);
    }
  }

  // Cancel all reminders for a booking
  cancelBookingReminders(bookingId: string) {
    const reminderKeys = [`${bookingId}-start`, `${bookingId}-end`, `${bookingId}-thankyou`];
    
    reminderKeys.forEach(key => {
      const timeoutId = this.reminderIntervals.get(key);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.reminderIntervals.delete(key);
        console.log(`Cancelled reminder: ${key}`);
      }
    });
  }

  private async sendStartReminder(booking: any, user: any, team: any, venue: any) {
    try {
      if (!user.email) {
        console.log('User has no email address for start reminder:', user.id);
        return;
      }

      const emailContent = emailService.generateStartReminderEmail({
        userName: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.username,
        teamName: team.name,
        venueName: venue.name,
        startDateTime: booking.startDateTime,
      });

      await emailService.sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      console.log(`Start reminder sent for booking ${booking.id}`);
    } catch (error) {
      console.error('Error sending start reminder:', error);
    }
  }

  private async sendEndReminder(booking: any, user: any, team: any, venue: any) {
    try {
      if (!user.email) {
        console.log('User has no email address for end reminder:', user.id);
        return;
      }

      const emailContent = emailService.generateEndReminderEmail({
        userName: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.username,
        teamName: team.name,
        venueName: venue.name,
        endDateTime: booking.endDateTime,
      });

      await emailService.sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      console.log(`End reminder sent for booking ${booking.id}`);
    } catch (error) {
      console.error('Error sending end reminder:', error);
    }
  }

  private async sendThankYouEmail(booking: any, user: any, team: any, venue: any) {
    try {
      if (!user.email) {
        console.log('User has no email address for thank you email:', user.id);
        return;
      }

      const emailContent = emailService.generateThankYouEmail({
        userName: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.username,
        teamName: team.name,
        venueName: venue.name,
        startDateTime: booking.startDateTime,
        endDateTime: booking.endDateTime,
      });

      await emailService.sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      console.log(`Thank you email sent for booking ${booking.id}`);
    } catch (error) {
      console.error('Error sending thank you email:', error);
    }
  }

  // Method to reschedule existing bookings on server start
  async initializeExistingBookingReminders() {
    try {
      console.log('Initializing reminders for existing bookings...');
      const approvedBookings = await storage.getBookings({ status: 'approved' });
      
      for (const booking of approvedBookings) {
        await this.scheduleBookingReminders(booking.id);
      }
      
      console.log(`Initialized reminders for ${approvedBookings.length} upcoming bookings`);
    } catch (error) {
      console.error('Error initializing existing booking reminders:', error);
    }
  }
}

export const reminderService = new ReminderService();