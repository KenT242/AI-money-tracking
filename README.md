# Money App

A personal finance management application (Smart Spending Tracker) with AI-powered expense categorization using Gemini 2.5 Flash Lite.

## Features

- 💰 Track income and expenses
- 🤖 AI-powered automatic transaction categorization
- 📊 Dashboard with financial analytics
- 📱 Mobile-first responsive design
- 🎨 Modern UI with Shadcn/UI components

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **AI**: Gemini 2.5 Flash Lite via custom proxy
- **UI**: Tailwind CSS, Shadcn/UI, Lucide Icons
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or cloud)
- Gemini API proxy server with API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd money-app
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables

Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

Required environment variables:
- `MONGODB_URI`: MongoDB connection string
- `AI_API_BASE_URL`: Base URL for Gemini proxy server
- `AI_API_KEY`: API key for Gemini proxy

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run type-check   # TypeScript type checking
```

## Project Structure

```
├── app/                  # Next.js App Router pages
├── components/           # React components
│   └── ui/              # Shadcn/UI components
├── lib/                 # Core utilities
│   ├── db/             # Database connection
│   └── ai/             # AI client and prompts
├── models/             # Mongoose schemas
├── services/           # Business logic layer
├── types/              # TypeScript definitions
└── public/             # Static assets
```

## Architecture

See [CLAUDE.md](CLAUDE.md) for detailed architecture documentation.

## License

MIT
