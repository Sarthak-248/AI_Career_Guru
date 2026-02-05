"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_2 = require("@clerk/express");
const alerts_1 = __importDefault(require("./routes/alerts"));
const user_1 = __importDefault(require("./routes/user"));
const inngest_1 = __importDefault(require("./routes/inngest"));
dotenv_1.default.config({ path: "../.env" });
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
// Mount Inngest before body parsing middleware as it may require raw body
app.use("/api/inngest", inngest_1.default);
app.use(express_1.default.json());
app.use((0, express_2.clerkMiddleware)());
app.use("/api/alerts", alerts_1.default);
app.use("/api/user", user_1.default);
app.get("/", (req, res) => {
    res.send("AI Career Coach API is running");
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
