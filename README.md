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
2. Open **SQL Editor**, paste and run in order:
   - [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql) — tables, RLS, `accept_tutoring_request`
   - [`supabase/migrations/002_booking_polish.sql`](supabase/migrations/002_booking_polish.sql) — drops the broken signup trigger, enables realtime on requests/sessions, optional `decline_tutoring_request`
   - [`supabase/migrations/003_fix_booking_create.sql`](supabase/migrations/003_fix_booking_create.sql) — **required after pull**: 2-hour `expires_at`, `ensure_my_profile` + `create_my_tutoring_request` RPCs (fixes “I've paid” / empty tutor pending)
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

7. Splash → **Sign in / Sign up** (email + password, student or tutor role) → role consent → **student curriculum (subjects + G1/G2/G3)** → existing UI flows.

Do **not** commit `.env` or secrets. Only `.env.example` is tracked.

### Student curriculum

Students must pick their Full SBB / SEC subjects and a level (**G1 / G2 / G3**) before home/booking. Run [`supabase/migrations/010_student_curriculum.sql`](supabase/migrations/010_student_curriculum.sql) for `student_curriculum` + `ensure_my_curriculum`. Demo mode persists the same choices in AsyncStorage.

### Profile creation note

The `on_auth_user_created` DB trigger from `001_initial.sql` was **intentionally removed** (see `002_booking_polish.sql`) because it caused `Database error saving new user`. Profiles are upserted **client-side** on signup / session load, and again before inserting a tutoring request.

**After pulling latest app code, run** [`supabase/migrations/003_fix_booking_create.sql`](supabase/migrations/003_fix_booking_create.sql) **in the Supabase SQL Editor.** It lengthens pending request expiry to **2 hours** and adds security-definer RPCs so “I've paid” can create a request even when client `profiles` upsert hits RLS, and so tutors without a profile row can still load pending requests after `ensureOwnProfile`.

### How to test two roles (live booking → accept → matched)

Use **two browsers** (or one normal + one private window) so each stays signed in as a different account.

1. **Browser A — Student**
   - Sign up as **Student** (e.g. `student@example.com`).
   - Consent → **pick subjects + G1/G2/G3 levels** → Home (only those subjects) → pick a topic → Book → Payment → **I've paid**.
   - You should land on **Finding your tutor** and stay there (no fake auto-match). A `tutoring_requests` row is created with your auth user id.

2. **Browser B — Tutor**
   - Sign up as **Tutor** (e.g. `tutor@example.com`).
   - Consent → stay **Online** on the tutor home.
   - Within a few seconds (poll / realtime / pull-to-refresh) the pending request appears.
   - Open it → **Accept request**.

3. **Back to Browser A**
   - Matching should exit to **Matched** with the **real tutor name** from `profiles`.
   - Tutor home / schedule / earnings should show the new session + earnings stub.

4. **Decline path (optional)**
   - Student pays again → Tutor opens request → **Decline** → student matching shows a clear “no match” state.

Mock mode (no `.env`): student still auto-matches after a short timer; tutor still sees seeded demo requests.

### What becomes real vs still mock

| Area | With Supabase configured | Without (mock) |
|------|--------------------------|----------------|
| Auth | Email/password + `profiles` role | Skipped — role picker demo |
| Create request | RPC `create_my_tutoring_request` (fallback insert) after “I've paid” | Local only |
| Student matching | Polls / realtime until tutor accepts | Fake ~3.5s timer + skip |
| Tutor pending list | Polls (~5s) + realtime + pull-to-refresh | Seeded mock requests + timer inject |
| Accept / decline | RPC / update + session + earnings stub | Local state |
| Matched screen | Real tutor name from profiles | Demo “Mr. Rajan” |
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
| Matching | `/student/matching` | Wait for accept (live) or demo timer |
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

- Accent `#2B6CFF` / accent-dark `#1E54D6` (Ping super-blue)
- Page background `#EEF4FF` (ice / cream alias)
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
