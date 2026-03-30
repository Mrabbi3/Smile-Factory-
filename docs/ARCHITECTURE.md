# Architecture Documentation

## Related Docs

- `docs/PUBLIC_SITE_IMPLEMENTATION.md` contains the detailed implementation record for the public-facing website redesign, interaction updates, image placeholder strategy, and route transitions.

## System Architecture

The Smile Factory Management System (SFMS) follows a modern full-stack web architecture using Next.js App Router with Supabase as the backend.

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                   Client Layer                    │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │  Public   │ │   Customer   │ │    Admin     │ │
│  │  Website  │ │    Portal    │ │  Dashboard   │ │
│  └──────────┘ └──────────────┘ └──────────────┘ │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────┐
│              Next.js App Router                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │  Server   │ │   API    │ │    Middleware     │ │
│  │Components │ │  Routes  │ │  (Auth + RBAC)   │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────┐
│              Supabase Backend                     │
│  ┌──────┐ ┌──────────┐ ┌─────┐ ┌─────────────┐ │
│  │ Auth │ │PostgreSQL │ │ RLS │ │  Realtime    │ │
│  └──────┘ └──────────┘ └─────┘ └─────────────┘ │
└─────────────────────────────────────────────────┘
```

### Technology Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR, API routes, middleware, optimal for Vercel deployment |
| Database | Supabase (PostgreSQL) | Free tier, auth, RLS, real-time, low maintenance |
| Styling | Tailwind CSS + shadcn/ui | Rapid development, consistent design system, accessibility |
| State | Zustand + React hooks | Lightweight, no boilerplate, SSR-compatible |
| Charts | Recharts | React-native, responsive, good documentation |
| PDF | jsPDF + jspdf-autotable | Client-side generation, no server dependency |
| Excel | SheetJS | Client-side, comprehensive Excel support |
| AI | OpenAI GPT-4o-mini | Cost-effective, high quality, easy integration |

### Authentication Flow

1. User submits credentials via login form
2. Supabase Auth validates and returns JWT
3. JWT stored in HTTP-only cookies via @supabase/ssr
4. Middleware checks JWT on every request
5. Profile with role is fetched from `profiles` table
6. Route access determined by role

### Role-Based Access Control

Enforced at two levels:
1. **Middleware** - Route-level protection (redirects unauthorized users)
2. **Supabase RLS** - Database-level protection (prevents data access)

### Data Flow

```
User Action → React Component → Supabase Client → PostgreSQL (RLS checked) → Response
```

### Offline Strategy

- Service Worker caches static pages and assets
- Network-first strategy with cache fallback
- Offline fallback page with contact information
- Transactions queue in localStorage when offline (future enhancement)

### Cost Structure

| Service | Tier | Monthly Cost |
|---|---|---|
| Vercel | Free/Hobby | $0-20 |
| Supabase | Free | $0 |
| OpenAI API | Pay-per-use | $5-15 |
| **Total** | | **$5-35** |
