import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { db } from "../lib/prisma.js";

const router = Router();

router.get("/insights", requireAuth(), async (req, res) => {
    try {
        const { userId } = req.auth;
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user || !user.industry) {
            return res.status(400).json({ error: "User industry not found" });
        }

        const insights = await db.industryInsight.findUnique({
             where: { industry: user.industry },
        });

        // Current implementation expects insights to already exist (created during onboarding/updating)
        // If not found, you might want to trigger generation here, but for now we'll return null or empty
        if (!insights) {
             return res.status(404).json({ error: "Insights not found for this industry" });
        }

        return res.json(insights);
    } catch (error) {
        console.error("Error fetching insights:", error);
        res.status(500).json({ error: "Failed to fetch insights" });
    }
});

export default router;
