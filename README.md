# Chaptr

Singapore tutoring marketplace demo — built with **Expo (React Native) + TypeScript + Expo Router**.

> A student books a topic, gets matched, and pays — then a tutor accepts.

All data and payments are **mock only**. There is no backend, no real PayNow, and no money movement.

## How to run

```bash
cd chaptr
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR with Expo Go. Web: `npx expo start --web`.

### Typecheck

```bash
npx tsc --noEmit
```

## Screen map

### Shared
| Screen | Route | Notes |
|--------|-------|-------|
| Splash | `/` | Accent splash → role picker after ~1.6s |
| Role picker | `/role` | Student / Tutor demo switch |

### Student
| Screen | Route | Flow |
|--------|-------|------|
| PDPA consent | `/student/consent` | First visit gate |
| Home | `/student/home` | Subjects + chapter topics |
| Book / duration | `/student/book` | Duration, location, handoff note |
| Payment QR | `/student/payment` | **Mock** PayNow QR + “I've paid” |
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

Use **Switch role** on student home or **Switch to student view** on tutor home to jump back to `/role`.

## Design tokens

- Accent `#F2600C` / accent-dark `#B34500`
- Page background `#EEF0F3`
- Font: **Plus Jakarta Sans** via `@expo-google-fonts/plus-jakarta-sans`
- Cards with asymmetric rounded corners, chapter spines, G3 bands, amber tags, duration pills, status chips

## Stack

- Expo SDK 57 + Expo Router
- React Native + TypeScript
- Local mock state (`context/AppContext.tsx`) — no API keys, no secrets

## Payments note

PayNow QR, UEN, DBS withdrawal, and all dollar amounts are **fictional demo UI**. Do not treat them as real payment rails.

## Project layout

```
app/                 Expo Router screens
components/          Shared UI + SessionCard + mock QR
constants/           theme + mockData
context/             AppProvider mock store
```

## Prototype source

Clickable HTML prototype lives at `../chaptr-src/prototype.html` (sibling of this app).
