"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export const generateAIInsights = async (industry) => {
  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  return JSON.parse(cleanedText);
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // If no insights exist, generate them
  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}

export const generateLearningPath = async (missingSkills = [], context = {}) => {
  if (!missingSkills || missingSkills.length === 0) {
    return { missingSkills: [], learningPath: [] };
  }

  const prompt = `
    You are an expert career coach. Given the following missing skills: ${JSON.stringify(
      missingSkills
    )}, and user context: ${JSON.stringify(context)}, return a JSON structure ONLY in the following format:
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

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Fallback: return a simple learning path structure
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

export async function getSkillGapAnalysis() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const industryInsight = await db.industryInsight.findUnique({
    where: { industry: user.industry },
  });

  const userSkills = (user.skills || []).map((s) => s.toLowerCase());
  const topSkills = (industryInsight?.topSkills || []).map((s) => s.toLowerCase());
  const recommended = (industryInsight?.recommendedSkills || []).map((s) => s.toLowerCase());

  // Find missing skills (from topSkills and recommendedSkills)
  const missingFromTop = topSkills.filter((s) => !userSkills.includes(s));
  const missingFromRecommended = recommended.filter((s) => !userSkills.includes(s));

  // Unique missing skills, preserve original casing from insight if possible
  const missingSet = Array.from(new Set([...missingFromTop, ...missingFromRecommended]));

  // Generate a learning path via AI
  const learningPath = await generateLearningPath(missingSet, {
    experience: user.experience || null,
    industry: user.industry || null,
  });

  return {
    userSkills: user.skills || [],
    missingSkills: missingSet,
    learningPath,
  };
}
