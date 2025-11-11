# Local Development Setup with Supabase

This project uses local Supabase via Docker so team members can develop without needing cloud database access.

## Prerequisites

1. **Docker Desktop** - Download from https://www.docker.com/products/docker-desktop
2. **Node.js** - Already installed
3. **Supabase CLI** - Install with: `brew install supabase/tap/supabase`

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Andydrums87/bookabash.git
cd bookabash
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start local Supabase
```bash
supabase start
```

This will:
- Download Docker images (first time only, takes 5-10 minutes)
- Start PostgreSQL, Auth, Storage, and other Supabase services locally
- Output your local connection details

### 4. Copy the local environment variables

When `supabase start` completes, you'll see output like:

```
API URL: http://127.0.0.1:54321
anon key: eyJhbGci...
service_role key: eyJhbGci...
```

The keys will be the same for everyone using local Supabase. Create `.env.local` and add:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Copy other non-database env vars from .env.example
# (Stripe, Google, etc.)
```

### 5. Seed the database with suppliers

```bash
npm run seed-suppliers
```

This will copy all 76 suppliers from the cloud dev database to your local instance.

### 6. Run the app
```bash
npm run dev
```

Visit http://localhost:3000

## How It Works

- **Local database**: All data stays on your machine
- **Migrations**: Schema is defined in `supabase/migrations/`
- **No cloud needed**: Works completely offline
- **Fresh start**: Each developer has their own clean database

## Useful Commands

```bash
# Start Supabase
supabase start

# Stop Supabase
supabase stop

# Reset database (fresh start)
supabase db reset

# View Supabase Studio (database GUI)
# Open http://localhost:54323

# Check status
supabase status

# View logs
supabase logs
```

## Database Schema

The database schema is automatically applied from migration files in `supabase/migrations/` when you run `supabase start` or `supabase db reset`.

### What's Included

Your local database will have these tables:
- **suppliers** - All 76 suppliers from production (automatically copied)
- **users** - Customer profiles
- **parties** - Party bookings
- **enquiries** - Supplier inquiries
- **party_gift_registries** - Gift registries
- **registry_items** - Gift registry items
- **supplier_responses** - Supplier responses

### Auto-Seed Suppliers Data

After running `supabase start`, automatically seed suppliers data:

```bash
npm run seed-suppliers
```

This copies all suppliers from the cloud dev database to your local instance.

## For Production Deployments

Production uses cloud Supabase (credentials in Vercel). Local development never touches production data.

## Troubleshooting

**Docker not running?**
- Make sure Docker Desktop is running (check menu bar icon)

**Port conflicts?**
- Supabase uses ports 54321-54324
- Stop other services using these ports

**Need fresh database?**
```bash
supabase db reset
```

**Can't connect?**
- Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321`
- Make sure Supabase is running: `supabase status`

## Team Setup

When a new team member joins:
1. They clone the repo
2. Run `supabase start`
3. Create `.env.local` with local credentials
4. Run `npm run dev`

No Supabase account or cloud access needed! ✅
