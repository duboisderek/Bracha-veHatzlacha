# Private Lottery Web Application - Bracha veHatzlacha

A sophisticated, bilingual (Hebrew & English) private lottery platform built with modern web technologies, featuring comprehensive management capabilities and engaging user experiences.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [User System](#user-system)
- [Admin Panel](#admin-panel)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Development Guidelines](#development-guidelines)
- [Troubleshooting](#troubleshooting)

## Overview

The Private Lottery Web Application is a full-stack solution that enables users to participate in weekly lottery draws with a modern, intuitive interface. The platform supports two distinct user flows: simplified username-only registration for quick access, and comprehensive admin management for platform oversight.

### Key Highlights

- **Bilingual Support**: Complete English and Hebrew localization with RTL support
- **Modern UI**: Responsive design with Tailwind CSS and Framer Motion animations
- **Real-time Features**: WebSocket chat, live jackpot updates, and automatic draw locking
- **Comprehensive Admin**: Full user management, draw control, and financial oversight
- **Advanced Features**: QR code generation, winner carousels, contact widgets, and user ranking system

## Features

### Frontend Features

#### Home Screen
- **Lottery Participation**: Intuitive number selection interface (6 numbers from 1-37)
- **Next Draw Information**: Prominent display of draw date and time
- **Standard Lottery Suggestion**: External lottery integration widget
- **Re-use Numbers**: Previous numbers selection with hot/cold analysis

#### Personal Area (Dashboard)
- **Account Balance**: Real-time balance display with transaction history
- **Top-up History**: Detailed log of all account deposits
- **User Status/Rank**: Dynamic ranking system (Silver/Gold/Diamond) based on participation
- **Ticket Management**: View active and historical tickets

#### Chat/Support System
- **Live Chat**: Real-time WebSocket-based communication
- **Support Requests**: Formal ticket system for user issues
- **Quick Contact**: WhatsApp, Telegram, and in-app chat widgets

#### Advanced UI Features
- **Automatic Notifications**: Draw alerts and winning notifications
- **Referral Program**: QR code generation and bonus tracking
- **Jackpot Display**: Auto-updating jackpot with timestamps
- **Participation Lock**: 60-second automatic lock before draws
- **Winners Carousel**: Rotating display of recent winners
- **Dynamic Animations**: Coin rain, confetti, and visual effects

### Backend Features

#### Core Logic
- **User Management**: Username-only registration, account management, blocking
- **Lottery Logic**: Draw scheduling, number validation, winner determination
- **Prize Distribution**: Automated prize calculation and distribution
- **User Ranking**: Silver (10), Gold (100), Diamond (500) participation thresholds
- **Referral System**: Bonus tracking and reward distribution
- **Notification System**: SMS and web notification triggers

#### Admin Panel
- **User Creation**: Simple username-based account creation
- **Manual Top-ups**: Direct fund addition to user accounts
- **Winners History**: Comprehensive draw results and winner tracking
- **User Management**: Block/unblock users, view statistics
- **Draw Control**: Manual draw execution and result input
- **Financial Oversight**: Transaction monitoring and reporting

## Technology Stack

### Frontend
- **React 18**: Modern functional components with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling framework
- **Framer Motion**: Advanced animations and transitions
- **TanStack Query**: Efficient data fetching and caching
- **Wouter**: Lightweight routing solution
- **Lucide React**: Modern icon library

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **TypeScript**: Type-safe server development
- **Express Session**: Session management
- **WebSocket**: Real-time communication

### Database
- **PostgreSQL**: Primary database
- **Drizzle ORM**: Type-safe database operations
- **Drizzle Kit**: Database migrations

### Development Tools
- **Vite**: Fast build tool and development server
- **ESBuild**: Fast JavaScript bundler
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## Project Structure

```
private-lottery/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # Base UI components
│   │   │   ├── lottery/      # Lottery-specific components
│   │   │   ├── dashboard/    # Dashboard components
│   │   │   ├── chat/         # Chat system components
│   │   │   └── referral/     # Referral system components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions and configurations
│   │   ├── pages/            # Page components
│   │   └── main.tsx          # Application entry point
│   └── index.html
├── server/                    # Backend Express application
│   ├── db.ts                 # Database connection
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API routes
│   ├── storage.ts            # Database operations
│   ├── sms-service.ts        # SMS notification service
│   └── vite.ts               # Vite integration
├── shared/                   # Shared code between client and server
│   └── schema.ts             # Database schema and types
├── config.js                 # Application configuration
├── package.json              # Dependencies and scripts
├── drizzle.config.ts         # Database configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite configuration
```

## Installation & Setup

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- Git

### Clone Repository

```bash
git clone <repository-url>
cd private-lottery
```

### Install Dependencies

```bash
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/lottery_db

# Session
SESSION_SECRET=your-super-secret-session-key

# SMS Service (Optional)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone

# Development
NODE_ENV=development
```

### Database Setup

```bash
# Push schema to database
npm run db:push

# Generate database client
npm run db:generate
```

## Configuration

The application uses a centralized configuration file (`config.js`) for all lottery parameters:

### Key Configuration Options

```javascript
// Draw settings
draw: {
  frequency: 'weekly',
  drawTime: '20:00',
  lockTimeBeforeDraw: 60,
  numbersRange: { min: 1, max: 37, count: 6 }
}

// User ranking thresholds
userRanks: {
  silver: { threshold: 10 },
  gold: { threshold: 100 },
  diamond: { threshold: 500 }
}

// Prize distribution
prizeDistribution: {
  6: 0.50,  // 50% for 6 matches
  5: 0.30,  // 30% for 5 matches
  4: 0.20,  // 20% for 4 matches
  houseEdge: 0.50
}
```

## Running the Application

### Development Mode

```bash
npm run dev
```

This starts both the frontend (Vite) and backend (Express) servers:
- Frontend: http://localhost:5000 (served by Express)
- Backend API: http://localhost:5000/api
- WebSocket: ws://localhost:5000/ws

### Production Build

```bash
npm run build
npm start
```

### Database Commands

```bash
# Push schema changes
npm run db:push

# Generate migrations
npm run db:generate

# View database in Drizzle Studio
npm run db:studio
```

## User System

### Registration Options

1. **Simple Registration**: Username-only system for quick access
2. **Demo Accounts**: Pre-configured test accounts for demonstration
3. **Admin Creation**: Administrators can create users with username only

### User Ranks

- **New**: 0-9 participations (Basic support, standard features)
- **Silver**: 10-99 participations (Basic support, standard notifications)
- **Gold**: 100-499 participations (Priority support, advanced statistics, bonus draws)
- **Diamond**: 500+ participations (VIP support, exclusive events, higher bonuses, personal account manager)

### Authentication Flow

1. User selects registration method
2. Simple username creation or demo account selection
3. Automatic account setup with initial balance (₪1000)
4. Session-based authentication for subsequent access

## Admin Panel

### Access

- URL: `/admin`
- Requires admin privileges
- Session-based authentication

### Admin Functions

1. **User Management**
   - Create new users (username only)
   - View all user accounts
   - Block/unblock users
   - Manual balance top-ups

2. **Draw Management**
   - Create new draws
   - Input winning numbers
   - Complete draws and distribute prizes
   - View draw history and statistics

3. **Financial Oversight**
   - Transaction monitoring
   - Prize distribution tracking
   - Revenue analytics

4. **System Control**
   - SMS notification testing
   - System configuration
   - User rank management

## API Endpoints

### Authentication
- `POST /api/auth/simple-register` - Simple username registration
- `POST /api/auth/demo-login` - Demo account login
- `POST /api/auth/login` - Standard login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Get current user

### Draws
- `GET /api/draws/current` - Get current draw
- `GET /api/draws/completed` - Get completed draws
- `GET /api/draws/recent-winners` - Get recent winners for carousel
- `GET /api/draws/lock-status` - Check draw lock status
- `POST /api/draws/update-jackpot` - Update jackpot amount (Admin)

### Tickets
- `POST /api/tickets/purchase` - Purchase lottery ticket
- `GET /api/tickets/my` - Get user's tickets
- `GET /api/tickets/draw/:drawId` - Get tickets for specific draw

### Transactions
- `POST /api/transactions/deposit` - Make deposit
- `GET /api/transactions/my` - Get user's transactions

### Admin
- `GET /api/admin/users` - Get all users (Admin)
- `POST /api/admin/create-simple-user` - Create user (Admin)
- `POST /api/admin/manual-deposit` - Manual deposit (Admin)
- `POST /api/admin/block-user` - Block user (Admin)

### Chat
- `POST /api/chat/send` - Send chat message
- `GET /api/chat/messages` - Get chat messages
- WebSocket: `ws://localhost:5000/ws` - Real-time chat

## Database Schema

### Core Tables

1. **users** - User accounts and profiles
2. **draws** - Lottery draw information
3. **tickets** - User lottery tickets
4. **transactions** - Financial transactions
5. **chat_messages** - Chat system messages
6. **referrals** - Referral system tracking

### Key Relationships

- Users have many tickets, transactions, and chat messages
- Draws have many tickets
- Tickets belong to users and draws
- Referrals link users (referrer and referred)

## Deployment

### Replit Deployment

The application is optimized for Replit deployment:

1. Import project to Replit
2. Configure environment variables
3. Run `npm install`
4. Execute `npm run db:push` to setup database
5. Start with `npm run dev`

### Manual Deployment

1. **Server Setup**
   ```bash
   # Install Node.js and PostgreSQL
   # Clone repository
   git clone <repo-url>
   cd private-lottery
   ```

2. **Environment Configuration**
   ```bash
   # Set environment variables
   export DATABASE_URL="postgresql://..."
   export SESSION_SECRET="..."
   ```

3. **Build and Start**
   ```bash
   npm install
   npm run build
   npm run db:push
   npm start
   ```

### Production Considerations

- Use PostgreSQL in production
- Set `NODE_ENV=production`
- Configure proper session secrets
- Enable HTTPS
- Set up monitoring and logging
- Configure backup strategies

## Development Guidelines

### Code Structure

- **Components**: Modular, reusable React components
- **Hooks**: Custom hooks for shared logic
- **Types**: TypeScript types in shared schema
- **Styling**: Tailwind CSS utility classes
- **State**: TanStack Query for server state, React hooks for local state

### Database Operations

- Use Drizzle ORM for all database operations
- Define schema in `shared/schema.ts`
- Use migrations for schema changes
- Implement proper error handling

### API Development

- RESTful endpoint design
- Consistent error responses
- Input validation with Zod
- Proper HTTP status codes
- Session-based authentication

### Frontend Development

- Functional components with hooks
- TypeScript for type safety
- Responsive design principles
- Accessibility best practices
- Performance optimization

## Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Check PostgreSQL status
   pg_isready -h localhost -p 5432
   
   # Verify DATABASE_URL format
   postgresql://username:password@host:port/database
   ```

2. **Build Errors**
   ```bash
   # Clear dependencies and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Type Errors**
   ```bash
   # Regenerate database types
   npm run db:generate
   ```

4. **Port Conflicts**
   ```bash
   # Check running processes
   lsof -i :5000
   ```

### Performance Optimization

- Use React.memo for expensive components
- Implement proper loading states
- Optimize database queries
- Cache frequently accessed data
- Compress static assets

### Security Best Practices

- Validate all user inputs
- Use parameterized database queries
- Implement rate limiting
- Secure session configuration
- Regular dependency updates

## Support and Maintenance

### Regular Tasks

- Monitor application logs
- Backup database regularly
- Update dependencies
- Review user feedback
- Optimize performance metrics

### Scaling Considerations

- Database connection pooling
- Redis for session storage
- CDN for static assets
- Load balancing for multiple instances
- Database read replicas

---

For additional support or questions, please refer to the configuration file (`config.js`) for customization options or contact the development team.