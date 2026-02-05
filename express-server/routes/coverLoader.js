// express-server/routes/coverLoader.js
import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { db } from "../lib/prisma.js";
import { getGeminiModel } from "../lib/gemini.js";

const router = Router();

// GENERATE Cover Letter
router.post("/", requireAuth(), async (req, res) => {
    try {
        const { userId } = req.auth;
        const data = req.body; // { companyName, jobTitle, jobDescription }
        
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const model = getGeminiModel();

        console.log(`[Cover Letter] Generating for user ${userId} | Status: Started`);

        const prompt = `
            You are an expert career coach and professional resume writer.
            Write a professional cover letter for a ${data.jobTitle} position at ${data.companyName}.
            
            About the candidate:
            - Industry: ${user.industry}
            - Years of Experience: ${user.experience}
            - Skills: ${user.skills?.join(", ")}
            - Professional Background: ${user.bio}
            
            Job Description:
            ${data.jobDescription}
            
            Requirements:
            1. Use a professional, enthusiastic tone
            2. Highlight relevant skills and experience
            3. Show understanding of the company's needs
            4. Keep it concise (max 400 words)
            5. Use proper business letter formatting in markdown
            6. Include specific examples of achievements
            7. Relate candidate's background to job requirements
            
            Format the response as markdown content only.
        `;

        const result = await model.generateContent(prompt);
        const content = result.response.text().trim();
        
        console.log(`[Cover Letter] Success. Length: ${content.length}`);

        const coverLetter = await db.coverLetter.create({
            data: {
                content,
                jobDescription: data.jobDescription,
                companyName: data.companyName,
                jobTitle: data.jobTitle,
                status: "completed",
                userId: user.id,
            },
        });

        res.json(coverLetter);

    } catch (error) {
        console.error("Error generating cover letter:", error);
        if (error.status === 429 || error.message.toLowerCase().includes("quota") || error.message.includes("429")) {
            return res.status(429).json({ error: "AI Service Quota Exceeded (429). Please try again later." });
        }
        res.status(500).json({ error: "Failed to generate cover letter: " + error.message });
    }
});

// GET All Cover Letters
router.get("/", requireAuth(), async (req, res) => {
    try {
        const { userId } = req.auth;
        
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const letters = await db.coverLetter.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        res.json(letters);
    } catch (error) {
        console.error("Error fetching cover letters:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET Single Cover Letter
router.get("/:id", requireAuth(), async (req, res) => {
    try {
        const { userId } = req.auth;
        const { id } = req.params;

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const letter = await db.coverLetter.findUnique({
             where: { id: id, userId: user.id },
        });

        if (!letter) {
            return res.status(404).json({ error: "Cover letter not found" });
        }
        
        res.json(letter);
    } catch (error) {
        console.error("Error fetching cover letter:", error);
         res.status(500).json({ error: "Internal Server Error" });
    }
});

// DELETE Cover Letter
router.delete("/:id", requireAuth(), async (req, res) => {
    try {
        const { userId } = req.auth;
         const { id } = req.params;

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
             return res.status(404).json({ error: "User not found" });
        }

        await db.coverLetter.delete({
            where: { id: id, userId: user.id },
        });

        res.json({ success: true });
    } catch (error) {
         console.error("Error deleting cover letter:", error);
         res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
