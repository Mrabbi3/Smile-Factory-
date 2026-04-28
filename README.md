# The Smile Factory - Digital Management System (SFMS)

A comprehensive web-based management platform for The Smile Factory Arcade & Family Fun Center, located in Brigantine, NJ. Built with Next.js, Supabase, and modern web technologies.

## Overview

The SFMS consists of three main interfaces:

1. **Public Website** — Customer-facing pages with arcade info, pricing, parties, and news-style alerts
2. **Admin Dashboard** — Full operational management for owners, managers, and employees
3. **Customer Portal** — Personal accounts with bookings, QR pay-at-desk token buys, prize tickets, and purchase history

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
| **Zustand** | State management |
| **Vercel** | Hosting and deployment |

## Features

### Public Website
- Modern, mobile-first responsive design with red brand theme
- Core pages: Home, About, Pricing, Parties, Gallery, Contact
- Top-of-site announcements (Supabase-driven marquee)
- Service worker for offline resilience

### Admin Dashboard (10+ modules)
- **POS / Token Sales** — Quick sale with packages, custom totals, customer lookup, QR completion
- **Prize Inventory** — Full CRUD, stock tracking, dynamic ticket pricing
- **Party Bookings** — Calendar/list view, deposit tracking
- **Coupons** — Staff-created offers with per-customer assignments (see migrations)
- **Work Orders** - Task management with priority levels and machine linking
- **Machine Management** - Directory of 41+ machines, maintenance history, per-machine token adjustment
- **Expense Tracking** - Cash/card logging, categorization, monthly summaries
- **Employee Management** - Staff directory, role management (owner/manager/employee)
- **Coupons** - Staff-issued offers and customer assignment tracking (see database migrations)
- **Reports & Analytics** - Revenue, inventory, booking, expense reports with charts
- **Document Center** - PDF and Excel generation for all report types
- **System Settings** - Configurable business parameters

### Customer Portal
- Personal dashboard with spending overview
- Party booking system
- Token purchase history
- Profile management and saved payment references (pay-at-desk QR flow)
- Profile management

### Role-Based Access Control
| Role | Access |
|---|---|
| **Owner** | Full access to everything including financial reports and settings |
| **Manager** | Token sales, bookings, prizes, work orders, inquiries |
| **Employee** | Front-counter token sales, inquiries, basic operations |
| **Customer** | Website, own bookings, token history, coupons when assigned, profile |

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
cp .env.example .env.local
# Edit .env.local with your credentials (see .env.example for details)
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values. See the file for
descriptions of each variable. Key ones:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public API key |
| `ADMIN_ACCESS_KEY` | Yes | Staff portal PIN(s), comma-separated |
| `RESEND_API_KEY` | Yes | Resend API key for emails |
| `RESEND_FROM_EMAIL` | Yes | Verified sender email address |
### Database Setup

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run every migration in `supabase/migrations/` **in numeric order** (`00001_*` through the latest file), then optional `supabase/seed.sql`.

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
Legacy `loyalty_accounts` / `loyalty_transactions` were removed in migration `00002_drop_loyalty.sql` (backed up to `_backup_*` tables).
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

Estimated monthly cost: **$26-30/month** (Supabase Pro $25 + Vercel free tier + Resend free tier; Google Places optional for review sync)

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed setup instructions and
[docs/STAFF-GUIDE.md](docs/STAFF-GUIDE.md) for the staff operations manual.

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
