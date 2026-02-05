
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getGeminiModel } from "./lib/gemini.js";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

console.log("Loading .env from:", envPath);
dotenv.config({ path: envPath });

async function test() {
    console.log("--- Environment Check ---");
    const key = process.env.GEMINI_API_KEY;
    console.log("GEMINI_API_KEY found?", !!key);
    if(key) console.log("GEMINI_API_KEY length:", key.length);

    console.log("--- DB Check ---");
    const db = new PrismaClient();
    try {
        await db.$connect();
        console.log("DB Connection: Success");
        
        // Check for User
        const userCount = await db.user.count();
        console.log("User count:", userCount);

    } catch (e) {
        console.error("DB Connection Failed:", e.message);
    } finally {
        await db.$disconnect();
    }

    console.log("--- AI Model Check (via lib/gemini.js) ---");
    try {
        const model = getGeminiModel();
        const result = await model.generateContent("Test connection");
        console.log("SUCCESS:", result.response.text());
    } catch (e) {
         console.error("AI Check Failed:", e.message);
         if (e.message.includes("429")) {
             console.log("NOTE: Quota exceeded, but model endpoint is correct.");
         }
    }
}

test();
