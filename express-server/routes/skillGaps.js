import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { db } from "../lib/prisma.js";
import { getGeminiModel } from "../lib/gemini.js";

const router = Router();
// Ensure environment variables are loaded (should be done by server.js, but safest to assume process.env is ready)

const generateLearningPath = async (missingSkills = [], context = {}) => {
    if (!missingSkills || missingSkills.length === 0) {
        return { missingSkills: [], learningPath: [] };
    }
    
    const model = getGeminiModel();

    const prompt = `
    You are an expert career coach. Given the following missing skills: ${JSON.stringify(missingSkills)}, 
    and user context: ${JSON.stringify(context)}, return a JSON structure ONLY in the following format:
    {
      "missingSkills": ["skill1", "skill2"],
      "learningPath": [
        {
          "skill": "skill1",
          "priority": "High|Medium|Low",
          "estimatedHours": number,
          "steps": ["step1", "step2"],
          "resources": [{"title":"string","url":"string","type":"course|article|video|book"}]
        }
      ]
    }

    IMPORTANT: Return ONLY valid JSON and nothing else.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
        return JSON.parse(cleaned);
    } catch (err) {
        console.error("AI Generation Error:", err);
        return {
            missingSkills,
            learningPath: missingSkills.map((s) => ({
                skill: s,
                priority: "Medium",
                estimatedHours: 20,
                steps: [
                    `Learn the fundamentals of ${s}`,
                    `Build a small project using ${s}`,
                    `Practice with interview-style questions for ${s}`,
                ],
                resources: [],
            })),
        };
    }
};


router.post("/generate", requireAuth(), async (req, res) => {
    try {
        const { userId } = req.auth;
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const industryInsight = await db.industryInsight.findUnique({
            where: { industry: user.industry },
        });

        // Current implementation requires insights to exist.
        // If strict, we could generate them here like in dashboard.js Action.
        // For now, assuming they exist.

        const userSkills = (user.skills || []).map((s) => s.toLowerCase());
        const topSkills = (industryInsight?.topSkills || []).map((s) => s.toLowerCase());
        const recommended = (industryInsight?.recommendedSkills || []).map((s) => s.toLowerCase());

        const missingFromTop = topSkills.filter((s) => !userSkills.includes(s));
        const missingFromRecommended = recommended.filter((s) => !userSkills.includes(s));

        const missingSet = Array.from(new Set([...missingFromTop, ...missingFromRecommended]));

        const learningPath = await generateLearningPath(missingSet, {
            experience: user.experience || null,
            industry: user.industry || null,
        });

        const analysis = {
            userSkills: user.skills || [],
            missingSkills: missingSet,
            learningPath,
        };

        // Return same structure as Next.js endpoint
        res.json({ ok: true, analysis });

    } catch (error) {
        console.error("Skill Gap Analysis Error:", error);
         if (error.status === 429 || error.message.toLowerCase().includes("quota") || error.message.includes("429")) {
            return res.status(429).json({ ok: false, error: "AI Service Quota Exceeded (429). Please try again later." });
        }
        res.status(500).json({ ok: false, error: error.message });
    }
});

export default router;
