# BrachaVeHatzlacha - Multilingual Lottery Platform

## Overview

BrachaVeHatzlacha is a sophisticated multilingual lottery platform designed for private operations. The system provides a complete lottery management solution with real-time features, comprehensive admin controls, and support for Hebrew (RTL), English, and French languages.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Animations**: Framer Motion for smooth user interactions
- **State Management**: TanStack Query for server state, React Context for app state
- **Build Tool**: Vite for fast development and optimized production builds
- **Language Support**: Full i18n implementation with RTL support for Hebrew

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety
- **Session Management**: Express sessions with PostgreSQL storage
- **Real-time Communication**: WebSocket integration for chat features
- **Authentication**: Session-based authentication with role-based access control
- **Caching**: Redis-compatible caching system with graceful fallback

### Database Architecture
- **Primary Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Migration-based schema evolution
- **Performance**: Composite indexes for optimized queries

## Key Components

### Core Business Logic
1. **Lottery System**: 6-number selection from 1-37 range with automated draw processing
2. **User Management**: Hierarchical role system (Admin, VIP, Standard, New clients)
3. **Financial System**: Ticket purchasing, balance management, and automated transaction tracking
4. **Draw Management**: Scheduled draws with automatic execution and winner calculation
5. **Multilingual Support**: Complete translation system with 287+ keys per language

### User Interface Components
1. **Landing Page**: Optimized entry point with language selection and authentication
2. **Client Dashboard**: Ticket purchasing, balance viewing, and history management
3. **Admin Panel**: Complete CRM with user management, draw control, and analytics
4. **Chat System**: Real-time WebSocket-based communication
5. **Responsive Design**: Mobile-first approach with desktop optimization

### Security Features
1. **Authentication**: Session-based with secure cookie handling
2. **Authorization**: Role-based middleware protection for routes
3. **Input Validation**: Zod schemas for data validation
4. **CSRF Protection**: Built into session management
5. **SQL Injection Prevention**: Parameterized queries through Drizzle ORM

## Data Flow

### User Registration & Authentication
1. User submits registration form
2. Server validates input using Zod schemas
3. Password hashing and user creation in PostgreSQL
4. Automatic welcome bonus assignment (100₪)
5. Session creation and client redirection

### Ticket Purchase Flow
1. Client selects 6 numbers (1-37)
2. Frontend validates selection completeness
3. Server verifies user balance and draw availability
4. Transaction creation and balance deduction
5. Ticket record creation with unique ID
6. Real-time UI update with purchase confirmation

### Draw Execution Process
1. Automated scheduler triggers draw execution
2. Random number generation (6 numbers, 1-37)
3. Ticket matching and winner calculation
4. Prize distribution based on match count
5. Balance updates for winning tickets
6. Notification system activation

### Admin Operations
1. Admin authentication with elevated permissions
2. User management (creation, balance updates, blocking)
3. Draw creation and manual result entry
4. Transaction monitoring and financial reporting
5. System statistics and performance metrics

## External Dependencies

### Database Services
- **PostgreSQL**: Primary data storage with connection pooling
- **Redis**: Optional caching layer with graceful degradation

### Development Dependencies
- **Vite**: Build tool and development server
- **TypeScript**: Type system for both frontend and backend
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library for enhanced UX

### Runtime Dependencies
- **Express.js**: Web application framework
- **React**: Frontend UI library
- **Drizzle ORM**: Database toolkit
- **TanStack Query**: Data fetching and caching
- **Zod**: Schema validation library

### Optional Integrations
- **SMS Service**: Twilio integration for notifications (configured but not required)
- **Service Worker**: PWA capabilities for offline functionality

## Deployment Strategy

### Production Configuration
- **Environment**: Replit hosting platform
- **Database**: Neon PostgreSQL cloud service
- **Session Storage**: PostgreSQL-backed sessions
- **Build Process**: Vite production build with TypeScript compilation
- **Static Assets**: Served through Express with appropriate caching headers

### Performance Optimizations
- **Frontend**: Code splitting, lazy loading, and optimized bundle size
- **Backend**: Connection pooling, query optimization, and caching strategies
- **Database**: Composite indexes and query performance monitoring
- **Caching**: Redis fallback system for high availability

### Monitoring & Maintenance
- **Logging**: Structured logging system for debugging and monitoring
- **Error Handling**: Comprehensive error boundaries and API error responses
- **Health Checks**: Automated system status monitoring
- **Backup Strategy**: PostgreSQL automated backups through Neon service

### Security Considerations
- **HTTPS**: SSL/TLS encryption for production deployment
- **Session Security**: Secure cookie configuration with httpOnly flags
- **Input Sanitization**: Comprehensive validation on all user inputs
- **Access Control**: Strict role-based permissions throughout the system
- **Audit Trail**: Complete transaction and user action logging

The system is designed for high availability with graceful degradation of non-critical features, ensuring core lottery functionality remains operational even under adverse conditions.