# Web deploy (Vercel)

Ping’s web build is an Expo Router **static** export (`expo.web.output` is `"static"` in `app.json`). Expo SDK 57 writes that export to **`dist`** when you run `expo export -p web`.

`vercel.json` tells Vercel to run that export and publish `dist`. `cleanUrls` serves paths such as `/student/profile` from the matching HTML file when static export generated one. The rewrite sends any path that has no file to `/` (which serves `index.html`), so a refresh on a client route does not 404. That is the [Expo SDK 57 Vercel pattern](https://docs.expo.dev/versions/v57.0.0/guides/publishing-websites/).

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
