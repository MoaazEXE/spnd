# Spnd — The money you didn't spend

A personal finance app that **intervenes before the money leaves**. Log temptations, let them cool, and celebrate what you didn't spend — solo or with a group.

Built for the Shortcut Asia Internship Challenge 2026 (23 May – 2 June).

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Database | Supabase (Postgres + Auth + Realtime) |
| ORM | Prisma 7 |
| UI | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| Tests | Vitest |
| Hosting | Vercel |

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env` with your Supabase project credentials (see `.env.example` for all required keys).

### 3. Push the database schema

```bash
npx prisma migrate dev --name init
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Run unit tests

```bash
npm test
```

Tests cover the three pure core modules: `cooling/`, `debt/`, and `timecost/`.

## Architecture

```
src/
├── app/          # Next.js App Router (thin route handlers + page shells)
│   ├── (auth)/   # login / signup
│   └── (app)/    # authenticated shell: dashboard, cooling, groups, settings
├── core/         # ★ Pure domain logic — framework-free, fully tested
│   ├── cooling/  # State machine: status computed from timestamps, never client timers
│   ├── debt/     # Debt simplification: minimum cash-flow algorithm
│   ├── timecost/ # Time-cost engine: price → hours of your life (simple + true-hourly)
│   └── savings/  # Derive "saved by waiting" totals (never stored as a column)
├── data/         # Prisma repository layer
├── lib/          # Supabase clients, Prisma singleton
└── types/        # Shared domain types
```

## Key design decisions

- **Money as integer cents** everywhere — no floating-point arithmetic.
- **Cooling is computed, not counted** — `coolingUntil > now()` on every read; closing a tab can't break the state.
- **Savings totals are derived, never stored** — sum of SKIPPED items on read keeps them always-correct.
- **Core logic is framework-free** — `src/core/` has zero Next.js or Prisma imports, making it trivially testable and portable to a future mobile API.
