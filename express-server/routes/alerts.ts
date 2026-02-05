import { Router } from "express";
import { checkUser } from "../lib/checkUser";
import { db } from "../lib/prisma";
import { requireAuth } from "@clerk/express";
import { z } from "zod";
import { sanitizeSkills } from "../lib/utils";

const router = Router();

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

router.post("/subscribe", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = req.auth;
    const user = await checkUser(userId);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const json = req.body;
    
    // Validation
    const parsed = subscriptionSchema.safeParse(json);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const skills = sanitizeSkills(parsed.data.skills);

    const existingSubscription = await db.jobAlertSubscription.findFirst({
      where: {
        userId: user.id,
        titleQuery: parsed.data.titleQuery.trim(),
      },
    });

    if (existingSubscription) {
      return res.status(409).json({ error: "Subscription already exists for this query" });
    }

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

    res.json({ subscription });
  } catch (error) {
    console.error("[alerts/subscribe] Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = req.auth;
    const user = await checkUser(userId);
    
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
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

    res.json({ subscriptions });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
