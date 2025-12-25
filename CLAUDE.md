# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Money App is a personal finance management application (Smart Spending Tracker) that uses Natural Language Processing to auto-categorize expenses. The app integrates with Gemini-2.5-Flash-Lite via a custom server proxy for AI-powered transaction categorization. This is a mobile-first web application.

## Tech Stack

- Next.js 15+ with App Router
- TypeScript
- MongoDB with Mongoose ODM
- AI Integration: Custom Server API (requires BaseURL + API Key for Gemini-2.5-Flash-Lite proxy)
- UI: Tailwind CSS, Shadcn/UI components, Lucide Icons
- Deployment: Vercel

## Development Commands

```bash
# Setup
npm install

# Development server (localhost:3000)
npm run dev

# Production build
npm run build
npm run start

# Code quality
npm run lint
npm run format
npm run type-check
```

## Architecture

### Application Structure

This is a Next.js App Router project with the following architectural layers:

**app/**: Next.js routes, layouts, and Server Actions
- `(auth)/`: Authentication flows
- `(dashboard)/`: Transaction listing and analytics views
- `api/`: Internal API endpoints (REST endpoints if needed)

**lib/**: Infrastructure and core utilities
- `lib/db/mongodb.ts`: MongoDB singleton connection manager
- `lib/ai/client.ts`: AI client for Gemini integration and prompt templates

**models/**: Mongoose schemas
- Transaction model: Stores expense/income records
- Category model: Manages transaction categories

**services/**: Business logic layer that orchestrates between models, AI, and database

**components/**: Reusable UI components (Shadcn/UI based)

**types/**: Global TypeScript type definitions

### Key Architectural Patterns

1. **AI-Powered Categorization**: When users create transactions, the app sends transaction details (amount, description, merchant) to the Gemini AI service via lib/ai/client.ts to automatically suggest or assign categories.

2. **MongoDB Connection**: Use the singleton pattern in lib/db/mongodb.ts to maintain a single database connection across serverless function invocations.

3. **Server Actions**: Next.js Server Actions (in app/ directory) handle form submissions and data mutations, calling into the services layer.

4. **Services Layer**: Business logic lives in services/ directory, keeping app/ components lean and focused on presentation.

### Environment Variables

Required environment variables (add to .env.local):
- `MONGODB_URI`: MongoDB connection string
- `AI_API_BASE_URL`: Base URL for the Gemini proxy server
- `AI_API_KEY`: API key for the Gemini proxy server
- `SESSION_SECRET`: Session encryption secret (generate with `openssl rand -base64 32`)

### Authentication

The app uses **iron-session** with username/password authentication:

**Authentication Flow:**
1. User visits [/auth/signin](app/auth/signin/page.tsx) to login or signup
2. For signup: username, password, and name are required
3. Password is hashed with bcryptjs (10 salt rounds) before storing
4. Session is created with iron-session (30-day expiration)
5. User is redirected to home page

**User Model ([models/User.ts](models/User.ts)):**
- `username`: Unique, lowercase, 3-30 characters
- `password`: Hashed with bcryptjs, minimum 6 characters
- `name`: Display name
- `createdAt`, `updatedAt`: Timestamps

**Session Management:**
- Library: iron-session (encrypted cookie-based sessions)
- Cookie name: `money-app-session`
- Duration: 30 days
- Storage: Encrypted in HTTP-only cookie
- Session data: `userId`, `username`, `name`, `isLoggedIn`

**Route Protection:**
- Middleware ([middleware.ts](middleware.ts)) protects all routes except `/auth/*` and `/api/auth/*`
- Unauthenticated users are redirected to `/auth/signin`
- Authenticated users trying to access `/auth/signin` are redirected to home

**API Endpoints:**
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Destroy session
- `GET /api/auth/me` - Get current user info

**Getting User in Client Components:**
```typescript
const response = await fetch("/api/auth/me");
const { user } = await response.json();
```

**Getting User in API Routes:**
```typescript
import { getSession } from "@/lib/auth/session";
const session = await getSession();
if (!session.isLoggedIn || !session.userId) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
const userId = session.userId;
```

### AI Integration Notes

The AI categorization flow:
1. User submits transaction (description, amount, etc.)
2. Service layer calls lib/ai/client.ts with transaction details
3. AI client formats a prompt and sends to Gemini-2.5-Flash-Lite proxy
4. Response is parsed to extract category and confidence score
5. Transaction is saved with AI-suggested category

Prompts are stored as templates in lib/ai/ to maintain consistency and allow easy iteration on categorization accuracy.

## Design System & UI Guidelines

This project follows a **modern, glassmorphic design language** with dark mode as the primary theme. All UI components must adhere to these guidelines:

### Color Palette

**Primary Gradient Theme:**
- Violet (#8b5cf6) → Fuchsia (#d946ef) → Pink (#ec4899)
- Used for: headers, CTAs, accent elements, gradients

**Semantic Colors:**
- Income/Success: Emerald (#10b981)
- Expense/Destructive: Rose (#f43f5e)
- Neutral backgrounds: Slate-800/Slate-700 with opacity

**Opacity Levels:**
- Backgrounds: /80, /50, /20
- Borders: /10 for subtle dividers
- Hover states: /30

### Visual Style

**Glassmorphism Effects:**
- `backdrop-blur-xl` or `backdrop-blur-sm` for glass effect
- Semi-transparent backgrounds (bg-card/80, bg-slate-800/50)
- Subtle borders with `border-white/10`

**Border Radius:**
- Cards/Containers: `rounded-3xl` (24px)
- Message bubbles: `rounded-2xl` (16px)
- Inputs/Buttons: `rounded-2xl` (16px)
- Pills/Badges: `rounded-full`

**Shadows:**
- Primary elements: `shadow-2xl`
- Interactive elements: `shadow-lg shadow-violet-500/30`
- Depth hierarchy: use shadows to indicate elevation

### Components Style

**Cards:**
```tsx
<Card className="backdrop-blur-xl bg-card/80 border-2 border-white/10 shadow-2xl rounded-3xl">
```

**Buttons (Primary):**
```tsx
<Button className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-lg shadow-violet-500/30">
```

**Input Fields:**
```tsx
<Input className="h-14 px-6 bg-slate-800/50 backdrop-blur-sm border-2 border-white/10 rounded-2xl focus:border-violet-500/50">
```

**Message Bubbles:**
- User messages: `bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30`
- Assistant messages: `bg-gradient-to-br from-slate-800/80 to-slate-700/80 text-white border border-white/10`
- System messages: `bg-gradient-to-br from-slate-800/50 to-slate-700/50 text-slate-200 border border-white/10`

**Badges:**
- Income: `bg-emerald-500/20 text-emerald-300 border-emerald-500/30 rounded-full`
- Expense: `bg-rose-500/20 text-rose-300 border-rose-500/30 rounded-full`

### Typography

**Headers:**
- Use gradient text: `bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent`
- Sizes: Hero (text-6xl/7xl), Section (text-2xl), Subsection (text-xl)

**Body Text:**
- Default: `text-sm` or `text-base`
- Muted/Secondary: `text-muted-foreground`

### Animations

**Entry Animations:**
```tsx
className="animate-in fade-in slide-in-from-bottom-4 duration-1000"
```

**Staggered Delays:**
```tsx
style={{ animationDelay: `${index * 50}ms` }}
```

**Continuous Animations:**
- Pulse for status indicators: `animate-pulse`
- Spinner: `animate-spin`

**Hover Transitions:**
```tsx
className="transition-all hover:opacity-30"
```

### Layout Patterns

**Page Structure:**
- Fixed gradient backgrounds with blur effects
- Center-aligned content with max-width constraints
- Generous spacing (space-y-12 for sections)

**Background Gradients:**
```tsx
<div className="fixed inset-0 -z-10">
  <div className="absolute ... bg-violet-500/30 rounded-full blur-3xl animate-pulse" />
  <div className="absolute ... bg-fuchsia-500/30 rounded-full blur-3xl animate-pulse delay-700" />
</div>
```

**Responsive Design:**
- Mobile-first approach
- Use `md:` prefix for desktop adjustments
- Consistent padding: `p-4 md:p-12`

### Iconography

- Use Lucide React icons consistently
- Size: `w-4 h-4` (small), `w-5 h-5` (medium), `w-6 h-6` (large)
- Emoji for decorative/friendly elements (💬, 💰, 🎯, etc.)

### Dark Mode

**IMPORTANT:** This app uses dark mode exclusively.
- Always include `className="dark"` on `<html>` tag
- All components must be designed for dark backgrounds
- Use appropriate contrast ratios for accessibility

### Examples Reference

See these files for implementation examples:
- `components/transaction-chat.tsx` - Modern chat interface
- `app/page.tsx` - Hero section with animated backgrounds
- All new components should match this visual language