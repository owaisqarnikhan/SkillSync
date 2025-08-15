# Training Management System

## Overview

This is a comprehensive, real-time web-based Training Management System designed for the Bahrain Asian Youth Games 2025. The application enables national teams to efficiently and securely book training venues with role-based access control, real-time notifications, and comprehensive venue management capabilities.

The system supports three main user roles: SuperAdmins who configure countries, teams, venues, and system-wide settings; Managers who handle venue or team-specific bookings and approvals; and Customers/Users who can search venues, request bookings, and manage their team's training sessions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Framework**: shadcn/ui components with Radix UI primitives and Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API with role-based authorization middleware

### Database Design
- **Database**: PostgreSQL with Neon serverless connection
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Tables**: 
  - Users with role-based access control (superadmin, manager, customer)
  - Countries, sports, teams, and venues for organizational structure
  - Bookings with status tracking and conflict prevention
  - Venue blackouts for scheduling restrictions
  - Notifications for real-time communication
  - Audit logs for accountability and compliance
- **Data Integrity**: Database-level constraints and exclusions to prevent booking conflicts

### Security & Compliance
- **Authentication**: JWT-based authentication with Replit OAuth integration
- **Authorization**: Role-based access control with middleware enforcement
- **Password Security**: bcrypt for secure password hashing
- **Input Validation**: Zod schemas for runtime type checking and validation
- **Audit Trail**: Comprehensive audit logging for all user actions and system changes
- **Session Security**: Secure session management with PostgreSQL backing store

### Real-time Features
- **Live Updates**: Real-time booking status updates and calendar synchronization
- **Notification System**: Email notifications for booking confirmations, updates, and reminders
- **Queue Management**: Real-time booking queue with position tracking and estimated wait times
- **Calendar Integration**: Live calendar views with drag-and-drop functionality and visual status indicators

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **@neondatabase/serverless**: WebSocket-based database driver for serverless environments

### Authentication & Authorization
- **Replit Auth**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware for Express
- **express-session**: Session management with PostgreSQL store backing

### UI & Styling
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Unstyled, accessible UI components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography

### Development & Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing for Tailwind integration

### Form Handling & Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### Date & Time Management
- **date-fns**: Modern JavaScript date utility library for calendar and scheduling features

### Email & Notifications
- **Nodemailer**: Email sending capability for notification system
- **Multiple Provider Support**: Configured for SendGrid, AWS SES, and other email services