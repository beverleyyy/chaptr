# Web deploy (Vercel)

Ping’s web build is an Expo Router **static** export (`expo.web.output` is `"static"` in `app.json`). Expo SDK 57 writes that export to **`dist`** when you run `expo export -p web`.

`vercel.json` tells Vercel to run that export and publish `dist`.

This app uses static rendering (`web.output: "static"`), so Expo writes one HTML file per route (`index.html`, `role.html`, `auth/sign-in.html`, `student/home.html`, …). The [Expo SDK 57 publishing guide](https://docs.expo.dev/versions/v57.0.0/guides/publishing-websites/) shows a single-page `vercel.json` (`cleanUrls: true` plus a rewrite of every path to `/`). That snippet is for `web.output: "single"`. On this static export it 404s the site root:

- `cleanUrls` publishes `index.html` at the clean path `/index`, then redirects `/index` and `/index.html` to `/`. `/` itself has no file, so `/` and `/index.html` 404. Other pages such as `/role` still work.
- A catch-all rewrite to `/` then has nowhere to land, so `/` stays broken.

`vercel.json` therefore does not set `cleanUrls`. Vercel serves real files first, which is what makes `/` and `/index.html` return `index.html` (200). `trailingSlash: false` redirects `/role/` to `/role`. The rewrite runs only after the filesystem misses, and only for extensionless paths, sending them to the matching export:

| Request | Result |
| --- | --- |
| `/`, `/index.html` | `index.html` (filesystem) |
| `/role`, `/auth/sign-in`, `/student/home` | `role.html`, `auth/sign-in.html`, `student/home.html` |
| `/_expo/static/…` and other hashed assets | the file itself |

Paths with a dot (JS, CSS, fonts, images) are not rewritten. Unknown extensionless paths 404 when no matching `.html` file was exported.

## Connect GitHub and deploy

1. In [Vercel](https://vercel.com), add a new project and import [github.com/beverleyyy/chaptr](https://github.com/beverleyyy/chaptr).
2. Leave the framework preset unset. `vercel.json` sets `"framework": null` so Vercel does not guess a Node server.
3. Confirm the build settings match `vercel.json` (Vercel reads this file from the repo):
   - **Build command:** `npm run export:web` (`expo export -p web`)
   - **Output directory:** `dist`
4. Add the environment variables below, then deploy. Later pushes to the connected branch rebuild the site.

`dist/` stays gitignored. Vercel builds it in CI. Do not commit a local export.

Check the export on your machine:

```bash
npm run export:web
npx expo serve
```

Open the URL `expo serve` prints (HTTP only).

## Environment variables

Set these in the Vercel project (**Settings → Environment Variables**) for Production and Preview. Metro inlines `EXPO_PUBLIC_*` at **build** time, so change them in Vercel and redeploy. Do not commit values. Placeholders are in [`.env.example`](../.env.example).

| Name | Role |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase **anon / public** key |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe **publishable** key (`pk_…`). The payment screen uses it only as a client-side gate for live PayNow. |

The app reads no other `EXPO_PUBLIC_*` variables.

If the Supabase URL or anon key is missing, the site still builds and runs the offline mock demo (same as a local run without `.env`).

Do **not** add `STRIPE_SECRET_KEY`, the Supabase service role key, or any other secret to Vercel or to git. The Stripe secret belongs in Supabase Edge Function secrets, as noted in `.env.example`.

## PayNow return URL

The `create-paynow-payment` edge function sets Stripe `return_url` to `ping://payment-return`. The payment screen listens for that custom scheme (and the older `chaptr://payment-return`). A `ping://` link opens the native app. It does not bring a browser tab back to this website. Hosted PayNow on the web preview can still show a QR, but the banking app will not return into the site until `return_url` is an `https` URL on the deployed origin (and the web client treats that URL as a payment return). That change is separate from this static hosting setup.
