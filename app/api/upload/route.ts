import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, IS_AUTH_ENABLED } from "@/lib/auth";
import { extractContentFromFile, IS_DEMO } from "@/lib/nova";
import { uploadToS3, buildLessonKey, IS_S3_ENABLED } from "@/lib/s3";
import { WATER_CYCLE_RAW_CONTENT } from "@/lib/demo-data";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];
const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

export async function POST(req: NextRequest) {
  // Validate early — return JSON errors for bad requests
  const session = IS_AUTH_ENABLED ? await getServerSession(authOptions) : null;
  if (IS_AUTH_ENABLED && !session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const userId = session?.user?.id ?? "anonymous";

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Accepted: PDF, PNG, JPG, WEBP" },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 25MB." },
      { status: 400 }
    );
  }

  // Stream real-time status updates via SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const lessonId = `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const isPdf = file.type === "application/pdf";
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);

        send({ phase: "received", fileName: file.name, sizeMB });

        // S3 upload
        let s3Key: string | null = null;
        const buffer = Buffer.from(await file.arrayBuffer());

        if (IS_S3_ENABLED) {
          send({ phase: "saving", message: "Saving file to cloud storage..." });
          s3Key = buildLessonKey(userId, lessonId, file.name);
          await uploadToS3(s3Key, buffer, file.type);
        }

        // Extraction
        let rawContent: string;
        if (IS_DEMO) {
          send({ phase: "extracting", message: "Extracting text (demo mode)..." });
          await new Promise((r) => setTimeout(r, 1000));
          rawContent = WATER_CYCLE_RAW_CONTENT;
        } else {
          send({
            phase: "extracting",
            message: isPdf
              ? `Extracting text from PDF (${sizeMB} MB) with Amazon Nova...`
              : "Reading text from image with Amazon Nova...",
          });

          const fileBase64 = buffer.toString("base64");
          rawContent = await extractContentFromFile(fileBase64, file.type);
        }

        const charCount = rawContent.length;
        send({
          phase: "done",
          lessonId,
          rawContent,
          fileName: file.name,
          fileType: isPdf ? "pdf" : "image",
          s3Key,
          charCount,
        });
      } catch (err) {
        console.error("[upload]", err);
        const message =
          err instanceof Error && err.name === "TimeoutError"
            ? "File processing timed out. The file may be too large or complex for AI extraction. Try a smaller PDF (under 5MB works best)."
            : err instanceof Error
            ? err.message
            : "Upload failed. Please try again.";
        send({ phase: "error", error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
