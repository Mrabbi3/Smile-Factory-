# Deployment Guide

## Prerequisites

- GitHub account with access to the repository
- Vercel account (free)
- Supabase project (free tier)
- OpenAI API key (optional, for AI features)

## Step 1: Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the migration: Copy contents of `supabase/migrations/00001_initial_schema.sql` and execute
4. Run the seed: Copy contents of `supabase/seed.sql` and execute
5. Note your project URL and anon key from **Settings > API**

## Step 2: Create Admin Users

1. Go to **Authentication > Users** in Supabase dashboard
2. Click "Add User" to create owner accounts
3. After creating, go to **Table Editor > profiles**
4. Update the role column to `owner` for admin accounts

## Step 3: Vercel Deployment

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `OPENAI_API_KEY` - Your OpenAI API key (optional)
4. Click Deploy

## Step 4: Custom Domain (Optional)

1. In Vercel project settings, go to **Domains**
2. Add your custom domain
3. Update DNS records as instructed by Vercel

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase publishable API key |
| `OPENAI_API_KEY` | No | OpenAI key for AI chatbot and analytics |

## Estimated Costs

| Service | Plan | Monthly Cost |
|---|---|---|
| Vercel | Free tier | $0 |
| Supabase | Free tier | $0 |
| OpenAI API | Pay-per-use | $5-15 |
| Custom Domain | Annual | ~$12/year |
| **Total** | | **$5-15/month** |

## Monitoring

- Vercel provides built-in analytics and logs
- Supabase dashboard shows database usage and auth metrics
- OpenAI usage tracked in their dashboard