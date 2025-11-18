# PartySnap Developer Guide

Welcome to PartySnap (also known as PartySnap)! This guide will help you understand the project and get up to speed quickly.

## Table of Contents

1. [What is PartySnap?](#what-is-partysnap)
2. [Getting Started](#getting-started)
3. [Tech Stack](#tech-stack)
4. [Project Architecture](#project-architecture)
5. [Key Features Deep Dive](#key-features-deep-dive)
6. [Understanding the Data Model](#understanding-the-data-model)
7. [User Flows](#user-flows)
8. [Working with the Codebase](#working-with-the-codebase)
9. [Common Development Tasks](#common-development-tasks)
10. [Testing & Debugging](#testing--debugging)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

---

## What is PartySnap?

PartySnap is a two-sided marketplace that connects parents planning children's parties with party suppliers (entertainers, bakers, decorators, face painters, etc.). Think of it as a specialized booking platform similar to how Thumbtack or TaskRabbit work, but specifically for children's party services.

### The Problem We Solve

Planning a children's party is stressful! Parents need to:
- Find reliable entertainers and vendors
- Coordinate multiple suppliers for one event
- Manage bookings and payments
- Create invitations and track RSVPs

Suppliers face challenges too:
- Getting discovered by potential clients
- Managing their calendar and avoiding double-bookings
- Getting paid reliably

BookABash brings both sides together in one platform.

### Key User Personas

1. **Parents/Customers**: Browse suppliers, create party plans, send enquiries, make bookings, generate invitations
2. **Suppliers**: Create profiles, manage availability, receive bookings, sync calendars, get paid
3. **Admins**: Verify new suppliers, moderate content, handle disputes

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (for database and auth)
- Stripe account (for payment testing)
- Optional but helpful: Postmark, Twilio, Cloudinary accounts

### Initial Setup

1. **Clone and Install**
   ```bash
   cd bookabash
   npm install
   ```

2. **Environment Variables**

   Create a `.env.local` file in the root directory with these variables:

   ```bash
   # Supabase (Database & Auth)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Stripe (Payments)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # Google Calendar Integration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Twilio (SMS Notifications)
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token

   # Postmark (Email)
   POSTMARK_API_TOKEN=your_postmark_token

   # Cloudinary (Image Storage)
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name

   # OpenAI (Profile Analysis)
   OPENAI_API_KEY=sk-...

   # OAuth Callback URL
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Database Setup**

   You'll need access to the Supabase project. The database includes these main tables:
   - `users` - Customer profiles
   - `suppliers` - Supplier business profiles
   - `parties` - Party bookings
   - `enquiries` - Customer inquiries to suppliers
   - `applications` - Supplier onboarding applications

### Useful Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Run ESLint
npm run analyze      # Analyze bundle size
```

---

## Tech Stack

### Core Framework
- **Next.js 15** with the App Router (not Pages Router!)
- **React 19** (latest version with Server Components)
- **TypeScript**: Minimal usage, mostly JavaScript

### Styling & UI
- **Tailwind CSS 4** for utility-first styling
- **Radix UI** for accessible component primitives
- **Lucide React** for icons

### Backend & Database
- **Supabase** (PostgreSQL database + authentication)
- **Supabase Auth** for user authentication (email/password)
- No custom backend server - Next.js API routes handle everything

### Payments
- **Stripe** for payment processing
- **Klarna** integration via Stripe for buy-now-pay-later

### Third-Party Services
- **Postmark** - Transactional emails
- **Twilio** - SMS notifications
- **Cloudinary** - Image hosting and CDN
- **Puppeteer** - Server-side HTML rendering (for invitations)
- **OpenAI GPT-4** - AI analysis of supplier websites
- **Replicate** - AI image enhancement

### Calendar Integration
- **Google Calendar API** - OAuth and sync
- **Microsoft Graph API** - Outlook calendar sync

---

## Project Architecture

### Next.js App Router Structure

This project uses the **Next.js App Router** (not the older Pages Router). Here's how it's organized:

```
/src/app
├── /(main)/              # Customer-facing app (route group)
│   ├── page.js           # Landing page
│   ├── party-builder/    # Party creation wizard
│   ├── browse/           # Supplier search
│   ├── supplier/[id]/    # Supplier details
│   ├── dashboard/        # Customer dashboard
│   ├── review-book/      # Booking confirmation
│   ├── payment/          # Payment page
│   └── api/              # Customer-specific API routes
│
├── /suppliers/           # Supplier dashboard
│   ├── dashboard/
│   ├── profile/
│   ├── packages/
│   ├── availability/
│   ├── calendar/
│   └── earnings/
│
├── /admin/               # Admin tools
│   └── verification/     # Verify new suppliers
│
├── /auth/                # Authentication flows
│   └── callback/         # OAuth callbacks
│
└── /api/                 # Global API routes
    ├── auth/
    ├── calendar/
    ├── email/
    └── webhooks/
```

**Key Concept: Route Groups**

Notice the `/(main)/` folder with parentheses? That's a [route group](https://nextjs.org/docs/app/building-your-application/routing/route-groups). It organizes files without affecting the URL structure. So `/(main)/browse/page.js` becomes `/browse`, not `/main/browse`.

### File Organization

```
/src
├── /app                  # Next.js App Router
├── /components           # React components
│   ├── /ui              # Radix UI wrappers
│   ├── /Home            # Landing page components
│   ├── /shared          # Reusable components
│   └── /supplier        # Supplier-specific components
├── /contexts            # React Context providers
│   ├── BusinessContext.jsx
│   ├── SupplierAuthContext.js
│   └── CartContext.js
├── /hooks               # Custom React hooks
├── /lib                 # Core utilities and configurations
│   ├── supabase.js      # Client-side Supabase
│   ├── supabase-admin.js # Server-side Supabase
│   └── suppliers-api.js  # Cached supplier queries
├── /services            # Business logic
│   └── PricingBrain.js
├── /utils               # Helper functions
│   ├── partyDatabaseBackend.js
│   └── unifiedPricingEngine.js
└── /content             # Static content
```

### Server vs Client Components

Next.js 15 uses Server Components by default. This means:

- **Server Components** (default): Render on the server, no JavaScript sent to client
- **Client Components**: Include `"use client"` at the top of the file

**When to use each:**

```javascript
// Server Component (default) - Good for:
// - Data fetching
// - Database queries
// - SEO-critical content
export default async function SupplierPage({ params }) {
  const supplier = await fetchSupplier(params.id)
  return <div>{supplier.name}</div>
}

// Client Component - Needed for:
// - useState, useEffect, useContext
// - Event handlers (onClick, onChange)
// - Browser APIs (localStorage, window)
"use client"
export default function InteractiveButton() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### State Management Strategy

We use a **hybrid approach** rather than a single state management library:

1. **React Context** - For shared client state
   - `BusinessContext` - Manages supplier's multiple businesses
   - `SupplierAuthContext` - Supplier authentication state
   - `CartContext` - Shopping cart (not heavily used)

2. **localStorage** - For persistence across sessions
   - Party plans (user progress through party builder)
   - Selected business ID (for multi-business suppliers)
   - Cached user preferences

3. **Supabase** - Single source of truth
   - All persistent data lives here
   - Real-time subscriptions available (not heavily used currently)

4. **Server-side Caching** - For performance
   - `lib/suppliers-api.js` uses React's `cache()` function
   - Deduplicates requests in a single render pass

---

## Key Features Deep Dive

### 1. Multi-Business / Themed Suppliers

**The Problem:**

Many entertainers offer multiple themed shows. For example, a children's entertainer might offer:
- Princess parties (dress up as Elsa)
- Dinosaur parties (different costume, different activities)
- Science parties (completely different act)

Should they create separate accounts? That's a pain for calendar management and payments.

**Our Solution: Themed Suppliers**

One supplier account can create multiple "themed businesses" that:
- Appear as separate listings to customers
- Share the same calendar connection (inherit from parent)
- Use the same bank account for payments
- Can be managed from one dashboard

**Implementation:**

```javascript
// Database fields on suppliers table
{
  id: "supplier-123",
  is_primary: true,              // This is the main business
  parent_business_id: null,      // null for primary
  created_from_theme: null,      // null for primary

  // ... other fields
}

// Child business
{
  id: "supplier-456",
  is_primary: false,
  parent_business_id: "supplier-123",  // Links to parent
  created_from_theme: "princess",      // Created from theme template

  data: {
    googleCalendarSync: {
      inherited: true,                   // Uses parent's calendar
      primarySupplierId: "supplier-123"  // Points to parent
    }
  }
}
```

**Context Management:**

`contexts/BusinessContext.jsx` manages switching between businesses:

```javascript
const { businesses, selectedBusiness, switchBusiness } = useBusinessContext()

// User can switch between their businesses
switchBusiness(childBusinessId)
```

### 2. Calendar Synchronization

**Why It Matters:**

Suppliers often have bookings outside our platform (direct bookings, other platforms). We need to:
- Prevent double-bookings
- Keep supplier's personal calendar in sync
- Update automatically when they add/remove events

**How It Works:**

```
1. OAuth Flow
   User clicks "Connect Google Calendar"
   → Redirect to /api/auth/google-calendar/
   → Google OAuth consent screen
   → Redirect back to /api/auth/google-calendar/callback/
   → Store access token & refresh token in database

2. Token Management (lib/calendar-token-manager.js)
   - Tokens expire after 1 hour
   - We auto-refresh 5 minutes before expiry
   - Refresh tokens are long-lived (use to get new access tokens)

3. Bidirectional Sync
   Platform → Calendar: When party is booked, create calendar event
   Calendar → Platform: Webhook notifies us of external events

4. Webhook System
   Google calls /api/calendar/webhook/ when calendar changes
   We fetch updated events and mark those dates as unavailable
```

**Themed Supplier Calendar Sharing:**

Child businesses inherit the parent's calendar connection:

```javascript
// When checking availability for a themed supplier:
if (supplier.data.googleCalendarSync.inherited) {
  // Use parent supplier's tokens
  const parentId = supplier.data.googleCalendarSync.primarySupplierId
  const parentSupplier = await fetchSupplier(parentId)
  // Use parentSupplier's calendar tokens
}
```

### 3. Payment System

**Complexity: Deposits vs Full Payment**

Not all services require the same payment terms:

| Category | Payment Type | Reason |
|----------|-------------|---------|
| Entertainers | 20% deposit | Can cancel and rebook |
| Cakes | 100% upfront | Custom made, can't resell |
| Party Bags | 100% upfront | Bulk ordered specifically |
| Decorations | 100% upfront | Custom/personalized |

**Implementation:**

Located in `utils/unifiedPricingEngine.js`:

```javascript
function determinePaymentType(category) {
  const FULL_PAYMENT_CATEGORIES = [
    'cakes',
    'partyBags',
    'decorations',
    'balloons' // if personalized
  ]

  if (FULL_PAYMENT_CATEGORIES.includes(category)) {
    return 'FULL'
  }

  return 'DEPOSIT' // 20% or £50 minimum
}
```

**Multi-Supplier Bookings:**

A party might include:
- Entertainment (£200 - deposit £50)
- Cake (£60 - full payment £60)
- Face painting (£100 - deposit £20)

**Total payment now:** £130
**Balance remaining:** £170 (paid later)

This is calculated in `PricingBrain.js` and stored per-supplier in the `parties` table.

**Stripe Integration:**

```javascript
// Create payment intent
POST /api/create-payment-intent/
{
  amount: 13000, // £130 in pence
  currency: 'gbp',
  payment_method_types: ['card', 'klarna'] // Klarna for amounts > £50
}

// Webhook handling
POST /api/webhooks/stripe/
// Listens for payment_intent.succeeded
// Updates party status to 'confirmed'
// Sends confirmation emails
```

### 4. Invitation Generation System

**The Challenge:**

We need to generate beautiful, shareable party invitations that:
- Render consistently across devices
- Support custom themes and graphics
- Can be shared via URL or downloaded
- Load fast from anywhere

**The Solution: Server-Side Rendering**

We can't rely on client-side screenshot libraries (browser compatibility issues, slow). Instead:

```
1. Frontend creates invite design (HTML/CSS)
2. POST to /api/render-invite/ with HTML
3. Puppeteer launches headless Chrome on server
4. Takes screenshot of rendered HTML
5. Uploads to Cloudinary CDN
6. Returns public URL
```

**Optional AI Enhancement:**

```javascript
// After basic invite is generated
POST /api/inpaint-invite/
{
  imageUrl: "cloudinary-url",
  prompt: "Add sparkles and confetti",
  theme: "unicorn"
}

// Uses Replicate API (Stable Diffusion)
// Returns enhanced image URL
```

**Code Flow:**

```javascript
// 1. User customizes invite in browser
const inviteHTML = renderInviteToHTML(partyDetails, theme)

// 2. Send to server
const response = await fetch('/api/render-invite/', {
  method: 'POST',
  body: JSON.stringify({ html: inviteHTML })
})

const { imageUrl } = await response.json()

// 3. Display or share
<img src={imageUrl} alt="Party Invitation" />
```

### 5. Email & SMS Notifications

**Email System (Postmark):**

All transactional emails are in `/app/api/email/`:

```
/api/email/
├── payment-confirmation/     # After successful payment
├── supplier-notification/    # New booking alert (urgent)
├── customer-response/        # Supplier replies to customer
├── supplier-onboarding/      # Welcome email for new suppliers
└── verification-complete/    # Supplier approved
```

**Template Structure:**

```javascript
// Example: payment-confirmation/route.js
export async function POST(request) {
  const { partyDetails, customerEmail, paymentAmount } = await request.json()

  const htmlBody = `
    <div style="font-family: Arial, sans-serif;">
      <h1>Payment Confirmed! 🎉</h1>
      <p>Thanks for booking your party for ${partyDetails.childName}!</p>
      <p>Amount paid: £${paymentAmount}</p>
      <!-- Receipt-style details -->
    </div>
  `

  await postmarkClient.sendEmail({
    From: 'noreply@bookabash.com',
    To: customerEmail,
    Subject: 'Party Booking Confirmation',
    HtmlBody: htmlBody
  })
}
```

**SMS Notifications (Twilio):**

Used sparingly - only for urgent supplier alerts:

```javascript
// When a party is booked within 48 hours
if (isUrgentBooking) {
  await fetch('/api/send-sms-notification/', {
    method: 'POST',
    body: JSON.stringify({
      to: supplier.phone,
      message: `Urgent: New party booking for ${partyDate}. Respond within 2 hours.`
    })
  })
}
```

---

## Understanding the Data Model

### The Supabase Database

We use PostgreSQL via Supabase. Here are the key tables:

#### 1. `users` Table (Customers)

```sql
users (
  id UUID PRIMARY KEY,
  auth_user_id UUID,  -- Links to Supabase Auth
  email TEXT,
  name TEXT,
  phone TEXT,
  address JSONB,
  created_at TIMESTAMP
)
```

#### 2. `suppliers` Table (The Most Complex)

```sql
suppliers (
  id UUID PRIMARY KEY,
  auth_user_id UUID,           -- Links to Supabase Auth
  business_name TEXT,
  business_type TEXT,           -- 'entertainer', 'baker', 'decorator'
  business_slug TEXT UNIQUE,    -- URL-friendly name
  is_active BOOLEAN,
  profile_status TEXT,          -- 'draft', 'pending', 'live'
  can_go_live BOOLEAN,          -- All requirements met?
  profile_completion_percentage INTEGER,

  -- Multi-business fields
  is_primary BOOLEAN,
  parent_business_id UUID,      -- NULL for primary business
  created_from_theme TEXT,      -- 'princess', 'dinosaur', etc.

  -- The big one: JSONB data blob
  data JSONB,

  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Why JSONB for `data`?**

The `data` field contains everything about the supplier's business. We use JSONB instead of separate columns because:

✅ **Flexibility**: Easy to add new fields without migrations
✅ **Nested structures**: Store complex objects (packages, calendar tokens)
✅ **Theme-specific fields**: Different business types need different data

⚠️ **Trade-offs**:
- Less type safety
- Harder to query (use `data->>'field'` syntax)
- Need client-side validation

**Structure of `suppliers.data`:**

```javascript
{
  // Basic info
  name: "Magic Mike's Parties",
  businessDescription: "Professional children's entertainer...",
  category: "entertainer",
  location: "London",
  priceFrom: 150,

  // Images
  image: "cloudinary-url",
  coverPhoto: "cloudinary-url",
  photos: ["url1", "url2", "url3"],

  // Owner details
  owner: {
    name: "Mike Smith",
    email: "mike@example.com",
    phone: "+44 7700 900000",
    address: {
      line1: "123 High Street",
      city: "London",
      postcode: "SW1A 1AA"
    }
  },

  // Calendar sync
  googleCalendarSync: {
    connected: true,
    accessToken: "ya29.a0...",
    refreshToken: "1//0...",
    tokenExpiry: "2024-03-15T10:00:00Z",
    calendarId: "primary",

    // For themed suppliers
    inherited: false,
    primarySupplierId: null
  },

  outlookCalendarSync: {
    // Similar structure
  },

  // Service packages
  packages: [
    {
      id: "pkg-1",
      name: "Basic Magic Show",
      duration: 60,
      price: 150,
      description: "...",
      included: ["Card tricks", "Balloon animals"]
    }
  ],

  // Availability
  availability: {
    monday: { available: true, slots: [...] },
    tuesday: { available: false },
    // ... rest of week
  },

  // Verification documents
  verification: {
    dbsCheck: { uploaded: true, verified: true, fileUrl: "..." },
    insurance: { uploaded: true, verified: false, fileUrl: "..." }
  },

  // Themed business templates
  themes: ["princess", "superhero", "dinosaur"]
}
```

#### 3. `parties` Table (Bookings)

```sql
parties (
  id UUID PRIMARY KEY,
  user_id UUID,                 -- Customer who created party
  child_name TEXT,
  party_date DATE,
  party_time TIME,
  guest_count INTEGER,
  theme TEXT,
  venue_address JSONB,

  -- Status tracking
  status TEXT,                  -- 'draft', 'enquiry_sent', 'confirmed', 'completed'
  current_step TEXT,            -- Where in the booking flow?

  -- Payment tracking
  total_cost DECIMAL,
  deposit_paid DECIMAL,
  balance_remaining DECIMAL,
  payment_status TEXT,          -- 'pending', 'deposit_paid', 'fully_paid'

  -- Suppliers involved
  suppliers JSONB,              -- { entertainment: {...}, cake: {...} }

  -- Additional details
  special_requests TEXT,
  dietary_requirements TEXT[],

  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### 4. `enquiries` Table (Supplier Communication)

```sql
enquiries (
  id UUID PRIMARY KEY,
  party_id UUID,
  supplier_id UUID,
  supplier_category TEXT,       -- 'entertainment', 'cakes', etc.

  status TEXT,                  -- 'pending', 'accepted', 'declined'
  message TEXT,
  customer_contact JSONB,

  -- Response tracking
  supplier_response TEXT,
  response_date TIMESTAMP,
  response_deadline TIMESTAMP,  -- 48 hours from sent

  created_at TIMESTAMP
)
```

### Data Access Patterns

**Client-Side:**
```javascript
import { createClient } from '@/lib/supabase'

const supabase = createClient()
const { data, error } = await supabase
  .from('suppliers')
  .select('*')
  .eq('business_slug', 'magic-mike')
  .single()
```

**Server-Side (API routes):**
```javascript
import { createClient } from '@/lib/supabase-admin'

const supabase = createClient()
// Has service role key - can bypass RLS policies
```

**Cached Server Queries:**
```javascript
import { getSuppliers } from '@/lib/suppliers-api'

// Uses React cache() - deduplicates requests
const suppliers = await getSuppliers({ category: 'entertainer' })
```

---

## User Flows

### Customer Journey: Booking a Party

```
1. Landing Page (/)
   ↓
   User fills out quick search form:
   - What type of party? (theme)
   - How many guests?
   - When? (date)
   - Where? (postcode)

2. Party Builder (/party-builder/[id])
   ↓
   Multi-step wizard:
   Step 1: Confirm party details
   Step 2: Select suppliers (entertainment, cake, etc.)
   Step 3: Add extras (face painting, decorations)
   Step 4: Review & confirm

3. Browse Suppliers (/browse)
   ↓
   Filtered by:
   - Location (postcode radius)
   - Date availability
   - Category/type
   - Price range
   ↓
   User clicks on supplier card

4. Supplier Detail Page (/supplier/[id])
   ↓
   View:
   - Photos & videos
   - Packages & pricing
   - Reviews
   - Availability calendar
   ↓
   Click "Add to Party" or "Send Enquiry"

5. Review & Book (/review-book)
   ↓
   Summary of all selected suppliers
   Total cost breakdown
   Deposit vs full payment explained
   ↓
   Click "Proceed to Payment"

6. Payment Page (/payment)
   ↓
   Stripe Elements:
   - Card payment (default)
   - Klarna (if eligible)
   ↓
   Payment successful

7. Dashboard (/dashboard)
   ↓
   Party journey tracker:
   - Enquiry sent → Waiting for responses
   - Suppliers confirmed → Payment made
   - Party day approaching → Create invite
   - Post-party → Leave reviews
```

### Supplier Journey: Getting Started

```
1. Application (/suppliers/apply)
   ↓
   Submit application:
   - Business name & type
   - Email & phone
   - Location
   - Brief description

2. Account Creation
   ↓
   Receive email with login link
   Create password via Supabase Auth

3. Profile Setup (/suppliers/profile)
   ↓
   Complete profile (tracked via progress bar):
   - Business description ✓
   - Service area ✓
   - Pricing ✓
   - Photos ✓

4. Package Creation (/suppliers/packages)
   ↓
   Add service packages:
   - Package name
   - Duration
   - Price
   - What's included

5. Availability Setup (/suppliers/availability)
   ↓
   Set working hours:
   - Days of week
   - Time slots
   - Blackout dates

6. Calendar Connection (/suppliers/calendar)
   ↓
   Optional but recommended:
   - Connect Google Calendar
   - OR Connect Outlook
   - Automatic availability sync

7. Verification (/suppliers/verification)
   ↓
   Upload documents:
   - DBS/Background check
   - Insurance certificate
   - Professional certifications
   ↓
   Admin reviews and approves

8. Go Live!
   ↓
   Profile becomes publicly visible
   Start receiving enquiries

9. Manage Bookings (/suppliers/dashboard)
   ↓
   Daily workflow:
   - Check new enquiries
   - Accept/decline bookings
   - View upcoming parties
   - Track earnings
```

### Admin Journey: Supplier Verification

```
1. Admin Login (/admin)
   ↓
   Special admin credentials required

2. Verification Queue (/admin/verification/list)
   ↓
   List of pending suppliers:
   - Name
   - Business type
   - Application date
   - Documents uploaded

3. Review Supplier (/admin/verification/view-document)
   ↓
   Check:
   - DBS certificate valid?
   - Insurance up to date?
   - Photos appropriate?
   - Pricing reasonable?

4. Make Decision
   ↓
   Approve: Supplier goes live
   Reject: Email sent with reason
   Request Changes: Supplier notified

5. Post-Verification
   ↓
   Supplier receives email
   If approved: can_go_live = true
```

---

## Working with the Codebase

### Understanding Key Files

#### `utils/partyDatabaseBackend.js`

Your go-to file for party-related database operations:

```javascript
// Create a new party
export async function createParty(userId, partyDetails) {
  // Validates data
  // Inserts into parties table
  // Returns { success: true, partyId } or { success: false, error }
}

// Fetch party details
export async function getParty(partyId) {
  // Fetches from database
  // Also fetches related enquiries
  // Returns enriched party object
}

// Update party details
export async function updateParty(partyId, updates) {
  // Updates specific fields
  // Handles JSONB merging for complex fields
}
```

**When to use:**
- Creating/updating parties
- Fetching party details for customer dashboard
- Managing party status progression

#### `utils/unifiedPricingEngine.js`

Handles all payment calculations:

```javascript
export function calculatePaymentBreakdown(party, suppliers) {
  // For each supplier:
  // 1. Determine if deposit or full payment required
  // 2. Calculate amounts
  // 3. Track per-supplier breakdown

  return {
    totalCost: 350.00,
    amountDueNow: 130.00,
    balanceRemaining: 220.00,
    breakdown: [
      {
        supplierId: 'ent-123',
        category: 'entertainment',
        total: 200.00,
        deposit: 50.00,
        paymentType: 'DEPOSIT'
      },
      {
        supplierId: 'cake-456',
        category: 'cakes',
        total: 60.00,
        deposit: 60.00,
        paymentType: 'FULL'
      }
      // ...
    ]
  }
}
```

**When to use:**
- Displaying prices in UI
- Creating Stripe payment intents
- Generating invoices/receipts

#### `lib/suppliers-api.js`

Server-side supplier queries with caching:

```javascript
import { cache } from 'react'

// Cached function - deduplicates requests
export const getSuppliers = cache(async ({ category, location } = {}) => {
  const supabase = createServerClient()

  let query = supabase
    .from('suppliers')
    .select('*')
    .eq('profile_status', 'live')
    .eq('can_go_live', true)

  if (category) query = query.eq('business_type', category)
  if (location) query = query.ilike('data->>location', `%${location}%`)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching suppliers:', error)
    return []
  }

  return data
})
```

**When to use:**
- Server Components fetching supplier data
- Browse/search pages
- Supplier detail pages

#### `contexts/BusinessContext.jsx`

Manages multi-business suppliers:

```javascript
export function useBusinessContext() {
  const context = useContext(BusinessContext)

  return {
    businesses: context.businesses,        // Array of all user's businesses
    selectedBusiness: context.selected,    // Currently active business
    primaryBusiness: context.primary,      // The main business
    switchBusiness: context.switch,        // Function to change active business
    isLoading: context.loading
  }
}
```

**When to use:**
- Supplier dashboard (show current business)
- Business switcher component
- Profile editing (ensure editing correct business)

### Common Code Patterns

#### Error Handling Pattern

We use a consistent success/error object pattern:

```javascript
// Good - consistent error handling
export async function someOperation() {
  try {
    const result = await database.query()

    if (!result) {
      return { success: false, error: 'Not found' }
    }

    return { success: true, data: result }

  } catch (error) {
    console.error('Operation failed:', error)
    return { success: false, error: error.message }
  }
}

// Usage
const result = await someOperation()
if (!result.success) {
  // Handle error
  toast.error(result.error)
  return
}

// Proceed with result.data
const data = result.data
```

#### localStorage with Validation

Always validate data from localStorage:

```javascript
// Good - safe localStorage usage
function getPartyPlan() {
  try {
    const stored = localStorage.getItem('user_party_plan')
    if (!stored) return null

    const parsed = JSON.parse(stored)

    // Validate structure
    if (!parsed.childName || !parsed.date) {
      console.warn('Invalid party plan in localStorage')
      return null
    }

    return parsed

  } catch (error) {
    console.error('Failed to parse party plan:', error)
    localStorage.removeItem('user_party_plan') // Clean up bad data
    return null
  }
}
```

#### Supabase JSONB Queries

Querying nested JSONB fields:

```javascript
// Access JSONB field with ->> operator
const { data } = await supabase
  .from('suppliers')
  .select('*')
  .eq('data->>category', 'entertainer')
  .ilike('data->>location', '%London%')

// Access nested JSONB
  .eq('data->googleCalendarSync->>connected', 'true')
```

#### Server vs Client Supabase

```javascript
// CLIENT-SIDE (components with "use client")
import { createClient } from '@/lib/supabase'

const supabase = createClient()
// Uses anon key, respects RLS policies

// SERVER-SIDE (API routes, Server Components)
import { createClient } from '@/lib/supabase-admin'

const supabase = createClient()
// Uses service role key, bypasses RLS
```

---

## Common Development Tasks

### Adding a New Supplier Field

Let's say we want to add "years of experience" to supplier profiles:

**Step 1: Update the database**

Since we use JSONB, no migration needed! But you might want to add it to new suppliers automatically.

**Step 2: Add to profile form**

```javascript
// /app/suppliers/profile/page.js

<div className="form-group">
  <label>Years of Experience</label>
  <input
    type="number"
    value={formData.yearsOfExperience || ''}
    onChange={(e) => setFormData({
      ...formData,
      yearsOfExperience: parseInt(e.target.value)
    })}
  />
</div>
```

**Step 3: Update save logic**

```javascript
// When saving profile
const updatedData = {
  ...supplier.data,
  yearsOfExperience: formData.yearsOfExperience
}

await supabase
  .from('suppliers')
  .update({ data: updatedData })
  .eq('id', supplierId)
```

**Step 4: Display in supplier card**

```javascript
// /components/SupplierCard/SupplierCard.jsx

<div className="supplier-experience">
  {supplier.data.yearsOfExperience && (
    <span>{supplier.data.yearsOfExperience} years experience</span>
  )}
</div>
```

### Creating a New API Route

Let's create an endpoint to mark a party as completed:

**Step 1: Create the route file**

```javascript
// /app/api/parties/complete/route.js

import { createClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // Parse request
    const { partyId, review } = await request.json()

    // Validate
    if (!partyId) {
      return NextResponse.json(
        { success: false, error: 'Party ID required' },
        { status: 400 }
      )
    }

    // Database operation
    const supabase = createClient()
    const { error } = await supabase
      .from('parties')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        customer_review: review
      })
      .eq('id', partyId)

    if (error) throw error

    // Send thank you email (optional)
    await fetch('/api/email/thank-you/', {
      method: 'POST',
      body: JSON.stringify({ partyId })
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Failed to complete party:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
```

**Step 2: Call from frontend**

```javascript
// In customer dashboard
const handleCompleteParty = async () => {
  const response = await fetch('/api/parties/complete/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      partyId: party.id,
      review: customerReview
    })
  })

  const result = await response.json()

  if (!result.success) {
    toast.error('Failed to complete party')
    return
  }

  toast.success('Party marked as complete!')
  router.refresh()
}
```

### Modifying Email Templates

All email templates are in `/app/api/email/[template]/route.js`.

**Example: Update payment confirmation email**

```javascript
// /app/api/email/payment-confirmation/route.js

export async function POST(request) {
  const { customerEmail, partyDetails, payment } = await request.json()

  // Build HTML email
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .header { background: #6366f1; color: white; padding: 20px; }
        .content { padding: 20px; }
        .receipt { border: 1px solid #ddd; padding: 15px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Payment Confirmed! 🎉</h1>
      </div>
      <div class="content">
        <p>Hi ${partyDetails.parentName},</p>
        <p>Great news! Your payment for ${partyDetails.childName}'s party has been confirmed.</p>

        <div class="receipt">
          <h3>Receipt</h3>
          <p><strong>Date:</strong> ${partyDetails.date}</p>
          <p><strong>Time:</strong> ${partyDetails.time}</p>
          <p><strong>Amount Paid:</strong> £${payment.amountPaid}</p>
          <p><strong>Balance Remaining:</strong> £${payment.balance}</p>
        </div>

        <p>What's next?</p>
        <ul>
          <li>Your suppliers have been notified</li>
          <li>You'll hear from them within 48 hours</li>
          <li>Create your party invitation in the dashboard</li>
        </ul>

        <a href="https://bookabash.com/dashboard" style="background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">
          View Your Party
        </a>
      </div>
    </body>
    </html>
  `

  // Send via Postmark
  const postmark = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN)

  await postmark.sendEmail({
    From: 'bookings@bookabash.com',
    To: customerEmail,
    Subject: `Party Booking Confirmed - ${partyDetails.childName}'s Party`,
    HtmlBody: htmlBody
  })

  return NextResponse.json({ success: true })
}
```

---

## Testing & Debugging

### Development Testing Tools

**1. Supabase Dashboard**
- View/edit database records directly
- Test SQL queries
- Monitor real-time activity
- Check RLS policies

**2. Stripe Dashboard**
- Test payments with test cards (4242 4242 4242 4242)
- View webhook events
- Monitor payment intents
- Test Klarna flow

**3. Postmark Activity**
- See all sent emails
- View email rendering
- Check delivery status
- Debug bounce/spam issues

**4. Browser DevTools**
- Network tab: Check API calls
- Console: Client-side errors
- Application: localStorage/cookies
- React DevTools: Component state

### Common Debugging Scenarios

**Problem: "Supplier not showing in search results"**

Check:
1. Is `profile_status = 'live'`?
2. Is `can_go_live = true`?
3. Does location match search area?
4. Are they available on the requested date?

Debug query:
```sql
SELECT business_name, profile_status, can_go_live, data->>'location'
FROM suppliers
WHERE business_slug = 'problem-supplier';
```

**Problem: "Payment not processing"**

Check:
1. Stripe API keys correct in `.env.local`?
2. Webhook endpoint accessible (use ngrok for local testing)?
3. Check browser console for Stripe errors
4. Verify payment intent creation in Stripe dashboard

**Problem: "Calendar sync not working"**

Check:
1. OAuth tokens expired? (Check `data.googleCalendarSync.tokenExpiry`)
2. Refresh token still valid?
3. Webhook registered with Google?
4. Check `/api/calendar/webhook/` logs

Debug:
```javascript
// lib/calendar-token-manager.js
// Add logging to token refresh function
console.log('Token expiry:', tokenExpiry)
console.log('Current time:', new Date())
console.log('Needs refresh?:', needsRefresh)
```

**Problem: "localStorage data lost"**

This is normal! localStorage can be cleared by user. Always:
1. Validate before using
2. Have fallback logic
3. Sync critical data to database

**Problem: "Different data in Server vs Client Components"**

This is often caching. Remember:
- Server Components cache by default
- Client Components fetch fresh data
- Use `router.refresh()` to invalidate server cache
- Use `revalidatePath()` in Server Actions

---

## Deployment

### Vercel Deployment (Recommended)

**Step 1: Connect Repository**
1. Go to vercel.com
2. Import your Git repository
3. Select "bookabash" project

**Step 2: Configure Environment**

Add all environment variables in Vercel dashboard:
- Go to Settings → Environment Variables
- Add each variable from `.env.local`
- Set for Production, Preview, and Development

**Step 3: Deploy**

Vercel automatically:
- Runs `npm run build`
- Deploys to global CDN
- Provides preview URLs for PRs

**Step 4: Configure Domains**

1. Add custom domain in Vercel settings
2. Update DNS records
3. SSL automatically provisioned

### Supabase Setup

1. Create project at supabase.com
2. Copy connection details to environment variables
3. Run migrations (if you have SQL files)
4. Set up RLS policies
5. Configure auth providers (email/password enabled by default)

### Webhook Configuration

After deployment, update webhook URLs:

**Stripe:**
```
https://yourdomain.com/api/webhooks/stripe/
Events: payment_intent.succeeded, payment_intent.payment_failed
```

**Google Calendar:**
```
https://yourdomain.com/api/calendar/webhook/
Set up via Google Cloud Console
```

---

## Troubleshooting

### Build Errors

**"Module not found"**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

**"Cannot find module '@/...'"**

Check `jsconfig.json` or `tsconfig.json` has correct path mapping:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Runtime Errors

**"Hydration mismatch"**

This means server-rendered HTML differs from client render. Common causes:
- Accessing `localStorage` in Server Component
- Date formatting inconsistency
- Conditional rendering based on browser APIs

Fix: Move to Client Component or use `useEffect`:
```javascript
"use client"
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) return null

return <div>{localStorage.getItem('data')}</div>
```

**"Supabase client not initialized"**

You're probably trying to use client in a Server Component:
```javascript
// ❌ Wrong
import { createClient } from '@/lib/supabase'
const supabase = createClient() // This needs browser context!

// ✅ Right - Use server client
import { createClient } from '@/lib/supabase-admin'
const supabase = createClient()
```

### Performance Issues

**Slow page loads**

Check:
1. Are images optimized? Use Next.js `<Image>` component
2. Too many API calls? Consider batching or caching
3. Large JSONB queries? Select only needed fields

**Bundle size too large**

```bash
npm run analyze
```

Look for:
- Unused dependencies
- Large libraries (consider alternatives)
- Duplicate packages

---

## Need Help?

### Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Radix UI**: https://www.radix-ui.com/

### Code Comments

We've tried to add helpful comments throughout the codebase. Look for:
- `// IMPORTANT:` - Critical information
- `// TODO:` - Known issues or planned improvements
- `// HACK:` - Temporary workarounds (should be refactored)

### Git Conventions

Branch naming:
- `feature/add-supplier-ratings`
- `fix/calendar-sync-bug`
- `refactor/payment-logic`

Commit messages:
- Use present tense: "Add feature" not "Added feature"
- Be descriptive: "Fix calendar sync for themed suppliers" not "Fix bug"

---

## Welcome to the Team!

You now have a solid understanding of PartySnap. Here's what to do next:

1. **Set up your local environment** - Get it running!
2. **Explore a user flow** - Create a test party booking end-to-end
3. **Read some code** - Start with a familiar component
4. **Make a small change** - Fix a typo, update styles
5. **Ask questions** - No question is too small!

Remember: This is a complex project. It's okay to feel overwhelmed at first. Take it one feature at a time, and don't hesitate to trace through the code with console.logs to understand the flow.

Happy coding! 🎉
