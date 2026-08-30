# BreakawayIQ — AI hockey skills app

Players pick a hockey skill (wrist shot, slap shot, crossovers, …), upload a short
clip, and get an AI technique breakdown: per-phase scoring, their top flaws, and
targeted drills to fix them. Paid product — monthly membership (checkout is
**stubbed** for now; Stripe comes later).

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4)
- **Prisma 6 + SQLite** (dev) — swap `provider`/`DATABASE_URL` for Postgres in prod
- **Auth.js (NextAuth v5)** — email + password (credentials), JWT sessions
- **Vercel Blob** — video storage
- **ffmpeg-static** — frame extraction (no system ffmpeg needed)
- **Anthropic SDK** — `claude-opus-5` vision + structured outputs for the analysis

## Setup

```bash
npm install
```

Create `.env.local` (see `.env.example`) and fill in:

| Var | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys |
| `BLOB_READ_WRITE_TOKEN` | Vercel dashboard → Storage → create a Blob store |
| `AUTH_SECRET` | already generated in `.env.local`; regenerate with `npx auth secret` |
| `DATABASE_URL` | leave as `file:./dev.db` for local dev (lives in `.env`) |

> **npm install scripts:** this machine's npm blocks dependency install scripts by
> default. If `ffmpeg-static` didn't download its binary, run
> `npm install-scripts approve ffmpeg-static` then `npm run setup:ffmpeg`.

Initialize the database:

```bash
npx prisma migrate dev
```

Run it:

```bash
npm run dev
```

## How the analysis pipeline works

1. `POST /api/analyses` (multipart: `skillKey` + `video`) — checks auth + active
   subscription, uploads the clip to Vercel Blob, creates an `Analysis` row
   (`status: processing`), and schedules processing via `after()`.
2. `src/lib/process-analysis.ts`:
   - `extractFrames()` (`src/lib/frames.ts`) — downloads the clip, reads its
     duration from ffmpeg, pulls 10 evenly-spaced JPEG frames.
   - `analyzeSkill()` (`src/lib/claude.ts`) — sends the frames + a skill-specific
     rubric + the drill catalog to `claude-opus-5`, gets back a typed JSON
     assessment (Zod-validated). The model may only recommend drills from
     `src/lib/hockey/drills.ts`.
   - result is stored on the `Analysis` row as JSON.
3. `/analysis/[id]` polls `GET /api/analyses/[id]` every 2.5s until `complete`.

Token usage for each run is logged to the server console so you can watch real cost
(~$0.03–0.08 per analysis with opus-5 vision on 10 frames).

## Hockey content

Skills and drills are **static data**, not database rows:

- `src/lib/hockey/skills.ts` — skill definitions: filming instructions + the phases
  and checkpoints Claude grades against.
- `src/lib/hockey/drills.ts` — the drill library. `targetsFlaws` tags are what
  Claude matches flaws against. Add drills here freely.

## Verify it end to end

1. `npm run dev`, open http://localhost:3000
2. Register → you land on the dashboard, membership "Not active"
3. Click **Start membership** (stub) → becomes "Active", renews in 30 days
4. **Skills** → **Wrist Shot** → read the filming tips
5. Film ~5s of a shot on your phone (side angle), upload it
6. Watch it process (~20–40s), then the breakdown renders
7. It shows up on your dashboard; open it again to re-view
8. Sign out, hit `/analysis/<id>` directly → redirected to login

Frame extraction on its own (no Next / Claude):

```bash
npm run test:frames -- path/to/clip.mp4
# writes JPEGs to ./tmp/
```

## Not built yet (deferred)

- Stripe Checkout + webhooks (subscription is stubbed in `src/lib/subscription.ts`)
- Background job queue — processing runs inline via `after()`; fine for dev, but
  Vercel function timeouts will cap long videos in production
- Coach-side dashboard / client roster
- "Pick the release moment" video trimming
- Email verification, password reset
- Refusal-fallback on the Claude call (currently handled as a plain error)
