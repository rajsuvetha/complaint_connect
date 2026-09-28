GMR Innovex
Overview
GMR Innovex is an internal facility management system for handling workplace complaints and conference room bookings. The application allows employees to submit maintenance complaints to various departments (electrical, plumbing, network, software), book conference rooms, and track resolution status through a unified dashboard with analytics.

User Preferences
Preferred communication style: Simple, everyday language.

System Architecture
Frontend Architecture
Framework: React 18 with TypeScript
Routing: Wouter (lightweight React router)
State Management: TanStack React Query for server state
UI Components: shadcn/ui built on Radix UI primitives
Styling: Tailwind CSS with CSS variables for theming
Animations: Framer Motion for page transitions
Charts: Recharts for dashboard analytics
Forms: React Hook Form with Zod validation
Backend Architecture
Runtime: Node.js with Express
Language: TypeScript with ESM modules
API Design: REST endpoints defined in shared/routes.ts with Zod schemas for type safety
Build System: Vite for frontend, esbuild for backend bundling
Data Storage
Database: PostgreSQL with Drizzle ORM
Schema Location: shared/schema.ts for shared types, shared/models/auth.ts for auth tables
Migrations: Drizzle Kit with db:push command
Authentication
Provider: Replit Auth using OpenID Connect
Session Storage: PostgreSQL via connect-pg-simple
User Management: Automatic upsert on login with profile sync
Key Design Patterns
Shared Types: Schema definitions in shared/ folder used by both frontend and backend
API Contract: Route definitions with input/output Zod schemas in shared/routes.ts
Protected Routes: Frontend route wrapper checks auth state before rendering
External Dependencies
Database
PostgreSQL (via DATABASE_URL environment variable)
Drizzle ORM for queries and schema management
Authentication
Replit OpenID Connect provider
Session secret via SESSION_SECRET environment variable
Email Service
Gmail SMTP for sending complaint notifications
Environment variables: GMAIL_USER, GMAIL_APP_PASSWORD
Nodemailer as the transport library
Key npm Packages
drizzle-orm / drizzle-kit: Database ORM and migrations
express / express-session: Web server and session handling
passport: Authentication middleware
@tanstack/react-query: Data fetching and caching
zod / drizzle-zod: Schema validation
recharts: Dashboard charts
framer-motion: Animations