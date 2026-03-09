import { WATER_CYCLE_RAW_CONTENT } from "./demo-data";

export async function parseFile(_file: File): Promise<string> {
  // In demo mode, always return the water cycle content
  // In production, this would use pdf-parse or Nova multimodal
  return WATER_CYCLE_RAW_CONTENT;
}

export function getFileType(
  mimeType: string
): "pdf" | "image" | "text" {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  return "text";
}

export const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
