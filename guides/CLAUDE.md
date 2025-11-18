# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BookABash (PartySnap) is a Next.js 15 marketplace platform for children's party entertainment and services. It's a dual-sided marketplace connecting customers (party planners) with suppliers (entertainers, bakers, decorators, etc.).

## Development Commands

```bash
# Start development server (localhost:3000)
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Lint code
npm run lint

# Analyze bundle size
npm run analyze
```

## Tech Stack

- **Framework**: Next.js 15 with App Router (NOT Pages Router)
- **React**: Version 19
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **UI**: Radix UI components with Tailwind CSS 4
- **Payments**: Stripe (with Klarna integration)
- **Email**: Postmark API (Sendgrid legacy/unused)
- **SMS**: Twilio
- **Calendar Sync**: Google Calendar & Outlook via OAuth
- **Image Storage**: Cloudinary CDN
- **AI/ML**: OpenAI GPT-4o, Replicate API
- **Server Rendering**: Puppeteer for invite generation

## Architecture Overview

### Next.js App Router Structure

The app uses Next.js App Router with route groups:

- `/(main)/` - Customer-facing marketplace (grouped route)
- `/suppliers/` - Supplier dashboard and management
- `/admin/` - Admin verification tools
- `/auth/callback/` - OAuth callback handlers
- `/api/` - Backend API routes

Key patterns:
- Route groups use parentheses: `/(main)/`
- Dynamic routes: `/suppliers/[id]/`, `/party-builder/[partyId]/`
- Server Components by default, client components marked with `"use client"`

### Multi-Business Architecture (Themed Suppliers)

Unique feature: Suppliers can create multiple themed businesses from a single account.

Example: A magician creates separate businesses for "Princess Magic" and "Science Magic"

**Implementation:**
- `suppliers` table has `parent_business_id` and `created_from_theme` fields
- Child businesses inherit calendar connections from parent
- `BusinessContext.jsx` manages switching between businesses
- `is_primary` field identifies the main business
- Calendar tokens shared via `googleCalendarSync.inherited` flag

### Database Schema (Supabase)

**Core Tables:**
- `users` - Customer profiles
- `suppliers` - Supplier business profiles (JSONB `data` field stores most profile info)
- `parties` - Party bookings
- `enquiries` - Customer-to-supplier inquiries
- `applications` - Supplier onboarding applications

**Critical: `suppliers.data` JSONB Structure**
```javascript
{
  name, businessDescription, category, location,
  priceFrom, image, coverPhoto, rating, serviceType,
  owner: { name, email, phone, address },
  googleCalendarSync: {
    accessToken, refreshToken, tokenExpiry,
    calendarId, inherited, primarySupplierId
  },
  outlookCalendarSync: { /* similar structure */ },
  packages: [],
  availability: {},
  verification: {},
  themes: []
}
```

**Data Access Patterns:**
- `lib/supabase.js` - Client-side Supabase client
- `lib/supabase-admin.js` - Server-side admin client (service role)
- `lib/suppliers-api.js` - Server-component cached queries with `cache()`
- `utils/partyDatabaseBackend.js` - Party CRUD operations
- Direct Supabase calls in API routes

### State Management

Hybrid approach:
- **React Context**: `BusinessContext`, `SupplierAuthContext`, `CartContext`
- **localStorage**: Party plans, selected business ID
- **sessionStorage**: Cache timestamps
- **Server State**: Supabase as source of truth
- **Server Caching**: `suppliers-api.js` uses React `cache()`

### Payment Architecture

Complex payment logic in `utils/unifiedPricingEngine.js`:

- **Full Payment Required**: Cakes, party bags, decorations (lead-time items)
- **Deposit Payment**: Entertainers, other services (20% or min £50)
- **Klarna**: Automatically enabled for qualifying transactions
- **Multi-Supplier**: Tracks payment breakdown per supplier
- **Stripe Integration**: Payment intents, webhooks at `/api/webhooks/stripe/`

### Calendar Sync System

Real-time bidirectional sync with Google Calendar and Outlook:

**OAuth Flow:**
1. Initiate at `/api/auth/google-calendar/` or `/api/auth/outlook-calendar/`
2. Callback at `/api/auth/google-calendar/callback/` or `/api/auth/outlook-callback/`
3. Tokens stored in `suppliers.data.googleCalendarSync`

**Token Management** (`lib/calendar-token-manager.js`):
- Auto-refresh with 5-minute buffer before expiry
- Themed suppliers inherit parent's tokens
- Fallback to primary supplier for inherited connections

**Sync Endpoints:**
- `POST /api/calendar/sync/` - Manual sync
- `POST /api/calendar/booking-sync/` - Party booking sync
- `POST /api/calendar/webhook/` - Google Calendar webhook handler
- `GET /api/calendar/scheduled-sync/` - Automated sync (cron)

### Email System (Postmark)

Email templates in `/api/email/`:
- `payment-confirmation` - Receipt-style confirmation
- `supplier-notification` - Urgent booking alerts (with shimmer animation)
- `customer-response` - Communication with customers
- `supplier-onboarding` - Onboarding emails
- `verification-complete` - Verification approval

**SMS via Twilio**: Urgent supplier notifications (2-hour response window)

### Invite Generation Pipeline

Server-side rendering workflow:

