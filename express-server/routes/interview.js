// express-server/routes/interview.js
import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { db } from "../lib/prisma.js";
import { getGeminiModel } from "../lib/gemini.js";

const router = Router();

// GENERATE Quiz
router.get("/generate", requireAuth(), async (req, res) => {
    try {
        const { userId } = req.auth;
        
        const user = await db.user.findUnique({
             where: { clerkUserId: userId },
             select: { industry: true, skills: true },
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        const model = getGeminiModel();

        const prompt = `
            Generate 10 technical interview questions for a ${user.industry} professional${
            user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
            }.
            
            Each question should be multiple choice with 4 options.
            
            Return the response in this JSON format only, no additional text:
            {
            "questions": [
                {
                "question": "string",
                "options": ["string", "string", "string", "string"],
                "correctAnswer": "string",
                "explanation": "string"
                }
            ]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
        const quiz = JSON.parse(cleanedText);

        res.json(quiz.questions);

    } catch (error) {
        console.error("Error generating quiz:", error);
         if (error.status === 429 || error.message.toLowerCase().includes("quota") || error.message.includes("429")) {
            return res.status(429).json({ error: "AI Service Quota Exceeded (429). Please try again later." });
        }
        res.status(500).json({ error: "Failed to generate quiz: " + error.message });
    }
});

// SAVE Quiz Result
router.post("/save", requireAuth(), async (req, res) => {
    try {
        const { userId } = req.auth;
        const { questions, answers, score } = req.body;
    
        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        const questionResults = questions.map((q, index) => ({
            question: q.question,
            answer: q.correctAnswer,
            userAnswer: answers[index],
            isCorrect: q.correctAnswer === answers[index],
            explanation: q.explanation,
        }));

        let improvementTip = null;
        
        if (score < 75) {
             const model = getGeminiModel();

             const wrongAnswers = questionResults
                .filter((q) => !q.isCorrect)
                .map((q) => `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`)
                .join("\n\n");

             const improvementPrompt = `
                The user scored ${score}% on a technical interview quiz. Here are the questions they got wrong:

                ${wrongAnswers}

                Based on these mistakes, provide a concise, specific improvement tip for the user.
                Focus on the knowledge gaps revealed by these wrong answers.
                Keep it under 2 sentences and encouraging.
             `;
             
             try {
                const tipResult = await model.generateContent(improvementPrompt);
                improvementTip = tipResult.response.text().trim();
             } catch (err) {
                 console.error("Error generating tip:", err);
             }
        }

        const assessment = await db.assessment.create({
            data: {
                userId: user.id,
                quizScore: score,
                questions: questionResults,
                category: "Technical",
                improvementTip,
            },
        });

        res.json(assessment);

    } catch (error) {
        console.error("Error saving assessment:", error);
        res.status(500).json({ error: "Failed to save assessment" });
    }
});

// GET History
router.get("/history", requireAuth(), async (req, res) => {
    try {
        const { userId } = req.auth;
        const user = await db.user.findUnique({ where: { clerkUserId: userId } });
        
        if (!user) return res.status(404).json({ error: "User not found" });

        const assessments = await db.assessment.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" }, // Changed to desc for recent first
        });

        res.json(assessments);
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
