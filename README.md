# LangApp - Language Learning Web App

A Duolingo-inspired language learning web application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Guided Learning Path**: Step-by-step lessons organized in units
- **Credits System**: Credits are spent only when starting a lesson attempt (5 credits per attempt)
- **Free Practice Modes**: Practice hub with mistakes review and vocabulary matching games
- **Progress Tracking**: XP, streaks, and lesson completion tracking
- **Responsive Design**: Desktop sidebar navigation and mobile bottom tab bar
- **Smooth Animations**: Micro-interactions using Framer Motion

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (animations)
- **localStorage** (data persistence)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── (app)/          # Protected app routes
│   │   ├── learn/      # Learning path page
│   │   ├── lesson/     # Lesson runner
│   │   ├── results/    # Results page
│   │   ├── practice/   # Practice hub
│   │   ├── profile/    # User profile
│   │   └── store/      # Credits store
│   ├── (auth)/         # Auth routes
│   │   ├── login/
│   │   └── signup/
│   └── layout.tsx      # Root layout
├── components/
│   ├── app/           # App-specific components
│   ├── layout/        # Layout components
│   ├── learn/         # Learning path components
│   ├── lesson/        # Lesson runner components
│   └── ui/            # Base UI components
├── lib/
│   ├── credits.ts     # Credit engine
│   ├── data.ts        # Mock data
│   ├── progress.ts    # Progress tracking
│   ├── storage.ts     # localStorage utilities
│   └── types.ts       # TypeScript types
└── styles/
    └── globals.css    # Global styles and design tokens
```

## Design System

The app uses CSS custom properties (design tokens) defined in `styles/globals.css`:

- **Colors**: Primary green (#58CC02), accents (info, warning, danger, purple)
- **Typography**: Nunito for headings, Inter for body
- **Spacing**: 4px scale (4, 8, 12, 16, 24, 32)
- **Border Radius**: Large (20px), Medium (14px), Small (10px)

## Credits System

- Starting credits: 50
- Credit cap: 100
- Lesson attempt cost: 5 credits
- Daily refill: +20 credits
- First lesson bonus: +5 credits
- Practice modes: Free (0 credits)

## Data Storage

All data is stored in localStorage:
- User session
- Wallet balance and transactions
- Lesson attempts
- User progress (XP, streak, completed lessons)

## Seed Data

The app includes seed data with:
- 1 course (Spanish for Beginners)
- 2 units
- 5 lessons per unit (mix of regular and practice lessons)
- 8 exercises per lesson (MCQ and fill-in-the-blank types)

## License

MIT
