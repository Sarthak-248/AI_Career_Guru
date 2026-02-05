"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inngest = void 0;
const inngest_1 = require("inngest");
exports.inngest = new inngest_1.Inngest({
    id: "career-coach",
    name: "Career Coach",
    credentials: {
        gemini: {
            apiKey: process.env.GEMINI_API_KEY,
        },
    },
});
