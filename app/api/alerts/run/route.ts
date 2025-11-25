import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { runJobAlertPipeline } from "@src/lib/job-alerts/pipeline";
import { checkUser } from "@/lib/checkUser";

const CRON_SECRET = process.env.ALERTS_RUN_SECRET;

export async function POST(request: Request) {
  const headerStore = await headers();
  const providedSecret =
    headerStore.get("x-cron-secret") ?? headerStore.get("authorization");

  let isAuthorizedBySecret = false;
  if (CRON_SECRET && providedSecret) {
    const normalized = providedSecret.replace("Bearer", "").trim();
    if (normalized === CRON_SECRET) {
      isAuthorizedBySecret = true;
    }
  }

  if (!isAuthorizedBySecret) {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await request.json().catch(() => ({}));
  const subscriptionIds = Array.isArray(body?.subscriptionIds)
    ? body.subscriptionIds
    : undefined;

  const result = await runJobAlertPipeline({
    subscriptionIds,
    trigger: body?.trigger ?? "manual",
  });

  return NextResponse.json({ ok: true, result });
}

