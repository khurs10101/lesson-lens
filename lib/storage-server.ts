/**
 * Server-side storage — Prisma / PostgreSQL.
 * Only import this from API routes, server components, or server actions.
 * Never import in client components.
 */

import { Lesson } from "@/types";
import { DEMO_LESSON, DEMO_LESSON_ID } from "./demo-data";
import { IS_DB_ENABLED, prisma } from "./db";

export async function getServerLessons(userId: string): Promise<Lesson[]> {
  if (!IS_DB_ENABLED) return [DEMO_LESSON];

  const rows = await prisma.lesson.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(rowToLesson);
}

export async function getServerLesson(
  id: string,
  userId?: string
): Promise<Lesson | null> {
  if (id === DEMO_LESSON_ID) return DEMO_LESSON;
  if (!IS_DB_ENABLED) return null;

  const row = await prisma.lesson.findFirst({
    where: { id, ...(userId ? { userId } : {}) },
  });
  return row ? rowToLesson(row) : null;
}

export async function saveServerLesson(
  lesson: Lesson,
  userId?: string
): Promise<void> {
  if (!IS_DB_ENABLED) return;

  // Check ownership: only update if the lesson belongs to this user (or is new)
  const existing = await prisma.lesson.findUnique({ where: { id: lesson.id } });
  if (existing && existing.userId && userId && existing.userId !== userId) {
    throw new Error("Forbidden: lesson belongs to another user");
  }

  await prisma.lesson.upsert({
    where: { id: lesson.id },
    create: {
      id: lesson.id,
      userId: userId ?? null,
      title: lesson.title,
      fileName: lesson.fileName,
      fileType: lesson.fileType,
      originalContent: lesson.originalContent,
      adaptations: lesson.adaptations as object,
      status: lesson.status,
    },
    update: {
      title: lesson.title,
      adaptations: lesson.adaptations as object,
      status: lesson.status,
      updatedAt: new Date(),
    },
  });
}

export async function deleteServerLesson(id: string, userId?: string): Promise<void> {
  if (!IS_DB_ENABLED || id === DEMO_LESSON_ID) return;
  // Only delete if the lesson belongs to this user (or no userId constraint)
  const where = userId ? { id, userId } : { id };
  await prisma.lesson.deleteMany({ where });
}

function rowToLesson(row: {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  originalContent: string;
  adaptations: unknown;
  status: string;
  createdAt: Date;
}): Lesson {
  return {
    id: row.id,
    title: row.title,
    fileName: row.fileName,
    fileType: row.fileType as Lesson["fileType"],
    originalContent: row.originalContent,
    adaptations: row.adaptations as Lesson["adaptations"],
    status: row.status as Lesson["status"],
    createdAt: row.createdAt.toISOString(),
  };
}
