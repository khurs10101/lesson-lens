/**
 * Client-side storage — localStorage only.
 * Safe to import from client components.
 *
 * For server-side DB operations, import from lib/storage-server.ts
 */

import { Lesson } from "@/types";
import { DEMO_LESSON, DEMO_LESSON_ID } from "./demo-data";

const STORAGE_PREFIX = "lessonlens_";
const LESSONS_KEY = `${STORAGE_PREFIX}lessons`;

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function getAllLessons(): Lesson[] {
  if (!isClient()) return [DEMO_LESSON];
  seedDemoData();
  const raw = localStorage.getItem(LESSONS_KEY);
  if (!raw) return [DEMO_LESSON];
  try {
    return JSON.parse(raw) as Lesson[];
  } catch {
    console.warn("[storage] Failed to parse lessons from localStorage — returning demo data");
    return [DEMO_LESSON];
  }
}

export function getLesson(id: string): Lesson | null {
  if (id === DEMO_LESSON_ID) return DEMO_LESSON;
  const lessons = getAllLessons();
  return lessons.find((l) => l.id === id) ?? null;
}

export function saveLesson(lesson: Lesson): void {
  if (!isClient()) return;
  try {
    const lessons = getAllLessons();
    const idx = lessons.findIndex((l) => l.id === lesson.id);
    if (idx >= 0) {
      lessons[idx] = lesson;
    } else {
      lessons.push(lesson);
    }
    localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
  } catch {
    console.warn("Failed to save lesson to localStorage");
  }
}

export function deleteLesson(id: string): void {
  if (!isClient() || id === DEMO_LESSON_ID) return;
  try {
    const lessons = getAllLessons().filter((l) => l.id !== id);
    localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
  } catch {
    console.warn("Failed to delete lesson from localStorage");
  }
}

function seedDemoData(): void {
  if (!isClient()) return;
  const raw = localStorage.getItem(LESSONS_KEY);
  if (!raw) {
    localStorage.setItem(LESSONS_KEY, JSON.stringify([DEMO_LESSON]));
    return;
  }
  try {
    const lessons = JSON.parse(raw) as Lesson[];
    if (!lessons.find((l) => l.id === DEMO_LESSON_ID)) {
      lessons.unshift(DEMO_LESSON);
      localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
    }
  } catch {
    console.warn("[storage] Corrupted lesson data in localStorage — resetting to demo");
    localStorage.setItem(LESSONS_KEY, JSON.stringify([DEMO_LESSON]));
  }
}
