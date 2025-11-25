import { redirect } from "next/navigation";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

import { AlertsClient } from "./_components/alerts-client";

const serialize = <T,>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T;

export default async function AlertsPage() {
  const user = await checkUser();
  if (!user) {
    redirect("/sign-in");
  }

  let subscriptions = [];
  try {
    subscriptions = await db.jobAlertSubscription.findMany({
      where: { userId: user.id },
      include: {
        sentAlerts: {
          include: { jobListing: true },
          orderBy: { createdAt: "desc" },
          take: 25,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[alerts/page] failed to load subscriptions", error);
    throw error;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Job Alerts</h1>
        <p className="text-muted-foreground">
          Subscribe to AI-powered job alerts and deliver them via immediate or digest emails.
        </p>
      </div>

      <AlertsClient initialSubscriptions={serialize(subscriptions)} />
    </div>
  );
}

