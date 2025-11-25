import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

export async function GET() {
  const user = await checkUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriptions = await db.jobAlertSubscription.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      sentAlerts: {
        include: {
          jobListing: true,
        },
        orderBy: { createdAt: "desc" },
        take: 25,
      },
    },
  });

  return NextResponse.json({
    subscriptions,
  });
}

