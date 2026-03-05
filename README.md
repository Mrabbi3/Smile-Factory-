# The Smile Factory - Digital Management System (SFMS)

A comprehensive web-based management platform for The Smile Factory Arcade & Family Fun Center, located in Brigantine, NJ. Built with Next.js, Supabase, and modern web technologies.

First Deployment link https://smile-factory.vercel.app/

## Overview

The SFMS consists of three main interfaces:

1. **Public Website** - Customer-facing pages with arcade info, pricing, party packages, and AI chatbot
2. **Admin Dashboard** - Full operational management for owners, managers, and employees
3. **Customer Portal** - Personal accounts with booking, loyalty tracking, and purchase history

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | Full-stack React framework |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** + **shadcn/ui** | Styling and component library |
| **Supabase** | PostgreSQL database, authentication, row-level security |
| **Recharts** | Analytics charts and data visualization |
| **jsPDF** + **jspdf-autotable** | PDF report generation |
| **SheetJS (xlsx)** | Excel export functionality |
| **OpenAI API** | AI chatbot and business analytics |
| **Zustand** | State management |
| **Vercel** | Hosting and deployment |

## Features

### Public Website
- Modern, mobile-first responsive design with red brand theme
- 6 pages: Home, About, Pricing, Parties, Gallery, Contact
- AI-powered chatbot for customer inquiries
- Service worker for offline resilience

### Admin Dashboard (10+ modules)
- **POS / Token Sales** - Quick sale interface with cash/card toggle, $10 card minimum, loyalty deals
- **Prize Inventory** - Full CRUD, stock tracking, dynamic ticket pricing, redemption logging
- **Party Bookings** - Calendar/list view, conflict detection, 25+ kids phone redirect, deposit tracking
- **Work Orders** - Task management with priority levels and machine linking
- **Machine Management** - Directory of 41+ machines, maintenance history, per-machine token adjustment
- **Expense Tracking** - Cash/card logging, categorization, monthly summaries
- **Employee Management** - Staff directory, role management (owner/manager/employee)
- **Loyalty & Coupons** - Spending tiers (bronze/silver/gold/platinum), coupon code management
- **Reports & Analytics** - Revenue, inventory, booking, expense reports with charts
- **Document Center** - PDF and Excel generation for all report types
- **AI Analytics** - Natural language business queries with data-driven insights
- **System Settings** - Configurable business parameters

### Customer Portal
- Personal dashboard with spending overview
- Party booking system
- Token purchase history
- Loyalty rewards tracker with tier progression
- Profile management

### Role-Based Access Control
| Role | Access |
|---|---|
| **Owner** | Full access to everything including financial reports and settings |
| **Manager** | Token sales, loyalty deals, bookings, prizes, work orders |
| **Employee** | Front-counter token sales, basic prize redemption |
| **Customer** | Website, own bookings, loyalty rewards, profile |

## Getting Started

### Prerequisites
- Node.js 20+
- npm
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/Mrabbi3/Smile-Factory-.git
cd Smile-Factory-

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

### Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key
```

### Database Setup

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the migration file: `supabase/migrations/00001_initial_schema.sql`
4. Run the seed file: `supabase/seed.sql`

### Development

```bash
npm run dev    # Start development server on http://localhost:3000
npm run build  # Production build
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Project Structure

```
src/
├── app/
│   ├── (public)/        # Public website (Home, About, Pricing, etc.)
│   ├── (auth)/          # Login, Register, Forgot Password
│   ├── admin/           # Admin dashboard (all management modules)
│   ├── customer/        # Customer portal
│   ├── api/ai/          # AI chat API route
│   └── offline/         # Offline fallback page
├── components/
│   ├── ui/              # shadcn/ui base components
│   ├── admin/           # Admin sidebar, top bar, AI analytics
│   ├── public/          # Navbar, footer
│   └── shared/          # Chatbot, service worker
├── lib/
│   ├── supabase/        # Client, server, middleware helpers
│   ├── ai/              # AI context and prompts
│   ├── pdf/             # PDF generation utilities
│   ├── excel/           # Excel export utilities
│   ├── constants.ts     # Business constants and config
│   └── utils.ts         # Utility functions
├── hooks/               # Custom React hooks (useAuth, etc.)
└── types/               # TypeScript type definitions
supabase/
├── migrations/          # SQL migration files
└── seed.sql             # Initial seed data
docs/                    # Documentation
```

## Database Schema

17 tables with full Row Level Security:

- `profiles` - User profiles with roles
- `token_pricing` - Token price tiers
- `token_transactions` - Sales records
- `machines` - Arcade machine directory
- `machine_maintenance` - Maintenance logs
- `prizes` - Prize inventory
- `prize_redemptions` - Redemption history
- `party_packages` - Party package definitions
- `party_bookings` - Booking records
- `work_orders` - Task management
- `expenses` - Expense tracking
- `loyalty_accounts` - Customer loyalty
- `loyalty_transactions` - Reward activity
- `coupons` - Promotional codes
- `daily_revenue` - Daily summaries
- `audit_logs` - Activity auditing
- `system_settings` - Configuration

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

Estimated monthly cost: **$5-35/month** (Vercel free tier + Supabase free tier + OpenAI API usage)

## Team

| Name | Role | Responsibilities |
|---|---|---|
| James Riley | Project Lead / Full Stack | Project management, architecture, client communication |
| Md Rabbi | Project Architecture / System Design | UI/UX, responsive design, tech stack design |
| Kelvin | Backend Developer | API development, database design, business logic |
| Durwin | QA / Security / Backend | Testing, security audits, documentation |
| Terry | Frontend / Backend | Frontend design, exploration, integration |

## Course

CSCI 4485 - Software and Security Engineering

## Client

The Smile Factory Arcade & Family Fun Center
1307 W Brigantine Ave # B, Brigantine, NJ 08203
(609) 266-3866

## License

This project is developed as part of an academic course and is proprietary to the client.
