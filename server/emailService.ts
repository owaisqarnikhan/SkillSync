import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.office365.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('SMTP credentials not configured');
        return false;
      }

      const info = await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Booking confirmation email template
  generateBookingConfirmationEmail(bookingDetails: {
    userName: string;
    teamName: string;
    venueName: string;
    startDateTime: string;
    endDateTime: string;
    participantCount: number;
    specialRequirements?: string;
  }) {
    const startDate = new Date(bookingDetails.startDateTime);
    const endDate = new Date(bookingDetails.endDateTime);
    
    return {
      subject: `Booking Confirmed - ${bookingDetails.venueName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Booking Confirmation</h2>
          <p>Dear ${bookingDetails.userName},</p>
          <p>Your booking has been confirmed for the Bahrain Asian Youth Games 2025. Here are the details:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Booking Details</h3>
            <p><strong>Team:</strong> ${bookingDetails.teamName}</p>
            <p><strong>Venue:</strong> ${bookingDetails.venueName}</p>
            <p><strong>Date:</strong> ${startDate.toLocaleDateString()}</p>
            <p><strong>Start Time:</strong> ${startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <p><strong>End Time:</strong> ${endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <p><strong>Participants:</strong> ${bookingDetails.participantCount}</p>
            ${bookingDetails.specialRequirements ? `<p><strong>Special Requirements:</strong> ${bookingDetails.specialRequirements}</p>` : ''}
          </div>
          
          <p><strong>Important:</strong> Please arrive 15 minutes before your scheduled time and bring your team identification.</p>
          
          <p>You will receive reminder emails 10 minutes before your session starts and ends.</p>
          
          <p>Best regards,<br>Bahrain Asian Youth Games 2025 Training Management System</p>
        </div>
      `,
      text: `Booking Confirmed - ${bookingDetails.venueName}\n\nDear ${bookingDetails.userName},\n\nYour booking has been confirmed. Details:\nTeam: ${bookingDetails.teamName}\nVenue: ${bookingDetails.venueName}\nDate: ${startDate.toLocaleDateString()}\nTime: ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}\nParticipants: ${bookingDetails.participantCount}`
    };
  }

  // Admin notification email template
  generateAdminNotificationEmail(bookingDetails: {
    userName: string;
    teamName: string;
    venueName: string;
    startDateTime: string;
    endDateTime: string;
    participantCount: number;
  }) {
    const startDate = new Date(bookingDetails.startDateTime);
    const endDate = new Date(bookingDetails.endDateTime);
    
    return {
      subject: `New Booking - ${bookingDetails.venueName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">New Venue Booking</h2>
          <p>A new booking has been confirmed in the system:</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #b91c1c;">Booking Information</h3>
            <p><strong>Booked by:</strong> ${bookingDetails.userName}</p>
            <p><strong>Team:</strong> ${bookingDetails.teamName}</p>
            <p><strong>Venue:</strong> ${bookingDetails.venueName}</p>
            <p><strong>Date:</strong> ${startDate.toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <p><strong>Participants:</strong> ${bookingDetails.participantCount}</p>
          </div>
          
          <p>This booking has been automatically approved and the user has been notified.</p>
          
          <p>Bahrain Asian Youth Games 2025 Training Management System</p>
        </div>
      `,
      text: `New Booking - ${bookingDetails.venueName}\n\nBooked by: ${bookingDetails.userName}\nTeam: ${bookingDetails.teamName}\nVenue: ${bookingDetails.venueName}\nDate: ${startDate.toLocaleDateString()}\nTime: ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}`
    };
  }

  // Reminder email templates
  generateStartReminderEmail(bookingDetails: {
    userName: string;
    teamName: string;
    venueName: string;
    startDateTime: string;
  }) {
    const startDate = new Date(bookingDetails.startDateTime);
    
    return {
      subject: `Reminder: Your training session starts in 10 minutes`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Training Session Starting Soon</h2>
          <p>Dear ${bookingDetails.userName},</p>
          <p>This is a friendly reminder that your training session will start in <strong>10 minutes</strong>.</p>
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <p><strong>Team:</strong> ${bookingDetails.teamName}</p>
            <p><strong>Venue:</strong> ${bookingDetails.venueName}</p>
            <p><strong>Start Time:</strong> ${startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
          
          <p>Please ensure your team is ready and at the venue on time.</p>
          
          <p>Best regards,<br>Bahrain Asian Youth Games 2025</p>
        </div>
      `,
      text: `Training session starts in 10 minutes!\n\nTeam: ${bookingDetails.teamName}\nVenue: ${bookingDetails.venueName}\nStart Time: ${startDate.toLocaleTimeString()}`
    };
  }

  generateEndReminderEmail(bookingDetails: {
    userName: string;
    teamName: string;
    venueName: string;
    endDateTime: string;
  }) {
    const endDate = new Date(bookingDetails.endDateTime);
    
    return {
      subject: `Reminder: Your training session ends in 10 minutes`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d97706;">Training Session Ending Soon</h2>
          <p>Dear ${bookingDetails.userName},</p>
          <p>This is a reminder that your training session will end in <strong>10 minutes</strong>.</p>
          
          <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
            <p><strong>Team:</strong> ${bookingDetails.teamName}</p>
            <p><strong>Venue:</strong> ${bookingDetails.venueName}</p>
            <p><strong>End Time:</strong> ${endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
          
          <p>Please prepare to wrap up your training session.</p>
          
          <p>Best regards,<br>Bahrain Asian Youth Games 2025</p>
        </div>
      `,
      text: `Training session ends in 10 minutes!\n\nTeam: ${bookingDetails.teamName}\nVenue: ${bookingDetails.venueName}\nEnd Time: ${endDate.toLocaleTimeString()}`
    };
  }

  generateThankYouEmail(bookingDetails: {
    userName: string;
    teamName: string;
    venueName: string;
    startDateTime: string;
    endDateTime: string;
  }) {
    const startDate = new Date(bookingDetails.startDateTime);
    const endDate = new Date(bookingDetails.endDateTime);
    
    return {
      subject: `Thank you for using our training facilities`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Thank You!</h2>
          <p>Dear ${bookingDetails.userName},</p>
          <p>Thank you for using our training facilities. We hope your training session was productive!</p>
          
          <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
            <h3 style="margin-top: 0;">Session Summary</h3>
            <p><strong>Team:</strong> ${bookingDetails.teamName}</p>
            <p><strong>Venue:</strong> ${bookingDetails.venueName}</p>
            <p><strong>Date:</strong> ${startDate.toLocaleDateString()}</p>
            <p><strong>Duration:</strong> ${startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
          
          <p>We wish you the best of luck in your preparations for the Bahrain Asian Youth Games 2025!</p>
          
          <p>Feel free to book additional training sessions as needed.</p>
          
          <p>Best regards,<br>Bahrain Asian Youth Games 2025 Training Management Team</p>
        </div>
      `,
      text: `Thank you for using our training facilities!\n\nSession Summary:\nTeam: ${bookingDetails.teamName}\nVenue: ${bookingDetails.venueName}\nDate: ${startDate.toLocaleDateString()}\nTime: ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}`
    };
  }
}

export const emailService = new EmailService();