1. **Render**: Puppeteer launches headless browser
2. **Capture**: Screenshot of rendered invite HTML
3. **Upload**: Cloudinary CDN storage
4. **Enhance** (optional): Replicate API for AI inpainting/style transfer

**Endpoints:**
- `POST /api/render-invite/` - Main rendering
- `POST /api/generate-invite/` - Full generation workflow
- `POST /api/inpaint-invite/` - AI enhancement
- `POST /api/add-text-overlay/` - Text overlays

### Authentication

**Supabase Auth:**
- Email/password authentication
- Separate flows for customers and suppliers
- Callbacks: `/auth/callback/customer/`, `/auth/callback/supplier/`

**Contexts:**
- `SupplierAuthContext` - Supplier login state, provides `useSupplierAuth()`
- `BusinessContext` - Multi-business management

**Admin Auth**: `utils/adminAuth.js` - Custom admin role verification

## Key Features & Flows

### Customer Journey
1. Landing page with search (`/(main)/page.js`)
2. Party builder wizard (`/(main)/party-builder/`)
3. Browse suppliers (`/(main)/browse/`)
4. View supplier details (`/(main)/supplier/[id]/`)
5. Review and book (`/(main)/review-book/`)
6. Payment (`/(main)/payment/`)
7. Dashboard to manage party (`/(main)/dashboard/`)

### Supplier Journey
1. Application submission
2. Admin verification (`/admin/verification/`)
3. Profile setup (`/suppliers/profile/`)
4. Package creation (`/suppliers/packages/`)
5. Calendar integration (`/suppliers/calendar/`)
6. Availability management (`/suppliers/availability/`)
7. Booking management (`/suppliers/dashboard/`)

## Important Utilities

- `utils/partyDatabaseBackend.js` - Party CRUD (create, read, update parties)
- `utils/partyBuilderBackend.js` - Party building flow logic
- `utils/unifiedPricingEngine.js` - Payment processing and deposit calculation
- `services/PricingBrain.js` - Pricing calculation service
- `lib/suppliers-api.js` - Server-side supplier queries (cached)
- `lib/calendar-token-manager.js` - OAuth token refresh logic
- `lib/aiAnalyzer.js` - OpenAI profile analysis from websites
- `utils/locationService.js` - UK postcode validation

## Component Organization

```
/components
├── /ui              # Radix UI wrappers (button, dialog, input, etc.)
├── /Home            # Landing page components
├── /shared          # Cross-app components (Nav, Footer, etc.)
├── /supplier        # Supplier-specific components
└── /animations      # Lottie animations
```

## Environment Variables

Required environment variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# Google Calendar
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

# Twilio
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN

# Email
POSTMARK_API_TOKEN

# Cloudinary
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_CLOUD_NAME

# OpenAI
OPENAI_API_KEY

# OAuth
NEXTAUTH_URL
```

## Code Patterns

### Error Handling
Common pattern throughout codebase:
```javascript
const result = await someOperation();
if (!result.success) {
  return { success: false, error: result.error };
}
```

### Server-Side Caching
```javascript
// lib/suppliers-api.js uses React cache()
import { cache } from 'react';
export const getSuppliers = cache(async () => { /* ... */ });
```

### localStorage Persistence
Used for party plans, business selection:
```javascript
// Always validate with try/catch
try {
  const data = JSON.parse(localStorage.getItem('key'));
} catch (error) {
  // Handle invalid data
}
```

### Graceful Degradation
- Mock data fallbacks when APIs fail
- Try/catch blocks with logged errors
- Feature availability checks

## Common Development Tasks

### Adding a New Supplier Field
1. Update `suppliers.data` JSONB structure
2. Add field to supplier forms in `/suppliers/profile/`
3. Update `lib/suppliers-api.js` if needed for queries
4. Update display components in `/components/supplier/`

### Adding a New API Route
1. Create file in `/app/api/` or `/app/(main)/api/`
2. Use `lib/supabase-admin.js` for database access (service role)
3. Return JSON responses with error handling
4. Add webhook signature verification if applicable

### Modifying Payment Logic
Edit `utils/unifiedPricingEngine.js` - handles deposit vs full payment logic

### Calendar Sync Changes
1. Token management: `lib/calendar-token-manager.js`
2. Sync logic: `/api/calendar/sync/route.js`
3. Webhook handling: `/api/calendar/webhook/route.js`

### Email Template Updates
Edit template files in `/api/email/[template-name]/route.js`

## Testing & Debugging

- Check browser console for client-side errors
- Check terminal output for server-side errors
- Use Supabase dashboard for database queries
- Check Stripe dashboard for payment testing
- Use Postmark activity log for email debugging
- Verify webhooks in respective service dashboards (Stripe, Google Calendar)

## Deployment

- **Platform**: Vercel (optimized for Next.js)
- **Environment**: Set all environment variables in Vercel dashboard
- **Build**: `npm run build` runs automatically on deployment
- **Database**: Supabase hosted separately
- **CDN**: Cloudinary for images, Vercel for static assets

## Security Notes

- Service role key (`SUPABASE_SERVICE_ROLE_KEY`) only in server/API routes
- Never expose service role key to client
- Stripe webhook signature verification required
- Email verification for user accounts
- Admin verification workflow for suppliers going live
- OAuth tokens encrypted in database
