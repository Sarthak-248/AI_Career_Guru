"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUser = void 0;
const express_1 = require("@clerk/express");
const prisma_1 = require("./prisma");
const checkUser = async (userId) => {
    if (!userId)
        return null;
    try {
        const loggedInUser = await prisma_1.db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
        });
        if (loggedInUser) {
            return loggedInUser;
        }
        const user = await express_1.clerkClient.users.getUser(userId);
        const name = `${user.firstName} ${user.lastName}`;
        const newUser = await prisma_1.db.user.create({
            data: {
                clerkUserId: user.id,
                name,
                imageUrl: user.imageUrl,
                email: user.emailAddresses[0].emailAddress,
            },
        });
        return newUser;
    }
    catch (error) {
        console.error("[checkUser] failed to find or create user", error);
        throw error;
    }
};
exports.checkUser = checkUser;
