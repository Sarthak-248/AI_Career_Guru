import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { clerkMiddleware } from "@clerk/express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import alertsRouter from "./routes/alerts.js";
import userRouter from "./routes/user.js";
import dashboardRouter from "./routes/dashboard.js";
import skillGapsRouter from "./routes/skillGaps.js";
import resumeRouter from "./routes/resume.js";
import coverLetterRouter from "./routes/coverLoader.js";
import interviewRouter from "./routes/interview.js";
import inngestRouter from "./routes/inngest.js";

// Load environment variables first
// Note: dotenv is now loaded in server.js before this file is imported
// dotenv.config({ path: "../.env" });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

// Mount Inngest before body parsing middleware as it may require raw body
app.use("/api/inngest", inngestRouter);

app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/alerts", alertsRouter);
app.use("/api/user", userRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/skill-gaps", skillGapsRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/cover-letter", coverLetterRouter);
app.use("/api/interview", interviewRouter);

// app.get("/", (req, res) => {
//   res.send("AI Career Coach API is running");
// });

// Serve static files from the client/dist directory
app.use(express.static(path.join(__dirname, "../client/dist")));

// Handle React routing, return all requests to React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
