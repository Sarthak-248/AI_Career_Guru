import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, context: Context) {
  const user = await checkUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const subscription = await db.jobAlertSubscription.findUnique({
    where: { id },
  });

  if (!subscription || subscription.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.sentJobAlert.deleteMany({
    where: { subscriptionId: subscription.id },
  });

  await db.jobAlertSubscription.delete({
    where: { id: subscription.id },
  });

  return NextResponse.json({ success: true });
}




