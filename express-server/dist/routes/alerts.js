"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkUser_1 = require("../lib/checkUser");
const prisma_1 = require("../lib/prisma");
const express_2 = require("@clerk/express");
const zod_1 = require("zod");
const utils_1 = require("../lib/utils");
const router = (0, express_1.Router)();
const subscriptionSchema = zod_1.z.object({
    titleQuery: zod_1.z.string().min(3, "Title or keyword is required"),
    location: zod_1.z.string().optional().nullable(),
    skills: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional().nullable(),
    experienceLevel: zod_1.z.enum(["ENTRY", "MID", "SENIOR"]).default("MID"),
    frequency: zod_1.z.enum(["IMMEDIATE", "DAILY", "WEEKLY"]).default("DAILY"),
    remotePreference: zod_1.z
        .enum(["REMOTE", "ONSITE", "HYBRID", "FLEXIBLE"])
        .default("FLEXIBLE"),
});
router.post("/subscribe", (0, express_2.requireAuth)(), async (req, res) => {
    try {
        const { userId } = req.auth;
        const user = await (0, checkUser_1.checkUser)(userId);
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const json = req.body;
        // Validation
        const parsed = subscriptionSchema.safeParse(json);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.flatten() });
        }
        const skills = (0, utils_1.sanitizeSkills)(parsed.data.skills);
        const existingSubscription = await prisma_1.db.jobAlertSubscription.findFirst({
            where: {
                userId: user.id,
                titleQuery: parsed.data.titleQuery.trim(),
            },
        });
        if (existingSubscription) {
            return res.status(409).json({ error: "Subscription already exists for this query" });
        }
        const subscription = await prisma_1.db.jobAlertSubscription.create({
            data: {
                userId: user.id,
                titleQuery: parsed.data.titleQuery.trim(),
                location: parsed.data.location?.trim() || null,
                skills,
                experienceLevel: parsed.data.experienceLevel,
                frequency: parsed.data.frequency,
                remotePreference: parsed.data.remotePreference,
            },
        });
        res.json({ subscription });
    }
    catch (error) {
        console.error("[alerts/subscribe] Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get("/", (0, express_2.requireAuth)(), async (req, res) => {
    try {
        const { userId } = req.auth;
        const user = await (0, checkUser_1.checkUser)(userId);
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const subscriptions = await prisma_1.db.jobAlertSubscription.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            include: {
                sentAlerts: {
                    include: {
                        jobListing: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: 25,
                },
            },
        });
        res.json({ subscriptions });
    }
    catch (error) {
        console.error("Error fetching alerts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.default = router;
