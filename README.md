<<<<<<< HEAD

=======
# AI Career Coach

Full-stack Next.js (App Router) platform for AI-assisted career workflows: resumes, interviews, cover letters, onboarding, and now Feature 6 — Job Alerts Subscription powered by Prisma, Adzuna, Resend, and Inngest.

---

```markdown
# AI Career Coach

Full-stack Next.js (App Router) platform for AI-assisted career workflows: resumes, interviews, cover letters, onboarding, and now Feature 6 — Job Alerts Subscription powered by Prisma, Adzuna, Resend, and Inngest.

---

## Environment

Copy `.env.example` to `.env` and populate:

- Database & Clerk auth (`DATABASE_URL`, `NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY`)
- AI / background (`GEMINI_API_KEY`, `INNGEST_CLIENT_KEY`)
- Job alerts (`ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `RESEND_API_KEY`, `FROM_EMAIL`, `NEXT_PUBLIC_APP_URL`, `ALERTS_RUN_SECRET`, `ALERTS_RUN_URL`, `DEMO_ALERT_EMAIL`)

---

## Database & Prisma

```bash
npx prisma migrate dev --name add_job_alerts
npx prisma generate
```

New models: `JobAlertSubscription`, `JobListing`, `SentJobAlert`, plus enums for frequency, remote preference, and experience. `JobListing.url` is unique so duplicate discoveries are ignored and `SentJobAlert` guards `subscriptionId + jobListingId`.

---

## Feature 6 overview

- 🔐 Clerk-protected API routes under `/api/alerts`
- 📨 Resend-powered mailer (`src/lib/mailer.ts`) with unsubscribe footer linking to `/alerts`
- 🤖 Adzuna client (`src/lib/adzuna.ts`) and configurable matching logic (`src/lib/matching.ts`)
- 🗃️ Prisma storage + dedupe (`JobListing` upserted by URL; `SentJobAlert` only once per subscription/job)
- 🛠️ Runner orchestration (`src/lib/job-alerts/pipeline.ts`) shared by the API, Inngest worker, cron script, and demo seeder
- 💌 UI (`/app/alerts`) with form, subscription list, toggles, delete, manual run button, and delivery history
- ✅ Vitest coverage in `tests/matching.test.ts` (6 scenarios: exact, partial, skills, remote, experience mismatch, dedupe)

---

## Running the job-alert runner

### Manual / local

```bash
npm run alerts:demo   # seeds a demo user + subscription then runs the pipeline
npm run alerts:run    # POSTs to /api/alerts/run using ALERTS_RUN_SECRET
```

`scripts/demo-job-alert.ts` seeds a user (using `DEMO_ALERT_EMAIL`), upserts an alert, and executes the matcher so you can validate email delivery locally.

### Inngest worker

- Function: `src/integrations/inngest/jobAlertRunner.ts`
- Registered in `app/api/inngest/route.js`
- Cron: hourly (`0 * * * *`)
- Configure `INNGEST_CLIENT_KEY` and deploy via the Inngest dashboard or CLI; results returned from `runJobAlertPipeline`.

### Cron / serverless alternative

The route `POST /api/alerts/run` accepts either an authenticated Clerk request or the `ALERTS_RUN_SECRET` header (`x-cron-secret` or `Authorization: Bearer SECRET`).

Examples:

```bash
# Vercel cron.json
[
  {
    "path": "/api/alerts/run",
    "schedule": "0 */3 * * *",
    "headers": { "x-cron-secret": "YOUR_SECRET" }
  }
]
```

```yaml
# Render cron job command
command: >-
  curl -X POST https://your-app.onrender.com/api/alerts/run
  -H "x-cron-secret: ${ALERTS_RUN_SECRET}"
```

```yaml
# GitHub Actions (cron)
name: job-alerts
on:
  schedule:
    - cron: "0 */6 * * *"
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger job alerts
        run: |
          curl -X POST ${{ secrets.ALERTS_RUN_URL }} \
            -H "x-cron-secret: ${{ secrets.ALERTS_RUN_SECRET }}"
```

---

## Matching weights & tuning

- Logic lives in `src/lib/matching.ts`
- Weights: title tokens (2 each), skills (2 each), location (4), remote preference (4), experience heuristic (2)
- Threshold defaults to `6` and can be overridden via `JOB_ALERT_THRESHOLD`
- Tests (`npm test`) cover exact, partial, skill, remote, experience mismatch, and dedupe behaviors for quick regression feedback

---

## API quickstart (Postman / HTTPie)

### Create a subscription (auth required — use a Clerk session token or cookie)

```bash
http POST :3000/api/alerts/subscribe \
  "Authorization: Bearer <CLERK_JWT>" \
  titleQuery="Senior Frontend Engineer" \
  location="Remote" \
  skills="React, Next.js, GraphQL" \
  experienceLevel="SENIOR" \
  frequency="DAILY" \
  remotePreference="REMOTE"
```

Equivalent cURL:

```bash
curl -X POST http://localhost:3000/api/alerts/subscribe \
  -H "Authorization: Bearer <CLERK_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"titleQuery":"Senior Frontend Engineer","location":"Remote","skills":"React,Next.js","experienceLevel":"SENIOR","frequency":"DAILY","remotePreference":"REMOTE"}'
```

### Trigger the runner (cron secret)

```bash
http POST :3000/api/alerts/run X-Cron-Secret:${ALERTS_RUN_SECRET}
```

```bash
curl -X POST http://localhost:3000/api/alerts/run \
  -H "x-cron-secret: ${ALERTS_RUN_SECRET}"
```

The response echoes `processed`, `digests`, and the trigger origin (`manual`, `cron`, or `scheduled`).

---

## Emails

Resend messages are rendered at runtime. Sample immediate HTML (truncated):

```html
<p>Hi Alex,</p>
<p>We found a new role that matches your alert:</p>
<ul>
  <li><strong>Senior Frontend Engineer</strong></li>
  <li>Acme Corp</li>
  <li>Remote</li>
</ul>
<p><a href="https://adzuna.com/job/123" target="_blank">View listing</a></p>
<p style="font-size:12px;">
  Manage alerts:
  <a href="https://your-app.com/alerts">https://your-app.com/alerts</a>
</p>
```

Every email (immediate + digest) carries an `/alerts` unsubscribe/manage link plus plaintext fallback.

---

## UI

- `app/alerts/page.tsx` — server component that fetches the current user’s subscriptions
- `components/JobAlertForm.tsx` — client form with validation (React Hook Form + Zod)
- `app/alerts/_components/alerts-client.tsx` — renders list, history, manual run, toggle/delete controls

---

## Tooling & scripts

- `npm test` — Vitest suite (matching logic)
- `npm run alerts:demo` — seed + run pipeline
- `npm run alerts:run` — cron-friendly POST helper
- Inngest worker automatically registered at `/api/inngest`

---

## Next steps

- Adjust matching weights or threshold in `src/lib/matching.ts`
- Add additional job sources by mirroring the Adzuna client contract
- Extend the UI with scheduling controls or CSV exports using the `SentJobAlert` table
```
