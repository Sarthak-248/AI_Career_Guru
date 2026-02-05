import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { db } from "../lib/prisma.js";
import { getGeminiModel } from "../lib/gemini.js";

const router = Router();
// Moved GenAI initialization inside the route to ensure environment variables are loaded
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// GET Resume
router.get("/", requireAuth(), async (req, res) => {
    try {
        const { userId } = req.auth;
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const resume = await db.resume.findUnique({
            where: { userId: user.id },
        });

        res.json(resume);
    } catch (error) {
        console.error("Error fetching resume:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// SAVE Resume
router.post("/", requireAuth(), async (req, res) => {
    try {
        const { userId } = req.auth;
        const { content } = req.body;

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const resume = await db.resume.upsert({
            where: {
                userId: user.id,
            },
            update: {
                content,
            },
            create: {
                userId: user.id,
                content,
            },
        });

        res.json(resume);
    } catch (error) {
        console.error("Error saving resume:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// IMPROVE with AI
router.post("/improve", requireAuth(), async (req, res) => {
    try {
        const { userId } = req.auth;
        const { current, type } = req.body;
        
        const model = getGeminiModel();

        const user = await db.user.findUnique({
             where: { clerkUserId: userId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const prompt = `
            As an expert resume writer, improve the following ${type} description for a ${user.industry || "professional"} professional.
            Make it more impactful, quantifiable, and aligned with industry standards.
            Current content: "${current}"

            Requirements:
            1. Use action verbs
            2. Include metrics and results where possible
            3. Highlight relevant technical skills
            4. Keep it concise but detailed
            5. Focus on achievements over responsibilities
            6. Use industry-specific keywords
            
            Format the response as a single paragraph without any additional text or explanations.
        `;

        console.log(`[AI Improve] Request for User: ${userId}, Type: ${type}`);
        const result = await model.generateContent(prompt);
        const response = result.response;
        const improvedContent = response.text().trim();
        console.log(`[AI Improve] Success. Response length: ${improvedContent.length}`);

        res.json({ improvedContent });
    } catch (error) {
        console.error("[AI Improve] Error:", error);
         if (error.status === 429 || error.message.toLowerCase().includes("quota") || error.message.includes("429")) {
            return res.status(429).json({ error: "AI Service Quota Exceeded (429). Please try again later." });
        }
        res.status(500).json({ error: "Failed to generate content: " + error.message });
    }
});

export default router;
