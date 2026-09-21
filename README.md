# Chaptr

Singapore tutoring marketplace — **Expo (React Native) + TypeScript + Expo Router**, with optional **Supabase** auth & Postgres.

> A student books a topic, gets matched, and pays — then a tutor accepts.

**Payments remain mock** (PayNow QR / DBS withdraw UI only). When Supabase env vars are missing, the app keeps the original offline demo behaviour.

## How to run (mock / offline)

```bash
cd chaptr
npm install
npx expo start
```

No `.env` needed. Press `i` / `a` or scan with Expo Go. Web: `npx expo start --web`.

### Typecheck

```bash
npx tsc --noEmit
```

## Supabase setup (real auth + data)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste and run  
   [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql)  
   (profiles, tutoring_requests, sessions, earnings, RLS, signup trigger, `accept_tutoring_request`).
3. **Authentication → Providers**: enable Email. For local demos, you can disable “Confirm email”.
4. **Project Settings → API**: copy **Project URL** and **anon public** key.
5. Copy env example and fill keys:

   ```bash
   cp .env.example .env
   # EXPO_PUBLIC_SUPABASE_URL=...
   # EXPO_PUBLIC_SUPABASE_ANON_KEY=...
   ```

6. Restart Expo with a clean cache:

   ```bash
   npx expo start -c
   ```

7. Splash → **Sign in / Sign up** (email + password, student or tutor role) → role consent → existing UI flows.

Do **not** commit `.env` or secrets. Only `.env.example` is tracked.

### What becomes real vs still mock

| Area | With Supabase configured | Without (mock) |
|------|--------------------------|----------------|
| Auth | Email/password + `profiles` role | Skipped — role picker demo |
| Create request | Insert `tutoring_requests` after “I've paid” | Local only |
| Tutor pending list | Polls pending rows | Seeded mock requests + timer inject |
| Accept / decline | RPC / update + session + earnings stub | Local state |
| Sessions / earnings basics | Loaded from `sessions` / `earnings` | Seeded mock lists |
| PayNow / withdraw | **Always mock UI** | Mock |

PII is minimal (name + optional phone) for PDPA-minded Singapore use.

## Screen map

### Shared
| Screen | Route | Notes |
|--------|-------|-------|
| Splash | `/` | → auth (if configured & logged out) or role picker |
| Sign in / Sign up | `/auth/sign-in`, `/auth/sign-up` | Only when Supabase env is set |
| Role picker | `/role` | Student / Tutor; sign out when authed |

### Student
| Screen | Route | Flow |
|--------|-------|------|
| PDPA consent | `/student/consent` | First visit gate |
| Home | `/student/home` | Subjects + chapter topics |
| Book / duration | `/student/book` | Duration, location, handoff note |
| Payment QR | `/student/payment` | **Mock** PayNow + create request when backend on |
| Matching | `/student/matching` | Searching… (auto or skip) |
| Matched | `/student/matched` | Tutor card + venue / Zoom |

### Tutor
| Screen | Route | Flow |
|--------|-------|------|
| Tutor agreement | `/tutor/consent` | First visit gate |
| Dashboard | `/tutor/home` | Online toggle, pending requests, week earnings |
| Pending request | `/tutor/pending` | Accept / decline with countdown |
| Accepted | `/tutor/accepted` | Confirmation |
| Schedule | `/tutor/schedule` | Today / upcoming (cancel flow) |
| Earnings | `/tutor/earnings` | Week total, withdrawable balance, session list |
| Availability | `/tutor/availability` | Subjects + weekly schedule toggles |
| Profile | `/tutor/profile` | Bio, style tags, base rate |
| Withdraw | `/tutor/withdraw` | **Mock** DBS payout |
| Withdraw success | `/tutor/withdraw-success` | Confirmation |

## Design tokens

- Accent `#F2600C` / accent-dark `#B34500`
- Page background `#EEF0F3`
- Font: **Plus Jakarta Sans** via `@expo-google-fonts/plus-jakarta-sans`

## Stack

- Expo SDK 57 + Expo Router
- React Native + TypeScript
- `@supabase/supabase-js` + `expo-secure-store` (AsyncStorage fallback on web / large sessions)
- Mock fallback in `context/AppContext.tsx` when `EXPO_PUBLIC_SUPABASE_*` are unset

## Project layout

```
app/                      Expo Router screens (+ auth/)
components/               Shared UI + SessionCard + mock QR
constants/                theme + mockData
context/                  AuthProvider + AppProvider
lib/                      supabase client, types, requests API
supabase/migrations/      SQL for Supabase SQL editor
.env.example              Public URL + anon key placeholders
```

## Prototype source

Clickable HTML prototype lives at `../chaptr-src/prototype.html` (sibling of this app).
