import { clerkClient } from "@clerk/express";
import { db } from "./prisma";

export const checkUser = async (userId: string) => {
  if (!userId) return null;

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const user = await clerkClient.users.getUser(userId);

    const name = `${user.firstName} ${user.lastName}`;

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });

    return newUser;
  } catch (error) {
    console.error("[checkUser] failed to find or create user", error);
    throw error;
  }
};
