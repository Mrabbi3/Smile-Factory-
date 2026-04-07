# Deployment Guide

Complete guide for deploying The Smile Factory to production. This covers setting up
all services from scratch on brand-new accounts that belong to the business.

---

## Prerequisites

| You will need | Where to get it |
|---|---|
| A **business email** (e.g. `admin@thesmilefactoryarcade.com`) | Google Workspace or Gmail |
| Node.js 20+ | [nodejs.org](https://nodejs.org) |
| A Supabase account | [supabase.com](https://supabase.com) |
| A Vercel account | [vercel.com](https://vercel.com) |
| A Resend account | [resend.com](https://resend.com) |
| (Optional) An OpenAI account | [platform.openai.com](https://platform.openai.com) |

**Tip:** Create every account using the same business email so ownership stays in one place.

---

## Step 1: Supabase Setup (Database & Auth)

1. Sign in to [supabase.com](https://supabase.com) with the business email
2. Create a new **Organization** (e.g. "Smile Factory") and a new **Project**
3. Pick a region close to the business (e.g. US East for New Jersey)
4. Save the database password somewhere safe

### Run the database migration

5. Go to **SQL Editor** in the Supabase dashboard
6. Paste the full contents of `supabase/migrations/00001_initial_schema.sql` and click **Run**
7. Paste the contents of `supabase/seed.sql` and click **Run**

### Get your API credentials

8. Go to **Settings > API**
9. Copy the **Project URL** (this is `NEXT_PUBLIC_SUPABASE_URL`)
10. Copy the **anon / public** key (this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Create the first admin user

11. Go to **Authentication > Users** and click **Add User**
12. Enter the business owner's email and a strong password
13. After the user appears, go to **Table Editor > profiles**
14. Find that user's row and change the `role` column to `owner`

### Upgrade to Pro plan (recommended for production)

The Free tier pauses the database after 1 week of inactivity and has no automatic
backups. For a business that runs daily, **Supabase Pro ($25/month)** is strongly
recommended. It provides:
- Automatic daily backups with point-in-time recovery
- No inactivity pausing
- 8 GB database storage
- Email support

---

## Step 2: Resend Setup (Email Service)

The app sends transactional emails: token purchase receipts, booking confirmations,
and contact form messages.

1. Sign in to [resend.com](https://resend.com) with the business email
2. Go to **API Keys** and create a new key -- copy it (this is `RESEND_API_KEY`)
3. Go to **Domains** and add your business domain (e.g. `thesmilefactoryarcade.com`)
4. Follow Resend's instructions to add DNS records (MX, SPF, DKIM) at your domain registrar
5. Once verified, your `RESEND_FROM_EMAIL` will be something like `noreply@thesmilefactoryarcade.com`

> **Before the domain is verified**, Resend lets you send test emails from
> `onboarding@resend.dev` (the app falls back to this automatically).

---

## Step 3: OpenAI Setup (Optional -- AI Chatbot)

If you want the AI-powered customer chatbot and admin analytics assistant:

1. Sign in to [platform.openai.com](https://platform.openai.com) with the business email
2. Add a payment method under **Billing**
3. Go to **API Keys** and create a new key -- copy it (this is `OPENAI_API_KEY`)
4. Set a monthly spending limit (e.g. $20) under **Billing > Limits**

If you skip this step, the chatbot shows a friendly fallback message with the arcade's
phone number instead.

---

## Step 4: GitHub Repository

### Option A: Transfer to a GitHub Organization (recommended)

1. Create a free GitHub Organization under the business email (e.g. `smile-factory-arcade`)
2. Transfer the repository: **Repo Settings > Danger Zone > Transfer ownership**
3. Add the developer(s) as collaborators with Admin or Write access

### Option B: Keep on developer's GitHub

Add the business email as a collaborator with Admin rights on the existing repo.

---

## Step 5: Vercel Deployment

1. Sign in to [vercel.com](https://vercel.com) with the business email
2. Click **Add New Project** and import the GitHub repository
3. In the **Environment Variables** section, add:

| Variable | Value | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key | Yes |
| `ADMIN_ACCESS_KEY` | Staff PIN(s), comma-separated | Yes |
| `RESEND_API_KEY` | Your Resend API key | Yes |
| `RESEND_FROM_EMAIL` | Verified sender (e.g. `noreply@yourdomain.com`) | Yes |
| `OPENAI_API_KEY` | Your OpenAI API key | No |

4. Click **Deploy** and wait for the build to complete
5. Vercel gives you a URL like `your-project.vercel.app` -- test it immediately

---

## Step 6: Supabase Auth Redirect URLs (Critical)

**Without this step, login will succeed but the app will get stuck loading.**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) > your project
2. Open **Authentication > URL Configuration**
3. Set **Site URL** to your production URL (e.g. `https://your-project.vercel.app`)
4. Under **Redirect URLs**, add:
   - `https://your-project.vercel.app/**`
   - `https://your-project.vercel.app/auth/callback`
5. Click **Save**

> When you add a custom domain later (Step 7), come back and add those URLs too.

---

## Step 7: Custom Domain (When Ready)

1. Purchase a domain (e.g. `thesmilefactoryarcade.com`) from any registrar (Namecheap, Google Domains, GoDaddy, etc.)
2. In Vercel: **Project Settings > Domains > Add Domain**
3. Add your domain and follow Vercel's DNS instructions (usually a CNAME or A record)
4. SSL is automatic -- Vercel provisions a certificate for you
5. Update Supabase Auth redirect URLs (Step 6) to include the new domain
6. Update Resend domain verification if you haven't already
7. Update `SITE_URL` in `src/lib/constants.ts` to match the real domain

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public API key |
| `ADMIN_ACCESS_KEY` | Yes | Staff PIN code(s), comma-separated |
| `RESEND_API_KEY` | Yes | Resend API key for sending emails |
| `RESEND_FROM_EMAIL` | Yes | Verified sender address for outgoing emails |
| `OPENAI_API_KEY` | No | OpenAI key for AI chatbot and analytics |

See `.env.example` in the project root for a copy-paste template.

---

## Monthly Cost Estimate

| Service | Plan | Monthly Cost |
|---|---|---|
| Supabase | Pro | $25 |
| Vercel | Free (Hobby) | $0 |
| Resend | Free (100 emails/day) | $0 |
| OpenAI API | Pay-per-use (optional) | $5-15 |
| Custom Domain | Annual (~$12/year) | ~$1 |
| **Total** | | **$26-41/month** |

---

## Backups & Monitoring

### Database Backups (Supabase Pro)
- Automatic daily backups are enabled on the Pro plan
- Point-in-time recovery is available for the last 7 days
- You can also manually export data from **Table Editor > Export to CSV**

### Uptime Monitoring
- Vercel provides build logs and function logs under **Deployments**
- Supabase dashboard shows database usage, auth metrics, and API request counts
- For external uptime monitoring, consider free services like [UptimeRobot](https://uptimerobot.com) or [Better Stack](https://betterstack.com)

### What to watch for
- Supabase dashboard: database size approaching plan limits
- Vercel dashboard: build failures after code changes
- Resend dashboard: email delivery failures or bounces

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| Login succeeds but app shows infinite loading | Supabase redirect URLs not configured | Complete Step 6 |
| Staff portal says "Staff access is not configured" | `ADMIN_ACCESS_KEY` not set in Vercel env vars | Add it in Vercel > Settings > Environment Variables, then redeploy |
| Emails not sending | `RESEND_API_KEY` missing or domain not verified | Check Resend dashboard for errors |
| AI chatbot shows fallback message | `OPENAI_API_KEY` not set or invalid | Add/fix the key in Vercel env vars |
| Site shows 500 error | Supabase credentials wrong or DB not migrated | Check Vercel function logs; verify env vars match Supabase dashboard |
