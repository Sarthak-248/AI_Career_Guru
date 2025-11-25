// Normalize alternate environment variable names to the canonical ones
// This helps when secrets are named differently in developer environments.

if (!process.env.CLERK_API_KEY && process.env.CLERK_SECRET_KEY) {
  // Some setups name the server-side Clerk key `CLERK_SECRET_KEY`.
  process.env.CLERK_API_KEY = process.env.CLERK_SECRET_KEY;
}
