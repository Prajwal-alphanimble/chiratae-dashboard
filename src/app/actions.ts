"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ViewType, SourceType } from "@/generated/prisma/client";

export async function saveView(data: any, viewType: ViewType, title: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const view = await prisma.view.create({
      data: {
        data: data,
        type: viewType,
        source: SourceType.AI,
        title: title,
        userId: userId,
      },
    });

    return { success: true, viewId: view.id };
  } catch (error) {
    console.error("Error saving view:", error);
    return { success: false, error: "Failed to save view" };
  }
}

export async function getViewsFromUserId(userId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const userViews = await prisma.view.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, userViews: userViews };
  } catch (error) {
    console.error("Error saving view:", error);
    return { success: false, error: "Failed to save view" };
  }
}

