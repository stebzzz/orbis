# Orbis - French Business Management Platform

## Overview

Orbis is a comprehensive business management platform designed specifically for French auto-entrepreneurs and freelancers. It's built as a full-stack TypeScript application that centralizes client management, project tracking, invoicing, time tracking, and financial reporting in a single, unified interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: TailwindCSS with custom CSS variables for theming
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with conventional HTTP methods
- **Authentication**: Replit OpenID Connect (OIDC) integration
- **Session Management**: Express sessions with PostgreSQL storage
- **Request Logging**: Custom middleware for API request/response logging

### Database Layer
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon serverless driver with WebSocket support

## Key Components

### Authentication System
- **Provider**: Replit OIDC for seamless development environment integration
- **Session Storage**: PostgreSQL-backed sessions with 7-day TTL
- **User Management**: Automatic user creation/update on authentication
- **Authorization**: Route-level protection with user context injection

### Data Models
- **Users**: Profile information, business details, VAT settings
- **Clients**: Support for both individual and business clients
- **Projects**: Status tracking, hourly rates, time estimation
- **Time Tracking**: Active timer support with start/stop functionality
- **Documents**: Quotes and invoices with status management
- **Catalog**: Reusable service/product items with pricing
- **Financial**: Expense tracking and revenue calculations

### Business Logic
- **Document Management**: Quote-to-invoice conversion workflow
- **Time Tracking**: Real-time timer with project association
- **Financial Calculations**: VAT handling, URSSAF estimations
- **Client Segmentation**: Separate handling for individual vs business clients
- **Status Workflows**: Document lifecycle management (draft → sent → paid)

### User Interface
- **Dark Theme**: Consistent dark mode design with blue/green accent colors
- **Responsive Design**: Mobile-first approach with breakpoint handling
- **Navigation**: Sidebar-based navigation with active state indicators
- **Dashboard**: KPI cards, activity feeds, and quick actions
- **Forms**: Validated forms with error handling and success feedback

## Data Flow

### Request Flow
1. Client requests authenticated through Replit OIDC
2. Session validation via PostgreSQL store
3. Route handlers validate user permissions
4. Database operations through Drizzle ORM
5. Response formatting with error handling
6. Client-side caching via TanStack Query

### Real-time Features
- **Timer Updates**: Client-side intervals for active time tracking
- **Dashboard Metrics**: Reactive updates on data changes
- **Form State**: Optimistic updates with rollback on errors

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection driver
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **react-hook-form**: Form state and validation
- **zod**: Runtime type validation
- **wouter**: Lightweight client-side routing

### Development Tools
- **Vite**: Build tool with HMR and asset optimization
- **TypeScript**: Static type checking across frontend/backend/shared
- **TailwindCSS**: Utility-first styling
- **ESBuild**: Server-side bundling for production

### Authentication
- **openid-client**: OIDC protocol implementation
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Runtime**: Replit with integrated authentication
- **Build Process**: Concurrent frontend (Vite) and backend (tsx) development
- **Hot Reload**: Vite HMR for frontend, tsx watch mode for backend
- **Database**: Neon serverless PostgreSQL with environment-based connection

### Production Build
- **Frontend**: Vite production build to `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Static Assets**: Served through Express static middleware
- **Environment**: NODE_ENV-based configuration switching

### Database Management
- **Schema**: Centralized in `shared/schema.ts` with Drizzle
- **Migrations**: Generated in `./migrations` directory
- **Connection**: Environment variable-based DATABASE_URL
- **Session Storage**: Automatic table creation for sessions

### Security Considerations
- **Authentication**: OIDC-based with secure session cookies
- **CORS**: Environment-specific domain restrictions
- **Session Security**: HTTP-only cookies with secure flag
- **Database**: Connection string-based authentication
- **API**: Route-level authentication middleware