import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { sanitizeSkills } from "@src/lib/job-alerts/utils";

const subscriptionSchema = z.object({
  titleQuery: z.string().min(3, "Title or keyword is required"),
  location: z.string().optional().nullable(),
  skills: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  experienceLevel: z.enum(["ENTRY", "MID", "SENIOR"]).default("MID"),
  frequency: z.enum(["IMMEDIATE", "DAILY", "WEEKLY"]).default("DAILY"),
  remotePreference: z
    .enum(["REMOTE", "ONSITE", "HYBRID", "FLEXIBLE"])
    .default("FLEXIBLE"),
});

export async function POST(request: Request) {
  const user = await checkUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.text();
  if (!rawBody) {
    return NextResponse.json(
      { error: "Invalid payload. Expected JSON body." },
      { status: 400 }
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch (error) {
    console.error("[alerts/subscribe] Failed to parse JSON body", error);
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return NextResponse.json(
      { error: "Invalid payload. Expected JSON body." },
      { status: 400 }
    );
  }

  const parsed = subscriptionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const skills = sanitizeSkills(parsed.data.skills);

  const subscription = await db.jobAlertSubscription.create({
    data: {
      userId: user.id,
      titleQuery: parsed.data.titleQuery.trim(),
      location: parsed.data.location?.trim() || null,
      skills,
      experienceLevel: parsed.data.experienceLevel,
      frequency: parsed.data.frequency,
      remotePreference: parsed.data.remotePreference,
    },
  });

  return NextResponse.json({ subscription });
}

