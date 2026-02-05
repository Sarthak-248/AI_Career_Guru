import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";

import alertsRouter from "./routes/alerts";
import userRouter from "./routes/user";
import inngestRouter from "./routes/inngest";

dotenv.config({ path: "../.env" });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

// Mount Inngest before body parsing middleware as it may require raw body
app.use("/api/inngest", inngestRouter);

app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/alerts", alertsRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("AI Career Coach API is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
