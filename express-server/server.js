import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Construct paths for robust loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

// Load Environment Variables
const result = dotenv.config({ path: envPath });

if (result.error) {
  // Only log error if it's NOT a missing file error, or if we are in development
  if (result.error.code !== 'ENOENT') {
     console.error("Error loading .env file:", result.error);
  } else {
     console.log("No .env file found. Assuming environment variables are provided via the host.");
  }
}

// Explicitly ensure the key expected by Clerk Backend is present
// The frontend uses NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, but backend SDKs often look for CLERK_PUBLISHABLE_KEY
if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  process.env.CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  console.log("Polyfilled CLERK_PUBLISHABLE_KEY from NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
}

console.log("Environment State:");
console.log("- .env path:", envPath);
console.log("- CLERK_PUBLISHABLE_KEY:", process.env.CLERK_PUBLISHABLE_KEY ? "Set" : "MISSING");
console.log("- CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY ? "Set" : "MISSING");

// Dynamically import the app to ensure env vars are set BEFORE imports run
console.log("Starting server...");
await import("./index.js");
