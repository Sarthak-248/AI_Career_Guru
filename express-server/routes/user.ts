import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { db } from "../lib/prisma";
import { generateAIInsights } from "../lib/gemini";

const router = Router();

// Update User Profile
router.put("/", requireAuth(), async (req: any, res) => {
    try {
        const { userId } = req.auth;
        // In express, req.body has the payload
        const data = req.body; 

        const user = await db.user.findUnique({
             where: { clerkUserId: userId },
        });

        if (!user) {
             return res.status(404).json({ error: "User not found in database" });
        }

        const result = await db.$transaction(
            async (tx) => {
                let industryInsight = await tx.industryInsight.findUnique({
                    where: { industry: data.industry },
                });

                if (!industryInsight) {
                    const insights = await generateAIInsights(data.industry);
                    
                    if (!insights) {
                         throw new Error("Failed to generate insights");
                    }

                    industryInsight = await tx.industryInsight.create({
                        data: {
                            industry: data.industry,
                            salaryRanges: insights.salaryRanges,
                            growthRate: insights.growthRate,
                            demandLevel: insights.demandLevel,
                            topSkills: insights.topSkills,
                            marketOutlook: insights.marketOutlook,
                            keyTrends: insights.keyTrends,
                            recommendedSkills: insights.recommendedSkills,
                            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        },
                    });
                }

                const updatedUser = await tx.user.update({
                    where: { id: user.id },
                    data: {
                        industry: data.industry,
                        experience: data.experience,
                        bio: data.bio,
                        skills: data.skills,
                    },
                });

                return { updatedUser, industryInsight };
            },
            {
                timeout: 15000, 
            }
        );
        
        res.json(result);

    } catch (error: any) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Failed to update profile", details: error.message });
    }
});

router.get("/onboarding-status", requireAuth(), async (req: any, res) => {
    try {
        const { userId } = req.auth;
        
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
            select: { industry: true }
        });

        res.json({
            isOnboarded: !!user?.industry
        });
    } catch (error) {
        console.error("Error checking onboarding status:", error);
        res.status(500).json({ error: "Failed to check onboarding status" });
    }
});

export default router;
