/**
 * Activity logging utilities for tracking user actions
 */

import { prisma } from "@/lib/prisma";

export type UserAction =
  | "SAVE_TENDER"
  | "UNSAVE_TENDER"
  | "ADD_TO_CALENDAR"
  | "SHARE_TENDER"
  | "VIEW_TENDER"
  | "SEARCH_TENDERS"
  | "CREATE_ALERT"
  | "DELETE_ALERT";

interface LogActivityParams {
  userId: string;
  action: UserAction;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

/**
 * Log a user activity to the audit log
 */
export async function logActivity({
  userId,
  action,
  entity,
  entityId,
  metadata,
}: LogActivityParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity: entity || null,
        entityId: entityId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    // Log to console but don't throw - activity logging shouldn't break the app
    console.error("Failed to log activity:", error);
  }
}

/**
 * Get recent activities for a user
 */
export async function getUserActivities(
  userId: string,
  limit: number = 20
) {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      action: true,
      entity: true,
      entityId: true,
      metadata: true,
      createdAt: true,
    },
  });
}

/**
 * Get activity counts by action type for a user
 */
export async function getUserActivityStats(userId: string) {
  const activities = await prisma.auditLog.groupBy({
    by: ["action"],
    where: { userId },
    _count: {
      action: true,
    },
  });

  return activities.reduce((acc, item) => {
    acc[item.action] = item._count.action;
    return acc;
  }, {} as Record<string, number>);
}
