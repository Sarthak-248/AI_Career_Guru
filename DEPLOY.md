# Manual Deployment Guide for Render

Since you are deploying manually without a Blueprint, you will need to set up three separate components on Render: a Database, a Web Service (the app), and a Cron Job (for alerts).

## Step 1: Create the Database (PostgreSQL)

1.  Log in to [Render dashboard](https://dashboard.render.com).
2.  Click **New +** and select **PostgreSQL**.
3.  Name it `ai-career-coach-db`.
4.  Choose your region and plan (Free tier is fine for testing).
5.  Click **Create Database**.
6.  **Important:** Once created, copy the **Internal Database URL** (starts with `postgres://...`). You will need this for the `DATABASE_URL` environment variable later.

## Step 2: Deploy the Web Service (Next.js App)

1.  Click **New +** and select **Web Service**.
2.  Connect your GitHub repository.
3.  **Name:** `ai-career-coach`.
4.  **Region:** Same as your database.
5.  **Branch:** `main` (or master).
6.  **Runtime:** Node
7.  **Build Command:** `npm install && npm run build`
8.  **Start Command:** `npx prisma migrate deploy && npm start`
    *   *Note: Adding `npx prisma migrate deploy` ensures your database schema is updated every time you deploy.*
9.  **Environment Variables:**
    Scroll down to "Environment Variables" and add the following keys. You will need to get these values from your local `.env` or service dashboards (Clerk, Gemini, etc.).

    | Key | Value Description |
    | --- | --- |
    | `DATABASE_URL` | Paste the **Internal Database URL** from Step 1. |
    | `NODE_ENV` | `production` |
    | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From Clerk Dashboard. |
    | `CLERK_SECRET_KEY` | From Clerk Dashboard. |
    | `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
    | `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
    | `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
    | `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/onboarding` |
    | `GEMINI_API_KEY` | Your Google Gemini AI Key. |
    | `INNGEST_SIGNING_KEY` | From Inngest Cloud (Project Settings -> Signing Key). |
    | `ADZUNA_APP_ID` | From Adzuna. |
    | `ADZUNA_APP_KEY` | From Adzuna. |
    | `RESEND_API_KEY` | From Resend. |
    | `FROM_EMAIL` | Verified sender email (e.g., `updates@yourdomain.com`). |
    | `ALERTS_RUN_SECRET` | Create a random secret password (e.g., `my-super-secret-key-123`). You'll need this for Step 3. |

10. Click **Create Web Service**.

## Step 3: Set up the Cron Job (Optional - For Job Alerts)

This step is required if you want the automated job alerts to run daily.

1.  Click **New +** and select **Cron Job**.
2.  Connect the same GitHub repository.
3.  **Name:** `job-alerts`.
4.  **Schedule:** `0 9 * * *` (Runs every day at 9 AM).
5.  **Command:** `npm run alerts:run`
6.  **Environment Variables:**
    Add these specific variables for the cron job:

    | Key | Value Description |
    | --- | --- |
    | `ALERTS_RUN_SECRET` | The **same secret** you created in Step 2. |
    | `NEXT_PUBLIC_APP_URL` | The URL of your deployed Web Service (e.g., `https://ai-career-coach.onrender.com`). |

7.  Click **Create Cron Job**.

## Final Configuration

1.  **Clerk:** Go to your Clerk Dashboard -> API Keys. Add your **Allowed Origins**:
    *   `https://ai-career-coach.onrender.com` (or whatever your Render URL is)
2.  **Inngest:** The app should automatically connect to Inngest if the `INNGEST_SIGNING_KEY` is set correctly.
