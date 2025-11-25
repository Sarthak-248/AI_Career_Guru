import "dotenv/config";
import { randomUUID } from "crypto";

import { db } from "../src/lib/prisma";
import { runJobAlertPipeline } from "../src/lib/job-alerts/pipeline";

const DEMO_EMAIL = process.env.DEMO_ALERT_EMAIL ?? "demo-alert@example.com";

const main = async () => {
  const user = await db.user.upsert({
    where: { email: DEMO_EMAIL },
    create: {
      email: DEMO_EMAIL,
      clerkUserId: `demo-${randomUUID()}`,
      name: "Demo Alert User",
    },
    update: {},
  });

  const subscription = await db.jobAlertSubscription.upsert({
    where: {
      userId_titleQuery: {
        userId: user.id,
        titleQuery: "Software Engineer",
      },
    },
    create: {
      userId: user.id,
      titleQuery: "Software Engineer",
      location: "Bengaluru",
      skills: ["react", "node"],
      frequency: "IMMEDIATE",
      experienceLevel: "MID",
    },
    update: {},
  });

  console.log("[demo] running pipeline for subscription", subscription.id);

  await runJobAlertPipeline({
    subscriptionIds: [subscription.id],
    trigger: "demo",
  });

  console.log("[demo] completed");
};

main()
  .catch((error) => {
    console.error("[demo] failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

